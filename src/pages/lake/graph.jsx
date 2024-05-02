import React, { Component } from "react";
import GraphSettings from "./graphsettings";
//import axios from "axios";

class Graph extends Component {
  state = {
    sidebar: false,
  };
  openSidebar = () => {
    this.setState({ sidebar: true });
  };
  closeSidebar = () => {
    this.setState({ sidebar: false });
  };
  render() {
    var { language, dark } = this.props;
    var { sidebar } = this.state;
    return (
      <div className="module-component">
        <div className="plot">
          Graph here
        </div>
        <div className={sidebar ? "sidebar open" : "sidebar"}>
          <div className="close-sidebar" onClick={this.closeSidebar}>
            &times;
          </div>
          <GraphSettings {...this.state} language={language} dark={dark} />
        </div>
      </div>
    );
  }
}

export default Graph;
