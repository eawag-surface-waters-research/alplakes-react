import React, { Component } from "react";
import axios from "axios";
import area_icon from "../../img/area.png";
import depth_icon from "../../img/depth.png";
import elevation_icon from "../../img/elevation.png";
import volume_icon from "../../img/volume.png";
import time_icon from "../../img/time.png";
import flux_icon from "../../img/flux.png";
import mixing_icon from "../../img/mixing.png";
import trophic_icon from "../../img/trophic.png";
import type_icon from "../../img/type.png";
import datalakes from "../../img/datalakes.png";
import ShowMoreText from "../../components/showmore/showmore";
import Translations from "../../translations.json";

class Dropdown extends Component {
  state = {
    visible: this.props.visible,
  };
  toggleVisible = () => {
    this.setState({ visible: !this.state.visible }, () => {
      window.dispatchEvent(new Event("resize"));
    });
  };
  render() {
    var { title, contents } = this.props;
    var { visible } = this.state;
    return (
      <div className="dropdown">
        <div
          className="header"
          onClick={this.toggleVisible}
          title={visible ? "Minimise" : "Maximise"}
        >
          {title}
          <div className={visible ? "plusminus active" : "plusminus"}></div>
        </div>
        <div className={visible ? "contents" : "contents hidden"}>
          {contents}
        </div>
      </div>
    );
  }
}

class Feedback extends Component {
  state = {
    sent: false,
    message: "",
    email: "",
    error: false,
  };
  setMessage = (event) => {
    this.setState({ message: event.target.value });
  };
  setEmail = (event) => {
    this.setState({ email: event.target.value });
  };
  submitReport = async () => {
    var { message, email } = this.state;
    if (message === "") {
      window.alert("Please add text to your feedback");
      return;
    }
    var content = {
      from: {
        email: "runnalls.james@gmail.com",
      },
      personalizations: [
        {
          to: [
            {
              email: "james.runnalls@eawag.ch",
            },
          ],
          dynamic_template_data: {
            dataset: "alplakes",
            email: email,
            url: window.location.href,
            message: message,
          },
        },
      ],
      template_id: "d-819e0202b4724bbb99069fdff49d667a",
    };
    try {
      await axios.post("https://api.datalakes-eawag.ch/contact", content);
      this.setState({ sent: true, error: false });
    } catch (e) {
      console.error(e);
      this.setState({ error: true });
    }
  };
  render() {
    var { language } = this.props;
    var { sent, text, email, error } = this.state;
    return (
      <Dropdown
        title={Translations["feedback"][language]}
        visible={true}
        contents={
          <div className="feedback">
            <div className="text">
              {Translations["feedbackText"][language]}
            </div>
            <textarea
              className="input-box"
              placeholder={Translations["addFeedback"][language]}
              value={text}
              disabled={sent}
              onChange={this.setMessage}
            />
            <input
              className="email"
              placeholder={Translations["emailAddress"][language]}
              value={email}
              disabled={sent}
              onChange={this.setEmail}
            />
            <div className="submit" onClick={this.submitReport}>
              {Translations["shareFeedback"][language]}
            </div>
            {sent && (
              <div className="submitted">{Translations["thanksFeedback"][language]}</div>
            )}
            {error && (
              <div className="error">
                {Translations["errorFeedback"][language]}
              </div>
            )}
          </div>
        }
      />
    );
  }
}

