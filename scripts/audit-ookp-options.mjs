// Аудит банку питань ООКП: ловить «підказку довжиною» — питання, де правильна
// відповідь помітно довша за дистрактори (студент вгадує без знань).
// Запуск: npm run audit:ookp   (вихідний код 1, якщо є порушники)
//
// Перевіряються лише одиночні (не multi) питання; pat-code-* пропускаються,
// бо їхні варіанти — реальні назви патернів і їхню довжину змінювати не можна.

import { questions } from '../src/ookp/data/questions.js'

const GAP_LIMIT = 25 // % — наскільки правильна відповідь може бути довшою за середній дистрактор

const offenders = []
let analysed = 0
let longestIsCorrect = 0

for (const q of questions) {
  if (q.multi || q.id.startsWith('pat-code-')) continue
  const opts = q.options.map(([text, correct]) => ({ text, correct }))
  const correct = opts.find((o) => o.correct)
  if (!correct) continue
  analysed++

  const distractLens = opts.filter((o) => !o.correct).map((o) => o.text.length)
  const avg = distractLens.reduce((a, b) => a + b, 0) / distractLens.length
  const gap = ((correct.text.length - avg) / avg) * 100

  if (correct.text.length >= Math.max(...distractLens)) longestIsCorrect++
  if (gap > GAP_LIMIT) offenders.push({ id: q.id, gap: Math.round(gap), correct: correct.text })
}

console.log(`Проаналізовано одиночних питань: ${analysed}`)
console.log(
  `Правильна відповідь — найдовша: ${longestIsCorrect} (${Math.round((longestIsCorrect / analysed) * 100)}%, випадковий рівень ~25%)`,
)

if (offenders.length) {
  console.log(`\nПорушники (правильна відповідь >${GAP_LIMIT}% довша за середній дистрактор):`)
  for (const o of offenders.sort((a, b) => b.gap - a.gap)) {
    console.log(`  ${o.id}  +${o.gap}%  «${o.correct}»`)
  }
  process.exit(1)
}
console.log('\nOK — підказки довжиною не виявлено.')
