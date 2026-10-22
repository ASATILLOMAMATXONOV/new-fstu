import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

globalThis.FileReader = class FileReader {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then((value) => { this.result = value; this.onloadend?.(); }); }
  readAsDataURL(blob) { blob.arrayBuffer().then((value) => { this.result = `data:${blob.type};base64,${Buffer.from(value).toString('base64')}`; this.onloadend?.(); }); }
};

const white = new THREE.MeshPhysicalMaterial({ name: 'Porcelain', color: 0xf1f2f8, roughness: .28, metalness: .03, clearcoat: .65 });
const grey = new THREE.MeshStandardMaterial({ name: 'SoftSilver', color: 0xb8bdcb, roughness: .48, metalness: .08 });
const screen = new THREE.MeshPhysicalMaterial({ name: 'MidnightGlass', color: 0x071f2b, roughness: .26, metalness: .08, clearcoat: .6 });
const cyan = new THREE.MeshStandardMaterial({ name: 'FaceLED', color: 0x43e5ee, emissive: 0x24c8d9, emissiveIntensity: .8, toneMapped: false });
const highlight = new THREE.MeshBasicMaterial({ name: 'ShellReflection', color: 0xffffff });
const scene = new THREE.Scene();
scene.name = 'FSTU_Friendly_Assistant';
const robot = new THREE.Group();
robot.name = 'RobotRoot';
scene.add(robot);

function mesh(parent, name, geometry, material, position = [0, 0, 0], scale = [1, 1, 1]) {
  const item = new THREE.Mesh(geometry, material);
  item.name = name;
  item.position.set(...position);
  item.scale.set(...scale);
  item.castShadow = true;
  item.receiveShadow = true;
  parent.add(item);
  return item;
}
function oval(parent, name, material, position, scale) {
  return mesh(parent, name, new THREE.SphereGeometry(1, 32, 24), material, position, scale);
}
function group(parent, name, position) {
  const item = new THREE.Group();
  item.name = name;
  item.position.set(...position);
  parent.add(item);
  return item;
}
function roundedShape(width, height, radius) {
  const shape = new THREE.Shape();
  const x = -width / 2, y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);
  return shape;
}
function roundedBox(parent, name, width, height, depth, radius, material, position, bevel = .08) {
  const geometry = new THREE.ExtrudeGeometry(roundedShape(width, height, radius), { depth, bevelEnabled: true, bevelSegments: 4, steps: 1, bevelSize: bevel, bevelThickness: bevel, curveSegments: 20 });
  geometry.translate(0, 0, -depth / 2);
  return mesh(parent, name, geometry, material, position);
}

const torso = group(robot, 'Torso', [0, -.66, 0]);
oval(torso, 'WhiteBody', white, [0, 0, 0], [.79, 1.02, .51]);
mesh(torso, 'LowerShell', new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, Math.PI * .53, Math.PI * .47), grey, [0, 0, 0], [.795, 1.025, .515]);
const seam = [];
for (let index = 0; index <= 24; index++) {
  const x = -.72 + index * .06;
  const y = -.28 + .15 * (x / .72) ** 2;
  const z = .51 * Math.sqrt(Math.max(0, 1 - (x / .79) ** 2 - (y / 1.02) ** 2)) + .012;
  seam.push(new THREE.Vector3(x, y, z));
}
mesh(torso, 'BodySeam', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seam), 28, .012, 6, false), grey);
oval(torso, 'BodyHighlight', highlight, [-.43, .48, .385], [.11, .27, .015]).rotation.z = -.55;
oval(robot, 'Neck', grey, [0, .37, 0], [.32, .3, .27]);

const head = group(robot, 'Head', [0, 1.19, 0]);
roundedBox(head, 'WhiteHeadFrame', 2.06, 1.43, .56, .43, white, [0, 0, 0], .11);
roundedBox(head, 'DarkFaceScreen', 1.86, 1.12, .1, .35, screen, [0, -.015, .365], .045);
roundedBox(head, 'LeftEarpiece', .2, .62, .4, .09, grey, [-1.19, -.02, -.02], .06);
roundedBox(head, 'RightEarpiece', .2, .62, .4, .09, grey, [1.19, -.02, -.02], .06);
oval(head, 'TopButton', grey, [0, .86, -.08], [.35, .10, .22]);
oval(head, 'HeadHighlight', highlight, [-.65, .60, .37], [.28, .06, .012]).rotation.z = .35;

const eyeShape = new THREE.Shape();
eyeShape.moveTo(-.145, -.04);
eyeShape.bezierCurveTo(-.16, .21, .16, .21, .145, -.04);
eyeShape.quadraticCurveTo(.12, -.075, 0, -.055);
eyeShape.quadraticCurveTo(-.12, -.075, -.145, -.04);
for (const side of [-1, 1]) {
  mesh(head, `Eye_${side < 0 ? 'L' : 'R'}`, new THREE.ExtrudeGeometry(eyeShape, { depth: .014, bevelEnabled: false, curveSegments: 24 }), cyan, [side * .45, .07, .48]);
}
const mouthShape = new THREE.Shape();
mouthShape.moveTo(-.13, 0);
mouthShape.lineTo(.13, 0);
mouthShape.bezierCurveTo(.13, -.19, -.13, -.19, -.13, 0);
const jaw = group(head, 'Jaw', [0, -.24, .48]);
mesh(jaw, 'HappyMouth', new THREE.ExtrudeGeometry(mouthShape, { depth: .015, bevelEnabled: false, curveSegments: 24 }), cyan);

