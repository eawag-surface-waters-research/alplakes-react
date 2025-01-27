import axios from "axios";
import CONFIG from "../../../config.json";
import pako from "pako";
import * as d3 from "d3";
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
        }/simulations/${model}/cache/${lake}/linegraph_${parameter}.json${general.hour()}`
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
        }/simulations/${model}/cache/${lake}/metadata.json${general.hour()}`
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
        }/simulations/${model}/cache/${lake}/metadata.json${general.hour()}`
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

export const download3DMap = async (
  model,
  lake,
  start,
  end,
  depth,
  parameters,
  height,
  bucket = false
) => {
  var response = false;
  var urls = parameters.map((p) => {
    let api_url = `${
      CONFIG.alplakes_api
    }/simulations/layer_alplakes/${model}/${lake}/${p}/${general.formatAPIDatetime(
      start
    )}/${general.formatAPIDatetime(end)}/${depth}`;
    let bucket_url = `${
      CONFIG.alplakes_bucket
    }/simulations/${model}/cache/${lake}/${p}.txt.gz${general.hour()}`;
    if (bucket) {
      return [bucket_url, api_url];
    }
    return [api_url];
  });
  response = await fetchDataParallel(urls);
  const data = {};
  for (let i = 0; i < parameters.length; i++) {
    try {
      data[parameters[i]] = process3dData(response[i], parameters[i], height);
    } catch (e) {
      console.error(`Failed to process ${parameters[i]}`);
      console.error(e);
      data[parameters[i]] = false;
    }
  }
  return data;
};

const process3dData = (data, parameter, height) => {
  if (parameter === "geometry") {
    return data.split("\n").map((g) => g.split(",").map((s) => parseFloat(s)));
  } else {
    var timeArr = [];
    var dataArr = [];
    data = data.split("\n").map((g) => g.split(",").map((s) => parseFloat(s)));
    var bounds = { min: [], max: [] };
    for (let i = 0; i < Math.floor(data.length / (height + 1)); i++) {
      timeArr.push(
        general.parseAlplakesDate(String(data[i * (height + 1)][0]))
      );
      var slice = data.slice(i * (height + 1) + 1, (i + 1) * (height + 1));
      dataArr.push(slice);
      var slice_flat = slice.flat();
      if (parameter === "velocity") {
        slice_flat = slice_flat.map((d) => Math.abs(d));
      }
      bounds.min.push(d3.min(slice_flat));
      bounds.max.push(d3.max(slice_flat));
    }
    return {
      min: d3.min(bounds.min),
      max: d3.max(bounds.max),
      start: d3.min(timeArr),
      end: d3.max(timeArr),
      time: timeArr,
      data: dataArr,
    };
  }
};

const arrayBufferToString = (arrayBuffer) => {
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(arrayBuffer);
};

const fetchDataParallel = async (urls) => {
  const fetchData = async (url) => {
    for (let i = 0; i < url.length; i++) {
      try {
        const response = await axios.get(url[i], {
          responseType: "arraybuffer",
        });
        return response;
      } catch (error) {
        console.error(error);
      }
    }
    return false;
  };
  const requests = urls.map((url) => {
    return fetchData(url);
  });
  const responses = await Promise.all(requests);
  return responses.map((response) => {
    if (response) {
      if (response.headers["content-type"].includes("gzip")) {
        try {
          const decompressedData = pako.ungzip(response.data, { to: "string" });
          return decompressedData;
        } catch (error) {
          try {
            return arrayBufferToString(response.data);
          } catch (error) {
            return false;
          }
        }
      } else {
        return arrayBufferToString(response.data);
      }
    } else {
      return false;
    }
  });
};
