import React, { useRef, useMemo, useState, useEffect } from 'react'
import ReactDOM from 'react-dom'

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import './styles.css'
import * as THREE from 'three'
const arr = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7]
const arraybuffer = new Uint32Array(arr)
const iIB = new THREE.InstancedInterleavedBuffer(arraybuffer, 2, 1) // this part is important
const attr1 = new THREE.InterleavedBufferAttribute(iIB, 1, 0)
const attr2 = new THREE.InterleavedBufferAttribute(iIB, 1, 1)
const geometry = new THREE.InstancedBufferGeometry().copy(new THREE.BoxGeometry(1, 1, 1))
geometry.instanceCount = 10
geometry.setAttribute('attr1', attr1)
geometry.setAttribute('attr2', attr2)
arraybuffer[0] = 0
let material = new THREE.MeshLambertMaterial({
  color: 0xff0000,
  //wireframe: true,
  onBeforeCompile: (shader) => {
    shader.vertexShader = `
      attribute uint attr1;
      attribute uint attr2;
      ${shader.vertexShader}
    `.replace(
      `#include <begin_vertex>`,
      `#include <begin_vertex>
        transformed.xy += vec2(attr1, attr2); // check, that it's working
      `
    )
  }
})
let left = true
let mesh = new THREE.Mesh(geometry, material)
function InstancedMesh() {
  const { scene, gl, camera } = useThree()
  useEffect(() => {
    scene.add(new THREE.AmbientLight(0x777777))
    let directional = new THREE.DirectionalLight(0x888888)
    directional.position.set(100, 10000, 700)
    console.log(camera)
    camera.position.set(0, 0, 20)
    scene.add(directional)
    const gridHelper = new THREE.GridHelper(100, 100)
    scene.add(gridHelper)
    scene.add(mesh)
  }, [])
  useFrame(() => {
    if (left === true) {
      if (arraybuffer[0] < 10) {
        arraybuffer[0] += 1
      } else {
        left = false
      }
    } else {
      if (arraybuffer[0] > 0) {
        arraybuffer[0] -= 1
      } else {
        left = true
      }
    }
    attr1.needsUpdate = true
  })
  return <scene />
}
function MainFunction() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas>
        <InstancedMesh />
      </Canvas>
    </div>
  )
}
ReactDOM.render(
  //Main function because of useState
  <MainFunction />,
  document.getElementById('root')
)
