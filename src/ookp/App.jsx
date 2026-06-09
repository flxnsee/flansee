import { useState, useEffect } from 'react'
import { questions } from './data/questions.js'
import { buildTicket } from './utils/ticket.js'
import Start from './components/Start.jsx'
import Quiz from './components/Quiz.jsx'
import Results from './components/Results.jsx'

const STORAGE_KEY = 'ookp-trainer-state-v1'
const TICKET_SIZE = 20

export default function App() {
  // screen: 'start' | 'quiz' | 'results'
  const [screen, setScreen] = useState('start')
  const [ticket, setTicket] = useState(null)
  // answers: { [questionId]: number[] (обрані idx) }
  const [answers, setAnswers] = useState({})

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
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ screen, ticket, answers }))
    } catch {
      /* сховище недоступне — не критично */
    }
  }, [screen, ticket, answers])

  function startTicket(topic, mode) {
    const pool = topic === 'all' ? questions : questions.filter((q) => q.topic === topic)
    const newTicket =
      mode === 'all'
        ? buildTicket(pool, pool.length, { ordered: true })
        : buildTicket(pool, TICKET_SIZE)
    setTicket(newTicket)
    setAnswers({})
    setScreen('quiz')
  }

  function setAnswer(questionId, selected) {
    setAnswers((prev) => ({ ...prev, [questionId]: selected }))
  }

  function finishQuiz() {
    setScreen('results')
  }

  function backToStart() {
    setScreen('start')
    setTicket(null)
    setAnswers({})
  }

  // Новий білет із тих самих питань, що були неправильні.
  function retryWrong(wrongQuestions) {
    if (!wrongQuestions.length) return
    setTicket(buildTicket(wrongQuestions, wrongQuestions.length))
    setAnswers({})
    setScreen('quiz')
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="env-tag">ООКП</span>
        <h1>Тренажер до екзамену</h1>
        <p className="subtitle">// білети по {TICKET_SIZE} випадкових питань</p>
      </header>

      {screen === 'start' && <Start onStart={startTicket} total={questions.length} />}

      {screen === 'quiz' && ticket && (
        <Quiz
          ticket={ticket}
          answers={answers}
          onAnswer={setAnswer}
          onFinish={finishQuiz}
          onExit={backToStart}
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
  )
}
