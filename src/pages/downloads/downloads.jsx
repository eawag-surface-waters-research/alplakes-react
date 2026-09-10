import React, { Component } from "react";
import { Helmet } from "react-helmet";
import NavBar from "../../components/navbar/navbar";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import CONFIG from "../../config.json";
import Footer from "../../components/footer/footer";
import Translations from "../../translations.json";
import unpluggedIcon from "../../img/unplugged.png";
import axios from "axios";
import "./downloads.css";
import ScrollUp from "../../components/scrollup/scrollup";

export const hour = () => {
  return `?timestamp=${
    Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
  }`;
};

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
        return { name: l.name, model_key: l.model_key };
      });
    var lake = lake_list[0].model_key;
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
          return { name: l.name, model_key: l.model_key };
        });
      var lake = lake_list[0].model_key;
      this.setState({ model_list, model, lake_list, lake });
    }
  }
  render() {
    const { full, middle } = this.props;
    const { model_list, model, lake_list, lake, example } = this.state;
    const link = `${
      CONFIG.alplakes_bucket
    }/simulations/${model.toLowerCase()}/${example}/${lake.toLowerCase()}.zip`;
    return (
      <div className={middle ? "selector middle" : "selector"}>
        <select value={model} onChange={this.setModel}>
          {model_list.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select value={lake} onChange={this.setLake}>
          {lake_list.map((m) => (
            <option key={m.model_key} value={m.model_key}>
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
        return { name: l.name, model_key: l.model_key };
      });
    var lake = lake_list[0].model_key;
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
        }/simulations/${model}/cache/${lake}/metadata.json?timestamp=${hour()}`
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
          return { name: l.name, model_key: l.model_key };
        });
      var lake = lake_list[0].model_key;
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
            <option key={m.model_key} value={m.model_key}>
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
        return { name: l.name, model_key: l.model_key };
      });
    var lake = lake_list[0].model_key;
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
          return { name: l.name, model_key: l.model_key };
        });
      var lake = lake_list[0].model_key;
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
            <option key={m.model_key} value={m.model_key}>
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

class Faq extends Component {
  state = {
    open: [],
  };
  toggle = (index) => {
    const { open } = this.state;
    this.setState({
      open: open.includes(index)
        ? open.filter((i) => i !== index)
        : [...open, index],
    });
  };
  render() {
    const { questions } = this.props;
    const { open } = this.state;
    return (
      <div className="faq">
        {questions.map((q, index) => (
          <div
            key={q.question}
            className={open.includes(index) ? "faq-item open" : "faq-item"}
          >
            <div className="faq-question" onClick={() => this.toggle(index)}>
              {q.question}
              <span className="faq-toggle">
                {open.includes(index) ? "−" : "+"}
              </span>
            </div>
            <div className="faq-answer">{q.answer}</div>
          </div>
        ))}
      </div>
    );
  }
}

class Downloads extends Component {
  state = {
    swagger_error: false,
    one_dimensional: [],
    three_dimensional: [],
    visibleKey: "licence",
  };

  constructor(props) {
    super(props);
    this.divRefs = {
      inputs: React.createRef(),
      outputs: React.createRef(),
      licence: React.createRef(),
      faq: React.createRef(),
      api: React.createRef(),
    };
  }
  handleScroll = () => {
    let closestDiv = null;
    let closestDistance = Infinity;
    Object.keys(this.divRefs).forEach((key) => {
      const div = this.divRefs[key].current;
      if (div) {
        const rect = div.getBoundingClientRect();
        const top = rect.top;
        const bottom = rect.bottom;
        if (top < window.innerHeight && bottom > 0) {
          const distanceFromTop = Math.abs(top);
          if (distanceFromTop < closestDistance) {
            closestDistance = distanceFromTop;
            closestDiv = key;
          }
        }
      }
    });
    if (closestDiv) {
      this.setState({ visibleKey: closestDiv });
    }
  };
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
          `/static/website/metadata/${CONFIG.branch}/one_dimensional.json${hour()}`
      ));
    } catch (e) {}
    try {
      ({ data: three_dimensional } = await axios.get(
        CONFIG.alplakes_bucket +
          `/static/website/metadata/${CONFIG.branch}/three_dimensional.json${hour()}`
      ));
    } catch (e) {}
    try {
      await axios.get(`${CONFIG.alplakes_api}`);
    } catch (e) {
      swagger_error = true;
    }
    window.addEventListener("scroll", this.handleScroll);
    this.handleScroll();
    this.setState({ one_dimensional, three_dimensional, swagger_error });
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }
  render() {
    const language = "EN";
    var { one_dimensional, three_dimensional, swagger_error, visibleKey } =
      this.state;
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
          <div className="text-width-downloads">
            <h1> {Translations.downloads[language]}</h1>

            <div className="intro">
              Alplakes provides complete model inputs and outputs for users who
              want to run the models independently or extract information not
              available through our API. For specific slices of model data, use
              the API below. All in-situ data must be downloaded directly from
              the original data providers.
            </div>

            <div ref={this.divRefs["licence"]} id="licence" className="section">
              <h2>Licence</h2>
              <p>
                All data produced by Alplakes is released under the{" "}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Creative Commons Attribution 4.0 International (CC BY 4.0)
                </a>{" "}
                licence. You are free to share and adapt the data for any
                purpose, including commercially, as long as you give appropriate
                credit to Alplakes and indicate if any changes were made.
              </p>
              <div className="comment">
                In-situ data remains subject to the licence terms of the
                original data provider.
              </div>
            </div>
            
            <div ref={this.divRefs["inputs"]} id="inputs" className="section">
              <h2>Model Inputs</h2>
              <p>
                A set of example input files are provided for users that want to
                adapt the models to their own purposes. For more information on
                how to generate these files please see the <b>Models</b> page.
              </p>
              <div className="nonclickbox">
                <h3>3D Models</h3>
                <ModelInputs list={three_dimensional} middle={true} />
                <h3>1D Models</h3>
                <ModelInputs list={one_dimensional} full={true} />
              </div>
            </div>
            <div ref={this.divRefs["outputs"]} id="outputs" className="section">
              <h2>Model Outputs</h2>
              <p>
                Raw model results can be accessed using the forms below. For
                formatted subsets of the output files please use the API.
              </p>
              <div className="nonclickbox">
                <h3>3D Models</h3>
                <ThreeDimensionalResults list={three_dimensional} />
                <div className="comment space">
                  Available per week in NetCDF format. The dimensions and
                  variables are not self explanatory, you can refer to the
                  notebook{" "}
                  <a
                    href="https://github.com/eawag-surface-waters-research/alplakes-simulations/blob/master/notebooks/process_results.ipynb"
                    target="_blank"
                    rel="noreferrer"
                  >
                    here
                  </a>{" "}
                  for more information.
                </div>
                <h3>1D Models</h3>
                <OneDimensionalResults list={one_dimensional} />
                <div className="comment">
                  Available in text format. The results are formatted in a CSV
                  where the column headers refer to the depth and the first
                  column is the number of days after the reference date
                  (01.01.1981). The notebook{" "}
                  <a
                    href="https://github.com/Eawag-AppliedSystemAnalysis/operational-simstrat/blob/master/notebooks/process_results.ipynb"
                    target="_blank"
                    rel="noreferrer"
                  >
                    here
                  </a>{" "}
                  provides an example of processing the raw data.
                </div>
              </div>
            </div>
            <div ref={this.divRefs["faq"]} id="faq" className="section">
              <h2>FAQ</h2>
              <Faq
                questions={[
                  {
                    question: "How should I cite the data?",
                    answer: (
                      <p>
                        The data is released under CC BY 4.0, so please credit
                        Alplakes and link back to{" "}
                        <a
                          href="https://www.alplakes.eawag.ch"
                          target="_blank"
                          rel="noreferrer"
                        >
                          alplakes.eawag.ch
                        </a>
                        , indicating if you have made any changes to the data.
                      </p>
                    ),
                  },
                  {
                    question:
                      "Should I download the raw files or use the API?",
                    answer: (
                      <p>
                        Use the API if you need a subset of the data, for
                        example a time series at a point, a depth profile or a
                        single variable over a given period. Download the raw
                        files if you need the complete model output, or want to
                        do processing that the API does not support.
                      </p>
                    ),
                  },
                  {
                    question: "How often are the model outputs updated?",
                    answer: (
                      <p>
                        The models are run each morning and the outputs are updated on the platform as soon as the model run is complete. 

                      </p>
                    ),
                  },
                  {
                    question: "Can I run the models myself?",
                    answer: (
                      <p>
                        Yes. Example input files for every lake are available in
                        the Model Inputs section above, and the <b>Models</b>{" "}
                        page describes how these files are generated.
                      </p>
                    ),
                  },
                  {
                    question: "Can I use the data in my website or application?",
                    answer: (
                      <p>
                        Yes! We are happy for people to build on our work and use the data in their own applications. 
                        Please follow the licence and credit Alplakes. Please cache the data on your own servers and 
                        do not make repeated requests to our API, as this will slow down the service for everyone.
                      </p>
                    ),
                  },
                  {
                    question: "My lake isn't listed, can it be added?",
                    answer: (
                      <p>
                        Possibly. Adding a lake requires bathymetry,
                        meteorological forcing and ideally in-situ data for
                        calibration. Get in touch at{" "}
                        <a href="mailto:james.runnalls@eawag.ch">
                          james.runnalls@eawag.ch
                        </a>{" "}
                        to discuss it.
                      </p>
                    ),
                  },
                  {
                    question: "Can I contribute a lake model or data?",
                    answer: (
                      <p>
                        Absolutely, we are always looking for collaborators. Please get in touch and we can 
                        discuss how to integrate your work into the platform. Get in touch at{" "}
                        <a href="mailto:james.runnalls@eawag.ch">
                          james.runnalls@eawag.ch
                        </a>{" "}
                        to discuss it.
                      </p>
                    ),
                  },
                  {
                    question: "How can I be informed of changes to the API?",
                    answer: (
                      <p>
                        Please email {" "}
                        <a href="mailto:james.runnalls@eawag.ch">
                          james.runnalls@eawag.ch
                        </a>{" "}
                        to be added to our mailing list.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
            <h2 ref={this.divRefs["api"]} id="api" className="api">
              API Documentation
            </h2>
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
          <div className="sidebar">
            <div className="sidebar-inner">
              <h3>Contents</h3>
              <div
                className={visibleKey === "licence" ? "link active" : "link"}
                onClick={() => this.scrollToSection(this.divRefs["licence"])}
              >
                Licence
              </div>
              <div
                className={visibleKey === "inputs" ? "link active" : "link"}
                onClick={() => this.scrollToSection(this.divRefs["inputs"])}
              >
                Model Inputs
              </div>
              <div
                className={visibleKey === "outputs" ? "link active" : "link"}
                onClick={() => this.scrollToSection(this.divRefs["outputs"])}
              >
                Model Outputs
              </div>
              <div
                className={visibleKey === "faq" ? "link active" : "link"}
                onClick={() => this.scrollToSection(this.divRefs["faq"])}
              >
                FAQ
              </div>
              <div
                className={visibleKey === "api" ? "link active" : "link"}
                onClick={() => this.scrollToSection(this.divRefs["api"])}
              >
                API Documentation
              </div>
            </div>
          </div>
        </div>
        <ScrollUp />
        <Footer {...this.props} />
      </React.Fragment>
    );
  }
}

export default Downloads;
