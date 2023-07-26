import React, { Component } from "react";
import L from "leaflet";
import CONFIG from "../../config.json";
import { flyToBounds, addLayer, updateLayer, removeLayer } from "./functions";
import "./leaflet_geotiff";
import "./leaflet_colorpicker";
import "./leaflet_customtooltip";
import "./leaflet_customcontrol";
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
      getTransect,
      getProfile,
      startAnimation,
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
            setSimpleline,
            getTransect,
            getProfile
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
        } else if (update.event === "play") {
          startAnimation();
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
    var { openSidebar } = this.props;
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

    L.control
      .custom({
        position: "topleft",
        content: `<div class="bar-container">
                    <div class="bar"></div>
                    <div class="ball ball1"></div>
                  </div>
                  <div class="bar-container">
                    <div class="bar"></div>
                    <div class="ball ball2"></div>
                  </div>
                  <div class="bar-container">
                    <div class="bar"></div>
                    <div class="ball ball3"></div>
                  </div>`,
        classes: "leaflet-settings-control",
        events: {
          click: function () {
            openSidebar();
          },
        },
      })
      .addTo(this.map);
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
