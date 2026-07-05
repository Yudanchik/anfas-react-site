import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

export function HomeContact({ onOpenBrief }: { onOpenBrief: () => void }) {
  return (
<section id="contacts" className="contact">
        <div className="contact-orbit" aria-hidden="true">
          <span />
          <i />
        </div>
        <p className="eyebrow" data-reveal>
          <span /> Есть идея?
        </p>
        <h2 data-reveal>
          Давайте посмотрим,
          <br />
          <em>что из неё получится.</em>
        </h2>
        <p className="contact-lead" data-reveal>
          Расскажите немного о будущем интерьере. Мы свяжемся, зададим правильные вопросы и
          предложим следующий шаг.
        </p>
        <button className="contact-button" type="button" onClick={onOpenBrief} data-reveal>
          <span>Заполнить короткий бриф</span>
          <i>
            <ArrowIcon />
          </i>
        </button>
      </section>

  )
}
