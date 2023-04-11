import React, { Component } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home/home";
import Lake from "./pages/lake/lake";
import API from "./pages/api/api";
import About from "./pages/about/about";
import "./App.css";

class App extends Component {
  state = {
    languages: ["EN", "DE", "FR", "IT"],
    language: "EN",
  };
  setLanguage = (event) => {
    this.setState({ language: event.target.value });
  };
  componentDidMount() {
    var url = window.location.href;
    var { languages } = this.state;
    for (let language of languages) {
      if (url.includes("?" + language.toLowerCase())) {
        this.setState({ language });
      }
    }
  }
  render() {
    var { language, languages } = this.state;
    return (
      <React.Fragment>
        <div className="main">
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    language={language}
                    languages={languages}
                    setLanguage={this.setLanguage}
                  />
                }
                exact
              />
              <Route
                path="/api"
                element={
                  <API
                    language={language}
                    languages={languages}
                    setLanguage={this.setLanguage}
                  />
                }
                exact
              />
              <Route
                path="/about"
                element={
                  <About
                    language={language}
                    languages={languages}
                    setLanguage={this.setLanguage}
                  />
                }
                exact
              />
              <Route
                path="/*"
                element={
                  <Lake
                    language={language}
                    languages={languages}
                    setLanguage={this.setLanguage}
                  />
                }
              />
            </Routes>
          </BrowserRouter>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
