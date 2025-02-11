var scene, camera, renderer, clock, mixer, actions = [], mode;

init();

function init() {
  const assetPath = './';

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xaaaaaa);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-5, 25, 20);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const ambient = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xFFFFFF);
  light.position.set(0, 10, 2);
  scene.add(light);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(1, 2, 0);
  controls.update();

  // Button to control animations
  mode = 'open';
  const btn = document.getElementById("btn");
  btn.addEventListener('click', function() {
    console.log("Button clicked. Actions length: " + actions.length); // Check length of actions
    if (actions.length === 1) {
      if (mode === "open") {
        actions.forEach(action => {
          console.log("Playing action: ", action);
          action.timeScale = 1;
          action.reset();
          action.play();
        });
      }
    } else {
      console.log("Animations not fully loaded yet.");
    }
  });

  // Load the glTF model
  const loader = new THREE.GLTFLoader();
  loader.load(assetPath + 'web3dmodelv4.glb', function(gltf) {
    const model = gltf.scene;
    scene.add(model);

    // Set up animations 
    mixer = new THREE.AnimationMixer(model);
    const animations = gltf.animations;

    animations.forEach(clip => {
      const action = mixer.clipAction(clip);
      actions.push(action);
    });

    // Log the animations to verify they're loaded
    console.log("Animations loaded: ", animations);
  });

  // Handle resizing
  window.addEventListener('resize', resize, false);

  // Start the animation loop
  animate();
}

function animate() {
  requestAnimationFrame(animate);

  // Update animations
  if (mixer) {
    mixer.update(clock.getDelta());
  }

  renderer.render(scene, camera);
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
