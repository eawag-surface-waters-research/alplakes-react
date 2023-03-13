import React, { Component } from "react";
import "./language.css";

class Language extends Component {
  render() {
    const { language, languages, setLanguage } = this.props;
    return (
      <React.Fragment>
        <div className="language">
          <select value={language} onChange={setLanguage}>
            {languages.map((l) => (
              <option value={l} key={"language_" + l}>
                {l}
              </option>
            ))}
          </select>
        </div>
      </React.Fragment>
    );
  }
}

export default Language;
