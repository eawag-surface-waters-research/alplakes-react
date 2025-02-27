import React, { Component, createRef } from "react";
import axios from "axios";
import CONFIG from "../../../config.json";
import { daysAgo } from "../functions/general";
import Basemap from "../../../components/leaflet/basemap";
import Information from "../../../components/information/information";
import MapButton from "../../../components/mapbutton/mapbutton";
import Translations from "../../../translations.json";

class Satellite extends Component {
  state = {
    hasBeenVisible: false,
    updates: [],
    mapId: "map_" + Math.round(Math.random() * 100000),
    image: {},
    available: true,
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
    var { updates, image, available } = this.state;
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
      updates.push({
        event: "loaded",
      });
      available = false;
    } else {
      const { satellite, lake } = this.imageProperties(image.k);
      const url = `${CONFIG.sencast_bucket}/alplakes/cropped/${satellite}/${lake}/${image.k}`;
      parameters.displayOptions["unit"] = parameters.unit;
      updates.push({
        event: "addLayer",
        type: "tiff",
        id: "satellite_" + parameters.parameter,
        options: { url: url, displayOptions: parameters.displayOptions },
      });
    }
    this.setState({ updates, image, available });
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
    var { updates, mapId, image, available } = this.state;
    var { parameters, language, dark, bounds, id } = this.props;
    if ("dt" in image) {
      var p10 = Math.round(image.p10 * 10) / 10;
      var p90 = Math.round(image.p90 * 10) / 10;
    }
    return (
      <div ref={this.ref} className="satellite-inner">
        <h3>
          {parameters.parameter_name[language]}
          <Information
            information={parameters.parameter_description[language]}
          />
        </h3>
        <div className="map">
          <MapButton
            link={`/map/${id}?layers=satellite_${parameters.parameter}`}
            language={language}
          />
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
                {p10 === p90 ? p10 : `${p10} - ${p90}`} {image.unit}
              </div>
              <div className="time">{daysAgo(image.dt, language)} </div>
            </div>
          )}
          {!available && (
            <div className="label">
              <div className="value">{Translations.noProducts[language]}</div>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default Satellite;
