<script lang="ts">
  import { fade } from 'svelte/transition';
  import Scrollyteller from '../../lib/components/Scrollyteller';
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

    // Algo audits
    if (name === 'fourth' && frame === '1') {
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

    // Special cases around the transition points
    if (scrollytellerName === 'second' && (frameMarker === '2' || frameMarker === '1') && prevFrame === '3') {
      onTransitionToOutsideBox();
    }
    if (scrollytellerName === 'second' && frameMarker === '3') {
      onTransitionToInsideBox();
    }

    if (scrollytellerName === 'fourth' && frameMarker === '1' && prevFrame === '2') {
      onTransitionToInsideBox();
    }
    if (scrollytellerName === 'fourth' && frameMarker === '2') {
      onTransitionToOutsideBox();
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
        <div class="background-cover" />
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
    z-index: 50;
  }

</style>
