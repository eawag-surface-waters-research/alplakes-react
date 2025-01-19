import React, { Component, createRef } from "react";
import axios from "axios";
import CONFIG from "../../../config.json";
import Translations from "../../../translations.json";
import Basemap from "../../../components/leaflet/basemap";

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
    var { updates, mapId } = this.state;
    var { parameters, language, dark, bounds } = this.props;
    return (
      <div ref={this.ref} className="satellite-inner">
        <h3>{parameters.parameter_name[language]}</h3>
        <div className="map">
          <Basemap
            updates={updates}
            updated={this.updated}
            dark={dark}
            mapId={mapId + "_" + parameters.parameter}
            bounds={bounds}
          />
        </div>
      </div>
    );
  }
}

export default Satellite;
