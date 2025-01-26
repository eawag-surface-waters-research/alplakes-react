export const getColor = (value, min, max, palette) => {
  if (value === null || isNaN(value)) {
    return false;
  }
  if (value > max) {
    return palette[palette.length - 1].color;
  }
  if (value < min) {
    return palette[0].color;
  }
  var loc = (value - min) / (max - min);

  var index = 0;
  for (var i = 0; i < palette.length - 1; i++) {
    if (loc >= palette[i].point && loc <= palette[i + 1].point) {
      index = i;
    }
  }
  var color1 = palette[index].color;
  var color2 = palette[index + 1].color;

  var f =
    (loc - palette[index].point) /
    (palette[index + 1].point - palette[index].point);

  var rgb = [
    color1[0] + (color2[0] - color1[0]) * f,
    color1[1] + (color2[1] - color1[1]) * f,
    color1[2] + (color2[2] - color1[2]) * f,
  ];

  return rgb;
};

export const round = (value, decimals) => {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
};

export const formatTime = (date) => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  hours = hours.toString().padStart(2, "0");
  minutes = minutes.toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const formatDatetime = (datetime, offset = 0) => {
  var a = new Date(datetime).getTime();
  a = new Date(a + offset);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  var date = a.getDate();
  var hour = a.getHours();
  var minute = a.getMinutes();
  return `${date < 10 ? "0" + date : date}.${
    month < 10 ? "0" + month : month
  }.${String(year)} ${hour < 10 ? "0" + hour : hour}:${
    minute < 10 ? "0" + minute : minute
  }`;
};

export const capitalize = (string) => {
  if (string.length === 0) {
    return string;
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
};
