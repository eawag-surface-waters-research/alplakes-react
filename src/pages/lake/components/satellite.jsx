import React, { Component, createRef } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import CONFIG from "../../../config.json";
import { timeAgo } from "../functions/general";
import Basemap from "../../../components/leaflet/basemap";
import Information from "../../../components/information/information";

class Satellite extends Component {
  state = {
    hasBeenVisible: false,
    updates: [],
    mapId: "map_" + Math.round(Math.random() * 100000),
    image: {},
  };

  ref = createRef();

  satelliteStringToDate = (date) => {
    return new Date(
      `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${date.slice(
        9,
        11
      )}:${date.slice(11, 13)}:00.000+00:00`
    );
  };

  imageProperties = (file) => {
    let parts = file.replace("_lowres", "").split("_");
    const lake = parts[parts.length - 1].replace(".tif", "");
    var satellite = "sentinel3";
    if (file.includes("COLLECTION_")) satellite = "collection";
    if (file.includes("_S2")) satellite = "sentinel2";
    return { satellite, lake };
  };

  onVisible = async () => {
    var { parameters } = this.props;
    var { updates, image } = this.state;
    for (let i = 0; i < parameters.metadata.length; i++) {
      var { data } = await axios.get(
        CONFIG.sencast_bucket + parameters.metadata[i]
      );
      if ("dt" in data) {
        data.dt = this.satelliteStringToDate(data.dt);
        data.unit = parameters.unit;
        if ("dt" in image) {
          if (data.dt > image.dt) image = data;
        } else {
          image = data;
        }
      }
    }
    if (!("dt" in image)) {
      console.error("No images found in the metadata");
      return;
    }
    const { satellite, lake } = this.imageProperties(image.k);
    const url = `${CONFIG.sencast_bucket}/alplakes/cropped/${satellite}/${lake}/${image.k}`;
    updates.push({
      event: "addLayer",
      type: "addTiff",
      id: "satellite_" + parameters.parameter,
      options: { url: url, displayOptions: parameters.displayOptions },
    });

    this.setState({ updates, image });
  };

  updated = () => {
    this.setState({ updates: [] });
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

  render() {
    var { updates, mapId, image } = this.state;
    var { parameters, language, dark, bounds, id } = this.props;
    return (
      <div ref={this.ref} className="satellite-inner">
        <h3>
          {parameters.parameter_name[language]}
          <Information
            information={parameters.parameter_description[language]}
          />
        </h3>
        <div className="map">
          <NavLink to={`/map/${id}?layers=satellite_${parameters.parameter}`}>
            <div className="click">
              <div className="click-inner">Click for more.</div>
            </div>
          </NavLink>
          <Basemap
            updates={updates}
            updated={this.updated}
            language={language}
            dark={dark}
            mapId={mapId + "_" + parameters.parameter}
            bounds={bounds}
            load={true}
          />
          {"dt" in image && (
            <div className="label">
              <div className="value">
                {Math.round(image.p10 * 10) / 10} -{" "}
                {Math.round(image.p90 * 10) / 10} {image.unit}
              </div>
              <div className="time">{timeAgo(image.dt, language)} </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Satellite;
