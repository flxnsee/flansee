import { useState } from 'react'
import { TOPICS, questions } from '../data/questions.js'

export default function Start({ onStart, total }) {
  const [topic, setTopic] = useState('all')
  const [practice, setPractice] = useState(false)

  const countFor = (t) => (t === 'all' ? total : questions.filter((q) => q.topic === t).length)

  return (
    <main className="card start">
      <p className="intro">
        Кожен білет містить 20 випадкових питань з усього переліку. Питання може
        мати <strong>одну або дві (чи більше)</strong> правильних відповідей — тоді
        зʼявляються прапорці. Обери тему (або «Усі теми») і починай.
      </p>

      <label className="field">
        <span>Тема:</span>
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="all">Усі теми ({total})</option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t} ({countFor(t)})
            </option>
          ))}
        </select>
      </label>

      <label className="check-field">
        <input
          type="checkbox"
          checked={practice}
          onChange={(e) => setPractice(e.target.checked)}
        />
        <span className="check-text">
          <strong>Навчальний режим</strong> — показувати відповідь і пояснення одразу
          після перевірки кожного питання
        </span>
      </label>

      <div className="start-actions">
        <button className="btn btn-primary btn-lg" onClick={() => onStart(topic, 'ticket', practice)}>
          Згенерувати білет (20 питань)
        </button>
        <button className="btn btn-lg" onClick={() => onStart(topic, 'all', practice)}>
          Пройти всі питання ({countFor(topic)})
        </button>
      </div>

      <p className="hint">
        «Білет» — 20 випадкових питань (як на іспиті). «Всі питання» — повний прохід
        по черзі за темами. У <strong>навчальному режимі</strong> після кнопки
        «Перевірити» одразу видно правильну відповідь; інакше (екзамен) бал і розбір
        зʼявляються лише наприкінці.
      </p>
    </main>
  )
}
