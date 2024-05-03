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
import ShowMoreText from "../../components/showmore/showmore";

class Selection extends Component {
  render() {
    var { selection, datasets } = this.props;
    if (selection === false) {
      return;
    } else {
      var dataset = datasets.find((l) => l.id === selection);
      return (
        <React.Fragment>
          <div className="selection">
            <div className="selection-inner">
              <div className="layer-description">
                <ShowMoreText
                  text={dataset.description}
                  links={{}}
                  maxLength={180}
                />
              </div>
              <a
                href={dataset.learnMore}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="layer-link">Learn more</div>
              </a>
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
    var {
      datasets,
      setSelection,
      selection,
      images,
      toggleActiveAdd,
      language,
    } = this.props;
    return (
      <React.Fragment>
        <div className="active-apps">
          <div className="app-area">
            {datasets
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
            <div className="app" title="Add layer" onClick={toggleActiveAdd}>
              +
            </div>
          </div>
          <Selection {...this.props} />
        </div>
      </React.Fragment>
    );
  }
}

class AddDatasets extends Component {
  addLayer = (id) => {
    this.props.toggleActiveAdd();
    this.props.addLayer(id);
  };
  render() {
    var { language, datasets, images, activeAdd, toggleActiveAdd } = this.props;
    return (
      <div className={activeAdd ? "add-layers" : "add-layers hidden"}>
        <div className="layers-title">Available datasets</div>
        <div className="layers-close" onClick={toggleActiveAdd}>
          &#10005;
        </div>
        <div className="compare">
          Compare
        </div>
        <div className="compare">
          New Plot
        </div>
        <div className="layers">
          {datasets.map((l) => {
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
                    text={l.description}
                    links={{}}
                    maxLength={130}
                  />
                </div>
                {l.tags && (
                  <div className="tags">
                    {l.tags.map((t) => (
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

class GraphSettings extends Component {
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
        <AddDatasets
          {...this.props}
          images={images}
          activeAdd={activeAdd}
          toggleActiveAdd={this.toggleActiveAdd}
        />
      </React.Fragment>
    );
  }
}

export default GraphSettings;
