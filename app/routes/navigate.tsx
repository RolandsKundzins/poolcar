import { useMemo } from "react";
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api";
import "./css/navigate.css"

export default function Home() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyAm6YQArZ7RCT3WgjV_GP7g73Pm8kHMBxg",
  });

  if (!isLoaded) return <div>Loading...</div>;
  return(
    <div>
      <h1>Hi</h1>
      <Map />
    </div>
  )

}

function Map() {
  const center = useMemo(() => ({ lat: 44, lng: -80 }), []);

  return (
    <GoogleMap zoom={10} center={center} mapContainerClassName="map-container">
      <Marker position={center} />
    </GoogleMap>
  );
}