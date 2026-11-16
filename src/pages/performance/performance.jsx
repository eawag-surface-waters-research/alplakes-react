import React, { Component } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import NavBar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import Translations from "../../translations.json";
import CONFIG from "../../config.json";
import "./performance.css";
import SortableTable from "../../components/table/table";
import ScrollUp from "../../components/scrollup/scrollup";
import ModelPerformance from "../../components/modelperformance/modelperformance";
import {
  downloadModelMetadata,
  download2DMetadata,
} from "../lake/functions/download";
import {
  defaultParameter,
  performanceParameters,
  parameterConfig,
} from "../../components/modelperformance/parameters";

class Performance extends Component {
  state = {
    tables: [],
    performance: false,
    lake: "",
    parameter: defaultParameter,
  };
  openPerformance = (lake, parameter) => {
    this.setState({ performance: true, lake, parameter });
  };
  togglePerformance = () => {
    this.setState({ performance: !this.state.performance });
  };
  buildTable = async (parameter, models, nameConvert) => {
    const { unit } = parameterConfig(parameter);
    const modelNames = {
      "delft3d-flow": "Delft3D-FLOW",
      mitgcm: "MITgcm",
      simstrat: "Simstrat",
      swan: "SWAN",
    };
    const twoDModels = ["swan"];
    const lakeNames = Object.keys(models);
    const modelTypes = [
      ...new Set(
        Object.values(models)
          .flat()
          .flatMap((item) => item.models.map((model) => model.type))
      ),
    ];

    const available = Object.fromEntries(
      Object.entries(models).map(([lakeName, locations]) => [
        lakeName,
        Object.fromEntries(
          locations.flatMap((loc) => loc.models.map((m) => [m.type, m.id]))
        ),
      ])
    );

    const columns = ["name", ...modelTypes].map((c) => {
      if (c === "name") return { key: c, value: "Name" };
      return { key: c, value: `${modelNames[c] || c} RMSE (${unit})` };
    });
    var data = lakeNames.map((l) => ({
      name: { value: l },
      function: () => this.openPerformance(l, parameter),
      ...Object.fromEntries(modelTypes.map((m) => [m, { value: "" }])),
    }));

    data = await Promise.all(
      data.map(async (row) => {
        for (let model of Object.keys(available[row.name.value])) {
          let metadata = false;
          try {
            metadata = twoDModels.includes(model)
              ? await download2DMetadata(model, available[row.name.value][model])
              : await downloadModelMetadata(
                  model,
                  available[row.name.value][model]
                );
          } catch (e) {
            console.error(e);
          }
          row[model].value = metadata && "rmse" in metadata ? metadata.rmse : "NA";
        }
        row["name"].value = nameConvert[row["name"].value];
        return row;
      })
    );
    return { parameter, data, columns };
  };
  async componentDidMount() {
    var { data: models } = await axios.get(
      `${CONFIG.alplakes_bucket}/static/website/metadata/${CONFIG.branch}/performance.json`
    );

    var { data: list } = await axios.get(
      `${CONFIG.alplakes_bucket}/static/website/metadata/${CONFIG.branch}/list.json`
    );

    const nameConvert = Object.fromEntries(
      list.map((lake) => [lake.key, lake.name.EN])
    );

    const byParameter = {};
    for (const [lake, sensors] of Object.entries(models)) {
      for (const sensor of sensors) {
        const parameter = sensor.parameter || defaultParameter;
        if (!(parameter in performanceParameters)) continue;
        byParameter[parameter] = byParameter[parameter] || {};
        byParameter[parameter][lake] = byParameter[parameter][lake] || [];
        byParameter[parameter][lake].push(sensor);
      }
    }

    const tables = await Promise.all(
      Object.keys(performanceParameters)
        .filter((p) => p in byParameter)
        .map((p) => this.buildTable(p, byParameter[p], nameConvert))
    );

    this.setState({ tables });
  }
  render() {
    const language = "EN";
    const { dark } = this.props;
    const { tables, performance, lake, parameter } = this.state;
    return (
      <React.Fragment>
        <Helmet>
          <title>Performance - Alplakes</title>
          <meta
            name="description"
            content="Live performance comparison of Alplakes models."
          />
        </Helmet>
        <NavBar {...this.props} relative={true} />
        <div className="performance minheight">
          <div className="content">
            <div className="text-width">
              <h1>{Translations.performance[language]}</h1>
              <div className="intro">
                Where insitu measurements are available, the performance of the
                different lake models is continuously evaluated. Click on a lake
                name to see more detailed performance information.
              </div>
            </div>
            {tables.map((table) => (
              <React.Fragment key={table.parameter}>
                {tables.length > 1 && (
                  <h2>
                    {
                      Translations[parameterConfig(table.parameter).label][
                        language
                      ]
                    }
                  </h2>
                )}
                <SortableTable
                  data={table.data}
                  columns={table.columns}
                  language={language}
                  label={
                    table.parameter === defaultParameter
                      ? "performance"
                      : `performance_${table.parameter}`
                  }
                />
              </React.Fragment>
            ))}
            {performance && (
              <ModelPerformance
                language={language}
                dark={dark}
                lake={lake}
                parameter={parameter}
                togglePerformance={this.togglePerformance}
              />
            )}
          </div>
        </div>
        <ScrollUp />
        <Footer {...this.props} />
      </React.Fragment>
    );
  }
}

export default Performance;
