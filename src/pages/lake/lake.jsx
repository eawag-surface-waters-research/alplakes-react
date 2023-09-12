import React, { Component } from "react";
import axios from "axios";
import NavBar from "../../components/navbar/navbar";
import Sidebar from "./sidebar";
import Media from "./media";
import ReportIssue from "./reportissue";
import CONFIG from "../../config.json";
import {
  relativeDate,
  getFrozen,
  setCustomPeriod,
  closestIndex,
  interpolateData,
} from "./functions";
import "./lake.css";

class Lake extends Component {
  state = {
    lake_id: "",
    depth: "",
    depths: [],
    datetime: Date.now(),
    maxDate: Date.now(),
    minDate: new Date(2010),
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
    fullscreen: false,
    sidebarOpen: false,
    bucket: true,
    frozen: false,
  };

  setSelection = (newSelection) => {
    this.setState({ selection: newSelection });
  };

  openSidebar = () => {
    this.setState({ sidebarOpen: true });
  };

  closeSidebar = () => {
    this.setState({ sidebarOpen: false });
  };

  toggleFullscreen = () => {
    this.setState({ fullscreen: !this.state.fullscreen }, () => {
      window.dispatchEvent(new Event("resize"));
    });
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

  lock = () => {
    this.setState({ clickblock: true });
  };

  unlock = () => {
    this.setState({ clickblock: false, bucket: false });
  };

  closeFrozen = () => {
    this.setState({ frozen: false });
  };

  togglePlay = () => {
    this.setState({ play: !this.state.play });
  };

  startAnimation = () => {
    setTimeout(() => {
      this.setState({ play: true });
    }, 2000);
  };

  setPeriod = (period) => {
    var { layers, updates, play } = this.state;
    if (period !== this.state.period) {
      var datetime = period[0];
      var clickblock;
      for (let layer of layers) {
        if (layer.active && layer.properties.period) {
          clickblock = true;
          updates.unshift({ event: "removeLayer", id: layer.id });
          updates.push({ event: "addLayer", id: layer.id });
          if (play) {
            updates.push({ event: "play" });
          }
        }
      }
      this.setState({ play: false, updates, datetime, clickblock, period });
    }
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
    var int = parseInt(JSON.parse(JSON.stringify(event.target.value)));
    var play = JSON.parse(JSON.stringify(this.state.play));
    this.setState({ play: false }, () => {
      var { updates, layers, simpleline } = this.state;
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
      var temperature =
        Math.round(interpolateData(datetime, simpleline) * 10) / 10;
      this.setState({ datetime, updates, temperature });
    });
  };

  setDepth = (event) => {
    var { layers, depth, updates, play } = this.state;
    if (
      depth !== event.target.value &&
      layers.filter((l) => l.properties.depth && l.active).length > 0
    ) {
      depth = event.target.value;
      for (let layer of layers) {
        if (layer.properties.depth && layer.active) {
          updates.unshift({ event: "removeLayer", id: layer.id });
          updates.push({ event: "addLayer", id: layer.id });
          if (play) {
            updates.push({ event: "play" });
          }
        }
      }
      this.setState({ play: false, updates, depth, clickblock: true });
    }
  };

  clearOverlays = () => {
    var { updates } = this.state;
    updates.push({ event: "clear" });
    this.setState({ updates });
  };

  addLayer = (id) => {
    var { layers, updates } = this.state;
    var layer = layers.find((l) => l.id === id);
    if (!layer.active) {
      layer.active = true;
      updates.push({ event: "addLayer", id: id });
      this.setState({
        play: false,
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
      this.setState({ layers, updates, selection: "add" });
    }
  };

  updateOptions = (id, options) => {
    var { layers, updates } = this.state;
    updates.push({ event: "updateLayer", id: id });
    layers.find((l) => l.id === id).properties.options = options;
    this.setState({ layers, updates });
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
          if (this.state.play) {
            datetime = datetime + timestep;
            for (var layer of layers) {
              if (layer.active) {
                updates.push({ event: "updateLayer", id: layer.id });
              }
            }
            var temperature =
              Math.round(interpolateData(datetime, simpleline) * 10) / 10;
            this.setState({ datetime, updates, temperature });
          }
        }, timeout);
      }
    }
  }

  async componentDidMount() {
    document.addEventListener("keydown", this.keyDown, false);
    var { period, minDate, maxDate, frozen } = this.state;
    const url = window.location.href.split("/");
    const lake_id = url[url.length - 1]
      .split("?")[0]
      .replace(/[^a-zA-Z ]/g, "");
    try {
      const { data: metadata } = await axios.get(
        CONFIG.alplakes_bucket + `/static/website/metadata/${lake_id}.json`
      );
      var updates = [{ event: "bounds" }];
      for (var layer of metadata.layers) {
        if (layer.active) {
          layer.active = true;
          updates.push({ event: "addLayer", id: layer.id });
        }
      }
      updates.push({ event: "play" });
      var depth = metadata.depth;
      var depths = [depth];
      try {
        if ("customPeriod" in metadata) {
          ({ period, minDate, maxDate, depth, depths } = await setCustomPeriod(
            metadata.customPeriod,
            period,
            minDate,
            maxDate,
            depth,
            depths
          ));
        }
      } catch (e) {
        console.error(e);
        alert(
          "Failed to collect data from the API, please check your internet connection."
        );
        this.setState({
          error: "api",
          loading: false,
          lake_id,
          clickblock: false,
        });
      }
      try {
        if ("ice" in metadata && metadata["ice"]) {
          frozen = await getFrozen(lake_id);
        }
      } catch (e) {
        console.error(e);
        alert(
          "Failed to collect data from the API, please check your internet connection."
        );
        this.setState({
          error: "api",
          loading: false,
          lake_id,
          clickblock: false,
        });
      }
      this.setState({
        metadata,
        loading: false,
        layers: metadata.layers,
        updates,
        period,
        lake_id,
        depth,
        minDate,
        maxDate,
        depths,
        frozen,
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
    var { metadata, lake_id, loading, clickblock, fullscreen, sidebarOpen } =
      this.state;
    var { language, dark } = this.props;
    if ("name" in metadata) document.title = metadata.name[language];
    return (
      <div className="lake">
        <NavBar {...this.props} />
        <div className="content">
          {clickblock && <div className="click-block" />}
          <div className={fullscreen ? "primary fullscreen" : "primary"}>
            <ReportIssue metadata={metadata} language={language} />
            <Media
              language={language}
              togglePlay={this.togglePlay}
              setDatetime={this.setDatetime}
              updated={this.updated}
              lock={this.lock}
              unlock={this.unlock}
              nextStep={this.nextStep}
              setTimeout={this.setTimeout}
              setTimestep={this.setTimestep}
              setTemperature={this.setTemperature}
              setSimpleline={this.setSimpleline}
              setBasemap={this.setBasemap}
              toggleFullscreen={this.toggleFullscreen}
              clearOverlays={this.clearOverlays}
              openSidebar={this.openSidebar}
              clickblock={clickblock}
              startAnimation={this.startAnimation}
              closeFrozen={this.closeFrozen}
              {...this.state}
            />
          </div>
          <div className="secondary">
            {!loading && (
              <Sidebar
                language={language}
                {...this.state}
                dark={dark}
                addLayer={this.addLayer}
                removeLayer={this.removeLayer}
                setSelection={this.setSelection}
                setPeriod={this.setPeriod}
                setDepth={this.setDepth}
                updateOptions={this.updateOptions}
                closeSidebar={this.closeSidebar}
                sidebarOpen={sidebarOpen}
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
