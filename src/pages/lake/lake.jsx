import React, { Component } from "react";
import { NavLink } from "react-router-dom";
//import axios from "axios";
import NavBar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import Metadata from "./metadata";
import Map from "./map";
import Graph from "./graph";
import { parseSubtitle } from "./functions";
import DATA from "./data.json";
import arrow from "../../img/arrow.png";
import "./lake.css";


class NotFound extends Component {
  render() {
    var { id } = this.props;
    return (
      <div className="not-found">
        Sorry the lake <div className="title">{id}</div>
        cannot be found.
        <NavLink to="/">
          <div className="call-to-action">See our full list of lakes</div>
        </NavLink>
      </div>
    );
  }
}

class Module extends Component {
  render() {
    var {
      module,
      active,
      setActiveModule,
      closeActiveModule,
      selected,
      language,
      metadata,
    } = this.props;
    var title = metadata.name[language];
    var subtitle = parseSubtitle(title, metadata.name);
    return (
      <div
        className={
          active ? "module active" : selected ? "module hide" : "module"
        }
        onClick={() => {
          setActiveModule(module.id, active);
        }}
      >
        <div className="close" onClick={closeActiveModule}>
          &times;
        </div>
        <div className="active-title">
          <div className="title">{title}</div>
          <div className="subtitle">{subtitle}</div>
        </div>
        <div className="display">
          {module.component === "map" && <Map {...this.props} />}
          {module.component === "graph" && <Graph {...this.props} />}
        </div>
        <div className="link">
          <div className="title">{module.title}</div>
          <div className="subtitle">{module.subtitle}</div>
          <div className="arrow">
            <img src={arrow} alt="Arrow" />
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
    error: false,
    active_module: false,
    module: "all",
  };

  setActiveModule = (active_module, active) => {
    if (active === false) {
      document.body.style.overflow = "hidden";
      this.setState({ active_module }, () => {
        window.dispatchEvent(new Event("resize"));
      });
    }
  };
  closeActiveModule = () => {
    document.body.style.overflow = "auto";
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
      /*const { data } = await axios.get(
        CONFIG.alplakes_bucket + `/static/website/metadata/v2/${id}.json`
      );*/
      const data = DATA;
      const { metadata, modules, layers } = data;
      layers.map((l) => {
        l.active = false;
        l.lake = metadata.key;
        return l;
      });
      this.setState({
        active_module,
        metadata,
        modules,
        layers,
        id,
      });
    } catch (e) {
      console.log(e);
      this.setState({ error: true, id });
    }
  }

  render() {
    var { metadata, modules, error, id, active_module, layers } = this.state;
    var { language } = this.props;
    var title = "";
    var subtitle = "";
    if ("name" in metadata) {
      document.title = metadata.name[language] + " | Alplakes";
      title = metadata.name[language];
      subtitle = parseSubtitle(title, metadata.name);
    }
    return (
      <div className="lake">
        <NavBar {...this.props} relative={true} />
        {error ? (
          <NotFound id={id} />
        ) : (
          <div className="content">
            <div className="modules">
              <div className="mobile-title">{title}</div>
              <div className="mobile-subtitle">{subtitle}</div>
              {modules.map((m) => (
                <Module
                  key={m.id}
                  module={m}
                  metadata={metadata}
                  layers={layers}
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
        )}
        <Footer {...this.props} />
      </div>
    );
  }
}

export default Lake;
