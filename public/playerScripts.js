function createCharacter(x,y,z,local){
//Create head
//Update all positions to match x y&z offset
var posVec = new THREE.Vector3(x,y,z);

var head = new Physijs.CylinderMesh(new THREE.CylinderGeometry(.3,.3,.6,20,32),new THREE.MeshBasicMaterial({map:defaultFace,color:'#f4cc43'}),1);
head.position.set(posVec.x,posVec.y,posVec.z);





var body = new Physijs.BoxMesh(new THREE.BoxGeometry(1.2,1.3,.6),new THREE.MeshBasicMaterial({color:'#176baa'}),0);
//body.position.add(posVec);
head.add(body);
body.position.y -= 1;


var leftArm = new Physijs.BoxMesh(new THREE.BoxGeometry(.6,1.3,.6),new THREE.MeshBasicMaterial({color:'#f4cc43'}),0);
leftArm.position.set(-.90,0,0);
//leftArm.position.add(posVec);
leftArm.position.y -=1;
head.add(leftArm)



//body.add(leftArm);

var rightArm = new Physijs.BoxMesh(new THREE.BoxGeometry(.6,1.3,.6), new THREE.MeshBasicMaterial({color:'#f4cc43'}),0);
rightArm.position.set(.90,0,0);
//rightArm.position.add(posVec);
rightArm.position.y -=1;
head.add(rightArm);


var leftLeg = new Physijs.BoxMesh(new THREE.BoxGeometry(.6,1.3,.6),new THREE.MeshBasicMaterial({color:'#a5bc50'}),0);
leftLeg.position.set(-.30,-2.3,0);
//leftLeg.position.add(posVec);
head.add(leftLeg);

var rightLeg = new Physijs.BoxMesh(new THREE.BoxGeometry(.6,1.3,.6),new THREE.MeshBasicMaterial({color:'#a5bc50'}),0);
rightLeg.position.set(.30,-2.3,0);
//rightLeg.position.add(posVec);
head.add(rightLeg)
head.rotation.y = Math.PI/2;


//--

head.body = body;
head.leftArm = leftArm;
head.rightArm = rightArm;
head.leftLeg = leftLeg;
head.rightLeg = rightLeg;
head.local = local;
players.push(head);
scene.add(head)
}
function render(){
  requestAnimationFrame(render);
  TWEEN.update();
  movePlayer();
  if(scene.simulate()!=false){
    localPhysFrames+=1;//REndered another frame
    localStep+=1;
  }

  renderer.render(scene,camera);
  
  stat.innerHTML = 'Ping: '+ping+'<br>FPS: '+fps+'<br>Phys FPS: '+physfps+'<br> Local Phys FPS: '+localphysfps+'<br>Server FPS:'+servfps + '<br>In sync: '+inSync;//Update stats
};

function movePlayer(){
  let plyr = players[0];
  let v = plyr.getLinearVelocity();
  if(keys['w']){
    plyr.rotation.set(0,0,0);
  // plyr.setAngularVelocity(new THREE.Vector3(0,0,0));
  }
  if(keys['s']){
    plyr.rotation.set(0,-Math.PI,0)
   // plyr.setAngularVelocity(new THREE.Vector3(0,10,0));
  }
  if(keys['a']){
    plyr.rotation.set(0,Math.PI/2,0);
    //plyr.setAngularVelocity(new THREE.Vector3(0,10));
  }
  if(keys['d']){
    plyr.rotation.set(0,-Math.PI/2,0)
    //plyr.setAngularVelocity(new THREE.Vector3(0,-10,0))
  }
  if(keys['w']||keys['a']||keys['s']||keys['d']){
    v.add(new THREE.Vector3(0,0,-5));
    v.applyAxisAngle(new THREE.Vector3(0,1,0),plyr.rotation.y)
  }

  v.clamp(new THREE.Vector3(-5,-10,-5),new THREE.Vector3(5,10,5));
  plyr.setLinearVelocity(v);
  plyr.position.y = 5;
  plyr.__dirtyPosition = true;
  plyr.__dirtyRotation = true;
}