import React, { Component } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Language from "./components/language/language";
import Home from "./pages/home/home";
import Lake from "./pages/lake/lake";
import API from "./pages/api/api";
import About from "./pages/about/about";
import NotFound from "./pages/notfound/notfound";

class App extends Component {
  state = {
    languages: ["EN", "DE", "FR", "IT"],
    language: "EN",
  };
  setLanguage = (event) => {
    this.setState({ language: event.target.value });
  };
  render() {
    var { language, languages } = this.state;
    return (
      <React.Fragment>
        <Language
          language={language}
          languages={languages}
          setLanguage={this.setLanguage}
        />
        <div className="main">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home language={language} />} exact />
              <Route path="/lake/*" element={<Lake language={language} />} />
              <Route path="/api" element={<API language={language} />} exact />
              <Route
                path="/about"
                element={<About language={language} />}
                exact
              />
              <Route path="/" element={<NotFound language={language} />} />
            </Routes>
          </BrowserRouter>
        </div>
      </React.Fragment>
    );
  }
}

export default App;
