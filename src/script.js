import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'dat.gui'
import gsap, { random } from 'gsap'

// Debug

const gui = new dat.GUI()
const properties = {
    plane : {
        width:400,
        height:400,
        widthSegments:50,
        heightSegments:50
    }
}
gui.add(properties.plane,'width', 1, 500).onChange(generatePlane)
gui.add(properties.plane,'height', 1, 500).onChange(generatePlane)
gui.add(properties.plane,'widthSegments', 1, 100).onChange(generatePlane)
gui.add(properties.plane,'heightSegments',1,100).onChange(generatePlane)

function generatePlane() {
    console.log(planeMesh.geometry)
    planeMesh.geometry.dispose()
    planeMesh.geometry = new THREE.PlaneGeometry(properties.plane.width,properties.plane.height,properties.plane.widthSegments,properties.plane.heightSegments)


    const colors = [];
for(let i = 0; i<planeMesh.geometry.attributes.position.count; i++){
    colors.push(0,0.19,0.4);
}

planeMesh.geometry.setAttribute('color',new THREE.BufferAttribute(new Float32Array(colors) , 3 )); // rgb colours [0,0,0]


const {array} = planeMesh.geometry.attributes.position;

const randomValues = [];
for(let i = 0 ; i < array.length ; i += 3){
    const x = array[i];
    const y = array[i+1];
    const z = array[i+2];

    array[i+2] = z + (Math.random() -0.5) * 5;
    array[i+1] = y + (Math.random() -0.5) * 5;
    array[i] = x + (Math.random() -0.5) * 5;
    randomValues.push(Math.random() * Math.PI * 2);
    randomValues.push(Math.random() * Math.PI*2);
    randomValues.push(Math.random() * Math.PI*2);
}

//Duplicate array of original vertices
planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array;
//randomValues
planeMesh.geometry.attributes.position.randomValues = randomValues;


}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//Geometry

const planeGeometry = new THREE.PlaneGeometry(400,400,50,50);

const planeMaterial = new THREE.MeshPhongMaterial({
    //color:0xffff00,
    side: THREE.DoubleSide,
    flatShading: THREE.FlatShading,
    vertexColors: true
})
 

// Mesh

const planeMesh = new THREE.Mesh(planeGeometry,planeMaterial)
scene.add(planeMesh)
generatePlane();


// Lights
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.x = 0
light.position.y = 1
light.position.z = 1
scene.add(light)

const backLight = new THREE.DirectionalLight(0xffffff, 1)
backLight.position.x = 0
backLight.position.y = -1
backLight.position.z = -1
scene.add(backLight)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 50;

const raycaster = new THREE.Raycaster();
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha :true
})

new OrbitControls(camera,renderer.domElement); 

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


//const clock = new THREE.Clock()
const mouseCoordinates = {
    x:undefined,
    y:undefined
}
//Animate function

let frame  = 0;
function animate(){
    frame += 0.01;
    requestAnimationFrame(animate);
    renderer.render(scene,camera);
    raycaster.setFromCamera(mouseCoordinates , camera)
    
    const {array , originalPosition , randomValues} = planeMesh.geometry.attributes.position
    for(let i = 0; i<array.length; i+=3){
        //x movement
         array[i] = originalPosition[i] + Math.cos(frame + randomValues[i])*0.005;
         //y movement
         array[i+1] = originalPosition[i+1] + Math.sin(frame + randomValues[i+1])*0.005;
         //y movement
         array[i+2] = originalPosition[i+2] + Math.cos(frame + randomValues[i+2])*0.005;
    }
    planeMesh.geometry.attributes.position.needsUpdate = true;

    const intersects = raycaster.intersectObject(planeMesh);
    //console.log(intersects);

    if(intersects.length > 0){
       // intersects[0].object.geometry.attributes.color.setX(0,0);
       const vertices = intersects[0].object.geometry.attributes.color;
       
       //setx is r value of rgb
        //vertex 1
       vertices.setX(intersects[0].face.a,0.1);
       vertices.setY(intersects[0].face.a,0.5);
       vertices.setZ(intersects[0].face.a,1);
        //vertex 2
        vertices.setX(intersects[0].face.b,0.1);
        vertices.setY(intersects[0].face.b,0.5);
        vertices.setZ(intersects[0].face.b,1);
        //vertex 3
        vertices.setX(intersects[0].face.c,0.1);
        vertices.setY(intersects[0].face.c,0.5);
        vertices.setZ(intersects[0].face.c,1);

       vertices.needsUpdate = true;

        const initialColor = {
            r : 0,
            g : 0.19,
            b : 0.4
        }
        const hoverColor = {
            r : 0.1,
            g : 0.5,
            b : 1
        }

        gsap.to(hoverColor,{
            r : initialColor.r,
            g : initialColor.g,
            b : initialColor.b,
            onUpdate: () =>{
                 //vertex 1
       vertices.setX(intersects[0].face.a,hoverColor.r);
       vertices.setY(intersects[0].face.a,hoverColor.g);
       vertices.setZ(intersects[0].face.a,hoverColor.b);
        //vertex 2
        vertices.setX(intersects[0].face.b,hoverColor.r);
        vertices.setY(intersects[0].face.b,hoverColor.g);
        vertices.setZ(intersects[0].face.b,hoverColor.b);
        //vertex 3
        vertices.setX(intersects[0].face.c,hoverColor.r);
        vertices.setY(intersects[0].face.c,hoverColor.g);
        vertices.setZ(intersects[0].face.c,hoverColor.b);
        vertices.needsUpdate = true;
            }
        })

    }
}
animate();



addEventListener('mousemove',(event) =>{
    mouseCoordinates.x = (event.clientX / innerWidth)*2 -1;
    mouseCoordinates.y = -(event.clientY / innerHeight)*2 + 1;
     //console.log(mouseCoordinates);
})

//raycaster - tracks if we are over some object or not