import React, { Component } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import NavBar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import Translations from "../../translations.json";
import CONFIG from "../../config.json";
import "./models.css";
import SortableTable from "../../components/table/table";

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
    var lake_list = list.filter((l) => l.model === model).map((l) => l.name);
    var lake = lake_list[0];
    this.setState({ model, lake_list, lake });
  };
  setLake = (event) => {
    var lake = event.target.value;
    this.setState({ lake });
  };
  setExample = (event) => {
    var example = event.target.value;
    if (example === "downloads") {
      const userInput = window.prompt("Please enter the password:");
      if (userInput === "simstrat") {
        this.setState({ example });
      } else if (userInput !== null) {
        window.alert("Incorrect password!")
      }
    } else {
      this.setState({ example });
    }
  };
  componentDidUpdate() {
    const { list } = this.props;
    if (list.length > 0 && this.state.model_list.length === 0) {
      var model_list = [...new Set(list.map((l) => l.model))];
      var model = model_list[0];
      var lake_list = list.filter((l) => l.model === model).map((l) => l.name);
      var lake = lake_list[0];
      this.setState({ model_list, model, lake_list, lake });
    }
  }
  render() {
    const { subfolder, full } = this.props;
    const { model_list, model, lake_list, lake, example } = this.state;
    const link = subfolder
      ? `${
          CONFIG.alplakes_bucket
        }/simulations/${model.toLowerCase()}/${example}/${lake.toLowerCase()}/${lake.toLowerCase()}.zip`
      : `${
          CONFIG.alplakes_bucket
        }/simulations/${model.toLowerCase()}/${example}/${lake.toLowerCase()}.zip`;
    return (
      <div className="downloads">
        <select value={model} onChange={this.setModel}>
          {model_list.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select value={lake} onChange={this.setLake}>
          {lake_list.map((m) => (
            <option key={m} value={m}>
              {m}
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
    var lake_list = list.filter((l) => l.model === model).map((l) => l.name);
    var lake = lake_list[0];
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
      var lake_list = list.filter((l) => l.model === model).map((l) => l.name);
      var lake = lake_list[0];
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
      <div className="downloads">
        <select value={model} onChange={this.setModel}>
          {model_list.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select value={lake} onChange={this.setLake}>
          {lake_list.map((m) => (
            <option key={m} value={m}>
              {m}
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
    var lake_list = list.filter((l) => l.model === model).map((l) => l.name);
    var lake = lake_list[0];
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
  setVariable = (event) => {
    var variable = event.target.value;
    this.setState({ variable });
  };
  async componentDidUpdate() {
    const { list } = this.props;
    if (list.length > 0 && this.state.model_list.length === 0) {
      var model_list = [...new Set(list.map((l) => l.model))];
      var model = model_list[0];
      var lake_list = list.filter((l) => l.model === model).map((l) => l.name);
      var lake = lake_list[0];
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
      <div className="downloads">
        <select value={model} onChange={this.setModel}>
          {model_list.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select value={lake} onChange={this.setLake}>
          {lake_list.map((m) => (
            <option key={m} value={m}>
              {m}
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
          }/simulations/${model.toLowerCase()}/downloads/${lake.toLowerCase()}/${variable}`}
        >
          <button className="download">Download</button>
        </a>
      </div>
    );
  }
}

class Models extends Component {
  state = {
    one_dimensional: [],
    three_dimensional: [],
    remote_sensing: [],
  };
  constructor(props) {
    super(props);
    this.threed = React.createRef();
    this.oned = React.createRef();
    this.remotesensing = React.createRef();
  }
  scrollToSection = (sectionRef) => {
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  async componentDidMount() {
    window.scrollTo(0, 0);
    try {
      var { data: one_dimensional } = await axios.get(
        CONFIG.alplakes_bucket +
          `/static/website/metadata/${CONFIG.branch}/one_dimensional.json`
      );
      var { data: three_dimensional } = await axios.get(
        CONFIG.alplakes_bucket +
          `/static/website/metadata/${CONFIG.branch}/three_dimensional.json`
      );
      var { data: remote_sensing } = await axios.get(
        CONFIG.alplakes_bucket +
          `/static/website/metadata/${CONFIG.branch}/remote_sensing.json`
      );
      this.setState({ one_dimensional, three_dimensional, remote_sensing });
    } catch (error) {
      console.error("Failed to collect metadata from bucket");
    }
  }
  render() {
    const { language } = this.props;
    var { one_dimensional, three_dimensional, remote_sensing } = this.state;
    return (
      <div className="main">
        <Helmet>
          <title>Models | Alplakes</title>
          <meta
            name="description"
            content="Learn more about the Alplakes models."
          />
        </Helmet>
        <NavBar {...this.props} relative={true} />
        <div className="models">
          <div className="content">
            <h1>{Translations.models[language]}</h1>
            <p>
              Alplakes integrates hydrodynamic models and remote sensing
              products developed by the research community. This page details
              the models performance and provides access to downloads related to
              them.
            </p>
            <div ref={this.threed} className="section">
              <h2>3D Hydrodynamic</h2>
              <p>
                3D hydrodynamic lake models simulate water movement,
                temperature, and water quality by dividing the lake into a 3D
                grid and solving mathematical equations that govern fluid
                motion, heat transfer, and chemical interactions. They use the
                Navier-Stokes equations to calculate flow dynamics based on
                external forces like wind, inflows, and gravity. Temperature,
                salinity, and other factors create density gradients, which
                drive stratification and mixing processes within the lake.
              </p>
              <p>
                Below is a list of all the 3D models available on the Alplakes
                platform.
              </p>
              <SortableTable data={three_dimensional} language={language} />
              <p>
                The Delft3D-flow models were calibrated automatically using{" "}
                <a
                  href="https://github.com/louisXW/DYNO-pods"
                  target="_blank"
                  rel="noreferrer"
                >
                  DYNO-PODS
                </a>
                . The objective function is the root mean square error (RMSE) of
                temperature difference and the root mean square deviation of
                simulated Schmidt stability. The calibrated parameters are:
              </p>
              <ul>
                <li>Coefficient of free convection (cfrco)</li>
                <li>Coefficient of wind drag (α)</li>
                <li>Ozmidov length scale (Loz)</li>
                <li>Horizontal eddy viscosity (vh)</li>
              </ul>
              <p>
                The parameters cfrco and α were calibrated for the
                destratification period whereas Loz and vh were calibrated for
                the stratification period. For more information on the
                calibration please contact Marina Amadori (
                <a href="mailto:marina.amadori@unitn.it">
                  marina.amadori@unitn.it
                </a>
                ).
              </p>
              <h3>Input files</h3>
              <p>
                A set of example input files are provided for users that want to
                adapt the models to their own purposes. These files can also be
                generated using the code available{" "}
                <a
                  href="https://github.com/eawag-surface-waters-research/alplakes-simulations"
                  target="_blank"
                  rel="noreferrer"
                >
                  here
                </a>
                . Please note users outside of Eawag will need to update the
                weather data collection functions as we are not permitted to
                distribute weather data.
              </p>
              <ModelInputs list={three_dimensional} />
              <h3>Running the model</h3>
              <h4>Delft3D-flow</h4>
              <p>
                Please refer to the official documentation provided by Deltares{" "}
                <a
                  href="https://oss.deltares.nl/web/delft3d"
                  target="_blank"
                  rel="noreferrer"
                >
                  here
                </a>
                . For users familiar with docker you can access documentation on
                using custom Eawag compilations of D3D{" "}
                <a
                  href="https://github.com/eawag-surface-waters-research/docker"
                  target="_blank"
                  rel="noreferrer"
                >
                  here
                </a>
                .
              </p>
              <h3>Results</h3>
              <p>
                For downloading small formatted subsets of the results, please
                use the tools available when viewing the model or look at the
                API documentation.
              </p>
              <h4>Delft3D-flow</h4>
              <p>
                Raw model results are available per week in NetCDF format. The
                dimensions and variables are not self explanatory, you can refer
                to the notebook{" "}
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
            </div>
            <div ref={this.oned} className="section">
              <h2>1D Hydrodynamic</h2>
              <p>
                1D lake models simplify lake processes by representing the lake
                as a single vertical column, divided into layers from the
                surface to the bottom. Instead of simulating horizontal
                variations, they focus on vertical changes in temperature,
                density, and other properties. These models calculate vertical
                mixing and stratification by solving simplified equations for
                heat and mass transfer, often including modules for water
                quality and biological processes. Because they are less
                computationally intensive, 1D models are efficient for long-term
                studies and are especially useful for deep lakes where vertical
                changes are more significant than horizontal ones.
              </p>
              <p>
                Below is a list of all the 1D models available on the Alplakes
                platform.
              </p>
              <SortableTable data={one_dimensional} language={language} />
              <p>
                The Simstat models were calibrated automatically using{" "}
                <a
                  href="https://github.com/eawag-surface-waters-research/lake-calibrator"
                  target="_blank"
                  rel="noreferrer"
                >
                  lake-calibrator
                </a>{" "}
                a python wrapper that adapts{" "}
                <a
                  href="https://pesthomepage.org/"
                  target="_blank"
                  rel="noreferrer"
                >
                  PEST
                </a>{" "}
                for use with Simstrat. The objective function is the root mean
                square error (RMSE) of temperature difference between the model
                and insitu temperature profiles. The calibrated parameters are:
              </p>
              <ul>
                <li>
                  Fraction of seiche energy to total wind energy (a_seiche)
                </li>
                <li>Fit parameter for wind speed at 10m [-] (f_wind)</li>
                <li>
                  Fit parameter for long-wave radiation from sky [-] (p_lw)
                </li>
                <li>Temperature of snow [°C] (snow_temp)</li>
              </ul>
              <p>
                For more information on the calibration please contact Fabian
                Bärenbold (
                <a href="mailto:fabian.baerenbold@eawag.ch">
                  fabian.baerenbold@eawag.ch
                </a>
                ).
              </p>
              <h3>Input files</h3>
              <p>
                A set of example input files are provided for users that want to
                adapt the models to their own purposes. These files can also be
                generated using the code available{" "}
                <a
                  href="https://github.com/Eawag-AppliedSystemAnalysis/operational-simstrat"
                  target="_blank"
                  rel="noreferrer"
                >
                  here
                </a>
                . Please note users outside of Eawag will need to update the
                weather data collection functions as we are not permitted to
                distribute weather data. Full files are currently only availble
                to project members but will become public after April 2025 when
                MeteoSwiss moves to an Open Data model.
              </p>
              <ModelInputs
                list={one_dimensional}
                subfolder={true}
                full={true}
              />
              <h3>Running the model</h3>
              <h4>Simstrat</h4>
              <p>
                Please refer to the official documentation provided by Eawag{" "}
                <a
                  href="https://github.com/Eawag-AppliedSystemAnalysis/Simstrat"
                  target="_blank"
                  rel="noreferrer"
                >
                  here
                </a>
                .
              </p>
              <h3>Results</h3>
              <p>
                For downloading small formatted subsets of the results, please
                use the tools available when viewing the model or look at the
                API documentation.
              </p>
              <h4>Simstrat</h4>
              <p>
                Raw model results are available in text format. The results are
                formatted in a CSV where the column headers refer to the depth
                and the first column is the number of days after the reference
                date (01.01.1981). The notebook{" "}
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
            </div>
            <div ref={this.remotesensing} className="section">
              <h2>Remote Sensing</h2>
              <p>
                Remote sensing products are processed to provide a snapshot of
                given parameters in the upper layers of the lake. The products
                are produced using{" "}
                <a
                  href="https://github.com/eawag-surface-waters-research/sencast"
                  target="_blank"
                  rel="noreferrer"
                >
                  Sencast
                </a>{" "}
                a python toolbox that utalises a variety of data providers,
                atmospheric corrections and algorithms to reproducibaly create
                parameter maps for lakes across the alpine region.
              </p>
              <p>
                Below is a list of all the remote sensing products available on
                the Alplakes platform.
              </p>
              <SortableTable data={remote_sensing} language={language} />
              <p>
                A number of algorithms were evaluated in order to select the
                best performing products above. For more information about the
                selection for Sentinel 3 please contact Abolfazl Irani Rahaghi (
                <a href="mailto:Abolfazl.Irani@eawag.ch">
                  Abolfazl.Irani@eawag.ch
                </a>
                ) and for more information about the selection of Sentinel 2
                please contact Mortimer Werther (
                <a href="mailto:Mortimer.Werther@eawag.ch">
                  Mortimer.Werther@eawag.ch
                </a>
                ).
              </p>
              <h3>Downloads</h3>
              <p>
                For downloading products, please use the tools available when
                viewing the images or look at the API documentation.
              </p>
            </div>
          </div>
          <div className="sidebar">
            <div className="sidebar-inner">
              <h3>Contents</h3>
              <div
                className="link"
                onClick={() => this.scrollToSection(this.threed)}
              >
                3D Hydrodynamic
              </div>
              <div
                className="link"
                onClick={() => this.scrollToSection(this.oned)}
              >
                1D Hydrodynamic
              </div>
              <div
                className="link"
                onClick={() => this.scrollToSection(this.remotesensing)}
              >
                Remote Sensing
              </div>
            </div>
          </div>
        </div>
        <Footer {...this.props} />
      </div>
    );
  }
}

export default Models;
