import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'; 
import { gsap } from 'gsap';

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const aspectRatio = window.innerWidth / (window.innerHeight / 1.5);
const camera = new THREE.PerspectiveCamera(25, aspectRatio, 0.1, 1000);
camera.position.set(0, 100, 285);

// Create a renderer and add it to the DOM
const container = document.getElementById('threejs-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth - (window.innerWidth * 0.01), window.innerHeight / 1.5);
renderer.setClearColor(0xADD8E6, 1); // Light blue background
container.appendChild(renderer.domElement);

// Add orbit controls
const orbit = new OrbitControls(camera, renderer.domElement);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040, 20); // Soft white light
scene.add(ambientLight);

// Add directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Asset management
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/'); // Set the path to DRACO decoder
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

const assets = {
    bananaTree: { instance: null, url: '/glb/bananatree.glb', targetPosition: new THREE.Vector3(13, 8, 40), scale: 3 },
    campfire: { instance: null, url: '/glb/campfire.glb', targetPosition: new THREE.Vector3(0, 8, 40), scale: 2 },
    balm: { instance: null, url: '/glb/balm.glb', targetPosition: new THREE.Vector3(5, 9, 50), scale: 2 },
    newHomes: { instance: null, url: '/glb/newhomes.glb', targetPosition: new THREE.Vector3(0, 0, 0), scale: 1 },
    roadway: { instance: null, url: '/glb/roadway.glb', targetPosition: new THREE.Vector3(0, 0, 0), scale: 1 },
    question: { instance: null, url: '/glb/question.glb', targetPosition: new THREE.Vector3(0, -10, 0), scale: 10 },
    theNorm: { instance: null, url: '/glb/thenorm.glb', targetPosition: new THREE.Vector3(0, 0, 0), scale: 1 }
};

const assetStatus = {
    bananaTree: { loading: false, removing: false },
    campfire: { loading: false, removing: false },
    balm: { loading: false, removing: false },
    newHomes: { loading: false, removing: false },
    roadway: { loading: false, removing: false },
    question: { loading: false, removing: false },
    theNorm: { loading: false, removing: false }
};

// Create a loading animation
const loaderCircleGeometry = new THREE.CircleGeometry(20, 32); // Increased size (radius from 1 to 20)
const loaderCircleMaterial = new THREE.MeshBasicMaterial({ color: 0x9dd44c }); // Grey background
const loaderCircle = new THREE.Mesh(loaderCircleGeometry, loaderCircleMaterial);
loaderCircle.position.set(0, 0, 0); // Center of the canvas
scene.add(loaderCircle); // Add the loader circle to the scene

const fillCircleMaterial = new THREE.MeshBasicMaterial({ color: 0xADD8E6, side: THREE.DoubleSide }); // Blue fill
const fillCircle = new THREE.Mesh(loaderCircleGeometry, fillCircleMaterial);
fillCircle.position.set(0, 0, 2); // Center of the canvas
fillCircle.scale.set(0, 0, 0); // Start with scale of (0, 0, 1) for radius effect
scene.add(fillCircle); // Add the fill circle to the scene

// Create a canvas for text
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
canvas.width = 1600; // Set width
canvas.height = 400; // Set height
context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas to make the background transparent
context.fillStyle = 'black'; // Change text color to white for better visibility
context.font = 'bold 192px Georgia';
context.textAlign = 'center';
context.textBaseline = 'middle';
context.fillText('Drag to Move', canvas.width / 2, canvas.height / 2 + 110);
context.fillText('Scroll to Zoom', canvas.width / 2, canvas.height / 2 - 100);

// Create texture from canvas
const texture = new THREE.Texture(canvas);
texture.needsUpdate = true;

// Create a plane to display the text
const textMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide }); // Set transparent to true
const textGeometry = new THREE.PlaneGeometry(30, 10); // Set the plane size
const textMesh = new THREE.Mesh(textGeometry, textMaterial);
textMesh.position.set(0, 0, 5); // Slightly in front of the loader circle
scene.add(textMesh); // Add text mesh to the scene

// Show loading animation
function startLoadingAnimation() {
    fillCircle.scale.set(0, 0, 1); // Reset scale for animation
    gsap.to(fillCircle.scale, { x: 1, y: 1, duration: 8, ease: "power1.out" }); // Expand radius
    textMesh.visible = true; // Show text during loading
}

// Stop loading animation
function stopLoadingAnimation() {
    scene.remove(loaderCircle);
    scene.remove(fillCircle);
    textMesh.visible = false; // Hide text when loading is done
}


function loadAsset(name) {
    const asset = assets[name];
    if (!asset.instance && !assetStatus[name].loading) {
        assetStatus[name].loading = true;
        
        // Start loading animation before loading the asset
        startLoadingAnimation();

        gltfLoader.load(asset.url, (gltf) => {
            stopLoadingAnimation(); // Stop loading animation after loading

            asset.instance = gltf.scene;
            asset.instance.position.copy(asset.targetPosition);
            asset.instance.scale.set(asset.scale, asset.scale, asset.scale); // Apply scale
            scene.add(asset.instance);

            // Apply easing animation using GSAP
            gsap.fromTo(
                asset.instance.position,
                { y: asset.targetPosition.y + 100 }, // Start above the position
                { y: asset.targetPosition.y, duration: 2, ease: "power2.out" } // Ease in
            );

            // Apply rotation animation using GSAP
            gsap.fromTo(
                asset.instance.rotation,
                { y: Math.PI * 2 }, // Start at 360 degrees (or 0)
                { y: 0, duration: 2, ease: "power2.out" } // Rotate to 0 degrees
            );

            assetStatus[name].loading = false;
        }, undefined, (error) => {
            console.error(`Error loading ${name}:`, error);
            stopLoadingAnimation(); // Ensure loading animation is stopped even on error
            assetStatus[name].loading = false;
        });
    }
}

