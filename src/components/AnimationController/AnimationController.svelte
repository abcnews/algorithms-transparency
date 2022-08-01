<script lang="ts">
  import SVG from '../../lib/components/KeyshapeSVG/KeyshapeSVG.svelte';

  let svgComponent: any;

  export let frameMarker: string | null;
  export let scrollytellerName: string;
  export let onTransitionToDark: any = (frame: string) => frame;

  let currentMarkerState: string | null = null;
  let timeline: any;
  let timeoutRef: any;

  const FINAL_FRAME = {
    first: '6',
    second: '3',
    third: '6',
    fourth: '3',
  };
  $: finalFrame = FINAL_FRAME[scrollytellerName];

  const SVGS = {
    first: 'Algorithms_Part1.svg',
    second: 'Algorithms_Part2.svg',
    third: 'Algorithms_Part3.svg',
    fourth: 'Algorithms_Part4.svg',
  };
  $: svgPath = SVGS[scrollytellerName];

  const hasLoopFrame = (scrollytellerName: string, frameMarker: string | null) => {
    if (scrollytellerName === 'first') {
      if (frameMarker === '6') {
        return true;
      }
    }
    return false;
  };

  $: setAnimation(currentMarkerState, frameMarker);
  $: absolutePath = __webpack_public_path__ || '/';

  const setAnimation = (currentState: string | null, nextFrame: string | null) => {
    if (!nextFrame || currentState === nextFrame || !svgComponent) {
      return;
    }
    clearTimeout(timeoutRef);
    const animate = svgComponent.animate;

    // If we're scrolling down, don't let the animation get > 2 frames behind the text
    let skipTo: null | string = null;
    if (timeline &&
      (parseInt(nextFrame || '') > parseInt(currentMarkerState || '')) &&
      (timeline.time() < timeline.marker(currentMarkerState)?.time)
    ) {
      skipTo = currentMarkerState;
    }

    // Set the current state variable for next time
    currentMarkerState = nextFrame;

    const initialFrameNoLoop = { start: nextFrame, end: String(parseInt(nextFrame) + 1), loop: false, skipTo };
    const initialFrameWithLoop = { start: nextFrame, end: `${nextFrame}Loop`, loop: false, skipTo };
    const loopFrame = { start: `${nextFrame}Loop`, end: String(parseInt(nextFrame) + 1), loop: true, skipTo };

    if (hasLoopFrame(scrollytellerName, nextFrame)) {
      // If scrolling up, just do the loop frame
      if (parseInt(currentState || '0') > parseInt(nextFrame)) {
        return animate([loopFrame]);
      }

      if (nextFrame === finalFrame) {
        return animate([
          initialFrameWithLoop,
          { ...loopFrame, end: null }
        ]);
      }

      // Else, do the initial animation followed by the loop frame
      return animate([
        initialFrameWithLoop,
        loopFrame
      ]);
    } 

    // trigger crossfade callback
    if (scrollytellerName === 'second' && nextFrame === '2') {
      timeoutRef = setTimeout(onTransitionToDark, 2750);
    }

    // If scrolling up, pause at the end state
    if (parseInt(currentState || '0') > parseInt(nextFrame)) {
      return animate([{ start: nextFrame, end: nextFrame, loop: false }]);
    }

    // The last frame just has a null end marker
    if (nextFrame === finalFrame) {
      return animate([{ start: nextFrame, loop: false }]);
    }

    return animate([initialFrameNoLoop]);
  }
</script>

<SVG
  path={`${absolutePath}${svgPath}`}
  bind:this={svgComponent}
  bind:timeline={timeline}
  onLoad={() => {
    setAnimation(null, frameMarker);
    return null;
  }}
/>

