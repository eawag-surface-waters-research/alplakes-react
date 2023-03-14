import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Translate from "../../translations.json";
import NavBar from "../../components/navbar/navbar";
import "./lake.css";

class Lake extends Component {
  render() {
    var { language } = this.props;
    document.title = Translate.title[language];
    return (
      <div className="main">
        <NavBar language={language} />
        <div className="primary">
          <div className="content"></div>
        </div>
        <div className="secondary"></div>
      </div>
    );
  }
}

export default Lake;
