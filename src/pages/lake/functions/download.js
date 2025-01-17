import axios from "axios";
import CONFIG from "../../../config.json";
import * as general from "./general";

export const download1DLinegraph = async (
  model,
  lake,
  start,
  end,
  depth,
  parameter,
  bucket = false
) => {
  var data;
  if (bucket) {
    try {
      ({ data } = await axios.get(
        `${
          CONFIG.alplakes_bucket
        }/simulations/${model}/cache/${lake}/linegraph_${parameter}.json?timestamp=${general.hour()}`
      ));
      return data;
    } catch (e) {
      console.error("Failed to collect linegraph from S3.");
    }
  }
  ({ data } = await axios.get(
    `${
      CONFIG.alplakes_api
    }/simulations/1d/point/${model}/${lake}/${general.formatAPIDatetime(
      start
    )}/${general.formatAPIDatetime(end)}/${depth}?variables=${parameter}`
  ));
  return data;
};

export const downloadModelMetadata = async (model, lake) => {
  var metadata;
  if (model === "simstrat") {
    try {
      ({ data: metadata } = await axios.get(
        `${
          CONFIG.alplakes_bucket
        }/simulations/${model}/cache/${lake}/metadata.json?timestamp=${general.hour()}`
      ));
    } catch (e) {
      console.error("Failed to collect Simstrat metadata from S3.");
      ({ data: metadata } = await axios.get(
        `${CONFIG.alplakes_api}/simulations/1d/metadata/${model}/${lake}`
      ));
    }
  } else if (model === "delft3d-flow") {
    try {
      ({ data: metadata } = await axios.get(
        `${
          CONFIG.alplakes_bucket
        }/simulations/${model}/cache/${lake}/metadata.json?timestamp=${general.hour()}`
      ));
    } catch (e) {
      ({ data: metadata } = await axios.get(
        `${CONFIG.alplakes_api}/simulations/metadata/${model}/${lake}`
      ));
    }
  } else {
    console.error("Model not recognised.");
    return false;
  }

  metadata.start_date = general.stringToDate(metadata.start_date + " 00:00");
  metadata.end_date = general.stringToDate(metadata.end_date + " 22:00");

  return metadata;
};
