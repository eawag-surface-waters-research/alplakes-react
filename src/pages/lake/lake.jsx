import React, { Component } from "react";
import axios from "axios";
import Translate from "../../translations.json";
import NavBar from "../../components/navbar/navbar";
import Basemap from "../../components/leaflet/basemap";
import Loading from "../../components/loading/loading";
import URLS from "../../urls.json";
import { formatDate, formatTime, relativeDate, setCustomPeriod } from "./functions";
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
    var { period } = this.props;
    return (
      <div className="playback">
        <div className="play-controls"></div>
        <div className="start-date">{formatDate(period[0])}</div>
        <div className="slider"></div>
        <div className="end-date">{formatDate(period[1])}</div>
        <div className="settings"></div>
      </div>
    );
  }
}

class Lake extends Component {
  state = {
    datetime: Date.now(),
    period: [relativeDate(-6), relativeDate(0)],
    loading: true,
    metadata: {},
    layers: [],
    updates: [],
  };

  updated = () => {
    this.setState({ updates: [] });
  };

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
      <div className="main">
        <NavBar language={language} />
        <div className="primary">
          <div className="content">
            <div className="map-component">
              <div className="viewport">
                <Basemap
                  language={language}
                  {...this.state}
                  updated={this.updated}
                />
              </div>
              <div className="controls">
                <div className="legend"></div>
                <div className="playback">
                  <Playback language={language} {...this.state} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="secondary">
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
