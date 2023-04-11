import React, { Component } from "react";
import axios from "axios";
import NavBar from "../../components/navbar/navbar";
import Basemap from "../../components/leaflet/basemap";
import Loading from "../../components/loading/loading";
import next from "../../img/next.svg";
import settings_icon from "../../img/settings.svg";
import tools_icon from "../../img/tools.png";
import fullscreen_icon from "../../img/fullscreen.png";
import normalscreen_icon from "../../img/normalscreen.png";
import Translate from "../../translations.json";
import CONFIG from "../../config.json";
import {
  formatDate,
  formatTime,
  relativeDate,
  setCustomPeriod,
  formatDateLong,
} from "./functions";
import "./lake.css";

class LakeSidebar extends Component {
  state = {};
  render() {
    var { metadata, language } = this.props;
    return (
      <div className="info">
        <div className="name">{metadata.name[language]}</div>
        <div className="datetime">
          <div className="time">{formatTime(this.props.datetime)}</div>
          <div className="date">
            {formatDateLong(this.props.datetime, Translate.month[language])}
          </div>
        </div>
      </div>
    );
  }
}

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
  componentDidMount() {
    document.addEventListener("keydown", this.escFunction, false);
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", this.escFunction, false);
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
    } = this.props;
    var { fullscreen, settings } = this.state;
    return (
      <div
        className={fullscreen ? "map-component fullscreen" : "map-component"}
      >
        <div className="viewport">
          <Basemap {...this.props} />
        </div>
        <div className="gradient" />
        <div className={settings ? "settings-modal" : "settings-modal hidden"}>
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
            </tbody>
          </table>
        </div>
        <div className="playback">
          <div className="slider">
            <input
              type="range"
              min={period[0]}
              max={period[1]}
              step={timestep}
              value={datetime}
              className="slider-component"
              onChange={setDatetime}
            />
          </div>
          <div className="play-controls">
            <div className="play-pause clickable-button">
              <span className="tooltip">Play</span>
              <button onClick={togglePlay}>
                <div
                  className={
                    play ? "play-pause-icon paused" : "play-pause-icon"
                  }
                ></div>
              </button>
            </div>
            <div className="next-frame clickable-button">
              <span className="tooltip">Next</span>
              <button onClick={nextStep}>
                <img src={next} alt="next" />
              </button>
            </div>
            <div className="current-datetime">
              {formatTime(this.props.datetime) + " "}
              {formatDate(this.props.datetime)}
            </div>
            <div className="selected-period"></div>
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
            <div className="settings clickable-button">
              <span className="tooltip">Settings</span>
              <button onClick={this.toggleSettings}>
                <img src={settings_icon} alt="settings" />
              </button>
            </div>
            <div className="tools clickable-button">
              <span className="tooltip">Tools</span>
              <button>
                <img src={tools_icon} alt="tools" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

class Lake extends Component {
  state = {
    datetime: Date.now(),
    period: [relativeDate(-2).getTime(), relativeDate(3).getTime()],
    loading: true,
    metadata: {},
    layers: [],
    updates: [],
    play: false,
    timestep: 3600000,
    timeout: 100,
    error: "",
  };

  updated = () => {
    this.setState({ updates: [] });
  };

  togglePlay = () => {
    this.setState({ play: !this.state.play });
  };

  setTimeout = (event) => {
    this.setState({ timeout: parseInt(event.target.value) });
  };

  setTimestep = (event) => {
    this.setState({ timestep: parseInt(event.target.value) });
  };

  nextStep = () => {
    var { play, timestep, datetime, period, updates, layers } = this.state;
    if (!play) {
      if (datetime >= period[1]) {
        datetime = period[0];
        for (let layer of layers) {
          if (layer.active === "true") {
            updates.push({ event: "updateLayer", id: layer.id });
          }
        }
        this.setState({ datetime, updates });
      } else {
        datetime = datetime + timestep;
        for (let layer of layers) {
          if (layer.active === "true") {
            updates.push({ event: "updateLayer", id: layer.id });
          }
        }
        this.setState({ datetime, updates });
      }
    }
  };

  setDatetime = (event) => {
    var { updates, layers } = this.state;
    for (var layer of layers) {
      if (layer.active === "true") {
        updates.push({ event: "updateLayer", id: layer.id });
      }
    }
    var datetime = parseInt(event.target.value);
    this.setState({ datetime, updates });
  };

  componentDidUpdate() {
    var { play, timestep, datetime, timeout, period, updates, layers } =
      this.state;
    if (play) {
      if (datetime >= period[1]) {
        datetime = period[0];
        for (var layer of layers) {
          if (layer.active === "true") {
            updates.push({ event: "updateLayer", id: layer.id });
          }
        }
        this.setState({ datetime, updates });
      } else {
        setTimeout(() => {
          datetime = datetime + timestep;
          for (var layer of layers) {
            if (layer.active === "true") {
              updates.push({ event: "updateLayer", id: layer.id });
            }
          }
          this.setState({ datetime, updates });
        }, timeout);
      }
    }
  }

  async componentDidMount() {
    var { period } = this.state;
    const url = window.location.href.split("/");
    const lake_id = url[url.length - 1].split("?")[0];
    try {
      const { data: metadata } = await axios.get(
        CONFIG.alplakes_bucket + `${lake_id}.json`
      );
      var updates = [{ event: "bounds" }];
      for (var layer of metadata.layers) {
        if (layer.active === "true") {
          updates.push({ event: "addLayer", id: layer.id });
        }
      }
      try {
        if ("customPeriod" in metadata) {
          period = await setCustomPeriod(metadata.customPeriod, period);
        }
      } catch (e) {
        console.error(e);
        this.setState({ error: "api", loading: false });
      }

      this.setState({
        metadata,
        loading: false,
        layers: metadata.layers,
        updates,
        period,
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: "name" });
    }
  }

  render() {
    var { metadata } = this.state;
    var { language } = this.props;
    if ("name" in metadata)
      document.title = "Alplakes - " + metadata.name[language];
    return (
      <div className="lake">
        <NavBar {...this.props} />
        <div className="content">
          <div className="primary">
            <Media
              language={language}
              togglePlay={this.togglePlay}
              setDatetime={this.setDatetime}
              updated={this.updated}
              nextStep={this.nextStep}
              setTimeout={this.setTimeout}
              setTimestep={this.setTimestep}
              {...this.state}
            />
          </div>
          <div className="secondary">
            {this.state.loading ? (
              <Loading marginTop={100} />
            ) : (
              <LakeSidebar language={language} {...this.state} />
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Lake;
