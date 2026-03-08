import { useMemo, useState } from 'react'

const PUZZLE_SIZE = 4
const PUZZLE_TILE_COUNT = PUZZLE_SIZE * PUZZLE_SIZE
const TRAY_TILE_SIZE = 58
const HIDDEN_CODE = 'M8-NEXT-2026'
const PROMO_BY_ID = {
  '@test': 'PROMO-MARCH8-PLACEHOLDER',
}
const ANAGRAM_WORDS = [
  { answer: 'COMPOSER', hint: 'Команда, которая подготовила вам этот квест :)' },
  { answer: 'РОЗА', hint: 'Классический цветок любви' },
  { answer: 'ТЮЛЬПАН', hint: 'Весенний цветок родом из Голландии' },
]
const FLOWER_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ff9bd0"/>
      <stop offset="45%" stop-color="#ffd95f"/>
      <stop offset="100%" stop-color="#7bd7ff"/>
    </linearGradient>
    <radialGradient id="petal" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#ffc3e7"/>
      <stop offset="100%" stop-color="#db0f7c"/>
    </radialGradient>
    <radialGradient id="core" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#fff4a7"/>
      <stop offset="100%" stop-color="#ffad14"/>
    </radialGradient>
    <pattern id="texture" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="8" cy="8" r="2.5" fill="#ffffff" fill-opacity="0.35"/>
      <circle cx="30" cy="20" r="3" fill="#ff5ea8" fill-opacity="0.22"/>
      <circle cx="18" cy="33" r="2.2" fill="#7f4dff" fill-opacity="0.25"/>
    </pattern>
    <radialGradient id="bubbleA" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#ff63b3" stop-opacity="0.25"/>
    </radialGradient>
    <radialGradient id="bubbleB" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#fff6cf" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#ffc530" stop-opacity="0.3"/>
    </radialGradient>
  </defs>
  <rect width="640" height="640" fill="url(#bg)"/>
  <rect width="640" height="640" fill="url(#texture)"/>
  <circle cx="72" cy="86" r="52" fill="url(#bubbleA)"/>
  <circle cx="566" cy="92" r="47" fill="url(#bubbleB)"/>
  <circle cx="536" cy="552" r="56" fill="url(#bubbleA)"/>
  <circle cx="90" cy="540" r="44" fill="url(#bubbleB)"/>
  <path d="M0 620 L160 470 L290 640 Z" fill="#ff5aa8" fill-opacity="0.28"/>
  <path d="M640 620 L500 462 L350 640 Z" fill="#6a66ff" fill-opacity="0.26"/>
  <g transform="translate(320 310)">
    <ellipse rx="95" ry="205" fill="url(#petal)" transform="rotate(0)"/>
    <ellipse rx="95" ry="205" fill="url(#petal)" transform="rotate(45)"/>
    <ellipse rx="95" ry="205" fill="url(#petal)" transform="rotate(90)"/>
    <ellipse rx="95" ry="205" fill="url(#petal)" transform="rotate(135)"/>
    <circle r="85" fill="url(#core)"/>
  </g>
  <path d="M320 410 C305 470, 290 505, 300 560" stroke="#2f9a54" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="M318 462 C350 445, 386 450, 402 470 C372 487, 343 488, 318 462Z" fill="#45bf69"/>
  <path d="M302 515 C269 500, 244 500, 226 518 C253 538, 284 538, 302 515Z" fill="#37aa5a"/>
</svg>
`)}`

function normalizeWord(value) {
  return value.trim().toUpperCase().replaceAll('Ё', 'Е')
}

