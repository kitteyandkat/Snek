//import 3js
import * as THREE from 'https://cdn.skypack.dev/three@0.136';
// import { PointerLockControls } from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/PointerLockControls.js';
//import firstperson controls from 3js
//import {FirstPersonControls} from 'https://cdn.skypack.dev/three@0.136/examples/jsm/controls/FirstPersonControls.js';
// import model loader from 3js
//import {GLTFLoader} from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';

let paused = true;
let startGame = false;
window.paused = paused;
let score = 0;
let speed = 1;
let endGame = false;
let gameOverScreen = document.querySelector(".game-over-container")


//set a variable for movement keys
const KEYS = {
    //   'left': 37,
    //   'down': 40,
    'up': 38,
    //   'right': 39,
};

// restrain variable between a and b
function clamp(x, a, b) {
    return Math.min(Math.max(x, a), b);
}

// gives a value between a and b based on x percentage
function lerp(a, b, x) {
    return a * (1.0 - x) + (b * x);
}

// helper function to calculate distance between 2 obj
function distance(obj1, obj2) {
    //a**2 + b** = distace
    //deltaX = a**
    //deltaY == b**
    let deltaX = (obj1.position.x - obj2.position.x) ** 2
    let deltaZ = (obj1.position.z - obj2.position.z) ** 2
    return Math.sqrt(deltaX + deltaZ);
}

class InputController {
    constructor(target) {
        this.target_ = target || document;
        this.initialize();
    }

    initialize() {
        this.current_ = {
            leftButton: false,
            rightButton: false,
            mouseXDelta: 0,
            mouseYDelta: 0,
            mouseX: 0,
            mouseY: 0,
        };
        this.previous_ = null;
        this.keys_ = {};
        this.previousKeys_ = {};
        this.target_.addEventListener('mousedown', (e) => this.onMouseDown_(e), false);
        this.target_.addEventListener('mousemove', (e) => this.onMouseMove_(e), false);
        this.target_.addEventListener('mouseup', (e) => this.onMouseUp_(e), false);
        this.target_.addEventListener('keydown', (e) => this.onKeyDown_(e), false);
        this.target_.addEventListener('keyup', (e) => this.onKeyUp_(e), false);
    }

    onMouseMove_(e) {
        this.current_.mouseX = e.pageX - window.innerWidth / 2;
        this.current_.mouseY = e.pageY - window.innerHeight / 2;

        if (this.previous_ === null) {
            this.previous_ = { ...this.current_ };
        }

        this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
        this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;
    }

    onMouseDown_(e) {
        this.onMouseMove_(e);

        switch (e.button) {
            case 0: {
                this.current_.leftButton = true;
                break;
            }
            case 2: {
                this.current_.rightButton = true;
                break;
            }
        }
    }

    onMouseUp_(e) {
        this.onMouseMove_(e);

        switch (e.button) {
            case 0: {
                this.current_.leftButton = false;
                break;
            }
            case 2: {
                this.current_.rightButton = false;
                break;
            }
        }
    }

    onKeyDown_(e) {
        this.keys_[e.keyCode] = true;
        if(e.key.toLowerCase() === 'w') this.keys_[38] = true;
    }

      onKeyUp_(e) {
        if(e.key.toLowerCase() === 'escape') {
            paused = !paused;
        }
    //     this.keys_[e.keyCode] = false;
      }

    key(keyCode) {
        return !!this.keys_[keyCode];
    }

    isReady() {
        return this.previous_ !== null;
    }

    update(_) {
        if (this.previous_ !== null) {
            this.current_.mouseXDelta = this.current_.mouseX - this.previous_.mouseX;
            this.current_.mouseYDelta = this.current_.mouseY - this.previous_.mouseY;

            this.previous_ = { ...this.current_ };
        }
    }
};

