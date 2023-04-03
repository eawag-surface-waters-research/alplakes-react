import React, { Component } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";
import Translate from "../../translations.json";
import NavBar from "../../components/navbar/navbar";
import LakeMap from "../../components/leaflet/lakemap";
import URLS from "../../urls.json";
import { onMouseOver, onMouseOut } from "./functions";

import "./home.css";
import Loading from "../../components/loading/loading";

class Lake extends Component {
  render() {
    var { lake, language } = this.props;
    return (
      <NavLink to={`/lake/${lake.key}`}>
        <div
          className="lake"
          id={"list-" + lake.key}
          onMouseOver={onMouseOver}
          onMouseOut={onMouseOut}
        >
          <div className="image">
            <img
              src={`https://alplakes-eawag.s3.eu-central-1.amazonaws.com/static/website/images/lakes/${lake.key}.png`}
              alt="Lake"
            />
          </div>
          <div className="properties">
            <div className="name">{lake.name[language]}</div>
            <div className="parameters">
            </div>
          </div>
        </div>
      </NavLink>
    );
  }
}

class Home extends Component {
  state = {
    list: [],
  };
  async componentDidMount() {
    const { data: list } = await axios.get(URLS.metadata + "list.json");
    this.setState({ list });
  }
  render() {
    var { language } = this.props;
    var { list } = this.state;
    document.title = Translate.title[language];
    return (
      <div className="main">
        <NavBar language={language} />
        <div className="primary">
          <div className="content">
            <div className="banner">{Translate.title[language]}</div>
            <div className="products">
              {list.length === 0 ? (
                <Loading marginTop={20} dark={true} />
              ) : (
                list.map((lake) => <Lake lake={lake} language={language} key={lake.key}/>)
              )}
            </div>
          </div>
        </div>
        <div className="secondary">
          <LakeMap lakes={list} language={language} />
        </div>
      </div>
    );
  }
}

export default Home;