class Bathymetry extends Component {
  render() {
    var { metadata, language } = this.props;
    if ("bathymetry" in metadata) {
      var bathymetry = metadata.bathymetry;
      return (
        <React.Fragment>
          {bathymetry.length > 0 && (
            <Dropdown
              title={Translations["bathymetry"][language]}
              visible={true}
              contents={
                <div className="objects">
                  <div className="datasets">
                    {bathymetry.map((b, index) => (
                      <a
                        href={b.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        key={index}
                      >
                        <div className="dataset">
                          <div className="dataset-button">{Translations["view"][language]}</div>
                          <div className="name">{b.source} ({b.type})</div>
                          <div className="date">{b.name ? b.name : metadata["name"][language]}</div>
                          <div className="parameters">{b.format}</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              }
            />
          )}
        </React.Fragment>
      );
    }
  }
}

class Insitu extends Component {
  render() {
    var { metadata, language } = this.props;
    return (
      <React.Fragment>
        {metadata.insitu.length > 0 && (
          <Dropdown
            title={Translations["insituData"][language]}
            visible={true}
            contents={
              <div className="objects">
                <div className="text">
                  {Translations["insituDataDesc"][language]} {metadata.name[language]}.
                </div>
                <div className="datasets">
                  {metadata.insitu.map((i) => (
                    <a
                      href={i.url}
                      target="_blank"
                      rel="noreferrer"
                      key={i.name}
                    >
                      <div className="dataset">
                        <div className="dataset-button">{Translations["view"][language]}</div>
                        <div className="name">{i.name}</div>
                        <div className="date">
                          {i.start} - {i.end}
                        </div>

                        <div className="parameters">
                          <ShowMoreText
                            text={i.parameters.join(", ")}
                            links={{}}
                            maxLength={100}
                            toggle={true}
                          />
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                <div className="datalakes">
                  {Translations["seeMore"][language]}
                  <a
                    href="https://www.datalakes-eawag.ch/data"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img src={datalakes} alt="Datalakes" />
                  </a>
                </div>
              </div>
            }
          />
        )}
      </React.Fragment>
    );
  }
}

class AvailableData extends Component {
  render() {
    var { metadata, language } = this.props;
    return (
      <Dropdown
        title={Translations["availableData"][language]}
        visible={true}
        contents={
          <div className="objects">
            <div className="text">
              {Translations["availableDataDesc"][language]}
            </div>
            <div className="datasets">
              {metadata.available.map((i) => (
                <a href={i.url} target="_blank" rel="noreferrer" key={i.name}>
                  <div className="dataset">
                    <div className="dataset-button">{Translations["learnMore"][language]}</div>
                    <div className="name">{i.name}</div>
                    <div className="date">
                      {i.start} - {i.end}
                    </div>
                    <div className="parameters">{i.parameters.join(", ")}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        }
      />
    );
  }
}

class Properties extends Component {
  render() {
    var { metadata, language } = this.props;
    var properties = [
      { key: "area", unit: "km²", label: Translations["surfaceArea"][language], img: area_icon },
      { key: "max_depth", unit: "m", label: Translations["maxDepth"][language], img: depth_icon },

      { key: "volume", unit: "km³", label: Translations["volume"][language], img: volume_icon },
      { key: "ave_depth", unit: "m", label: Translations["averageDepth"][language], img: depth_icon },
      {
        key: "elevation",
        unit: "m.a.s.l",
        label: Translations["elevation"][language],
        img: elevation_icon,
      },
      {
        key: "residence_time",
        unit: "days",
        label: Translations["residenceTime"][language],
        img: time_icon,
      },
      {
        key: "geothermal_flux",
        unit: "W/m²",
        label: Translations["geothermalFlux"][language],
        img: flux_icon,
      },
      { key: "type", unit: "", label: Translations["type"][language], img: type_icon },
      {
        key: "mixing_regime",
        unit: "",
        label: Translations["mixingRegime"][language],
        img: mixing_icon,
      },
      {
        key: "trophic_state",
        unit: "",
        label: Translations["trophicState"][language],
        img: trophic_icon,
      },
    ];
    var plot = properties.filter((p) => p.key in metadata && metadata[p.key] !== "NA");
    return (
      <Dropdown
        title={Translations["lakeProperties"][language]}
        visible={true}
        contents={
          <div className="properties">
            <div className="head">{Translations["lakePropertiesDesc"][language]}</div>
            {plot.map((p) => (
              <div className="property" key={p.key}>
                <div className="left">
                  <img src={p.img} alt={p.label} />
                </div>
                <div className="right">
                  <div className="value">
                    {metadata[p.key]}
                    <div className="unit">{p.unit}</div>
                  </div>
                  <div className="label">{p.label}</div>
                </div>
              </div>
            ))}
          </div>
        }
      />
    );
  }
}

class Metadata extends Component {
  render() {
    var { metadata, language, title, subtitle } = this.props;
    console.log(metadata)
    return (
      <React.Fragment>
        <div className="title">{title}</div>
        <div className="subtitle">{subtitle}</div>
        <div className="location">{metadata.latitude}, {metadata.longitude}</div>
        <Properties metadata={metadata} language={language} />
        {"insitu" in metadata && (
          <Insitu metadata={metadata} language={language} />
        )}
        {"available" in metadata && false && (
          <AvailableData metadata={metadata} language={language} />
        )}
        {"bathymetry" in metadata && (
          <Bathymetry metadata={metadata} language={language} />
        )}
        <Feedback language={language} />
      </React.Fragment>
    );
  }
}

export default Metadata;
