<script lang="ts">
  // import SVG, { animateMarkers, runCommand, pauseTimeline, onFinish } from '../KeyshapeSVG/KeyshapeSVG.svelte';
  import SVG from '../KeyshapeSVG/AltSVG.svelte';
  import { DARK_BG } from '../../constants';

  let svgComponent;

  export let frameMarker: string | null;
  export let scrollytellerName: string;
  export let onTransitionToDark: any;

  let onFinishAnimation: any = null;

  let backgroundOverride: string | null = null;
  let currentMarkerState: string | null = null;

  const FINAL_FRAME = {
    first: '5',
    second: '3',
    third: '6',
  };
  $: finalFrame = FINAL_FRAME[scrollytellerName];

  const SVGS = {
    first: 'Algorithms-1-FullDraft.svg',
    second: 'Algorithms_Part2.svg',
    third: 'Algorithms_Part3.svg',
  };
  $: svgPath = SVGS[scrollytellerName];

  const hasLoopFrame = (scrollytellerName: string, frameMarker: string | null) => {
    if (scrollytellerName === 'first') {
      if (frameMarker === '4' || frameMarker === '5') {
        return false;
      }
    }
    if (scrollytellerName === 'second') {
      return false;
    }
    if (scrollytellerName === 'third') {
      return false;
    }
    return true;
  };

  $: setAnimation(currentMarkerState, frameMarker);
  $: absolutePath = __webpack_public_path__ || '/';

  const setAnimation = (currentState: string | null, nextFrame: string | null) => {
    if (!nextFrame || currentState === nextFrame || !svgComponent) {
      return;
    }
    const animate = svgComponent.animate;

    // Set the current state variable for next time
    currentMarkerState = nextFrame;

    const initialFrameNoLoop = { start: nextFrame, end: String(parseInt(nextFrame) + 1), loop: false };
    const initialFrameWithLoop = { start: nextFrame, end: `${nextFrame}Loop`, loop: false };
    const loopFrame = { start: `${nextFrame}Loop`, end: String(parseInt(nextFrame) + 1), loop: true };

    if (hasLoopFrame(scrollytellerName, nextFrame)) {
      // If scrolling up, just do the loop frame
      if (parseInt(currentState || '0') > parseInt(nextFrame)) {
        return animate([loopFrame]);
      }

      // Else, do the initial animation followed by the loop frame
      return animate([
        initialFrameWithLoop,
        loopFrame
      ]);
    } 

    // If scrolling up, pause at the end state
    if (parseInt(currentState || '0') > parseInt(nextFrame)) {
      return animate([{ start: nextFrame, end: nextFrame, loop: false }]);
    }

    onFinishAnimation = (frame: string) => {
      if (scrollytellerName === 'second' && frame === '3') {
        if (onTransitionToDark) {
          onTransitionToDark();
        }

        backgroundOverride = DARK_BG;
      }
    };

    // The last frame just has a null end marker
    if (nextFrame === finalFrame) {
      return animate([{ start: nextFrame, loop: false }]);
    }

    return animate([initialFrameNoLoop]);
  }

  $: {
    // Turn off dark background when they reach the first frame
    if (scrollytellerName === 'second' && frameMarker === '1') {
      backgroundOverride = null;
    }
  }

</script>

<div class="background-cover" style="background-color: {backgroundOverride}" />

<SVG
  path={`${absolutePath}${svgPath}`}
  bind:this={svgComponent}
  onFinishAnimation={onFinishAnimation}
  onLoad={() => {
    // runCommand(iframeEl, 'globalPlay');
    // pauseTimeline(iframeEl);

    setAnimation(null, frameMarker);
  }}
/>

<style>
  .background-cover {
    height: 100vh;
    width: 100vw;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 5000;
  }
</style>
