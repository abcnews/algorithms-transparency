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
        labelScale.set(0.45);
        labelOffset.set(50);
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
  $: particleShift = width ? width * 0.07 : 10;
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
  <div
    class="row particle-header"
      style="
        transform: translateX(-{showGrades ? 20 : 0}px);
      "
  >
    <svg
      height={18}
      width={18}
      style="transform: translateX({particleShift}px);"
    >
      <Particle
        size={7}
        x={9}
        y={9}
        colour={BLUE.colour}
      />
    </svg>

    <svg
      height={18}
      width={20}
      style="
      transform: translateX(-{particleShift}px);
      "
    >
      <Particle
        size={7}
        x={9}
        y={10}
        colour={RED.colour}
      />
    </svg>
  </div>

  {#each scores as score}
    <span
      class="title"
      style="
        transform: translateX(-{showGrades ? 20 : 0}px);
      "
    >
      {score.label}
    </span>

    <div
      class="row"
      style="
        transform: translateX(-{showGrades ? 20 : 0}px);
        width: {width - 66}px;
        position: relative;
      "
    >
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
      <div class="grade" style="width: 60px;">
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

    padding: 1.5rem;
    background: #110817;
    color: white;
    transition: width 500ms cubic-bezier(0.22, 0.61, 0.36, 1);

    :global(h6) {
      font-size: 0.9rem;
      margin: auto;
      margin-bottom: 0.5rem;
    }

    .title-header {
      height: 20px;
    }

    .particle-header {
      height: 15px;
      transition: transform 500ms cubic-bezier(0.22, 0.61, 0.36, 1)
    }

    .title {
      font-size: 0.8rem;
      font-weight: 600;
      width: 100px;
      text-align: center;
    }

    .title,
    .row {
      transition: transform 500ms cubic-bezier(0.22, 0.61, 0.36, 1);
    }

    .grade {
      font-size: 0.9rem;
      text-align: center;
      height: 1rem;
      margin-top: -5px;

      position: absolute;
      right: -55px;

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
      line-height: 1rem;

      /* Animate adding the grades */
      & > * {
        transition: width 500ms cubic-bezier(0.22, 0.61, 0.36, 1);
      }

      .score {
        font-size: 0.9rem;
        width: 40px;
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
