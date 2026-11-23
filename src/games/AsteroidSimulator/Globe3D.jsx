import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { drawTexture, PLANET_RADIUS_KM } from './planet.js'

const toVec = (lat, lon, r = 1) => {
  const la = (lat * Math.PI) / 180
  const phi = ((lon + 180) * Math.PI) / 180
  return new THREE.Vector3(-Math.cos(phi) * Math.cos(la) * r, Math.sin(la) * r, Math.sin(phi) * Math.cos(la) * r)
}
const fromVec = (p) => {
  const n = p.clone().normalize()
  const lat = (Math.asin(n.y) * 180) / Math.PI
  let phi = Math.atan2(n.z, -n.x)
  if (phi < 0) phi += Math.PI * 2
  return { lat, lon: (phi * 180) / Math.PI - 180 }
}

/** Three.js globe. Props: lat, lon, launch ({id, light, severe} | null), onPick, onFail, onImpact */
export default function Globe3D({ lat, lon, launch, onPick, onFail, onImpact }) {
  const mount = useRef(null)
  const api = useRef({})
  const cb = useRef({})
  cb.current = { onPick, onImpact }

  useEffect(() => {
    const el = mount.current
    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      onFail?.()
      return undefined
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)
    renderer.domElement.style.touchAction = 'none'
    renderer.domElement.setAttribute('aria-label', '3D globe. Click to choose an impact location, drag to rotate.')

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
    camera.position.set(0, 0, 4.2)

    const tex = new THREE.CanvasTexture(drawTexture(Object.assign(document.createElement('canvas'), { width: 512, height: 256 })))
    tex.colorSpace = THREE.SRGBColorSpace
    const globe = new THREE.Group()
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }))
    globe.add(earth)
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.04, 48, 32), new THREE.MeshBasicMaterial({ color: 0x66b3ff, transparent: true, opacity: 0.12, side: THREE.BackSide }))
    scene.add(atmo, globe)
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const sun = new THREE.DirectionalLight(0xffffff, 2.2)
    sun.position.set(5, 2, 4)
    scene.add(sun)

    const starGeo = new THREE.BufferGeometry()
    const sp = new Float32Array(900)
    for (let i = 0; i < 300; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(20 + Math.random() * 10)
      sp.set([v.x, v.y, v.z], i * 3)
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3))
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.06 }))
    scene.add(stars)

    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 12), new THREE.MeshBasicMaterial({ color: 0xff3b30 }))
    globe.add(marker)
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 1), new THREE.MeshStandardMaterial({ color: 0x8a7a66, roughness: 1, flatShading: true }))
    rock.visible = false
    globe.add(rock)
    const mkRing = (color) => {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 64), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }))
      m.visible = false
      globe.add(m)
      return m
    }
    const ringLight = mkRing(0xffb020)
    const ringSevere = mkRing(0xff3b30)

    const state = { rotY: 0.6, rotX: 0.25, dragging: false, moved: false, sx: 0, sy: 0, anim: null }
    globe.rotation.set(state.rotX, state.rotY, 0)

    function resize() {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const dom = renderer.domElement
    const down = (e) => { state.dragging = true; state.moved = false; state.sx = e.clientX; state.sy = e.clientY; dom.setPointerCapture(e.pointerId) }
    const move = (e) => {
      if (!state.dragging) return
      const dx = e.clientX - state.sx, dy = e.clientY - state.sy
      if (Math.abs(dx) + Math.abs(dy) > 3) state.moved = true
      state.sx = e.clientX; state.sy = e.clientY
      state.rotY += dx * 0.005
      state.rotX = Math.max(-1.2, Math.min(1.2, state.rotX + dy * 0.005))
    }
    const up = (e) => {
      state.dragging = false
      if (state.moved) return
      const r = dom.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      const hit = ray.intersectObject(earth)[0]
      if (hit) cb.current.onPick?.(fromVec(earth.worldToLocal(hit.point.clone())))
    }
    dom.addEventListener('pointerdown', down)
    dom.addEventListener('pointermove', move)
    dom.addEventListener('pointerup', up)

    let raf = 0
    let last = performance.now()
    const loop = (now) => {
      raf = requestAnimationFrame(loop)
      if (document.hidden) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!state.dragging && !state.anim && !reduce) state.rotY += dt * 0.08
      globe.rotation.set(state.rotX, state.rotY, 0)
      const a = state.anim
      if (a) {
        a.t += dt
        const p = Math.min(1, a.t / 1.4)
        if (p < 1) {
          rock.visible = true
          rock.position.copy(a.from).lerp(a.to, p * p)
          rock.rotation.x += dt * 4
        } else {
          rock.visible = false
          const k = Math.min(1, (a.t - 1.4) / 1.2)
          for (const [ring, size] of [[ringLight, a.light], [ringSevere, a.severe]]) {
            ring.visible = true
            ring.scale.setScalar(Math.max(0.001, size * k))
            ring.material.opacity = 0.9 * (1 - k * 0.4)
          }
          if (!a.fired) { a.fired = true; cb.current.onImpact?.() }
          if (k >= 1) state.anim = null
        }
      }
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(loop)

    api.current = {
      setMarker(la, lo) {
        const n = toVec(la, lo)
        marker.position.copy(n.clone().multiplyScalar(1.005))
        for (const r of [ringLight, ringSevere]) {
          r.position.copy(n.clone().multiplyScalar(1.006))
          r.lookAt(n.clone().multiplyScalar(3))
        }
      },
      fire(la, lo, light, severe, instant) {
        const n = toVec(la, lo)
        // rotate the globe so the target faces the camera
        state.rotY = Math.atan2(-n.x, n.z)
        state.rotX = Math.max(-1.2, Math.min(1.2, Math.asin(n.y)))
        const to = n.clone().multiplyScalar(1.02)
        const from = n.clone().multiplyScalar(4).add(new THREE.Vector3(1.5, 1.2, 0))
        ringLight.visible = ringSevere.visible = false
        state.anim = { t: instant ? 1.4 : 0, from, to, light, severe, fired: false }
      },
    }
    api.current.setMarker(lat, lon)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      dom.removeEventListener('pointerdown', down)
      dom.removeEventListener('pointermove', move)
      dom.removeEventListener('pointerup', up)
      scene.traverse((o) => {
        o.geometry?.dispose?.()
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose())
      })
      tex.dispose()
      renderer.dispose()
      renderer.forceContextLoss?.()
      dom.remove()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    api.current.setMarker?.(lat, lon)
  }, [lat, lon])
  useEffect(() => {
    if (!launch) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const s = (km) => Math.min(0.9, Math.max(0.02, km / PLANET_RADIUS_KM))
    api.current.fire?.(lat, lon, s(launch.light), s(launch.severe), reduce)
  }, [launch?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={mount} className="h-full w-full" />
}
