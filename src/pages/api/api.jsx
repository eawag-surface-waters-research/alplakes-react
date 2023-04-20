import React, { Component } from "react";
import NavBar from "../../components/navbar/navbar";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import CONFIG from "../../config.json";
import "./api.css";

class API extends Component {
  render() {
    return (
      <React.Fragment>
        <NavBar {...this.props} />
        <div className="api-container">
          <SwaggerUI
            url={CONFIG.alplakes_api + "/openapi.json"}
            docExpansion="list"
          />
        </div>
      </React.Fragment>
    );
  }
}

export default API;
