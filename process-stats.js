const fs = require('fs');
const statsCsv = fs.readFileSync(`${__dirname}/public/uk-stats.csv`, 'utf8')
  .split('\n').map(line => line.replace('\r', '').split(','));

const COLUMNS = {
  YEAR: 0,
  QUARTER: 1,
  COUNTRY: 2,
  OUTCOME: 8,
  COUNT: 9,
};

const statsPerCountryPerYear = statsCsv.reduce(
  (acc, line) => {
    const country = acc[line[COLUMNS.COUNTRY]] || {};
    const year = country[line[COLUMNS.YEAR]] || {};

    year[line[COLUMNS.OUTCOME]] = (year[line[COLUMNS.OUTCOME]] || 0) + parseInt(line[COLUMNS.COUNT]);

    if (year.Issued && year.Withdrawn && year.Refused) {
      year.rate = year.Issued / (year.Refused + year.Withdrawn + year.Issued) * 100;
    }

    country[line[COLUMNS.YEAR]] = year;
    return {
      ...acc,
      [line[COLUMNS.COUNTRY]]: country,
    }
  },
  {}
);

const output = Object.keys(statsPerCountryPerYear).map(
  country => Object.keys(statsPerCountryPerYear[country]).map(year =>
    `${country},${year},${statsPerCountryPerYear[country][year].rate}`
  ).join('\n')
).join('\n');

fs.writeFileSync(`${__dirname}/uk-stats-processed.csv`, output);
