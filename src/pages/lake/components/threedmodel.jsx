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
    var { dark, bounds, language } = this.props;
    return (
      <div className="threedmodel">
        <h3>{Translations.temperaturecurrent[language]} - 3D</h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            <Basemap
              updates={updates}
              dark={dark}
              mapId={mapId}
              bounds={bounds}
            />
          </div>
          <div className="map-sidebar-right"></div>
        </div>
      </div>
    );
  }
}

export default ThreeDModel;
