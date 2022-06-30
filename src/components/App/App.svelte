<script lang="ts">
  import Chart from '../Chart.svelte';
  import Scrollyteller from 'jtfell-svelte-scrollyteller';
  import { onMount } from 'svelte';
  import { subscribe } from '@abcnews/progress-utils';

  export let scrollyData: any;

  const results = [
    {
      nation: {
        name: 'Australia',
        colour: 'green',
        numberOfApplicants: 100,
        dist: {
          low: 0.6,
          med: 0.2,
          high: 0.2,
        }
      },
      rejectionRate: 0.12,
      outcome: {
        low: {
          approved: 75,
          rejected: 5,
        },
        med: {
          approved: 10,
          rejected: 20,
        },
        high: {
          approved: 2,
          rejected: 1,
        },
      },
    },
    {
      nation: {
        name: 'India',
        colour: 'blue',
        numberOfApplicants: 100,
        dist: {
          low: 0.2,
          med: 0.2,
          high: 0.6,
        }
      },
      rejectionRate: 0.22,
      outcome: {
        low: {
          approved: 15,
          rejected: 10,
        },
        med: {
          approved: 60,
          rejected: 20,
        },
        high: {
          approved: 40,
          rejected: 40,
        },
      },
    },
  ];

  const MOBILE_BREAKPOINT = 480;
  let width: number;
  let height: number;
  // Responsively sized dimensions (1.2:1 on mobile, 1:1 on desktop)
  $: {
    if (width < MOBILE_BREAKPOINT && height) {
      height = width * 0.7;
    } else {
      height = width * 0.7;
    }
  }

  let progressPercentage = 0;

  onMount(() => {
    subscribe('sankey', (message) => {
      if (!message.data) {
        return;
      }

      progressPercentage = Math.round(message.data.region * 100);
      if (progressPercentage < 0) {
        progressPercentage = 0;
      }
    }, { indicatorSelector: '.sankey-panel' });
  });


  let updateState = ((state: any) => {
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
      {#if width > 0 && height > 0}
        <svg width={width} height={height} viewBox="0 0 {width} {height}">
          <Chart {results} {progressPercentage} {width} {height}  />
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
    height: 100%;
    /* max-width: 60rem; */
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
      margin-left: 5vw !important;
      width: 50vw;
    }

    :global(.scrollyteller .st-panel),
    :global(.scrollyteller .panel) {
      margin-left: 55vw !important;
      max-width: 40vw !important;
    }
  }

</style>