function removeAsset(name) {
    const asset = assets[name];
    if (asset.instance && !assetStatus[name].removing) {
        assetStatus[name].removing = true;

        // Apply rotation animation using GSAP
        gsap.to(
            asset.instance.rotation,
            { y: Math.PI * 2, duration: 2, ease: "power2.in" }
        );

        gsap.to(
            asset.instance.position,
            { y: asset.targetPosition.y + 100, duration: 2, ease: "power2.in", onComplete: () => {
                scene.remove(asset.instance);
                asset.instance = null;
                assetStatus[name].removing = false;
            }}
        );
    }
}

function updateAssetsForIndex(index) {
    switch (index) {
        case 0: // Index 1
            loadAsset('theNorm');
            removeAsset('bananaTree');
            removeAsset('campfire');
            removeAsset('balm');
            removeAsset('roadway');
            removeAsset('newHomes');
            removeAsset('question');
            break;
        case 1: // Index 2
            loadAsset('bananaTree');
            loadAsset('campfire');
            loadAsset('balm');
            removeAsset('roadway');
            removeAsset('newHomes');
            removeAsset('question');
            loadAsset('theNorm');
            break;
        case 2: // Index 3
            loadAsset('bananaTree');
            loadAsset('campfire');
            loadAsset('balm');
            loadAsset('roadway');
            removeAsset('newHomes');
            removeAsset('question');
            loadAsset('theNorm');
            break;
        case 3: // Index 4
            loadAsset('theNorm');
            loadAsset('bananaTree');
            loadAsset('campfire');
            loadAsset('balm');
            loadAsset('roadway');
            loadAsset('newHomes');
            removeAsset('question');
            break;
        case 4: // Index 5
            loadAsset('question');
            removeAsset('bananaTree');
            removeAsset('campfire');
            removeAsset('balm');
            removeAsset('roadway');
            removeAsset('newHomes');
            removeAsset('theNorm');
            break;
    }
}

// Load the initial GLTF model
const assetLoader = new GLTFLoader();
const village = new URL('/glb/thenorm.glb', import.meta.url);
let mixer;

// Animate the scene
const clock = new THREE.Clock();

function animate() {
    if (mixer) mixer.update(clock.getDelta());
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Handle window resize
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / (window.innerHeight / 1.5);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight / 1.5);
});

document.addEventListener('DOMContentLoaded', () => {
    const circlesContainer = document.getElementById('circles');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');

    const totalCircles = 5;
    let currentIndex = 0;

    function updateCircles() {
        circlesContainer.innerHTML = '';
        for (let i = 0; i < totalCircles; i++) {
            const circle = document.createElement('div');
            circle.className = `w-5 h-5 border-2 rounded-full ${i === currentIndex ? 'bg-gray-600' : 'bg-gray-200'}`;
            circlesContainer.appendChild(circle);
        }
    }

    function updateContent() {
        // Hide all content sections
        for (let i = 1; i <= totalCircles; i++) {
            document.getElementById(`content-${i}`).style.display = 'none';
        }
        // Show the current content section
        document.getElementById(`content-${currentIndex + 1}`).style.display = 'block';

        // Update background color
        if (currentIndex === 4) { // Circle 5
            renderer.setClearColor(0xd3d3d3, 1); // Light grey background
        } else {
            renderer.setClearColor(0xADD8E6, 1); // Light blue background
        }

        updateAssetsForIndex(currentIndex);
    }

    prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCircles();
            updateContent();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentIndex < totalCircles - 1) {
            currentIndex++;
            updateCircles();
            updateContent();
        }
    });

    // Initialize circles and content
    updateCircles();
    updateContent();
});

// Content animation
const contents = document.querySelectorAll('[id^="content-"]');
let currentContentIndex = 0;

document.getElementById("next").addEventListener("click", () => {
    if (currentContentIndex < contents.length - 1) {
        animateContentTransition(currentContentIndex, currentContentIndex + 1, 'next');
        currentContentIndex++;
    }
});

document.getElementById("prev").addEventListener("click", () => {
    if (currentContentIndex > 0) {
        animateContentTransition(currentContentIndex, currentContentIndex - 1, 'prev');
        currentContentIndex--;
    }
});

function animateContentTransition(fromIndex, toIndex, direction) {
    const fromContent = contents[fromIndex];
    const toContent = contents[toIndex];

    if (direction === 'next') {
        gsap.fromTo(fromContent, { x: 0 }, { x: -100, opacity: 0, duration: 0.5, onComplete: () => fromContent.style.display = 'none' });
        gsap.fromTo(toContent, { x: 100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, onStart: () => toContent.style.display = 'block' });
    } else {
        gsap.fromTo(fromContent, { x: 0 }, { x: 100, opacity: 0, duration: 0.5, onComplete: () => fromContent.style.display = 'none' });
        gsap.fromTo(toContent, { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, onStart: () => toContent.style.display = 'block' });
    }
}

// Initially, only display the first content
contents.forEach((content, index) => {
    if (index !== 0) {
        content.style.display = 'none';
    }
});
