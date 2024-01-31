import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Translate from "../../translations.json";
import logo from "../../img/icon.png";
import eawag_logo from "../../img/eawag_logo.png";
import esa_logo from "../../img/esa_logo.png";
import trento_logo from "../../img/trento_logo.png";
import dark_icon from "../../img/dark.png";
import light_icon from "../../img/light.png";
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
    var { language, languages, setLanguage, dark, toggleDark } = this.props;
    return (
      <React.Fragment>
        <div className={"navbar"}>
          <NavLink to="/">
            <div className="home-nav">
              <img src={logo} className="icon" alt="Alplakes logo" />
              <div className="name">ALPLAKES</div>
            </div>
          </NavLink>

          <div className="desktop-nav">
          <NavLink className="nav-item" to="/">
              <div className="nav-text">Lakes</div>
            </NavLink>
            <NavLink className="nav-item" to="/api">
              <div className="nav-text">API</div>
            </NavLink>
            <NavLink className="nav-item" to="/about">
              <div className="nav-text">{Translate.about[language]}</div>
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
              <div className="nav-row">
                <NavLink to="/">{Translate.lakes[language]}</NavLink>
              </div>
              <div className="nav-row">
                <NavLink to="/api">API</NavLink>
              </div>
              <div className="nav-row">
                <NavLink to="/about">{Translate.about[language]}</NavLink>
              </div>
              <div className="nav-row">
                <Toggle
                  left={<img src={light_icon} alt="light" />}
                  right={<img src={dark_icon} alt="dark" />}
                  onChange={toggleDark}
                  checked={dark}
                />
              </div>
              <div className="nav-row">
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

              <div className="nav-footer">
                <img src={eawag_logo} alt="Eawag" />
                <img src={esa_logo} alt="Esa" />
                <img src={trento_logo} alt="Trento" />
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default NavBar;
