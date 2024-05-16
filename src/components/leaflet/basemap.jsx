import React, { Component } from "react";
import L from "leaflet";
import CONFIG from "../../config.json";
import {
  flyToBounds,
  addLayer,
  updateLayer,
  removeLayer,
  loaded,
} from "./functions";
import "./leaflet_geotiff";
import "./leaflet_colorpicker";
import "./leaflet_customtooltip";
import "./leaflet_customcontrol";
import "./css/leaflet.css";

class Basemap extends Component {
  state = {
    darkMap: "clqz0bzlt017d01qw5xi9ex6x",
    lightMap: "clg4u62lq009a01oa5z336xn7",
  };
  find = (list, parameter, value) => {
    return list.find((l) => l[parameter] === value);
  };
  async componentDidUpdate(prevProps) {
    const { updates, updated, metadata, layers, error } = this.props;
    if (updates.length > 0) {
      updated();
      var initialLoad = false;
      if (updates.find((u) => u.event === "initialLoad")) initialLoad = true;
      for (var update of updates) {
        var layer = this.find(layers, "id", update.id);
        if (update.event === "clear") {
          this.layer.clearLayers();
        } else if (update.event === "bounds") {
          await flyToBounds(metadata.bounds, this.map);
        } else if (update.event === "initialLoad") {
          var element = document.getElementById(update.id);
          if (element) {
            element.style.opacity = 0;
          }
          this.layerStore["basemap"].addTo(this.map);
        } else if (update.event === "addLayer") {
          try {
            layer = await addLayer(
              layer,
              layers,
              this.dataStore,
              this.layerStore,
              this.map,
              initialLoad,
              this.props
            );
          } catch (e) {
            loaded(this.props.loadingId);
            console.error(e);
            error(
              `Failed to add layer ${
                this.find(layers, "id", update.id).parameter
              }.`
            );
          }
        } else if (update.event === "updateLayer") {
          layer = await updateLayer(
            layer,
            this.dataStore,
            this.layerStore,
            this.map,
            this.props
          );
        } else if (update.event === "removeLayer") {
          layer = removeLayer(layer, this.layerStore, this.map);
        }
        this.props.setLayers(layers);
      }
      this.map.triggerLayersUpdate();
    }

    var { darkMap, lightMap } = this.state;
    var { dark } = this.props;
    var mapCode = dark ? darkMap : lightMap;
    if (prevProps.basemap !== this.props.basemap) {
      var basemap;
      if (basemap === "default") {
        basemap = L.tileLayer(
          `https://api.mapbox.com/styles/v1/jamesrunnalls/${mapCode}/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ`,
          {
            maxZoom: 19,
            attribution: "&copy; <a href='https://www.mapbox.com/'>mapbox</a>",
          }
        );
      } else {
        basemap = L.tileLayer(CONFIG.basemaps[this.props.basemap].url, {
          maxZoom: 19,
          attribution: CONFIG.basemaps[this.props.basemap].attribution,
        });
      }
      basemap.addTo(this.map);
      var old_basemap = this.layerStore["basemap"];
      this.map.removeLayer(old_basemap);
      this.layerStore["basemap"] = basemap;
    } else if (
      prevProps.dark !== this.props.dark &&
      this.props.basemap === "default"
    ) {
      basemap = L.tileLayer(
        `https://api.mapbox.com/styles/v1/jamesrunnalls/${mapCode}/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ`,
        {
          maxZoom: 19,
          attribution: "&copy; <a href='https://www.mapbox.com/'>mapbox</a>",
        }
      );
      basemap.addTo(this.map);
      var old_basemap2 = this.layerStore["basemap"];
      this.map.removeLayer(old_basemap2);
      this.layerStore["basemap"] = basemap;
    }
  }
  async componentDidMount() {
    var { darkMap, lightMap } = this.state;
    var { dark, mapId } = this.props;
    this.dataStore = {};
    this.layerStore = {};
    var center = [46.9, 8.2];
    var zoom = 8;
    this.map = L.map(mapId, {
      preferCanvas: true,
      center: center,
      zoom: zoom,
      minZoom: 5,
      maxZoom: 17,
      maxBoundsViscosity: 0.5,
      zoomSnap: 0.25,
      zoomControl: false,
      showCursorLocation: true,
      zoomAnimation: true,
    });
    this.map.doubleClickZoom.disable();
    var mapCode = dark ? darkMap : lightMap;
    var basemap = L.tileLayer(
      `https://api.mapbox.com/styles/v1/jamesrunnalls/${mapCode}/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFtZXNydW5uYWxscyIsImEiOiJjazk0ZG9zd2kwM3M5M2hvYmk3YW0wdW9yIn0.uIJUZoDgaC2LfdGtgMz0cQ`,
      {
        maxZoom: 19,
        attribution: "&copy; <a href='https://www.mapbox.com/'>mapbox</a>",
      }
    );
    this.layerStore["basemap"] = basemap;
    this.layerStore["labels"] = L.layerGroup([]).addTo(this.map);
    this.layer = L.layerGroup([]).addTo(this.map);
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
