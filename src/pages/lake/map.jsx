import React, { Component } from "react";
import Basemap from "../../components/leaflet/basemap";
import Slider from "../../components/sliders/slider";
import Colorbar from "../../components/colors/colorbar";
import CONFIG from "../../config.json";
import Translate from "../../translations.json";
import next_icon from "../../img/next.svg";
import settings_icon from "../../img/settings.svg";
import fullscreen_icon from "../../img/fullscreen.png";
import normalscreen_icon from "../../img/normalscreen.png";
import { relativeDate, formatDate, formatTime } from "./functions";
import MapSettings from "./mapsettings";

class Loading extends Component {
  render() {
    return (
      <div className="loading" id="loading">
        <div className="loading-symbol">
          <span className="loader" />
        </div>
        <div className="loading-text" id="loading-text">
          Loading
        </div>
      </div>
    );
  }
}

class Legend extends Component {
  render() {
    var { layers, language } = this.props;
    return (
      <div className="legend">
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
                  key={l.id}
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
          <div className="settings clickable-button" id="settings-icon">
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

class Map extends Component {
  state = {
    settings: false,
    legend: true,
    basemap: "default",
    timestep: 3600000,
    timeout: 0,
    play: false,
    datetime: Date.now(),
    period: [relativeDate(-2).getTime(), relativeDate(3).getTime()],
    fullscreen: false,
    updates: [],
    layers: [],
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
    var { play, updates, layers, simpleline } = this.state;
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

  render() {
    var { language, dark } = this.props;
    return (
      <div className="map-container">
        <div className="basemap">
          <Basemap {...this.state} dark={dark} />
        </div>
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
        />
        <MapSettings {...this.state} language={language} dark={dark} />
      </div>
    );
  }
}

export default Map;
