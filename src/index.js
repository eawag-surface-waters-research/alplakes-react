import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/browser";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

Sentry.init({
  dsn: "https://609a7ab223e943c1a230104bd323bd57@o1106970.ingest.sentry.io/4505175237001216",
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
reportWebVitals();
