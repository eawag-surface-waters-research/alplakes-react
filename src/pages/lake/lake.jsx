import React, { Component } from "react";
import axios from "axios";
import Translate from "../../translations.json";
import NavBar from "../../components/navbar/navbar";
import Basemap from "../../components/leaflet/basemap";
import Loading from "../../components/loading/loading";
import next from "../../img/next.svg";
import settings from "../../img/settings.svg";
import URLS from "../../urls.json";
import {
  formatDate,
  formatTime,
  relativeDate,
  setCustomPeriod,
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
          <div className="date">{formatDate(this.props.datetime)}</div>
          <div className="time">{formatTime(this.props.datetime)}</div>
        </div>
      </div>
    );
  }
}

class Playback extends Component {
  state = {};
  render() {
    var { period, play, togglePlay, setDatetime, datetime, timestep } =
      this.props;
    return (
      <React.Fragment>
        <div className="gradient" />
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
              <button>
                <div
                  className={
                    play ? "play-pause-icon paused" : "play-pause-icon"
                  }
                  onClick={togglePlay}
                ></div>
              </button>
            </div>
            <div className="next-frame clickable-button">
              <button>
                <img src={next} alt="next"/>
              </button>
            </div>
            <div className="current-datetime"></div>
            <div className="selected-period"></div>
            <div className="settings clickable-button">
              <button>
                <img src={settings} alt="settings"/>
              </button>
            </div>
          </div>
        </div>
      </React.Fragment>
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
  };

  updated = () => {
    this.setState({ updates: [] });
  };

  togglePlay = () => {
    this.setState({ play: !this.state.play });
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
    const lake_id = window.location.href.split("/lake/")[1].split("?")[0];
    try {
      const { data: metadata } = await axios.get(
        URLS.metadata + `${lake_id}.json`
      );
      var updates = [{ event: "bounds" }];
      for (var layer of metadata.layers) {
        if (layer.active === "true") {
          updates.push({ event: "addLayer", id: layer.id });
        }
      }
      if ("customPeriod" in metadata) {
        period = await setCustomPeriod(metadata.customPeriod, period);
      }
      this.setState({
        metadata,
        loading: false,
        layers: metadata.layers,
        updates,
        period,
      });
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    var { language } = this.props;
    document.title = Translate.title[language];
    return (
      <div className="lake">
        <NavBar language={language} />
        <div className="map-component">
          <div className="viewport">
            <Basemap
              language={language}
              {...this.state}
              updated={this.updated}
            />
          </div>
          <div className="controls">
            <Playback
              language={language}
              togglePlay={this.togglePlay}
              setDatetime={this.setDatetime}
              {...this.state}
            />
          </div>
        </div>
        <div className="sidebar">
          {this.state.loading ? (
            <Loading marginTop={100} />
          ) : (
            <LakeSidebar language={language} {...this.state} />
          )}
        </div>
      </div>
    );
  }
}

export default Lake;
