import React, { Component } from "react";
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
import YearlyGraph from "../../components/d3/yearlygraph/yearlygraph";

class Dropdown extends Component {
  state = {
    visible: true,
  };
  toggleVisible = () => {
    this.setState({ visible: !this.state.visible });
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

class Secchi extends Component {
  render() {
    var { metadata, language } = this.props;
    return (
      <Dropdown
        title="Secchi Depth"
        contents={
          <React.Fragment>
            <div className="text">
              Historical monthly averages of Secchi depth on Lake Geneva.
            </div>
            <YearlyGraph
              data={metadata["secchi"]}
              unit="m"
              language={language}
            />
          </React.Fragment>
        }
      />
    );
  }
}

class Insitu extends Component {
  render() {
    var { metadata, language } = this.props;
    return (
      <Dropdown
        title="Insitu Data"
        contents={
          <div className="insitu">
            <div className="text">Field measurements from Lake geneva.</div>
            <div className="datasets">
              {metadata.insitu.map((i) => (
                <a href={i.url} target="_blank" key={i.name}>
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
              <a href="https://www.datalakes-eawag.ch/data" target="_blank">
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
      <Dropdown
        title="Properties"
        contents={
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
        }
      />
    );
  }
}

class Details extends Component {
  render() {
    var { metadata, language } = this.props;
    return (
      <React.Fragment>
        <Properties metadata={metadata} />
        {"secchi" in metadata && (
          <Secchi metadata={metadata} language={language} />
        )}
        {"insitu" in metadata && (
          <Insitu metadata={metadata} language={language} />
        )}
      </React.Fragment>
    );
  }
}

export default Details;
