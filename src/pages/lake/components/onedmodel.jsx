import React, { Component } from "react";
import {
  downloadModelMetadata,
  download1DLinegraph,
} from "../functions/download";
import { capitalize } from "../functions/general";
import Translations from "../../../translations.json";
import SummaryTable from "../../../components/summarytable/summarytable";
import { summariseData } from "../functions/general";
import Information from "../../../components/information/information";
import DatasetLinegraph from "../../../components/d3/dataset/datasetlinegraph";
import Expand from "../../../components/expand/expand";
import Period from "../../../components/customselect/period";
import Depth from "../../../components/customselect/depth";
import Loading from "../../../components/loading/loading";

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
  };
  toggle = () => {
    this.setState({ open: !this.state.open });
  };
  setPeriod = async (event) => {
    this.setState({ loading: true }, async () => {
      const { variable, display, depth } = this.state;
      const { parameter } = this.props;
      const start = event[0];
      const end = event[1];
      const data = await download1DLinegraph(
        parameter.model.toLowerCase(),
        parameter.key,
        start,
        end,
        depth,
        variable.key,
        false
      );
      var x = data.time.map((t) => new Date(t));
      var y = data["variables"][variable.key]["data"];
      display.data = { x, y };
      display.noData = y.every((item) => item === null);
      this.setState({ start, end, display, loading: false });
    });
  };

  setDepth = async (depth) => {
    this.setState({ loading: true }, async () => {
      const { parameter } = this.props;
      const { variable, display, start, end } = this.state;
      const data = await download1DLinegraph(
        parameter.model.toLowerCase(),
        parameter.key,
        start,
        end,
        depth,
        variable.key,
        false
      );
      var x = data.time.map((t) => new Date(t));
      var y = data["variables"][variable.key]["data"];
      display.data = { x, y };
      display.noData = y.every((item) => item === null);
      this.setState({ depth, display, loading: false });
    });
  };

  setVariable = async (event) => {
    const variable_name = event.target.value;
    this.setState({ loading: true }, async () => {
      const { parameter } = this.props;
      const { variables, display, start, end, depth } = this.state;
      const variable = variables.find((v) => v.key === variable_name);
      const data = await download1DLinegraph(
        parameter.model.toLowerCase(),
        parameter.key,
        start,
        end,
        depth,
        variable.key,
        false
      );
      var x = data.time.map((t) => new Date(t));
      var y = data["variables"][variable.key]["data"];
      display.data = { x, y };
      display.ylabel = variable.description;
      display.yunits = variable.unit.replace("deg", "°");
      display.noData = y.every((item) => item === null);
      this.setState({ variable, display, loading: false });
    });
  };
  componentDidUpdate() {
    const { data } = this.props;
    if (this.state.display === false && data) {
      const variables = Object.keys(data.metadata.variables)
        .filter((v) => v !== "S")
        .map((v) => {
          data.metadata.variables[v].key = v;
          return data.metadata.variables[v];
        });
      const variable = variables.find((v) => v.key === "T");
      const depths = data.metadata.depth;
      const depth = depths[0];
      const display = {
        xlabel: "time",
        xunits: "",
        ylabel: variable.description,
        yunits: variable.unit.replace("deg", "°"),
        data: { x: data.dt, y: data.value },
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
    } = this.state;
    const { data, language, dark, parameter } = this.props;
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
          <div className="title">{name}</div>
          <div className="minimise" onClick={this.toggle}>
            {Translations.hideDetails[language]}
          </div>
        </div>
        <div className="map-sidebar-left">
          <div className="line-graph-container">
            <DatasetLinegraph {...display} dark={dark} language={language} />
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
                    {"performance" in parameter && (
                      <div className="setting">
                        <div className="label">
                          {Translations.performance[language]}
                        </div>
                        <div>
                          {Object.keys(parameter.performance.rmse).map((k) => (
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
                        <div>{parameter.meteo_source}</div>
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
        <div className="title">{name}</div>
        {data && data.summary ? (
          <SummaryTable
            start={data.start}
            end={data.end}
            dt={data.dt}
            value={data.value}
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
      let metadata = await downloadModelMetadata(
        parameters[i].model.toLowerCase(),
        parameters[i].key
      );
      let depth = Math.min(...metadata.depth);
      let download = await download1DLinegraph(
        parameters[i].model.toLowerCase(),
        parameters[i].key,
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
      data[parameters[i].key] = {
        summary,
        start,
        end,
        metadata,
        dt: download["time"].map((t) => new Date(t)),
        value: download["variables"][parameters[i].parameter]["data"],
      };
    }
    this.setState({ data });
  }
  render() {
    var { language, parameters, dark } = this.props;
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
            />
          ))}
        </div>
      </div>
    );
  }
}

export default OneDModel;
