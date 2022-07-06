declare module '*.svelte' {
    export { SvelteComponentDev as default } from 'svelte/internal';
    export const runCommand: any;
    export const animateMarkers: any;
    export const manipulateDom: any;
    export const pauseTimeline: any;
}
