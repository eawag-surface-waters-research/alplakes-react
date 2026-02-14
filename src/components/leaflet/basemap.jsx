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
import MapGraph from "../mapgraph/mapgraph";
import SatelliteTimeseriesModal from "../satellitetimeseriesmodal/satellitetimeseriesmodal";

class Basemap extends Component {
  state = {
    controls: false,
    play: false,
    period: false,
    datetime: false,
    timestep: false,
    data: false,
    duration: 12000,
  };
  togglePlay = () => {
    const play = !this.state.play;
    if (play) {
      this.disableControls();
      var { datetime, timestep, period, data, duration } = this.state;
      const range = period[1] - period[0];
      const speed = range / duration;
      let startTime = performance.now();
      let startDatetime = datetime;
      let lastCallbackUpdate = 0;
      const callbackInterval = 500;

      const tick = (now) => {
        if (!this.state.play) return;

        const elapsed = now - startTime;
        let newDatetime = startDatetime + elapsed * speed;
        if (newDatetime >= period[1]) {
          startTime = now;
          startDatetime = period[0];
          newDatetime = period[0];
        }
        newDatetime =
          Math.round((newDatetime - period[0]) / timestep) * timestep +
          period[0];

        if (newDatetime !== datetime) {
          datetime = newDatetime;
          setPlayDatetime(this.layers, datetime, period, data);
          this.map.triggerLayersUpdate();
          this._playDatetime = datetime;

          if (this.props.setDatetime && now - lastCallbackUpdate >= callbackInterval) {
            lastCallbackUpdate = now;
            this.props.setDatetime(datetime, true);
          }
        }

        this._rafId = requestAnimationFrame(tick);
      };

      this._rafId = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(this._rafId);
      if (this._playDatetime !== undefined) {
        if (this.props.setDatetime) this.props.setDatetime(this._playDatetime);
        this.setState({ datetime: this._playDatetime });
      }
    }

    this.setState({ play });
  };
  setDatetime = (event) => {
    try {
      clearInterval(this.intervalId);
    } catch (e) {}
    const datetime = parseInt(event[0]);
    const { period, data } = this.state;
    this.disableControls();
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
  disableControls = () => {
    for (let layer in this.layers) {
      for (let key in this.layers[layer]) {
        if (key.includes("control")) {
          this.layers[layer][key]._disableDrawing();
        }
      }
    }
  };
  customProfileLocation = (lat, lng) => {
    for (let layer in this.layers) {
      for (let key in this.layers[layer]) {
        if (key === "profile_control") {
          this.layers[layer][key].addMarker(lat, lng);
        }
      }
    }
  };
  componentWillUnmount() {
    cancelAnimationFrame(this._rafId);
  }
  async componentDidUpdate(prevProps) {
    const {
      dark,
      updates,
      updated,
      mapId,
      language,
      getTransect,
      getProfile,
      getSatelliteTimeseries,
    } = this.props;
    var { basemap } = this.props;
    const server = {
      getTransect,
      getProfile,
      getSatelliteTimeseries,
      disableControls: this.disableControls,
    };
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
        this.removeControls,
        server,
        this.state.play,
        this.togglePlay,
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
    const {
      mapId,
      load,
      language,
      permanentLabel,
      layers,
      legend,
      graph,
      graphSelection,
      dark,
      selectMapGraph,
      graphHide,
      graphFull,
      toggleGraphHide,
      toggleGraphFull,
      updateOptions,
      satelliteTimeseriesModal,
      satelliteTimeseriesCount,
      downloadSatelliteTimeseries,
      closeSatelliteTimeseriesModel,
    } = this.props;
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
                <div
                  className={play ? "playpause" : "playpause pause"}
                  id="playing"
                />
              </div>
              <div className="progress-bar">
                <Slider
                  period={period}
                  datetime={datetime}
                  timestep={timestep}
                  setDatetime={this.setDatetime}
                  language={language}
                  permanentLabel={permanentLabel}
                  play={play}
                  duration={this.state.duration}
                />
              </div>
            </div>
          )}
          {graph && !graphFull && (
            <MapGraph
              layers={layers}
              language={language}
              graphSelection={graphSelection}
              datetime={datetime}
              selectMapGraph={selectMapGraph}
              dark={dark}
              graphHide={graphHide}
              toggleGraphHide={toggleGraphHide}
              graphFull={graphFull}
              toggleGraphFull={toggleGraphFull}
              updateOptions={updateOptions}
              customProfileLocation={this.customProfileLocation}
            />
          )}
        </div>
        {graph && graphFull && (
          <MapGraph
            layers={layers}
            language={language}
            graphSelection={graphSelection}
            datetime={datetime}
            selectMapGraph={selectMapGraph}
            dark={dark}
            graphHide={graphHide}
            toggleGraphHide={toggleGraphHide}
            graphFull={graphFull}
            toggleGraphFull={toggleGraphFull}
            updateOptions={updateOptions}
            customProfileLocation={this.customProfileLocation}
          />
        )}
        <div id={mapId} className="leaflet-map" />
        {satelliteTimeseriesModal && (
          <SatelliteTimeseriesModal
            properties={satelliteTimeseriesModal}
            satelliteTimeseriesCount={satelliteTimeseriesCount}
            downloadSatelliteTimeseries={downloadSatelliteTimeseries}
            closeSatelliteTimeseriesModel={closeSatelliteTimeseriesModel}
            layers={layers}
            language={language}
          />
        )}
      </React.Fragment>
    );
  }
}

export default Basemap;
