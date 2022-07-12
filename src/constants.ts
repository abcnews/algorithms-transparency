import { calcDist } from './lib/calc';

export const HISTORICAL_REJECTION_RATES = [0.26, 0.33];

// export const INITIAL_DIST_IND = {
//   low: 1 / 6,
//   med: 2 / 6,
//   high: 3 / 6,
// };
//
// export const INITIAL_DIST_AUS = {
//   low: 3 / 6,
//   med: 2 / 6,
//   high: 1 / 6,
// };

// blue
export const INDIA = {
  name: 'India',
  colour: '#6B81FF',
  numberOfApplicants: 100,
  dist: calcDist(HISTORICAL_REJECTION_RATES[1], HISTORICAL_REJECTION_RATES[0]),
}

// red
export const AUS = {
  name: 'Australia',
  colour: '#FF5148',
  numberOfApplicants: 100,
  dist: calcDist(HISTORICAL_REJECTION_RATES[0], HISTORICAL_REJECTION_RATES[1]),
}

// From "Experiments in Automating Immigration"
export const REJECTION_RATES = {
  low: 0.04,
  med: 0.3,
  high: 0.5,
};

export const INITIAL_YEAR = 2015;

export const LINE_CHART_COLOURS = {
  Syria: '#00297E',
  Australia: '#007BC7',
  'United States': '#006B75',
  Nepal: '#E52A00',
};
