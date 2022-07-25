import { RED, BLUE } from '../constants';
import Particle from '../components/Sankey/Particle.svelte';

//
// Highlight 'Red' and 'Blue' references in panel text
//
function textNodesUnder(node: Node) {
  const textNodes: Node[] = [];
  const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
  let textNode: Node | null;

  while ((textNode = walk.nextNode())) {
    textNodes.push(textNode);
  }

  return textNodes;
}

const COLOUR_MAPPING = {
  'Red': RED.colour,
  'Blue': BLUE.colour,
};

export const postprocessPanel = (panel) => {
  const textNodes = textNodesUnder(panel);
  textNodes.forEach(node => {
    const text = node.textContent || '';

    Object.keys(COLOUR_MAPPING).map(k => {
      if (text === k) {
        (node as any).parentNode.style.color = COLOUR_MAPPING[k];
        (node as any).parentNode.classList.add('panel-text-highlight');

        const particle = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        particle.setAttribute('height', '22');
        particle.setAttribute('width', '22');
        new Particle({
          target: particle,
          props: {
            colour: COLOUR_MAPPING[k],
            size: 6,
            x: 12,
            y: 15,
          }
        });

        (node as any).parentNode.insertBefore(particle, node);
      }
    });
  });
};
