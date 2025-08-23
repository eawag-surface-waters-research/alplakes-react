import React, { Component } from "react";
import axios from "axios";
import { hour } from "../functions/general";
import Information from "../../../components/information/information";
import CONFIG from "../../../config.json";
import Translations from "../../../translations.json";

class AiSummary extends Component {
  state = {
    summary: false,
  };
  async componentDidMount() {
    const { lake } = this.props;
    try {
      const { data } = await axios.get(
        CONFIG.alplakes_bucket + `/aisummary/${lake}/forecast.json` + hour()
      );
      if (Date.now() - data.produced * 1000 < 13 * 60 * 60 * 1000) {
        this.setState({ summary: data });
      }
    } catch (e) {
      console.error(e);
    }
  }
  render() {
    var { language } = this.props;
    var { summary } = this.state;
    if (summary !== false) {
      return (
        <div className="ai-summary subsection">
          <h3>
            {Translations.overview[language]}
            <Information information={Translations.overviewText[language]} />
          </h3>
          <div className="ai-content">
            <div className="ai-response">{summary["data"][language]}</div>
            <div className="ai-source">
              {Translations.generatedBy[language]}{" "}
              <div className="ai-model">{summary["model"]}</div>.{" "}
              {Translations.somethingWrong[language]}{" "}
              <a href="mailto:james.runnalls@eawag.ch">
                {Translations.here[language]}
              </a>
              .
            </div>
          </div>
          <p></p>
        </div>
      );
    }
  }
}

export default AiSummary;
