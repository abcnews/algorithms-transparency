import { RED, BLUE } from '../constants';

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
        (node as any).parentNode.style.backgroundColor = COLOUR_MAPPING[k];
        (node as any).parentNode.classList.add('panel-text-highlight');
      }
    });
  });
};
