import React, { Component } from "react";
import axios from "axios";
import NavBar from "../../components/navbar/navbar";
import Sidebar from "./sidebar";
import Media from "./media";
import CONFIG from "../../config.json";
import {
  relativeDate,
  setCustomPeriod,
  closestIndex,
  interpolateData,
} from "./functions";
import "./lake.css";

class Lake extends Component {
  state = {
    lake_id: "",
    datetime: Date.now(),
    period: [relativeDate(-2).getTime(), relativeDate(3).getTime()],
    loading: true,
    clickblock: true,
    basemap: "default",
    metadata: {},
    layers: [],
    updates: [],
    play: false,
    timestep: 3600000,
    timeout: 100,
    error: "",
    temperature: 0,
    average: true,
    simpleline: { x: [0, 1], y: [0, 0] },
    updateSimpleline: false,
    selection: "add",
  };

  setSelection = (selection) => {
    this.setState({ selection });
  };

  setTemperature = (temperature) => {
    this.setState({ temperature });
  };

  setSimpleline = (simpleline) => {
    var { datetime } = this.state;
    var index = closestIndex(datetime, simpleline.x);
    this.setState({
      simpleline,
      updateSimpleline: true,
      temperature: Math.round(simpleline.y[index] * 10) / 10,
      datetime: simpleline.x[index],
    });
  };

  updated = () => {
    this.setState({ updates: [] });
  };

  unlock = () => {
    this.setState({ clickblock: false });
  };

  togglePlay = () => {
    this.setState({ play: !this.state.play });
  };

  setPeriod = (period) => {
    this.setState({ period });
  };

  setBasemap = (event) => {
    this.setState({ basemap: event.target.value });
  };

  setTimeout = (event) => {
    this.setState({ timeout: parseInt(event.target.value) });
  };

  setTimestep = (event) => {
    this.setState({ timestep: parseInt(event.target.value) });
  };

  nextStep = () => {
    var { play, timestep, datetime, period, updates, layers, simpleline } =
      this.state;
    if (!play) {
      if (datetime >= period[1]) {
        datetime = period[0];
        for (let layer of layers) {
          if (layer.active) {
            updates.push({ event: "updateLayer", id: layer.id });
          }
        }
        let temperature =
          Math.round(interpolateData(datetime, simpleline) * 10) / 10;
        this.setState({ datetime, updates, temperature });
      } else {
        datetime = datetime + timestep;
        for (let layer of layers) {
          if (layer.active) {
            updates.push({ event: "updateLayer", id: layer.id });
          }
        }
        let temperature =
          Math.round(interpolateData(datetime, simpleline) * 10) / 10;
        this.setState({ datetime, updates, temperature });
      }
    }
  };

  previousStep = () => {
    var { play, timestep, datetime, period, updates, layers, simpleline } =
      this.state;
    if (!play) {
      if (datetime <= period[0]) {
        datetime = period[1];
        for (let layer of layers) {
          if (layer.active) {
            updates.push({ event: "updateLayer", id: layer.id });
          }
        }
        let temperature =
          Math.round(interpolateData(datetime, simpleline) * 10) / 10;
        this.setState({ datetime, updates, temperature });
      } else {
        datetime = datetime - timestep;
        for (let layer of layers) {
          if (layer.active) {
            updates.push({ event: "updateLayer", id: layer.id });
          }
        }
        let temperature =
          Math.round(interpolateData(datetime, simpleline) * 10) / 10;
        this.setState({ datetime, updates, temperature });
      }
    }
  };

  keyDown = (event) => {
    if (event.key === " ") {
      this.togglePlay();
    } else if (event.key === "ArrowRight") {
      this.nextStep();
    } else if (event.key === "ArrowLeft") {
      this.previousStep();
    }
  };

  setDatetime = (event) => {
    var { updates, layers, simpleline } = this.state;
    for (var layer of layers) {
      if (layer.active) {
        updates.push({ event: "updateLayer", id: layer.id });
      }
    }
    var datetime = parseInt(event.target.getAttribute("alt"));
    var temperature =
      Math.round(interpolateData(datetime, simpleline) * 10) / 10;
    this.setState({ datetime, updates, temperature });
  };

  removeLayer = (id) => {
    var { layers } = this.state;
    var layer = layers.find((l) => l.id === id);
    if (layer.active) {
      layer.active = false;
      var updates = [{ event: "removeLayer", id: id }];
      this.setState({ layers, updates });
    }
  };

  componentDidUpdate() {
    var {
      play,
      timestep,
      datetime,
      timeout,
      period,
      updates,
      layers,
      simpleline,
    } = this.state;
    if (play) {
      if (datetime >= period[1]) {
        datetime = period[0];
        for (var layer of layers) {
          if (layer.active) {
            updates.push({ event: "updateLayer", id: layer.id });
          }
        }
        var temperature =
          Math.round(interpolateData(datetime, simpleline) * 10) / 10;
        this.setState({ datetime, updates, temperature });
      } else {
        setTimeout(() => {
          datetime = datetime + timestep;
          for (var layer of layers) {
            if (layer.active) {
              updates.push({ event: "updateLayer", id: layer.id });
            }
          }
          var temperature =
            Math.round(interpolateData(datetime, simpleline) * 10) / 10;
          this.setState({ datetime, updates, temperature });
        }, timeout);
      }
    }
  }

  async componentDidMount() {
    document.addEventListener("keydown", this.keyDown, false);
    var { period } = this.state;
    const url = window.location.href.split("/");
    const lake_id = url[url.length - 1].split("?")[0];
    try {
      const { data: metadata } = await axios.get(
        CONFIG.alplakes_bucket + `${lake_id}.json`
      );
      var updates = [{ event: "bounds" }];
      for (var layer of metadata.layers) {
        if (layer.active) {
          layer.active = true;
          updates.push({ event: "addLayer", id: layer.id });
        }
      }
      try {
        if ("customPeriod" in metadata) {
          period = await setCustomPeriod(metadata.customPeriod, period);
        }
      } catch (e) {
        console.error(e);
        this.setState({ error: "api", loading: false, lake_id });
      }

      this.setState({
        metadata,
        loading: false,
        layers: metadata.layers,
        updates,
        period,
        lake_id,
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: "name", lake_id });
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.keyDown, false);
  }

  render() {
    var { metadata, lake_id, loading, clickblock } = this.state;
    var { language, dark } = this.props;
    if ("name" in metadata) document.title = metadata.name[language];
    return (
      <div className="lake">
        <NavBar {...this.props} />
        <div className="content">
          {clickblock && <div className="click-block" />}
          <div className="primary">
            <Media
              language={language}
              togglePlay={this.togglePlay}
              setDatetime={this.setDatetime}
              updated={this.updated}
              unlock={this.unlock}
              nextStep={this.nextStep}
              setTimeout={this.setTimeout}
              setTimestep={this.setTimestep}
              setTemperature={this.setTemperature}
              setSimpleline={this.setSimpleline}
              setBasemap={this.setBasemap}
              {...this.state}
            />
          </div>
          <div className="secondary">
            {!loading && (
              <Sidebar
                language={language}
                {...this.state}
                dark={dark}
                removeLayer={this.removeLayer}
                setSelection={this.setSelection}
                setPeriod={this.setPeriod}
              />
            )}
            {this.state.error === "name" && (
              <div className="error">
                <div className="error-code">404</div>
                Sorry the lake id
                <div className="error-id">{lake_id} </div> could not be found.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Lake;
