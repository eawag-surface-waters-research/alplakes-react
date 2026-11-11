import React, { Component } from "react";
import {
  downloadModelMetadata,
  download1DLinegraph,
} from "../functions/download";
import { capitalize } from "../functions/general";
import Translations from "../../../translations.json";
import SummaryTable from "../../../components/summarytable/summarytable";
import { summariseData } from "../../../global";
import Information from "../../../components/information/information";
import DatasetLinegraph from "../../../components/d3/dataset/datasetlinegraph";
import Expand from "../../../components/expand/expand";
import Period from "../../../components/customselect/period";
import Depth from "../../../components/customselect/depth";
import Loading from "../../../components/loading/loading";
import ModelPerformanceButton from "../../../components/modelperformance/modelperformancebutton";

const DA_PALETTE = ["#F2C14E", "#47D6AC", "#e0533d", "#8a63d2"];

const defaultRunKey = (parameter) => parameter.default_run || parameter.key;

const isPercentileKey = (key) => /_p(10|90)$/.test(key);

const hasPercentiles = (variables, key) =>
  !!variables && `${key}_p10` in variables && `${key}_p90` in variables;

// Percentiles only come from the ICON-CH2-EPS ensemble, so a lake that has them
// is forced by ICON even if its metadata still names Visual Crossing.
const meteoSource = (source, variables) =>
  hasPercentiles(variables, "T")
    ? source.replace(/Visual\s?Crossing/gi, "MeteoSwiss ICON")
    : source;

const isNum = (v) => v !== null && v !== undefined && isFinite(v);

// Attach a p10-p90 band to a series only when there is something to draw,
// so lakes/periods without percentiles render exactly as before.
const withBand = (series, lower, upper) => {
  if (
    !Array.isArray(lower) ||
    !Array.isArray(upper) ||
    lower.length !== series.x.length ||
    upper.length !== series.x.length ||
    !lower.some(isNum) ||
    !upper.some(isNum)
  )
    return series;
  return {
    ...series,
    confidenceAxis: "y",
    lower,
    upper,
    confidenceLabel: "10–90%",
  };
};

const getRuns = (parameter) =>
  Array.isArray(parameter.runs) && parameter.runs.length > 0
    ? parameter.runs
    : [{ name: parameter.name, key: parameter.key }];

const runColorMap = (runs, defKey, dark) => {
  const map = {};
  let i = 0;
  runs.forEach((r) => {
    if (r.key === defKey) {
      map[r.key] = dark ? "#ffffff" : "#000000";
    } else {
      map[r.key] = DA_PALETTE[i % DA_PALETTE.length];
      i++;
    }
  });
  return map;
};

class PlaceholderGraph extends Component {
  render() {
    return (
      <div>
        <div className="sketelon-graph">
          <div className="skeleton-block pulse-border" />
          <div className="skeleton-block pulse-border" />
          <div className="skeleton-block pulse-border" />
          <div className="skeleton-block pulse-border" />
          <div className="skeleton-block pulse-border right" />
        </div>
        <div className="skeleton-data" />
      </div>
    );
  }
}

class Graph extends Component {
  state = {
    open: false,
    display: false,
    start: false,
    end: false,
    start_date: false,
    end_date: false,
    variable: false,
    variables: false,
    depth: false,
    depths: false,
    noData: false,
    loading: false,
    runs: [],
    activeRuns: {},
  };
  runVariables = {};

  toggle = () => {
    this.setState({ open: !this.state.open });
  };

  loadRunVariables = async (runs) => {
    const { parameter } = this.props;
    const missing = runs.filter((r) => !(r.key in this.runVariables));
    const variables = await Promise.all(
      missing.map(async (r) => {
        try {
          const metadata = await downloadModelMetadata(
            parameter.model.toLowerCase(),
            r.key
          );
          return (metadata && metadata.variables) || {};
        } catch (e) {
          return {};
        }
      })
    );
    missing.forEach((r, i) => (this.runVariables[r.key] = variables[i]));
  };

  fetchRun = async (runKey, variableKey, depth, start, end) => {
    const { parameter } = this.props;
    const model = parameter.model.toLowerCase();
    const percentiles =
      hasPercentiles(this.runVariables[runKey], variableKey) &&
      end > new Date();
    const [data, bandData] = await Promise.all([
      download1DLinegraph(model, runKey, start, end, depth, variableKey, false),
      percentiles
        ? download1DLinegraph(
            model,
            runKey,
            start,
            end,
            depth,
            [`${variableKey}_p10`, `${variableKey}_p90`],
            false
          )
        : Promise.resolve(false),
    ]);
    if (!data) return false;
    const series = {
      x: data.time.map((t) => new Date(t)),
      y: data["variables"][variableKey]["data"],
    };
    if (!bandData || !bandData.variables) return series;
    const p10 = bandData.variables[`${variableKey}_p10`];
    const p90 = bandData.variables[`${variableKey}_p90`];
    return withBand(series, p10 && p10.data, p90 && p90.data);
  };

