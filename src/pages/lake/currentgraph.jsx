import React, { Component } from "react";
import axios from "axios";
import "./lake.css";

class CurrentGraph extends Component {
  state = {
    data: []
  }
  async componentDidMount() {
    ({ data: geometry } = await axios.get(
      `${CONFIG.alplakes_bucket}/simulations/${layer.properties.model}/metadata/${layer.properties.lake}/geometry.txt`
    ));
  }
  render() {
    var { id } = this.props;
    return (
      <div className="module-component">
        <div className="sidebar">Some sidebar stuff here</div>
        <div className="plot"></div>
      </div>
    );
  }
}

export default CurrentGraph;
