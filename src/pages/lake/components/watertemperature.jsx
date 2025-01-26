import React, { Component, createRef } from "react";
import axios from "axios";
import CONFIG from "../../../config.json";
import { hour, round, timeAgo } from "../functions/general";
import Translations from "../../../translations.json";
import Basemap from "../../../components/leaflet/basemap";
import Information from "../../../components/information/information";
import MapButton from "../../../components/mapbutton/mapbutton";

class WaterTemperature extends Component {
  state = {
    hasBeenVisible: false,
    updates: [],
    hightlights: [],
    mapId: "map_" + Math.round(Math.random() * 100000),
  };

  ref = createRef();

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

  onVisible = async () => {
    const { id, parameters } = this.props;
    var { hightlights, updates } = this.state;
    var { data } = await axios.get(
      CONFIG.alplakes_bucket +
        "/insitu/summary/water_temperature.geojson" +
        hour()
    );
    const now = new Date();
    const minDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    for (let i = 0; i < data.features.length; i++) {
      let time = new Date(data.features[i].properties.last_time * 1000);
      if (data.features[i].properties.lake === id && time > minDate) {
        data.features[i].properties.permenant = true;
        data.features[i].properties.recent = true;
        hightlights.push(data.features[i].properties);
      } else if (time > minDate) {
        data.features[i].properties.permenant = false;
        data.features[i].properties.recent = true;
      } else {
        data.features[i].properties.permenant = false;
        data.features[i].properties.recent = false;
      }
    }
    updates.push({
      event: "addLayer",
      type: "addGeoJson",
      id: "water_temperature",
      options: {
        data: data,
        displayOptions: parameters.displayOptions,
        unit: "°C",
        lake: id,
      },
    });
    this.setState({ hightlights, updates });
  };

  render() {
    var { updates, mapId, hightlights } = this.state;
    var { dark, bounds, language, id } = this.props;
    return (
      <div className="water-temperature" ref={this.ref}>
        <h3>
          {Translations.watertemperature[language]}
          <Information
            information={Translations.watertemperatureText[language]}
          />
        </h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            <MapButton
              link={`/map/${id}?layers=water_temperature`}
              language={language}
            />
            <Basemap
              updates={updates}
              language={language}
              updated={this.updated}
              dark={dark}
              mapId={mapId}
              bounds={bounds}
              load={true}
            />
          </div>
          {hightlights.length > 0 && (
            <div className="map-sidebar-right">
              {hightlights.map((h, index) => (
                <a
                  href={h.url}
                  key={h.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="clickable-box">
                    <div className="right">
                      {round(h.last_value, 1)} °C
                      <div className="time">
                        {timeAgo(h.last_time * 1000, language)}
                      </div>
                    </div>
                    <div className="title">{h.label}</div>
                    <div className="link">{h.source}</div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default WaterTemperature;
