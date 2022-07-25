import acto from '@abcnews/alternating-case-to-object';
import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import { loadScrollyteller } from './lib/components/Scrollyteller';
import { PINK_BG, DARK_BG } from './constants';

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

let scrollytellerComponents: any[] = [];
let isDarkBackground = false;
const updateStates = () => {
  scrollytellerComponents.map(s => s && s.$set({ isDarkBackground }));
};

const root = document.documentElement;

const setToLightBackground = () => {
  isDarkBackground = false;
  root.style.setProperty('--background-colour', PINK_BG);
  root.style.setProperty('--text-colour', 'black');
  root.style.setProperty('--link-colour', '#004DB2');
  root.style.setProperty('--link-colour-visited', '#300099');
  root.style.setProperty('--scrim-opacity', '0.75');
  root.style.setProperty('--noise-opacity', '0.25');
  updateStates();
};
const setToDarkBackground = () => {
  isDarkBackground = true;
  root.style.setProperty('--background-colour', DARK_BG);
  root.style.setProperty('--text-colour', 'white');
  root.style.setProperty('--link-colour', '#6BB5FF');
  root.style.setProperty('--link-colour-visited', '#C0A3FF');
  root.style.setProperty('--scrim-opacity', '0.8');
  root.style.setProperty('--noise-opacity', '0.12');
  updateStates();
};

const checkBg = () => {
  const transitionPoint = root.querySelector('.special-colours');
  const rect = transitionPoint?.getBoundingClientRect();
  if (!rect) {
    return;
  }

  const diffTop = rect.top;
  const diffBottom = rect.bottom - (window.innerHeight || document.documentElement.clientHeight);

  if (diffTop < -500) {
    // We're below the panel
    // console.log('below');
    return setToDarkBackground();
  }
  if (diffBottom > 700) {
    // We're above the panel
    // console.log('above');
    return setToLightBackground();
  }
  // We're somewhere around the transition point so we defer to the callbacks triggered by the animation
  // console.log('too close');
};

whenOdysseyLoaded.then(() => {
  scrollytellerComponents = SCROLLYTELLERS.map((name, i) => {
    try {
      const scrollyData = loadScrollyteller(name, 'u-full', 'mark');
      appMounts[i] = scrollyData.mountNode;

      if (appMounts[i]) {
        const mark = getMountValue(appMounts[i]);
        return new App({
          target: appMounts[i],
          props: {
            scrollyData,
            name,
            isDarkBackground,
            onTransitionToInsideBox: () => {
              setToDarkBackground();
              checkBg();
            },
            onTransitionToOutsideBox: () => {
              setToLightBackground();
              checkBg();
            },
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
  });

  addEventListener('scroll', () => checkBg());

  const mounts = selectMounts('linechart');
  appMountChart = mounts[0];
  if (appMountChart) {
    appMountChart.style = 'padding-left: 15px;padding-right: 15px';
    new LineChart({
      target: appMountChart,
      props: {}
    });
  }
});

if (process.env.NODE_ENV === 'development') {
  console.debug(`[algorithms-transparency] public path: ${__webpack_public_path__}`);
}
