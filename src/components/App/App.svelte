<script lang="ts">
  import Chart from '../Chart.svelte';
  import Scrollyteller from 'jtfell-svelte-scrollyteller';

  export let scrollyData: any;
  const orientation = 'horizontal';

  const MOBILE_BREAKPOINT = 480;
  let width: number;
  let height: number;
  // $: height = width;
  // Responsively sized dimensions (1.5:1 on mobile, 1.5:1 on desktop)
  // $: height = width > MOBILE_BREAKPOINT ? 1.2 * width : 1.5 * width;
  $: {
    if (width < MOBILE_BREAKPOINT && height) {
      height = width * 1.2;
    }
    if (width < MOBILE_BREAKPOINT && orientation === 'horizontal') {
      height = width * 1;
    }
  }


  let progressPercentage = 0;
  let totalParticles = 10;
  let showSankey = false;
  let colours = {
    riskl: false,
    riskm: false,
    riskh: false,
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
      colours = {
        riskl: false,
        riskm: false,
        riskh: false,
      };
      totalParticles = 50;
      return;
    }
    if (state.sankey === 'two') {
      showSankey = true;
      colours = {
        riskl: true,
        riskm: true,
        riskh: true,
      };
      totalParticles = 50;
      return;
    }
    if (state.sankey === 'three') {
      showSankey = true;
      colours = {
        riskl: false,
        riskm: false,
        riskh: true,
      };
      totalParticles = 50;
      return;
    }
    showSankey = false;
  });

  const input = {
    nationB: {
      complianceN: {
        riskl: 10,
        riskm: 8,
        riskh: 0,
      },
      complianceY: {
        riskl: 18,
        riskm: 2,
        riskh: 0,
      },
    },
    nationA: {
      complianceN: {
        riskl: 3,
        riskm: 5,
        riskh: 2,
      },
      complianceY: {
        riskl: 3,
        riskm: 5,
        riskh: 10,
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
          <Chart {colours} {progressPercentage} {totalParticles} {orientation} {width} {height} {input} />
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
