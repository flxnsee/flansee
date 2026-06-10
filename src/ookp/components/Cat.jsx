import { useState, useEffect, useRef } from 'react'

// Чорний піксельний котик за референсом користувача: сидячий, анфас, великі
// білі очі з величезними зіницями і відблиском, рожевий носик, хвіст загнутий
// догори. Визирає з-за ПРАВОГО краю картки, тримаючись лапками за межу
// (лапки — окремий шар поверх рамки, тіло — під карткою).
//
// Поведінка: хвіст метеляється, кліпає, смикає вухом, зіниці стежать за
// курсором, засинає без активності (Zzz), реагує на mood з App, гладиться
// кліком, при наведенні висовується більше, зрідка ховається і визирає знову.

const DY = 3 // зсув тіла вниз — верхні рядки під сердечко/«...»/Zzz

const C = {
  k: 'var(--ink)', // шерсть (теплий чорний)
  d: '#15130f', // темніше: внутрішнє вухо, розділення лап
  l: '#3d3933', // світлий відблиск шерсті
  p: '#d98a96', // рожевий носик
}
const EYE_WHITE = '#fbf8f2'
const SHINE = '#ffffff'
const HEART_C = '#d98a96'

// Вуха (рядки 0..3 тіла). 24 символи завширшки.
const EARS_NORMAL = [
  '...kk............kk.....',
  '...kkk..........kkk.....',
  '...kdkk........kkdk.....',
  '..kkddkk......kkddkk....',
]
const EARS_TWITCH = [
  '...kk...................',
  '...kkk..........kk......',
  '...kdkk........kkkk.....',
  '..kkddkk......kkddkk....',
]
const EARS_FLAT = [
  '........................',
  '..kk..............kk....',
  '.kkkk............kkkk...',
  '.kkddk..........kddkk...',
]

// Тіло від маківки до лап (рядки 4..25). Очі/ніс — окремі оверлеї.
const BODY = [
  '..kkkkkkkkkkkkkkkkkk....',
  '.kkllkkkkkkkkkkkkkkkk...',
  '.kkkkkkkkkkkkkkkkkkkk...',
  '.kkkkkkkkkkkkkkkkkkkk...',
  '.kkkkkkkkkkkkkkkkkkkk...',
  '.kkkkkkkkkkkkkkkkkkkk...',
  '.kkkkkkkkkkkkkkkkkkkk...',
  '.kkkkkkkkkkkkkkkkkkkk...',
  '.kkkkkkkkkkkkkkkkkkkk...',
  '..kkkkkkkkkkkkkkkkkk....',
  '..kkkkkkkkkkkkkkkkkk....',
  '...kkkkkkkkkkkkkkkk.....',
  '....kkkkkkkkkkkkkk......',
  '....kkkkkkkkkkkkkk......',
  '....kkkkkkkkkkkkkk......',
  '...kkkkkkkkkkkkkkkk.....',
  '...kkkkkkkkkkkkkkkk.....',
  '...kkllkdkkkkkkkkkk.....',
  '...kkllkdkkkkkkkkkk.....',
  '...kkkkkdkkkkkkkkkk.....',
  '...kkkkkdkkkkkkkkkk.....',
  '...kkkkk.kkkkk.kkkk.....',
]

// Хвіст — 3 кадри помаху (точки x,y у координатах тіла без DY).
const TAILS = [
  [[20, 24], [21, 23], [22, 22], [22, 21], [23, 20], [23, 19], [23, 18], [23, 17], [23, 16], [22, 15], [22, 14], [21, 13], [21, 12]],
  [[20, 24], [21, 23], [22, 22], [22, 21], [23, 20], [23, 19], [23, 18], [23, 17], [22, 16], [22, 15], [22, 14], [22, 13]],
  [[20, 24], [21, 23], [22, 22], [23, 21], [23, 20], [23, 19], [23, 18], [22, 17], [22, 16], [22, 15]],
]

// Оверлеї (абсолютні координати в viewBox, без DY) — праворуч, бо видно
// саме правий бік кота.
const HEART = [[18, 0], [20, 0], [17, 1], [18, 1], [19, 1], [20, 1], [21, 1], [18, 2], [19, 2], [20, 2], [19, 3]]
const DOTS = [[17, 1], [19, 1], [21, 1]]
const ZZZ = [[16, 0], [17, 0], [18, 0], [17, 1], [16, 2], [17, 2], [18, 2], [20, 1], [21, 1], [20, 2], [21, 2]]

// Очі: білі 5×4, зіниця 3×3 рухається в межах, відблиск 1 px.
const EYES = [
  { x: 4, y: 7 },
  { x: 13, y: 7 },
]
const NOSE = [[10, 11], [11, 11]]

// Лапки, що тримаються за край картки (окремий svg поверх рамки).
const PAW = ['kkkkk', 'kkkkk', '.d.d.']

function r1(x, y, fill, key) {
  return <rect key={key} x={x} y={y} width="1" height="1" fill={fill} />
}

function mapToRects(rows, prefix, dy) {
  const out = []
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch !== '.') out.push(r1(x, y + dy, C[ch], `${prefix}-${x}-${y}`))
    }
  })
  return out
}

function pointsToRects(points, fill, prefix, dy = 0) {
  return points.map(([x, y], i) => r1(x, y + dy, fill, `${prefix}-${i}`))
}

