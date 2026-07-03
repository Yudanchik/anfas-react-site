import type { Project } from './project.types'

export const projects: readonly Project[] = [
  {
    slug: '2-murinskiy-37',
    title: '2-й Муринский, 37',
    type: 'Евротрёшка для семьи',
    description:
      'Функциональный интерьер для семьи с ребёнком: отдельные сценарии отдыха, работы и хранения на площади 59 м².',
    image: 'images/project-murinskiy.jpeg',
    area: '59 м²',
    term: '8 месяцев',
    price: '3 000 000 ₽',
    size: 'tall',
  },
  {
    slug: 'zhk-grafika',
    title: 'ЖК «Графика»',
    type: 'Квартира для молодой пары',
    description:
      'Компактная квартира с цельной архитектурой хранения, тёплым деревом и спокойным естественным светом.',
    image: 'images/project-grafika.jpeg',
    area: '29 м²',
    term: '3 месяца',
    price: '1 200 000 ₽',
    size: 'wide',
  },
  {
    slug: 'verkhnekamenskaya',
    title: 'Верхнекаменская',
    type: 'Кофейня в новом районе',
    description:
      'Коммерческий интерьер с выразительным светом и понятным движением гостей от входа до барной стойки.',
    image: 'images/project-coffee.jpg',
    area: '45 м²',
    term: '2 месяца',
    price: '1 200 000 ₽',
    size: 'standard',
  },
  {
    slug: 'prospekt-slavy-4',
    title: 'Проспект Славы, 4',
    type: 'Светлая квартира с характером',
    description:
      'Лаконичный интерьер с мягкими цветовыми акцентами, продуманной электрикой и мебелью по индивидуальным чертежам.',
    image: 'images/project-slavy.jpg',
    area: '44 м²',
    term: '6 месяцев',
    price: '1 500 000 ₽',
    size: 'standard',
  },
] as const
