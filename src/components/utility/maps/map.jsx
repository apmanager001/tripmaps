"use client";
import React from "react";
import { Map } from "@vis.gl/react-maplibre";

const Maps = () => {
  return (
    <div className="w-full">
      <Map
        initialViewState={{
          longitude: -84.47279,
          latitude: 45.64325,
          zoom: 10,
        }}
        style={{ height: 400 }}
        mapStyle="https://tiles.openfreemap.org/styles/bright"
        attributionControl={true}
      ></Map>
    </div>
  );
};

export default Maps;
