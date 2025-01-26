import React, { Component } from "react";
import CONFIG from "../../config.json";
import Translate from "../../translations.json";
import next_icon from "../../img/next.svg";
import settings_icon from "../../img/settings.svg";
import fullscreen_icon from "../../img/fullscreen.png";
import normalscreen_icon from "../../img/normalscreen.png";
import Slider from "../sliders/slider";

const PlayerSettings = (props) => {
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
    id,
  } = props;
  return (
    <div
      className={settings ? "settings-modal" : "settings-modal hidden"}
      id={id}
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
};

const formatDateTime = (datetime, months) => {
  var a = new Date(datetime);
  var hour = a.getHours();
  var minute = a.getMinutes();
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  return `${hour < 10 ? "0" + hour : hour}:${
    minute < 10 ? "0" + minute : minute
  } ${date} ${month} ${String(year).slice(-2)}`;
};

class PlayerControls extends Component {
  state = {
    settings: false,
    settingsId: "settings_" + Math.round(Math.random() * 100000),
  };
  toggleSettings = (event) => {
    event.stopPropagation();
    this.setState({ settings: !this.state.settings });
  };
  clickHandler = (event) => {
    var { settingsId } = this.state;
    var box = document.getElementById(settingsId);
    var isClickInsideBox = box.contains(event.target);
    var isBoxHidden = window.getComputedStyle(box).visibility === "hidden";
    if (!isClickInsideBox && !isBoxHidden) {
      this.setState({ settings: false });
    }
  };
  componentDidMount() {
    document.addEventListener("click", this.clickHandler);
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.clickHandler);
  }
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
      playControls,
    } = this.props;
    var { settings, settingsId } = this.state;
    var months = Translate.axis[language].months;
    console.log(period, timestep, datetime)
    return (
      <React.Fragment>
        <div className="gradient" />
        <PlayerSettings {...this.props} settings={settings} id={settingsId} />
        <div className={playControls ? "playback" : "playback hide"}>
          <div className="slider">
            <Slider
              period={period}
              timestep={timestep}
              datetime={datetime}
              setDatetime={setDatetime}
              language={language}
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
                <img src={next_icon} alt="next" />
              </button>
            </div>
            <div className="current-datetime">
              {formatDateTime(this.props.datetime, months)}
            </div>
            <div className="fullscreen clickable-button">
              <span className="tooltip right">
                {fullscreen ? "Exit full screen" : "Full screen"}
              </span>
              <button onClick={toggleFullscreen}>
                <img
                  src={fullscreen ? normalscreen_icon : fullscreen_icon}
                  alt="Full screen"
                />
              </button>
            </div>
            <div className="play-settings clickable-button" id="settings-icon">
              <span className="tooltip">{Translate.settings[language]}</span>
              <button onClick={this.toggleSettings}>
                <img src={settings_icon} alt="settings" />
              </button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default PlayerControls;
