import React, { Component } from "react";
import { Helmet } from "react-helmet";
import NavBar from "../../components/navbar/navbar";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import CONFIG from "../../config.json";
import Footer from "../../components/footer/footer";
import Translations from "../../translations.json";
import unpluggedIcon from "../../img/unplugged.png";
import sortIcon from "../../img/sort.png";
import axios from "axios";
import "./downloads.css";
import ScrollUp from "../../components/scrollup/scrollup";

class ModelInputs extends Component {
  state = {
    model_list: [],
    model: "",
    lake_list: [],
    lake: "",
    example: "examples",
  };
  setModel = (event) => {
    const { list } = this.props;
    var model = event.target.value;
    var lake_list = list
      .filter((l) => l.model === model)
      .map((l) => {
        return { name: l.name, link: l.link };
      });
    var lake = lake_list[0].link;
    this.setState({ model, lake_list, lake });
  };
  setLake = (event) => {
    var lake = event.target.value;
    this.setState({ lake });
  };
  setExample = (event) => {
    var example = event.target.value;
    this.setState({ example });
  };
  componentDidUpdate() {
    const { list } = this.props;
    if (list.length > 0 && this.state.model_list.length === 0) {
      var model_list = [...new Set(list.map((l) => l.model))];
      var model = model_list[0];
      var lake_list = list
        .filter((l) => l.model === model)
        .map((l) => {
          return { name: l.name, link: l.link };
        });
      var lake = lake_list[0].link;
      this.setState({ model_list, model, lake_list, lake });
    }
  }
  render() {
    const { full } = this.props;
    const { model_list, model, lake_list, lake, example } = this.state;
    const link = `${
      CONFIG.alplakes_bucket
    }/simulations/${model.toLowerCase()}/${example}/${lake.toLowerCase()}.zip`;
    return (
      <div className="selector">
        <select value={model} onChange={this.setModel}>
          {model_list.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select value={lake} onChange={this.setLake}>
          {lake_list.map((m) => (
            <option key={m.link} value={m.link}>
              {m.name}
            </option>
          ))}
        </select>
        <select value={example} onChange={this.setExample}>
          <option value="examples">Example</option>
          {full && <option value="downloads">Full</option>}
        </select>
        <a href={link}>
          <button className="download">Download</button>
        </a>
      </div>
    );
  }
}

class ThreeDimensionalResults extends Component {
  state = {
    model_list: [],
    model: "",
    lake_list: [],
    lake: "",
    week_list: [],
    week: "",
  };
  setModel = async (event) => {
    const { list } = this.props;
    var model = event.target.value;
    var lake_list = list
      .filter((l) => l.model === model)
      .map((l) => {
        return { name: l.name, link: l.link };
      });
    var lake = lake_list[0].link;
    var data = await this.getMetadata(model.toLowerCase(), lake.toLowerCase());
    var week_list = this.getWeeks(data.start_date, data.end_date);
    var week = week_list[0];
    this.setState({ model, lake_list, lake, week_list, week });
  };
  setLake = async (event) => {
    const { model } = this.state;
    var lake = event.target.value;
    var data = await this.getMetadata(model.toLowerCase(), lake.toLowerCase());
    var week_list = this.getWeeks(data.start_date, data.end_date);
    var week = week_list[0];
    this.setState({ lake, week_list, week });
  };
  setWeek = (event) => {
    var week = event.target.value;
    this.setState({ week });
  };
  getMetadata = async (model, lake) => {
    var data;
    try {
      ({ data } = await axios.get(
        `${
          CONFIG.alplakes_bucket
        }/simulations/${model}/cache/${lake}/metadata.json?timestamp=${
          Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
        }`
      ));
    } catch (e) {
      ({ data } = await axios.get(
        `${CONFIG.alplakes_api}/simulations/metadata/${model}/${lake}`
      ));
    }
    return data;
  };
  formatAPIDate = (datetime) => {
    var a = new Date(datetime);
    var year = a.getFullYear();
    var month = a.getMonth() + 1;
    var date = a.getDate();
    return `${String(year)}${month < 10 ? "0" + month : month}${
      date < 10 ? "0" + date : date
    }`;
  };
  getWeeks = (minDate, maxDate) => {
    var dates = [];
    const targetDate = new Date(minDate);
    const endDate = new Date(maxDate);
    const daysToSubtract = (targetDate.getDay() + 7) % 7;
    targetDate.setDate(targetDate.getDate() - daysToSubtract);
    while (targetDate <= endDate) {
      dates.push(this.formatAPIDate(targetDate));
      targetDate.setDate(targetDate.getDate() + 7);
    }
    dates.sort((a, b) => b.localeCompare(a));
    return dates;
  };
  async componentDidUpdate() {
    const { list } = this.props;
    if (list.length > 0 && this.state.model_list.length === 0) {
      var model_list = [...new Set(list.map((l) => l.model))];
      var model = model_list[0];
      var lake_list = list
        .filter((l) => l.model === model)
        .map((l) => {
          return { name: l.name, link: l.link };
        });
      var lake = lake_list[0].link;
      var data = await this.getMetadata(
        model.toLowerCase(),
        lake.toLowerCase()
      );
      var week_list = this.getWeeks(data.start_date, data.end_date);
      var week = week_list[0];

      this.setState({ model_list, model, lake_list, lake, week_list, week });
    }
  }
  render() {
    const { model_list, model, lake_list, lake, week_list, week } = this.state;
    return (
      <div className="selector">
        <select value={model} onChange={this.setModel}>
          {model_list.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select value={lake} onChange={this.setLake}>
          {lake_list.map((m) => (
            <option key={m.link} value={m.link}>
              {m.name}
            </option>
          ))}
        </select>
        <select value={week} onChange={this.setWeek}>
          {week_list.map((m) => (
            <option key={m} value={m}>
              {m.slice(0, 4) + "-" + m.slice(4, 6) + "-" + m.slice(6)}
            </option>
          ))}
        </select>
        <a
          href={`${
            CONFIG.alplakes_api
          }/simulations/file/${model.toLowerCase()}/${lake.toLowerCase()}/${week}`}
        >
          <button className="download">Download</button>
        </a>
      </div>
    );
  }
}

class OneDimensionalResults extends Component {
  state = {
    model_list: [],
    model: "",
    lake_list: [],
    lake: "",
    variable_list: [],
    variable: "",
  };
  setModel = async (event) => {
    const { list } = this.props;
    var model = event.target.value;
    var lake_list = list
      .filter((l) => l.model === model)
      .map((l) => {
        return { name: l.name, link: l.link };
      });
    var lake = lake_list[0].link;
    this.setState({ model, lake_list, lake });
  };
  setLake = async (event) => {
    var lake = event.target.value;
    this.setState({ lake });
  };
  setVariable = (event) => {
    var variable = event.target.value;
    this.setState({ variable });
  };
  async componentDidUpdate() {
    const { list } = this.props;
    if (list.length > 0 && this.state.model_list.length === 0) {
      var model_list = [...new Set(list.map((l) => l.model))];
      var model = model_list[0];
      var lake_list = list
        .filter((l) => l.model === model)
        .map((l) => {
          return { name: l.name, link: l.link };
        });
      var lake = lake_list[0].link;
      var variable_list = [
        "T_out.dat",
        "S_out.dat",
        "TotalIceH_out.dat",
        "OXY_sat_out.dat",
        "NN_out.dat",
        "nuh_out.dat",
      ];
      var variable = variable_list[0];
      this.setState({
        model_list,
        model,
        lake_list,
        lake,
        variable_list,
        variable,
      });
    }
  }
  render() {
    const { model_list, model, lake_list, lake, variable_list, variable } =
      this.state;
    var variable_dict = {
      "T_out.dat": "Temperature",
      "S_out.dat": "Salinity",
      "TotalIceH_out.dat": "Ice cover",
      "OXY_sat_out.dat": "Oxygen saturation",
      "NN_out.dat": "Brunt-Väisälä (NN)",
      "nuh_out.dat": "Turbulent diffusivity (nuh)",
    };
    return (
      <div className="selector">
        <select value={model} onChange={this.setModel}>
          {model_list.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select value={lake} onChange={this.setLake}>
          {lake_list.map((m) => (
            <option key={m.link} value={m.link}>
              {m.name}
            </option>
          ))}
        </select>
        <select value={variable} onChange={this.setVariable}>
          {variable_list.map((m) => (
            <option key={m} value={m}>
              {variable_dict[m]}
            </option>
          ))}
        </select>
        <a
          href={`${
            CONFIG.alplakes_bucket
          }/simulations/${model.toLowerCase()}/results/${lake.toLowerCase()}/${variable}`}
        >
          <button className="download">Download</button>
        </a>
      </div>
    );
  }
}

class Downloads extends Component {
  state = {
    swagger_error: false,
    one_dimensional: [],
    three_dimensional: [],
  };

