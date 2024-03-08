import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import NavBar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import Details from "./details";
import Map from "./map";
import Graph from "./graph";
import Selector from "./selector";
import notification_icon from "../../img/notification.png";
import CONFIG from "../../config.json";
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

class Lake extends Component {
  state = {
    id: "",
    metadata: {},
    error: false,
    active: "map",
    views: ["graph", "map"],
  };
  setActive = (active) => {
    this.setState({ active });
  };
  async componentDidMount() {
    const url = window.location.href.split("/");
    const id = url[url.length - 1].split("?")[0].replace(/[^a-zA-Z ]/g, "");
    try {
      const { data: metadata } = await axios.get(
        CONFIG.alplakes_bucket + `/static/website/metadata/v2/${id}.json`
      );
      this.setState({
        metadata,
        id,
      });
    } catch (e) {
      console.log(e);
      this.setState({ error: true, id });
    }
  }

  render() {
    var { metadata, active, views, error, id } = this.state;
    var { language, dark } = this.props;
    var title = "";
    if ("name" in metadata) {
      document.title = metadata.name[language] + " | Alplakes";
      title = metadata.name[language];
    }
    return (
      <div className="lake">
        <NavBar {...this.props} />
        {error ? (
          <NotFound id={id} />
        ) : (
          <div className="content">
            <div className="top">
              <div className="title">{title}</div>
              <div className="notification">
                <img src={notification_icon} alt="notification" />
              </div>
            </div>
            <div className="bottom">
              <Selector
                active={active}
                setActive={this.setActive}
                views={views}
                language={language}
              />
              <div className={`map ${active === "map" ? "active" : ""}`}>
                <Map metadata={metadata} language={language} dark={dark} />
              </div>
              <div className={`graph ${active === "graph" ? "active" : ""}`}>
                <Graph metadata={metadata} language={language} dark={dark} />
              </div>
              <div
                className={`details ${active === "details" ? "active" : ""}`}
              >
                <Details metadata={metadata} language={language} />
              </div>
            </div>
          </div>
        )}
        <Footer {...this.props} medium={true} />
      </div>
    );
  }
}

export default Lake;
