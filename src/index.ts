import acto from '@abcnews/alternating-case-to-object';
import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import { loadScrollyteller } from 'jtfell-svelte-scrollyteller';

import App from './components/App/App.svelte';
import LineChart from './components/LineChartAlt/LineChart.svelte';

let appMounts: any[] = [];
let appMountChart;
let appProps;

const SCROLLYTELLERS = [
  'first',
  'second',
  'third',
  'fourth',
];

whenOdysseyLoaded.then(() => {
  SCROLLYTELLERS.forEach((name, i) => {
    try {
      const scrollyData = loadScrollyteller(name, 'u-full', 'mark');
      appMounts[i] = scrollyData.mountNode;

      if (appMounts[i]) {
        const mark = getMountValue(appMounts[i]);
        new App({
          target: appMounts[i],
          props: { scrollyData, name }
        });
      }
    } catch (e) {
      console.log(e);
    }
  });

  const mounts = selectMounts('linechart');
  appMountChart = mounts[0];
  if (appMountChart) {
    appMountChart.style = 'height: 300px; margin-top: 75px;';
    new LineChart({
      target: appMountChart,
      props: {}
    });
  }
});

if (process.env.NODE_ENV === 'development') {
  console.debug(`[algorithms-transparency] public path: ${__webpack_public_path__}`);
}
