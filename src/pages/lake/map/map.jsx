import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet";
import axios from "axios";
import NavBar from "../../../components/navbar/navbar";
import Footer from "../../../components/footer/footer";
import CONFIG from "../../../config.json";
import { createUpdates } from "../functions/download";
import Translations from "../../../translations.json";
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
    mapId: "map_" + Math.round(Math.random() * 100000),
  };

  updated = () => {
    this.setState({ updates: [] });
  };

  processUpdates = async (add, update, remove) => {
    var { updates, mapId } = this.state;
    await new Promise((r) => setTimeout(r, 1000));
    document.getElementById(`map_loading_${mapId}`).innerHTML =
      "Collecting metadata";
    await new Promise((r) => setTimeout(r, 1000));
    document.getElementById(`map_loading_${mapId}`).innerHTML =
      "Downloading data";
    await new Promise((r) => setTimeout(r, 1000));
    this.setState({ loading: false });
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
        () => this.processUpdates()
      );
    } catch (e) {
      console.error(e);
      this.setState({ error: true, id });
    }
  }

  render() {
    var { name, error, loading, id, updates, mapId, layers } = this.state;
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
          <Sidebar layers={layers} title={title} language={language} />
          <Basemap
            updates={updates}
            updated={this.updated}
            dark={dark}
            mapId={mapId}
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
