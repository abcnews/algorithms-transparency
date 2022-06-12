import acto from '@abcnews/alternating-case-to-object';
import { whenOdysseyLoaded } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import { loadScrollyteller } from 'jtfell-svelte-scrollyteller';
import App from './components/App/App.svelte';

let appMountEl1;
let appMountEl2;
let appProps;

whenOdysseyLoaded.then(() => {
  const scrollyData = loadScrollyteller('first', 'u-full', 'mark');
  appMountEl1 = scrollyData.mountNode;

  if (appMountEl1) {
    const mark = getMountValue(appMountEl1);
    new App({
      target: appMountEl1,
      props: { scrollyData }
    });
  }
});

if (process.env.NODE_ENV === 'development') {
  console.debug(`[algorithms-transparency] public path: ${__webpack_public_path__}`);
}
