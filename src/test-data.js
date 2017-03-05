import moment from 'moment';
let data = (() => {
  let array = [];
  let max = 0;
  let dates = Math.floor(Math.random() * (371 - 365 + 1) + 365);
  for (let i = 0; i < dates; i++){
    let count = Math.floor(Math.random() * 364);
    max < count ? (max = count) : false;
    array.push({
      count: count,
      date: moment('2017-03-04').subtract(370 - i, 'days').format('YYYY-MM-DD'),
    });
  }
  return {
    max: max,
    data: array,
  };
})()

export default data;