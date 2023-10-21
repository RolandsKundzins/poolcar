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
  const [closestCoordinates, setClosestCoordinates] = useState<{ lat: number, lng: number } | null>(null);


  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const hitchhikerOriginRef = useRef<HTMLInputElement>(null);

  
  const center = useMemo(() => ({ lat: 56.946285, lng: 24.105078 }), []);

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();


  async function calcRoute() {
    const origin = originRef.current?.value || "";
    const destination = destinationRef.current?.value || "";
    const hitchhikeraddress = hitchhikerOriginRef.current?.value || "";
    const hitchhikerLatLng = await getLatLngFromAddress(hitchhikeraddress);
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

          let minDistance = Number.MAX_VALUE, closestLatitude, closestLongtitude;
          
          for(const path_element of waypoints){
            let latitude = path_element[0];
            let longtitude = path_element[1];

            const distance = calculateManhattanDistance(latitude, longtitude, hitchhikerLatLng.lat, hitchhikerLatLng.lng)
            // console.log(`distance: ${distance} km`)

            if(distance < minDistance) {
              minDistance = distance;
              closestLatitude = latitude;
              closestLongtitude = longtitude;
            }

            // console.log(`lat: ${latitude}, lon: ${longtitude}`)
          }
          if (closestLatitude !== undefined && closestLongtitude !== undefined) {
            setClosestCoordinates({ lat: closestLatitude, lng: closestLongtitude });
            console.log("hi")
          }
          console.log(`startLat: ${waypoints[0][0]}, startLng: ${waypoints[0][1]}, endLat: ${waypoints[waypoints.length-1][0]}, startLat: ${waypoints[waypoints.length-1][0]}`)
          console.log(`closest distance: ${minDistance}, closestLatitude: ${closestLatitude}, closestLongtitude: ${closestLongtitude}`)
        }

        
        // console.log(response?.routes[0].overview_polyline);
        // console.log(response?.routes[0].overview_path[0].lng());
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
          <input type="text" placeholder="Origin" ref={originRef} value="ulbroka"/>
          <input type="text" placeholder="Destination" ref={destinationRef} value="jelgavas iela 1"/>
          <input type="text" placeholder="Hitchhiker Origin" ref={hitchhikerOriginRef} value="saulīši"/>
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
        {closestCoordinates && <MarkerF position={closestCoordinates} />}
        {/* <MarkerF position={closestCoordinates} /> */}
      </GoogleMap>
    </div>
  );
}