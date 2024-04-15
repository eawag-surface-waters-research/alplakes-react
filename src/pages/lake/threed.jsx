import React, { Component } from "react";
import axios from "axios";
import Basemap from "../../components/leaflet/basemap";
import Slider from "../../components/sliders/slider";
import Colorbar from "../../components/colors/colorbar";
import CONFIG from "../../config.json";
import Translate from "../../translations.json";
import next_icon from "../../img/next.svg";
import settings_icon from "../../img/settings.svg";
import fullscreen_icon from "../../img/fullscreen.png";
import normalscreen_icon from "../../img/normalscreen.png";
import {
  relativeDate,
  formatDate,
  formatTime,
  setCustomPeriod,
  getTransectAlplakesHydrodynamic,
  getProfileAlplakesHydrodynamic,
} from "./functions";
import "./lake.css";
import Loading from "../../components/loading/loading";

class Legend extends Component {
  render() {
    var { layers, language, setSelection, legend } = this.props;
    return (
      <div className={legend ? "legend" : "legend hide"}>
        <table>
          <tbody>
            {layers
              .filter(
                (l) =>
                  ["min", "max", "palette"].every((key) =>
                    Object.keys(l.properties.options).includes(key)
                  ) &&
                  l.active &&
                  ("raster" in l.properties.options
                    ? l.properties.options.raster
                    : true)
              )
              .map((l) => (
                <Colorbar
                  min={l.properties.options.min}
                  max={l.properties.options.max}
                  palette={l.properties.options.palette}
                  unit={l.properties.unit}
                  onClick={setSelection}
                  key={l.id}
                  id={l.id}
                  text={
                    l.properties.parameter in Translate
                      ? Translate[l.properties.parameter][language]
                      : ""
                  }
                />
              ))}
          </tbody>
        </table>
      </div>
    );
  }
}

