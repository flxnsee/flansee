import { gradeTicket, isQuestionCorrect } from '../utils/ticket.js'
import Question from './Question.jsx'

export default function Results({ ticket, answers, onNew, onRetryWrong }) {
  const { correct, total } = gradeTicket(ticket, answers)
  const percent = Math.round((correct / total) * 100)
  const wrongQuestions = ticket
    .filter((q) => !isQuestionCorrect(q, answers[q.id] || []))
    // повертаємо до «сирого» формату options ([текст, correct]) для повторного білета
    .map((q) => ({
      ...q,
      options: q.options.map((o) => [o.text, o.correct]),
    }))

  let verdict = 'Є над чим попрацювати'
  if (percent >= 90) verdict = 'Чудовий результат!'
  else if (percent >= 75) verdict = 'Добре!'
  else if (percent >= 60) verdict = 'Непогано'

  return (
    <main className="card results">
      <div className="score">
        <div className="score-big">
          {correct} / {total}
        </div>
        <div className="score-percent">{percent}%</div>
        <div className="score-verdict">{verdict}</div>
      </div>

      <div className="results-actions">
        <button className="btn btn-primary" onClick={onNew}>
          Новий білет
        </button>
        <button
          className="btn"
          onClick={() => onRetryWrong(wrongQuestions)}
          disabled={wrongQuestions.length === 0}
        >
          Повторити неправильні ({wrongQuestions.length})
        </button>
      </div>

      <h2 className="review-title">Розбір білета</h2>
      <ol className="review-list">
        {ticket.map((q) => {
          const ok = isQuestionCorrect(q, answers[q.id] || [])
          return (
            <li key={q.id} className={`review-item ${ok ? 'ok' : 'no'}`}>
              <div className="review-badge">{ok ? 'Правильно' : 'Неправильно'}</div>
              <Question question={q} selected={answers[q.id] || []} onChange={() => {}} review={true} />
            </li>
          )
        })}
      </ol>

      <div className="results-actions">
        <button className="btn btn-primary" onClick={onNew}>
          Новий білет
        </button>
      </div>
    </main>
  )
}
