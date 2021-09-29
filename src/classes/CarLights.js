import * as THREE from "three";

import fragmentShader from '../shaders/Light/fragmentShader.glsl'
import vertexShader from '../shaders/Light/vertexShader.glsl'

export default class CarLights {
  constructor() {
      this.bind()
  }

  init(scene, options, color, speed) {
      this.scene = scene
      this.color = color
      this.speed = speed

      let curve = new THREE.LineCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -1)
      )

      let baseGeometry = new THREE.TubeBufferGeometry(curve, 25, 1, 8, false)
      let instanced = new THREE.InstancedBufferGeometry().copy(baseGeometry)
      instanced.instanceCount = options.nPairs * 2
      
      let aOffset = []

      let sectionWidth = options.roadWidth / options.roadSections

      for (let i = 0; i < options.nPairs; i++ ) {
        let radius = 1.
        let section = i % 3

        let sectionX = section * sectionWidth - options.roadWidth / 2 + sectionWidth / 2
        let carWidth = 0.5 * sectionWidth
        let offsetX = 0.5 * Math.random()

        let offsetY = radius * 1.3

        let offsetZ = Math.random() * options.length

        aOffset.push(sectionX - carWidth / 2 + offsetX)
        aOffset.push(offsetY)
        aOffset.push(-offsetZ)

        aOffset.push(sectionX + carWidth / 2 + offsetX)
        aOffset.push(offsetY)
        aOffset.push(-offsetZ)
      }

      let aMetrics = []

      for (let i = 0; i < options.nPairs; i++) {
        let radius = Math.random() * 0.1 + 0.1

        let length = Math.random() * options.length * 0.08 + options.length * 0.02
        
        aMetrics.push(radius)
        aMetrics.push(length)

        aMetrics.push(radius)
        aMetrics.push(length)
      }
      instanced.setAttribute(
        'aMetrics',
        new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 2, false)
      )

      instanced.setAttribute(
        'aOffset',
        new THREE.InstancedBufferAttribute(new Float32Array(aOffset), 3, false)
      )

      // let material = new THREE.MeshBasicMaterial({ color: 0x545454 })
      const material = new THREE.ShaderMaterial({
        fragmentShader,
        vertexShader,
        uniforms: Object.assign(
          {
            uColor: { value: new THREE.Color( this.color )},
            uTravelLength: { value: options.length},
            uTime: { value: 0 },
            uSpeed: { value: this.speed }
          },
          options.distortion.uniforms
        )
        // side: THREE.DoubleSide
      })
      material.onBeforeCompile = shader => {
        shader.vertexShader = shader.vertexShader.replace(
          "#include <getDistortion_vertex>",
          options.distortion.getDistortion
        )
      } 

      let mesh = new THREE.Mesh(instanced, material)
      mesh.frustumCulled = false

      this.mesh = mesh

      this.scene.add(this.mesh)
  }

  update(t) {
    this.mesh.material.uniforms.uTime.value = t
  }

  bind() {

  }
}