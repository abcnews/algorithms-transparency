<script lang="ts">
	import { cubicOut } from 'svelte/easing';
  import { tweened } from 'svelte/motion';
  import Particle from '../Sankey/Particle.svelte';
  import { RED, BLUE } from '../../constants';

  interface Score {
    label: string;
    p1: number;
    p2: number;
  }

  export let scores: Score[];
  export let state: string | null;
  // export let height: number;
  export let width: number;
  export let isOutsideBox = false;

  const grade = (score: Score) => {
    const diff = Math.abs(score.p2 - score.p1) 
    if (diff < 3) {
      return 'A+';
    }
    if (diff < 10) {
      return 'A';
    }
    return 'D';
  };

  const labelScale = tweened(1, {
		duration: 1200,
		easing: cubicOut
	});
  const labelOffset = tweened(0, {
		duration: 1200,
		easing: cubicOut
	});
  const xRotation = tweened(0, {
		duration: 1200,
		easing: cubicOut
	});

  let timeoutRef: any;
  $: {
    if (isOutsideBox) {
      timeoutRef = setTimeout(() => {
        labelScale.set(0.38);
        labelOffset.set(60);
        xRotation.set(4);
      }, 2500);
    } else {
      clearTimeout(timeoutRef);
      labelScale.set(1);
      labelOffset.set(0);
      xRotation.set(0);
    }
  }

  $: showGrades = state !== 'running';
</script>

<div
  class="sankey-scorecard"
  style="
    width: {width}px;
    transform:
      scale({$labelScale})
      rotateX(-{$xRotation}deg)
      translateY(-{$labelOffset}px);
  "
>
  <div class="row title-header">
    <h6>VISA REFUSALS</h6>
  </div>
  <div class="row particle-header">
    <svg
      height={22}
      width={22}
      style="transform: translateX(21%);"
    >
      <Particle
        size={8}
        x={11}
        y={11}
        colour={BLUE.colour}
      />
    </svg>

    <svg
      height={22}
      width={24}
      style="
        transform: translateX(calc(-31% - {showGrades ? 40 : 0}px));
        transition: transform 500ms cubic-bezier(0.22, 0.61, 0.36, 1)
      "
    >
      <Particle
        size={8}
        x={10}
        y={11}
        colour={RED.colour}
      />
    </svg>
  </div>

  {#each scores as score}
    <span
      class="title"
      style="transform: translateX(-{showGrades ? 20 : 0}px);"
    >
      {score.label}
    </span>
    <div class="row">
      <span
        class="score"
        style="
          color: {BLUE.colour} !important;
          transform: translateX(15%);
        "
      >
        {score.p1}%
      </span>
      <div class="bar-wrapper">
        <div class="bar">
          <div
            class="bar-inner"
            style="background: {BLUE.colour}; width: {100 * score.p1 / 50}%; margin-left: auto;"
          />
        </div>
        <div class="middle-line" />

        <div class="bar">
          <div
            class="bar-inner"
            style="background: {RED.colour}; width: {100 * score.p2 / 50}%"
          />
        </div>
      </div>
      <span
        class="score"
        style="
          color: {RED.colour} !important;
          transform: translateX(-15%);
        "
      >
        {score.p2}%
      </span>
        <div class="grade" style="width: {showGrades ? 60 : 0.00001}px;">
          <div style="opacity: {showGrades ? 1 : 0}">
            {grade(score)}
          </div>
        </div>
    </div>
  {/each}
</div>

<style lang="scss">
  .sankey-scorecard {
    font-family: ABCSans, Helvetica, sans-serif;

    /* position: fixed; */
    display: flex;
    flex-direction: column;
    align-items: center;

    padding: 1rem;
    background: #110817;
    color: white;

    :global(h6) {
      font-size: 0.9rem;
      margin: auto;
      margin-bottom: 0.5rem;
    }

    .title-header {
      height: 10px;
    }

    .particle-header {
      height: 15px;
    }

    .title {
      font-size: 0.8rem;
      font-weight: 600;
      width: 100px;
      text-align: center;
      /* transform: translateY(2px); */
      transition: transform 500ms cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    .grade {
      font-size: 0.9rem;
      text-align: center;
      height: 1rem;
      padding-left: 2px;
      margin-top: -5px;

      div {
        width: inherit;
        border-radius: 50%;
        background: white;
        color: black;
        margin: auto;
        width: 25px;
        line-height: 25px;
      }
    }

    .row {
      display: flex;
      justify-content: space-between;
      width: 100%;

      /* font-weight: 900; */
      line-height: 1rem;

      /* Animate adding the grades */
      & > * {
        transition: width 500ms cubic-bezier(0.22, 0.61, 0.36, 1);
      }

      .score {
        font-size: 0.9rem;
        width: 30px;
      }

      .bar-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
        transform: translateY(5px);

        .middle-line {
          width: 2px;
          background: white;
          height: 10px;
          transform: translateY(-2px);
        }

        .bar {
          width: 100%;
          height: 6px;
        }
        .bar-inner {
          height: 6px;
          transition: width 400ms ease-out;
        }
      }

    }
  }

</style>
