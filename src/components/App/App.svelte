<script lang="ts">
  // import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import Scrollyteller from '../../lib/components/Scrollyteller';
  // import Scrollyteller from '@abcnews/svelte-components/components/Scrollyteller/Scrollyteller.svelte';
  import AnimationController from '../AnimationController/AnimationController.svelte';
  import Simulation, { preprocessPanels } from '../Sankey/Simulation.svelte';

  import { postprocessPanel } from '../../lib/panelModifications';
  import { DARK_BG, PINK_BG } from '../../constants';

  export let scrollyData: any;
  export let name: string;
  export let onTransitionToInsideBox = () => null;
  export let onTransitionToOutsideBox = () => null;
  export let isDarkBackground: string;

  // HIGH LEVEL STATE
  let scrollytellerName = name || 'first';
  let frameMarker: string | null = null;

  // SANKEY
  // none, historical, 2015, 2016, 2017
  let sankeyYear: string = '2015';
  // running, finished, updated
  let sankeyState: string | null = null;
  let sankeyScorecard: boolean = false;

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
    // console.log(state);
    // const prevFrame = frameMarker;
    if (state.frame) {
      frameMarker = String(state.frame);
    }

    if (state.sankey) {
      sankeyYear = state.year;
      sankeyState = state.state;
      sankeyScorecard = !!state.scorecard;
    }

    // Special cases around the transition point
    if (scrollytellerName === 'second' && (frameMarker === '2' || frameMarker === '1')) {
      onTransitionToOutsideBox();
    }
    if (scrollytellerName === 'second' && frameMarker === '3') {
      onTransitionToInsideBox();
    }
  });

  // Position the graphic
  let width: number;
  let height: number;
  let simWidth: number;
  const root = document.documentElement;

  $: absolutePath = __webpack_public_path__ || '/';
  $: root.style.setProperty('--noise-url', `url(${absolutePath}Noise.png)`);
  $: simWidth = Math.min(500, width);

  // Centre the animation frame on small screens
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
  useScrollout={scrollytellerName !== 'first'}
  backgroundColour={isDarkBackground ? DARK_BG : PINK_BG}
>

  <main
    bind:clientWidth={width}
    bind:clientHeight={height}
    class="graphic"
    style="
      --x-offset: -{xOffset}px;
    "
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
      {#if isDarkBackground && scrollytellerName === 'second'}
        <div in:fade="{{duration: 200,delay:400}}" class="background-cover" />
      {/if}
      <AnimationController
        {scrollytellerName}
        {frameMarker}
        onTransitionToDark={onTransitionToInsideBox}
      />
    {/if}
  </main>
</Scrollyteller>

<style lang="scss">
  :global(.Main, html) {
    background: var(--background-colour);
    transition: background 400ms ease-in;
  }

  :global(.FormatCredit > p > span) {
    color: white;
  }

  :global(.Main.u-layout > h2) {
    position: relative;
    z-index: 100;
  }

  :global(.ImageEmbed.u-pull) {
    color: var(--text-colour);
    position: relative;
    z-index: 100;
    transition: color 400ms ease-in;

    :global(a) {
      color: var(--text-colour) !important;
    }
  }

  .graphic {
    position: relative;
    height: 100vh;
    width: 100vw;
    background: var(--background-colour);
    transition: background 400ms ease-in;
  }

  .noise {
    position: fixed;
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
    z-index: 3;
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
    transition: color 400ms ease-in;
  }

  /* size and position the visuals based on the viewport height */
  :global(.graphic > .scorecard-wrapper),
  :global(.graphic > svg) {
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
    :global(.graphic > .scorecard-wrapper),
    :global(.graphic > svg) {
      transform: translate(-50vw, -50%);
    }

    :global(.scrollyteller .st-panel),
    :global(.scrollyteller .panel) {
      margin-left: 55vw !important;
      max-width: 40vw !important;
    }

    /* Keep the first scrollyteller centered */
    :global(#scrollytellerNAMEfirstFRAME1) {
      :global(.graphic svg) {
        transform: translate(var(--x-offset), -50%);
      }

      :global(.scrollyteller .st-panel),
      :global(.scrollyteller .panel) {
        margin-left: auto !important;
        max-width: 900px !important;
        text-align: center;
      }
    }
  }

  /* 
     The end of the first scrollyteller needs to land just on top of the title
   */
  :global(#scrollytellerNAMEfirstFRAME1) {
    margin-bottom: -43vh;

    :global(.panel:first-child),
    :global(.st-panel:first-child) {
      margin-top: 62vh;
    }

    :global(.panel:last-of-type),
    :global(.st-panel:last-of-type) {
      margin-bottom: 100vh;
    }
  }
  :global(.Header, .Main.u-layout > p) {
    z-index: 100;
    position: relative;
  }

  :global(.Header) {
    background: linear-gradient(6deg, rgba(197,184,223,0.420045518207283) 100%, rgba(197,184,223,0.8981967787114846) 0%);
  }

  /* Allow the panels to be coloured based on light vs dark background setting */
  :global(.scrollyteller .panel),
  :global(.scrollyteller .st-panel) {
    &::before {
      background-color: var(--background-colour) !important;
      opacity: var(--scrim-opacity);
      box-shadow: none !important;
      transition: background-color 400ms ease-in;
    }
  }

  :global(a) {
    color: var(--link-colour) !important;
    /* transition: color 600ms linear; */

    &:visited {
      color: var(--link-colour-visited) !important;
    }
  }

  :global(p),
  :global(span) {
    color: var(--text-colour) !important;
    /* transition: color 600ms linear; */
  }

  /* 
     This class is added to 'Red' and 'Blue' mentions in the scrollyteller panels
     during the sankey section
   */
  :global(.panel-text-highlight) {
    font-weight: 600;
    white-space: nowrap;
    margin-left: -0.2rem;
  }

</style>
