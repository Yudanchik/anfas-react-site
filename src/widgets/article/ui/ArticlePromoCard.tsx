import { Link } from 'react-router'

import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

import styles from './ArticlePromoCard.module.scss'

type ArticlePromoCardProps = {
  eyebrow: string
  title: string
  text: string
  href: string
  actionLabel: string
}

export function ArticlePromoCard({
  eyebrow,
  title,
  text,
  href,
  actionLabel,
}: ArticlePromoCardProps) {
  return (
    <div className={styles.card}>
      <span>{tieRussianShortWords(eyebrow)}</span>
      <strong>{tieRussianShortWords(title)}</strong>
      <p>{tieRussianShortWords(text)}</p>
      <Link to={href}>
        {actionLabel}
        <ArrowIcon size={14} />
      </Link>
    </div>
  )
}

type ArticleInlinePromosProps = {
  serviceHref: string
  serviceLabel: string
}

export function ArticleServicePromo({ serviceHref, serviceLabel }: ArticleInlinePromosProps) {
  return (
    <ArticlePromoCard
      eyebrow="Связанная услуга"
      title={serviceLabel}
      text="Если нужна команда и понятный график — переходите к формату работ."
      href={serviceHref}
      actionLabel="Открыть услугу"
    />
  )
}

export function ArticleProjectsPromo() {
  return (
    <ArticlePromoCard
      eyebrow="Примеры работ"
      title="Реализованные проекты"
      text="Посмотрите, как инженерия и комплектация выглядят в готовых квартирах."
      href="/projects"
      actionLabel="Смотреть проекты"
    />
  )
}
