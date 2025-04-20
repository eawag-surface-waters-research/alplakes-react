import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Translations from "../../translations.json";
import logo from "../../img/icon_text.png";
import logo_dark from "../../img/icon_text_dark.png";
import dark_icon from "../../img/dark.png";
import light_icon from "../../img/light.png";
import arrow from "../../img/arrow-right.png";
import "./navbar.css";
import Toggle from "../sliders/toggle";

class NavBar extends Component {
  state = {
    menu: false,
  };
  toggleMenu = () => {
    this.setState({ menu: !this.state.menu });
  };
  render() {
    var { menu } = this.state;
    var { language, languages, setLanguage, dark, toggleDark, relative } =
      this.props;
    return (
      <React.Fragment>
        <div className={relative ? "navbar relative" : "navbar"}>
          <div className="navbar-inner">
            <NavLink to="/">
              <div className="home-nav">
                <img
                  src={dark ? logo_dark : logo}
                  className="icon"
                  alt="Alplakes logo"
                />
              </div>
            </NavLink>

            <div className="desktop-nav">
              <NavLink className="nav-item" to="/">
                <div className="nav-text">{Translations.lakes[language]}</div>
              </NavLink>
              <NavLink className="nav-item" to="/models">
                <div className="nav-text">{Translations.models[language]}</div>
              </NavLink>
              <NavLink className="nav-item" to="/downloads">
                <div className="nav-text">
                  {Translations.downloads[language]}
                </div>
              </NavLink>
              <NavLink className="nav-item" to="/blog">
                <div className="nav-text">Blog</div>
              </NavLink>
              <NavLink className="nav-item" to="/about">
                <div className="nav-text">{Translations.about[language]}</div>
              </NavLink>
              <div className="nav-item">
                <div className="nav-select">
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
              </div>
            </div>

            <div className="mobile-nav">
              <div className="nav-header">
                <div
                  className="nav-toggle"
                  title="Menu"
                  onClick={this.toggleMenu}
                >
                  <div className={menu ? "bar x" : "bar"}></div>
                  <div className={menu ? "bar x" : "bar"}></div>
                  <div className={menu ? "bar x" : "bar"}></div>
                </div>
              </div>
              <div className={menu ? "nav-content" : "nav-content hide"}>
                <NavLink to="/">
                  <div className="nav-row">
                    {Translations.lakes[language]}
                    <div className="arrow">
                      <img src={arrow} alt="Arrow" />
                    </div>
                  </div>
                </NavLink>
                <NavLink to="/models">
                  <div className="nav-row">
                    {Translations.models[language]}
                    <div className="arrow">
                      <img src={arrow} alt="Arrow" />
                    </div>
                  </div>
                </NavLink>
                <NavLink to="/downloads">
                  <div className="nav-row">
                    {Translations.downloads[language]}
                    <div className="arrow">
                      <img src={arrow} alt="Arrow" />
                    </div>
                  </div>
                </NavLink>
                <NavLink to="/blog">
                  <div className="nav-row">
                    Blog
                    <div className="arrow">
                      <img src={arrow} alt="Arrow" />
                    </div>
                  </div>
                </NavLink>
                <NavLink to="/about">
                  <div className="nav-row">
                    {Translations.about[language]}
                    <div className="arrow">
                      <img src={arrow} alt="Arrow" />
                    </div>
                  </div>
                </NavLink>
                <div className="nav-row settings">
                  <div className="mode">
                    <Toggle
                      left={<img src={light_icon} alt="light" />}
                      right={<img src={dark_icon} alt="dark" />}
                      onChange={toggleDark}
                      checked={dark}
                    />
                  </div>
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
              </div>
              <div
                className={menu ? "nav-close" : "nav-close hide"}
                onClick={this.toggleMenu}
              ></div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default NavBar;
