import React, { Component } from "react";
import axios from "axios";
import { hour } from "../functions/general";
import Information from "../../../components/information/information";
import CONFIG from "../../../config.json";
import Translations from "../../../translations.json";
import downloadIcon from "../../../img/download.png";

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
  downloadFile = () => {
    const { lake } = this.props;
    const { summary } = this.state;
    const blob = new Blob([summary.prompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${lake}_prompt_${this.formatDate(summary.produced)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  formatDate = (unix) => {
    const date = new Date(unix * 1000);
    const pad = (n) => n.toString().padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // Months are 0-based
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}${month}${day}_${hours}${minutes}`;
  };

  render() {
    var { language } = this.props;
    var { summary } = this.state;
    if (summary !== false) {
      return (
        <div className="ai-summary subsection">
          <h3>
            {Translations.overview[language]}{" "}
            <div className="ai-beta">BETA</div>
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
            <div
              className="ai-prompt"
              title="Download model prompt"
              onClick={this.downloadFile}
            >
              <img src={downloadIcon} alt="Download" />
            </div>
          </div>
          <p></p>
        </div>
      );
    }
  }
}

export default AiSummary;
