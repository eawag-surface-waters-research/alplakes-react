export const defaultParameter = "temperature";

export const performanceParameters = {
  temperature: {
    unit: "°C",
    label: "watertemperature",
    thresholds: [1, 2],
    file: (lake) => `performance/${lake}.json`,
  },
  significant_wave_height: {
    unit: "m",
    label: "significant_wave_height",
    thresholds: [0.1, 0.2],
    file: (lake) => `performance/significant_wave_height/${lake}.json`,
  },
};

export const parameterConfig = (parameter) =>
  performanceParameters[parameter] || performanceParameters[defaultParameter];

export const rmseColor = (rmse, parameter) => {
  const [warn, bad] = parameterConfig(parameter).thresholds;
  if (rmse >= bad) return "#f34b3e";
  if (rmse >= warn) return "#fbd247";
  return "#76b64b";
};
