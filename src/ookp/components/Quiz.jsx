import { useState } from 'react'
import Question from './Question.jsx'
import { isQuestionCorrect } from '../utils/ticket.js'

export default function Quiz({
  ticket,
  answers,
  onAnswer,
  onFinish,
  onExit,
  practice = false,
  revealed = [],
  onReveal,
}) {
  const [current, setCurrent] = useState(0)
  const q = ticket[current]
  const total = ticket.length
  const answeredCount = ticket.filter((item) => (answers[item.id] || []).length > 0).length
  const isLast = current === total - 1

  // Навчальний режим: чи розкрите поточне питання + живий рахунок.
  const isRevealed = revealed.includes(q.id)
  const checkedCount = revealed.length
  const correctCount = revealed.filter((id) => {
    const item = ticket.find((t) => t.id === id)
    return item && isQuestionCorrect(item, answers[id] || [])
  }).length

  return (
    <main className="card quiz">
      <div className="quiz-top">
        <button className="btn btn-link" onClick={onExit}>
          ← Вийти
        </button>
        <span className="progress-label">
          {practice
            ? `Питання ${current + 1} / ${total} · перевірено ${checkedCount} · правильно ${correctCount}`
            : `Питання ${current + 1} / ${total} · відповіли на ${answeredCount}`}
        </span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      <Question
        question={q}
        selected={answers[q.id] || []}
        onChange={(sel) => onAnswer(q.id, sel)}
        review={practice && isRevealed}
      />

      <div className="quiz-nav">
        <button
          className="btn"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
        >
          Назад
        </button>

        {/* Навчальний режим: спочатку «Перевірити», далі — навігація */}
        {practice && !isRevealed ? (
          <button
            className="btn btn-primary"
            onClick={() => onReveal(q.id)}
            disabled={(answers[q.id] || []).length === 0}
          >
            Перевірити
          </button>
        ) : (
          <>
            {!isLast && (
              <button
                className="btn btn-primary"
                onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
              >
                Далі
              </button>
            )}
            {isLast && (
              <button className="btn btn-success" onClick={onFinish}>
                Завершити тест
              </button>
            )}
          </>
        )}
      </div>

      {/* Швидка навігація по номерах питань */}
      <div className="dots">
        {ticket.map((item, i) => {
          const answered = (answers[item.id] || []).length > 0
          // У навчальному режимі крапка показує результат перевірки (зелена/цегляна).
          let stateClass = ''
          if (practice) {
            if (revealed.includes(item.id)) {
              stateClass = isQuestionCorrect(item, answers[item.id] || []) ? 'dot-done' : 'dot-wrong'
            }
          } else if (answered) {
            stateClass = 'dot-done'
          }
          return (
            <button
              key={item.id}
              className={`dot ${stateClass} ${i === current ? 'dot-current' : ''}`}
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
