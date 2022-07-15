  import { RED, BLUE } from '../constants';

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

    // TODO: Check for boldness when data coming from CM?
    Object.keys(COLOUR_MAPPING).map(k => {
      if (text === k) {
        (node as any).parentNode.style.backgroundColor = `${COLOUR_MAPPING[k]} !important`;
        (node as any).parentNode.classList.add('panel-text-highlight');
      }
    });
  });

    // const EMPHASISED_ELEMENTS_SELECTOR = 'strong,em,b,i';
    // const elements = nodes.filter(node => node.nodeType === Node.ELEMENT_NODE) as Element[];
    // const emphasisedElements = elements.reduce(
    //   (memo, element) => memo.concat(Array.from(element.querySelectorAll(EMPHASISED_ELEMENTS_SELECTOR))),
    //   [] as Element[]
    // );
};

