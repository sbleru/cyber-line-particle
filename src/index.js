import { render } from 'react-dom'
import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import * as meshline from 'threejs-meshline'
import { extend, Canvas, useFrame, useThree } from '@react-three/fiber'
import './styles.css'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from '@react-three/postprocessing'

extend(meshline)

function Fatline({ curve, width, color, speed, opacity }) {
  const material = useRef()
  useFrame(() => (material.current.uniforms.dashOffset.value -= speed))
  return (
    <mesh>
      <meshLine attach="geometry" vertices={curve} />
      <meshLineMaterial
        attach="material"
        ref={material}
        transparent
        depthTest={false}
        lineWidth={width}
        color={color}
        dashArray={1}
        dashRatio={0.1}
        opacity={opacity}
      />
    </mesh>
  )
}

// TODO
//
function Lines({ count, colors }) {
  const boxOffset = 10
  const edgeCount = Math.cbrt(count)
  const lines = useMemo(() => {
    let z = 0
    let y = 0
    let x = 0
    return [...Array(count).keys()].map((i) => {
      const pos = new THREE.Vector3(x * boxOffset + 2 * Math.random(), y * boxOffset + 2 * Math.random(), z * boxOffset + 2 * Math.random())
      x++
      if (x % edgeCount === 0) {
        x = 0
        y++
      }
      if (x % edgeCount === 0 && y % edgeCount === 0) {
        y = 0
        z++
      }
      // return yArray.map((xArray, y) => {
      // const pos = new THREE.Vector3(10 - Math.random() * 20, 10 - Math.random() * 20, 10 - Math.random() * 20)
      // const points = new Array(30).fill().map(() => pos.add(new THREE.Vector3(4 - Math.random() * 8, 4 - Math.random() * 8, 2 - Math.random() * 4)).clone())
      // const pos = new THREE.Vector3(0, 0, 0)
      const points = [...Array(9).keys()].map((num) => {
        const baseLineRatio = 3
        switch (num) {
          case 0:
            return pos.clone()
          case 1:
            return pos.add(new THREE.Vector3(1 * baseLineRatio, 0, 0)).clone()
          case 2:
            return pos.add(new THREE.Vector3(0, 0, -1 * baseLineRatio)).clone()
          case 3:
            return pos.add(new THREE.Vector3(-1 * baseLineRatio, 0, 0)).clone()
          case 4:
            return pos.add(new THREE.Vector3(0, -1 * baseLineRatio, 0)).clone()
          case 5:
            return pos.add(new THREE.Vector3(1 * baseLineRatio, 0, 0)).clone()
          case 6:
            return pos.add(new THREE.Vector3(0, 0, 1 * baseLineRatio)).clone()
          case 7:
            return pos.add(new THREE.Vector3(-1 * baseLineRatio, 0, 0)).clone()
          case 8:
            return pos.add(new THREE.Vector3(0, 1 * baseLineRatio, 0)).clone()
          default:
            break
        }
        return null
      })
      const sp = points.splice(0, Math.floor(Math.random() * points.length))
      const renderPoints = points.concat(sp)
      const curve = new THREE.CatmullRomCurve3(renderPoints).getPoints(renderPoints.length - 1)
      return {
        color: colors[parseInt(colors.length * Math.random())],
        width: Math.max(0.2),
        speed: Math.max(0.004),
        curve
      }
      // })
    })
  }, [colors, count])
  return lines.map((props, index) => <Fatline key={index} {...props} />)
}

function Rig({ mouse }) {
  const { camera, viewport } = useThree()
  useFrame((state) => {
    camera.position.x += (state.mouse.x * viewport.width - camera.position.x) * 0.05
    camera.position.y += (-state.mouse.y * viewport.height - camera.position.y) * 0.05
    camera.lookAt(0, 0, 0)
  })
  return null
}

function App() {
  const colors = ['#FFFFFF']
  // const colors = ['#A2CCB6', '#FCEEB5', '#EE786E', '#e0feff', 'lightpink', 'lightblue'];
  return (
    <Canvas linear camera={{ position: [30, 30, 50], fov: 25 }}>
      <Lines count={1000} colors={colors} />
      {/* <Rig /> */}
      <OrbitControls />
      <EffectComposer>
        <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} height={480} />
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        <Noise opacity={0.02} />
        {/* <Vignette eskil={false} offset={0.1} darkness={1.1} /> */}
      </EffectComposer>
    </Canvas>
  )
}

render(<App />, document.querySelector('#root'))
