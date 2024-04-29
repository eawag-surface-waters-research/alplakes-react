import React, { Component } from "react";
import LayerSettings from "./layersettings";
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

class Selection extends Component {
  render() {
    var { selection, layers, setSelection } = this.props;
    if (selection === false) {
      return;
    } else {
      var layer = layers.find((l) => l.id === selection);
      var source = layer.sources[layer.source];
      return (
        <React.Fragment>
          <div className="selection">
            <div className="layer-description">
              <ShowMoreText
                text={source.description}
                links={{}}
                maxLength={130}
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
          <div className="close-layer" onClick={() => setSelection(false)}>
            &#10005;
          </div>
        </React.Fragment>
      );
    }
  }
}

class ShowMoreText extends Component {
  state = {
    showFullText: false,
  };

  toggleText = () => {
    this.setState({
      showFullText: !this.state.showFullText,
    });
  };

  render() {
    const { text, links, maxLength } = this.props;
    const { showFullText } = this.state;

    const truncatedText =
      text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

    var show = showFullText ? text : truncatedText;

    return (
      <div onClick={this.toggleText}>
        <p>
          {show.split("@").map((t) =>
            t in links ? (
              <a
                href={links[t][1]}
                target="_blank"
                rel="noopener noreferrer"
                key={t}
              >
                {links[t][0]}
              </a>
            ) : (
              t
            )
          )}
        </p>
        {text.length > maxLength && (
          <button>{showFullText ? "Show less" : "Show more"}</button>
        )}
      </div>
    );
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
