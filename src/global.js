
export const DateCEST = (...args) => {
  if (args.length === 0) {
    const date = new Date();
    const options = { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(date);
    const [day, month, year, hour, minute, second] = formattedDate.split(/[/,: ]+/);
    const adjustedDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    return adjustedDate;
  }
  if (typeof args[0] === 'number') {
    const timestampDate = new Date(args[0]);
    const options = { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(timestampDate);
    const [day, month, year, hour, minute, second] = formattedDate.split(/[/,: ]+/);
    const adjustedDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    return adjustedDate;
  }
  return new Date(...args);
  }

  export const hour = () => {
    return `?timestamp=${
      Math.round((new Date().getTime() + 1800000) / 3600000) * 3600 - 3600
    }`;
  };