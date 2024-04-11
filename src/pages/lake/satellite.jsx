import React, { Component } from "react";
import axios from "axios";
import Basemap from "../../components/leaflet/basemap";
import "./lake.css";

class Satellite extends Component {
  state = {
    legend: false,
    basemap: "default",
    datetime: Date.now(),
    fullscreen: false,
    updates: [],
    layers: [],
    bucket: true,
    selection: false,
    graphs: false,
    graphData: false,
  };
  updated = () => {
    this.setState({ updates: [] });
  };
  unlock = () => {
    this.setState({ bucket: false });
  };
  async componentDidMount() {
    var { layers, module } = this.props;
    var updates = [{ event: "bounds" }];
    for (var layer of module.defaults) {
      updates.push({ event: "addLayer", id: layer });
    }
    this.setState({
      layers: JSON.parse(JSON.stringify(layers)),
      updates,
    });
  }
  render() {
    var { dark, metadata, language } = this.props;
    var { fullscreen } = this.state;
    return (
      <div className="module-component">
        <div className="sidebar"></div>
        <div className="plot">
          <div className={fullscreen ? "map fullscreen" : "map"}>
            <Basemap
              {...this.state}
              dark={dark}
              unlock={this.unlock}
              updated={this.updated}
              metadata={metadata}
            />
          </div>
          <div className="graph"></div>
        </div>
      </div>
    );
  }
}

export default Satellite;
