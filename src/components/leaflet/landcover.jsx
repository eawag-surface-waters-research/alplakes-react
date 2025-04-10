import React, { Component } from "react";
import L from "leaflet";
import Translations from "../../translations.json";
import CONFIG from "../../config.json";
import "./leaflet_tileclass";
import "./leaflet_wmts";
import "./css/leaflet.css";

class LandCoverMap extends Component {
  async componentDidMount() {
    var { dark, mapId, bounds } = this.props;
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
    var map = this.map;
    if (bounds) {
      this.map.fitBounds(bounds, { padding: [20, 20], animate: false });
      this.map.on("dblclick", function () {
        map.fitBounds(bounds, { padding: [20, 20] });
      });
    }
    this.map.doubleClickZoom.disable();
    const basemap = "default";
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
    const worldCoverLayer = L.tileLayer.wmts(
      "https://services.terrascope.be/wmts/v2",
      {
        layer: "WORLDCOVER_2021_MAP",
        tilematrixset: "EPSG:3857",
        style: "",
        format: "image/png",
        TIME: "2025-04-10",
        attribution: "© ESA WorldCover 2021, produced by VITO",
        tileSize: 256,
        version: "1.0.0",
      }
    );

    worldCoverLayer.addTo(map);
    this.map.attributionControl.setPosition("bottomleft");
    this.layers = {};
  }

  componentWillUnmount() {
    this.map.off();
    this.map.remove();
  }

  render() {
    const { mapId } = this.props;
    return (
      <React.Fragment>
        <div className="legend"></div>
        <div id={mapId}></div>
      </React.Fragment>
    );
  }
}

export default LandCoverMap;
