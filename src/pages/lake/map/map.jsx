import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet";
import axios from "axios";
import NavBar from "../../../components/navbar/navbar";
import Footer from "../../../components/footer/footer";
import CONFIG from "../../../config.json";
import Translations from "../../../translations.json";
import "./map.css";
import Basemap from "../../../components/leaflet/basemap";
import back from "../../../img/back.png";
import Sidebar from "./sidebar";

class Map extends Component {
  state = {
    id: "",
    layers: [],
    name: false,
    error: false,
    updates: {},
    mapId: "map_" + Math.round(Math.random() * 100000),
  };

  async componentDidMount() {
    window.scrollTo(0, 0);
    const url = new URL(window.location.href);
    const id = url.pathname.replace("map", "").replace(/[^a-zA-Z ]/g, "");
    try {
      var { data } = await axios.get(
        CONFIG.alplakes_bucket +
          `/static/website/metadata/${
            CONFIG.branch
          }/${id}_layers.json?timestamp=${
            Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
          }`
      );
      this.setState({
        id,
        name: data.name,
        layers: data.layers,
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: true, id });
    }
  }

  render() {
    var { name, error, id, updates, mapId, layers } = this.state;
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
          <Sidebar layers={layers} title={title}/>
          <Basemap
            updates={updates}
            updated={this.updated}
            dark={dark}
            mapId={mapId}
          />
        </div>
      </div>
    );
  }
}

export default Map;
