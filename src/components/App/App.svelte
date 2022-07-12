<script lang="ts">
  import Scrollyteller from 'jtfell-svelte-scrollyteller';
  import { onMount } from 'svelte';
  import { subscribe } from '@abcnews/progress-utils';

  import AnimationController from '../AnimationController/AnimationController.svelte';
  import Simulation from '../Sankey/Simulation.svelte';

  export let scrollyData: any;

  // HIGH LEVEL STATE
  let scrollytellerName = 'first';
  let frameMarker: string | null = null;

  // SANKEY
  // none, historical, 2015, 2016, 2017
  let sankeyYear: string = '2015';
  // running, finished, updated
  let sankeyState: string | null = null;

  const isSankeyFrame = (name: string, frame: string | null) => {
    // console.log(name, frame);
    if (name === 'second' && frame === '3') {
      return true;
    }

    return false;
  };

  const panelPercentages = {};
  onMount(() => {
    const subscribeToYear = (year: number) => {
      subscribe(`sankey-${year}`, (message: any) => {
        if (!message.data) {
          return;
        }

        let progressPercentage = Math.round(message.data.region * 100);
        if (progressPercentage < 0) {
          progressPercentage = 0;
        }
        if (progressPercentage > 100) {
          progressPercentage = 100;
        }
        panelPercentages[String(year)] = progressPercentage;
      }, { indicatorSelector: `.sankey-panel.year-${year}.state-running` });
    }

    subscribeToYear(2015);
    subscribeToYear(2016);
    subscribeToYear(2017);
  });

  const preprocessPanels = (panels: any[]) => {
    // add a class to all the panels that the sankey covers so we can use them as progress
    return panels.map(p => {
      if (p?.data.sankey) {
        p.panelClass = `sankey-panel year-${p.data.year} state-${p.data.state || ''}`;
      }
      return p;
    });
  };

  let updateState = ((state: any) => {
    // console.log(state);
    if (state.frame) {
      frameMarker = String(state.frame);
    }
    if (state.name) {
      scrollytellerName = state.name;
    }

    if (state.sankey) {
      sankeyYear = state.year;
      sankeyState = state.state;
    }
  });

  // Position the graphic
  let width: number;
  let height: number;
  let simWidth: number;

  $: backgroundColour = isSankeyFrame(scrollytellerName, frameMarker) ? '#1B1023' : '#c5b8df';

  $: {
    simWidth = Math.min(400, width);
  }

  // Centre the iframe on small screens
  let xOffset: number;
  $: {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const w = width - scrollbarWidth;
    xOffset = w/2 - (w - height) / 2 + scrollbarWidth / 2;
  }
  $: absolutePath = __webpack_public_path__ || '/';
</script>

<Scrollyteller
  panels={preprocessPanels(scrollyData.panels)}
  onMarker={updateState}
>
<main bind:clientWidth={width} bind:clientHeight={height} class="graphic" style="--x-offset: -{xOffset}px; background: {backgroundColour}">
    <div class="noise" style="background-image: url({absolutePath}Noise.png)" />
    {#if isSankeyFrame(scrollytellerName, frameMarker)}
        <Simulation
          year={sankeyYear}
          state={sankeyState}
          progressPercentage={panelPercentages[sankeyYear]}
          width={simWidth}
          height={height}
        />
    {:else}
      <AnimationController {scrollytellerName} {frameMarker} />
    {/if}
  </main>
</Scrollyteller>

<style lang="scss">
  :global(html) {
    --background-colour: #c5b8df;
  }
  :global(.Main, html) {
    background: var(--background-colour);
  }
  .graphic {
    position: relative;
    height: 100vh;
    width: 100vw;
  }

  /* size and position the visuals based on the viewport height */
  :global(.graphic iframe, .graphic svg) {
    /* https://jonathannicol.com/blog/2014/06/16/centre-crop-thumbnails-with-css/ */
    position: absolute;
    left: 50%;
    top: 50%;

    /* We want to force 1:1 ratio, and lose the sides */
    width: 100vh;
    height: 100vh;
    transform: translate(var(--x-offset), -50%);
    max-width: 5000vw;
  }

  /* cover the graphic with the noise texture */
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
  }

  /* Move the graphic to the left and the text to the right on desktop */
  @media (min-width: 76rem) {
    :global(.graphic iframe, .graphic svg) {
      transform: translate(-50vw, -50%);
    }

    :global(.scrollyteller .st-panel),
    :global(.scrollyteller .panel) {
      margin-left: 55vw !important;
      max-width: 40vw !important;
    }
  }


  /* Get the transition into the title right */
  :global(#scrollytellerNAMEfirstFRAME1) {
    margin-bottom: -53vh;
  }
  :global(.Header, .Main.u-layout > p) {
    z-index: 100;
    position: relative;
  }

  :global(#scrollytellerNAMEfirstFRAME1 .st-panel):last-child ,
  :global(#scrollytellerNAMEfirstFRAME1 .panel):last-child {
    margin-bottom: 100vh;
  }

  /* :global(.panel-text-highlight) { */
  /*   margin: 0 0.05em; */
  /*   border: 0.125rem solid transparent; */
  /*   padding: 0 0.2em; */
  /*   display: inline-block; */
  /*   color: #fff; */
  /*   font-style: normal; */
  /*   font-weight: normal; */
  /*   line-height: 1.25; */
  /*   white-space: nowrap; */
  /* } */

  /* :global(.scrollyteller .st-panel)::before, */
  /* :global(.scrollyteller .panel)::before { */
  /*   background: #c5b8df !important; */
  /*   box-shadow: none; */
  /*   opacity: 0.8; */
  /* } */

</style>
