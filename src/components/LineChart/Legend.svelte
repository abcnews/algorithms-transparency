<script lang="ts">
  import { LINE_CHART_COLOURS } from '../../constants';
</script>

<div class="scatter-key">
  <!-- <svg viewBox="0 0 20 20"> -->
  <!--   <circle stroke={LINE_CHART_COLOURS.Syria} fill={LINE_CHART_COLOURS.Syria} cx="10" cy="10" r="8"/> -->
  <!-- </svg> -->
  <!-- <span style={`color:${LINE_CHART_COLOURS.Syria}`}>Syria</span> -->

  <svg viewBox="0 0 20 20">
    <circle stroke={LINE_CHART_COLOURS.Australia} fill={LINE_CHART_COLOURS.Australia} cx="10" cy="10" r="8"/>
  </svg>
  <span style={`color:${LINE_CHART_COLOURS.Australia}`}>Australia</span>

  <svg viewBox="0 0 20 20">
    <circle stroke={LINE_CHART_COLOURS.Nepal} fill={LINE_CHART_COLOURS.Nepal} cx="10" cy="10" r="8"/>
  </svg>
  <span style={`color:${LINE_CHART_COLOURS.Nepal}`}>Nepal</span>

  <svg viewBox="0 0 20 20">
    <circle stroke={LINE_CHART_COLOURS['United States']} fill={LINE_CHART_COLOURS['United States']} cx="10" cy="10" r="8"/>
  </svg>
  <span style={`color:${LINE_CHART_COLOURS['United States']}`}>United States</span>
</div>

<style>
  .scatter-key > svg {
    width: 0.75em;
    height: 0.75em;
  }
  .scatter-key > svg > circle {
    stroke-width: 2px;
    fill-opacity: 0.6;
  }
  .scatter-key > span {
    padding-right: 0.5em;
  }

  .scatter-key {
    font-family: ABCSans, Helvetica, sans-serif;
    font-size: 12px;
    font-weight: 700;
    line-height: 13px;
    letter-spacing: 0em;
    text-align: left;

    margin: 0.5rem;
  }
</style>
