import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Translate from "../../translations.json";
import eawag_logo from "../../img/eawag_logo.png";
import esa_logo from "../../img/esa_logo.png";
import trento_logo from "../../img/trento_logo.png";
import dark_icon from "../../img/dark.png";
import light_icon from "../../img/light.png";
import Toggle from "../sliders/toggle";
import "./footer.css";

class Footer extends Component {
  render() {
    var { dark, toggleDark, language } = this.props;
    return (
      <React.Fragment>
        <div className="footer">
          <div className="summary">
            {Translate.summary[language]}{" "}
            <NavLink to="/about">{Translate.readmore[language]}</NavLink>
          </div>
          <div className="partners">
            <img src={eawag_logo} alt="Eawag" />
            <img src={esa_logo} alt="Esa" />
            <img src={trento_logo} alt="Trento" />
          </div>
          <div className="switch">
            <Toggle
              left={<img src={light_icon} alt="light"/>}
              right={<img src={dark_icon} alt="dark"/>}
              onChange={toggleDark}
              checked={dark}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Footer;
