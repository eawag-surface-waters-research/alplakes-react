import axios from "axios";

export const fetchDataParallel = async (urls) => {
  const requests = Object.entries(urls).map(([key, url]) =>
    axios
      .get(url)
      .then((response) => ({ [key]: response.data }))
      .catch(() => ({ [key]: {} }))
  );
  const responses = await Promise.all(requests);
  const result = Object.assign({}, ...responses);
  return result;
};

const isSimilarSubstring = (item, term) => {
  for (let i = 0; i <= item.length - term.length; i++) {
    let differences = 0;
    for (let j = 0; j < term.length; j++) {
      if (item[i + j] !== term[j]) differences++;
      if (differences > 1) break;
    }
    if (differences <= 1) return true;
  }
  return false;
};

export const searchList = (search, list) => {
  list.map((l) => {
    l.display = Object.values(l.name).some((item) =>
      isSimilarSubstring(
        item.toLowerCase().replaceAll(" ", ""),
        search.toLowerCase().replaceAll(" ", "")
      )
    );
    return l;
  });
  return list;
};

export const inBounds = (latitude, longitude, bounds) => {
  if (
    latitude >= bounds._southWest.lat &&
    longitude >= bounds._southWest.lng &&
    latitude <= bounds._northEast.lat &&
    longitude <= bounds._northEast.lng
  ) {
    return true;
  }
  return false;
};

export const onMouseOver = (event) => {
  try {
    document.getElementById(
      "pin-" + event.target.id.split("-")[1]
    ).style.border = "2px solid orange";
  } catch (e) {}
};

export const onMouseOut = (event) => {
  try {
    document.getElementById(
      "pin-" + event.target.id.split("-")[1]
    ).style.border = "2px solid transparent";
  } catch (e) {}
};

export const sortList = (list, property, ascending) => {
  var x = 1;
  var y = -1;
  if (ascending) {
    x = -1;
    y = 1;
  }
  return list.sort((a, b) => (a[property] > b[property] ? y : x));
};
