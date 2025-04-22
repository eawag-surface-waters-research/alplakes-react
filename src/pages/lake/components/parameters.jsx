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
import person_icon from "../../../img/person.png";
import outflow_icon from "../../../img/outflow.png";
import rainfall_icon from "../../../img/rainfall.png";
import dam_icon from "../../../img/dam.png";
import arrow_icon from "../../../img/arrow.png";
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
        key: "catchmentArea",
        unit: "km²",
        label: Translations["surfaceArea"][language],
        source: "Generated using Global Watersheds Web App",
        link: "https://mghydro.com/watersheds/",
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
      {
        key: "population",
        unit: "",
        label: Translations["population"][language],
        source: "GlobPOP",
        link: "https://zenodo.org/records/10088105",
        img: person_icon,
      },
      {
        key: "outflows",
        unit: "",
        label: Translations["outflows"][language],
        source: "Urban Waste Water Treatment Directive discharge points",
        link: "https://www.eea.europa.eu/en/datahub/datahubitem-view/21874828-fa7a-4e7e-8a0a-52ec7d92f99f",
        img: outflow_icon,
      },
      {
        key: "rainfall",
        unit: "mm/yr",
        label: Translations["rainfall"][language],
        source: "WorldClim",
        link: "https://www.worldclim.org/data/worldclim21.html",
        img: rainfall_icon,
      },
      {
        key: "dams",
        unit: "",
        label: Translations["dams"][language],
        source: "Global Dam Watch",
        link: "https://www.globaldamwatch.org/home",
        img: dam_icon,
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
              <img className="icon" src={p.img} alt={p.label} />
              <div className="value">
                {parameters[p.key]} {p.unit}
              </div>
              <div className="label">{p.label}</div>
              {"link" in p && (
                <a href={p.link} target="_blank" rel="noreferrer">
                  <img className="link" src={arrow_icon} title={p.source} alt="Link" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default Parameters;
