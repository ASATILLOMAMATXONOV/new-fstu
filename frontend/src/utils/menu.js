import { getCurrentLanguageCode } from './language';

export function sortMenuNodes(list = []) {
  return [...list].sort((left, right) => Number(left.order || 0) - Number(right.order || 0));
}

export function buildMenuTree(items = []) {
  const nodeMap = new Map();

  items.forEach((item) => {
    nodeMap.set(String(item.id), {
      ...item,
      parentId: item.parentId || null,
      children: []
    });
  });

  const roots = [];

  nodeMap.forEach((node) => {
    if (node.parentId && nodeMap.has(String(node.parentId))) {
      nodeMap.get(String(node.parentId)).children.push(node);
      return;
    }

    roots.push(node);
  });

  const sortNested = (nodes) =>
    sortMenuNodes(nodes).map((node) => ({
      ...node,
      children: sortNested(node.children || [])
    }));

  return sortNested(roots);
}

export function getRootMenuNodes(nodes = []) {
  return nodes.filter((node) => node.nodeType === 'menu');
}

export function getMenuNodeTitle(node, languageCode = getCurrentLanguageCode()) {
  return (
    node?.[languageCode]?.title ||
    node?.uz?.title ||
    node?.ru?.title ||
    node?.en?.title ||
    ''
  );
}

export function getMenuNodeHref(node) {
  const url = String(node?.url || '').trim();

  if (url) {
    return url;
  }

  if (node?.id === undefined || node?.id === null || node?.id === '') {
    return '/';
  }

  return `/menu/${node.id}`;
}

export function hasMenuNodeHref(node) {
  return Boolean(getMenuNodeHref(node));
}

export function flattenMenuNodes(nodes = []) {
  return sortMenuNodes(nodes).flatMap((node) => [node, ...flattenMenuNodes(node.children || [])]);
}

export function findMenuPathById(nodes = [], id, parents = []) {
  for (const node of sortMenuNodes(nodes)) {
    const nextParents = [...parents, node];

    if (String(node.id) === String(id)) {
      return nextParents;
    }

    const childPath = findMenuPathById(node.children || [], id, nextParents);

    if (childPath.length) {
      return childPath;
    }
  }

  return [];
}
