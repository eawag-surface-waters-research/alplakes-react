import React, { Component } from "react";
import Translations from "../../../translations.json";

class Scientific extends Component {
  render() {
    var { language, parameters } = this.props;
    return (
      <div className="scientific">
        <h3>{Translations.scientific[language]}</h3>
        {parameters.map((p) => (
          <a href={p.url} key={p.name}>
            <div className="external-box">
              {p.live ? (
                <div className="right live">
                  <div className="live-button" />
                  {Translations.live[language]}
                </div>
              ) : (
                <div className="right">
                  {p.start} - {p.end}
                </div>
              )}
              <div className="title">{p.name}</div>
              <div className="subtitle">{p.parameters.join(", ")}</div>
              <div className="link">{p.source}</div>
            </div>
          </a>
        ))}
      </div>
    );
  }
}

export default Scientific;
