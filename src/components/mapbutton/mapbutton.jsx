import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Translations from "../../translations.json";
import layersettings from "../../img/layersettings.png";
import "./mapbutton.css";

class MapButton extends Component {
  render() {
    const { link, language } = this.props;
    return (
      <NavLink to={link} className="lake-map-button">
        <div className="icon">
          <img src={layersettings} alt="Layer settings" />
        </div>
        <div className="text fade-out">{Translations.maplink[language]}</div>
        <div className="text-hover">{Translations.maplink[language]}</div>
      </NavLink>
    );
  }
}

export default MapButton;
