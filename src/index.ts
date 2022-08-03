import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import { loadScrollyteller } from './lib/components/Scrollyteller';
import { PINK_BG, DARK_BG, PINK_SCRIM, DARK_SCRIM } from './constants';
import './global.scss';

import App from './components/App/App.svelte';

let appMounts: any[] = [];
let appMountChart;
let appProps;

const SCROLLYTELLERS = [
  'first',
  'second',
  'third',
  'fourth'
];

let scrollytellerComponents: any[] = [];
let isDarkBackground = false;
const updateStates = () => {
  scrollytellerComponents.map(s => s && s.$set({ isDarkBackground }));
};

const root = document.documentElement;

const setToLightBackground = () => {
  if (!isDarkBackground) {
    return;
  }
  isDarkBackground = false;
  root.style.setProperty('--background-colour', PINK_BG);
  root.style.setProperty('--text-colour', 'black');
  root.style.setProperty('--link-colour', '#004DB2');
  root.style.setProperty('--link-colour-visited', '#300099');
  root.style.setProperty('--noise-opacity', '0.25');
  root.style.setProperty('--scrim-opacity', '0.8');
  root.style.setProperty('--scrim-background-colour', PINK_SCRIM);
  updateStates();
};
const setToDarkBackground = () => {
  if (isDarkBackground) {
    return;
  }
  isDarkBackground = true;
  root.style.setProperty('--background-colour', DARK_BG);
  root.style.setProperty('--text-colour', 'white');
  root.style.setProperty('--link-colour', '#6BB5FF');
  root.style.setProperty('--link-colour-visited', '#C0A3FF');
  root.style.setProperty('--noise-opacity', '0.12');
  root.style.setProperty('--scrim-opacity', '0.80');
  root.style.setProperty('--scrim-background-colour', DARK_SCRIM);
  updateStates();
};

isDarkBackground = true;
setToLightBackground();

const checkBg = () => {
  const isInside = isInsideBox();
  if (isInside === 'inside') {
    return setToDarkBackground();
  }
  if (isInside === 'outside') {
    return setToLightBackground();
  }
}

const isInsideBox = () => {
  const transitionPointIn = root.querySelector('.transition-into-box');
  const transitionPointOut = root.querySelector('.transition-out-of-box');
  const rectIn = transitionPointIn?.getBoundingClientRect();
  const rectOut = transitionPointOut?.getBoundingClientRect();
  if (!rectIn || !rectOut) {
    return null;
  }

  const diffTopIn = rectIn.top;
  const diffBottomIn = rectIn.bottom - (window.innerHeight || document.documentElement.clientHeight);
  const diffTopOut = rectOut.top;
  const diffBottomOut = rectOut.bottom - (window.innerHeight || document.documentElement.clientHeight);

  // We're in the first section
  if (diffBottomIn > 700) {
    return 'outside';
  }
  // We're in between (inside the box)
  if (diffTopIn < -500 && diffBottomOut > 700) {
    return 'inside';
  }

  // We're in the final section
  if (diffTopOut < -500) {
    return 'outside';
  }

  // We're somewhere around the transition point so we defer to the callbacks triggered by the animation
  return null;
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
              if (isInsideBox() === 'outside') {
                return;
              }
              root.style.setProperty('--background-colour', DARK_BG);
              // root.style.setProperty('--noise-opacity', '0.12');
              // root.style.setProperty('--scrim-opacity', '0.85');
              // root.style.setProperty('--scrim-background-colour', DARK_SCRIM);
              // root.style.setProperty('--text-colour', 'white');
              // root.style.setProperty('--link-colour', '#6BB5FF');
              // root.style.setProperty('--link-colour-visited', '#C0A3FF');
              setTimeout(setToDarkBackground, 100);
            },
            onTransitionToOutsideBox: () => {
              if (isInsideBox() === 'inside') {
                return;
              }
              setToLightBackground();
              // root.style.setProperty('--background-colour', PINK_BG);
              // root.style.setProperty('--noise-opacity', '0.25');
              // setTimeout(setToLightBackground, 50);
            },
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
  });

  addEventListener('scroll', () => checkBg());
});

if (process.env.NODE_ENV === 'development') {
  console.debug(`[algorithms-transparency] public path: ${__webpack_public_path__}`);
}
