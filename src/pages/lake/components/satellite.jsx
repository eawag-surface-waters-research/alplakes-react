import React, { Component, createRef } from "react";
import Translations from "../../../translations.json";
import Basemap from "../../../components/leaflet/basemap";

class Satellite extends Component {
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
    console.log("Load satellite data");
  };

  render() {
    var { updates, mapId } = this.state;
    var { parameters, language, dark, bounds } = this.props;
    return (
      <div
        ref={this.ref}
        className="satellite-inner"
      >
        <h3>{parameters.parameter_name[language]}</h3>
        <div className="map">
          <Basemap
            updates={updates}
            dark={dark}
            mapId={mapId + "_" + parameters.parameter}
            bounds={bounds}
            basemap="default"
          />
        </div>
      </div>
    );
  }
}

export default Satellite;
