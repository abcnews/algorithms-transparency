<script lang="ts">
  import Particle from '../Sankey/Particle.svelte';
  import { RED, BLUE } from '../../constants';

  interface Score {
    label: string;
    p1: number;
    p2: number;
  }

  export let scores: Score[];
  export let state: string;
  // export let height: number;
  export let width: number;

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
</script>

<div
  class="sankey-scorecard"
  style="
    width: {width}px;
  "
>
  <div class="row">
    <svg
      height={22}
      width={22}
      style="transform: translateX(15%);"
    >
      <Particle
        size={8}
        x={11}
        y={11}
        colour={BLUE.colour}
      />
    </svg>

    <h6>VISA REFUSALS</h6>

    <svg
      height={22}
      width={24}
      style="transform: translateX(-15%);"
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
    <span class="title">{score.label}</span>
      {#if state === 'running'}
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
        </div>
      {:else}
        <div>
          <span class="title {Math.abs(score.p2 - score.p1) < 10 ? 'a' : 'd'}">
            {grade(score)}
          </span>
        </div>
      {/if}
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
    background: black;
    color: white;

    :global(h6) {
      font-size: 1rem;
      margin: auto;
      margin-bottom: 0.5rem;
    }

    .title {
      font-size: 0.9rem;
      width: 100px;
      text-align: center;
      transform: translateY(2px);

      &.a {
        color: green;
        font-weight: 700;
      }
      &.d {
        color: red;
        font-weight: 700;
      }
    }

    .row {
      display: flex;
      justify-content: space-between;
      width: 100%;

      font-weight: 900;

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
          height: 17px;
          transform: translateY(-2px);
        }

        .bar {
          width: 100%;
          height: 13px;
        }
        .bar-inner {
          height: 13px;
        }
      }

    }
  }

</style>
