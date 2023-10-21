import { useMemo, useRef, useState } from "react";
import { 
  GoogleMap, 
  useLoadScript, 
  MarkerF, 
  Autocomplete 
} from "@react-google-maps/api";
import "./css/navigate.css"
import { Form } from "@remix-run/react";


export default function Home() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyAm6YQArZ7RCT3WgjV_GP7g73Pm8kHMBxg",
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

  
  const center = useMemo(() => ({ lat: 56.946285, lng: 24.105078 }), []);

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer();


  function calcRoute() {
    const origin = originRef.current?.value || "";
    const destination = destinationRef.current?.value || "";
    var request = {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
      if (status === "OK") {
        console.log(response);
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
        {/* <MarkerF position={center} /> */}
      </GoogleMap>
    </div>
  );
}