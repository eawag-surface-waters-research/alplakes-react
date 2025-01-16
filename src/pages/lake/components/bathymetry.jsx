import React, { Component } from "react";
import Translations from "../../../translations.json";

class Bathymetry extends Component {
  render() {
    var { language, parameters } = this.props;
    return (
      <div className="bathymetry">
        <h3>{Translations.bathymetry[language]}</h3>
        {parameters.map((p) => (
          <a href={p.url} key={p.name}>
            <div className="external-box">
              <div className="title">{p.name}</div>
              <div className="subtitle">{p.format}</div>
              <div className="link">{p.source}</div>
            </div>
          </a>
        ))}
      </div>
    );
  }
}

export default Bathymetry;
