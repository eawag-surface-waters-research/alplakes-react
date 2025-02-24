import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet";
import axios from "axios";
import NavBar from "../../../components/navbar/navbar";
import CONFIG from "../../../config.json";
import {
  downloadData,
  collectMetadata,
  getProfileAlplakesHydrodynamic,
  getTransectAlplakesHydrodynamic,
} from "../functions/download";
import "./map.css";
import Basemap from "../../../components/leaflet/basemap";
import back from "../../../img/back.png";
import Sidebar from "./sidebar";
import Loading from "../../../components/loading/loading";
import NotFound from "../components/notfound";
import Translations from "../../../translations.json";

class Map extends Component {
  state = {
    id: "",
    layers: [],
    name: false,
    error: false,
    updates: [],
    period: false,
    datetime: false,
    depth: false,
    selection: false,
    sidebar: true,
    graphSelection: false,
    mapId: "map_" + Math.round(Math.random() * 100000),
  };

  loading = (text) => {
    const { mapId } = this.state;
    document.getElementById(`map_loading_${mapId}`).style.display = "flex";
    document.getElementById(`map_loading_text_${mapId}`).innerHTML = text;
  };

  loaded = () => {
    const { mapId } = this.state;
    document.getElementById(`map_loading_${mapId}`).style.display = "none";
  };

  updated = () => {
    this.setState({ updates: [] });
  };

  setSelection = (selection) => {
    if (this.state.selection === selection && window.innerWidth <= 500) {
      this.setState({ selection: false });
    } else {
      this.setState({ selection });
    }
  };

  closeSelection = () => {
    this.setState({ selection: false });
  };

  toggleSidebar = () => {
    this.setState({ sidebar: !this.state.sidebar });
  };

  selectMapGraph = (graphSelection) => {
    this.setState({ graphSelection });
  };

  getTransect = async (latlng, id) => {
    var { language } = this.props;
    var { period, layers } = this.state;
    var layer = layers.find((l) => l.id === id);
    var source = layer.sources[layer.source];
    this.loading(Translations.downloadingData[language]);
    var data = await getTransectAlplakesHydrodynamic(
      CONFIG.alplakes_api,
      source.model,
      source.key,
      period,
      latlng
    );
    if (data) {
      layer.graph = { ...layer.graph, transect_plot: data };
      var graphSelection = { id: layer.id, type: "transect_plot" };
      this.setState({ layers, graphSelection });
    } else {
      console.error(
        "Failed to collect transect from the server. Please try again."
      );
    }
    this.loaded();
  };
  getProfile = async (latlng, id) => {
    var { language } = this.props;
    var { period, layers } = this.state;
    var layer = layers.find((l) => l.id === id);
    var source = layer.sources[layer.source];
    this.loading(Translations.downloadingData[language]);
    var data = await getProfileAlplakesHydrodynamic(
      CONFIG.alplakes_api,
      source.model,
      source.key,
      period,
      latlng
    );
    if (data) {
      layer.graph = { ...layer.graph, profile_plot: data };
      var graphSelection = { id: layer.id, type: "profile_plot" };
      this.setState({ layers, graphSelection });
    } else {
      console.error(
        "Failed to collect profile from the server. Please try again."
      );
    }
    this.loaded();
  };

  addLayers = async (add, initial) => {
    var { language } = this.props;
    var {
      updates,
      mapId,
      layers,
      period,
      datetime,
      depth,
      selection,
      graphSelection,
    } = this.state;
    for (let layer_id of add) {
      layers.find((l) => l.id === layer_id).active = true;
    }
    this.loading(Translations.collectingMetadata[language]);
    ({ layers, graphSelection } = await collectMetadata(
      layers,
      graphSelection
    ));
    this.loading(Translations.downloadingData[language]);
    ({ updates, layers, period, datetime, depth } = await downloadData(
      add,
      layers,
      updates,
      period,
      datetime,
      depth,
      mapId,
      initial
    ));
    let active_layers = layers.filter((l) => l.active);
    if (active_layers.length > 0 && window.innerWidth > 500) {
      selection = add[add.length - 1];
    } else {
      selection = false;
    }
    window.history.replaceState(
      {},
      "",
      `?layers=${active_layers.map((l) => l.id).join(",")}`
    );
    this.loaded();
    this.setState({
      layers,
      updates,
      period,
      datetime,
      depth,
      selection,
      graphSelection,
    });
  };

  updateOptions = (id, type, options) => {
    var { layers, updates } = this.state;
    updates.push({ event: "updateLayer", id, type, options });
    layers.find((l) => l.id === id).displayOptions = options;
    this.setState({ layers, updates });
  };

