import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * Половина волоки в объёме: тело вращения с вырезанным каналом.
 *
 * Геометрия строится параметрически по тому же профилю, что и плоская схема,
 * — никаких скачанных моделей и вопросов с лицензией. Показывает ровно одно:
 * канал внутри изделия не цилиндрический, у него четыре разных участка.
 *
 * Грузится лениво отдельным чанком, останавливается вне экрана и полностью
 * отключается при prefers-reduced-motion.
 */

/** [радиус, высота] — тот же профиль, что в DieDiagram, в относительных единицах. */
const PROFILE: [number, number][] = [
  [1.0, 0.6],
  [1.0, -0.6],
  [0.26, -0.6],
  [0.16, -0.14],
  [0.16, -0.02],
  [0.3, 0.3],
  [0.42, 0.6],
]

/**
 * Цвет берётся только из токенов: дублировать значения в компоненте нельзя.
 * Запасное значение одно и намеренно нейтральное — оно означает «переменной нет»,
 * а не «вот такой у нас цвет».
 */
const MISSING = '#808080'

function cssColor(name: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!v && import.meta.env.DEV) console.warn('нет токена', name)
  return new THREE.Color(v || MISSING)
}

export default function DieViewer({ tone = 'dark' }: { tone?: 'paper' | 'dark' }) {
  const host = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const el = host.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    } catch {
      // Нет WebGL — оставляем текстовую заглушку, страница не ломается.
      setFailed(true)
      return
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = cssColor(tone === 'paper' ? '--three-bg-paper' : '--three-bg')

    const camera = new THREE.PerspectiveCamera(30, 16 / 11, 0.1, 100)
    camera.position.set(1.25, 0.85, 4.3)
    camera.lookAt(0, 0, 0)

    const points = PROFILE.map(([r, y]) => new THREE.Vector2(r, y))

    // Металличность держим умеренной: без карты окружения полностью
    // металлический материал отражать нечего, и деталь чернеет.
    const material = new THREE.MeshStandardMaterial({
      color: cssColor('--three-metal'),
      metalness: tone === 'paper' ? 0.2 : 0.35,
      roughness: tone === 'paper' ? 0.36 : 0.42,
      side: THREE.DoubleSide,
    })

    const group = new THREE.Group()

    // Поверхность вращения: половина оборота, чтобы был виден канал.
    const lathe = new THREE.LatheGeometry(points, 96, 0, Math.PI)
    group.add(new THREE.Mesh(lathe, material))

    /*
     * Плоскости среза — иначе половина выглядит как пустая скорлупа.
     * LatheGeometry разворачивает профиль вокруг Y, и оба среза ложатся
     * в плоскость x = 0. Профиль же строится в плоскости XY, поэтому его
     * нужно повернуть на четверть оборота, а не отражать по X.
     */
    const shape = new THREE.Shape(points)
    const cap = new THREE.ShapeGeometry(shape)
    cap.rotateY(-Math.PI / 2)
    const capA = new THREE.Mesh(cap, material)
    const capB = new THREE.Mesh(cap, material)
    capB.scale.z = -1
    group.add(capA, capB)

    // Тонкая подсветка кромок: контур того же профиля по обоим срезам.
    const edgeMat = new THREE.LineBasicMaterial({
      color: cssColor('--three-edge'),
      transparent: true,
      opacity: 0.6,
    })
    const closed = [...points, points[0]].map((p) => new THREE.Vector3(0, p.y, p.x))
    const edgeGeom = new THREE.BufferGeometry().setFromPoints(closed)
    const edgeA = new THREE.Line(edgeGeom, edgeMat)
    const edgeB = new THREE.Line(edgeGeom, edgeMat)
    edgeB.scale.z = -1
    group.add(edgeA, edgeB)

    group.rotation.x = 0.16
    group.scale.setScalar(0.94)
    scene.add(group)

    /*
     * На светлом листе одних направленных источников мало: неосвещённые бока
     * уходят в чёрный и деталь читается кляксой. Полусферический источник
     * подсвечивает их отражённым светом «от бумаги», как на съёмке в лайтбоксе.
     */
    const paper = tone === 'paper'
    const bounce = new THREE.HemisphereLight(
      cssColor(paper ? '--three-bg-paper' : '--three-fill'),
      cssColor('--three-bg'),
      paper ? 2.2 : 0.9,
    )
    scene.add(bounce)

    const key = new THREE.DirectionalLight(cssColor('--three-key'), paper ? 2.0 : 2.4)
    key.position.set(3, 4, 3)
    scene.add(key)

    const fill = new THREE.DirectionalLight(cssColor('--three-fill'), paper ? 1.4 : 1.1)
    fill.position.set(-3, 1, -2)
    scene.add(fill)

    // Контровой: отделяет силуэт от фона, иначе деталь сливается с листом.
    const rim = new THREE.DirectionalLight(cssColor('--three-edge'), paper ? 1.2 : 0.6)
    rim.position.set(-1, -2, -3)
    scene.add(rim)

    function resize() {
      const w = el!.clientWidth
      const h = el!.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    let raf = 0
    let visible = true
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
    })
    io.observe(el)

    const start = performance.now()
    function frame() {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      // Не полный оборот, а медленное покачивание: срез всё время смотрит
      // на зрителя, и канал остаётся читаемым.
      const t = (performance.now() - start) / 1000
      group.rotation.y = -0.34 + Math.sin(t * 0.26) * 0.34
      renderer.render(scene, camera)
    }

    if (reduced) {
      group.rotation.y = -0.34
      renderer.render(scene, camera)
    } else {
      frame()
    }

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      lathe.dispose()
      cap.dispose()
      edgeGeom.dispose()
      material.dispose()
      edgeMat.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [tone])

  return (
    <div className="lv-three" ref={host} aria-hidden="true">
      {failed && (
        <p className="lv-three__fallback">
          Схема сечения волоки. Объёмный просмотр недоступен в этом браузере.
        </p>
      )}
    </div>
  )
}
