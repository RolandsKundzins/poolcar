import { useMemo, useRef, useState } from "react";
import { 
  GoogleMap, 
  useLoadScript, 
  MarkerF, 
  Autocomplete 
} from "@react-google-maps/api";
import "./css/navigate.css"
import { Form } from "@remix-run/react";
import polyline from "google-polyline"

const MAPS_API_KEY = "AIzaSyAm6YQArZ7RCT3WgjV_GP7g73Pm8kHMBxg";

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


export default function Home() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: MAPS_API_KEY,
    libraries: ['places'],
  });

  if (!isLoaded) return <div>Loading...</div>;
  return(
    <div>
      <Map />
    </div>
  )

}

function Map() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const hitchhikerOriginRef = useRef<HTMLInputElement>(null);

  
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
    directionsService.route(request, function(response, status) {
      if (status === "OK") {
        let waypoints;
        if(response?.routes[0].overview_polyline){
          waypoints = polyline.decode(response?.routes[0].overview_polyline)

          let closestDistance = Number.MAX_VALUE, closestLatitude, closestLongtitude;
          
          for(const path_element of waypoints){
            let latitude = path_element[0];
            let longtitude = path_element[1];
            // console.log(`${latitude}, ${longtitude}`)

            const distance = calculateManhattanDistance(latitude, longtitude, hitchhikerLatLng.lat, hitchhikerLatLng.lng)

            if(distance < closestDistance) {
              closestDistance = distance;
              closestLatitude = latitude;
              closestLongtitude = longtitude;
            }
          }
          if (closestLatitude !== undefined && closestLongtitude !== undefined) {
            // setClosestCoordinates({ lat: closestLatitude, lng: closestLongtitude });
            // console.log("hi")
            // const startLat = waypoints[0][0], startLng = waypoints[0][1];
            // const endLat = waypoints[waypoints.length-1][0], endLng = waypoints[waypoints.length-1][1];
            // console.log(`startLat: ${startLat}, startLng: ${startLng}, endLat: ${endLat}, endLng: ${endLng}`) //
            console.log(`closest distance: ${closestDistance}km, closestLatitude: ${closestLatitude}, closestLongtitude: ${closestLongtitude}`)

            var request2 = {
              origin: hitchhikeraddress,
              destination: `${closestLatitude} ${closestLongtitude}`,
              travelMode: google.maps.TravelMode.DRIVING
            };

            directionsService.route(request2, function(response2, status2) {
              secondDirectionsRenderer.setDirections(response2);
              secondDirectionsRenderer.setMap(map);
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
          {distance && (<p><b>Distance</b> {distance}</p>)}
          {duration && (<p><b>Duration</b> {duration}</p>)}
        </div>
      </div>

      <GoogleMap 
        zoom={10} 
        center={center} 
        mapContainerClassName="map-container"
        options={{
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
        onLoad={(map) => setMap(map)}
      >
        {/* <MarkerF position={closestCoordinates} /> */}
      </GoogleMap>
    </div>
  );
}