export default function Cat({ mood }) {
  const [tick, setTick] = useState(0)
  const [blink, setBlink] = useState(false)
  const [twitch, setTwitch] = useState(false)
  const [sleeping, setSleeping] = useState(false)
  const [hiding, setHiding] = useState(false)
  const [pupil, setPupil] = useState({ dx: -1, dy: 1 }) // за замовч. дивиться на користувача
  const [reaction, setReaction] = useState(null)
  const [pet, setPet] = useState(false)
  const lastActivity = useRef(Date.now())
  const wrapRef = useRef(null)
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  // Кадровий тікер + випадкові кліпання/смикання + перевірка сну.
  useEffect(() => {
    if (reducedMotion.current) return
    const id = setInterval(() => {
      setTick((t) => t + 1)
      setSleeping(Date.now() - lastActivity.current > 45000)
      if (Math.random() < 1 / 12) {
        setBlink(true)
        setTimeout(() => setBlink(false), 300)
      }
      if (Math.random() < 1 / 24) {
        setTwitch(true)
        setTimeout(() => setTwitch(false), 700)
      }
    }, 350)
    return () => clearInterval(id)
  }, [])

  // Peek-цикл: зрідка ховається за картку й визирає знову.
  useEffect(() => {
    if (reducedMotion.current) return
    let hideTimer
    let showTimer
    function schedule() {
      hideTimer = setTimeout(() => {
        setHiding(true)
        showTimer = setTimeout(() => {
          setHiding(false)
          schedule()
        }, 2600)
      }, 25000 + Math.random() * 35000)
    }
    schedule()
    return () => {
      clearTimeout(hideTimer)
      clearTimeout(showTimer)
    }
  }, [])

  // Зіниці стежать за курсором + активність будить котика.
  useEffect(() => {
    let last = 0
    function onMove(e) {
      lastActivity.current = Date.now()
      const now = Date.now()
      if (now - last < 60) return
      last = now
      const rect = wrapRef.current?.getBoundingClientRect()
      if (!rect) return
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      setPupil({
        dx: e.clientX < cx - 40 ? -1 : e.clientX > cx + 40 ? 1 : 0,
        dy: e.clientY < cy - 40 ? -1 : 1,
      })
    }
    function onActivity() {
      lastActivity.current = Date.now()
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('keydown', onActivity)
    window.addEventListener('touchstart', onActivity)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('keydown', onActivity)
      window.removeEventListener('touchstart', onActivity)
    }
  }, [])

  // Реакція на mood з App.
  useEffect(() => {
    if (!mood) {
      setReaction(null)
      return
    }
    setReaction(mood.type)
    const t = setTimeout(() => setReaction(null), mood.type === 'party' ? 4000 : 2200)
    return () => clearTimeout(t)
  }, [mood])

  function onPet() {
    lastActivity.current = Date.now()
    setSleeping(false)
    setHiding(false)
    setPet(true)
    setTimeout(() => setPet(false), 1400)
  }

  const sad = reaction === 'sad' || reaction === 'meh'
  const ears = sad ? EARS_FLAT : twitch ? EARS_TWITCH : EARS_NORMAL
  const fur = [...ears, ...BODY]
  const tailFrame = sleeping ? TAILS[1] : TAILS[tick % TAILS.length]
  // хвіст 2 пкс завтовшки, як на референсі
  const tail = tailFrame.flatMap(([x, y]) => [[x, y], [x - 1, y]])
  const eyesClosed = sleeping || blink
  const showHeart = pet || reaction === 'happy' || reaction === 'party'
  const stateClass = pet
    ? 'cat-pet'
    : reaction
      ? `cat-${reaction}`
      : sleeping
        ? 'cat-sleep'
        : 'cat-idle'

  // Очі: великі білі з величезними зіницями + відблиск (як на референсі).
  // Зіниця 3×3 у білку 5×4: x ∈ {ex, ex+1, ex+2}, y ∈ {ey, ey+1}.
  const eyeEls = []
  if (!eyesClosed) {
    EYES.forEach((e, i) => {
      const ex = e.x
      const ey = e.y + DY
      const pxx = ex + 1 + pupil.dx
      const pyy = ey + (pupil.dy > 0 ? 1 : 0)
      eyeEls.push(<rect key={`ew-${i}`} x={ex} y={ey} width="5" height="4" fill={EYE_WHITE} />)
      eyeEls.push(<rect key={`ep-${i}`} x={pxx} y={pyy} width="3" height="3" fill={C.k} />)
      eyeEls.push(r1(pxx, pyy, SHINE, `es-${i}`))
    })
  }

  return (
    <div
      ref={wrapRef}
      className={`cat-wrap ${stateClass} ${hiding ? 'cat-hiding' : ''}`}
      aria-hidden="true"
    >
      <div className="pixel-cat">
        <svg viewBox="0 0 24 30" onClick={onPet}>
          {pointsToRects(tail, C.k, 'tail', DY)}
          {mapToRects(fur, 'fur', DY)}
          {eyeEls}
          {pointsToRects(NOSE, C.p, 'nose', DY)}
          {showHeart && pointsToRects(HEART, HEART_C, 'heart')}
          {sad && pointsToRects(DOTS, C.k, 'dots')}
          {sleeping && pointsToRects(ZZZ, C.k, 'zzz')}
        </svg>
      </div>
      <div className="cat-paws">
        {/* дві лапки поряд, пальчики загинаються вниз через верхню межу */}
        <svg viewBox="0 0 13 3" onClick={onPet}>
          {mapToRects(PAW, 'paw1', 0)}
          <g transform="translate(8,0)">{mapToRects(PAW, 'paw2', 0)}</g>
        </svg>
      </div>
    </div>
  )
}
