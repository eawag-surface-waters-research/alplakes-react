import React, { Component, createRef } from "react";
import Translations from "../../../translations.json";
import Basemap from "../../../components/leaflet/basemap";

class WaterTemperature extends Component {
  state = {
    hasBeenVisible: false,
    updates: [],
    mapId: "map_" + Math.round(Math.random() * 100000),
  };

  ref = createRef();

  componentDidMount() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.state.hasBeenVisible) {
          this.setState({ hasBeenVisible: true }, this.runFunction);
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

  runFunction = () => {
    console.log("Load water temperature data");
  };

  render() {
    var { updates, mapId } = this.state;
    var { dark, bounds, language } = this.props;
    return (
      <div className="water-temperature">
        <h3>{Translations.watertemperature[language]}</h3>
        <div className="map-sidebar">
          <div className="left">
            <Basemap
              updates={updates}
              dark={dark}
              mapId={mapId}
              bounds={bounds}
              basemap="default"
            />
          </div>
          <div className="right"></div>
        </div>
      </div>
    );
  }
}

export default WaterTemperature;
