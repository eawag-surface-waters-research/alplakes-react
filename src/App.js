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
    dark: false,
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
    var { dark } = this.state;
    return (
      <React.Fragment>
        <div className={dark ? "main dark" : "main"}>
          <div
            className={dark ? "background-color dark" : "background-color"}
          />
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <Home {...this.state} setLanguage={this.setLanguage} />
                }
                exact
              />
              <Route
                path="/api"
                element={<API {...this.state} setLanguage={this.setLanguage} />}
                exact
              />
              <Route
                path="/about"
                element={
                  <About {...this.state} setLanguage={this.setLanguage} />
                }
                exact
              />
              <Route
                path="/*"
                element={
                  <Lake {...this.state} setLanguage={this.setLanguage} />
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
