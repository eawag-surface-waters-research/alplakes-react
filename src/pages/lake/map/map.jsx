import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet";
import axios from "axios";
import NavBar from "../../../components/navbar/navbar";
import CONFIG from "../../../config.json";
import { downloadData, collectMetadata } from "../functions/download";
import "./map.css";
import Basemap from "../../../components/leaflet/basemap";
import back from "../../../img/back.png";
import Sidebar from "./sidebar";
import Loading from "../../../components/loading/loading";

class Map extends Component {
  state = {
    id: "",
    layers: [],
    name: false,
    error: false,
    updates: [],
    loading: true,
    period: false,
    datetime: false,
    depth: false,
    selection: false,
    mapId: "map_" + Math.round(Math.random() * 100000),
  };

  updated = () => {
    this.setState({ updates: [] });
  };

  removeLayer = (id) => {
    var { layers, updates } = this.state;
    var layer = layers.find((l) => l.id === id);
    if (layer.active) {
      layer.active = false;
      updates.push({ event: "removeLayer", id: id });
      if (layers.filter((l) => l.active && l.playControls).length < 1) {
        updates.push({ event: "removePlay" });
      }
      var selection = false;
      let stillActive = layers.filter((l) => l.active);
      if (stillActive.length > 0) selection = stillActive[0].id;
      this.setState({ layers, updates, selection });
    }
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

  initialLoad = async (add) => {
    var { updates, mapId, layers, period, datetime, depth, selection } =
      this.state;
    document.getElementById(`map_loading_${mapId}`).innerHTML =
      "Collecting metadata";
    layers = await collectMetadata(layers);
    document.getElementById(`map_loading_${mapId}`).innerHTML =
      "Downloading data";
    ({ updates, layers, period, datetime, depth } = await downloadData(
      add,
      layers,
      updates,
      period,
      datetime,
      depth,
      true
    ));
    let active_layers = layers.filter((l) => l.active);
    if (active_layers.length > 0 && window.innerWidth > 500) {
      selection = layers[0].id;
    }
    this.setState({
      loading: false,
      layers,
      updates,
      period,
      datetime,
      depth,
      selection,
    });
  };

  async componentDidMount() {
    window.scrollTo(0, 0);
    var { updates } = this.state;
    const url = new URL(window.location.href);
    const id = url.pathname.replace("map", "").replace(/[^a-zA-Z ]/g, "");
    const queryParams = new URLSearchParams(window.location.search);
    const active_layers = queryParams.get("layers").split(",");
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
      for (let layer_id of active_layers) {
        layers.find((l) => l.id === layer_id).active = true;
      }
      updates.push({ event: "bounds", options: data.bounds });
      this.setState(
        {
          id,
          name: data.name,
          updates,
          layers,
        },
        () => this.initialLoad(active_layers)
      );
    } catch (e) {
      console.error(e);
      this.setState({ error: true, id });
    }
  }

  render() {
    var { name, error, loading, id, updates, mapId, layers, selection } =
      this.state;
    var { language, dark } = this.props;
    var title = "";
    var documentTitle = "Alplakes";
    if (name) {
      documentTitle = name[language] + " | Alplakes";
      title = name[language];
    }
    return (
      <div className="map">
        <Helmet>
          <title>{documentTitle}</title>
          <meta name="description" content="Alplakes map viewer." />
        </Helmet>
        <NavBar {...this.props} relative={true} />
        <div className="layer-map">
          <NavLink to={`/${id}`}>
            <div className="back-button">
              <img src={back} alt="Back" />
            </div>
          </NavLink>
          <Sidebar
            layers={layers}
            title={title}
            language={language}
            selection={selection}
            setSelection={this.setSelection}
            removeLayer={this.removeLayer}
            closeSelection={this.closeSelection}
          />
          <Basemap
            updates={updates}
            updated={this.updated}
            language={language}
            dark={dark}
            mapId={mapId}
            permanentLabel={true}
          />
          <div className={loading ? "map-loading" : "map-loading closed"}>
            <div className="map-loading-inner">
              <Loading />
              <div className="loading-text" id={`map_loading_${mapId}`}>
                Accessing layers
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Map;
