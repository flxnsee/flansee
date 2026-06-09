const patternCodeItems = [
  ['Адаптер', 'image1.png'],
  ['Компонувальник', 'image2.png'],
  ['Декоратор', 'image3.png'],
  ['Фабричний метод', 'image4.png'],
  ['Мементо', 'image5.png'],
  ['Мементо', 'image6.png'],
  ['Мементо', 'image7.png'],
  ['Спостерігач', 'image8.png'],
  ['Прототип', 'image9.png'],
  ['Будівельник', 'image10.png'],
  ['Будівельник', 'image11.png'],
  ['Будівельник', 'image12.png'],
  ['Команда', 'image13.png'],
  ['Команда', 'image14.png'],
  ['Ланцюжок', 'image15.png'],
  ['Ітератор', 'image16.png'],
  ['Медіатор', 'image17.png'],
  ['Медіатор', 'image18.png'],
  ['Стан', 'image19.png'],
  ['Стан', 'image20.png'],
  ['Замісник', 'image21.png'],
  ['Замісник', 'image22.png'],
  ['Замісник', 'image23.png'],
  ['Прототип', 'image24.png'],
  ['Сінглтон', 'image25.png'],
  ['Міст', 'image26.png'],
  ['Сінглтон', 'image27.png'],
  ['Абстрактна фабрика', 'image28.png'],
  ['Легковаговик', 'image29.png'],
  ['Адаптер', 'image30.png'],
  ['Фасад', 'image31.png'],
  ['Міст', 'image32.png'],
  ['Легковаговик', 'image33.png'],
  ['Стратегія', 'image34.png'],
  ['Стратегія', 'image35.png'],
  ['Шаблон', 'image36.png'],
  ['Відвідувач', 'image37.png'],
  ['Міст', 'image38.png'],
]

const distractors = [
  'Адаптер',
  'Компонувальник',
  'Декоратор',
  'Фабричний метод',
  'Мементо',
  'Спостерігач',
  'Прототип',
  'Будівельник',
  'Команда',
  'Ланцюжок',
  'Ітератор',
  'Медіатор',
  'Стан',
  'Замісник',
  'Сінглтон',
  'Міст',
  'Абстрактна фабрика',
  'Легковаговик',
  'Фасад',
  'Стратегія',
  'Шаблон',
  'Відвідувач',
]

function makeOptions(answer, offset) {
  const options = [[answer, true]]
  let cursor = offset

  while (options.length < 4) {
    const candidate = distractors[cursor % distractors.length]
    if (candidate !== answer && !options.some(([text]) => text === candidate)) {
      options.push([candidate, false])
    }
    cursor += 5
  }

  return options
}

export const patternCodeQuestions = patternCodeItems.map(([answer, image], index) => ({
  id: `pat-code-${index + 1}`,
  topic: 'Патерни за кодом',
  question: 'Який патерн зображено у фрагменті коду на скріні?',
  image: `/ookp-pattern-code/${image}`,
  imageAlt: `Фрагмент коду для патерну ${answer}`,
  multi: false,
  options: makeOptions(answer, index),
  note: `Правильна відповідь: ${answer}.`,
}))
