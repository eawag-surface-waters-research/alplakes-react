import React, { Component } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import NavBar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import Metadata from "./metadata";
import Map from "./map";
import Graph from "./graph";
import { parseSubtitle } from "./functions";
import CONFIG from "../../config.json";
import arrow from "../../img/arrow.png";
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

class Module extends Component {
  state = {
    graph: false,
  };
  toggleGraph = () => {
    this.setState({ graph: !this.state.graph });
  };
  showGraph = () => {
    if (!this.state.graph) {
      this.setState({ graph: true });
    }
  };
  render() {
    var {
      module,
      active,
      setActiveModule,
      closeActiveModule,
      language,
      metadata,
      layers,
      dark,
      datasets,
    } = this.props;
    var { graph } = this.state;
    var title = metadata.name[language];
    var subtitle = parseSubtitle(title, metadata.name);
    return (
      <div
        className={active ? "module active" : "module"}
        onClick={() => {
          setActiveModule(module.id, active);
        }}
      >
        <div className="module-inner">
          <div
            className="close"
            onClick={closeActiveModule}
            title="Close module"
          >
            &times;
          </div>
          <div className="active-title" onClick={closeActiveModule}>
            <div className="title">{title}</div>
            <div className="subtitle">{subtitle}</div>
          </div>
          <div className="display">
            {module.component === "map" && (
              <Map
                dark={dark}
                language={language}
                metadata={metadata}
                module={module}
                layers={layers}
                active={active}
                graph={graph}
                toggleGraph={this.toggleGraph}
                showGraph={this.showGraph}
              />
            )}
            {module.component === "graph" && (
              <Graph
                {...this.props}
                dark={dark}
                language={language}
                metadata={metadata}
                module={module}
                datasets={datasets}
                active={active}
              />
            )}
          </div>
          <div className="link">
            <div className="title">{module.title[language]}</div>
            <div className="subtitle">{module.subtitle[language]}</div>
            <div className="arrow">
              <img src={arrow} alt="Arrow" />
            </div>
          </div>
        </div>
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

  setActiveModule = (active_module, active) => {
    if (active === false) {
      this.setState({ active_module }, () => {
        window.dispatchEvent(new Event("resize"));
      });
    }
  };
  closeActiveModule = () => {
    this.setState({ active_module: false }, () => {
      window.dispatchEvent(new Event("resize"));
    });
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
          `/static/website/metadata/${CONFIG.branch}/${id}.json`
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
      console.log(e);
      this.setState({ error: true, id });
    }
  }

  render() {
    var { metadata, modules, error, id, active_module, layers, datasets } =
      this.state;
    var { language } = this.props;
    var title = "";
    var subtitle = "";
    var documentTitle = "Alplakes";
    if ("name" in metadata) {
      documentTitle = metadata.name[language] + " | Alplakes";
      title = metadata.name[language];
      subtitle = parseSubtitle(title, metadata.name);
    }
    return (
      <div className={active_module ? "lake noscroll" : "lake"}>
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
        ) : modules.length > 0 ? (
          <div className="content">
            <div className="error-modal" id="error-modal" />
            <div className="modules">
              <div className="mobile-title">{title}</div>
              <div className="mobile-subtitle">{subtitle}</div>
              {modules.map((m) => (
                <Module
                  key={m.id}
                  module={m}
                  metadata={metadata}
                  layers={layers}
                  datasets={datasets}
                  active={active_module === m.id}
                  selected={active_module ? true : false}
                  setActiveModule={this.setActiveModule}
                  closeActiveModule={this.closeActiveModule}
                  {...this.props}
                />
              ))}
            </div>
            <div className="metadata">
              <Metadata
                title={title}
                subtitle={subtitle}
                metadata={metadata}
                language={language}
              />
            </div>
          </div>
        ) : (
          <NotFound id={id} />
        )}
        <Footer {...this.props} />
      </div>
    );
  }
}

export default Lake;
