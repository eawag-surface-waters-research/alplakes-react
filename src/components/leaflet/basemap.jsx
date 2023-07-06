import React, { Component } from "react";
import L from "leaflet";
import CONFIG from "../../config.json";
import { flyToBounds, addLayer, updateLayer, removeLayer } from "./functions";
// import leaflet_marker from "../../img/leaflet_marker.png";
import "./leaflet_geotiff";
import "./leaflet_floatgeotiff";
import "./leaflet_colorpicker";
import "./leaflet_streamlines";
import "./leaflet_vectorfield";
import "./leaflet_customtooltip";
import "./leaflet_customcontrol";
import "./leaflet_polylinedraw";
import "./leaflet_markerdraw";
import "./css/leaflet.css";

class Basemap extends Component {
  find = (list, parameter, value) => {
    return list.find((l) => l[parameter] === value);
  };
  async componentDidUpdate(prevProps) {
    const {
      updates,
      updated,
      metadata,
      layers,
      period,
      datetime,
      depth,
      setSimpleline,
      unlock,
    } = this.props;
    if (updates.length > 0) {
      updated();
      for (var update of updates) {
        if (update.event === "clear") {
          this.layer.clearLayers();
        } else if (update.event === "bounds") {
          flyToBounds(metadata.bounds, this.map);
        } else if (update.event === "addLayer") {
          await addLayer(
            this.find(layers, "id", update.id),
            period,
            this.dataStore,
            this.layerStore,
            this.map,
            datetime,
            depth,
            setSimpleline
          );
        } else if (update.event === "updateLayer") {
          updateLayer(
            this.find(layers, "id", update.id),
            this.dataStore,
            this.layerStore,
            this.map,
            datetime,
            depth
          );
        } else if (update.event === "removeLayer") {
          removeLayer(
            this.find(layers, "id", update.id),
            this.layerStore,
            this.map
          );
        }
      }
      unlock();
    }
    if (prevProps.basemap !== this.props.basemap) {
      var basemap = L.tileLayer(CONFIG.basemaps[this.props.basemap].url, {
        maxZoom: 19,
        attribution: CONFIG.basemaps[this.props.basemap].attribution,
      });
      basemap.addTo(this.map);
      var old_basemap = this.layerStore["basemap"];
      this.map.removeLayer(old_basemap);
      this.layerStore["basemap"] = basemap;
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
      showCursorLocation: true,
    });
    this.map.doubleClickZoom.disable();

    var basemap = L.tileLayer(CONFIG.basemaps["default"].url, {
      maxZoom: 19,
      attribution: CONFIG.basemaps["default"].attribution,
    });
    this.map.addLayer(basemap);
    this.layerStore["basemap"] = basemap;

    this.layer = L.layerGroup([]).addTo(this.map);
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
