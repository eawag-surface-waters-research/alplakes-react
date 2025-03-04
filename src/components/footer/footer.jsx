import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import dark_icon from "../../img/dark.png";
import light_icon from "../../img/light.png";
import Toggle from "../sliders/toggle";
import eawag_logo from "../../img/eawag_logo.png";
import Translations from "../../translations.json";
import "./footer.css";

class Footer extends Component {
  render() {
    var { dark, toggleDark, small, medium, language } = this.props;
    const currentYear = new Date().getFullYear();
    return (
      <React.Fragment>
        <div
          className={
            medium ? "footer medium" : small ? "footer small" : "footer"
          }
        >
          <div className="left">
            <a
              href="https://www.eawag.ch"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={eawag_logo} alt="Eawag" />
            </a>
          </div>
          <NavLink to="/about">
            <div className="middle">
              {Translations.impressum[language]}
              <div className="copywrite">&copy; {currentYear} Alplakes v2.0</div>
            </div>
          </NavLink>
          <div className="switch" title={dark ? "Light mode" : "Dark mode"}>
            <Toggle
              left={<img src={light_icon} alt="light" />}
              right={<img src={dark_icon} alt="dark" />}
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
