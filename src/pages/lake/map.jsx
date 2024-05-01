import React, { Component } from "react";
//import axios from "axios";
import Basemap from "../../components/leaflet/basemap";
import InitialLoading from "../../components/loading/initialloading";
import Loading from "../../components/loading/loading";
import Legend from "../../components/legend/legend";
import PlayerControls from "../../components/playercontrols/playercontrols";
import MapSettings from "./mapsettings";
import CONFIG from "../../config.json";
import settings_icon from "../../img/options.png";
import {
  relativeDate,
  copy,
  getTransectAlplakesHydrodynamic,
  getProfileAlplakesHydrodynamic,
} from "./functions";
import SummaryGraph from "./summarygraph";
import MapLabels from "../../components/maplabels/maplabels";

class Map extends Component {
  state = {
    mapFullscreen: false,
    graphFullscreen: false,
    playControls: false,
    intialLoadId: "loading_" + Math.round(Math.random() * 100000),
    loadingId: "load_" + Math.round(Math.random() * 100000),
    mapId: "map_" + Math.round(Math.random() * 100000),
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
    firstActive: true,
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
  setLayers = (layers) => {
    this.setState({ layers });
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
    var { layers, updates, playControls } = this.state;
    var layer = layers.find((l) => l.id === id);
    if (!layer.active) {
      this.pause();
      layer.active = true;
      updates.push({ event: "addLayer", id: id });
      if ("playControls" in layer && layer.playControls) playControls = true;
      this.setState({
        layers,
        updates,
        selection: id,
        playControls,
      });
    }
  };
  removeLayer = (id) => {
    var { layers } = this.state;
    var layer = layers.find((l) => l.id === id);
    if (layer.active) {
      layer.active = false;
      var updates = [{ event: "removeLayer", id: id }];
      var selection = false;
      let stillActive = layers.filter((l) => l.active);
      if (stillActive.length > 0) selection = stillActive[0].id;
      this.setState({ layers, updates, selection });
    }
  };
  updateOptions = (id, options) => {
    var { layers, updates } = this.state;
    updates.push({ event: "updateLayer", id: id });
    layers.find((l) => l.id === id).displayOptions = options;
    this.setState({ layers, updates });
  };
  setSelection = (selection) => {
    if (selection !== this.state.selection) {
      this.setState({ selection });
    }
  };
  closeSelection = () => {
    this.setState({ selection: false });
  };
  setDepthAndPeriod = (depth, period) => {
    if (depth !== this.state.depth || period !== this.state.period) {
      this.setState({ depth, period });
    }
  };
  setDepth = (value) => {
    var { layers, depth, updates } = this.state;
    if (
      depth !== value &&
      layers.filter((l) => l.depth && l.active).length > 0
    ) {
      this.pause();
      depth = value;
      for (let layer of layers) {
        if (layer.depth && layer.active) {
          updates.unshift({ event: "removeLayer", id: layer.id });
          updates.push({ event: "addLayer", id: layer.id });
        }
      }
      this.setState({ updates, depth });
    }
  };
  setPeriod = (period) => {
    var { layers, updates } = this.state;
    if (period !== this.state.period) {
      var datetime = period[0];
      for (let layer of layers) {
        if (layer.active && layer.playControls) {
          updates.unshift({ event: "removeLayer", id: layer.id });
          updates.push({ event: "addLayer", id: layer.id });
        }
      }
      this.pause();
      this.setState({ updates, datetime, period });
    }
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
  loading = (message, id) => {
    var parent = document.getElementById(id);
    if (parent) {
      parent.querySelector("#loading-text").innerHTML = message;
      parent.style.visibility = "visible";
    }
  };

  loaded = (id) => {
    if (document.getElementById(id)) {
      document.getElementById(id).style.visibility = "hidden";
    }
  };
  error = (message) => {
    var parent = document.getElementById("error-modal");
    parent.innerHTML = message;
    parent.style.display = "block";
    setTimeout(this.removeError, 3000);
  };
  removeError = () => {
    document.getElementById("error-modal").style.display = "none";
  };
  getTransect = async (latlng, id) => {
    var { period, layers, loadingId } = this.state;
    var layer = layers.find((l) => l.id === id);
    var source = layer.sources[layer.source];
    var data = false;
    this.loading("Collect transect from server", loadingId);
    if (source.type === "alplakes_transect") {
      data = await getTransectAlplakesHydrodynamic(
        CONFIG.alplakes_api,
        source.model,
        layer.lake,
        period,
        latlng
      );
    }
    if (data) {
      layer.displayOptions.data = data;
      this.setState({ layers });
    } else {
      this.error(
        "Failed to collect transect from the server. Please try again."
      );
    }
    this.loaded(loadingId);
  };
  getProfile = async (latlng, id) => {
    var { period, layers, loadingId } = this.state;
    var layer = layers.find((l) => l.id === id);
    var source = layer.sources[layer.source];
    var data = false;
    this.loading("Collect profile from server", loadingId);
    if (source.type === "alplakes_profile") {
      data = await getProfileAlplakesHydrodynamic(
        CONFIG.alplakes_api,
        source.model,
        layer.lake,
        period,
        latlng
      );
    }
    if (data) {
      layer.displayOptions.data = data;
      this.setState({ layers });
    } else {
      this.error(
        "Failed to collect profile from the server. Please try again."
      );
    }
    this.loaded(loadingId);
  };

  componentDidUpdate(prevProps) {
    var { firstActive, updates, layers } = this.state;
    if (
      prevProps.active === false &&
      this.props.active === true &&
      firstActive
    ) {
      let update = false;
      for (let layer of layers) {
        let source = layer.sources[layer.source];
        if (layer.active && "onActivate" in source && source.onActivate) {
          updates.push({ event: "updateLayer", id: layer.id });
          update = true;
        }
      }
      if (update) {
        this.setState({ updates, firstActive: false });
      }
    }
  }

  async componentDidMount() {
    var { metadata, layers: globalLayers, module } = this.props;
    var {
      intialLoadId,
      period,
      depth,
      selection,
      playControls,
      datetime,
      average,
    } = this.state;
    var layers = copy(globalLayers);
    var updates = [{ event: "bounds" }];
    if ("default_depth" in metadata) depth = metadata.default_depth;
    for (let layer_id of module.defaults) {
      updates.push({ event: "addLayer", id: layer_id });
      let layer = layers.find((l) => l.id === layer_id);
      layer.active = true;
      if ("playControls" in layer && layer.playControls) playControls = true;
      selection = layer_id;
    }
    updates.push({ event: "initialLoad", id: intialLoadId });
    this.setState({
      updates,
      layers,
      depth,
      period,
      selection,
      playControls,
      datetime,
      average,
    });
  }
  render() {
    var { dark, language, metadata, module, active } = this.props;
    var {
      mapFullscreen,
      graphFullscreen,
      intialLoadId,
      loadingId,
      playControls,
      sidebar,
      selection,
      layers,
      mapId,
      datetime,
    } = this.state;
    return (
      <div className="module-component">
        <div className="plot">
          <div className={mapFullscreen ? "map fullscreen" : "map"}>
            <div className="initial-load" id={intialLoadId}>
              <InitialLoading />
            </div>
            <div className="layer-loading" id={loadingId}>
              <Loading />
            </div>
            <MapLabels
              module={module}
              layers={layers}
              selection={selection}
              language={language}
            />
            <div className="settings" onClick={this.openSidebar}>
              <img src={settings_icon} alt="Settings" />
            </div>
            <Basemap
              {...this.state}
              dark={dark}
              metadata={metadata}
              active={active}
              mapId={mapId}
              getProfile={this.getProfile}
              getTransect={this.getTransect}
              updated={this.updated}
              setLayers={this.setLayers}
              setDepthAndPeriod={this.setDepthAndPeriod}
              error={this.error}
            />
            <Legend
              {...this.state}
              language={language}
              playControls={playControls}
            />
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
          <div className={graphFullscreen ? "graph fullscreen" : "graph"}>
            <SummaryGraph
              active={active}
              selection={selection}
              language={language}
              dark={dark}
              layers={layers}
              datetime={datetime}
              updateOptions={this.updateOptions}
            />
          </div>
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
            active={active}
          />
        </div>
      </div>
    );
  }
}

export default Map;
