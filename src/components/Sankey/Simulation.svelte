<script context="module" lang="ts">
  import { runSimulation } from '../../lib/model';
  import { HISTORICAL_REJECTION_RATES, BLUE, RED } from '../../constants';

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
  };

  const path = __webpack_public_path__ || '/';

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
        // Add the scorecard to the panels tagged with the "finished" state
        const scorecard = document.createElement('div');
        scorecard.classList.add('sankey-scorecard');
        
        const headerRow = document.createElement('div');
        headerRow.classList.add('row');

        const blueParticle = document.createElement('img');
        blueParticle.src = `${path}circle.svg`;
        blueParticle.style = 'transform: translate(0, 15px)';
        blueParticle.width = 22;
        blueParticle.height = 22;
        headerRow.append(blueParticle);

        const header = document.createElement('h6');
        header.innerText = 'REFUSAL RATES';
        headerRow.append(header);

        const redParticle = document.createElement('img');
        redParticle.src = `${path}squarestar.svg`;
        // Make up for weird shape of vector
        redParticle.style = 'transform: translate(-6px, 15px)';
        redParticle.width = 22;
        redParticle.height = 19;
        headerRow.append(redParticle);

        scorecard.append(headerRow);

        addScorecardRow(
          scorecard,
          'Historical',
          HISTORICAL_REJECTION_RATES[0] * 100,
          HISTORICAL_REJECTION_RATES[1] * 100
        );

        for (let year = 2015; year <= p.data.year; year++) {
          const simulatedResult = results[year];
          const p1 = Math.floor(simulatedResult[0].rejectionRate * 100);
          const p2 = Math.floor(simulatedResult[1].rejectionRate * 100);
          addScorecardRow(scorecard, String(year), p1, p2);
        }

        p.nodes.push(scorecard);
      }
      return p;
    });
  };

  const addScorecardRow = (parent: HTMLElement, label: string, p1: number, p2: number) => {
    const title = document.createElement('span');
    title.classList.add('title');
    title.innerText = label;
    parent.append(title);

    const rowDiv = document.createElement('div');
    rowDiv.classList.add('row');

    const leftScore = document.createElement('span');
    leftScore.innerText = `${p1}%`;
    leftScore.style = `color: ${BLUE.colour}`;
    leftScore.classList.add('score');
    rowDiv.append(leftScore);

    const bars = document.createElement('div');
    bars.classList.add('bar-wrapper');
    addBarChart(bars, p1, p2);
    rowDiv.append(bars);

    const rightScore = document.createElement('span');
    rightScore.innerText = `${p2}%`;
    rightScore.style = `color: ${RED.colour}`;
    rightScore.classList.add('score');
    rowDiv.append(rightScore);

    parent.append(rowDiv);
  };

  const addBarChart = (parent: HTMLElement, p1: number, p2: number) => {
    const leftBar = document.createElement('div');
    leftBar.classList.add('bar');
    leftBar.innerHTML = `<div class="bar-inner" style="background: ${BLUE.colour}; width:${100 * p1 / 50}%; margin-left: auto;"></div>`;
    parent.append(leftBar);

    const middleLine = document.createElement('div');
    middleLine.classList.add('middle-line');
    parent.append(middleLine);
    
    const rightBar = document.createElement('div');
    rightBar.classList.add('bar');
    rightBar.innerHTML = `<div class="bar-inner" style="background: ${RED.colour}; width:${100 * p2 / 50}%"></div>`;
    parent.append(rightBar);
  };

</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { subscribe } from '@abcnews/progress-utils';

  import AlgorithmViz from './AlgorithmViz.svelte';

  // Use the classes added to panels in "preprocessPanels" to keep track of the scroll percentage
  // for each of the three sankey runs
  const panelPercentages = {};
  onMount(() => {
    const subscribeToYear = (y: number) => {
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
        panelPercentages[String(y)] = progressPercentage;
      }, { indicatorSelector: `.sankey-panel.year-${y}.state-running` });
    }

    subscribeToYear(2015);
    subscribeToYear(2016);
    subscribeToYear(2017);
  });

  export let width: number;
  export let height: number;
  export let year: string;
  export let state: string | null;
</script>

<AlgorithmViz
  {width}
  {height}
  {results}
  {year}
  {state}
  progressPercentage={panelPercentages[year]}
/>

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
