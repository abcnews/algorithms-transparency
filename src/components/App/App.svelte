<script lang="ts">
  import Chart from '../Chart.svelte';
  import Scrollyteller from 'jtfell-svelte-scrollyteller';
  import { onMount } from 'svelte';
  import { subscribe } from '@abcnews/progress-utils';

  export let scrollyData: any;
  const orientation = 'horizontal';

  const MOBILE_BREAKPOINT = 480;
  let width: number;
  let height: number;
  // Responsively sized dimensions (1.2:1 on mobile, 1:1 on desktop)
  $: {
    if (width < MOBILE_BREAKPOINT && height) {
      height = width * 1.2;
    } else {
      height = width * 1;
    }
  }


  let progressPercentage = 0;
  let totalParticles = 10;
  let showSankey = false;
  let showLabels = false;
  let colours = {
    "Low Risk": false,
    "Med Risk": false,
    "High Risk": false,
  };

  onMount(() => {
    subscribe('sankey', (message) => {
      if (!message.data) {
        return;
      }

      progressPercentage = Math.round(message.data.region * 100);
      if (progressPercentage < 0) {
        progressPercentage = 0;
      }

      // console.log(progressPercentage);
    }, { indicatorSelector: '.sankey-panel' });
  });


  let updateState = ((state: any) => {
    if (state.sankey === 'one') {
      showSankey = true;
      showLabels = false;
      colours = {
        "Low Risk": false,
        "Med Risk": false,
        "High Risk": false,
      };
      totalParticles = 50;
      return;
    }
    if (state.sankey === 'two') {
      showSankey = true;
      showLabels = true;
      colours = {
        "Low Risk": true,
        "Med Risk": true,
        "High Risk": true,
      };
      totalParticles = 50;
      return;
    }
    if (state.sankey === 'three') {
      showSankey = true;
      showLabels = true;
      colours = {
        "Low Risk": false,
        "Med Risk": false,
        "High Risk": true,
      };
      totalParticles = 50;
      return;
    }
    showSankey = false;
  });

  const input = {
    "Nation A": {
      "Compliant": {
        "Low Risk": 11,
        "Med Risk": 2,
        // "High Risk": 0,
      },
      "Non-Compliant": {
        // "Low Risk": 2,
        "Med Risk": 6,
        "High Risk": 2,
      },
    },
    "Nation B": {
      // "Compliant": {
      //   "Low Risk": 5,
      //   "Med Risk": 5,
      //   "High Risk": 0,
      // },
        // "Low Risk": 0,
        // "Med Risk": 0,
        "High Risk": 10,
    },
  };

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
      if (p?.data.sankey) {
        p.panelClass = 'sankey-panel';
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
      {#if width > 0 && height > 0 && showSankey}
        <svg width={width} height={height} viewBox="0 0 {width} {height}">
          <Chart {showLabels} {colours} {progressPercentage} {totalParticles} {orientation} {width} {height} {input} />
        </svg>
      {/if}
    </div>
  </main>
</Scrollyteller>

<style lang="scss">
  .graphic {
    position: relative;
    height: 100vh;
    width: 100vw;
  }

  .wrapper {
    margin-top: 0.75rem;
    padding: 1rem;
    max-width: 40rem;
    height: 100%;
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

</style>
