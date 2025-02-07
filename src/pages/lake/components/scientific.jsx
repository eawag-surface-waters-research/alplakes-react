import React, { Component } from "react";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";

const truncateString = (str, maxLength) => {
  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
};

class Scientific extends Component {
  render() {
    var { language, parameters } = this.props;
    return (
      <div className="scientific subsection">
        <h3>
          {Translations.scientific[language]}
          <Information information={Translations.scientificText[language]} />
        </h3>
        <div className="clickable-box-parent">
          {parameters.map((p) => (
            <a
              href={p.url}
              key={p.name}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="clickable-box">
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
                <div className="subtitle">
                  {truncateString(p.parameters.join(", "), 90)}
                </div>
                <div className="link">{p.source}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    );
  }
}

export default Scientific;
