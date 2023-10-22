import { useMemo, useRef, useState } from "react";
import type {ActionFunction} from "@remix-run/node"
import { 
  GoogleMap, 
  useLoadScript, 
  MarkerF, 
  Autocomplete 
} from "@react-google-maps/api";
import "./css/navigate.css"
import { Form, useLoaderData } from "@remix-run/react";
import polyline from "google-polyline"
import { authenticator } from "utils/auth.server";

/*go to https://console.cloud.google.com/google/maps-apis and get api key
You need to enable javascript maps api and directions api*/
const MAPS_API_KEY = "AIzaSyAm6YQArZ7RCT3WgjV_GP7g73Pm8kHMBxg";


export async function loader({request}: any) {
  console.log(`navigate.tsx loader`)
  const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
  })
  console.log(`navigate loader user: ${user}`);

  if (!user) {
    throw new Error("User not authenticated");
  }

  return user
}

export async function action({request}: any) {
  const user = await authenticator.isAuthenticated(request, {
      failureRedirect: "/login",
  })

  const form = await request.formData()
  const action = form.get("action")

  switch (action) {
    case "logout": {
      return await authenticator.logout(request, {redirectTo: "/login"})
    }

    default:
      return null
  }
}


/*Calculate distance between two points using manhatan distance algorithm*/
function calculateManhattanDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const latDistance = Math.abs(lat2 - lat1);
  const lonDistance = Math.abs(lon2 - lon1);

  // One degree of latitude is approximately 111 kilometers
  // One degree of longitude is approximately 111 kilometers at the equator
  const latDistanceKm = latDistance * 111;
  const lonDistanceKm = lonDistance * 111;

  // Manhattan distance is the sum of latitude and longitude differences
  const manhattanDistance = latDistanceKm + lonDistanceKm;
  return manhattanDistance;
}

async function getLatLngFromAddress(address: string): Promise<{ lat: number; lng: number }> {
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${MAPS_API_KEY}`);
  const data = await response.json();

  if (data.results && data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  } else {
    throw new Error('Invalid address');
  }
}

/*The main component*/
export default function Home() {
  const user = useLoaderData<typeof loader>();
  console.log(`Home user: ${JSON.stringify(user, null, 2)}`);
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: MAPS_API_KEY,
    libraries: ['places'],
  });

  if (!isLoaded) return <div>Loading...</div>;
  return(
    <div>
      {user ? (
        <div className="navigation-btns">
          <Form method="post">
            <button
              type="submit"
              name="action"
              value="logout"
              className="bg-white text-black border-2 border-black py-1 px-3 rounded-md font-semibold"
            >
              Logout
            </button>
          </Form>
        </div>
      ) : null}
      <Map />
    </div>
  )
}

/*Map component*/
function Map() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const [distanceHitchHiker, setDistanceHitchHiker] = useState('');
  const [durationHitchHiker, setDurationHitchHiker] = useState('');

  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const hitchhikerOriginRef = useRef<HTMLInputElement>(null);

  /*center the map to Riga*/
  const center = useMemo(() => ({ lat: 56.946285, lng: 24.105078 }), []);

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();
  const secondDirectionsRenderer = new google.maps.DirectionsRenderer();


  async function calcRoute() {
    const origin = originRef.current?.value || "";
    const destination = destinationRef.current?.value || "";
    const hitchhikeraddress = hitchhikerOriginRef.current?.value || "";
    const hitchhikerLatLng = await getLatLngFromAddress(hitchhikeraddress);
    console.log(`${hitchhikerLatLng.lat}, ${hitchhikerLatLng.lng}`)

    var request = {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING
    };

    /*Create the route*/
    directionsService.route(request, function(response, status) {
      if (status === "OK") {
        let waypoints;
        if(response?.routes[0].overview_polyline){
          waypoints = polyline.decode(response?.routes[0].overview_polyline)

          let closestDistance = Number.MAX_VALUE, closestLatitude, closestLongtitude;
          //get closest point from hitchiker to the route of the driver
          for(const path_element of waypoints){
            let latitude = path_element[0];
            let longtitude = path_element[1];

            const distance = calculateManhattanDistance(latitude, longtitude, hitchhikerLatLng.lat, hitchhikerLatLng.lng)

            if(distance < closestDistance) {
              closestDistance = distance;
              closestLatitude = latitude;
              closestLongtitude = longtitude;
            }
          }
          if (closestLatitude !== undefined && closestLongtitude !== undefined) {
            var request2 = {
              origin: hitchhikeraddress,
              destination: `${closestLatitude} ${closestLongtitude}`,
              travelMode: google.maps.TravelMode.WALKING
            };

            /*Create the route for hitchiker to closest point*/
            directionsService.route(request2, function(response2, status2) {
              secondDirectionsRenderer.setDirections(response2);
              secondDirectionsRenderer.setMap(map);

              setDistanceHitchHiker(response2?.routes[0]?.legs[0]?.distance?.text || '');
              setDurationHitchHiker(response2?.routes[0]?.legs[0]?.duration?.text || '');
            });

          }
        }

        
        directionsRenderer.setDirections(response);
        directionsRenderer.setMap(map);
        setDistance(response?.routes[0]?.legs[0]?.distance?.text || '');
        setDuration(response?.routes[0]?.legs[0]?.duration?.text || '');
      } else {
        console.error("Directions request failed due to " + status);
      }
    });
  }

  return (
    <div>
      <div className="input-box">
        <Form>
          <input type="text" placeholder="Origin" ref={originRef} />
          <input type="text" placeholder="Destination" ref={destinationRef} />
          <input type="text" placeholder="Hitchhiker Origin" ref={hitchhikerOriginRef} />
          <button onClick={calcRoute}>Calculate Route</button>
        </Form>
        <div>
          {distance && (<p><b>For driver:</b> {distance}, {duration}</p>)}
          {distance && (<p><b>For hitchiker:</b> {distanceHitchHiker}, {durationHitchHiker}</p>)}
        </div>
      </div>

      <GoogleMap 
        zoom={10} 
        center={center} 
        mapContainerClassName="map-container"
        options={{
          //don't show any of the controls
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
        onLoad={(map) => setMap(map)}
      >
      </GoogleMap>
    </div>
  );
}