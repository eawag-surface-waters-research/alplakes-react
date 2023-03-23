import React, { Component } from "react";
import axios from "axios";
import L from "leaflet";
import { flyToBounds, addLayer } from "./functions";
import "./leaflet_geotiff";
import "./leaflet_floatgeotiff";
import "./leaflet_colorpicker";
import "./leaflet_streamlines";
import "./leaflet_vectorfield";
import "./css/leaflet.css";

class Basemap extends Component {
  async componentDidUpdate() {
    const { updates, metadata, layers, period } = this.props;
    if (updates.length > 0) {
      for (var update of updates) {
        if (update.event === "bounds") {
          flyToBounds(metadata.bounds, this.map);
        } else if (update.event === "addLayer") {
          addLayer(
            layers.find((l) => l.id === update.id),
            period,
            this.dataStore,
            this.layerStore,
            this.map,
          );
        }
      }
    }
  }
  async componentDidMount() {
    this.dataStore = {};
    this.layerStore = {};
    var center = [46.9, 8.2];
    var zoom = 8;
    this.map = L.map("map", {
      preferCanvas: true,
      center: center,
      zoom: zoom,
      minZoom: 5,
      maxZoom: 15,
      maxBoundsViscosity: 0.5,
    });

    var basemap = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution: "&copy; <a href='https://www.mapbox.com/'>mapbox</a>",
      }
    );
    basemap.addTo(this.map);
    this.layerStore["basemap"] = basemap;
  }

  render() {
    return (
      <React.Fragment>
        <div id="map"></div>
      </React.Fragment>
    );
  }
}

export default Basemap;
