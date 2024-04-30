import React, { Component } from "react";
//import axios from "axios";
import "./lake.css";

class Graph extends Component {
  render() {
    return (
      <div className="module-component">
        <div className="sidebar">Some sidebar stuff here</div>
        <div className="plot"></div>
      </div>
    );
  }
}

export default Graph;