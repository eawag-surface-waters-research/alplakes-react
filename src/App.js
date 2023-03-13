import React, { Component } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import Language from "./components/language/language";
import Lakes from "./pages/lakes/lakes";
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
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Lakes language={language} />} exact />
            <Route path="/" element={<NotFound language={language} />} />
          </Routes>
        </BrowserRouter>
      </React.Fragment>
    );
  }
}

export default App;
