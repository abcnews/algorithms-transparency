<script lang="ts">
</script>

<svg width={300} version="1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 542 542">
  <filter id="white-glow">
    <feFlood result="flood" flood-color="#e688f6" flood-opacity="1"></feFlood>
    <feComposite in="flood" result="mask" in2="SourceGraphic" operator="in"></feComposite>
    <feMorphology in="mask" result="dilated" operator="dilate" radius="3"></feMorphology>
    <feGaussianBlur in="dilated" result="blurred" stdDeviation="4"></feGaussianBlur>
    <feMerge>
        <feMergeNode in="blurred"></feMergeNode>
        <feMergeNode in="SourceGraphic"></feMergeNode>
    </feMerge>
  </filter>

  <filter id="white-glow2">
    <feFlood result="flood" flood-color="#e688f6" flood-opacity="1"></feFlood>
    <feComposite in="flood" result="mask" in2="SourceGraphic" operator="in"></feComposite>
    <feMorphology in="mask" result="dilated" operator="dilate" radius="2"></feMorphology>
    <feGaussianBlur in="dilated" result="blurred" stdDeviation="6"></feGaussianBlur>
    <feMerge>
        <feMergeNode in="blurred"></feMergeNode>
        <feMergeNode in="SourceGraphic"></feMergeNode>
    </feMerge>
</filter>

  <g transform="translate(15, 15)">
    <polygon filter="url(#white-glow)" style="fill: #2b2b2b;" points="480,112 256,0 32,112 32,400 256,512 480,400 "/>
    <polygon filter="url(#white-glow)" style="fill: #191a1a;" points="256,224 32,112 32,400 256,512 480,400 480,112 "/>
    <polygon filter="url(#white-glow2)" style="fill: #000000;" points="256,224 256,512 480,400 480,112 "/>

    <text
      class="box-label"
      x="75"
      y="200"
      stroke="#e688f6"
      fill="#e688f6"
    >
      HOME AFFAIRS
    </text>
  </g>
  </svg>


<style lang="scss">
  .box-label {
    font-size: 20px;
    font-family: helvetica;
    transform: skewY(26.6deg);
  }
</style>