  constructor(props) {
    super(props);
    this.divRef = React.createRef();
  }

  scrollToSection = (sectionRef) => {
    if (sectionRef.current) {
      window.scrollTo({
        top: sectionRef.current.offsetTop,
        behavior: "smooth",
      });
    }
  };

  async componentDidMount() {
    window.scrollTo(0, 0);
    var { one_dimensional, three_dimensional, swagger_error } = this.state;
    try {
      ({ data: one_dimensional } = await axios.get(
        CONFIG.alplakes_bucket +
          `/static/website/metadata/${CONFIG.branch}/one_dimensional.json`
      ));
    } catch (e) {}
    try {
      ({ data: three_dimensional } = await axios.get(
        CONFIG.alplakes_bucket +
          `/static/website/metadata/${CONFIG.branch}/three_dimensional.json`
      ));
    } catch (e) {}
    try {
      await axios.get(`${CONFIG.alplakes_api}`);
    } catch (e) {
      swagger_error = true;
    }
    this.setState({ one_dimensional, three_dimensional, swagger_error });
  }
  render() {
    const language = "EN";
    var { one_dimensional, three_dimensional, swagger_error } = this.state;
    return (
      <React.Fragment>
        <Helmet>
          <title>{Translations.downloads[language]} - Alplakes</title>
          <meta
            name="description"
            content="Discover the open source data available on Alplakes."
          />
        </Helmet>
        <NavBar {...this.props} relative={true} />
        <div className="content-width downloads">
          <div className="text-width">
            <div className="header">
              <h1> {Translations.downloads[language]}</h1>
              <div
                className="link"
                onClick={() => this.scrollToSection(this.divRef)}
              >
                API Documentation
                <img src={sortIcon} alt="Down" />
              </div>
            </div>
            <h2>Model Input Files</h2>
            <p>
              A set of example input files are provided for users that want to
              adapt the models to their own purposes. For more information on
              how to generate these files please see the <b>Models</b> page.
            </p>
            <h4>3D Models</h4>
            <ModelInputs list={three_dimensional} />
            <h4>1D Models</h4>
            <ModelInputs list={one_dimensional} full={true} />
            <h2>Model Output Files</h2>
            <p>
              Raw model results can be accessed using the forms below. For
              formatted subsets of the output files please use the API.
            </p>
            <h4>3D Models</h4>
            <p>
              Available per week in NetCDF format. The dimensions and variables
              are not self explanatory, you can refer to the notebook{" "}
              <a
                href="https://github.com/eawag-surface-waters-research/alplakes-simulations/blob/master/notebooks/process_results.ipynb"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>{" "}
              for more information.
            </p>
            <ThreeDimensionalResults list={three_dimensional} />
            <h4>1D Models</h4>
            <p>
              Available in text format. The results are formatted in a CSV where
              the column headers refer to the depth and the first column is the
              number of days after the reference date (01.01.1981). The notebook{" "}
              <a
                href="https://github.com/Eawag-AppliedSystemAnalysis/operational-simstrat/blob/master/notebooks/process_results.ipynb"
                target="_blank"
                rel="noreferrer"
              >
                here
              </a>{" "}
              provides an example of processing the raw data.
            </p>
            <OneDimensionalResults list={one_dimensional} />
            <h2 ref={this.divRef}>API Documentation</h2>
            <p>
              The Alplakes API provides direct access to terabytes of simulation
              data. The API supports geospatial and temporal queries, allowing
              access to subsets of the data for easier handling. Remote sensing
              products are stored in an S3 bucket, and the file URL's are
              available via the metadata endpoints in the API documentation
              below.
            </p>
            <p>
              Please email{" "}
              <a href="mailto:james.runnalls@eawag.ch">
                james.runnalls@eawag.ch
              </a>{" "}
              for any questions regarding the API or to be kept informed of any
              future updates.
            </p>
          </div>

          {swagger_error ? (
            <div className="error">
              <img src={unpluggedIcon} alt="unplugged" />
              We are experiencing connection issues.
              <div className="suberror">
                Try accessing the documentation directly{" "}
                <a href={`${CONFIG.alplakes_api}/docs`}>here</a> or try again
                later.
              </div>
            </div>
          ) : (
            <SwaggerUI
              url={CONFIG.alplakes_api + "/openapi.json"}
              docExpansion="list"
              responseInterceptor={(response) => {
                if (response.status >= 400) {
                  // Handle client or server errors
                  console.error("Error response:", response);
                } else {
                  // Handle successful responses
                }
                return response;
              }}
            />
          )}
        </div>
        <ScrollUp />
        <Footer {...this.props} />
      </React.Fragment>
    );
  }
}

export default Downloads;
