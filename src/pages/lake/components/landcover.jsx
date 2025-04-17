import React, { Component, createRef } from "react";
import axios from "axios";
import CONFIG from "../../../config.json";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";
import CatchmentMap from "../../../components/leaflet/catchment";

class LandCover extends Component {
  state = {
    hasBeenVisible: false,
    mapId: "map_" + Math.round(Math.random() * 100000),
    polygon: false,
    wmts: {
      url: "https://services.terrascope.be/wmts/v2",
      options: {
        layer: "WORLDCOVER_2021_MAP",
        tilematrixset: "EPSG:3857",
        format: "image/png",
        attribution: "© ESA WorldCover 2021, produced by VITO",
      },
    },
  };

  ref = createRef();

  updated = () => {
    this.setState({ updates: [] });
  };

  extractPolygonFromGeoJSON = (geojson) => {
    if (
      geojson.type === "FeatureCollection" &&
      geojson.features &&
      geojson.features.length > 0
    ) {
      geojson = geojson.features[0];
    }
    if (geojson.type === "Feature" && geojson.geometry) {
      geojson = geojson.geometry;
    }
    if (
      geojson.type === "Polygon" &&
      geojson.coordinates &&
      geojson.coordinates.length > 0
    ) {
      return geojson.coordinates[0].map((coord) => [coord[1], coord[0]]);
    } else if (
      geojson.type === "MultiPolygon" &&
      geojson.coordinates &&
      geojson.coordinates.length > 0
    ) {
      return geojson.coordinates[0][0].map((coord) => [coord[1], coord[0]]);
    }
  };

  componentDidMount() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.state.hasBeenVisible) {
          this.setState({ hasBeenVisible: true }, this.onVisible);
          this.observer.disconnect();
        }
      },
      { threshold: 0.0 }
    );

    if (this.ref.current) {
      this.observer.observe(this.ref.current);
    }
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  onVisible = async () => {
    const { id } = this.props;
    var { data } = await axios.get(
      CONFIG.alplakes_bucket + `/static/catchments/${id}.json`
    );
    const polygon = this.extractPolygonFromGeoJSON(data);
    this.setState({ polygon });
  };

  render() {
    var { mapId, polygon, wmts } = this.state;
    var { dark, language } = this.props;
    return (
      <div className="water-temperature subsection" ref={this.ref}>
        <h3>
          {Translations.landcover[language]}
          <Information information={Translations.landcoverText[language]} />
        </h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            {polygon && (
              <CatchmentMap
                dark={dark}
                mapId={mapId}
                polygon={polygon}
                wmts={wmts}
              />
            )}
          </div>
          <div className="map-sidebar-right"></div>
        </div>
      </div>
    );
  }
}

export default LandCover;
