import React, { Component } from "react";
import L from "leaflet";
import CONFIG from "../../config.json";
import "./leaflet_customtooltip";
import "./leaflet_tileclass";
import "./leaflet_wmts";
import "./css/leaflet.css";
import "./css/catchment.css";
import opacity_icon from "../../img/opacity.png"

class CatchmentMap extends Component {
  state = {
    opacity: 0.7,
  };
  setOpacity = (event) => {
    const opacity = event.target.value;
    this.display.setOpacity(opacity);
    this.setState({ opacity });
  };

  async componentDidMount() {
    var { dark, mapId, polygon, points, wmts_url, options, lookup, maxZoom } =
      this.props;
    var { opacity } = this.state;
    this.map = L.map(mapId, {
      preferCanvas: true,
      center: [46.9, 8.2],
      zoom: 8,
      minZoom: 5,
      maxZoom: maxZoom ? maxZoom : 17,
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

    if (lookup) {
      options["lookup"] = lookup;
    }
    options["opacity"] = opacity;
    options["clipPolygon"] = polygon;
    this.display = L.tileLayer.clippedWmts(wmts_url, options).addTo(map);

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
    const { dark, wmts_url, options, lookup, polygon } = this.props;
    const { opacity } = this.state;
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
    } else if (prevProps.wmts_url !== wmts_url) {
      this.map.removeLayer(this.display);
      this.display = null;
      if (lookup) {
        options["lookup"] = lookup;
      }
      options["opacity"] = opacity;
      options["clipPolygon"] = polygon;
      this.display = L.tileLayer.clippedWmts(wmts_url, options).addTo(this.map);
    }
  }

  componentWillUnmount() {
    this.map.off();
    this.map.remove();
  }

  render() {
    const { mapId, fullscreen } = this.props;
    const { opacity } = this.state;
    return (
      <React.Fragment>
        <div className={fullscreen ? "catchment-opacity full" : "catchment-opacity"}>
          <img src={opacity_icon} alt="opacity" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={this.setOpacity}
          ></input>
        </div>
        <div id={mapId}></div>
      </React.Fragment>
    );
  }
}

export default CatchmentMap;
