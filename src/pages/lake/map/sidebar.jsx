import React, { Component } from "react";
import settings from "../../../img/settings.png";

class Sidebar extends Component {
  state = {
    open: true,
  };
  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };
  render() {
    const { title } = this.props;
    const { open } = this.state;
    return (
      <div className={open ? "map-sidebar" : "map-sidebar closed"}>
        <div className="sidebar-head">
          <div className="sidebar-title">{title}</div>
          <div className="sidebar-toggle">
            <div className="settings-button" onClick={this.toggleOpen}>
              <img src={settings} alt="Settings" />
            </div>
          </div>
        </div>
        <div className="sidebar-body">
            Map Layers
        </div>
      </div>
    );
  }
}

export default Sidebar;
