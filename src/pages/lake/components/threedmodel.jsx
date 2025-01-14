import React, { Component } from "react";
import Translations from "../../../translations.json";
import Basemap from "../../../components/leaflet/basemap";

class ThreeDModel extends Component {
  state = {
    updates: [],
    mapId: "map_" + Math.round(Math.random() * 100000),
  };
  render() {
    var { updates, mapId } = this.state;
    var { dark, bounds } = this.props;
    return (
      <div className="threedmodel">
        <h3>Water Temperature & Velocity - 3D</h3>
        <div className="threedmodel-inner">
          <div className="threedmodel-map">
            <Basemap
              updates={updates}
              dark={dark}
              mapId={mapId}
              bounds={bounds}
              basemap="default"
            />
          </div>
          <div className="threedmodel-graphs"></div>
        </div>
      </div>
    );
  }
}

export default ThreeDModel;
