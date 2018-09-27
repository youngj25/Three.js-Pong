var socket, Pong = io('/pong', {forceNew:true});
var player=-1;
var Game_Status="Ready",camera;
var objects = [], board = [], dominoes= [];
//Start Game
var mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster(), pos = new THREE.Vector3();
//Text
var clickable = [];

//Pong
var leftPaddlePos ={ x:-5, y:0}, rightPaddlePos ={ x:5, y:0}, ballPos ={ x:0, y:0};
var ball, leftPaddle, rightPaddle;
var Outline, Board, PongLine;
var Width = 0, Height = 0;
var backgroundButton, background; //Background functions

function init() {
	 // create a scene, that will hold all our elements such as objects, cameras and lights.
	 var scene = new THREE.Scene();				
	
	 // create a camera, which defines where we're looking at.
	 camera = new THREE.PerspectiveCamera(50, 500/ 500, 0.1, 1000);
	 camera.position.set(0,0,50);
	 scene.add(camera);
	 
	 // create a render and set the size
	 var renderer = new THREE.WebGLRenderer({ antialias: true} );
	 renderer.setClearColor(new THREE.Color(0x000000, 0.0));
	
	 for ( var x=0; Width+Height == 0; x++){
		 if(window.innerWidth > 1000-x*100 && window.innerHeight > 1000-x*100){
			 Width = 850-x*100;			
			 Height = 850-x*120;	
		 }	
		 else if( x >= 8){
			 Width = window.innerWidth*0.75;
			 Height = window.innerHeight*0.5;
		 }
	 }
	 
	 renderer.setSize(Width, Height);
	 camera.aspect = window.innerWidth/window.innerHeight;
	
	 //renderer.shadowMapEnabled = true	
	
	 //Later change this back to false
	 var endGame = true; //The Game is over and you'll have to restart
	
	 var controls = new THREE.TrackballControls( camera );
	 controls.noZoom = false;
	 controls.noPan = false;
	 controls.staticMoving = true;
	 controls.dynamicDampingFactor = 0.3; 
			
	 //Sockets
	 socket = io.connect('http://localhost:9000');
	 //socket = io.connect('ec2-34-205-146-82.compute-1.amazonaws.com:9000');
	
	 Pong.on('Update Game State', function(data){
		 ball.position.x = data.ballPositionX;
		 ball.position.y = data.ballPositionY-5;
		 leftPaddle.position.y = data.leftPaddlePosition -5;
		 rightPaddle.position.y = data.rightPaddlePosition -5;
		 
		 if( data.leftUpdate == true)
			 leftPaddle.material.color.set("rgb("+100+","+100+","+255+")");
		 else
			 leftPaddle.material.color.set("rgb("+255+","+255+","+255+")");
		 
		 
		 if( data.rightUpdate == true)
			 rightPaddle.material.color.set("rgb("+255+","+100+","+100+")"); 
		 else
			 rightPaddle.material.color.set("rgb("+255+","+255+","+255+")");
	 });
	
	
	 //EVENT LISTENERS!!!!
	
	 //Keyboard Functions
	 //var onKeyDown = function(event) {
	 function onKeyDown(event) {
		 //Space Bar Changes Background
		 if (event.keyCode == 38 || event.keyCode ==104) { // Up Arrow
			 var data = { direction: "up"  };
			 Pong.emit('movePaddle',data);
		 }
		 else if (event.keyCode == 40  || event.keyCode ==98) { // Down Arrow
			 var data = { direction: "down"  };
			 Pong.emit('movePaddle',data);
		 }
		 else if (event.keyCode == 32 ) { // SpaceBar
			 Pong.emit('playAgain');
		 }
		 //else console.log("Key: "+event.keyCode);
	 }; 
	 document.addEventListener('keydown', onKeyDown, false);
		
	 //Window Resize Event
	 function onWindowResize(){
		 for ( var x=0; Width+Height == 0; x++){
			 if(window.innerWidth > 1000-x*100 && window.innerHeight > 1000-x*100){
				 Width = 850-x*100;		
				 Height = 850-x*120;	
			 }	
			 else if( x >= 8){
				 Width = window.innerWidth*0.75;
				 Height = window.innerHeight*0.5;
			 }
		 }
		 renderer.setSize(Width, Height);
		 //camera.aspect = renderer.domElement.width/renderer.domElement.height;
	 }
	 window.addEventListener('resize', onWindowResize, false);
	 //https://stackoverflow.com/questions/20290402/three-js-resizing-canvas?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
		
	 //Mouse Click
	 function onDocumentMouseDown (event){
		 //console.log("Click");
		 try{
			 event.preventDefault();	
			 // update the mouse variable
			 mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
			 mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1.5;
			 //console.log("M.x: "+(Math.floor(mouse.x*100)/100)+"  M.y:"+(Math.floor(mouse.y*100)/100));
				
			 projector = new THREE.Projector();
			 var vector = new THREE.Vector3( mouse.x, mouse.y, 1 );
			 projector.vector.unproject(vector, camera );
			 var ray = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );
				
			 var intersects = ray.intersectObjects( clickable );
				
			 // if there is one (or more) intersections
			 if ( intersects.length > 0 ){
				 intersects[0].object.callback();
			 }
		 }
		 catch(e){
			 //functionToHandleError(e);		
			 //He HE HE don't say a word if errors happen
		 }
		 //Source:view-source:https://stemkoski.github.io/Three.js/Mouse-Click.html
	 }
	 renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false)
	 
	 //Touch Screen events!!!
	 renderer.domElement.addEventListener('touchstart', function(e){
		 
	 }, false)
	 //http://www.javascriptkit.com/javatutors/touchevents.shtml
	 //https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
	
	 //add the output of the renderer to the html element
	 var displayCanvas = document.getElementById("WebGL-output").appendChild(renderer.domElement);
	 var context = renderer.getContext('2d');
	 
	 //call the render function
	 renderer.render(scene, camera);
	 //renderer.setClearColor(new THREE.Color(0x05d041, 1.0));
	 
	 renderer.domElement.addEventListener('click', function(e){
		 //alert("clicked") ;
		 var clickedX = e.pageX - this.offsetLeft;
         var clickedY = e.pageY - this.offsetTop;
	 }, false);
	 
	 //add spotlight for the shadows
	 var spotLight = new THREE.SpotLight(0xffffff);
	 spotLight.position.set(0, 0, 25);
	 spotLight.castShadow = false;
	 spotLight.intensity =2;
	 scene.add(spotLight);			 
	 
	 //call the render function
	 var step = 0;
	 loadBasicSet();
	 load_Board();
	 renderScene();
	 load_Buttons();
	 drag_objects();
	
	 function renderScene(){
		 try{
			 //Render steps
			 step += 1;
				
			 //render using requestAnimationFrame
			 requestAnimationFrame(renderScene);
			 renderer.render(scene, camera);			
				
			 //Move all the players
			 scene.traverse(function (e) {
				 if (e == PongLine && step % 50==0){		
					 var r = 30 + Math.floor( Math.random()*200);
					 var g = 30 + Math.floor( Math.random()*200);
					 var b = 30 + Math.floor( Math.random()*200);
					 e.material.color.set("rgb("+r+","+g+","+b+")");
				 }
				 else if (e == ball && background.backgroundNumber == 1)
					 e.rotation.z+=0.01;
			 });
		 }catch(e){
			 //functionToHandleError(e);		
			 //He HE HE don't say a word if errors happen				
		 }
	 }
	
	 function drag_objects(){
		 var dragControls  = new THREE.DragControls( objects, camera, renderer.domElement );
				
			 dragControls.addEventListener( 'dragstart', function(event) {
																		 if(event.object != backgroundButton)
																			controls.enabled = false;
																		 else if (event.object == backgroundButton){
																			 console.log("Change the Background");																		
																			 updateBackground();
																		 }
																		 //console.log("lol start of drag: ");
																		 
																		 });
																		 
			 dragControls.addEventListener( 'drag', function(event)   {
																		 if(event.object != backgroundButton){
																			 controls.enabled = true;
																			 //console.log("lol mid drag: ");
																			 if( event.object.name == "Left")
																					event.object.position.x = -20.75;
																			 else if( event.object.name == "Right")
																					 event.object.position.x = 20.75;
																				 
																			 var data = { yLoc: event.object.position.y  };
																			 Pong.emit('dragPaddle',data);
																		 }
																		 
																		 });
																		
			 dragControls.addEventListener( 'dragend', function(event)   {
																			 if(event.object != backgroundButton)
																				 controls.enabled = true;
																			 //console.log("lol end of drag: ");
																			 
																		 });
																		 
																		 
																		 
			 //console.log(dragControls);
																		 
			 //https://www.learnthreejs.com/drag-drop-dragcontrols-mouse/
	 }

	 function loadBasicSet(){
		 var ballGeometry = new THREE.PlaneGeometry(2,2,0);
		 var Material = new THREE.MeshBasicMaterial({color: 0xffffff}); //RGB
		 ball = new THREE.Mesh(ballGeometry, Material);
		 scene.add(ball);
		 ball.position.set(0,0,0); //xyz
		 
		 var blockGeometry = new THREE.PlaneGeometry(1.5,9,0);
		 Material = new THREE.MeshBasicMaterial({color: 0xffffff}); //RGB
		 leftPaddle = new THREE.Mesh(blockGeometry, Material);
		 scene.add(leftPaddle);
		 leftPaddle.position.set(-20.75,0,0); //xyz
		 objects.push(leftPaddle);
		 leftPaddle.name = "Left";
		 
		 blockGeometry = new THREE.PlaneGeometry(1.5,9,0);
		 Material = new THREE.MeshBasicMaterial({color: 0xffffff}); //RGB
		 rightPaddle = new THREE.Mesh(blockGeometry, Material);
		 scene.add(rightPaddle);
		 rightPaddle.position.set(20.75,0,0); //xyz
		 objects.push(rightPaddle);
		 rightPaddle.name = "Right";
	 }
	
	 function load_Board(){
		 //Game_Status = "Ready";
		 //Middle of the Board Line
		 var loader = new THREE.TextureLoader();
		 loader.crossOrigin = true;
		 var T = loader.load( 'Images/PongLine.png' );
		 //var T = loader.load( 'Images/sunTexture.jpg' );
		 T.minFilter = THREE.LinearFilter;
		 var T1 =  new THREE.SpriteMaterial( { map: T, color: 0xffffff } );
		 PongLine = new THREE.Sprite(T1);
		 scene.add(PongLine);
		 PongLine.position.set( -0.25, -5, -1);
		 PongLine.scale.set(10,37,1);
		 //console.log(PongLine);
		 
		 //Load Board
		 var planeGeometry = new THREE.PlaneBufferGeometry (47, 36,0);
		 var planeMaterial = new THREE.MeshBasicMaterial({color: 0x000000}); //RGB
		 Board = new THREE.Mesh(planeGeometry, planeMaterial);
		 Board.position.set(0,-5,-2); //xyz
		 scene.add(Board);

		 //Outline
		 var OutlineGeometry = new THREE.PlaneBufferGeometry (49, 38,0);
		 var OutlineMaterial = new THREE.MeshBasicMaterial({color: 0xffffff}); //RGB
		 Outline = new THREE.Mesh(OutlineGeometry, OutlineMaterial);
		 Outline.position.set(0,-5,-3); //xyz
		 scene.add(Outline);
	 }

	 function load_Buttons(){
		 //Change Background Button
		 backgroundButton = new THREEx.DynamicText2DObject()
		 backgroundButton.parameters.text= "Change Background";
		 backgroundButton.parameters.font= "85px Arial";
		 backgroundButton.parameters.fillStyle= "White";
		 backgroundButton.parameters.align = "center";
		 backgroundButton.dynamicTexture.canvas.width = 1024;
		 backgroundButton.dynamicTexture.canvas.height = 256;
		 backgroundButton.position.set(12,17.5,5);
		 backgroundButton.scale.set(15,5,1);
		 backgroundButton.update();
		 scene.add(backgroundButton);
		 objects.push(backgroundButton);
		 
		 var loader = new THREE.TextureLoader();
		 loader.crossOrigin = true;
		 
		 //Display Zero
		 Board0 = new THREE.MeshBasicMaterial({color: 0x000000})
		 Ball0 = new THREE.MeshBasicMaterial({color: 0xffffff}); //RGB
		 
		 //Display One
		 var B = loader.load( 'Images/soccerField.jpg' );
		 B.minFilter = THREE.LinearFilter;
		 var Board1 =  new THREE.MeshBasicMaterial( { map: B, color: 0xffffff } );
		 
		 B = loader.load( 'Images/soccerball.png' );
		 B.minFilter = THREE.LinearFilter;
		 var Ball1 =  new THREE.MeshBasicMaterial( { map: B, color: 0xffffff } );
		 
		 background = {
			 backgroundNumber: 0,
			 //0 - Default
			 zeroDisplay:Board0,
			 zeroBall: Ball0,
			 //1
			 oneDisplay:Board1,
			 oneBall:Ball1
			 //2
			 //3
			 //4
			 //5
		 };
	 }

	 function updateBackground(){
		 if(background.backgroundNumber == 0){
			 Board.material = background.oneDisplay;
			 ball.material = background.oneBall;
			 background.backgroundNumber = 1;
		 }
		 else if(background.backgroundNumber == 1){
			 Board.material = background.zeroDisplay;
			 ball.material = background.zeroBall;
			 ball.rotation.z =0;
			 background.backgroundNumber = 0;
		 }		 
	 }
	 
}

window.onload = init;	
//window.onload = setup;	