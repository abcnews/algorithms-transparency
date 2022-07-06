<script lang="ts">
  import Scrollyteller from 'jtfell-svelte-scrollyteller';
  // import { onMount } from 'svelte';
  // import { subscribe } from '@abcnews/progress-utils';

  import AnimationController from '../AnimationController/AnimationController.svelte';
  // import SVG from '../KeyshapeSVG/KeyshapeSVG.svelte';
  // import Simulation from '../Sankey/Simulation.svelte';
  // import LineChart from '../LineChart/LineChart.svelte';

  export let scrollyData: any;

  // let year: number = 2015;
  let frameMarker: string | null = null;

  const MOBILE_BREAKPOINT = 1215;
  let width: number;
  let height: number;
  // Responsively sized dimensions (1.2:1 on mobile, 1:1 on desktop)
  // $: {
  //   if (width < MOBILE_BREAKPOINT && height) {
  //     height = width * 0.6;
  //   } else {
  //     height = width * 0.6;
  //   }
  // }

  // const panelPercentages = {};
  // onMount(() => {
  //   const subscribeToYear = (year: number) => {
  //     subscribe(`sankey-${year}`, (message) => {
  //       if (!message.data) {
  //         return;
  //       }
  //
  //       const progressPercentage = Math.round(message.data.region * 100);
  //       if (progressPercentage < 0) {
  //         progressPercentage = 0;
  //       }
  //       if (progressPercentage > 100) {
  //         progressPercentage = 100;
  //       }
  //       panelPercentages[String(year)] = progressPercentage;
  //     }, { indicatorSelector: `.sankey-panel.year-${year}` });
  //   }
  //
  //   subscribeToYear(2015);
  //   subscribeToYear(2016);
  //   subscribeToYear(2017);
  // });

  let updateState = ((state: any) => {
    if (state.frame) {
      frameMarker = String(state.frame);
    }

    // year = state.simulate;
  });

  // Centre the iframe on small screens
  $: xOffset = width / 2 - (width - height) / 2;
</script>

<Scrollyteller
  panels={scrollyData.panels}
  onMarker={updateState}
>
  <main bind:clientWidth={width} bind:clientHeight={height} class="graphic" style="--x-offset: -{xOffset}px">
      <div class="noise" />
      {#if width > 0 && height > 0}
        <AnimationController width={height} {height} {frameMarker} />
        <!-- <Simulation {year} progressPercentage={panelPercentages[year]} {width} {height} /> -->
      {/if}
  </main>
</Scrollyteller>

<style lang="scss">
  :global(.Main, html) {
    background: #c5b8df;
  }

  .graphic {
    position: relative;
    height: 100vh;
    width: 100vw;
  }

  :global(.graphic iframe) {
    /* https://jonathannicol.com/blog/2014/06/16/centre-crop-thumbnails-with-css/ */
    position: absolute;
    left: 50%;
    top: 50%;

    /* We want to force 1:1 ratio, and lose the sides */
    width: 100vh;
    height: 100vh;
    transform: translate(var(--x-offset),-50%);
    max-width: 200vw;
  }

  .noise {
    position: absolute;
    left: 0;
    top: 0;
    height: 100vh;
    width: 1000vw;
    transform: translate(-500px, 0%);
    background-repeat: repeat;
    opacity: 0.25;
    z-index: 99;
    background-image: url(/Noise.png);
  }

  :global(.panel-text-highlight) {
    margin: 0 0.05em;
    border: 0.125rem solid transparent;
    padding: 0 0.2em;
    display: inline-block;
    color: #fff;
    font-style: normal;
    font-weight: normal;
    line-height: 1.25;
    white-space: nowrap;
  }

  @media (min-width: 76rem) {
    :global(.graphic iframe) {
      transform: translate(-50vw, -50%);
    }

    :global(.scrollyteller .st-panel),
    :global(.scrollyteller .panel) {
      margin-left: 55vw !important;
      max-width: 40vw !important;
    }
  }

</style>
