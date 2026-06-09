import { useState } from 'react'
import Question from './Question.jsx'

export default function Quiz({ ticket, answers, onAnswer, onFinish, onExit }) {
  const [current, setCurrent] = useState(0)
  const q = ticket[current]
  const total = ticket.length
  const answeredCount = ticket.filter((item) => (answers[item.id] || []).length > 0).length
  const isLast = current === total - 1

  return (
    <main className="card quiz">
      <div className="quiz-top">
        <button className="btn btn-link" onClick={onExit}>
          ← Вийти
        </button>
        <span className="progress-label">
          Питання {current + 1} / {total} · відповіли на {answeredCount}
        </span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      <Question
        question={q}
        selected={answers[q.id] || []}
        onChange={(sel) => onAnswer(q.id, sel)}
        review={false}
      />

      <div className="quiz-nav">
        <button
          className="btn"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
        >
          Назад
        </button>

        {!isLast && (
          <button className="btn btn-primary" onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}>
            Далі
          </button>
        )}

        {isLast && (
          <button className="btn btn-success" onClick={onFinish}>
            Завершити тест
          </button>
        )}
      </div>

      {/* Швидка навігація по номерах питань */}
      <div className="dots">
        {ticket.map((item, i) => {
          const done = (answers[item.id] || []).length > 0
          return (
            <button
              key={item.id}
              className={`dot ${done ? 'dot-done' : ''} ${i === current ? 'dot-current' : ''}`}
              onClick={() => setCurrent(i)}
              title={`Питання ${i + 1}`}
            >
              {i + 1}
            </button>
          )
        })}
      </div>
    </main>
  )
}
