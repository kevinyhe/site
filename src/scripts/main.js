import * as THREE from 'three';
import { PLYLoader } from 'three/addons/loaders/PLYLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const DOMCanvas = document.getElementById("threeCanvas");

let renderer, scene, camera, spotLight, abstract;
let mouseX = 0;
let mouseY = 0;

let targetX = 0;
let targetY = 0;

const windowHalfX = window.innerWidth / 2;
const windowHalfY = window.innerHeight / 2;

let isPaused = false;

init();

function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(26, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(76, 50, 40);
    camera.rotation.set(-1.29, 1.15, 1.26);

    const ambientLight = new THREE.AmbientLight(0x000000, 1);
    const hemisphereLight = new THREE.HemisphereLight(0x000000, 0x000000, 20);
    scene.add(hemisphereLight);
    scene.add(ambientLight);

    const loader = new THREE.TextureLoader().setPath('textures/');
    const texture = loader.load('disturb.jpg');
    const metallicTexture = loader.load('metallic-high-res.png');

    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.encoding = THREE.sRGBEncoding;
    metallicTexture.minFilter = THREE.LinearFilter;
    metallicTexture.magFilter = THREE.LinearFilter;
    metallicTexture.encoding = THREE.sRGBEncoding;

    spotLight = new THREE.SpotLight(0xffffff, 100);
    spotLight.position.set(25, 50, 0);
    spotLight.angle = 1.0471975511965976;
    spotLight.penumbra = 1;
    spotLight.decay = 2;
    spotLight.distance = 80;
    spotLight.map = metallicTexture;

    spotLight.castShadow = true;
    // spotLight.shadowDarkness = 0;
    spotLight.shadow.mapSize.width = 4096;
    spotLight.shadow.mapSize.height = 4096;
    spotLight.shadow.focus = 1;
    scene.add(spotLight);

    new PLYLoader().load('/models/abstract-ball.ply', function (geometry) {

        geometry.scale(4,4,4);
        geometry.computeVertexNormals();

        const material = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF,
            specular: 0xFFFFFF,
            shininess: 100,
            map: metallicTexture,
            side: THREE.DoubleSide,
        });
        material.needsUpdate = true;

        abstract = new THREE.Mesh(geometry, material);
        abstract.position.y = 15;
        abstract.position.x = 0;
        abstract.castShadow = true;
        abstract.receiveShadow = true;
        // abstract.shadowBias = 100;
        scene.add(abstract);
    });

    const geometry = new THREE.PlaneGeometry(900, 900);
    const material = new THREE.MeshLambertMaterial({ color: 0x010101, side: THREE.DoubleSide });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -1, 0);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    scene.add(mesh);

    window.addEventListener('resize', onWindowResize);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        // shininess: 100,
        // alpha: true, // this allows the background to be layered onto the DOM content
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth * 1.5, window.innerHeight * 1.5);
    renderer.setAnimationLoop(render);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    DOMCanvas.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false; // okay basically I can't remove the orbit controls because I'm an idiot
    // and whenever I try to do it the camera just goes wonk and I don't know why
    controls.minDistance = 20;
    controls.maxDistance = 500;
    controls.target.set(0, 18, 0);
    controls.update();


    document.addEventListener('mousemove', onDocumentMouseMove);

}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    renderer.setPixelRatio(window.devicePixelRatio);
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth * 1.5, window.innerHeight * 1.5);
}

function render() {
    if (!isPaused) {
        targetX = mouseX * .003;
        targetY = mouseY * .003;

        if (abstract) {

            abstract.rotation.y += 0.008 * (targetX - abstract.rotation.y);
            abstract.rotation.x += 0.008 * (targetY - abstract.rotation.x);
            abstract.rotation.z += 0.005;
        }

        const time = performance.now() / 3000;

        spotLight.position.x = Math.cos(time) * 15;
        spotLight.position.z = Math.sin(time) * 15;

        renderer.render(scene, camera);
    }
}

function disableRender() {
    isPaused = true;
}
// const gui = new GUI();
//
// const params = {
//     map: texture,
//     color: spotLight.color.getHex(),
//     intensity: spotLight.intensity,
//     distance: spotLight.distance,
//     angle: spotLight.angle,
//     penumbra: spotLight.penumbra,
//     decay: spotLight.decay,
//     focus: spotLight.shadow.focus,
//     shadows: true,
// };
//
// gui.add(params, 'map', texture).onChange(function (val) {
//
//     spotLight.map = val;
//
// });
//
// gui.addColor(params, 'color').onChange(function (val) {
//
//     spotLight.color.setHex(val);
//
// });
//
// gui.add(params, 'intensity', 0, 10).onChange(function (val) {
//
//     spotLight.intensity = val;
//
// });
//
//
// gui.add(params, 'distance', 50, 200).onChange(function (val) {
//
//     spotLight.distance = val;
//
// });
//
// gui.add(params, 'angle', 0, Math.PI / 3).onChange(function (val) {
//
//     spotLight.angle = val;
//
// });
//
// gui.add(params, 'penumbra', 0, 1).onChange(function (val) {
//
//     spotLight.penumbra = val;
//
// });
//
// gui.add(params, 'decay', 1, 2).onChange(function (val) {
//
//     spotLight.decay = val;
//
// });
//
// gui.add(params, 'focus', 0, 1).onChange(function (val) {
//
//     spotLight.shadow.focus = val;
//
// });
//
//
// gui.add(params, 'shadows').onChange(function (val) {
//
//     renderer.shadowMap.enabled = val;
//
//     scene.traverse(function (child) {
//
//         if (child.material) {
//
//             child.material.needsUpdate = true;
//
//         }
//
//     });
//
// });
//
// // let lightHelper = new THREE.SpotLightHelper( spotLight );
// // scene.add( lightHelper ); don't need the helper anymore
//
// gui.open();

