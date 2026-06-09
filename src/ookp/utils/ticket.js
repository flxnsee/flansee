// Допоміжні функції для формування білета та перевірки відповідей.

// Перемішування Фішера–Йейтса (повертає нову копію масиву).
export function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Формує білет: n питань із пулу, з перемішаними варіантами.
// За замовчуванням питання обираються випадково; з { ordered: true } —
// беруться в початковому порядку (згруповані за темами) для повного проходу.
// Кожне питання отримує власну перемішану копію options.
export function buildTicket(pool, n = 20, { ordered = false } = {}) {
  const base = ordered ? pool.slice() : shuffle(pool)
  const picked = base.slice(0, Math.min(n, pool.length))
  return picked.map((q) => ({
    ...q,
    options: shuffle(q.options).map((opt, idx) => ({
      idx,
      text: opt[0],
      correct: opt[1],
    })),
  }))
}

// Кількість правильних варіантів у питанні.
export function correctCount(question) {
  return question.options.filter((o) => o.correct).length
}

// Перевірка відповіді: повний збіг множини вибраних варіантів із множиною
// правильних. selected — масив idx обраних варіантів.
export function isQuestionCorrect(question, selected) {
  const correctIdx = question.options.filter((o) => o.correct).map((o) => o.idx)
  if (selected.length !== correctIdx.length) return false
  const sel = new Set(selected)
  return correctIdx.every((i) => sel.has(i))
}

// Підрахунок результату по всьому білету.
export function gradeTicket(ticket, answers) {
  let correct = 0
  for (const q of ticket) {
    if (isQuestionCorrect(q, answers[q.id] || [])) correct++
  }
  return { correct, total: ticket.length }
}
