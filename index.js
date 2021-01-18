const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const NodePhysijs = require('nodejs-physijs');
const THREE = NodePhysijs.THREE;
const Ammo = NodePhysijs.Ammo;
const Physijs = NodePhysijs.Physijs(THREE,Ammo);
app.use(express.static(path.join(__dirname,'public')));

app.get('/',function(req,res){
  res.sendFile(__dirname+'/index.html');
});

//Code
var scene,object,allObjData,randomObjects = [],timeStep = 0,update = true,fps = 0;
function init(){
  scene = new Physijs.Scene;
  scene.setGravity(new THREE.Vector3(0,-30,0))
  object = new Physijs.BoxMesh(new THREE.CubeGeometry(1,1,1),new THREE.MeshBasicMaterial({color:'gray'}));
  object.name = 'object';
  object.info = {
    geometry:'BoxGeometry(1,1,1)',
    material:'MeshBasicMaterial({color:"gray"})',
    mesh:'BoxMesh',
    mass:1
  }
  object.position.set(0,10,0);
  object.__dirtyPosition = true;
  floor = new Physijs.BoxMesh(new THREE.PlaneGeometry(100,100,100),new THREE.MeshBasicMaterial({color:'gray'}),0);
  floor.side = THREE.BackSide;
  floor.name = 'floor';
  floor.rotation.x = Math.PI/2;
  floor.__dirtyRotation = true;
  floor.info = {
    geometry:'PlaneGeometry(100,100,100)',
    material:"MeshBasicMaterial({color:'purple',side:THREE.DoubleSide})",
    mesh:'BoxMesh',
    mass:0
  }
  scene.add(object);
  scene.add(floor);
  generateRandomObjects();
  setInterval(function(){
  object.position.set(0,10,0);
  object.rotation.set(.5,.5,.5);
  object.__dirtyRotation=true;
  object.__dirtyPosition=true;
  for(var i = 0;i<randomObjects.length;i++){
    var obj = randomObjects[i]
    if(obj!=undefined){
    obj.position.set(Math.random()*20-10,Math.random()*20+5,Math.random()*20-10);
    obj.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
    obj.__dirtyPosition = true;
    obj.__dirtyRotation=true;
    }

  }
  update = true;
},5000);
function getFPS(){
  let last = timeStep;
  setTimeout(function(){
    fps = timeStep - last;
    getFPS();
  },1000);
}
getFPS();
}
function generateRandomObjects(){
  for(var i = 0;i<20;i++){
    var height = Math.random()*1+1;
    var width = Math.random()*1+1;
    var depth = Math.random()*1+1;
    var clr = 'rgb('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+')';
    var obj = new Physijs.BoxMesh(new THREE.CubeGeometry(height,width,depth),new THREE.MeshBasicMaterial({color:clr}),10);
    var info = {
      geometry:'BoxGeometry('+height+','+width+','+depth+')',
      material:'MeshBasicMaterial({color:"'+clr+'"})',
      mesh:'BoxMesh',
      mass:10
    };
    obj.position.set(Math.random()*20-10,Math.random()*10+5,Math.random()*20-10);
    obj.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
  
    obj.name = 'obj'+i;
    obj.info = info;
    scene.add(obj);
    randomObjects.push(obj);
  };
  setInterval(render,1000/60)
}
function render(){
  scene.simulate();
  if(scene.simulate != false) {
    timeStep++;
  }
  allObjData = [];
  for(let i=0;i<scene.children.length;i++){
    let ob = scene.children[i];
    allObjData.push({
      name:ob.name,
      info:ob.info,
      position:{
      x:ob.position.x,
      y:ob.position.y,
      z:ob.position.z,
      },
      rotation:{
        x:ob.rotation.x,
        y:ob.rotation.y,
        z:ob.rotation.z,
      },
      linearVeloc:ob.getLinearVelocity(),
      angularVeloc:ob.getAngularVelocity(),
    });
  }
  io.volatile.emit('scene',{
    scene:allObjData,
    timeStep:timeStep,
    update:update,
    fps:fps
  });//Send
  
  update = false;

}


init();



io.on('connection',function(socket){
//do nothing
});


http.listen(3000,function(){
  console.log('Server started.');
})