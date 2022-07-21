<script lang="ts">
  import Scrollyteller from 'jtfell-svelte-scrollyteller';
  import AnimationController from '../AnimationController/AnimationController.svelte';
  import Simulation, { preprocessPanels } from '../Sankey/Simulation.svelte';

  import { postprocessPanel } from '../../lib/panelModifications';
  import { DARK_BG, PINK_BG } from '../../constants';

  export let scrollyData: any;
  export let name: string;

  // HIGH LEVEL STATE
  let scrollytellerName = name || 'first';
  let frameMarker: string | null = null;

  // SANKEY
  // none, historical, 2015, 2016, 2017
  let sankeyYear: string = '2015';
  // running, finished, updated
  let sankeyState: string | null = null;
  let sankeyScorecard: boolean = false;

  const isDarkBackground = (name: string, frame: string | null): boolean => {
    return isSankeyFrame(name, frame) ||
      (name === 'third' && !!frame) ||
      (name === 'forth' && !!frame);
  };

  const isSankeyFrame = (name: string, frame: string | null): boolean => {
    // UK Visa Processing
    if (name === 'second' && frame === '3') {
      return true;
    }

    if (name === 'fourth') {
      return true;
    }

    return false;
  };

  let updateState = ((state: any) => {
    const prevFrame = frameMarker;
    if (state.frame) {
      frameMarker = String(state.frame);
    }

    if (state.sankey) {
      sankeyYear = state.year;
      sankeyState = state.state;
      sankeyScorecard = !!state.scorecard;
    }

    // Special case around the transition point
    if (scrollytellerName === 'second' && frameMarker === '2') {
      if (prevFrame === '3') {
        setToLightBackground();
      }
      return;
    }

    // Otherwise, set the background to light vs dark based on progress through the story
    if (isDarkBackground(scrollytellerName, frameMarker)) {
      setToDarkBackground();
    } else {
      setToLightBackground();
    }
  });

  // Position the graphic
  let width: number;
  let height: number;
  let simWidth: number;
  let darkBackground: boolean = false;

  const root = document.documentElement;
  const setToLightBackground = () => {
    darkBackground = false;
    root.style.setProperty('--background-colour', PINK_BG);
    root.style.setProperty('--text-colour', 'black');
    root.style.setProperty('--link-colour', '#0073a8');
    root.style.setProperty('--noise-opacity', '0.25');
  };
  const setToDarkBackground = () => {
    darkBackground = true;
    root.style.setProperty('--background-colour', DARK_BG);
    root.style.setProperty('--text-colour', 'white');
    root.style.setProperty('--link-colour', '#d398ea');
    root.style.setProperty('--noise-opacity', '0.12');
  };
  $: absolutePath = __webpack_public_path__ || '/';
  $: root.style.setProperty('--noise-url', `url(${absolutePath}Noise.png)`);

  // Start with light background
  setToLightBackground();

  $: simWidth = Math.min(500, width);

  // Centre the iframe on small screens
  let xOffset: number;
  $: {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const w = width - scrollbarWidth;
    xOffset = w/2 - (w - height) / 2 + scrollbarWidth / 2;
  }
</script>

<!-- We only want 1 of these -->
{#if scrollytellerName === 'first'}
  <div
    class="noise"
    style="background-image: var(--noise-url); opacity: var(--noise-opacity);"
  />
{/if}

<Scrollyteller
  panels={preprocessPanels(scrollyData.panels)}
  onMarker={updateState}
  {postprocessPanel}
>
<main
  bind:clientWidth={width}
  bind:clientHeight={height}
  class="graphic"
  style="--x-offset: -{xOffset}px;"
>

    {#if isSankeyFrame(scrollytellerName, frameMarker)}
      <Simulation
        year={sankeyYear}
        state={sankeyState}
        width={simWidth}
        height={height}
        showScorecard={sankeyScorecard}
      />
    {:else}
      {#if darkBackground && scrollytellerName === 'second'}
        <div class="background-cover" />
      {/if}
      <AnimationController
        {scrollytellerName}
        {frameMarker}
        onTransitionToDark={setToDarkBackground}
      />
    {/if}
  </main>
</Scrollyteller>

<style lang="scss">
  :global(.Main, html) {
    background: var(--background-colour);
  }

  :global(.FormatCredit > p > span) {
    color: white;
  }

  .graphic {
    position: relative;
    height: 100vh;
    width: 100vw;
    background: var(--background-colour);
  }

  .noise {
    position: fixed;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    z-index: 2;
  }

  .background-cover {
    background: var(--background-colour);
    position: absolute;
    height: 100vh;
    width: 100vw;
    z-index: 5000;
  }

  :global(.Main > p, .Main > h2) {
    color: var(--text-colour);
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

  /* Move the graphic to the left and the text to the right on desktop */
  @media (min-width: 76rem) {
    :global(.graphic iframe),
    :global(.graphic svg) {
      transform: translate(-50vw, -50%);
    }

    :global(.scrollyteller .st-panel),
    :global(.scrollyteller .panel) {
      margin-left: 55vw !important;
      max-width: 40vw !important;
    }

    /* Keep the first scrollyteller centered */
    :global(#scrollytellerNAMEfirstFRAME1) {
      :global(.graphic iframe),
      :global(.graphic svg) {
        transform: translate(var(--x-offset), -50%);
      }

      :global(.scrollyteller .st-panel),
      :global(.scrollyteller .panel) {
        margin-left: auto !important;
        max-width: none !important;
        text-align: center;
      }
    }
  }

  /* 
     The end of the first scrollyteller needs to land just on top of the title
   */
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

  /* Allow the panels to be coloured based on light vs dark background setting */
  :global(.scrollyteller .panel),
  :global(.scrollyteller .st-panel) {
    &::before {
      background-color: var(--background-colour) !important;
      /* background-image: var(--noise-url); */
      box-shadow: none !important;
      opacity: 0.75;
    }

    :global(a) {
      color: var(--link-colour) !important;
    }

    :global(p),
    :global(span) {
      color: var(--text-colour) !important;
    }
  }

  /* 
     This class is added to 'Red' and 'Blue' mentions in the scrollyteller panels
     during the sankey section
   */
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

</style>
