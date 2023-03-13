import React, { Component } from "react";
import Translate from "../../translations.json";
import LakeList from "../../lakelist.json";
import NavBar from "../../components/navbar/navbar";
import LakeMap from "../../components/leaflet/lakemap";

import "./lakes.css";

class Lake extends Component {
  state = {};
  render() {
    var { lake, language } = this.props;
    return (
      <div className="lake">
        <div className="image"></div>
        <div className="properties">
          <div className="name">{lake.name[language]}</div>
          <div className="type">{lake.type[language]}</div>
          <div className="parameters">
            <div className="parameter">{lake.area}km2</div>
            <div className="parameter">{lake.depth}m</div>
            <div className="parameter">{lake.elevation}m a.s.l</div>
          </div>
        </div>
      </div>
    );
  }
}

class Lakes extends Component {
  render() {
    var { language } = this.props;
    document.title = Translate.title[language];
    return (
      <div className="main">
        <NavBar />
        <div className="primary">
          <div className="content">
            <div className="sorting">
              <input placeholder={Translate.search[language]} className="dark-inset"/>
            </div>
            <div className="products">
              {LakeList.map((lake) => (
                <Lake lake={lake} language={language} />
              ))}
            </div>
          </div>
        </div>
        <div className="secondary">
          <LakeMap lakes={LakeList} language={language} />
        </div>
      </div>
    );
  }
}

export default Lakes;
