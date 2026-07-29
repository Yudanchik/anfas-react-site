import { useEffect, useMemo, useState } from 'react'

import { absoluteUrl } from '@/shared/config/seo'
import { tieRussianShortWords } from '@/shared/lib/tie-russian-short-words'
import {
  IconCopyLink,
  IconMax,
  IconOk,
  IconTelegram,
  IconVk,
} from '@/shared/ui/icons/ShareIcons'

import styles from './ArticleShare.module.scss'

type ArticleShareProps = {
  title: string
  path: string
}

export function ArticleShare({ title, path }: ArticleShareProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = useMemo(() => absoluteUrl(path), [path])

  useEffect(() => {
    if (!copied) {
      return
    }

    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)
  const maxShareText = encodeURIComponent(`${title} ${shareUrl}`)

  const links = [
    {
      id: 'vk',
      label: 'Поделиться во ВКонтакте',
      href: `https://vk.com/share.php?url=${encodedUrl}&title=${encodedTitle}`,
      icon: <IconVk />,
    },
    {
      id: 'max',
      label: 'Поделиться в MAX',
      href: `https://max.ru/:share?text=${maxShareText}`,
      icon: <IconMax />,
    },
    {
      id: 'telegram',
      label: 'Поделиться в Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <IconTelegram />,
    },
    {
      id: 'ok',
      label: 'Поделиться в Одноклассниках',
      href: `https://connect.ok.ru/offer?url=${encodedUrl}&title=${encodedTitle}`,
      icon: <IconOk />,
    },
  ] as const

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className={styles.share} aria-label="Поделиться статьёй">
      <h2 className={styles.title}>{tieRussianShortWords('Поделиться')}</h2>
      <div className={styles.row}>
        {links.map((link) => (
          <a
            key={link.id}
            className={styles.button}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={link.label}
          >
            {link.icon}
          </a>
        ))}
        <button
          className={styles.button}
          type="button"
          onClick={() => {
            void copyLink()
          }}
          aria-label={copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}
        >
          <IconCopyLink />
        </button>
      </div>
      {copied ? <p className={styles.copied}>{tieRussianShortWords('Ссылка скопирована')}</p> : null}
    </section>
  )
}
