import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import dark_icon from "../../img/dark.png";
import light_icon from "../../img/light.png";
import Toggle from "../sliders/toggle";
import "./footer.css";

class Footer extends Component {
  render() {
    var { dark, toggleDark, small } = this.props;
    return (
      <React.Fragment>
        <div className={small ? "footer small" : "footer"}>
          <div className="copyright">&copy; 2024 Alplakes</div>
          <NavLink to="/about">
            <div className="link">Impressum</div>
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
