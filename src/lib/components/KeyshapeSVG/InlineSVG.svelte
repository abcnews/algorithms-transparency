<script lang="ts">
  //
  // Adapted from https://github.com/robinscholz/svelte-inline-svg
  //

  import { onMount, createEventDispatcher, tick } from 'svelte'
  import { tweened } from 'svelte/motion';
	import { cubicIn } from 'svelte/easing';
  import { get_current_component } from 'svelte/internal';
  import { forwardEventsBuilder } from './forwardEvents';

  const dispatch = createEventDispatcher()
  const forwardEvents = forwardEventsBuilder(get_current_component());

  export let src: string;
  export let spinnerColour: string | undefined;
  export let transformSrc = (svg) => svg
  let opacity = tweened(0, {
    duration: 750,
    easing: cubicIn,
  });

  onMount(() => {
    inline(src)
  })

  let cache = {};
  let isLoaded = false;
  let svgAttrs = {};
  let svgContent: string;

  function download(url: string) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest()
      request.open('GET', url, true)

      request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
          try {
            // Setup a parser to convert the response to text/xml in order for it to be manipulated and changed
            const parser = new DOMParser()
            const result = parser.parseFromString(
              request.responseText,
              'text/xml'
            )
            let svgEl = result.querySelector('svg')
            if (svgEl) {
              // Apply transformation
              svgEl = transformSrc(svgEl)
              resolve(svgEl)
            } else {
              reject(new Error('Loaded file is not valid SVG"'))
            }
          } catch (error) {
            reject(error)
          }
        } else {
          reject(new Error('Error loading SVG'))
        }
      }

      request.onerror = reject
      request.send()
    })
  }

  function inline(src: string) {
    // fill cache by src with promise
    if (!cache[src]) {
      // notify svg is unloaded
      if (isLoaded) {
        isLoaded = false
        dispatch('unloaded')
      }
      // download
      cache[src] = download(src)
    }

    // inline svg when cached promise resolves
    cache[src]
      .then(async (svg: SVGElement) => {
        // copy attrs
        const attrs = svg.attributes
        for (let i = attrs.length - 1; i >= 0; i--) {
          svgAttrs[attrs[i].name] = attrs[i].value
        }
        // copy inner html
        svgContent = svg.innerHTML
        // render svg element
        await tick()
        opacity.set(1);
        isLoaded = true
        dispatch('loaded')
      })
      .catch((error: Error) => {
        // remove cached rejected promise so next image can try load again
        delete cache[src]
        console.error(error)
      })
  }
</script>

<svg
  use:forwardEvents
  xmlns="http://www.w3.org/2000/svg"
  class="keyshape-svg {spinnerColour ? 'spinner' : ''}"
  bind:innerHTML={svgContent}
  data-loaded={isLoaded ? 'true' : 'false'}
  {...svgAttrs}
  {...$$restProps}
  contenteditable
  style="
    --spinner-colour: {spinnerColour};
    opacity: {$opacity};
  "

/>

<style>
  svg[data-loaded="false"].spinner {
    --size: 60px;
    --duration: 0.75s;

    height: var(--size);
    width: var(--size);
    border-color: var(--spinner-colour) transparent var(--spinner-colour) var(--spinner-colour);
    border-width: calc(var(--size) / 15);
    border-style: solid;
    border-image: initial;
    border-radius: 50%;
    animation: var(--duration) linear 0s infinite normal none running rotate;
  }

  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
