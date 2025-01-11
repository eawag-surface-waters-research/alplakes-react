import React, { Component } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import NavBar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import CONFIG from "../../config.json";
import "./lake.css";

class NotFound extends Component {
  render() {
    var { id, text } = this.props;
    return (
      <div className="not-found">
        {text && (
          <div className="inner">
            Sorry the lake <div className="title">"{id}"</div> cannot be found.
          </div>
        )}
      </div>
    );
  }
}

class Lake extends Component {
  state = {
    id: "",
    metadata: {},
    modules: [],
    layers: [],
    datasets: [],
    error: false,
    active_module: false,
    module: "all",
  };

  async componentDidMount() {
    window.scrollTo(0, 0);
    var { active_module } = this.state;
    const url = new URL(window.location.href);
    const id = url.pathname.replace(/[^a-zA-Z ]/g, "");
    const searchParams = {};
    url.searchParams.forEach((value, key) => {
      searchParams[key] = value;
    });
    if ("module" in searchParams) {
      active_module = searchParams["module"];
    }
    try {
      var { data } = await axios.get(
        CONFIG.alplakes_bucket +
          `/static/website/metadata/${CONFIG.branch}/${id}.json?timestamp=${
            Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
          }`
      );
      const { metadata, modules, layers, datasets } = data;
      layers.map((l) => {
        l.active = false;
        l.lake = metadata.key;
        return l;
      });
      datasets.map((d) => {
        d.active = false;
        d.lake = metadata.key;
        return d;
      });
      this.setState({
        active_module,
        metadata,
        modules,
        layers,
        datasets,
        id,
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: true, id });
    }
  }

  render() {
    var { metadata, modules, error, id, active_module, layers, datasets } =
      this.state;
    var { language } = this.props;
    var title = "";
    var documentTitle = "Alplakes";
    if ("name" in metadata) {
      documentTitle = metadata.name[language] + " | Alplakes";
      title = metadata.name[language];
    }
    return (
      <div className="main">
        <Helmet>
          <title>{documentTitle}</title>
          <meta
            name="description"
            content="View the latest temperature forecast and water quality information."
          />
        </Helmet>
        <NavBar {...this.props} relative={true} />
        {error ? (
          <NotFound id={id} text={true} />
        ) : (
          <div className="lake">
            <div className="header">
              <h1>{title}</h1>
              <div className="properties-link">Lake properties</div>
            </div>
            <div className="forecast">
              <h2>Forecast</h2>
              <h3>Water Temperature - 3D</h3>
            </div>
          </div>
        )}
        <Footer {...this.props} />
      </div>
    );
  }
}

export default Lake;
