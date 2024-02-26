import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import dark_icon from "../../img/dark.png";
import light_icon from "../../img/light.png";
import Toggle from "../sliders/toggle";
import eawag_logo from "../../img/eawag_logo.png";
import "./footer.css";

class Footer extends Component {
  render() {
    var { dark, toggleDark, small, medium } = this.props;
    return (
      <React.Fragment>
        <div
          className={
            medium ? "footer medium" : small ? "footer small" : "footer"
          }
        >
          <div className="left">
            <img src={eawag_logo} alt="Eawag" />
          </div>
          <NavLink to="/about">
            <div className="middle">
              Impressum
              <div className="copywrite">&copy; 2024 Alplakes v2.0</div>
            </div>
          </NavLink>
          <div className="switch">
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
