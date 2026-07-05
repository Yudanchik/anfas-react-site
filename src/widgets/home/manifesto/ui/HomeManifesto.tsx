import { Counter } from '@/shared/ui/counter/Counter'

export function HomeManifesto() {
  return (
<section className="manifesto section-pad">
        <div className="section-kicker" data-reveal>
          <span>01</span>
          <p>Наш подход</p>
        </div>
        <div className="manifesto-layout">
          <p className="manifesto-note" data-reveal>
            Не навязываем «модный стиль». Сначала слушаем вас, затем собираем пространство вокруг
            привычек, задач и характера.
          </p>
          <h2 data-reveal>
            Мы проектируем
            <br />
            не <s>красивые картинки.</s>
            <br />
            Мы проектируем <em>жизнь</em>
            <br />
            внутри.
          </h2>
        </div>
        <div className="stats-row">
          <div data-reveal>
            <strong>
              <Counter value={10} suffix="+" />
            </strong>
            <span>
              лет создаём
              <br />
              интерьеры
            </span>
          </div>
          <div data-reveal>
            <strong>
              <Counter value={1000} suffix="+" />
            </strong>
            <span>
              реализованных
              <br />
              проектов
            </span>
          </div>
          <div data-reveal>
            <strong>
              <Counter value={5} />
            </strong>
            <span>
              этапов от идеи
              <br />
              до новоселья
            </span>
          </div>
        </div>
      </section>

      
  )
}
