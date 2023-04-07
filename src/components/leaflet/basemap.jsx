import React, { Component } from "react";
import L from "leaflet";
import { flyToBounds, addLayer, updateLayer } from "./functions";
import "./leaflet_geotiff";
import "./leaflet_floatgeotiff";
import "./leaflet_colorpicker";
import "./leaflet_streamlines";
import "./leaflet_vectorfield";
import "./css/leaflet.css";

class Basemap extends Component {
  find = (list, parameter, value) => {
    return list.find((l) => l[parameter] === value);
  };
  async componentDidUpdate() {
    const { updates, updated, metadata, layers, period, datetime } = this.props;
    if (updates.length > 0) {
      for (var update of updates) {
        if (update.event === "bounds") {
          flyToBounds(metadata.bounds, this.map);
        } else if (update.event === "addLayer") {
          addLayer(
            this.find(layers, "id", update.id),
            period,
            this.dataStore,
            this.layerStore,
            this.map,
            datetime
          );
        } else if (update.event === "updateLayer") {
          updateLayer(
            this.find(layers, "id", update.id),
            this.dataStore,
            this.layerStore,
            this.map,
            datetime
          );
        }
      }
      updated();
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
      maxZoom: 17,
      maxBoundsViscosity: 0.5,
      zoomSnap: 0.25,
      zoomControl: false,
    });

    var basemap = L.tileLayer(
      "https://api.mapbox.com/styles/v1/jamesrunnalls/clg4u62lq009a01oa5z336xn7/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ",
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
