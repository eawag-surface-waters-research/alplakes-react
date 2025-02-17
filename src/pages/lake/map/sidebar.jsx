import React, { Component } from "react";
import settings_icon from "../../../img/settings.png";
import temperature_icon from "../../../img/temperature.png";
import velocity_icon from "../../../img/velocity.png";
import chla_icon from "../../../img/chla.png";
import transect_icon from "../../../img/transect.png";
import profile_icon from "../../../img/profile.png";
import secchi_icon from "../../../img/secchi.png";
import turbidity_icon from "../../../img/turbidity.png";
import rgb_icon from "../../../img/rgb.png";
import particles_icon from "../../../img/particles.png";
import thermocline_icon from "../../../img/thermocline.png";
import oxygen_icon from "../../../img/oxygen.png";
import forel_icon from "../../../img/forel.png";
import LayerSelection from "./layerselect";
import LayerSettings from "./layersettings";

class Sidebar extends Component {
  state = {
    open: true,
    selection: false,
  };
  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };
  setSelection = (selection) => {
    if (this.state.selection === selection && window.innerWidth <= 500) {
      this.setState({ selection: false });
    } else {
      this.setState({ selection });
    }
  };
  componentDidUpdate(prevProps) {
    if (
      prevProps.layers.length === 0 &&
      this.props.layers.length > 0 &&
      window.innerWidth > 500
    ) {
      let layers = this.props.layers.filter((l) => l.active);
      if (layers.length > 0) {
        this.setState({ selection: layers[0].id });
      }
    }
  }
  render() {
    const { title, layers, language } = this.props;
    const { open, selection } = this.state;
    const images = {
      temperature: temperature_icon,
      velocity: velocity_icon,
      chla: chla_icon,
      secchi: secchi_icon,
      turbidity: turbidity_icon,
      tsm: turbidity_icon,
      realcolor: rgb_icon,
      transect: transect_icon,
      profile: profile_icon,
      particles: particles_icon,
      thermocline: thermocline_icon,
      oxygensat: oxygen_icon,
      forelule: forel_icon,
    };
    const layer = selection ? layers.find((l) => l.id === selection) : false;
    return (
      <div className={open ? "map-sidebar" : "map-sidebar closed"}>
        <div className="sidebar-head">
          <div className="sidebar-title">{title}</div>
          <div className="sidebar-toggle">
            <div className="settings-button" onClick={this.toggleOpen}>
              <img src={settings_icon} alt="Settings" />
            </div>
          </div>
        </div>
        <div className="sidebar-body">
          <div className="sidebar-layers">
            <LayerSelection
              layers={layers}
              language={language}
              images={images}
              setSelection={this.setSelection}
            />
          </div>
          <div
            className={selection ? "sidebar-content" : "sidebar-content closed"}
          >
            {selection && <LayerSettings layer={layer} language={language} />}
          </div>
        </div>
      </div>
    );
  }
}

export default Sidebar;
