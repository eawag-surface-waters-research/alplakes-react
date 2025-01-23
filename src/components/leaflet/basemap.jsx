import React, { Component } from "react";
import L from "leaflet";
import CONFIG from "../../config.json";
import { update } from "./update";
import "./leaflet_customtooltip";
import "./leaflet_tileclass";
import "./css/leaflet.css";
import "./css/basemap.css";
import Loading from "../loading/loading";
import Slider from "../sliders/slider";

class Basemap extends Component {
  state = {
    controls: true,
    play: false,
    period: [new Date(2025, 1, 12), new Date(2025, 1, 20)],
    datetime: new Date(2025, 1, 15),
    timestep: 3600000,
  };
  togglePlay = () => {
    this.setState({ play: !this.state.play });
  };
  setDatetime = (event) => {
    console.log("HEre")
    console.log(event.target)
    this.setState({ datetime: event.target.value });
  };
  async componentDidUpdate(prevProps) {
    const { dark, updates, updated, mapId, language } = this.props;
    var { basemap } = this.props;
    if (updates.length > 0) {
      const loading_div = document.getElementById(`loading_${mapId}`);
      loading_div.style.opacity = 0.6;
      updated();
      await update(this.map, this.layers, updates, language);
      loading_div.style.opacity = 0;
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
    var map = this.map;
    if (bounds) {
      this.map.fitBounds(bounds, { padding: [20, 20], animate: false });
      this.map.on("dblclick", function () {
        map.fitBounds(bounds, { padding: [20, 20] });
      });
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
    this.map.attributionControl.setPosition("bottomleft");
    this.layers = {};
  }

  render() {
    const { mapId, load, language } = this.props;
    const { controls, play, period, datetime, timestep } = this.state;
    return (
      <React.Fragment>
        <div
          className="loading"
          id={`loading_${mapId}`}
          style={{ opacity: 0.6, display: load ? "flex" : "none" }}
        >
          <Loading />
        </div>
        {controls && (
          <div className="control-bar">
            <div className="play-button">
              <div className="playpause">
                <input
                  type="checkbox"
                  value="None"
                  id="playpause"
                  name="check"
                  checked={!play}
                  onChange={this.togglePlay}
                />
                <label htmlFor="playpause"></label>
              </div>
            </div>
            <div className="progress-bar">
              <Slider
                period={period}
                datetime={datetime}
                timestep={timestep}
                setDatetime={this.setDatetime}
                language={language}
              />
            </div>
          </div>
        )}
        <div id={mapId} className="leaflet-map"></div>
      </React.Fragment>
    );
  }
}

export default Basemap;
