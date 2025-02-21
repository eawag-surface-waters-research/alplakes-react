import React, { Component, createRef } from "react";
import { downloadPastYear, download1DHeatmap } from "../functions/download";
import { capitalize } from "../functions/general";
import Translations from "../../../translations.json";
import Information from "../../../components/information/information";
import DatasetHeatmap from "../../../components/d3/dataset/datasetheatmap";
import COLORS from "../../../components/colors/colors.json";
import Loading from "../../../components/loading/loading";
import Expand from "../../../components/expand/expand";
import Period from "../../../components/customselect/period";
import ColorRamp from "../../../components/colors/colorramp";

class PastYear extends Component {
  state = {
    hasBeenVisible: false,
    model: "",
    variable: "",
    start: false,
    end: false,
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

  process = async (model, variable) => {
    const { parameters, language } = this.props;
    const { data, start_date, end_date, start, end } = await downloadPastYear(
      parameters[model].model.toLowerCase(),
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
    const paletteName =
      "paletteName" in parameters[model].displayOptions
        ? parameters[model].displayOptions.paletteName
        : "vik";
    options["palette"] = COLORS[paletteName].map((c) => {
      return { color: [c[0], c[1], c[2]], point: c[3] };
    });
    const display = { ...parameters[model].displayOptions, ...options, data };
    this.setState({
      model,
      variable,
      start,
      end,
      start_date,
      end_date,
      display,
    });
  };

  onVisible = async () => {
    const { parameters } = this.props;
    const model = Object.keys(parameters)[0];
    const variable = parameters[model].parameters[0];
    this.process(model, variable);
  };

  setModel = (event) => {
    const { parameters } = this.props;
    const model = event.target.value;
    const variable = parameters[model].parameters[0];
    this.process(model, variable);
  };

  setVariable = (event) => {
    const { parameters } = this.props;
    const { model } = this.state;
    const variable = parameters[model].parameters.find(
      (p) => p.key === event.target.value
    );
    this.process(model, variable);
  };

  setPeriod = async (event) => {
    const { parameters } = this.props;
    const { model, variable, display } = this.state;
    const start = new Date(event[0]);
    const end = new Date(event[1]);
    display.data = await download1DHeatmap(
      parameters[model].model.toLowerCase(),
      parameters[model].key,
      variable.key,
      start,
      end
    );
    this.setState({ display, start, end });
  };

  setPalette = (event) => {
    const { display } = this.state;
    display.paletteName = event.name;
    display.palette = event.palette;
    this.setState({ display });
  };

  render() {
    var { language, dark, parameters } = this.props;
    var { display, model, variable, start, end, start_date, end_date } =
      this.state;
    const description = {
      EN: "The past year’s data illustrates the parameter’s development throughout the entire water column. It highlights lake stratification and mixing events. All data is derived from calibrated model simulations rather than in-situ measurements.",
      DE: "Die Daten des letzten Jahres veranschaulichen die Entwicklung des Parameters in der gesamten Wassersäule. Sie heben die Schichtung des Sees und Durchmischungsereignisse hervor. Alle Daten stammen aus kalibrierten Modellsimulationen und nicht aus In-situ-Messungen.",
      IT: "I dati dell'ultimo anno illustrano l'andamento del parametro nell'intera colonna d'acqua. Evidenzia gli eventi di stratificazione del lago e gli eventi di miscelazione. Tutti i dati sono derivati da simulazioni calibrate del modello piuttosto che da misurazioni in situ.",
      FR: "Les données de l'année écoulée illustrent l'évolution du paramètre dans l'ensemble de la colonne d'eau. Elles mettent en évidence les phénomènes de stratification et de mélange des lacs. Toutes les données sont dérivées de simulations de modèles calibrés plutôt que de mesures in situ.",
    };
    return (
      <div className="past-year subsection" ref={this.ref}>
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
                <div className="description">{description[language]}</div>
                <Expand
                  openLabel={Translations.settings[language]}
                  closeLabel={Translations.hideSettings[language]}
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
                          {Translations.variable[language]}
                        </div>
                        <select
                          value={variable.key}
                          onChange={this.setVariable}
                        >
                          {parameters[model].parameters.map((p) => (
                            <option value={p.key} key={p.key}>
                              {Translations[p.name][language]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="setting">
                        <div className="label">
                          {Translations.period[language]}
                        </div>
                        <div className="period-selector">
                          <Period
                            period={[start, end]}
                            setPeriod={this.setPeriod}
                            language={language}
                            minDate={start_date}
                            maxDate={end_date}
                            maxPeriod={365}
                          />
                        </div>
                      </div>
                      <div className="setting">
                        <div className="label">Palette</div>
                        <div className="value">{display.paletteName}</div>
                        <ColorRamp
                          onChange={this.setPalette}
                          value={display.palette}
                        />
                      </div>
                      {"performance" in parameters[model] && (
                        <div className="setting">
                          <div className="label">
                            {Translations.performance[language]}
                          </div>
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
                          <div className="label">
                            {Translations.meteodata[language]}
                          </div>
                          <div>{parameters[model].meteo_source}</div>
                        </div>
                      )}
                      {"hydro_source" in parameters[model] && (
                        <div className="setting">
                          <div className="label">
                            {Translations.hydrodata[language]}
                          </div>
                          <div>{parameters[model].hydro_source}</div>
                        </div>
                      )}
                      {"calibration_source" in parameters[model] && (
                        <div className="setting">
                          <div className="label">
                            {Translations.calibdata[language]}
                          </div>
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
