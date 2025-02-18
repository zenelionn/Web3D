var scene, camera, renderer, clock, mixer, actions = [], mode, isWireframe = false;
let loadedModel;
let secondModelMixer, secondModelActions = [];

init();

function init() {
  const assetPath = './';

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fabb5);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-5, 5, 20);

  
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
    if (actions.length === 1) {
      if (mode === "open") {
        actions.forEach(action => {
          action.timeScale = 1;
          action.reset();
          action.play();
              });
      }
    }
  });

  const wireframeBtn = document.getElementById("toggleWireframe");
  wireframeBtn.addEventListener('click', function () {
    isWireframe = !isWireframe;
    toggleWireframe(isWireframe);
  });

  const rotateBtn = document.getElementById("rotateModel");
  rotateBtn.addEventListener('click', function() {
    if (loadedModel){
      const axis = new THREE.Vector3(0,1,0); // Y axis
      const angle = Math.PI / 8; // rotate 22.5 degrees
      loadedModel.rotateOnAxis(axis, angle);
    }
    else {
      console.warn('Model not loaded yet');
    }
  });

  

 // Add event listener for the play second model animation button
 const playSecondModelAnimationBtn = document.getElementById("playSecondModelAnimation");
  playSecondModelAnimationBtn.addEventListener('click', function () {
   if (secondModelActions.length > 0) {
     secondModelActions.forEach(action => {
       action.reset();
       action.setLoop(THREE.LoopOnce); // Play the animation only once
       action.clampWhenFinished = true; // Stop at the last frame
       action.play();
     });
   } else {
     console.warn('No animation available for the second model.');
   }
 });


 const loader = new THREE.GLTFLoader();
 function loadModel(modelPath) {
 if(loadedModel) {
   scene.remove(loadedModel);
 }

   loader.load(modelPath, function(gltf) {
    const model = gltf.scene;

    model.position.set(0,0,0);

    scene.add(model);

    loadedModel = model;

    mixer = newTHREE.AnimationMixer(model);
    const animations = gltf.animations;
    actions = [];

    animations.forEach(clip =>{
      const action = mixer.clipAction(clip);
      actions.push(action);
    });

    if(modelPath === 'soda_can_crush.glb') {
      secondModelMixer = mixer;
      secondModelActions = actions;
      
    }
      
    });
    
    }
  
  loadModel('web3dmodelv5.glb');
  const switchBtn = document.getElementById("switchModel");
  switchBtn.addEventListener('click', function(){
    loadModel('soda_can_crush.glb');
  });



  // Handle resizing
  window.addEventListener('resize', resize, false);

  // Start the animation loop
  animate();
}

function toggleWireframe(enable){
  scene.traverse(function (object){
    if (object.isMesh){
      object.material.wireframe = enable;
    }
  });
}

function animate() {
  requestAnimationFrame(animate);

  // Update animations for both models
  if (mixer) mixer.update(clock.getDelta());
  if (secondModelMixer) secondModelMixer.update(clock.getDelta());



  renderer.render(scene, camera);
}

function resize() {
  const canvas = document.getElementById('threeContainer');
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