  refresh = async ({ variable, depth, start, end }) => {
    const { parameter, dark, language } = this.props;
    const { activeRuns, display } = this.state;
    const runs = getRuns(parameter);
    const defKey = defaultRunKey(parameter);
    const isT = variable.key === "T";
    const baseRun = runs.find((r) => r.key === parameter.key) || {
      key: parameter.key,
      name: parameter.name,
    };
    const targetRuns = isT ? runs.filter((r) => activeRuns[r.key]) : [baseRun];
    const colorMap = runColorMap(runs, defKey, dark);
    await this.loadRunVariables(targetRuns);
    const results = await Promise.all(
      targetRuns.map((r) => this.fetchRun(r.key, variable.key, depth, start, end))
    );
    if (results.some((r) => r === false)) {
      window.alert(Translations.serverAlert[language]);
      this.setState({ loading: false });
      return;
    }
    const seriesData = targetRuns.map((r, i) => ({
      ...results[i],
      lineColor: colorMap[r.key],
      name: r.name,
    }));
    display.data = seriesData;
    display.ylabel = variable.description;
    display.yunits = variable.unit.replace("deg", "°");
    display.noData = seriesData.every((s) => s.y.every((item) => item === null));
    this.setState({ variable, depth, start, end, display, loading: false });
  };

  setPeriod = async (event) => {
    const { variable, depth } = this.state;
    this.setState({ loading: true }, () =>
      this.refresh({ variable, depth, start: event[0], end: event[1] })
    );
  };

  setDepth = async (depth) => {
    const { variable, start, end } = this.state;
    this.setState({ loading: true }, () =>
      this.refresh({ variable, depth, start, end })
    );
  };

  setVariable = async (event) => {
    const variable_name = event.target.value;
    const { variables, start, end, depth } = this.state;
    const variable = variables.find((v) => v.key === variable_name);
    this.setState({ loading: true }, () =>
      this.refresh({ variable, depth, start, end })
    );
  };

  toggleRun = (runKey) => {
    const { activeRuns, variable, depth, start, end } = this.state;
    const next = { ...activeRuns, [runKey]: !activeRuns[runKey] };
    if (!Object.values(next).some(Boolean)) return;
    this.setState({ activeRuns: next, loading: true }, () =>
      this.refresh({ variable, depth, start, end })
    );
  };

