import * as THREE from "three"

// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import RAF from '../utils/RAF'
import config from '../utils/config'
import MyGUI from '../utils/MyGUI'

import Road from './Road'
import CarLights from './CarLights'

function lerp(current, target, speed = 0.1, limit = 0.001) {
  let change = (target - current) * speed
  if (Math.abs(change) < limit) {
    change = target - current
  }
  return change
}

const distortion_uniforms = {
  uDistortionX: { value: new THREE.Vector2(80, 1.8)},
  uDistortionY: { value: new THREE.Vector2(-40, 2.5)}
}

const distortion_vertex = `
  #define PI 3.14159265358979

  uniform vec2 uDistortionX;
  uniform vec2 uDistortionY;

  float nsin(float val) {
    return sin(val) * 0.5 + 0.5;
  }

  vec3 getDistortion(float progress) {
    progress = clamp(progress, 0., 1.);
    float xAmp = uDistortionX.r;
    float xFreq = uDistortionX.g;
    float yAmp = uDistortionY.r;
    float yFreq = uDistortionY.g;

    return vec3(
      xAmp * nsin(progress * PI * xFreq - PI / 2.),
      yAmp * nsin(progress * PI * yFreq - PI / 2.),
      0.
    );
  }
`

const myCustomDistortion = {
  uniforms: distortion_uniforms,
  getDistortion: distortion_vertex
}

class MainThreeScene {
    constructor() {
        this.bind()
        this.camera
        this.scene
        this.renderer
        this.controls

        this.speedUpTarget = 0
        this.speedUp = 0
        this.timeOffset = 0
        this.fovTarget = 90
        this.onMouseDown = this.onMouseDown.bind(this)
        this.onMouseUp = this.onMouseUp.bind(this)
    }

    onMouseDown(ev) {
      this.speedUpTarget = 4
      this.fovTarget = 140
    }

    onMouseUp(ev) {
      this.speedUpTarget = 0
      this.fovTarget = 90
    }

    init(container) {
        //RENDERER SETUP
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.debug.checkShaderErrors = true
        container.appendChild(this.renderer.domElement)

        container.addEventListener('mousedown', this.onMouseDown)
        container.addEventListener('mouseup', this.onMouseUp)
        container.addEventListener('mouseout', this.onMouseUp)

        //MAIN SCENE INSTANCE
        this.scene = new THREE.Scene()

        this.clock = new THREE.Clock()

        //CAMERA AND ORBIT CONTROLLER
        this.camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 10000)
        this.camera.position.set(0, 7, -5)
        // this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        // this.controls.enabled = config.controls
        // this.controls.maxDistance = 1500
        // this.controls.minDistance = 0

        // Road Class
        this.options = {
          width: 20,
          length: 400,
          nPairs: 50,
          roadWidth: 9,
          roadSections: 3,
          islandWidth: 2,
          distortion: myCustomDistortion
        }

        Road.init(this.scene, this.options)

        // CarLights Class
        this.leftLights = new CarLights()
        this.leftLights.init(this.scene, this.options, 0xff102a, 100)
        this.leftLights.mesh.position.setX(-this.options.roadWidth / 2 - this.options.islandWidth / 2)

        this.rightLights = new CarLights()
        this.rightLights.init(this.scene, this.options, 0xfafafa, -100)
        this.rightLights.mesh.position.setX(this.options.roadWidth / 2 + this.options.islandWidth / 2)


        MyGUI.hide()
        if (config.myGui)
            MyGUI.show()

        //RENDER LOOP AND WINDOW SIZE UPDATER SETUP
        window.addEventListener("resize", this.resizeCanvas)
        RAF.subscribe('threeSceneUpdate', this.update)
    }

    update() {
        this.renderer.render(this.scene, this.camera);
        let lastElapsedTime = 0
        let elapsedTime = this.clock.getElapsedTime()
        let deltaTime = elapsedTime - lastElapsedTime
        lastElapsedTime = elapsedTime

        let time = elapsedTime + this.timeOffset

        let delta = this.clock.getDelta()
        let coefficient = -60 * Math.log2(1 - 0.1)
        let lerpT = Math.exp(-coefficient * delta)

        this.speedUp += lerp(
          this.speedUp,
          this.speedUpTarget,
          lerpT,
          0.00001
        )

        console.log(delta)

        this.timeOffset += this.speedUp * deltaTime * 0.1

        this.leftLights.update(time)
        this.rightLights.update(time)
        Road.update(time)

        let fovChange = lerp(this.camera.fov, this.fovTarget, lerpT)
        if (fovChange !== 0) {
          this.camera.fov += fovChange * delta  * 6
          console.log(this.camera.fov)
          this.camera.updateProjectionMatrix()
        }
    }

    resizeCanvas() {
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
    }

    bind() {
        this.resizeCanvas = this.resizeCanvas.bind(this)
        this.update = this.update.bind(this)
        this.init = this.init.bind(this)
    }
}

const _instance = new MainThreeScene()
export default _instance