function shufflePuzzle() {
  const tiles = Array.from({ length: PUZZLE_TILE_COUNT }, (_, index) => index)
  for (let step = 0; step < 120; step += 1) {
    const first = Math.floor(Math.random() * PUZZLE_TILE_COUNT)
    let second = Math.floor(Math.random() * PUZZLE_TILE_COUNT)
    if (first === second) second = (second + 1) % PUZZLE_TILE_COUNT
    const temp = tiles[first]
    tiles[first] = tiles[second]
    tiles[second] = temp
  }
  return tiles
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function createTrayPieces() {
  return shufflePuzzle().map((tile, index) => ({
    tile,
    side: index % 2 === 0 ? 'left' : 'right',
    x: randomInt(6, 96),
    y: randomInt(6, 250),
    z: index + 1,
  }))
}

function shuffleWord(value) {
  const letters = value.split('')
  for (let i = letters.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = letters[i]
    letters[i] = letters[j]
    letters[j] = temp
  }
  return letters.join('')
}

function generateAnagrams(words) {
  return words.map((item) => {
    const normalized = normalizeWord(item.answer)
    let shuffled = normalized
    let attempts = 0
    while (shuffled === normalized && attempts < 20) {
      shuffled = shuffleWord(normalized)
      attempts += 1
    }
    if (shuffled === normalized) {
      shuffled = normalized.slice(1) + normalized[0]
    }
    return { ...item, shuffled }
  })
}

function makeCertificateCode(userId) {
  const cleanId = userId.replace('@', '').toUpperCase()
  const seed = cleanId
    .split('')
    .reduce((acc, char, index) => acc + char.charCodeAt(0) * (index + 1), 0)
  const checksum = String(seed % 10000).padStart(4, '0')
  return `CERT-8M-${cleanId || 'GUEST'}-${checksum}`
}

function getPromoCode(userId) {
  const normalized = userId.trim().toLowerCase()
  return PROMO_BY_ID[normalized] || makeCertificateCode(userId)
}

function App() {
  const [step, setStep] = useState(0)
  const [userId, setUserId] = useState('')
  const [idError, setIdError] = useState('')
  const [trayPieces, setTrayPieces] = useState(() => createTrayPieces())
  const [boardTiles, setBoardTiles] = useState(() => Array(PUZZLE_TILE_COUNT).fill(null))
  const [zCounter, setZCounter] = useState(100)
  const [hiddenAnswer, setHiddenAnswer] = useState('')
  const [hiddenError, setHiddenError] = useState('')
  const [showTask2Hint, setShowTask2Hint] = useState(false)
  const [anagrams] = useState(() => generateAnagrams(ANAGRAM_WORDS))
  const [anagramInput, setAnagramInput] = useState(() => Array(ANAGRAM_WORDS.length).fill(''))
  const [anagramError, setAnagramError] = useState('')
  const [copyMessage, setCopyMessage] = useState('')
  const promoCode = useMemo(() => getPromoCode(userId), [userId])
  const leftTrayPieces = trayPieces.filter((piece) => piece.side === 'left')
  const rightTrayPieces = trayPieces.filter((piece) => piece.side === 'right')

  const isPuzzleSolved = boardTiles.every((tile, index) => tile === index)

  const restartPuzzle = () => {
    setTrayPieces(createTrayPieces())
    setBoardTiles(Array(PUZZLE_TILE_COUNT).fill(null))
    setZCounter(100)
    setShowTask2Hint(false)
  }

  const handleStart = () => {
    const normalizedId = userId.trim().toLowerCase()

    if (!normalizedId.startsWith('@') || normalizedId.length < 2) {
      setIdError('Введите id в формате @ваш_ник')
      return
    }

    if (!Object.hasOwn(PROMO_BY_ID, normalizedId)) {
      setIdError('Такого пользователя нет в списке доступа')
      return
    }

    setUserId(normalizedId)
    setIdError('')
    restartPuzzle()
    setStep(1)
  }

  const makeTrayPosition = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const maxX = Math.max(0, rect.width - TRAY_TILE_SIZE)
    const maxY = Math.max(0, rect.height - TRAY_TILE_SIZE)
    return {
      x: clamp(event.clientX - rect.left - TRAY_TILE_SIZE / 2, 0, maxX),
      y: clamp(event.clientY - rect.top - TRAY_TILE_SIZE / 2, 0, maxY),
    }
  }

  const parseDragPayload = (event) => {
    const raw = event.dataTransfer.getData('text/plain')
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  const handleDragStart = (event, payload) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', JSON.stringify(payload))
  }

  const bringTrayPieceToFront = (tile) => {
    setZCounter((prev) => {
      const next = prev + 1
      setTrayPieces((pieces) =>
        pieces.map((piece) => (piece.tile === tile ? { ...piece, z: next } : piece)),
      )
      return next
    })
  }

  const tileStyle = (tile) => ({
    backgroundImage: `url("${FLOWER_IMAGE}")`,
    backgroundSize: `${PUZZLE_SIZE * 100}% ${PUZZLE_SIZE * 100}%`,
    backgroundPosition: `${(tile % PUZZLE_SIZE) * (100 / (PUZZLE_SIZE - 1))}% ${
      Math.floor(tile / PUZZLE_SIZE) * (100 / (PUZZLE_SIZE - 1))
    }%`,
  })

  const putTileBackToTray = (tile, side, x, y, z) => {
    setTrayPieces((pieces) => [...pieces, { tile, side, x, y, z }])
  }

  const handleBoardDrop = (slotIndex, event) => {
    event.preventDefault()
    const payload = parseDragPayload(event)
    if (!payload?.tile && payload?.tile !== 0) return

    const nextBoard = [...boardTiles]

    if (payload.from === 'tray') {
      const draggedPiece = trayPieces.find((piece) => piece.tile === payload.tile)
      if (!draggedPiece) return

      const replacedTile = nextBoard[slotIndex]
      nextBoard[slotIndex] = payload.tile
      setBoardTiles(nextBoard)
      setTrayPieces((pieces) => pieces.filter((piece) => piece.tile !== payload.tile))

      if (replacedTile !== null) {
        putTileBackToTray(replacedTile, draggedPiece.side, draggedPiece.x, draggedPiece.y, zCounter + 1)
        setZCounter((prev) => prev + 1)
      }
      return
    }

    if (payload.from === 'board') {
      const sourceIndex = boardTiles.indexOf(payload.tile)
      if (sourceIndex < 0 || sourceIndex === slotIndex) return

      const temp = nextBoard[sourceIndex]
      nextBoard[sourceIndex] = nextBoard[slotIndex]
      nextBoard[slotIndex] = temp
      setBoardTiles(nextBoard)
    }
  }

  const handleTrayDrop = (side, event) => {
    event.preventDefault()
    const payload = parseDragPayload(event)
    if (!payload?.tile && payload?.tile !== 0) return
    const position = makeTrayPosition(event)

    if (payload.from === 'tray') {
      setZCounter((prev) => {
        const next = prev + 1
        setTrayPieces((pieces) =>
          pieces.map((piece) =>
            piece.tile === payload.tile ? { ...piece, side, ...position, z: next } : piece,
          ),
        )
        return next
      })
      return
    }

    if (payload.from === 'board') {
      const sourceIndex = boardTiles.indexOf(payload.tile)
      if (sourceIndex < 0) return
      setBoardTiles((prev) => {
        const next = [...prev]
        next[sourceIndex] = null
        return next
      })
      setZCounter((prev) => {
        const next = prev + 1
        putTileBackToTray(payload.tile, side, position.x, position.y, next)
        return next
      })
    }
  }

  const submitHiddenCode = () => {
    if (hiddenAnswer.trim().toUpperCase() !== HIDDEN_CODE) {
      setHiddenError('Код неверный. Подсказка: откройте инспектор элемента.')
      return
    }

    setHiddenError('')
    setShowTask2Hint(false)
    setStep(3)
  }

  const submitAnagrams = () => {
    const isValid = anagrams.every(
      (item, index) => normalizeWord(anagramInput[index]) === normalizeWord(item.answer),
    )

    if (!isValid) {
      setAnagramError('Есть ошибки в анаграммах. Попробуйте ещё раз.')
      return
    }

    setAnagramError('')
    setStep(4)
  }

  const copyPromoCode = async () => {
    try {
      await navigator.clipboard.writeText(promoCode)
      setCopyMessage('Код скопирован в буфер обмена')
    } catch {
      setCopyMessage('Не удалось скопировать автоматически')
    }
  }

  return (
    <main className="scene">
      <section className="card">
        <p className="card-date">8 Марта</p>
        <h1>Праздничный квест-открытка</h1>
        <p className="subtitle">Пройди 3 задания и получи сертификат-код.</p>

        {step === 0 && (
          <div className="task">
            <h2>Шаг 1. Введи свой логин со Staff</h2>
            <input
              className="input"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              placeholder="@example"
            />
            {idError && <p className="error">{idError}</p>}
            <button className="btn" onClick={handleStart} type="button">
              Начать задания
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="task">
            <h2>Задание 1. Собери паззл-цветок 4x4</h2>
            <p className="task-text">
              Перетаскивай детали мышкой: из боковых зон в центр, между ячейками и обратно на бок.
            </p>
            <div className="puzzle-layout">
              <div
                className="puzzle-side"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleTrayDrop('left', event)}
              >
                {leftTrayPieces.map((piece) => (
                  <button
                    key={`left-${piece.tile}`}
                    className="puzzle-tile puzzle-piece"
                    draggable
                    onDragStart={(event) => handleDragStart(event, { from: 'tray', tile: piece.tile })}
                    onMouseDown={() => bringTrayPieceToFront(piece.tile)}
                    style={{ ...tileStyle(piece.tile), left: `${piece.x}px`, top: `${piece.y}px`, zIndex: piece.z }}
                    type="button"
                  />
                ))}
              </div>

              <div className="puzzle-board">
                {boardTiles.map((tile, index) => (
                  <button
                    key={`board-${index}`}
                    className={`puzzle-tile ${tile === null ? 'puzzle-slot' : ''}`}
                    draggable={tile !== null}
                    onDragStart={(event) => handleDragStart(event, { from: 'board', tile })}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleBoardDrop(index, event)}
                    style={tile === null ? undefined : tileStyle(tile)}
                    type="button"
                  />
                ))}
              </div>

              <div
                className="puzzle-side"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleTrayDrop('right', event)}
              >
                {rightTrayPieces.map((piece) => (
                  <button
                    key={`right-${piece.tile}`}
                    className="puzzle-tile puzzle-piece"
                    draggable
                    onDragStart={(event) => handleDragStart(event, { from: 'tray', tile: piece.tile })}
                    onMouseDown={() => bringTrayPieceToFront(piece.tile)}
                    style={{ ...tileStyle(piece.tile), left: `${piece.x}px`, top: `${piece.y}px`, zIndex: piece.z }}
                    type="button"
                  />
                ))}
              </div>
            </div>
            <button className="btn ghost" onClick={restartPuzzle} type="button">
              Перемешать заново
            </button>

            <button className="btn" onClick={() => setStep(2)} type="button">
              Готово, перейти к заданию 2
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="task">
            <h2>Задание 2. Найди код на странице</h2>
            <p className="task-text">
              На этой странице спрятан код. Нужно найти его и записать в форму.
            </p>
            <button className="btn ghost" onClick={() => setShowTask2Hint((prev) => !prev)} type="button">
              {showTask2Hint ? 'Скрыть подсказку' : 'Показать подсказку'}
            </button>
            {showTask2Hint && (
              <p className="task-hint">
                Подсказка: код спрятан в `div` с id `march8-secret` в самом начале `body`. Нужное значение лежит
                в тексте этого элемента.
              </p>
            )}
            <input
              className="input"
              value={hiddenAnswer}
              onChange={(event) => setHiddenAnswer(event.target.value)}
              placeholder="Введите найденный код"
            />
            {hiddenError && <p className="error">{hiddenError}</p>}
            <button className="btn" onClick={submitHiddenCode} type="button">
              Проверить и перейти к заданию 3
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="task">
            <h2>Задание 3. Угадайте анаграммы</h2>
            <div className="anagrams">
              {anagrams.map((item, index) => (
                <label key={`${item.answer}-${index}`} className="anagram-item">
                  <span>
                    {index + 1}. <b>{item.shuffled}</b> - {item.hint}
                  </span>
                  <input
                    className="input"
                    value={anagramInput[index]}
                    onChange={(event) => {
                      const next = [...anagramInput]
                      next[index] = event.target.value
                      setAnagramInput(next)
                    }}
                    placeholder="Ваш ответ"
                  />
                </label>
              ))}
            </div>
            {anagramError && <p className="error">{anagramError}</p>}
            <button className="btn" onClick={submitAnagrams} type="button">
              Завершить квест
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="task done">
            <h2>Поздравляем, {userId}!</h2>
            <p className="task-text">Все задания выполнены. Ваш сертификат:</p>
            <div className="certificate-wrap">
              <p className="certificate">{promoCode}</p>
              <button
                className="copy-icon-btn"
                onClick={copyPromoCode}
                title="Скопировать промокод"
                aria-label="Скопировать промокод"
                type="button"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="4" y="4" width="14" height="14" rx="2" ry="2" />
                  <rect x="9" y="9" width="11" height="11" rx="2" ry="2" />
                </svg>
              </button>
            </div>
            {copyMessage && <p className="task-text">{copyMessage}</p>}
            <p className="task-text">С праздником весны и красоты! 🌷</p>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
