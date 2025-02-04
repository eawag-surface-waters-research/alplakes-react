import React, { Component, createRef } from "react";
import { downloadPastYear } from "../functions/download";
import { capitalize } from "../functions/general";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";
import DatasetHeatmap from "../../../components/d3/dataset/datasetheatmap";
import COLORS from "../../../components/colors/colors.json";
import Loading from "../../../components/loading/loading";
import Expand from "../../../components/expand/expand";

class PastYear extends Component {
  state = {
    hasBeenVisible: false,
    model: "",
    variable: "",
    start_date: false,
    end_date: false,
    display: false,
  };

  ref = createRef();

  componentDidMount() {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !this.state.hasBeenVisible) {
          this.setState({ hasBeenVisible: true }, this.onVisible);
          this.observer.disconnect();
        }
      },
      { threshold: 0.0 }
    );

    if (this.ref.current) {
      this.observer.observe(this.ref.current);
    }
  }

  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  onVisible = async () => {
    const { parameters, language } = this.props;
    const model = Object.keys(parameters)[0];
    const variable = parameters[model].parameters[0];
    const { data, start_date, end_date, start, end } = await downloadPastYear(
      parameters[model].model,
      parameters[model].key,
      variable.key,
      true
    );
    var options = {
      period: [start, end],
      start_date,
      end_date,
      xlabel: "time",
      xunits: "",
      ylabel: "Depth",
      yunits: "m",
      zlabel: Translations[variable.name][language],
      zunits: variable.unit,
    };
    if ("paletteName" in parameters[model].displayOptions) {
      let palette = COLORS[parameters[model].displayOptions.paletteName].map(
        (c) => {
          return { color: [c[0], c[1], c[2]], point: c[3] };
        }
      );
      options["palette"] = palette;
    }
    const display = { ...parameters[model].displayOptions, ...options, data };
    this.setState({
      model,
      variable,
      start_date,
      end_date,
      display,
    });
  };

  render() {
    var { language, dark, parameters } = this.props;
    var { display, model, variable } = this.state;
    return (
      <div className="past-year" ref={this.ref}>
        <h3>
          {Translations.pastYear[language]}
          <Information information={Translations.pastYearText[language]} />
        </h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            {display ? (
              <div className="graph-container">
                <DatasetHeatmap {...display} dark={dark} language={language} />
              </div>
            ) : (
              <div className="loading-graph">
                <Loading />
              </div>
            )}
          </div>
          <div className="map-sidebar-right">
            {model && (
              <div className="graph-properties">
                <div className="description">
                  Lorem Ipsum is simply dummy text of the printing and
                  typesetting industry. Lorem Ipsum has been the industry's
                  standard dummy text ever since the 1500s, when an unknown
                  printer took a galley of type and scrambled it to make a type
                  specimen book.
                </div>
                <Expand
                  openLabel="Settings"
                  closeLabel="Hide settings"
                  content={
                    <React.Fragment>
                      <div className="setting">
                        <div className="label">Simulation</div>
                        <select value={model} onChange={this.setModel}>
                          {Object.keys(parameters).map((p) => (
                            <option value={p} key={p}>
                              {parameters[p].name} (
                              {capitalize(parameters[p].model)})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="setting">
                        <div className="label">Variable</div>
                        <select value={variable} onChange={this.setVariable}>
                          {parameters[model].parameters.map((p) => (
                            <option value={p.key} key={p.key}>
                              {Translations[p.name][language]}
                            </option>
                          ))}
                        </select>
                      </div>
                      {"performance" in parameters[model] && (
                        <div className="setting">
                          <div className="label">Performance</div>
                          <div>
                            {Object.keys(
                              parameters[model].performance.rmse
                            ).map((k) => (
                              <div key={k} className="performance">
                                <div className="performance-value">
                                  {Math.round(
                                    parameters[model].performance.rmse[k] * 100
                                  ) / 100}
                                  <div className="performance-unit">
                                    {parameters[model].unit}
                                  </div>
                                </div>
                                <div className="performance-name">
                                  {capitalize(k)} RMSE
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {"meteo_source" in parameters[model] && (
                        <div className="setting">
                          <div className="label">Meteorological data</div>
                          <div>{parameters[model].meteo_source}</div>
                        </div>
                      )}
                      {"hydro_source" in parameters[model] && (
                        <div className="setting">
                          <div className="label">Hydrological data</div>
                          <div>{parameters[model].hydro_source}</div>
                        </div>
                      )}
                      {"calibration_source" in parameters[model] && (
                        <div className="setting">
                          <div className="label">Calibration data</div>
                          <div>{parameters[model].calibration_source}</div>
                        </div>
                      )}
                    </React.Fragment>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default PastYear;
