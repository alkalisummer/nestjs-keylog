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
