import React, { Component } from "react";
import area_icon from "../../../img/area.png";
import depth_icon from "../../../img/depth.png";
import elevation_icon from "../../../img/elevation.png";
import volume_icon from "../../../img/volume.png";
import time_icon from "../../../img/time.png";
import flux_icon from "../../../img/flux.png";
import mixing_icon from "../../../img/mixing.png";
import trophic_icon from "../../../img/trophic.png";
import type_icon from "../../../img/type.png";
import Translations from "../../../translations.json";

class Parameters extends Component {
  render() {
    var { parameters, language } = this.props;
    var properties = [
      {
        key: "area",
        unit: "km²",
        label: Translations["surfaceArea"][language],
        img: area_icon,
      },
      {
        key: "max_depth",
        unit: "m",
        label: Translations["maxDepth"][language],
        img: depth_icon,
      },

      {
        key: "volume",
        unit: "km³",
        label: Translations["volume"][language],
        img: volume_icon,
      },
      {
        key: "ave_depth",
        unit: "m",
        label: Translations["averageDepth"][language],
        img: depth_icon,
      },
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
      {
        key: "type",
        unit: "",
        label: Translations["type"][language],
        img: type_icon,
      },
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
    var plot = properties.filter(
      (p) => p.key in parameters && parameters[p.key] !== "NA"
    );
    return (
      <div className="parameters subsection">
        <h3>{Translations.parameters[language]}</h3>
        <div className="parameters-box">
          {plot.map((p) => (
            <div className="parameter" key={p.key}>
              <img src={p.img} alt={p.label} />
              <div className="value">
                {parameters[p.key]} {p.unit}
              </div>
              <div className="label">{p.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Parameters;
