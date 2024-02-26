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
    var { layers, setSelection, selection, images, toggleActiveAdd } =
      this.props;
    var extra = Math.max(0, 4 - layers.filter((l) => l.active).length);

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
                <span>{layer.properties.model}</span>
              </div>
            ))}
          {[...Array(extra).keys()].map((p) => (
            <div
              className="app"
              title="Add layer"
              key={p}
              onClick={toggleActiveAdd}
            >
              +
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

class AddLayers extends Component {
  addLayer = (id) => {
    this.props.toggleActiveAdd();
    this.props.addLayer(id);
  };
  render() {
    var { language, layers, images, activeAdd, toggleActiveAdd } =
      this.props;
    return (
      <div className={activeAdd ? "add-layers" : "add-layers hidden"}>
        <div className="layers-title">Add Layers</div>
        <div className="layers-close" onClick={toggleActiveAdd}>
          &#10005;
        </div>
        <div className="layers">
          {layers.map((l) => (
            <div
              className={l.active ? "layer disabled" : "layer"}
              key={l.id}
              onClick={() => this.addLayer(l.id)}
              title={l.active ? "" : "Add to map"}
            >
              <div className={"icon " + l.type}>
                <img
                  src={images[l.properties.parameter]}
                  alt={l.properties.parameter}
                />
              </div>
              <div className="text">
                <div className="parameter">
                  {l.properties.parameter in Translate
                    ? Translate[l.properties.parameter][language]
                    : ""}
                </div>
                <div className="model">{l.properties.model}</div>
                <div className="type">
                  {l.type in Translate ? Translate[l.type][language] : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
    activeAdd: false,
  };
  toggleActiveAdd = () => {
    this.setState({ activeAdd: !this.state.activeAdd });
  };
  render() {
    var { images, activeAdd } = this.state;
    return (
      <React.Fragment>
        <ActiveApps
          {...this.props}
          images={images}
          toggleActiveAdd={this.toggleActiveAdd}
        />
        <AddLayers
          {...this.props}
          images={images}
          activeAdd={activeAdd}
          toggleActiveAdd={this.toggleActiveAdd}
        />
      </React.Fragment>
    );
  }
}

export default MapSettings;
