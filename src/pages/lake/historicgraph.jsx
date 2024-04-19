import React, { Component } from "react";
import axios from "axios";
import "./lake.css";

class HistoricGraph extends Component {
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

export default HistoricGraph;
