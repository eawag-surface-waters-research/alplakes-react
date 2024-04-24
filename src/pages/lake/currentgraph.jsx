import React, { Component } from "react";
import axios from "axios";
import "./lake.css";

class CurrentGraph extends Component {
  state = {
    data: []
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
