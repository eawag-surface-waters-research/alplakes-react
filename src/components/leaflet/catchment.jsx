import React, { Component } from "react";
import L from "leaflet";
import CONFIG from "../../config.json";
import "./leaflet_tileclass";
import "./leaflet_wmts";
import "./css/leaflet.css";

class CatchmentMap extends Component {
  async componentDidMount() {
    var { dark, mapId, polygon, points, wmts } = this.props;
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
      zoomAnimation: false,
    });
    var map = this.map;

    const bounds = L.latLngBounds(polygon);
    this.map.fitBounds(bounds, { padding: [20, 20], animate: false });
    this.map.on("dblclick", function () {
      map.fitBounds(bounds, { padding: [20, 20] });
    });

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

    wmts["options"]["clipPolygon"] = polygon;

    L.tileLayer.clippedWmts(wmts["url"], wmts["options"]).addTo(map);

    L.polygon(polygon, {
      color: "black",
      fillColor: "red",
      fillOpacity: 0,
      weight: 3,
    }).addTo(map);

    if (points) {
      points.features.forEach((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties;

        L.circleMarker([lat, lng], {
          radius: 3,
          fillColor: props.color || "black",
          color: "#000",
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .bindPopup(props.dcpName)
          .addTo(map);
      });
    }

    this.map.attributionControl.setPosition("bottomleft");
  }

  async componentDidUpdate(prevProps) {
    const { dark } = this.props;
    var basemap = "default";
    if (prevProps.dark !== dark) {
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

export default CatchmentMap;
