<script context="module" lang="ts">
  import { range } from 'd3';
  import { runSimulation } from '../../lib/model';
  import { HISTORICAL_REJECTION_RATES, AUDIT_DATA } from '../../constants';
  import Scorecard from '../Scorecard/Scorecard.svelte';

  // Run the simulation in the module context, then we can use it for both:
  // - injecting the scorecards into the panels
  // - the algorithm viz component
  const historical = runSimulation(2015);
  historical[0].rejectionRate = HISTORICAL_REJECTION_RATES[0];
  historical[1].rejectionRate = HISTORICAL_REJECTION_RATES[1];

  const results = {
    'historical': historical,
    '2015': runSimulation(2015),
    '2016': runSimulation(2016),
    '2017': runSimulation(2017),
    'audit': AUDIT_DATA,
  };

  //
  // Preprocess the panels to add classes to panels for progress tracking and inject the scorecards
  // into certain panels
  //
  export const preprocessPanels = (panels: any[]) => {
    // add a class to all the panels that the sankey covers so we can use them as progress
    return panels.map(p => {
      if (p?.data.sankey) {
        p.panelClass = `sankey-panel year-${p.data.year} state-${p.data.state || ''}`;
      }
      if (p?.data.specialcolours) {
        p.panelClass = 'special-colours';
      }

      if (p.data.state === 'finished') {
        const scorecard = document.createElement('div');
        p.nodes.push(scorecard);

        const scores = range(2015, p.data.year + 1).map(y => {
          const simulatedResult = results[y];
          return {
            label: String(y),
            p1: Math.floor(simulatedResult[0].rejectionRate * 100),
            p2: Math.floor(simulatedResult[1].rejectionRate * 100),
          };
        });

        // Inject the svelte scorecard component into the panels
        new Scorecard({
          target: scorecard,
          props: {
            scores: [
              {
                label: 'Historical',
                p1: HISTORICAL_REJECTION_RATES[0] * 100,
                p2: HISTORICAL_REJECTION_RATES[1] * 100,
              },
              ...scores,
            ]
          }
        });
      }
      return p;
    });
  };

</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { subscribe } from '@abcnews/progress-utils';
  import { AUDIT_SCORECARD } from '../../constants';

  import AlgorithmViz from './AlgorithmViz.svelte';

  // Use the classes added to panels in "preprocessPanels" to keep track of the scroll percentage
  // for each of the three sankey runs
  const panelPercentages = {};
  onMount(() => {
    const subscribeToYear = (y: string) => {
      subscribe(`sankey-${y}`, (message: any) => {
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
        panelPercentages[y] = progressPercentage;
      }, { indicatorSelector: `.sankey-panel.year-${y}.state-running` });
    }

    subscribeToYear('2015');
    subscribeToYear('2016');
    subscribeToYear('2017');
    subscribeToYear('audit');
  });

  export let width: number;
  export let height: number;
  export let year: string;
  export let state: string | null;
  export let showScorecard: boolean;

  $: showRefusals = year !== 'audit';
  $: scorecardScores = showScorecard ? AUDIT_SCORECARD : [];
</script>

{#if width && height}
  <AlgorithmViz
    {width}
    {height}
    {results}
    {year}
    {state}
    {showRefusals}
    {scorecardScores}
    progressPercentage={panelPercentages[year]}
  />
{/if}

<style lang="scss">
  :global(.scrollyteller .sankey-panel) {
    :global(p),
    :global(span) {
      color: white;
    }

    &::before {
      background-color: #1B1023 !important;
    }
  }

  :global(.sankey-scorecard) {
    font-family: ABCSans, Helvetica, sans-serif;

    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 1rem;
    background: black;

    :global(h6) {
      font-size: 1rem;
      color: white;
      margin: 0 0 0.5em;
    }

    :global(.title) {
      font-size: 0.9rem;
      width: 100px;
      text-align: center;
      transform: translateY(2px);
    }

    :global(div.row) {
      display: flex;
      justify-content: space-between;
      width: 100%;

      font-weight: 700;

      :global(.score) {
        font-size: 0.9rem;
        width: 30px;
      }

      :global(.bar-wrapper) {
        width: 100%;
        display: flex;
        justify-content: center;
        transform: translateY(5px);

        :global(.middle-line) {
          width: 2px;
          background: white;
          height: 17px;
          transform: translateY(-2px);
        }

        :global(.bar) {
          width: 100%;
          height: 13px;
        }
        :global(.bar-inner) {
          height: 13px;
        }
      }

    }

    /* Stay inside panel scrim */
    padding-left: 1.5rem;
    padding-right: 1.5rem;
    margin-top: 0;
    margin-left: auto !important;
    margin-right: auto !important;
    width: 66.666667%;
    font-size: 1.375rem;
    line-height: 1.666666667;

    @media only screen and (max-width: 61.25rem) {
      width: 83.333333%;
      font-size: 1.125rem;
      line-height: 1.555555556;
    }
  }

</style>
