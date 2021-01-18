import * as THREE from 'https://threejs.org/build/three.module.js';
import CapsuleGeometry from '/capsulegeometry.js';//This is for capsule geometry (e.g player head)
import {OrbitControls} from 'https://threejs.org/examples/jsm/controls/OrbitControls.js'
Physijs.scripts.worker = '/physiworker.js';
Physijs.scripts.ammo ='/ammo.js'
const socket = io();
var camera,scene,renderer,controls,object,floor,defaultFace,players = [];
var fps,physfps,ping,localphysfps,localPlayer,localStep = 0,servfps = 0,inSync = false;
var stat = document.getElementById('info');
var lastPing = 0;
var physFrames = 0;
var localPhysFrames = 0;
var keys = [];
document.body.addEventListener('keydown',function(e){
  keys[e.key]=true;
})
document.body.addEventListener('keyup',function(e){
  keys[e.key]=false;
});
function init(){
  defaultFace = new THREE.TextureLoader().load('/textures/face.png');
  defaultFace.repeat.set(4,1);
  defaultFace.offset.set(-1.5,0)
    camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,200);//camera
  scene = new Physijs.Scene;//scene
  scene.addEventListener('update',function(){
    //scene.simulate();
  })
  renderer = new THREE.WebGLRenderer({antialias:true});//renderer
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.shadowMap.enabled = true;//Enable shadows
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;//Soft shadow maps
  camera.position.set(0,2,3);//Move the camera slightly away
  document.body.appendChild(renderer.domElement);
  controls = new OrbitControls(camera,renderer.domElement);
    window.addEventListener('resize',function(){//Resize canvas/camera aspect
    renderer.setSize(window.innerWidth,window.innerHeight);
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
  });
  updateStats();
  render();

}

function render(){
  requestAnimationFrame(render);
  TWEEN.update();
  if(scene.simulate()!=false){
    localPhysFrames+=1;//REndered another frame
    localStep+=1;
  }

  renderer.render(scene,camera);
  
  stat.innerHTML = 'Ping: '+ping+'<br>FPS: '+fps+'<br>Local Server Phys FPS: '+physfps+'<br> Local Phys FPS: '+localphysfps+'<br>Server FPS:'+servfps + '<br>In sync: '+inSync;//Update stats
};


function updateStats(){
  function updateFPS(){
  var lastFPS = renderer.info.render.frame;
  var lastPhysFrames = physFrames;
  var lastLocalPhysFrames = localPhysFrames;
  setTimeout(function(){
    fps = (renderer.info.render.frame-lastFPS);
    physfps = (physFrames-lastPhysFrames);
    localphysfps = (localPhysFrames-lastLocalPhysFrames)
    updateFPS();
  },1000);
  }
  updateFPS();
  setInterval(function(){
    ping = (performance.now()-lastPing).toFixed(1);
  },250);
}

socket.on('scene',function(dat){
  let d = dat.scene;
  let timeStep = dat.timeStep;
  inSync = false;
  servfps = dat.fps;
  let update = dat.update;//if this is true, some update must be applied
  if(Math.abs(timeStep - localStep) > 5){//bigger than 5-step tolerance
    //Server is ahead
    localStep = timeStep;
    update = true;
    inSync = false;
  } else {
    inSync = true;
  }
  if(localStep > timeStep){
    //Server is behind?!
    //Correct timestep
    localStep = timeStep;
  }
  lastPing = performance.now();
  physFrames+=1;
  if(update == true){
  for(var i = 0;i<d.length;i++){
    var obj = d[i];
    var ob = scene.getObjectByName(obj.name);
    if(ob!=undefined){
      if(ob.position != obj.position){
    ob.position.set(obj.position.x,obj.position.y,obj.position.z);
      ob.__dirtyPosition = true;
      }
      if(ob.rotation != obj.rotation){
    ob.rotation.set(obj.rotation.x,obj.rotation.y,obj.rotation.z);
      }
  
    ob.__dirtyRotation = true;
    
    ob.setLinearVelocity(obj.linearVeloc);
    ob.setAngularVelocity(obj.angularVeloc);
    }else{
      createObject(obj);
    }
    //Update object
  }
  }
});
function createObject(params){
  let inf = params.info;
  var geo = 'new THREE.'+inf.geometry;
  var mat = 'new THREE.'+inf.material;
  var mass = inf.mass;
  var str = 'new Physijs.'+inf.mesh+'('+geo+','+mat+','+mass+')';
  var obj = eval(str);
  obj.name = params.name;
  obj.position.set(params.position.x,params.position.y,params.position.z);
  obj.rotation.set(params.rotation.x,params.rotation.y,params.rotation.z);
  obj.setLinearVelocity(params.linearVeloc);
  obj.setAngularVelocity(params.angularVeloc)
  obj.__dirtyPosition = true;
  obj.__dirtyRotation = true;
  scene.add(obj);
}
init();