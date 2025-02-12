import React, { Component } from "react";
import Translations from "../../../translations.json";

class Bathymetry extends Component {
  render() {
    var { language, parameters } = this.props;
    return (
      <div className="bathymetry subsection">
        <h3>{Translations.bathymetry[language]}</h3>
        <div className="clickable-box-parent">
          {parameters.map((p) => (
            <a
              href={p.url}
              key={p.name + ("id" in p ? p.id : "")}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="clickable-box">
                <div className="title">{p.name}</div>
                {"id" in p && <div className="suptitle">{p.id}</div>}
                <div className="subtitle">{p.format}</div>
                <div className="link">{p.source}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  }
}

export default Bathymetry;
