import React, { Component } from "react";
import NavBar from "../../components/navbar/navbar";
import "./about.css";

class About extends Component {
  render() {
    return (
      <div className="main">
        <NavBar {...this.props} />
        <div className="about">This page is under construction...</div>
      </div>
    );
  }
}

export default About;