//create a class for the first person camera
class FirstPersonCamera {
    constructor(camera, objects) {
        this.camera = camera;
        window.camera = camera;
        // lock camera to window
        // window.controls = new PointerLockControls( camera, document.body );
        // const lockFN = () => {
        //     window.controls.lock();
        //     document.body.removeEventListener('click', lockFN);
        // }
        // document.body.addEventListener('click', lockFN);


        this.input_ = new InputController();
        this.rotation = new THREE.Quaternion();
        this.translation_ = new THREE.Vector3(0, 2, 0);
        this.phi = 0;
        this.phiSpeed = 8;
        this.theta = 0;
        this.thetaSpeed = 5;
        this.objects = objects;
    }
    //update the position of the camera
    update(timeElapsedS) {
        this.updateRotation(timeElapsedS);
        this.updateCamera(timeElapsedS);
        this.updateTranslation(timeElapsedS);
        this.input_.update(timeElapsedS);
    }

    updateCamera(_) {
        this.camera.quaternion.copy(this.rotation);
        this.camera.position.copy(this.translation_);

        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(this.rotation);

        const dir = forward.clone();

        forward.multiplyScalar(100);
        forward.add(this.translation_);

        let closest = forward;
        const result = new THREE.Vector3();
        const ray = new THREE.Ray(this.translation_, dir);
        for (let i = 0; i < this.objects.length; ++i) {
            if (ray.intersectBox(this.objects[i], result)) {
                if (result.distanceTo(ray.origin) < closest.distanceTo(ray.origin)) {
                    closest = result.clone();
                }
            }
        }

        this.camera.lookAt(closest);
    }


    updateTranslation(timeElapsedS) {
        //if game is paused snake shouldn't be moving
        if(this.input_.key(KEYS.up) && !startGame) {
            startGame = true;
            paused = false;
        }

        //setttting movement for forward and backwards
        const forwardVelocity = (this.input_.key(KEYS.up) ? 1 : 0)

        //setttting movement for left and right
        // const horizontalVelocity = (this.input_.key(KEYS.left) ? 1 : 0) + (this.input_.key(KEYS.right) ? -1 : 0)

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);
        
        if (paused || !startGame) {
            //move the snakehead's position to the camera's position
            const headForward = new THREE.Vector3(0, -.5, -1.5);
            headForward.applyQuaternion(qx);
            snakehead.position.copy(headForward.add(camera.position));
            return;
        }

        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyQuaternion(qx);
        forward.multiplyScalar(forwardVelocity * timeElapsedS * 10 * speed);

        // const left = new THREE.Vector3(-1, 0, 0);
        // left.applyQuaternion(qx);
        // left.multiplyScalar(horizontalVelocity * timeElapsedS * 10);
        // loop through snakeBody in reverse order
        // for (let i = 0; i < snakebody.length; i++) {
        for (let i = snakebody.length - 1; i >= 0; i--) {
            // grab current snek body
            const currentSnakeBody = snakebody[i]
            // grab next snakebody
            const nextSnakeBody = snakebody[i - 1] || snakehead;
            const nextPos = currentSnakeBody.position.lerp(nextSnakeBody.position, timeElapsedS * 10)
            currentSnakeBody.position.copy(nextPos);
        }
        this.translation_.add(forward);
        // this.translation_.add(left);

