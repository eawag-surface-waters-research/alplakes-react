export const DateCEST = (...args) => {
  if (args.length === 0) {
    const date = new Date();
    const options = {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    const formattedDate = new Intl.DateTimeFormat("en-GB", options).format(
      date
    );
    const [day, month, year, hour, minute, second] =
      formattedDate.split(/[/,: ]+/);
    const adjustedDate = new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}`
    );
    return adjustedDate;
  }
  if (typeof args[0] === "number") {
    const timestampDate = new Date(args[0]);
    const options = {
      timeZone: "Europe/Paris",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    const formattedDate = new Intl.DateTimeFormat("en-GB", options).format(
      timestampDate
    );
    const [day, month, year, hour, minute, second] =
      formattedDate.split(/[/,: ]+/);
    const adjustedDate = new Date(
      `${year}-${month}-${day}T${hour}:${minute}:${second}`
    );
    return adjustedDate;
  }
  return new Date(...args);
};

export const europeTime = (date) => {
  const localTime = new Date(date);
  const localOffset = localTime.getTimezoneOffset();
  const europeOffset = new Date().toLocaleString("en-US", {
    timeZone: "Europe/Paris",
    timeZoneName: "short",
  });
  const match = europeOffset.match(/([+-]\d{2}):?(\d{2})/);
  const europeHoursOffset = match ? parseInt(match[1]) : 1;
  const differenceInMinutes = europeHoursOffset * 60 + localOffset;
  const europeTime = new Date(
    localTime.getTime() + differenceInMinutes * 60 * 1000
  );
  return europeTime;
};

export const hour = () => {
  return `?timestamp=${
    Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
  }`;
};

export const summariseData = (timestamps, values) => {
  const ONE_DAY_MS = 86400000;
  const start = new DateCEST().setHours(0, 0, 0, 0);

  const out = Array.from({ length: 5 }, (_, i) =>
    formatDateYYYYMMDD(start + i * ONE_DAY_MS)
  ).reduce((acc, key) => ({ ...acc, [key]: [] }), {});

  timestamps.forEach((ts, i) => {
    const key = formatDateYYYYMMDD(new DateCEST(ts));
    if (out[key]) out[key].push(values[i]);
  });

  const summary = Object.fromEntries(
    Object.entries(out)
      .filter(([_, vals]) => vals.length > 0)
      .map(([key, vals]) => [key, mean(vals)])
  );

  const end_string = Object.keys(summary).pop();
  const year = parseInt(end_string.slice(0, 4), 10);
  const month = parseInt(end_string.slice(4, 6), 10) - 1;
  const day = parseInt(end_string.slice(6, 8), 10);
  const end = new Date(year, month, day);
  end.setDate(end.getDate() + 1);

  return { summary, start: new Date(start), end };
};

export const formatDateYYYYMMDD = (d) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

export const mean = (numbers) => {
  if (numbers.length < 3) return false;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const mean = Math.round((sum * 10) / numbers.length) / 10;
  return mean;
};
