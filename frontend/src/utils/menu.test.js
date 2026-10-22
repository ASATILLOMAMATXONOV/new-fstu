import { getRootMenuNodes, sortMenuNodes } from './menu';

test('navbar uses only active database roots and orders their visible descendants', () => {
  const nodes = [
    { id: 120, nodeType: 'menu', active: false, order: 0, uz: { title: 'Qabul 2026' } },
    { id: 4, nodeType: 'menu', active: false, order: 4, uz: { title: 'Fakultetlar' } },
    { id: 3, nodeType: 'menu', active: true, order: 3 },
    { id: 1, nodeType: 'menu', active: true, order: 1, children: [
      { id: 13, order: 3, active: true },
      { id: 12, order: 2, active: false, children: [{ id: 121, active: true }] },
      { id: 11, order: 1, active: true }
    ] },
    { id: 20, nodeType: 'dropdown', active: true },
    { id: 21, nodeType: 'menu', parentId: 999, active: true }
  ];
  const result = getRootMenuNodes(nodes);
  expect(result.map(node => node.id)).toEqual([1, 3]);
  expect(result[0].children.map(node => node.id)).toEqual([11, 13]);
  expect(nodes[3].children.map(node => node.id)).toEqual([13, 12, 11]);
});

test('empty database menus stay empty, and titles do not determine visibility', () => {
  expect(getRootMenuNodes([])).toEqual([]);
  const nodes = [{ id: 30, nodeType: 'menu', active: true, uz: { title: 'Fakultetlar' } }];
  expect(getRootMenuNodes(nodes).map(node => node.id)).toEqual([30]);
});

test('sort order supports database numbers and preserves the server order for ties', () => {
  const nodes = [
    { id: 3, sortOrder: 3 },
    { id: 2, order: '1' },
    { id: 1, order: 1 }
  ];
  expect(sortMenuNodes(nodes).map(node => node.id)).toEqual([2, 1, 3]);
  expect(nodes.map(node => node.id)).toEqual([3, 2, 1]);
});
