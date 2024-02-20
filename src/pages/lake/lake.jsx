import React, { Component } from "react";
import axios from "axios";
import NavBar from "../../components/navbar/navbar";
import Footer from "../../components/footer/footer";
import Details from "./details";
import Map from "./map";
import Graph from "./graph";
import Selector from "./selector";
import eawag_logo from "../../img/eawag_logo.png";
import esa_logo from "../../img/esa_logo.png";
import trento_logo from "../../img/trento_logo.png";
import CONFIG from "../../config.json";
import "./lake.css";

class Lake extends Component {
  state = {
    id: "",
    metadata: {},
    error: "",
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
      console.error(e);
      this.setState({ error: "name", id });
    }
  }

  render() {
    var { metadata, active, views } = this.state;
    var { language, dark } = this.props;
    var name = "";
    if ("name" in metadata) {
      document.title = metadata.name[language] + " | Alplakes";
      name = metadata.name[language];
    }
    return (
      <div className="lake">
        <NavBar {...this.props} />
        <div className="content">
          <div className="title">{name}</div>
          <div className={`details ${active === "details" ? "active" : ""}`}>
            <Details />
          </div>
          <Selector active={active} setActive={this.setActive} views={views} />
          <div className="view-area">
            <div className={`map ${active === "map" ? "active" : ""}`}>
              <Map />
            </div>
            <div className={`graph ${active === "graph" ? "active" : ""}`}>
              <Graph />
            </div>
          </div>
          <div className="logos">
            <img src={eawag_logo} alt="Eawag" />
            <img src={esa_logo} alt="Esa" />
            <img src={trento_logo} alt="Trento" />
          </div>
        </div>
        <Footer {...this.props} medium={true} />
      </div>
    );
  }
}

export default Lake;
