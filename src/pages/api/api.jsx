import React, { Component } from "react";
import NavBar from "../../components/navbar/navbar";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import CONFIG from "../../config.json";
import Footer from "../../components/footer/footer";
import Translations from "../../translations.json";
import "./api.css";

class API extends Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }
  render() {
    document.title = "API | Alplakes";
    var { language } = this.props;
    return (
      <React.Fragment>
        <NavBar {...this.props} relative={true} />
        <div className="api-container">
          <div className="header"> {Translations["apiHeader"][language]}</div>
          <div className="text">
            {Translations["apiDesc"][language]}
          </div>
          <div className="contact">
            {Translations["apiContact"][language]}
          </div>
          <div className="contact">
            {Translations["apiWarning"][language]}
          </div>
          <SwaggerUI
            url={CONFIG.alplakes_api + "/openapi.json"}
            docExpansion="list"
          />
        </div>
        <Footer {...this.props} />
      </React.Fragment>
    );
  }
}

export default API;
