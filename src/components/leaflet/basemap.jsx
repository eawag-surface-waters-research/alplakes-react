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
  state = {
    darkMap: "clqz0bzlt017d01qw5xi9ex6x",
    lightMap: "clg4u62lq009a01oa5z336xn7",
    id: Math.round(Math.random() * 100000),
  };
  find = (list, parameter, value) => {
    return list.find((l) => l[parameter] === value);
  };
  async componentDidUpdate(prevProps) {
    const { updates, updated, metadata, layers } = this.props;
    if (updates.length > 0) {
      updated();
      var initialLoad = false;
      if (updates.find((u) => u.event === "initialLoad")) initialLoad = true;
      for (var update of updates) {
        var layer = this.find(layers, "id", update.id)
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
            await addLayer(
              layer,
              this.dataStore,
              this.layerStore,
              this.map,
              initialLoad,
              this.props
            );
          } catch (e) {
            console.error(
              "Failed to add layer",
              layer
            );
            console.error(e);
          }
        } else if (update.event === "updateLayer") {
          await updateLayer(
            layer,
            this.dataStore,
            this.layerStore,
            this.map,
            this.props
          );
        } else if (update.event === "removeLayer") {
          removeLayer(
            layer,
            this.layerStore,
            this.map
          );
        }
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
    var { darkMap, lightMap, id } = this.state;
    var { dark } = this.props;
    this.dataStore = {};
    this.layerStore = {};
    var center = [46.9, 8.2];
    var zoom = 8;
    this.map = L.map("map" + id, {
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
    const { id } = this.state;
    return (
      <React.Fragment>
        <div id={"map" + id} className="leaflet-map"></div>
      </React.Fragment>
    );
  }
}

export default Basemap;
