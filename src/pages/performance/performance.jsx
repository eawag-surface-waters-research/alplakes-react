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
import { downloadModelMetadata } from "../lake/functions/download";

class Performance extends Component {
  state = {
    table: { data: [], columns: [] },
    performance: false,
    lake: "",
  };
  openPerformance = (lake) => {
    this.setState({ performance: true, lake: lake });
  };
  togglePerformance = () => {
    this.setState({ performance: !this.state.performance });
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

    const colDict = {
      name: "Name",
      "delft3d-flow": "Delft3D-FLOW RMSE (°C)",
      mitgcm: "MITgcm RMSE (°C)",
      simstrat: "Simstrat RMSE (°C)",
    };

    const columns = ["name", ...modelTypes].map((c) => {
      return { key: c, value: c in colDict ? colDict[c] : c };
    });
    var data = lakeNames.map((l) => ({
      name: { value: l },
      function: () => this.openPerformance(l),
      ...Object.fromEntries(modelTypes.map((m) => [m, { value: "" }])),
    }));

    data = await Promise.all(
      data.map(async (row) => {
        for (let model of Object.keys(available[row.name.value])) {
          let metadata = await downloadModelMetadata(
            model,
            available[row.name.value][model]
          );
          if ("rmse" in metadata) {
            row[model].value = metadata.rmse;
          } else {
            row[model].value = "NA";
          }
        }
        row["name"].value = nameConvert[row["name"].value]
        return row;
      })
    );

    this.setState({ table: { data, columns } });
  }
  render() {
    const language = "EN";
    const { dark } = this.props;
    const { table, performance, lake } = this.state;
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
        <div className="performance">
          <div className="content">
            <div className="text-width">
              <h1>{Translations.performance[language]}</h1>
              <div className="intro">
                Where insitu measurements are available, the performance of the
                different lake models is continuously evaluated. Click on a lake
                name to see more detailed performance information.
              </div>
            </div>
            <SortableTable
              data={table.data}
              columns={table.columns}
              language={language}
              label="performance"
            />
            {performance && (
              <ModelPerformance
                language={language}
                dark={dark}
                lake={lake}
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
