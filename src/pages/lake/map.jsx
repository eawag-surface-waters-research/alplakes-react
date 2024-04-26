import React, { Component } from "react";
import axios from "axios";
import Basemap from "../../components/leaflet/basemap";
import Loading from "../../components/loading/loading";
import Legend from "../../components/legend/legend";
import PlayerControls from "../../components/playercontrols/playercontrols";
import MapSettings from "./mapsettings";
import CONFIG from "../../config.json";
import settings_icon from "../../img/options.png";
import {
  relativeDate,
  copy,
  customAlplakesPeriod,
  latestSencastImage,
  getTransectAlplakesHydrodynamic,
  getProfileAlplakesHydrodynamic,
} from "./functions";

class Map extends Component {
  state = {
    mapFullscreen: false,
    graphFullscreen: false,
    playControls: false,
    intialLoadId: "loading_" + Math.round(Math.random() * 100000),
    updates: [],
    legend: true,
    basemap: "default",
    timestep: 3600000,
    timeout: 0,
    play: false,
    datetime: Date.now(),
    depth: 1,
    period: [relativeDate(-2).getTime(), relativeDate(3).getTime()],
    layers: [],
    selection: false,
    sidebar: false,
  };
  updated = () => {
    this.setState({ updates: [] });
  };
  openSidebar = () => {
    this.setState({ sidebar: true });
  };
  closeSidebar = () => {
    this.setState({ sidebar: false });
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
  toggleMapFullscreen = () => {
    this.setState({ mapFullscreen: !this.state.mapFullscreen }, () => {
      window.dispatchEvent(new Event("resize"));
    });
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
          if (layer.active && "playControls" in layer && layer.playControls) {
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
    layers.find((l) => l.id === id).displayOptions = options;
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
      layers.filter((l) => l.depth && l.active).length > 0
    ) {
      this.pause();
      depth = event.target.value;
      for (let layer of layers) {
        if (layer.depth && layer.active) {
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
        if (layer.active && layer.playControls) {
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
  async componentDidMount() {
    var { metadata, layers: globalLayers, module } = this.props;
    var { intialLoadId, period, depth, selection, playControls } = this.state;
    var layers = copy(globalLayers);
    var updates = [{ event: "bounds" }];
    if ("default_depth" in metadata) depth = metadata.default_depth;
    for (var layer_id of module.defaults) {
      updates.push({ event: "addLayer", id: layer_id });
      let layer = layers.find((l) => l.id === layer_id);
      layer.active = true;
      if ("playControls" in layer && layer.playControls) playControls = true;
      selection = layer_id;
      let source = layer.sources[layer.source];
      if ("initialLoad" in source) {
        if (source.initialLoad === "customAlplakesPeriod") {
          ({ layer, period, depth } = await customAlplakesPeriod(layer, depth));
        } else if (source.initialLoad === "latestSencastImage") {
          layer = await latestSencastImage(layer);
        }
      }
    }
    updates.push({ event: "initialLoad", id: intialLoadId });
    this.setState({ updates, layers, depth, period, selection, playControls });
  }
  render() {
    var { dark, language, metadata } = this.props;
    var {
      mapFullscreen,
      graphFullscreen,
      intialLoadId,
      playControls,
      sidebar,
    } = this.state;
    return (
      <div className="module-component">
        <div className="plot">
          <div className={mapFullscreen ? "map fullscreen" : "map"}>
            <div className="initial-load" id={intialLoadId}>
              <Loading />
            </div>
            <div className="settings" onClick={this.openSidebar}>
              <img src={settings_icon} alt="Settings" />
            </div>
            <Basemap
              {...this.state}
              dark={dark}
              updated={this.updated}
              metadata={metadata}
            />
            <Legend {...this.state} language={language} playControls={playControls}/>
            {playControls && (
              <PlayerControls
                {...this.state}
                language={language}
                setDatetime={this.setDatetime}
                toggleFullscreen={this.toggleMapFullscreen}
                togglePlay={this.togglePlay}
                setTimestep={this.setTimestep}
                setSpeed={this.setSpeed}
                setBasemap={this.setBasemap}
                toggleLegend={this.toggleLegend}
              />
            )}
          </div>
          <div className={graphFullscreen ? "graph fullscreen" : "graph"}></div>
        </div>
        <div className={sidebar ? "sidebar open" : "sidebar"}>
          <div className="close-sidebar" onClick={this.closeSidebar}>
            &times;
          </div>
          <MapSettings
            {...this.state}
            language={language}
            dark={dark}
            addLayer={this.addLayer}
            removeLayer={this.removeLayer}
            updateOptions={this.updateOptions}
            setSelection={this.setSelection}
            setPeriod={this.setPeriod}
            setDepth={this.setDepth}
          />
        </div>
      </div>
    );
  }
}

export default Map;
