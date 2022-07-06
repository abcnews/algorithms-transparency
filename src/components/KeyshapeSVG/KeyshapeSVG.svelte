<script context="module" lang="ts">
  // Methods that are interpreted inside the iframe. See `svg-iframe-controller.ts`.
  export function runCommand(iframe: HTMLIFrameElement, method: string, args = []) {
    if (!iframe?.contentWindow) {
      return;
    }
    iframe.contentWindow.postMessage({ type: 'command', method, args }, '*');
  }

  export function animateMarkers(iframe: HTMLIFrameElement, frames: any[]) {
    if (!iframe?.contentWindow) {
      return;
    }
    iframe.contentWindow.postMessage({ type: 'marker', frames }, '*');
  }

  export function pauseTimeline(iframe: HTMLIFrameElement) {
    if (!iframe?.contentWindow) {
      return;
    }
    iframe.contentWindow.postMessage({ type: 'tl-pause' }, '*');
  }

  export function manipulateDom(iframe: HTMLIFrameElement, id: string, attrs = {}) {
    if (!iframe?.contentWindow) {
      return;
    }
    iframe.contentWindow.postMessage({ type: 'DOM', id, ...attrs }, '*');
  }
</script>

<script lang="ts">
  const IS_SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Allow parent to bind to this element
  export let iframeEl: HTMLIFrameElement;
  // Path of SVG asset
  export let path: string;
  // Callback for parent
  export let onLoad: any;


  // let isIFrameReady: boolean = false;
  const onIframeLoad = () => {
    // isIFrameReady = true;
    if (onLoad) {
      onLoad(iframeEl);
    }
  };

  // detect and handle iOS devices and serve alternate svg
  $: finalPath = `${path.replace('.svg', '')}${IS_SAFARI || IS_IOS ? '__safari' : ''}.svg`;
</script>

<iframe
  bind:this={iframeEl}
  title="Graphic"
  frameBorder="0"
  scrolling="no"
  src={`${finalPath}?global=paused`}
  on:load={onIframeLoad}
/>
