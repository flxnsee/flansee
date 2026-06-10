import { useState, useEffect } from 'react'
import { questions } from './data/questions.js'
import { buildTicket, isQuestionCorrect, gradeTicket } from './utils/ticket.js'
import Start from './components/Start.jsx'
import Quiz from './components/Quiz.jsx'
import Results from './components/Results.jsx'
import Cat from './components/Cat.jsx'

const STORAGE_KEY = 'ookp-trainer-state-v1'
const TICKET_SIZE = 20

export default function App() {
  // screen: 'start' | 'quiz' | 'results'
  const [screen, setScreen] = useState('start')
  const [ticket, setTicket] = useState(null)
  // answers: { [questionId]: number[] (обрані idx) }
  const [answers, setAnswers] = useState({})
  // practice === true -> навчальний режим (миттєвий фідбек після «Перевірити»)
  const [practice, setPractice] = useState(false)
  // revealed -> id питань, які вже «розкриті» в навчальному режимі
  const [revealed, setRevealed] = useState([])
  // настрій котика: { type: 'happy'|'sad'|'party'|'meh', ts } або null
  const [catMood, setCatMood] = useState(null)

  // Відновлення незавершеного білета з localStorage.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved.screen && saved.ticket) {
          setScreen(saved.screen)
          setTicket(saved.ticket)
          setAnswers(saved.answers || {})
          setPractice(saved.practice || false)
          setRevealed(saved.revealed || [])
        }
      }
    } catch {
      /* ігноруємо пошкоджений стан */
    }
  }, [])

  // Збереження стану.
  useEffect(() => {
    if (screen === 'start' || !ticket) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, ticket, answers, practice, revealed }))
    } catch {
      /* сховище недоступне — не критично */
    }
  }, [screen, ticket, answers, practice, revealed])

  function startTicket(topic, format, isPractice, shuffleAll) {
    const pool = topic === 'all' ? questions : questions.filter((q) => q.topic === topic)
    const newTicket =
      format === 'all'
        ? buildTicket(pool, pool.length, { ordered: !shuffleAll })
        : buildTicket(pool, TICKET_SIZE)
    setTicket(newTicket)
    setAnswers({})
    setPractice(!!isPractice)
    setRevealed([])
    setCatMood(null)
    setScreen('quiz')
  }

  function setAnswer(questionId, selected) {
    setAnswers((prev) => ({ ...prev, [questionId]: selected }))
  }

  // Розкрити правильну відповідь у навчальному режимі.
  function revealQuestion(questionId) {
    setRevealed((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]))
    // Реакція котика — лише тут (навчальний режим), тож в екзамені витоку немає.
    const q = ticket?.find((item) => item.id === questionId)
    if (q) {
      const ok = isQuestionCorrect(q, answers[questionId] || [])
      setCatMood({ type: ok ? 'happy' : 'sad', ts: Date.now() })
    }
  }

  function finishQuiz() {
    if (ticket) {
      const { correct, total } = gradeTicket(ticket, answers)
      setCatMood({ type: correct / total >= 0.75 ? 'party' : 'meh', ts: Date.now() })
    }
    setScreen('results')
  }

  function backToStart() {
    setScreen('start')
    setTicket(null)
    setAnswers({})
    setRevealed([])
    setCatMood(null)
  }

  // Новий білет із тих самих питань, що були неправильні (зберігаємо поточний режим).
  function retryWrong(wrongQuestions) {
    if (!wrongQuestions.length) return
    setTicket(buildTicket(wrongQuestions, wrongQuestions.length))
    setAnswers({})
    setRevealed([])
    setCatMood(null)
    setScreen('quiz')
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="env-tag">ООКП</span>
        <h1>Тренажер до екзамену</h1>
        <p className="subtitle">// білети по {TICKET_SIZE} випадкових питань</p>
      </header>

      <div className="stage">
        <Cat mood={catMood} />

        {screen === 'start' && <Start onStart={startTicket} total={questions.length} />}

        {screen === 'quiz' && ticket && (
          <Quiz
            ticket={ticket}
            answers={answers}
            onAnswer={setAnswer}
            onFinish={finishQuiz}
            onExit={backToStart}
            practice={practice}
            revealed={revealed}
            onReveal={revealQuestion}
          />
        )}

        {screen === 'results' && ticket && (
          <Results
            ticket={ticket}
            answers={answers}
            onNew={backToStart}
            onRetryWrong={retryWrong}
          />
        )}
      </div>
    </div>
  )
}
