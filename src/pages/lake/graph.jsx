import React, { Component } from "react";
import GraphSettings from "./graphsettings";
//import axios from "axios";

class Graph extends Component {
  state = {
    sidebar: false,
    selection: false,
  };
  openSidebar = () => {
    this.setState({ sidebar: true });
  };
  closeSidebar = () => {
    this.setState({ sidebar: false });
  };
  render() {
    var { language, dark, datasets } = this.props;
    var { sidebar } = this.state;
    return (
      <div className="module-component graph">
        <div className="plot">
          
        </div>
        <div className={sidebar ? "sidebar open" : "sidebar"}>
          <div className="close-sidebar" onClick={this.closeSidebar}>
            &times;
          </div>
          <GraphSettings {...this.state} language={language} dark={dark} datasets={datasets}/>
        </div>
      </div>
    );
  }
}

export default Graph;
