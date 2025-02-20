import React, { Component } from "react";
import Translations from "../../../translations.json";
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
import LayerSelection from "./layerselection";
import LayerSettings from "./layersettings";
import ShowMoreText from "../../../components/showmore/showmore";
import AddLayers from "./addlayers";

class Sidebar extends Component {
  state = {
    open: true,
    addLayersModal: false,
  };
  toggleOpen = () => {
    this.setState({ open: !this.state.open });
  };
  toggleAddLayersModal = () => {
    this.setState({ addLayersModal: !this.state.addLayersModal });
  };
  render() {
    const {
      title,
      layers,
      language,
      selection,
      setSelection,
      closeSelection,
      removeLayer,
      addLayers,
      updateOptions,
      period,
      depth,
    } = this.props;
    const { open, addLayersModal } = this.state;
    const images = {
      temperature: temperature_icon,
      velocity: velocity_icon,
      chlorophyll: chla_icon,
      secchi: secchi_icon,
      turbidity: turbidity_icon,
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
      <React.Fragment>
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
                setSelection={setSelection}
                removeLayer={removeLayer}
                toggleAddLayersModal={this.toggleAddLayersModal}
              />
            </div>
            <div
              className={
                selection ? "sidebar-content" : "sidebar-content closed"
              }
            >
              {selection && (
                <React.Fragment>
                  <div
                    className="sidebar-content-close"
                    onClick={closeSelection}
                  >
                    &#10005;
                  </div>
                  <div className="sidebar-content-title">
                    {Translations[layer.name][language]}
                  </div>
                  <div className="sidebar-content-subtitle">
                    {Translations[layer.type][language]}
                  </div>
                  <div className="sidebar-content-description">
                    <ShowMoreText
                      text={layer.sources[layer.source].description[language]}
                      links={{}}
                      maxLength={120}
                      toggle={true}
                    />
                  </div>
                  <div className="sidebar-content-settings">
                    {Translations.settings[language]}
                  </div>
                  <LayerSettings
                    layer={layer}
                    language={language}
                    period={period}
                    depth={depth}
                    updateOptions={updateOptions}
                  />
                </React.Fragment>
              )}
            </div>
          </div>
        </div>
        <AddLayers
          layers={layers}
          language={language}
          images={images}
          addLayers={addLayers}
          addLayersModal={addLayersModal}
          toggleAddLayersModal={this.toggleAddLayersModal}
        />
      </React.Fragment>
    );
  }
}

export default Sidebar;
