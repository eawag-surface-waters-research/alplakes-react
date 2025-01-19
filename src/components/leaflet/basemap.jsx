import React, { Component } from "react";
import L from "leaflet";
import CONFIG from "../../config.json";
import { update } from "./update";
import "./leaflet_tileclass";
import "./css/leaflet.css";

class Basemap extends Component {
  async componentDidUpdate(prevProps) {
    const { dark, updates, updated } = this.props;
    var { basemap } = this.props;
    if (updates.length > 0) {
      updated();
      update(this.map, this.layers, updates);
    }
    if (prevProps.basemap !== basemap || prevProps.dark !== dark) {
      if (!(basemap in CONFIG.basemaps)) basemap = "default";
      var { url, attribution, lightMap, darkMap, tileClass } =
        CONFIG.basemaps[basemap];
      if (url.includes("_bright_"))
        url = url.replace("_bright_", dark ? darkMap : lightMap);
      var newBasemap = L.tileLayer
        .default(url, {
          maxZoom: 19,
          attribution: attribution,
          tileClass: tileClass,
        })
        .addTo(this.map);
      this.map.removeLayer(this.basemap);
      this.basemap = newBasemap;
    }
  }
  async componentDidMount() {
    var { dark, mapId, bounds, basemap } = this.props;
    this.map = L.map(mapId, {
      preferCanvas: true,
      center: [46.9, 8.2],
      zoom: 8,
      minZoom: 5,
      maxZoom: 17,
      maxBoundsViscosity: 0.5,
      zoomSnap: 0.25,
      zoomControl: false,
      showCursorLocation: true,
      zoomAnimation: true,
    });
    if (bounds) {
      this.map.fitBounds(bounds, { padding: [20, 20], animate: false });
    }
    this.map.doubleClickZoom.disable();
    if (!(basemap in CONFIG.basemaps)) basemap = "default";
    var { url, attribution, lightMap, darkMap, tileClass } =
      CONFIG.basemaps[basemap];
    if (url.includes("_bright_"))
      url = url.replace("_bright_", dark ? darkMap : lightMap);
    this.basemap = L.tileLayer
      .default(url, {
        maxZoom: 19,
        attribution: attribution,
        tileClass: tileClass,
      })
      .addTo(this.map);
    this.layers = {};
  }

  render() {
    const { mapId } = this.props;
    return (
      <React.Fragment>
        <div id={mapId} className="leaflet-map"></div>
      </React.Fragment>
    );
  }
}

export default Basemap;
