import axios from "axios";
import CONFIG from "../../config.json";

export const addDataset = async (dataset) => {
  if (dataset.data_access === "simstrat_timeseries_temperature") {
    return await addSimstratTimeseriesTemperature(dataset);
  }
};

export const updateDataset = (dataset) => {
  console.log("Update dataset");
};

export const removeDataset = (dataset) => {
  console.log("Remove dataset");
};

const addSimstratTimeseriesTemperature = (dataset) => {
    console.log(dataset)
    // 1. Get metadata
    // 2. Get data
}
