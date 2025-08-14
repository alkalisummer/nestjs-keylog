export function timeToString(dateParam: Date) {
  const year: number | string = dateParam.getFullYear();
  let month: number | string = dateParam.getMonth() + 1;
  let date: number | string = dateParam.getDate();
  let hour: number | string = dateParam.getHours();
  let min: number | string = dateParam.getMinutes();
  let sec: number | string = dateParam.getSeconds();

  if (month < 10) {
    month = '0' + month;
  }
  if (date < 10) {
    date = '0' + date;
  }
  if (hour < 10) {
    hour = '0' + hour;
  }
  if (min < 10) {
    min = '0' + min;
  }
  if (sec < 10) {
    sec = '0' + sec;
  }

  const fullTimeFormat = `${year}${month}${date}${hour}${min}${sec}`;
  return fullTimeFormat;
}

export function parseDurationToMs(duration: string | number): number {
  if (typeof duration === 'number') {
    return duration * 1000;
  }
  const trimmed: string = duration.trim();
  const match = /^(\d+)\s*(ms|s|m|h|d)$/i.exec(trimmed);
  if (!match) {
    return 0;
  }
  const value: number = Number(match[1]);
  const unit: string = match[2].toLowerCase();
  switch (unit) {
    case 'ms':
      return value;
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 0;
  }
}
