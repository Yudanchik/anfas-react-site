import { Link } from 'react-router'

import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import styles from './ArticleCta.module.scss'

type ArticleCtaProps = {
  title: string
  text: string
  href: string
}

export function ArticleCtaBlock({ title, text, href }: ArticleCtaProps) {
  return (
    <aside className={styles.cta}>
      <h2>{tieRussianShortWords(title)}</h2>
      <p>{tieRussianShortWords(text)}</p>
      <Link className={styles.link} to={href}>
        Смотреть услугу
        <ArrowIcon size={16} />
      </Link>
    </aside>
  )
}
