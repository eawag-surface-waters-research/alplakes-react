import React, { Component } from "react";
import { downloadExternalForecast } from "../functions/download";
import Translations from "../../../translations.json";
import SummaryTable from "../../../components/summarytable/summarytable";
import { summariseData } from "../../../global";
import Information from "../../../components/information/information";

class ExternalModel extends Component {
  state = {
    data: false,
  };
  async componentDidMount() {
    var { parameters } = this.props;
    var data = {};
    for (let i = 0; i < parameters.length; i++) {
      let p = parameters[i];
      try {
        let download = await downloadExternalForecast(p.data);
        if (
          !download ||
          !Array.isArray(download.time) ||
          download.time.length === 0 ||
          !Array.isArray(download[p.parameter])
        )
          continue;
        if (new Date(download.time[download.time.length - 1]) < new Date())
          continue;
        let { summary, start, end } = summariseData(
          download.time,
          download[p.parameter]
        );
        data[p.key] = {
          summary,
          start,
          end,
          dt: download.time.map((t) => new Date(t)),
          value: download[p.parameter],
        };
      } catch (e) {
        console.error(e);
      }
    }
    this.setState({ data });
  }
  render() {
    var { language, parameters } = this.props;
    var { data } = this.state;
    if (!data) return null;
    const available = parameters.filter((p) => data[p.key]);
    if (available.length === 0) return null;
    return (
      <div className="externalmodel subsection">
        <h3>
          {Translations.watertemperature[language]} - 3D{" "}
          <Information information={Translations.externalmodelText[language]} />
        </h3>
        <div className="clickable-box-parent">
          {available.map((p) => (
            <div className="external-model" key={p.key}>
              <a href={p.url} target="_blank" rel="noopener noreferrer">
                <div className="clickable-box">
                  <div className="right">{p.model}</div>
                  <div className="title">{p.name}</div>
                  <SummaryTable
                    start={data[p.key].start}
                    end={data[p.key].end}
                    dt={data[p.key].dt}
                    value={data[p.key].value}
                    summary={data[p.key].summary}
                    unit={p.unit}
                    language={language}
                  />
                </div>
              </a>
              <div className="model-source">
                <b>{p.model}</b> {Translations.developedAt[language]}{" "}
                <a
                  href={p.institute_url}
                  alt={p.institute}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {p.institute}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default ExternalModel;