for (const side of [-1, 1]) {
  const arm = group(robot, `Shoulder_${side < 0 ? 'L' : 'R'}`, [side * .78, -.13, 0]);
  arm.rotation.z = side * .30;
  oval(arm, `Flipper_${side}`, white, [side * .10, -.53, .01], [.24, .72, .28]);
}

function rotations(values) {
  return values.flatMap(([x, y, z]) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z)).toArray());
}
const qt = (name, times, values) => new THREE.QuaternionKeyframeTrack(`${name}.quaternion`, times, rotations(values));
const pt = (name, times, values) => new THREE.VectorKeyframeTrack(`${name}.position`, times, values.flat());
const vt = (name, times, values) => new THREE.VectorKeyframeTrack(`${name}.scale`, times, values.flat());
const float = (duration, lift = .09) => pt('RobotRoot', [0, duration / 2, duration], [[0, 0, 0], [0, lift, 0], [0, 0, 0]]);
const animations = [
  new THREE.AnimationClip('idle', 3.2, [float(3.2), qt('Head', [0, 1.6, 3.2], [[0, -.035, -.025], [.015, .035, .025], [0, -.035, -.025]])]),
  new THREE.AnimationClip('walking', 1.2, [float(1.2, .16), qt('Shoulder_L', [0, .6, 1.2], [[0, 0, -.15], [.2, 0, -.5], [0, 0, -.15]]), qt('Shoulder_R', [0, .6, 1.2], [[.2, 0, .5], [0, 0, .15], [.2, 0, .5]])]),
  new THREE.AnimationClip('greeting', 2.4, [float(2.4), qt('Head', [0, 1.2, 2.4], [[0, 0, 0], [0, 0, -.08], [0, 0, 0]]), qt('Shoulder_R', [0, .45, .85, 1.25, 1.65, 2.4], [[0, 0, .3], [0, 0, 2.0], [0, 0, 1.6], [0, 0, 2.0], [0, 0, 1.6], [0, 0, .3]])]),
  new THREE.AnimationClip('thinking', 2.8, [float(2.8), qt('Head', [0, 1.4, 2.8], [[.04, -.12, -.12], [.04, .08, -.08], [.04, -.12, -.12]])]),
  new THREE.AnimationClip('listening', 2.6, [float(2.6, .04), qt('Head', [0, 1.3, 2.6], [[-.04, -.08, .1], [.025, -.08, .1], [-.04, -.08, .1]])]),
  new THREE.AnimationClip('speaking', 1.6, [float(1.6, .035), qt('Head', [0, .4, .8, 1.2, 1.6], [[0, -.025, 0], [.025, .025, .025], [-.025, .04, 0], [.02, 0, -.025], [0, -.025, 0]]), qt('Shoulder_L', [0, .8, 1.6], [[0, 0, -.3], [-.1, 0, -.6], [0, 0, -.3]]), vt('Jaw', [0, .2, .4, .6, .8, 1, 1.2, 1.4, 1.6], [[1, .65, 1], [1, 1.5, 1], [1, .8, 1], [1, 1.25, 1], [1, .65, 1], [1, 1.4, 1], [1, .8, 1], [1, 1.25, 1], [1, .65, 1]])]),
  new THREE.AnimationClip('pointing', 2, [float(2), qt('Head', [0, 1, 2], [[0, .06, 0], [0, .1, -.04], [0, .06, 0]]), qt('Shoulder_R', [0, .5, 2], [[0, 0, .3], [0, 0, 1.3], [0, 0, 1.3]])]),
  new THREE.AnimationClip('explaining', 1.8, [float(1.8), qt('Shoulder_R', [0, .9, 1.8], [[0, 0, 1], [0, 0, 1.4], [0, 0, 1]]), qt('Head', [0, .9, 1.8], [[0, .06, -.03], [.04, -.04, .03], [0, .06, -.03]]), vt('Jaw', [0, .45, .9, 1.35, 1.8], [[1, .7, 1], [1, 1.4, 1], [1, .7, 1], [1, 1.4, 1], [1, .7, 1]])])
];
const arrayBuffer = await new GLTFExporter().parseAsync(scene, { binary: true, trs: true, onlyVisible: true, animations });
const output = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/models/fstu-ai-friendly.glb');
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, Buffer.from(arrayBuffer));
console.log(`Created ${output} (${Math.round(arrayBuffer.byteLength / 1024)} KiB, ${animations.length} animations)`);
