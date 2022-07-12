<script lang="ts">
  export let width: number;
  export let label: string;
  export let result: any;
</script>

<text class="label white smaller" x={width * 0.5} y={0} text-anchor="middle">
  {label}
</text>
<text class="label smaller" fill={result[0].nation.colour} x={10} y={0} text-anchor="start">
  {Math.floor(result[0].rejectionRate * 100)}%
</text>
<text class="label smaller" fill={result[1].nation.colour} x={width - 10} y={0} text-anchor="end">
  {Math.floor(result[1].rejectionRate * 100)}%
</text>

<style>
  .label {
    font-family: ABCSans, Helvetica, sans-serif;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 12px;
  }
  .white {
    fill: white;
  }

  .label.smaller {
    font-size: 12px;
    text-transform: none;
  }
</style>
