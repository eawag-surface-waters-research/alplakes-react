import React, { Component, createRef } from "react";
import axios from "axios";
import CONFIG from "../../../config.json";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";
import CatchmentMap from "../../../components/leaflet/catchment";

class Nutrients extends Component {
  state = {
    hasBeenVisible: false,
    mapId: "map_" + Math.round(Math.random() * 100000),
    polygon: false,
    points: false,
    selected: "total_phosphorus",
    wmts: {
      dissolved_phosphorus: {
        url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.bafu.gewaesserschutz-diffuse_eintraege_phosphor/default/current/3857/{z}/{x}/{y}.png",
        name: "Dissolved Phosphorus",
        options: {
          format: "image/png",
          subdomains: ["1", "2", "3", "4"],
          maxZoom: 13,
          attribution: "© swisstopo",
          lookup: {
            "0,97,0,255": "<0.1 [kg / ha * a]",
            "60,128,0,255": "0.1 - 0.2 [kg / ha * a]",
            "107,161,0,255": "0.2 - 0.4 [kg / ha * a]",
            "255,255,0,255": "0.4 - 0.6 [kg / ha * a]",
            "255,170,0,255": "0.6 - 0.8 [kg / ha * a]",
            "255,84,0,255": "0.8 - 1.0 [kg / ha * a]",
            "255,0,0,255": "1.0 - 1.2 [kg / ha * a]",
            "189,0,0,255": "1.2 - 1.4 [kg / ha * a]",
            "133,0,0,255": "1.4 - 1.8 [kg / ha * a]",
            "82,0,0,255": ">1.8 [kg / ha * a]",
          },
        },
      },
      total_phosphorus: {
        url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.bafu.gewaesserschutz-diffuse_eintraege_gesamt_phosphor/default/current/3857/{z}/{x}/{y}.png",
        name: "Total Phosphorus",
        options: {
          format: "image/png",
          subdomains: ["1", "2", "3", "4"],
          maxZoom: 13,
          attribution: "© swisstopo",
          lookup: {
            "0,97,0,255": "<0.1 [kg / ha * a]",
            "60,128,0,255": "0.1 - 0.2 [kg / ha * a]",
            "107,161,0,255": "0.2 - 0.4 [kg / ha * a]",
            "255,255,0,255": "0.4 - 0.6 [kg / ha * a]",
            "255,170,0,255": "0.6 - 0.8 [kg / ha * a]",
            "255,84,0,255": "0.8 - 1.0 [kg / ha * a]",
            "255,0,0,255": "1.0 - 1.2 [kg / ha * a]",
            "189,0,0,255": "1.2 - 1.4 [kg / ha * a]",
            "133,0,0,255": "1.4 - 1.8 [kg / ha * a]",
            "82,0,0,255": ">1.8 [kg / ha * a]",
          },
        },
      },
      total_nitrogen: {
        url: "https://wmts{s}.geo.admin.ch/1.0.0/ch.bafu.gewaesserschutz-diffuse_eintraege_stickstoff/default/current/3857/{z}/{x}/{y}.png",
        name: "Total Nitrogen",
        options: {
          format: "image/png",
          subdomains: ["1", "2", "3", "4"],
          maxZoom: 13,
          attribution: "© swisstopo",
          lookup: {
            "0,97,0,255": "<1 [kg / ha * a]",
            "60,128,0,255": "1 - 5 [kg / ha * a]",
            "107,161,0,255": "5 - 10 [kg / ha * a]",
            "164,196,0,255": "10 - 20 [kg / ha * a]",
            "223,235,0,255": "20 - 30 [kg / ha * a]",
            "255,234,0,255": "30 - 40 [kg / ha * a]",
            "255,187,0,255": "40 - 50 [kg / ha * a]",
            "255,145,0,255": "50 - 60 [kg / ha * a]",
            "255,98,0,255": "60 - 70 [kg / ha * a]",
            "255,34,0,255": ">70 [kg / ha * a]",
          },
        },
      },
    },
  };

  ref = createRef();

  updated = () => {
    this.setState({ updates: [] });
  };

  setSelected = (selected) => {
    this.setState({ selected });
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
    var { data: points } = await axios.get(
      CONFIG.alplakes_bucket + `/static/discharge/${id}.json`
    );
    const polygon = this.extractPolygonFromGeoJSON(data);
    this.setState({ polygon, points });
  };

  render() {
    var { mapId, polygon, points, wmts, selected } = this.state;
    var { dark, language } = this.props;
    return (
      <div className="nutrients subsection" ref={this.ref}>
        <h3>
          {Translations.nutrientInputs[language]}
          <Information
            information={Translations.nutrientInputsText[language]}
          />
        </h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            {polygon && (
              <CatchmentMap
                dark={dark}
                mapId={mapId}
                polygon={polygon}
                points={points}
                wmts_url={wmts[selected].url}
                options={wmts[selected].options}
                maxZoom={13}
              />
            )}
            <div className="nutrient-legend">
              <div className="circle" /> UWWTD Discharge Points
            </div>
            <div className="layer-selection">
              {Object.keys(wmts).map((w) => (
                <div
                  className={
                    w === selected ? "layer-option selected" : "layer-option"
                  }
                  key={w}
                  onClick={() => this.setSelected(w)}
                >
                  {wmts[w].name}
                </div>
              ))}
            </div>
          </div>
          <div className="map-sidebar-right">
            Phosphorus and Nitrogen inputs into water bodies (2020) are available for Switzerland.
          </div>
        </div>
      </div>
    );
  }
}

export default Nutrients;