        //move the snakehead's position to the camera's position
        const headForward = new THREE.Vector3(0, -.5, -1.5);
        headForward.applyQuaternion(qx);
        snakehead.position.copy(headForward.add(camera.position));
        for (let i = snakebody.length - 2; i >= 0; i--) {
            // grab current snek body
            const currentSnakeBody = snakebody[i]
            // grab next snakebody
            if(distance(snakehead, currentSnakeBody) < .5) {
                console.log('gameover');
                paused = true;
                endGame = true;
                gameOverScreen.classList.remove('hidden');
            }
        }
    }

    updateRotation(timeElapsedS) {
        //set movement sensitivity
        const xh = this.input_.current_.mouseXDelta / window.innerWidth * 4;
        const yh = this.input_.current_.mouseYDelta / window.innerHeight;

        this.phi += -xh * this.phiSpeed;
        this.theta = clamp(this.theta + -yh * this.thetaSpeed, -Math.PI / 3, Math.PI / 3);

        const qx = new THREE.Quaternion();
        qx.setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.phi);
        const qz = new THREE.Quaternion();
        qz.setFromAxisAngle(new THREE.Vector3(1, 0, 0), this.theta);

        const q = new THREE.Quaternion();
        q.multiply(qx);
        q.multiply(qz);

        this.rotation.copy(q);
    }
}
class SnekBody {
    constructor(position) {
        this.mesh = new THREE.Mesh(
            new THREE.SphereGeometry(.1, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        // window.snakehead = snakehead
        this.mesh.position.copy(position);
        // snakehead.castShadow = true;
        // snakehead.receiveShadow = true;
        window.scene.add(this.mesh);
        snakebody.push(this.mesh)
    }
}
window.SnekBody = SnekBody;
const snakebody = [];
window.snakebody = snakebody;
window.Vector3 = THREE.Vector3;

class FirstPersonSnek {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.initializeRenderer();
        this.initializeLights();
        this.initializeScene();
        this.initializePostFX();
        this.initializeGame();

        for(let i = 0; i < 10; i++){
            new SnekBody(new THREE.Vector3(i * -1 - 1,1.5,0));
        }
        // new SnekBody(new THREE.Vector3(-2,1.5,0));

        this.previousRAF = null;
        // this.loadModel();
        this.raf();
        this.onWindowResize();
    }

    //   loadModel(){
    //     const loader = new GLTFLoader();
    //     loader.load('./resources/mr_and_mrs_snake/scene.gltf', (gltf) =>{
    //         gltf.scene.traverse(c => {
    //             c.castShadow = true;
    //         });
    //         this.scene.add(gltf.scene);
    //     });
    //   }

    initializeGame() {
        // this.controls = new FirstPersonControls(
        //     this.camera, this.threejs.domElement);
        // this.controls.lookSpeed = 0.8;
        // this.controls.movementSpeed = 5;

        this.fpsCamera = new FirstPersonCamera(this.camera, this.objects);
    }

    //initialize webgl renderer to display everything on the screen
    initializeRenderer() {
        this.threejs = new THREE.WebGLRenderer({
            antialias: false,
        });
        //enable shadows
        this.threejs.shadowMap.enabled = true;
        this.threejs.shadowMap.type = THREE.PCFSoftShadowMap;
        this.threejs.setPixelRatio(window.devicePixelRatio);
        this.threejs.setSize(window.innerWidth, window.innerHeight);
        this.threejs.physicallyCorrectLights = true;
        this.threejs.outputEncoding = THREE.sRGBEncoding;

        document.body.appendChild(this.threejs.domElement);

        //set screen size parameters
        window.addEventListener('resize', () => {
            this.onWindowResize();
        }, false);

        const fov = 60;
        const aspect = 1920 / 1080;
        const near = 1.0;
        const far = 1000.0;

        //create a camera that acts as snake's perspective
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this.camera.position.set(0, 2, 0);

        //create a scene which acts as a container for the 3D world
        this.scene = new THREE.Scene();
        window.scene = this.scene;

        this.uiCamera = new THREE.OrthographicCamera(
            -1, 1, 1 * aspect, -1 * aspect, 1, 1000);
        this.uiScene = new THREE.Scene();
    }

    // draw the skybox 
    initializeScene() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            //cube mapping
            './resources/skybox/posx.jpg',
            './resources/skybox/negx.jpg',
            './resources/skybox/posy.jpg',
            './resources/skybox/negy.jpg',
            './resources/skybox/posz.jpg',
            './resources/skybox/negz.jpg',
        ]);

        texture.encoding = THREE.sRGBEncoding;
        this.scene.background = texture;
        //load the ground texture for the plane
        const mapLoader = new THREE.TextureLoader();
        const maxAnisotropy = this.threejs.capabilities.getMaxAnisotropy();
        const meadow = mapLoader.load('resources/meadow.png');
        meadow.anisotropy = maxAnisotropy;
        meadow.wrapS = THREE.RepeatWrapping;
        meadow.wrapT = THREE.RepeatWrapping;
        meadow.repeat.set(32, 32);
        meadow.encoding = THREE.sRGBEncoding;
        //draw the plane
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 10, 10),
            new THREE.MeshStandardMaterial({ map: meadow }));
        plane.castShadow = false;
        plane.receiveShadow = true;
        //ensure the plane is facing up
        plane.rotation.x = -Math.PI / 2;
        //draw the grass by adding it to the scene
        this.scene.add(plane);

        //draw the treat
        const treat = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            this.loadMaterial('forest_floor-', 0.2));
        //globalize the variable
        window.treat = treat
        treat.position.set(10, 1.5, 0);
        treat.castShadow = true;
        treat.receiveShadow = true;
        this.scene.add(treat);

        //draw the snakehead
        const snakehead = new THREE.Mesh(
            new THREE.SphereGeometry(.1, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        window.snakehead = snakehead
        snakehead.position.set(8, 0, 0);
        snakehead.castShadow = true;
        snakehead.receiveShadow = true;
        this.scene.add(snakehead);
        //load the texture for the boundary wall
        const fencing = this.loadMaterial('woodframe1-', 4);

        //draw the walls
        const wall1 = new THREE.Mesh(
            new THREE.BoxGeometry(100, 100, 4),
            fencing);
        window.wall1 = wall1
        wall1.position.set(0, -40, -50);
        wall1.castShadow = true;
        wall1.receiveShadow = true;
        this.scene.add(wall1);

        const wall2 = new THREE.Mesh(
            new THREE.BoxGeometry(100, 100, 4),
            fencing);
        wall2.position.set(0, -40, 50);
        wall2.castShadow = true;
        wall2.receiveShadow = true;
        this.scene.add(wall2);

        const wall3 = new THREE.Mesh(
            new THREE.BoxGeometry(4, 100, 100),
            fencing);
        wall3.position.set(50, -40, 0);
        wall3.castShadow = true;
        wall3.receiveShadow = true;
        this.scene.add(wall3);

        const wall4 = new THREE.Mesh(
            new THREE.BoxGeometry(4, 100, 100),
            fencing);
        wall4.position.set(-50, -40, 0);
        wall4.castShadow = true;
        wall4.receiveShadow = true;
        this.scene.add(wall4);

        //  // create boundbox
        //  const wall1BB = new THREE.Box3( new THREE.Vector3(), new THREE.Vector3());
        //  wall1BB.setFromObject(wall1)
        //  console.log(wall1BB)
        // Create Boundbox using Box3 for each mesh in the scene so that we can
        // do some easy intersection tests.
        const meshes = [
            plane, treat, wall1, wall2, wall3, wall4];

        this.objects = [];

        for (let i = 0; i < meshes.length; ++i) {
            const b = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
            b.setFromObject(meshes[i]);
            this.objects.push(b);
            console.log(b)
        }
    }

    //lighting to simulate the sun casting shadows on the objects
    initializeLights() {
        const distance = 50.0;
        const angle = Math.PI / 4.0;
        const penumbra = 0.5;
        const decay = 1.0;

        //create a spotlight to simulate the sun
        let light = new THREE.SpotLight(
            0xFFFFFF, 100.0, distance, angle, penumbra, decay);
        light.castShadow = true;
        light.shadow.bias = -0.00001;
        light.shadow.mapSize.width = 4096;
        light.shadow.mapSize.height = 4096;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 100;

        light.position.set(25, 25, 0);
        light.lookAt(0, 0, 0);
        this.scene.add(light);

        const upColor = 0xFFFF80;
        const downColor = 0x808080;
        light = new THREE.HemisphereLight(upColor, downColor, 0.5);
        light.color.setHSL(0.6, 1, 0.6);
        light.groundColor.setHSL(0.095, 1, 0.75);
        light.position.set(0, 4, 0);
        this.scene.add(light);
    }

    //function for map textures downloaded from freepbr
    loadMaterial(name, tiling) {
        const mapLoader = new THREE.TextureLoader();
        const maxAnisotropy = this.threejs.capabilities.getMaxAnisotropy();

        const metalMap = mapLoader.load('resources/freepbr/' + name + 'metallic.png');
        metalMap.anisotropy = maxAnisotropy;
        metalMap.wrapS = THREE.RepeatWrapping;
        metalMap.wrapT = THREE.RepeatWrapping;
        metalMap.repeat.set(tiling, tiling);

        const albedo = mapLoader.load('resources/freepbr/' + name + 'albedo.png');
        albedo.anisotropy = maxAnisotropy;
        albedo.wrapS = THREE.RepeatWrapping;
        albedo.wrapT = THREE.RepeatWrapping;
        albedo.repeat.set(tiling, tiling);
        albedo.encoding = THREE.sRGBEncoding;

        const normalMap = mapLoader.load('resources/freepbr/' + name + 'normal.png');
        normalMap.anisotropy = maxAnisotropy;
        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        normalMap.repeat.set(tiling, tiling);

        const roughnessMap = mapLoader.load('resources/freepbr/' + name + 'roughness.png');
        roughnessMap.anisotropy = maxAnisotropy;
        roughnessMap.wrapS = THREE.RepeatWrapping;
        roughnessMap.wrapT = THREE.RepeatWrapping;
        roughnessMap.repeat.set(tiling, tiling);

        const material = new THREE.MeshStandardMaterial({
            metalnessMap: metalMap,
            map: albedo,
            normalMap: normalMap,
            roughnessMap: roughnessMap,
        });

        return material;
    }

    initializePostFX() {
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();

        this.uiCamera.left = -this.camera.aspect;
        this.uiCamera.right = this.camera.aspect;
        this.uiCamera.updateProjectionMatrix();

        this.threejs.setSize(window.innerWidth, window.innerHeight);
    }

    //render function to display the world
    raf() {
        //callback to create game loop
        requestAnimationFrame((t) => {
            if (this.previousRAF === null) {
                this.previousRAF = t;
            }

            this.step(t - this.previousRAF);
            this.threejs.autoClear = true;
            this.threejs.render(this.scene, this.camera);
            this.threejs.autoClear = false;
            this.threejs.render(this.uiScene, this.uiCamera);
            this.previousRAF = t;
            this.raf();
        });
    }


    step(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001;

        // this.controls.update(timeElapsedS);
        this.fpsCamera.update(timeElapsedS);

        // check distance between treat and camrra
        //if distance between the camera and the treat is < 2, move the treat toa random location
        if (distance(window.camera, window.treat) < 2) {
            //set a minimum and maximum value for the treat position to keep within walls
            let treatMin = -43;
            let treatMax = 43;
            //calculate a random position between the minimum and maximum treat location
            let randomPositionX = Math.random() * (treatMax - treatMin) + treatMin
            let randomPositionZ = Math.random() * (treatMax - treatMin) + treatMin
            console.log('atededit');
            //update the treat's location
            treat.position.set(randomPositionX, 2, randomPositionZ)
            
            new SnekBody(snakehead.position);
            console.log(snakebody);

            //if the random number is above or below
            // if (window.treat.position.x < -43 || window.treat.position.x > 43){
            //     treat.position.set(randomPosition, 2, 0)
            // }
            score++
            speed += .1;
            console.log(score)
        }
        //copy collision logic from 2d snek
        if (window.camera.position.x >= 45 || window.camera.position.x <= -45 || window.camera.position.z >= 45 || window.camera.position.z <= -45) {
            console.log('im out')
            paused = true;
            endGame = true;
            gameOverScreen.classList.remove('hidden');
        }

    }

}


let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new FirstPersonSnek();
});
