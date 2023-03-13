import React, { Component } from "react";
import { Link, NavLink } from "react-router-dom";
import textLogoWhite from "../../img/text-logo-white.png";

class NavBar extends Component {
  render() {
    return (
      <React.Fragment>
        <div className="navbar">
          <img src={textLogoWhite} className="icon" alt="Alplakes logo" />
        </div>
      </React.Fragment>
    );
  }
}

export default NavBar;
