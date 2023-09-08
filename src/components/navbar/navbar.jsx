import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Translate from "../../translations.json";
import lightLogo from "../../img/text-logo-black.png";
import darkLogo from "../../img/text-logo-white.png";
import lakes_img from "../../img/lakes.png";
import api_img from "../../img/api.png";
import about_img from "../../img/about.png";
import lakes_img_dark from "../../img/lakes_dark.png";
import api_img_dark from "../../img/api_dark.png";
import about_img_dark from "../../img/about_dark.png";
import dark_icon from "../../img/dark.png";
import light_icon from "../../img/light.png";
import "./navbar.css";

class NavBar extends Component {
  render() {
    var selected = "lakes";
    if (window.location.href.includes("/api")) selected = "api";
    if (window.location.href.includes("/about")) selected = "about";
    var { language, languages, setLanguage, dark, toggleDark } = this.props;
    return (
      <React.Fragment>
        <div className={dark ? "navbar dark" : "navbar"}>
          <NavLink to="/">
            <img
              src={dark ? darkLogo : lightLogo}
              className="icon"
              alt="Alplakes logo"
            />
          </NavLink>
          <div className="language">
            <button
              className="dark-switch"
              onClick={toggleDark}
              title={dark ? "Switch to light theme" : "Switch to dark theme"}
            >
              <img src={dark ? light_icon : dark_icon} alt="Light switch" />
            </button>
            <select
              value={language}
              onChange={setLanguage}
              title="Switch language"
            >
              {languages.map((l) => (
                <option value={l} key={"language_" + l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="desktop-nav">
            <NavLink
              className={selected === "lakes" ? "nav-item active" : "nav-item"}
              to="/"
            >
              <div className="nav-text">{Translate.lakes[language]}</div>
            </NavLink>
            <NavLink
              className={selected === "api" ? "nav-item active" : "nav-item"}
              to="/api"
            >
              <div className="nav-text">API</div>
            </NavLink>
            <NavLink
              className={selected === "about" ? "nav-item active" : "nav-item"}
              to="/about"
            >
              <div className="nav-text">{Translate.about[language]}</div>
            </NavLink>
          </div>

          <div className="mobile-nav">
            <div className="dropdown">
              <button className="dropbtn" title="Menu">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </button>
              <div className="dropdown-content">
                <NavLink to="/">
                  <img alt="Lakes" src={dark ? lakes_img_dark : lakes_img} />
                  Lakes
                </NavLink>
                <NavLink to="/api">
                  <img alt="API" src={dark ? api_img_dark : api_img} />
                  API
                </NavLink>
                <NavLink to="/about">
                  <img alt="About" src={dark ? about_img_dark : about_img} />
                  About
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
