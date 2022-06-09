<script lang="ts">
  import Chart from '../Chart.svelte';
  import Worm from '../Worm/Worm.svelte';
</script>

<div>
  <Worm />

  <Chart width={800}/>
</div>

<style lang="scss">
  div {
    background: #f4f4f4;
  }
</style>
