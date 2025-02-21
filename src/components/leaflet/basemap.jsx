import React, { Component } from "react";
import L from "leaflet";
import CONFIG from "../../config.json";
import { update, setPlayDatetime } from "./update";
import "./leaflet_customtooltip";
import "./leaflet_tileclass";
import "./css/leaflet.css";
import "./css/basemap.css";
import Legend from "../legend/legend";
import Loading from "../loading/loading";
import Slider from "../sliders/slider";

class Basemap extends Component {
  state = {
    controls: false,
    play: false,
    period: false,
    datetime: false,
    timestep: false,
    data: false,
    duration: 8000,
  };
  togglePlay = () => {
    const play = !this.state.play;
    if (play) {
      var { datetime, timestep, period, data, duration } = this.state;
      const animate = (timestep) => {
        if (datetime >= period[1]) {
          datetime = period[0];
        } else {
          datetime = datetime + timestep;
        }
        setPlayDatetime(this.layers, datetime, period, data);
        if (this.props.setDatetime) {
          this.props.setDatetime(datetime);
        }
        this.setState({ datetime });
      };
      const scheduleNextIteration = (timestep) => {
        let targetFrame = duration / ((period[1] - period[0]) / timestep);
        let start = performance.now();
        animate(timestep);
        let frame = performance.now() - start;
        let timeout = 0;
        if (frame >= targetFrame) {
          timestep = timestep * 2;
        } else {
          timeout = targetFrame - frame;
        }
        if (play) {
          this.intervalId = setTimeout(
            () => scheduleNextIteration(timestep),
            timeout
          );
        }
      };
      scheduleNextIteration(timestep);
    } else {
      clearTimeout(this.intervalId);
    }

    this.setState({ play });
  };
  setDatetime = (event) => {
    try {
      clearInterval(this.intervalId);
    } catch (e) {}
    const datetime = parseInt(event[0]);
    const { period, data } = this.state;
    setPlayDatetime(this.layers, datetime, period, data);
    if (this.props.setDatetime) this.props.setDatetime(datetime, false);
    this.setState({ datetime, play: false });
  };
  addControls = (period, datetime, timestep, data) => {
    this.setState({
      controls: true,
      play: false,
      period,
      datetime,
      timestep,
      data,
    });
  };
  removeControls = () => {
    this.setState({
      controls: false,
      play: false,
      period: false,
      datetime: false,
      timestep: false,
      data: false,
    });
  };
  async componentDidUpdate(prevProps) {
    const { dark, updates, updated, mapId, language } = this.props;
    var { basemap } = this.props;
    if (updates.length > 0) {
      const loading_div = document.getElementById(`loading_${mapId}`);
      loading_div.style.opacity = 0.6;
      updated();
      await update(
        this.map,
        this.layers,
        updates,
        language,
        this.addControls,
        this.removeControls
      );
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
    const { mapId, load, language, permanentLabel, layers, legend } =
      this.props;
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
        <div className="click-block" />
        <div className="overlay-stack">
          <Legend layers={layers} show={legend} language={language} />
          {controls && (
            <div className="control-bar">
              <div className="play-button" onClick={this.togglePlay}>
                <div className="playpause" id="playing">
                  <input
                    type="checkbox"
                    value="None"
                    id="playpause"
                    name="check"
                    checked={!play}
                    readOnly={true}
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
                  permanentLabel={permanentLabel}
                />
              </div>
            </div>
          )}
        </div>
        <div id={mapId} className="leaflet-map"></div>
      </React.Fragment>
    );
  }
}

export default Basemap;
