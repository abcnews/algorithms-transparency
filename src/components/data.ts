import { hierarchy, sum, range, path } from 'd3';
import { sankeyTop, sankeyAlignJustify, sankeyRight } from 'jtfell-d3-sankey';

const isLeaf = n => n.hasOwnProperty('approved');
const isObject = obj => typeof obj === 'object' && !Array.isArray(obj) && obj !== null;

// Extract unique nodes
export const genNodes = rawData => {
  const nodes = ['root'];
  const walk = node => {
    for (let name in node) {
      nodes.push(name);
      if (!isLeaf(node[name])) {
        walk(node[name]);
      }
    }
  };
  walk(rawData);
  return [...new Set(nodes)].map(name => ({ name }));
};

// Extract all links between the nodes
export const genLinks = rawData => {
  const links: any[] = [];
  const walk = (source, sourceNode) => {
    for (let name in sourceNode) {
      links.push({ source, target: name });
      if (!isLeaf(sourceNode[name])) {
        walk(name, sourceNode[name]);
      }
    }
  };
  walk('root', rawData);
  return links;
};

// Convert the raw data from nested object format into `d3-hierarchy` compatible format,
// so we can use the power of `d3` to traverse nodes and paths to calculate distribution of particles
export const genHierarchy = rawData => {
  // converts an object { bitA, bitB, ... } into array [{ name: 'bitA', ... }, { name: 'bitB', ... }, ...]
  // `d3.hierarchy` will use this array to build its data structure
  const getChildren = ({ name, ...otherProps }) =>
    isLeaf(otherProps)
      ? undefined // leaves have no children
      : Object.entries(otherProps).map(([name, obj]) => ({ name, ...obj }));

  const absolutePath = d => `${d.parent ? absolutePath(d.parent) : ''}/${d.data.name}`;

  return (
    hierarchy({ name: 'root', ...rawData }, getChildren)
      .each(d => {
        const datum: any = {
          name: d.data.name,
          // `path` is needed to distinguish nodes with the same name but different ancestors
          // (e.g. /root/bit501/bit601 vs /root/bit502/bit601)
          path: absolutePath(d),
        }
        if (isLeaf(d.data)) {
          datum.groups = [{
            key: 'approved', value: d.data.approved
          }, {
            key: 'rejected', value: d.data.rejected
          }]
        }
        d.data = datum
      })
    );
};

// Consider different groups of the same route as different targets
// Such data structure format simplifies particle creation and tracking
export const genTargetsAbs = (hierarchy) => {
  return hierarchy.leaves().flatMap(t => (t.data?.groups || []).map(l => ({
    name: t.data.name,
    path: t.data.path,
    group: l.key,
    value: l.value,
  })));
};

export const genTargets = targetsAbsolute => {
  // normalize values
  const total = sum(targetsAbsolute, d => d.value);
  return targetsAbsolute.map(t => ({ ...t, value: t.value / total }));
};

// Distribution of all possible types of particles (each route and each color)
export const genThresholds = targets => range(targets.length).map(i => sum(targets.slice(0, i + 1).map(r => r.value)));

export const genRoutes = sankey => {
  // Walk recursevly across all the nodes and build all possible
  // routes from the root node to each leaf node
  const walk = n => {
    const subroutes = n.sourceLinks.flatMap(d => walk(d.target));
    return subroutes.length ? subroutes.map(r => [n, ...r]) : [[n]];
  };
  const root = sankey.nodes.find(d => d.targetLinks.length === 0);
  return walk(root);
};

// Unique nodes that have no children, used for rendering counters
export const genLeaves = (sankey, targetsAbsolute) => {
  return sankey.nodes
    .filter(n => n.sourceLinks.length === 0)
    .map(n => ({
      node: n,
      targets: targetsAbsolute.filter(t => t.name === n.name)
    }));
};

// Gets a list of the nodes from the root to a leaf and returns a path thru these nodes
export const sankeyLinkCustom = (bandHeight, nodes) => {
  const p = path();
  const h = bandHeight // 2;
  nodes.forEach((n, i) => {
    if (i === 0) {
      p.moveTo(n.x0, n.y0 + h);
    }
    p.lineTo(n.x1, n.y0 + h);
    const nn = nodes[i + 1];
    if (nn) {
      const w = nn.x0 - n.x1;
      p.bezierCurveTo(n.x1 + w / 2, n.y0 + h, n.x1 + w / 2, nn.y0 + h, nn.x0, nn.y0 + h);
    }
  });
  return p.toString();
};
