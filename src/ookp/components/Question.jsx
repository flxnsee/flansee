import { correctCount } from '../utils/ticket.js'

// Питання у режимі відповіді (review === false) або перегляду (review === true).
export default function Question({ question, selected, onChange, review }) {
  const multi = question.multi
  const need = correctCount(question)

  function toggle(idx) {
    if (review) return
    if (multi) {
      const set = new Set(selected)
      if (set.has(idx)) set.delete(idx)
      else set.add(idx)
      onChange([...set])
    } else {
      onChange([idx])
    }
  }

  return (
    <div className="question">
      <p className="q-text">{question.question}</p>
      <p className="q-meta">
        {multi ? `Оберіть варіанти (правильних: ${need})` : 'Оберіть один варіант'} ·{' '}
        <span className="q-topic">{question.topic}</span>
      </p>

      {question.image && (
        <figure className="q-image-wrap">
          <img className="q-image" src={question.image} alt={question.imageAlt || question.question} />
        </figure>
      )}

      <ul className="options">
        {question.options.map((opt) => {
          const checked = selected.includes(opt.idx)
          // підсвічування у режимі перегляду
          let cls = 'option'
          if (review) {
            if (opt.correct) cls += ' correct'
            else if (checked) cls += ' wrong'
            if (checked) cls += ' chosen'
          } else if (checked) {
            cls += ' chosen'
          }

          return (
            <li key={opt.idx}>
              <label className={cls}>
                <input
                  type={multi ? 'checkbox' : 'radio'}
                  name={question.id}
                  checked={checked}
                  onChange={() => toggle(opt.idx)}
                  disabled={review}
                />
                <span className="option-text">{opt.text}</span>
                {review && opt.correct && <span className="mark mark-ok">✓</span>}
                {review && !opt.correct && checked && <span className="mark mark-no">✗</span>}
              </label>
            </li>
          )
        })}
      </ul>

      {review && question.note && (
        <p className="note">
          <strong>Пояснення:</strong> {question.note}
        </p>
      )}
    </div>
  )
}
