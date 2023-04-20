import React, { Component } from "react";
import Basemap from "../../components/leaflet/basemap";
import Slider from "../../components/sliders/slider";
import next from "../../img/next.svg";
import settings_icon from "../../img/settings.svg";
//import tools_icon from "../../img/tools.png";
import fullscreen_icon from "../../img/fullscreen.png";
import normalscreen_icon from "../../img/normalscreen.png";
import CONFIG from "../../config.json";
import { formatDate, formatTime } from "./functions";
import "./lake.css";

class Media extends Component {
  state = {
    fullscreen: false,
    settings: false,
  };
  toggleFullscreen = () => {
    this.setState({ fullscreen: !this.state.fullscreen }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };
  toggleSettings = () => {
    this.setState({ settings: !this.state.settings });
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
      metadata,
      language,
      basemap,
      setBasemap,
    } = this.props;
    var { fullscreen, settings } = this.state;
    return (
      <div
        className={fullscreen ? "map-component fullscreen" : "map-component"}
      >
        <div className="lake-name">
          {"name" in metadata && metadata.name[language]}
        </div>
        <div className="viewport">
          <Basemap {...this.props} />
        </div>
        <div className="gradient" />
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
                    <option value={3600000}>1 Hour</option>
                    <option value={10800000}>3 Hours</option>
                    <option value={86400000}>1 Day</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>Animation Speed</td>
                <td className="settings-input">
                  <input type="number" value={timeout} onChange={setTimeout} />
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
            </tbody>
          </table>
        </div>
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
              <span className="tooltip">Play (Spacebar)</span>
              <button onClick={togglePlay}>
                <div
                  className={
                    play ? "play-pause-icon paused" : "play-pause-icon"
                  }
                ></div>
              </button>
            </div>
            <div className="next-frame clickable-button">
              <span className="tooltip">Next (Right Arrow)</span>
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
                {fullscreen ? "Exit full screen" : "Full screen"}
              </span>
              <button onClick={this.toggleFullscreen}>
                <img
                  src={fullscreen ? normalscreen_icon : fullscreen_icon}
                  alt="full screen"
                />
              </button>
            </div>
            <div className="settings clickable-button" id="settings-icon">
              <span className="tooltip">Settings</span>
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
