import React, { Component } from "react";
import { downloadExternalForecast } from "../functions/download";
import Translations from "../../../translations.json";
import SummaryTable from "../../../components/summarytable/summarytable";
import { summariseData } from "../../../global";
import Information from "../../../components/information/information";

const getParameters = (parameters) =>
  Array.isArray(parameters) ? parameters.filter((p) => p && p.key) : [];

const getCoordinates = (p) =>
  isFinite(p.latitude) && isFinite(p.longitude)
    ? `${Number(p.latitude).toFixed(2)}, ${Number(p.longitude).toFixed(2)}`
    : false;

class ExternalModel extends Component {
  state = {
    data: false,
  };
  open = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };
  async componentDidMount() {
    var parameters = getParameters(this.props.parameters);
    var data = {};
    for (let i = 0; i < parameters.length; i++) {
      let p = parameters[i];
      try {
        if (!p.data || !p.parameter) continue;
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
    var { language } = this.props;
    var { data } = this.state;
    if (!data) return null;
    const available = getParameters(this.props.parameters).filter(
      (p) => data[p.key]
    );
    if (available.length === 0) return null;
    return (
      <div className="externalmodel subsection">
        <h3>
          {Translations.watertemperature[language]} - 3D{" "}
          <Information information={Translations.externalmodelText[language]} />
        </h3>
        <div className="clickable-box-parent">
          {available.map((p) => {
            const coordinates = getCoordinates(p);
            return (
              <div className="external-model" key={p.key}>
                <div
                  className={p.url ? "clickable-box" : "clickable-box static"}
                  onClick={p.url ? () => this.open(p.url) : undefined}
                >
                  <div className="right">{p.model_type}</div>
                  <div className="title">
                    {p.name}
                    {coordinates && (
                      <React.Fragment>
                        {" "}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${p.latitude},${p.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                        >
                          ({coordinates})
                        </a>
                      </React.Fragment>
                    )}
                  </div>
                  <SummaryTable
                    start={data[p.key].start}
                    end={data[p.key].end}
                    dt={data[p.key].dt}
                    value={data[p.key].value}
                    summary={data[p.key].summary}
                    unit={p.unit || ""}
                    language={language}
                  />
                </div>
                {p.model && p.institute && (
                  <div className="model-source">
                    <b>{p.model}</b> {Translations.modelFrom[language]}{" "}
                    {p.institute_url ? (
                      <a
                        href={p.institute_url}
                        alt={p.institute}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {p.institute}
                      </a>
                    ) : (
                      p.institute
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default ExternalModel;
