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
import "./navbar.css";

class NavBar extends Component {
  render() {
    var selected = "lakes";
    if (window.location.href.includes("/api")) selected = "api";
    if (window.location.href.includes("/about")) selected = "about";
    var { language, languages, setLanguage, dark } = this.props;
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
            <select value={language} onChange={setLanguage}>
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
              <img alt="Lakes" src={dark ? lakes_img_dark : lakes_img} />
              <div className="nav-text">{Translate.lakes[language]}</div>
            </NavLink>
            <NavLink
              className={selected === "api" ? "nav-item active" : "nav-item"}
              to="/api"
            >
              <img alt="API" src={dark ? api_img_dark : api_img} />
              <div className="nav-text">API</div>
            </NavLink>
            <NavLink
              className={selected === "about" ? "nav-item active" : "nav-item"}
              to="/about"
            >
              <img alt="About" src={dark ? about_img_dark : about_img} />
              <div className="nav-text">{Translate.about[language]}</div>
            </NavLink>
          </div>

          <div className="mobile-nav">
            <div className="dropdown">
              <button className="dropbtn">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
              </button>
              <div className="dropdown-content">
                <NavLink to="/lakes">
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
