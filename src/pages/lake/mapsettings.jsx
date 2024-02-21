import React, { Component } from "react";
import Translate from "../../translations.json";
import temperature_icon from "../../img/temperature.png";
import velocity_icon from "../../img/velocity.png";
import chla_icon from "../../img/chla.png";
import transect_icon from "../../img/transect.png";
import profile_icon from "../../img/profile.png";
import secchi_icon from "../../img/secchi.png";
import turbidity_icon from "../../img/turbidity.png";
import rgb_icon from "../../img/rgb.png";
import particles_icon from "../../img/particles.png";
import thermocline_icon from "../../img/thermocline.png";

class ActiveApps extends Component {
  removeLayer = (event) => {
    event.stopPropagation();
    this.props.removeLayer(parseInt(event.target.getAttribute("id")));
  };
  render() {
    var { language, layers, setSelection, selection, images } = this.props;
    var extra = Math.max(1, 4 - layers.filter((l) => l.active).length);

    return (
      <React.Fragment>
        <div className="active-apps">
          {layers
            .filter((l) => l.active)
            .sort((a, b) =>
              a.properties.options["zIndex"] > b.properties.options["zIndex"]
                ? -1
                : b.properties.options["zIndex"] >
                  a.properties.options["zIndex"]
                ? 1
                : 0
            )
            .map((layer, index) => (
              <div
                className={
                  "app filled " +
                  layer.type +
                  (selection === layer.id ? " active" : "")
                }
                key={layer.id}
                onClick={() => setSelection(layer.id)}
                title="Edit settings"
              >
                <div
                  className="remove"
                  title="Remove layer"
                  id={layer.id}
                  onClick={this.removeLayer}
                >
                  -
                </div>
                <img
                  src={images[layer.properties.parameter]}
                  alt={layer.properties.parameter}
                />
                <span>
                  {layer.properties.parameter in Translate
                    ? Translate[layer.properties.parameter][language]
                    : ""}
                  <div className="type">{layer.properties.model}</div>
                </span>
              </div>
            ))}
          {[...Array(extra).keys()].map((p) => (
            <div
              className="app"
              title="Add layer"
              key={p}
              onClick={() => setSelection("add")}
            >
              +
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

class MapSettings extends Component {
  state = {
    images: {
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
    },
  };
  render() {
    var { images } = this.state;
    return (
      <React.Fragment>
        <ActiveApps {...this.props} images={images} />
      </React.Fragment>
    );
  }
}

export default MapSettings;
