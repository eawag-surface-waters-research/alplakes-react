import React, { Component, createRef } from "react";
import { downloadDoy } from "../functions/download";
import { capitalize } from "../functions/general";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";
import DatasetLinegraph from "../../../components/d3/dataset/datasetlinegraph";
import Loading from "../../../components/loading/loading";
import Expand from "../../../components/expand/expand";

class DoyLegend extends Component {
  render() {
    const { min_year, max_year, language } = this.props;
    return (
      <div className="graph-legend">
        {max_year && (
          <div className="date">
            {Translations["referencePeriod"][language]}{" "}
            {`${min_year} - ${max_year}`}
          </div>
        )}
        <div className="item">
          <div className="box" style={{ opacity: 0.3 }}></div>
          <div className="text">
            25-75 p<sup>th</sup>
          </div>
        </div>
        <div className="item">
          <div className="box"></div>
          <div className="text">
            5-95 p<sup>th</sup>
          </div>
        </div>
        <div className="item">
          <div className="line" style={{ borderColor: "#ff7d45" }}></div>
          <div className="text">{new Date().getFullYear()}</div>
        </div>
        <div className="item">
          <div className="line" style={{ borderColor: "#ffc045" }}></div>
          <div className="text">{new Date().getFullYear() - 1}</div>
        </div>
        <div className="item">
          <div className="line" style={{ borderColor: "lightGrey" }}></div>
          <div className="text">Min, Mean, Max</div>
        </div>
      </div>
    );
  }
}

class Doy extends Component {
  state = {
    hasBeenVisible: false,
    model: false,
    variable: "",
    depth: "",
    min_year: false,
    max_year: false,
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

  setModel = (event) => {
    const { parameters } = this.props;
    const model = event.target.value;
    const variable = parameters[model].parameters[0];
    const depth = parameters[model].depths[0];
    this.process(model, variable, depth);
    this.setState({ model, variable, depth });
  };

  setVariable = (event) => {
    const { parameters } = this.props;
    const { model, depth } = this.state;
    const variable = parameters[model].parameters.find(
      (p) => p.key === event.target.value
    );
    this.process(model, variable, depth);
  };

  setDepth = (event) => {
    const { model, variable } = this.state;
    const depth = event.target.value;
    this.process(model, variable, depth);
  };

  process = async (model, variable, depth) => {
    const { parameters, language } = this.props;
    const { min_year, max_year, data } = await downloadDoy(
      parameters[model].model.toLowerCase(),
      parameters[model].key,
      depth,
      variable.key,
      true
    );
    const display = {
      xlabel: "time",
      xunits: "",
      ylabel: Translations[variable.name][language],
      yunits: variable.unit,
      data,
    };
    this.setState({
      model,
      variable,
      depth,
      min_year,
      max_year,
      display,
    });
  };

  onVisible = () => {
    const { parameters } = this.props;
    const model = Object.keys(parameters)[0];
    const variable = parameters[model].parameters[0];
    const depth = parameters[model].depths[0];
    this.process(model, variable, depth);
  };

  render() {
    var { language, dark, parameters } = this.props;
    var { display, min_year, max_year, model, depth } = this.state;
    const description = {
      EN: "The day of year statistics show the progresion of the parameter across the year. The last year and year to date are included to allow comparison of the state of the lake with the historical record. All data is from calibrated model simulations not from in-situ data.",
      DE: "Die Tagesstatistiken zeigen die Entwicklung der Parameter im Jahresverlauf. Das letzte Jahr und das Jahr bis heute sind enthalten, um den Zustand des Sees mit den historischen Aufzeichnungen zu vergleichen. Alle Daten stammen aus kalibrierten Modellsimulationen und nicht aus In-situ-Daten.",
      IT: "Le statistiche del giorno dell'anno mostrano la progressione del parametro nel corso dell'anno. L'ultimo anno e l'anno fino ad oggi sono inclusi per consentire il confronto dello stato del lago con il record storico. Tutti i dati provengono da simulazioni calibrate del modello e non da dati in situ.",
      FR: "Les statistiques du jour de l'année montrent la progression du paramètre tout au long de l'année. La dernière année et l'année à ce jour sont incluses pour permettre la comparaison de l'état du lac avec les données historiques. Toutes les données proviennent de simulations de modèles calibrés et non de données in situ.",
    };
    return (
      <div className="doy subsection" ref={this.ref}>
        <h3>
          {Translations.doyStats[language]}
          <Information information={Translations.doyStatsText[language]} />
        </h3>
        <div className="map-sidebar">
          <div className="map-sidebar-left">
            {display ? (
              <div className="line-graph-container">
                <DatasetLinegraph
                  {...display}
                  dark={dark}
                  language={language}
                />
                <DoyLegend
                  min_year={min_year}
                  max_year={max_year}
                  language={language}
                />
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
                <div className="description">{description[language]}</div>
                <Expand
                  openLabel="Settings"
                  closeLabel="Hide settings"
                  content={
                    <React.Fragment>
                      <div className="setting">
                        <div className="label">
                          {Translations.simulation[language]}
                        </div>
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
                        <div className="label">
                          {Translations.depth[language]}
                        </div>
                        <select value={depth} onChange={this.setDepth}>
                          {parameters[model].depths.map((d) => (
                            <option value={d} key={d}>
                              {d} m
                            </option>
                          ))}
                        </select>
                      </div>
                      {"performance" in parameters[model] && (
                        <div className="setting">
                          <div className="label">{Translations.performance[language]}</div>
                          <div>
                            {Object.keys(
                              parameters[model].performance.rmse
                            ).map((k) => (
                              <div key={k} className="performance">
                                <div className="performance-value">
                                  {Math.round(
                                    parameters[model].performance.rmse[k] * 100
                                  ) / 100}
                                  <div className="performance-unit">°C</div>
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
                          <div className="label">{Translations.meteodata[language]}</div>
                          <div>{parameters[model].meteo_source}</div>
                        </div>
                      )}
                      {"hydro_source" in parameters[model] && (
                        <div className="setting">
                          <div className="label">{Translations.hydrodata[language]}</div>
                          <div>{parameters[model].hydro_source}</div>
                        </div>
                      )}
                      {"calibration_source" in parameters[model] && (
                        <div className="setting">
                          <div className="label">{Translations.calibdata[language]}</div>
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

export default Doy;
