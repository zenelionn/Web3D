var scene, camera, renderer, clock, mixer, actions = [], mode, isWireframe = false, params, lights;
let loadedModel;
let firstModelMixer, firstModelActions = [];
let secondModelMixer, secondModelActions = [];
let thirdModelMixer, thirdModelActions = [];

init();

function init() {
  const assetPath = './';

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fabb5);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);

  camera.position.set(-5, 5, 20);

  
  renderer = new THREE.WebGLRenderer();
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const ambient = new THREE.HemisphereLight(0xffffff, 0xffffff,1);
  scene.add(ambient);

  lights = {};
  
  lights.spot = new THREE.SpotLight();
  lights.spot.visible = true;
  lights.spot.position.set(0,20,0);
  lights.spotHelper = new THREE.SpotLightHelper(lights.spot);
  lights.spotHelper.visible = false;
  scene.add(lights.spotHelper);
  scene.add(lights.spot);

  params = {
    spot: { 
      enable: false,
      color: 0xffffff,
      distance: 20,
      angle: Math.PI/2,
      penumbra: 0,
      helper: false,
      moving: false
    }
  }
  
  const gui = new dat.GUI({ autoPlace: false });
  const guiContainer = document.getElementById('gui-container');
  guiContainer.appendChild(gui.domElement);

  guiContainer.style.position = 'fixed';

  const spot = gui.addFolder('Spot');
  spot.open();
  spot.add(params.spot, 'enable').onChange(value => { lights.spot.visible = value });
  spot.addColor(params.spot, 'color').onChange( value => lights.spot.color = new THREE.Color(value));
  spot.add(params.spot, 'distance').min(0).max(20).onChange( value => lights.spot.distance = value);
  spot.add(params.spot, 'angle').min(0.1).max(6.28).onChange( value => lights.spot.angle = value );
  spot.add(params.spot, 'penumbra').min(0).max(1).onChange( value => lights.spot.penumbra = value );
  spot.add(params.spot, 'helper').onChange(value => lights.spotHelper.visible = value);
  spot.add(params.spot, 'moving');




 

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(1, 2, 0);
  controls.update();

  

  // Button to control animations
   mode = 'open';
  const btn = document.getElementById("ManAnimation");
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

  const playSecondModelAnimationBtn = document.getElementById("playSecondModelAnimation");
  playSecondModelAnimationBtn.addEventListener('click', function () {

    if(secondModelActions.length>0){
    secondModelActions.forEach(action => {
      action.reset();
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
      action.play();
    });

    } else {
      console.warn('No animation available for the second model');
    }

  });



const playLeopardAnimationbtn = document.getElementById('SnowLeopardAnimation');
playLeopardAnimationbtn.addEventListener('click', function(){

  if(thirdModelActions.length>0){
    thirdModelActions.forEach(action => {
      action.reset();
      action.setLoop(THREE.Loop);
      action.clampWhenFinished = true;
      action.play();
    });
  } else{
    console.warn('No animation for third model');

  }
});



const loader = new THREE.GLTFLoader();
function loadModel(modelPath) {
if(loadedModel) {
  scene.remove(loadedModel);
}

loader.load(modelPath, function (gltf) {
const model = gltf.scene;

model.position.set(0, 0, 0);

scene.add(model);

loadedModel = model;

mixer = new THREE.AnimationMixer(model);
const animations = gltf.animations;
action = [];

animations.forEach(clip=>{
const action = mixer.clipAction(clip);
actions.push(action);

});

if(modelPath === 'web3DmodelV6.glb'){
  firstModelMixer = mixer;
  firstModelActions = actions;
}

if(modelPath === 'kimbra v7 animation v4.glb') {
secondModelMixer = mixer;
secondModelActions = actions;
}

if (modelPath === 'ELI.glb'){
  thirdModelMixer = mixer;
  thirdModelActions = actions;
}

});

}

loadModel('web3DmodelV6.glb');

const switchBtn = document.getElementById("PowerRanger");
switchBtn.addEventListener('click', function () {
loadModel('kimbra v7 animation v4.glb');
});

const snowleopardbtn = document.getElementById("SnowLeopard");
snowleopardbtn.addEventListener('click', function(){
  loadModel('ELI.glb');
});

const manbtn = document.getElementById("Man");
manbtn.addEventListener('click', function(){
  loadModel('web3DmodelV6.glb')
})



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
  const time = clock.getElapsedTime();
  const delta = Math.sin(time)*5;
  if (params.spot.moving){ 
    lights.spot.position.x = delta;
    lights.spotHelper.update();
  }
}



function resize() {
  const canvas = document.getElementById('threeContainer');
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