  removeLayer = (id) => {
    var { layers, updates, graphSelection } = this.state;
    var layer = layers.find((l) => l.id === id);
    if (layer.active) {
      layer.active = false;

      updates.push({ event: "removeLayer", id: id });
      if (layers.filter((l) => l.active && l.playControls).length < 1) {
        updates.push({ event: "removePlay" });
      }
      var selection = false;
      let active_layers = layers.filter((l) => l.active);
      if (active_layers.length > 0 && window.innerWidth > 500)
        selection = active_layers[0].id;
      window.history.replaceState(
        {},
        "",
        `?layers=${active_layers.map((l) => l.id).join(",")}`
      );
      if ("graph" in layer) {
        delete layer.graph;
        let graph_layers = layers.filter((l) => "graph" in l);
        if (graph_layers.length > 0) {
          let graph_layer = graph_layers[0];
          graphSelection = {
            id: graph_layer.id,
            type: Object.keys(graph_layer.graph)[0],
          };
        } else {
          graphSelection = false;
        }
      }

      this.setState({ layers, updates, selection, graphSelection });
    }
  };

  setDepth = (value) => {
    var { layers, depth, updates } = this.state;
    if (
      depth !== value &&
      layers.filter((l) => l.depth && l.active).length > 0
    ) {
      var ids = [];
      depth = value;
      for (let layer of layers) {
        if (layer.depth && layer.active) {
          updates.push({ event: "removeLayer", id: layer.id });
          ids.push(layer.id);
        }
      }
      this.setState({ updates, depth }, () => this.addLayers(ids, false));
    }
  };

  setPeriod = (value) => {
    var { layers, updates, period, datetime } = this.state;
    if (period !== value) {
      period = value;
      datetime = value[0];
      var ids = [];
      for (let layer of layers) {
        if (layer.active && layer.playControls) {
          updates.push({ event: "removeLayer", id: layer.id });
          ids.push(layer.id);
        }
      }
      this.setState({ updates, datetime, period }, () =>
        this.addLayers(ids, false)
      );
    }
  };

  async componentDidMount() {
    window.scrollTo(0, 0);
    var { updates } = this.state;
    const url = new URL(window.location.href);
    const id = url.pathname.replace("map", "").replace(/[^a-zA-Z ]/g, "");
    const queryParams = new URLSearchParams(window.location.search);
    var active_layers = [];
    if (queryParams.get("layers")) {
      active_layers = queryParams
        .get("layers")
        .split(",")
        .filter((l) => l !== "");
    }
    try {
      var { data } = await axios.get(
        CONFIG.alplakes_bucket +
          `/static/website/metadata/${
            CONFIG.branch
          }/${id}_layers.json?timestamp=${
            Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
          }`
      );
      var layers = data.layers;
      updates.push({ event: "bounds", options: data.bounds });
      this.setState(
        {
          id,
          name: data.name,
          updates,
          layers,
        },
        () => this.addLayers(active_layers, true)
      );
    } catch (e) {
      console.error(e);
      this.setState({ error: true, id });
    }
  }

  render() {
    var {
      name,
      error,
      id,
      updates,
      mapId,
      layers,
      selection,
      period,
      depth,
      sidebar,
      graphSelection,
    } = this.state;
    var { language, dark } = this.props;
    var title = "";
    var documentTitle = "Alplakes";
    if (name) {
      documentTitle = name[language] + " | Alplakes";
      title = name[language];
    }
    return (
      <div className={sidebar ? "map sidebar-open" : "map"}>
        <Helmet>
          <title>{documentTitle}</title>
          <meta name="description" content="Alplakes map viewer." />
        </Helmet>
        <NavBar {...this.props} relative={true} />
        {error ? (
          <NotFound id={id} text={true} />
        ) : (
          <div className="layer-map">
            <NavLink to={`/${id}`}>
              <div className="back-button">
                <img src={back} alt="Back" />
              </div>
            </NavLink>
            <Sidebar
              sidebar={sidebar}
              toggleSidebar={this.toggleSidebar}
              layers={layers}
              title={title}
              period={period}
              depth={depth}
              language={language}
              selection={selection}
              setSelection={this.setSelection}
              closeSelection={this.closeSelection}
              addLayers={this.addLayers}
              updateOptions={this.updateOptions}
              removeLayer={this.removeLayer}
              setDepth={this.setDepth}
              setPeriod={this.setPeriod}
            />
            <Basemap
              updates={updates}
              updated={this.updated}
              language={language}
              dark={dark}
              mapId={mapId}
              permanentLabel={true}
              layers={layers}
              legend={true}
              graph={true}
              graphSelection={graphSelection}
              getTransect={this.getTransect}
              getProfile={this.getProfile}
              selectMapGraph={this.selectMapGraph}
            />
            <div className="map-loading" id={`map_loading_${mapId}`}>
              <div className="map-loading-inner">
                <Loading />
                <div className="loading-text" id={`map_loading_text_${mapId}`}>
                  {Translations.accessingLayers[language]}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Map;
