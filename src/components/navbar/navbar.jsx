import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Translate from "../../translations.json";
import textLogoWhite from "../../img/text-logo-white.png";
import lakes_img from "../../img/lakes.png";
import api_img from "../../img/api.png";
import about_img from "../../img/about.png";
import "./navbar.css";

class NavBar extends Component {
  render() {
    var selected = "lakes";
    if (window.location.href.includes("/api")) selected = "api";
    if (window.location.href.includes("/about")) selected = "about";
    var { language } = this.props;
    return (
      <React.Fragment>
        <div className="navbar">
          <img src={textLogoWhite} className="icon" alt="Alplakes logo" />
          <div className="desktop-nav">
            <NavLink
              className={selected == "lakes" ? "nav-item active" : "nav-item"}
              to="/"
            >
              <img alt="Lakes" src={lakes_img} />
              <div className="nav-text">{Translate.lakes[language]}</div>
            </NavLink>
            <NavLink
              className={selected == "api" ? "nav-item active" : "nav-item"}
              to="/api"
            >
              <img alt="API" src={api_img} />
              <div className="nav-text">API</div>
            </NavLink>
            <NavLink
              className={selected == "about" ? "nav-item active" : "nav-item"}
              to="/about"
            >
              <img alt="About" src={about_img} />
              <div className="nav-text">{Translate.about[language]}</div>
            </NavLink>
          </div>

          <div className="mobile-nav">
            <div className="mobile-navbar">
              <div className="mobile-flex">
                <NavLink activeClassName="imgactive" to="/lakes">
                  <img alt="Lakes" src={lakes_img} />
                </NavLink>
                <NavLink activeClassName="imgactive" to="/api">
                  <img alt="API" src={api_img} />
                </NavLink>
                <NavLink to="/about">
                  <img alt="About" src={about_img} />
                </NavLink>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default NavBar;
