import React, { Component } from "react";
import Basemap from "../../components/leaflet/basemap";
import Slider from "../../components/sliders/slider";
import Colorbar from "../../components/colors/colorbar";
import Translate from "../../translations.json";
import next from "../../img/next.svg";
import settings_icon from "../../img/settings.svg";
//import tools_icon from "../../img/tools.png";
import hand_icon from "../../img/hand.png";
import point_icon from "../../img/point.png";
import transect_icon from "../../img/transect.png";
import fullscreen_icon from "../../img/fullscreen.png";
import normalscreen_icon from "../../img/normalscreen.png";
import CONFIG from "../../config.json";
import { formatDate, formatTime } from "./functions";
import "./lake.css";

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
                  ) && l.active
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

class Controls extends Component {
  render() {
    var { layers, language, cursor } = this.props;
    return (
      <div className="controls leaflet-touch">
        <div className="leaflet-control-zoom leaflet-bar leaflet-control">
          <a href="#" className={cursor === "hand" ? "active" : ""}>
            <img src={hand_icon} />
          </a>
          <a href="#" className={cursor === "point" ? "active" : ""}>
            <img src={point_icon} />
          </a>
          <a href="#" className={cursor === "transect" ? "active" : ""}>
            <img src={transect_icon} />
          </a>
        </div>
      </div>
    );
  }
}

class Settings extends Component {
  render() {
    var {
      settings,
      timestep,
      setTimestep,
      timeout,
      setTimeout,
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
                <select value={timeout} onChange={setTimeout}>
                  <option value={1000}>x 0.1</option>
                  <option value={500}>x 0.2</option>
                  <option value={200}>x 0.5</option>
                  <option value={100}>Normal</option>
                  <option value={50}>x 2</option>
                  <option value={20}>x 5</option>
                  <option value={10}>x 10</option>
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

class Media extends Component {
  state = {
    settings: false,
    legend: true,
    controls: true,
    cursor: "point",
  };

  toggleSettings = () => {
    this.setState({ settings: !this.state.settings });
  };
  toggleLegend = () => {
    this.setState({ legend: !this.state.legend });
  };
  escFunction = (event) => {
    if (event.key === "Escape") {
      this.setState({ fullscreen: false }, () => {
        window.dispatchEvent(new Event("resize"));
      });
    }
  };
  closeWindows = (event) => {
    var { settings } = this.state;
    if (settings) {
      if (
        !document.getElementById("settings").contains(event.target) &&
        !document.getElementById("settings-icon").contains(event.target)
      ) {
        this.setState({ settings: false });
      }
    }
  };
  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
    document.addEventListener("click", this.closeWindows);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
    document.removeEventListener("click", this.closeWindows);
  }
  render() {
    var {
      period,
      play,
      togglePlay,
      setDatetime,
      datetime,
      timestep,
      nextStep,
      timeout,
      setTimeout,
      setTimestep,
      language,
      basemap,
      setBasemap,
      fullscreen,
      toggleFullscreen,
      layers,
      language,
    } = this.props;
    var { settings, legend, controls, cursor } = this.state;
    return (
      <div className="map-component">
        {legend && <Legend layers={layers} language={language} />}
        {controls && (
          <Controls layers={layers} language={language} cursor={cursor} />
        )}
        <div className="viewport">
          <Basemap {...this.props} />
        </div>
        <div className="gradient" />
        <Settings
          settings={settings}
          timestep={timestep}
          setTimestep={setTimestep}
          timeout={timeout}
          setTimeout={setTimeout}
          basemap={basemap}
          setBasemap={setBasemap}
          legend={legend}
          toggleLegend={this.toggleLegend}
        />
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
                  className={
                    play ? "play-pause-icon paused" : "play-pause-icon"
                  }
                ></div>
              </button>
            </div>
            <div className="next-frame clickable-button">
              <span className="tooltip">{Translate.next[language]}</span>
              <button onClick={nextStep}>
                <img src={next} alt="next" />
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
              <button onClick={this.toggleSettings}>
                <img src={settings_icon} alt="settings" />
              </button>
            </div>
            {/**<div className="tools clickable-button">
              <span className="tooltip">Tools</span>
              <button>
                <img src={tools_icon} alt="tools" />
              </button>
            </div>**/}
          </div>
        </div>
      </div>
    );
  }
}

export default Media;
