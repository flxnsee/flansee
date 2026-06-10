import { useState, useEffect } from 'react'
import { correctCount } from '../utils/ticket.js'

// Питання у режимі відповіді (review === false) або перегляду (review === true).
export default function Question({ question, selected, onChange, review }) {
  const multi = question.multi
  const need = correctCount(question)
  // Лупа для скрінів коду (клік — збільшити на весь екран).
  const [zoomed, setZoomed] = useState(false)

  // Скидаємо лупу при переході до іншого питання.
  useEffect(() => setZoomed(false), [question.id])

  // Будь-яка клавіша закриває лупу й не зачіпає клавіатурну навігацію тесту.
  useEffect(() => {
    if (!zoomed) return
    function onKey(e) {
      // stopImmediatePropagation, бо обробник тесту висить на тому ж window —
      // звичайний stopPropagation його не зупинив би.
      e.stopImmediatePropagation()
      e.preventDefault()
      setZoomed(false)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [zoomed])

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
        <figure
          className="q-image-wrap"
          onClick={() => setZoomed(true)}
          title="Натисни, щоб збільшити"
        >
          <img className="q-image" src={question.image} alt={question.imageAlt || question.question} />
        </figure>
      )}

      {zoomed && (
        <div className="lightbox" onClick={() => setZoomed(false)}>
          <img src={question.image} alt={question.imageAlt || question.question} />
        </div>
      )}

      {question.code && (
        <pre className="q-code">
          <code>{question.code}</code>
        </pre>
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
