import React, { Component } from "react";
import LayerSettings from "./layersettings";
import ShowMoreText from "../../components/showmore/showmore";
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
import oxygen_icon from "../../img/oxygen.png";

class Selection extends Component {
  render() {
    var { selection, layers } = this.props;
    if (selection === false) {
      return;
    } else {
      var layer = layers.find((l) => l.id === selection);
      var source = layer.sources[layer.source];
      return (
        <React.Fragment>
          <div className="selection">
            <div className="selection-inner">
              <div className="layer-description">
                <ShowMoreText
                  text={source.description}
                  links={{}}
                  maxLength={180}
                  toggle={true}
                />
              </div>
              <a
                href={source.learnMore}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="layer-link">Learn more</div>
              </a>
              <LayerSettings {...this.props} layer={layer} />
            </div>
          </div>
        </React.Fragment>
      );
    }
  }
}

class ActiveApps extends Component {
  removeLayer = (event) => {
    event.stopPropagation();
    this.props.removeLayer(event.target.getAttribute("id"));
  };
  render() {
    var { layers, setSelection, selection, images, toggleActiveAdd, language } =
      this.props;
    var extra = Math.max(0, 4 - layers.filter((l) => l.active).length);
    return (
      <React.Fragment>
        <div className="active-apps">
          <div className="app-area">
            {layers
              .filter((l) => l.active)
              .sort((a, b) =>
                a.displayOptions["zIndex"] > b.displayOptions["zIndex"]
                  ? -1
                  : b.displayOptions["zIndex"] > a.displayOptions["zIndex"]
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
                  <div className="join" />
                  <div
                    className="remove"
                    title="Remove layer"
                    id={layer.id}
                    onClick={this.removeLayer}
                  >
                    -
                  </div>
                  <img src={images[layer.parameter]} alt={layer.parameter} />
                  <span>
                    {Translate[layer.parameter][language]}
                    <div className="under">
                      {Translate[layer.type][language]}
                    </div>
                  </span>
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
          <Selection {...this.props} />
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
    var { language, layers, images, activeAdd, toggleActiveAdd } = this.props;
    return (
      <div className={activeAdd ? "add-layers" : "add-layers hidden"}>
        <div className="layers-title">Available Layers</div>
        <div className="layers-close" onClick={toggleActiveAdd}>
          &#10005;
        </div>

        <div className="layers">
          {layers.map((l) => {
            let source = l.sources[l.source];
            return (
              <div
                className={l.active ? "layer disabled" : "layer"}
                key={l.id}
                onClick={() => this.addLayer(l.id)}
                title={l.active ? "" : "Add to map"}
              >
                <div className="status">{l.active ? "Added" : "Add"}</div>
                <div className={"icon " + l.type}>
                  <img src={images[l.parameter]} alt={l.parameter} />
                </div>
                <div className="text">
                  <div className="parameter">
                    {l.parameter in Translate
                      ? Translate[l.parameter][language]
                      : ""}
                  </div>
                  <div className="type">
                    {l.type in Translate ? Translate[l.type][language] : ""}
                  </div>
                </div>
                <div className="description">
                  <ShowMoreText
                    text={source.description}
                    links={{}}
                    maxLength={130}
                    toggle={false}
                  />
                </div>
                {source.tags && (
                  <div className="tags">
                    {source.tags.map((t) => (
                      <div className="tag" key={t}>
                        {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

class Settings extends Component {
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
      oxygensat: oxygen_icon,
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

export default Settings;
