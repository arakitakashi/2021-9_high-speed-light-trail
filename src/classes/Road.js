import * as THREE from "three"

import fragmentShader from '../shaders/Road/fragmentShader.glsl'
import vertexShader from '../shaders/Road/vertexShader.glsl'


class Road {
    constructor() {
        this.bind()
    }

    init(scene, options) {
        this.scene = scene

        const geometry = new THREE.PlaneBufferGeometry(
          options.width,
          options.length,
          20, 200
        )
        const material = new THREE.ShaderMaterial({
          fragmentShader,
          vertexShader,
          uniforms: Object.assign(
            {
              uColor: new THREE.Uniform(new THREE.Color(0x101012)),
              uTime: { value: 0 },
              uTravelLength: { value: options.length }
            },
            options.distortion.uniforms
          )
        })
        material.onBeforeCompile = shader => {
          shader.vertexShader = shader.vertexShader.replace(
            "#include <getDistortion_vertex>",
            options.distortion.getDistortion
          )
        }
        const mesh = new THREE.Mesh(geometry, material)

        mesh.rotation.x = -Math.PI / 2
        mesh.position.z = -options.length / 2

        this.mesh = mesh

        this.scene.add(this.mesh)
    }

    update(time) {
      this.mesh.material.uniforms.uTime.value = time
    }

    bind() {

    }
}

const _instance = new Road()
export default _instance