<script lang="ts">
  import Chart from '../Chart.svelte';
  import Scrollyteller from 'jtfell-svelte-scrollyteller';

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
  let showNationLabels = false;
  let colours = {
    "Low Risk": false,
    "Med Risk": false,
    "High Risk": false,
  };

  let updateProgress = ((progress: any) => {
    // progressPercentage = Math.round(progress.scrollPct * 100);
    progressPercentage = Math.round(progress.rootPct * 100);
    if (progressPercentage < 0) {
      progressPercentage = 0;
    }

    // console.log(progressPercentage);
  });

  let updateState = ((state: any) => {
    // console.log(state);

    if (state.sankey === 'one') {
      showSankey = true;
      showNationLabels = false;
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
      showNationLabels = false;
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
      showNationLabels = true;
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
        "High Risk": 0,
      },
      "Non-Compliant": {
        "Low Risk": 10,
        "Med Risk": 6,
        "High Risk": 0,
      },
    },
    "Nation B": {
      // "Compliant": {
      //   "Low Risk": 5,
      //   "Med Risk": 5,
      //   "High Risk": 0,
      // },
      "Non-Compliant": {
        "Low Risk": 0,
        "Med Risk": 0,
        "High Risk": 10,
      },
    },
  };

</script>

<Scrollyteller
  panels={scrollyData.panels}
  onMarker={updateState}
  onProgress={updateProgress}
>
  <main class="graphic">
    <div bind:clientWidth={width} bind:clientHeight={height} class="wrapper">
      {#if width > 0 && height > 0 && showSankey}
        <svg width={width} height={height} viewBox="0 0 {width} {height}">
          <Chart {showNationLabels} {colours} {progressPercentage} {totalParticles} {orientation} {width} {height} {input} />
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

</style>
