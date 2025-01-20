import React, { Component } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import NavBar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import CONFIG from "../../config.json";
import Translations from "../../translations.json";
import "./map.css";
import Basemap from "../../components/leaflet/basemap";

class Map extends Component {
  state = {
    id: "",
    metadata: {},
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
          `/static/website/metadata/${CONFIG.branch}/${id}.json?timestamp=${
            Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
          }`
      );
      this.setState({
        id,
        metadata: data,
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: true, id });
    }
  }

  render() {
    var { metadata, error, id, updates, mapId } = this.state;
    var { language, dark } = this.props;
    var title = "";
    var documentTitle = "Alplakes";
    if ("name" in metadata) {
      documentTitle = metadata.name[language] + " Map | Alplakes";
      title = metadata.name[language];
    }
    return (
      <div className="map">
        <Helmet>
          <title>{documentTitle}</title>
          <meta name="description" content="Alplakes map viewer." />
        </Helmet>
        <NavBar {...this.props} relative={true} />
        <div className="layer-map">
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
