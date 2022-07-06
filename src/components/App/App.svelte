<script lang="ts">
  import Scrollyteller from 'jtfell-svelte-scrollyteller';
  import { onMount } from 'svelte';
  import { subscribe } from '@abcnews/progress-utils';

  import AnimationController from '../AnimationController/AnimationController.svelte';
  // import SVG from '../KeyshapeSVG/KeyshapeSVG.svelte';
  // import Simulation from '../Sankey/Simulation.svelte';
  // import LineChart from '../LineChart/LineChart.svelte';

  let iframeEl;

  export let scrollyData: any;

  let year: number = 2015;
  let frameMarker: string | null = null;

  const MOBILE_BREAKPOINT = 480;
  let width: number;
  let height: number;
  // Responsively sized dimensions (1.2:1 on mobile, 1:1 on desktop)
  $: {
    if (width < MOBILE_BREAKPOINT && height) {
      height = width * 0.6;
    } else {
      height = width * 0.6;
    }
  }

  const panelPercentages = {};
  onMount(() => {
    const subscribeToYear = (year: number) => {
      subscribe(`sankey-${year}`, (message) => {
        if (!message.data) {
          return;
        }

        const progressPercentage = Math.round(message.data.region * 100);
        if (progressPercentage < 0) {
          progressPercentage = 0;
        }
        if (progressPercentage > 100) {
          progressPercentage = 100;
        }
        panelPercentages[String(year)] = progressPercentage;
      }, { indicatorSelector: `.sankey-panel.year-${year}` });
    }

    subscribeToYear(2015);
    subscribeToYear(2016);
    subscribeToYear(2017);
  });


  let updateState = ((state: any) => {
    if (state.frame) {
      frameMarker = String(state.frame);
    }

    year = state.simulate;
  });

  function textNodesUnder(node: Node) {
    const textNodes: Node[] = [];
    const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
    let textNode: Node | null;

    while ((textNode = walk.nextNode())) {
      textNodes.push(textNode);
    }

    return textNodes;
  }

  const COLOUR_MAPPING = {
    'high': 'red',
    'medium': 'orange',
    'low': 'green',
  };

  const preprocessPanels = (panels) => {
    // add a class to all the panels that the sankey covers so we can use them as progress
    return panels.map(p => {
      if (p?.data.simulate) {
        p.panelClass = `sankey-panel year-${p.data.simulate}`;
      }

      return p;
    });
  };
  const postprocessPanel = (panel) => {
    const textNodes = textNodesUnder(panel);
    textNodes.forEach(node => {
      const text = node.textContent || '';

      // TODO: Check for boldness when data coming from CM?
      Object.keys(COLOUR_MAPPING).map(k => {
        if (text === k) {
          (node as any).parentNode.style.backgroundColor = COLOUR_MAPPING[k];
          (node as any).parentNode.classList.add('panel-text-highlight');
        }
      });
    });

      // const EMPHASISED_ELEMENTS_SELECTOR = 'strong,em,b,i';
      // const elements = nodes.filter(node => node.nodeType === Node.ELEMENT_NODE) as Element[];
      // const emphasisedElements = elements.reduce(
      //   (memo, element) => memo.concat(Array.from(element.querySelectorAll(EMPHASISED_ELEMENTS_SELECTOR))),
      //   [] as Element[]
      // );
  };

</script>

<Scrollyteller
  panels={preprocessPanels(scrollyData.panels)}
  onMarker={updateState}
  postprocessPanel={postprocessPanel}
>
  <main class="graphic">
    <div bind:clientWidth={width} bind:clientHeight={height} class="wrapper">
      {#if width > 0 && height > 0}
        <AnimationController {width} {height} {frameMarker} />
        <!-- <Simulation {year} progressPercentage={panelPercentages[year]} {width} {height} /> -->
      {/if}
    </div>
  </main>
</Scrollyteller>

<style lang="scss">
  :global(.Main, html) {
    background: #c5b8df;
  }

  .graphic {
    position: relative;
    height: 100vh;
    width: 100vh; /* We want to force 1:1 ratio, and lose the sides */
  }

  .wrapper {
    margin-top: 0.75rem;
    height: 100%;
    width: 100%;

    margin-left: calc((100vw - 100%) / 2);
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
    .wrapper {
      margin-left: 2vw;
    }
    /* .wrapper { */
    /*   margin-left: 5vw !important; */
    /*   width: 50vw; */
    /* } */

    :global(.scrollyteller .st-panel),
    :global(.scrollyteller .panel) {
      margin-left: 55vw !important;
      max-width: 40vw !important;
    }
  }

</style>