class PlayerSettings extends Component {
  render() {
    var {
      settings,
      timestep,
      setTimestep,
      timeout,
      setSpeed,
      basemap,
      setBasemap,
      legend,
      toggleLegend,
    } = this.props;
    return (
      <div
        className={settings ? "settings-modal" : "settings-modal hidden"}
        id="settings"
      >
        <table>
          <tbody>
            <tr>
              <td></td>
              <td>Step Interval</td>
              <td className="settings-input">
                <select value={timestep} onChange={setTimestep}>
                  <option value={600000}>10 Mins</option>
                  <option value={1800000}>30 Mins</option>
                  <option value={3600000}>1 Hour</option>
                  <option value={10800000}>3 Hours</option>
                  <option value={86400000}>1 Day</option>
                </select>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>Playback Speed</td>
              <td className="settings-input">
                <select value={timeout} onChange={setSpeed}>
                  <option value={1200}>x 0.1</option>
                  <option value={400}>x 0.2</option>
                  <option value={300}>x 0.5</option>
                  <option value={150}>Normal</option>
                  <option value={50}>x 2</option>
                  <option value={1}>x 5</option>
                </select>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>Basemap</td>
              <td className="settings-input">
                <select value={basemap} onChange={setBasemap}>
                  {Object.keys(CONFIG.basemaps).map((b) => (
                    <option value={b} key={b}>
                      {CONFIG.basemaps[b].title}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td></td>
              <td>Legend</td>
              <td className="settings-input">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={legend}
                    onChange={toggleLegend}
                  />
                  <span className="slider round"></span>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

class PlayerControls extends Component {
  render() {
    var {
      period,
      timestep,
      datetime,
      language,
      play,
      fullscreen,
      togglePlay,
      setDatetime,
      nextStep,
      toggleFullscreen,
      toggleSettings,
    } = this.props;
    return (
      <div className="playback">
        <div className="slider">
          <Slider
            period={period}
            timestep={timestep}
            datetime={datetime}
            setDatetime={setDatetime}
          />
        </div>
        <div className="play-controls">
          <div className="play-pause clickable-button">
            <span className="tooltip">{Translate.play[language]}</span>
            <button onClick={togglePlay}>
              <div
                className={play ? "play-pause-icon paused" : "play-pause-icon"}
              ></div>
            </button>
          </div>
          <div className="next-frame clickable-button">
            <span className="tooltip">{Translate.next[language]}</span>
            <button onClick={nextStep}>
              <img src={next_icon} alt="next" />
            </button>
          </div>
          <div className="current-datetime">
            {formatTime(this.props.datetime) + " "}
            {formatDate(this.props.datetime)}
          </div>
          <div className="fullscreen clickable-button">
            <span className="tooltip right">
              {Translate.fullscreen[language]}
            </span>
            <button onClick={toggleFullscreen}>
              <img
                src={fullscreen ? normalscreen_icon : fullscreen_icon}
                alt="full screen"
              />
            </button>
          </div>
          <div className="play-settings clickable-button" id="settings-icon">
            <span className="tooltip">{Translate.settings[language]}</span>
            <button onClick={toggleSettings}>
              <img src={settings_icon} alt="settings" />
            </button>
          </div>
        </div>
      </div>
    );
  }
}

class ThreeD extends Component {
  state = {
    id: Math.round(Math.random() * 100000),
    settings: false,
    legend: false,
    basemap: "default",
    timestep: 3600000,
    timeout: 0,
    play: false,
    datetime: Date.now(),
    maxDate: Date.now(),
    minDate: new Date(2010),
    missingDates: [],
    period: [relativeDate(-2).getTime(), relativeDate(3).getTime()],
    fullscreen: false,
    updates: [],
    layers: [],
    depth: "",
    depths: [],
    bucket: true,
    selection: false,
    graphs: false,
    graphData: false,
  };
  setBasemap = (event) => {
    this.setState({ basemap: event.target.value });
  };
  setSpeed = (event) => {
    this.pause();
    this.setState({ timeout: parseInt(event.target.value) }, () => this.play());
  };
  setTimestep = (event) => {
    this.setState({ timestep: parseInt(event.target.value) });
  };
  setDatetime = (event) => {
    var int = parseInt(JSON.parse(JSON.stringify(event.target.value)));
    var { play, updates, layers } = this.state;
    for (var layer of layers) {
      if (layer.active) {
        updates.push({ event: "updateLayer", id: layer.id });
      }
    }
    var datetime;
    if (play) {
      datetime = int;
    } else {
      datetime = parseInt(event.target.getAttribute("alt"));
    }
    this.setState({ datetime, updates });
  };
  toggleLegend = () => {
    this.setState({ legend: !this.state.legend });
  };
  toggleSettings = () => {
    this.setState({ settings: !this.state.settings });
  };
  toggleFullscreen = () => {
    this.setState({ fullscreen: !this.state.fullscreen }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };
  updated = () => {
    this.setState({ updates: [] });
  };
  unlock = () => {
    this.setState({ bucket: false });
  };
  togglePlay = () => {
    if (this.state.play) {
      this.pause();
    } else {
      this.play();
    }
  };
  play = () => {
    var { timeout } = this.state;
    this.intervalId = setInterval(() => {
      this.setState((prevState, props) => {
        var { timestep, datetime, period, updates, layers } = prevState;

        if (datetime >= period[1]) {
          datetime = period[0];
        } else {
          datetime = datetime + timestep;
        }
        for (var layer of layers) {
          if (layer.active && "playUpdate" in layer && layer.playUpdate) {
            updates.push({ event: "updateLayer", id: layer.id });
          }
        }
        return { datetime, updates };
      });
    }, timeout);
    this.setState({ play: true });
  };
  pause = () => {
    try {
      clearInterval(this.intervalId);
    } catch (e) {}
    this.setState({ play: false });
  };
  addLayer = (id) => {
    var { layers, updates } = this.state;
    var layer = layers.find((l) => l.id === id);
    if (!layer.active) {
      this.pause();
      layer.active = true;
      updates.push({ event: "addLayer", id: id });
      this.setState({
        layers,
        updates,
        clickblock: true,
        selection: id,
      });
    }
  };
  removeLayer = (id) => {
    var { layers } = this.state;
    var layer = layers.find((l) => l.id === id);
    if (layer.active) {
      layer.active = false;
      var updates = [{ event: "removeLayer", id: id }];
      this.setState({ layers, updates, selection: false });
    }
  };
  updateOptions = (id, options) => {
    var { layers, updates } = this.state;
    updates.push({ event: "updateLayer", id: id });
    layers.find((l) => l.id === id).properties.options = options;
    this.setState({ layers, updates });
  };
  setSelection = (selection) => {
    if (selection === this.state.selection) {
      this.setState({ selection: false });
    } else {
      this.setState({ selection });
    }
  };
  closeSelection = () => {
    this.setState({ selection: false });
  };
  setDepth = (event) => {
    var { layers, depth, updates } = this.state;
    if (
      depth !== event.target.value &&
      layers.filter((l) => l.properties.depth && l.active).length > 0
    ) {
      this.pause();
      depth = event.target.value;
      for (let layer of layers) {
        if (layer.properties.depth && layer.active) {
          updates.unshift({ event: "removeLayer", id: layer.id });
          updates.push({ event: "addLayer", id: layer.id });
        }
      }
      this.setState({ updates, depth, clickblock: true });
    }
  };
  setPeriod = (period) => {
    var { layers, updates } = this.state;
    if (period !== this.state.period) {
      var datetime = period[0];
      var clickblock;
      for (let layer of layers) {
        if (layer.active && layer.properties.period) {
          clickblock = true;
          updates.unshift({ event: "removeLayer", id: layer.id });
          updates.push({ event: "addLayer", id: layer.id });
        }
      }
      this.pause();
      this.setState({ updates, datetime, clickblock, period });
    }
  };
  getTransect = async (latlng, layer) => {
    var { graphData, period } = this.state;
    if (layer.type === "alplakes_transect") {
      graphData = await getTransectAlplakesHydrodynamic(
        CONFIG.alplakes_api,
        layer.properties.model,
        layer.properties.lake,
        period,
        latlng
      );
      if (graphData) {
        graphData["type"] = "transect";
        graphData["layer"] = layer;
      }
    }
    if (graphData === false) {
      window.alert("Failed to collect transect please try again.");
      this.closeGraph();
    } else {
      this.setState({ graphData, graphs: true, selection: false });
    }
  };
  getProfile = async (latlng, layer) => {
    var { graphData, period } = this.state;
    if (layer.type === "alplakes_profile") {
      graphData = await getProfileAlplakesHydrodynamic(
        CONFIG.alplakes_api,
        layer.properties.model,
        layer.properties.lake,
        period,
        latlng
      );
      if (graphData) {
        graphData["type"] = "profile";
        graphData["layer"] = layer;
      }
    }
    if (graphData === false) {
      window.alert("Failed to collect profile please try again.");
      this.closeGraph();
    } else {
      this.setState({ graphData, graphs: true, selection: false });
    }
  };
  closeGraph = () => {
    var { updates } = this.state;
    updates.push({ event: "clear" });
    this.setState({ updates, graphData: false, graphs: false });
  };
  async componentDidMount() {
    var { metadata, layers, module } = this.props;
    var { period, minDate, maxDate, missingDates, id } = this.state;
    var updates = [{ event: "bounds" }];
    for (var layer of module.defaults) {
      updates.push({ event: "addLayer", id: layer });
    }
    updates.push({ event: "initialLoad", id: id });
    var depth = metadata.default_depth;
    var depths = [depth];
    try {
      if ("customPeriod" in metadata) {
        ({ period, minDate, maxDate, depth, depths, missingDates } =
          await setCustomPeriod(
            metadata.customPeriod,
            period,
            minDate,
            maxDate,
            depth,
            depths,
            missingDates
          ));
      }
    } catch (e) {
      console.error(e);
      alert(
        "Failed to collect data from the API, please check your internet connection."
      );
      this.setState({
        error: "api",
      });
    }
    this.setState({
      layers: JSON.parse(JSON.stringify(layers)),
      updates,
      period,
      depth,
      minDate,
      maxDate,
      missingDates,
      depths,
    });
  }
  render() {
    var { dark, metadata, language } = this.props;
    var { fullscreen, id } = this.state;
    return (
      <div className="module-component">
        <div className="header-hide">5 day forecast</div>
        <div className="plot">
          <div className={fullscreen ? "map fullscreen" : "map"}>
            <div className="initial-load" id={id}>
              <Loading />
            </div>
            <Basemap
              {...this.state}
              dark={dark}
              unlock={this.unlock}
              updated={this.updated}
              metadata={metadata}
              getProfile={this.getProfile}
              getTransect={this.getTransect}
            />
            <div className="gradient" />
            <PlayerSettings
              {...this.state}
              setTimestep={this.setTimestep}
              setSpeed={this.setSpeed}
              setBasemap={this.setBasemap}
              toggleLegend={this.toggleLegend}
            />
            <PlayerControls
              {...this.state}
              language={language}
              setDatetime={this.setDatetime}
              toggleSettings={this.toggleSettings}
              toggleFullscreen={this.toggleFullscreen}
              togglePlay={this.togglePlay}
            />

            <Legend
              {...this.state}
              language={language}
              setSelection={this.setSelection}
            />
          </div>
          <div className="graph"></div>
        </div>
        <div className="sidebar"></div>
      </div>
    );
  }
}

export default ThreeD;
