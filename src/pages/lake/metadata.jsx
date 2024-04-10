import React, { Component } from "react";
import axios from "axios";
import YearlyGraph from "../../components/d3/yearlygraph/yearlygraph";
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
import CONFIG from "../../config.json";

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
  render() {
    var { metadata } = this.props;
    return (
      <Dropdown
        title="Feeback"
        visible={true}
        contents={
          <div className="feedback">
            <div className="text">
              Thank you for taking the time to provide feedback. Please include
              a brief message detailing your thoughts and suggestions, and if
              you're open to further discussion, kindly provide your email
              address. We appreciate your input!
            </div>
            <div className="input-box">
              <input></input>
            </div>
            <div className="email">
              <input></input>
            </div>
            <div className="submit">Submit feedback</div>
          </div>
        }
      />
    );
  }
}

class LatestEvents extends Component {
  render() {
    var { metadata } = this.props;
    return (
      <Dropdown
        title="Latest Events"
        visible={true}
        contents={
          <div className="events">
            <div className="text">No events have been reported.</div>
            <div className="button">Get email notifications</div>
          </div>
        }
      />
    );
  }
}

class Bathymetry extends Component {
  render() {
    var { metadata } = this.props;
    if ("bathymetry" in metadata) {
      var bathymetry = metadata.bathymetry;
      return (
        <Dropdown
          title="Bathymetry"
          visible={true}
          contents={
            <React.Fragment>
              <div className="bathymetries">
                {bathymetry.map((b, index) => (
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={index}
                  >
                    <div className="bathymetry">
                      {b.type}
                      {b.source}
                      {b.format}
                    </div>
                  </a>
                ))}
              </div>
            </React.Fragment>
          }
        />
      );
    }
  }
}

class Insitu extends Component {
  render() {
    var { metadata } = this.props;
    return (
      <Dropdown
        title="Insitu Data"
        visible={true}
        contents={
          <div className="insitu">
            <div className="text">Field measurements from Lake geneva.</div>
            <div className="datasets">
              {metadata.insitu.map((i) => (
                <a href={i.url} target="_blank" rel="noreferrer" key={i.name}>
                  <div className="dataset">
                    <div className="name">{i.name}</div>
                    <div className="date">
                      {i.start} - {i.end}
                    </div>
                    <div className="parameters">{i.parameters.join(", ")}</div>
                  </div>
                </a>
              ))}
            </div>
            <div className="datalakes">
              See more on
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
    );
  }
}

class Properties extends Component {
  render() {
    var { metadata } = this.props;
    var properties = [
      { key: "area", unit: "km²", label: "Surface Area", img: area_icon },
      { key: "max_depth", unit: "m", label: "Max Depth", img: depth_icon },

      { key: "volume", unit: "km³", label: "Volume", img: volume_icon },
      { key: "ave_depth", unit: "m", label: "Average Depth", img: depth_icon },
      {
        key: "elevation",
        unit: "m.a.s.l",
        label: "Elevation",
        img: elevation_icon,
      },
      {
        key: "residence_time",
        unit: "days",
        label: "Residence time",
        img: time_icon,
      },
      {
        key: "geothermal_flux",
        unit: "W/m²",
        label: "Geothermal flux",
        img: flux_icon,
      },
      { key: "type", unit: "", label: "Type", img: type_icon },
      {
        key: "mixing_regime",
        unit: "",
        label: "Mixing Regime",
        img: mixing_icon,
      },
      {
        key: "trophic_state",
        unit: "",
        label: "Tropic State",
        img: trophic_icon,
      },
    ];
    var plot = properties.filter((p) => p.key in metadata);
    return (
      <div className="properties">
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
    );
  }
}

class Metadata extends Component {
  render() {
    var { metadata, language, title, subtitle } = this.props;
    return (
      <React.Fragment>
        <div className="title">{title}</div>
        <div className="subtitle">{subtitle}</div>
        <Properties metadata={metadata} language={language} />
        <LatestEvents />
        {"bathymetry" in metadata && (
          <Bathymetry metadata={metadata} language={language} />
        )}
        {"insitu" in metadata && (
          <Insitu metadata={metadata} language={language} />
        )}
        <Feedback language={language} />
      </React.Fragment>
    );
  }
}

export default Metadata;