  componentDidUpdate() {
    const { data, parameter, dark } = this.props;
    if (this.state.display === false && data) {
      const variables = Object.keys(data.metadata.variables)
        .filter((v) => v !== "S" && !isPercentileKey(v))
        .map((v) => {
          data.metadata.variables[v].key = v;
          return data.metadata.variables[v];
        });
      const variable = variables.find((v) => v.key === "T");
      const depths = data.metadata.depth;
      const depth = depths[0];
      const runs = getRuns(parameter);
      const defKey = defaultRunKey(parameter);
      const colorMap = runColorMap(runs, defKey, dark);
      const activeRuns = {};
      runs.forEach((r) => (activeRuns[r.key] = r.key === defKey));
      const defRun = runs.find((r) => r.key === defKey) || runs[0];
      this.runVariables[defKey] = data.metadata.variables;
      const display = {
        xlabel: "time",
        xunits: "",
        ylabel: variable.description,
        yunits: variable.unit.replace("deg", "°"),
        data: [
          withBand(
            {
              x: data.dt,
              y: data.value,
              lineColor: colorMap[defKey],
              name: defRun.name,
            },
            data.lower,
            data.upper
          ),
        ],
        curve: true,
        grid: true,
        noData: data.value.every((item) => item === null),
      };
      this.setState({
        display,
        start: data.start,
        end: data.end,
        start_date: data.metadata.start_date,
        end_date: data.metadata.end_date,
        variable,
        variables,
        depth,
        depths,
        runs,
        activeRuns,
      });
    }
  }
  render() {
    const {
      open,
      display,
      start,
      end,
      start_date,
      end_date,
      variable,
      variables,
      depth,
      depths,
      loading,
      runs,
      activeRuns,
    } = this.state;
    const { data, language, dark, parameter, togglePerformance } = this.props;
    const defKey = defaultRunKey(parameter);
    const colorMap = runColorMap(runs, defKey, dark);
    const showRuns = variable && variable.key === "T" && runs.length > 1;
    const activeRunList = showRuns ? runs.filter((r) => activeRuns[r.key]) : [];
    const defRun = runs.find((r) => r.key === defKey);
    const defaultBeta = !!(defRun && defRun.beta);
    const bandSeries =
      display && Array.isArray(display.data)
        ? display.data.filter((s) => s.confidenceAxis)
        : [];
    const showRunLegend = activeRunList.length > 1;
    const showLegend = showRunLegend || bandSeries.length > 0;
    const bandColor =
      bandSeries.length === 1
        ? bandSeries[0].lineColor
        : dark
        ? "#ffffff"
        : "#000000";
    const description = {
      EN: "1D lake models simplify lake processes by representing the lake as a single vertical column, divided into layers from the surface to the bottom. Instead of simulating horizontal variations, they focus on vertical changes in temperature, density, and other properties.",
      DE: "1D-See-Modelle vereinfachen die Prozesse in Seen, indem sie den See als eine einzige vertikale Säule darstellen, die in Schichten von der Oberfläche bis zum Grund unterteilt ist. Anstatt horizontale Schwankungen zu simulieren, konzentrieren sie sich auf vertikale Veränderungen von Temperatur, Dichte und anderen Eigenschaften.",
      IT: "I modelli 1D semplificano i processi lacustri rappresentando il lago come un'unica colonna verticale, suddivisa in strati dalla superficie al fondo. Invece di simulare le variazioni orizzontali, si concentrano sulle variazioni verticali di temperatura, densità e altre proprietà.",
      FR: "Les modèles de lacs 1D simplifient les processus lacustres en représentant le lac comme une colonne verticale unique, divisée en couches de la surface au fond. Au lieu de simuler les variations horizontales, ils se concentrent sur les changements verticaux de température, de densité et d'autres propriétés.",
    };
    var name = parameter.name;
    if (name.includes(":")) name = name.split(":")[1];
    return open ? (
      <div className="map-sidebar">
        <div className="map-sidebar-header">
          <div className="title">
            {name}
            {defaultBeta && <span className="run-beta">beta</span>}
          </div>
          <div className="minimise" onClick={this.toggle}>
            {Translations.hideDetails[language]}
          </div>
        </div>
        <div
          className={
            showLegend ? "map-sidebar-left has-legend" : "map-sidebar-left"
          }
        >
          {data.metadata.rmse && (
            <ModelPerformanceButton
              rmse={data.metadata.rmse}
              language={language}
              open={togglePerformance}
            />
          )}
          <div className="line-graph-container">
            <DatasetLinegraph
              {...display}
              dark={dark}
              language={language}
              legend={false}
            />
            {showLegend && (
              <div className="graph-legend">
                {showRunLegend &&
                  activeRunList.map((r) => (
                    <div className="item" key={"legend_" + r.key}>
                      <div
                        className="line"
                        style={{ borderColor: colorMap[r.key] }}
                      ></div>
                      <div className="text">{r.name}</div>
                    </div>
                  ))}
                {bandSeries.length > 0 && (
                  <div className="item band-item" key="legend_band">
                    <div
                      className="box"
                      style={{ backgroundColor: bandColor }}
                    ></div>
                    <div className="text">
                      {Translations.ensembleRange[language]}
                    </div>
                    <Information
                      information={Translations.ensembleRangeInfo[language]}
                      small={true}
                      above={true}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          {loading && (
            <div className="loading-graph">
              <Loading />
            </div>
          )}
        </div>
        <div className="map-sidebar-right">
          {display && (
            <div className="graph-properties">
              <div className="description">{description[language]}</div>
              <Expand
                settings={true}
                openLabel={Translations.settings[language]}
                closeLabel={Translations.hideSettings[language]}
                content={
                  <React.Fragment>
                    <div className="setting">
                      <div className="label">
                        {Translations.variable[language]}
                      </div>
                      <select value={variable.key} onChange={this.setVariable}>
                        {variables.map((p) => (
                          <option value={p.key} key={p.key}>
                            {p.description}
                          </option>
                        ))}
                      </select>
                      {["OxygenSat", "Oxygen"].includes(variable.key) && (
                        <div className="setting-warning">
                          {Translations.oxygenWarning[language]}
                        </div>
                      )}
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
                          maxPeriod={365 * 10}
                        />
                      </div>
                    </div>
                    <Depth
                      depth={depth}
                      depths={depths}
                      onChange={this.setDepth}
                      language={language}
                    />
                    {showRuns && (
                      <div className="setting">
                        <div className="label">
                          {Translations.runs[language]}
                        </div>
                        <div className="run-list">
                          {runs.map((r) => (
                            <label className="run-item" key={"run_" + r.key}>
                              <input
                                type="checkbox"
                                checked={!!activeRuns[r.key]}
                                onChange={() => this.toggleRun(r.key)}
                              />
                              <span
                                className="run-swatch"
                                style={{ backgroundColor: colorMap[r.key] }}
                              />
                              {r.name}
                              {r.beta && <span className="run-beta">beta</span>}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="setting half">
                      <div className="label">
                        {Translations.model[language]}
                      </div>
                      <div>{parameter.model}</div>
                    </div>
                    <div className="setting half">
                      <div className="label">
                        {Translations.source[language]}
                      </div>
                      <div>
                        <a
                          href="https://www.eawag.ch"
                          alt="Eawag"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Eawag
                        </a>
                      </div>
                    </div>
                    {"performance" in parameter && (
                      <div className="setting">
                        <div className="label">
                          {Translations.performance[language]}
                        </div>
                        <div>
                          {Object.keys(parameter.performance.rmse)
                            .filter((k) =>
                              isFinite(parameter.performance.rmse[k])
                            )
                            .map((k) => (
                              <div key={k} className="performance">
                                <div className="performance-value">
                                  {Math.round(
                                    parameter.performance.rmse[k] * 100
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
                    {"meteo_source" in parameter && (
                      <div className="setting">
                        <div className="label">
                          {Translations.meteodata[language]}
                        </div>
                        <div>
                          {meteoSource(
                            parameter.meteo_source,
                            data.metadata.variables
                          )}
                        </div>
                      </div>
                    )}
                    {"hydro_source" in parameter && (
                      <div className="setting">
                        <div className="label">
                          {Translations.hydrodata[language]}
                        </div>
                        <div>{parameter.hydro_source}</div>
                      </div>
                    )}
                    {"calibration_source" in parameter && (
                      <div className="setting">
                        <div className="label">
                          {Translations.calibdata[language]}
                        </div>
                        <div>{parameter.calibration_source}</div>
                      </div>
                    )}
                  </React.Fragment>
                }
              />
            </div>
          )}
        </div>
      </div>
    ) : (
      <div
        className="clickable-box"
        onClick={this.toggle}
        title="Click for details"
      >
        <div className="right">{parameter.model}</div>
        <div className="title">
          {name}
          {defaultBeta && <span className="run-beta">beta</span>}
        </div>
        {data && data.summary ? (
          <SummaryTable
            start={data.start}
            end={data.end}
            dt={data.dt}
            value={data.value}
            lower={data.lower}
            upper={data.upper}
            summary={data.summary}
            unit={"°"}
            language={language}
          />
        ) : (
          <PlaceholderGraph />
        )}
      </div>
    );
  }
}

class OneDModel extends Component {
  state = {
    selected: false,
    data: false,
  };
  async componentDidMount() {
    var { parameters } = this.props;
    var data = {};
    for (let i = 0; i < parameters.length; i++) {
      let runKey = defaultRunKey(parameters[i]);
      let metadata = await downloadModelMetadata(
        parameters[i].model.toLowerCase(),
        runKey
      );
      if (
        "simstrat_oxygen" in parameters[0] &&
        parameters[0]["simstrat_oxygen"] === false
      ) {
        ["Oxygen", "OxygenSat"].forEach(
          (key) => delete metadata.variables[key]
        );
      }
      let depth = Math.min(...metadata.depth);
      let download = await download1DLinegraph(
        parameters[i].model.toLowerCase(),
        runKey,
        new Date(metadata.end_date.getTime() - 5 * 24 * 60 * 60 * 1000),
        metadata.end_date,
        depth,
        parameters[i].parameter,
        true
      );
      let start = new Date(download.time[0]);
      let end = new Date(download.time[download.time.length - 1]);
      let summary = false;
      if (end > new Date()) {
        ({ summary, start, end } = summariseData(
          download["time"],
          download["variables"][parameters[i].parameter]["data"]
        ));
      }
      const key = parameters[i].parameter;
      const p10 = download["variables"][`${key}_p10`];
      const p90 = download["variables"][`${key}_p90`];
      data[parameters[i].key] = {
        summary,
        start,
        end,
        metadata,
        dt: download["time"].map((t) => new Date(t)),
        value: download["variables"][key]["data"],
        lower: p10 ? p10.data : false,
        upper: p90 ? p90.data : false,
      };
    }
    this.setState({ data });
  }
  render() {
    var { language, parameters, dark, togglePerformance } = this.props;
    var { data } = this.state;
    return (
      <div className="onedmodel subsection">
        <h3>
          {Translations.watertemperature[language]} - 1D{" "}
          <Information information={Translations.onedmodelText[language]} />
        </h3>
        <div className="clickable-box-parent">
          {parameters.map((p) => (
            <Graph
              data={data[p.key]}
              key={p.key}
              language={language}
              dark={dark}
              parameter={p}
              togglePerformance={togglePerformance}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default OneDModel;
