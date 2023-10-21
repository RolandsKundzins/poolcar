import { useMemo } from "react";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import "./css/navigate.css"

export default function Home() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyAm6YQArZ7RCT3WgjV_GP7g73Pm8kHMBxg", //remove this later (.env)
  });

  if (!isLoaded) return <div>Loading...</div>;
  return(
    <div>
      <Map />
    </div>
  )

}

function Map() {
  const center = useMemo(() => ({ lat: 56.92, lng: 24.12 }), []);

  return (
    <GoogleMap zoom={11} center={center} mapContainerClassName="map-container"
    options={{
      zoomControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      fullscreenControl: false,

    }}>
      <MarkerF position={center} />
    </GoogleMap>
  );
}