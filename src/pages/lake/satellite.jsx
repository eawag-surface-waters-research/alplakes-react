import React, { Component } from "react";
import axios from "axios";
import Basemap from "../../components/leaflet/basemap";
import "./lake.css";

class Satellite extends Component {
  state = {
    basemap: "default",
  };
  render() {
    var { id, dark, metadata } = this.props;
    var { basemap } = this.state;
    return (
      <div className="module-component">
        <div className="sidebar">Some sidebar stuff here</div>
        <div className="plot">
          <Basemap
            dark={dark}
            bounds={metadata.bounds}
            updates={[]}
            basemap={basemap}
          />
        </div>
      </div>
    );
  }
}

export default Satellite;
