import { Link } from 'react-router'

import { services } from '@/entities/service/model/services.data'
import { ArrowIcon } from '@/shared/ui/icons/ArrowIcon'

export function HomeServices() {
  return (
<section id="services" className="services section-pad">
        <div className="section-head" data-reveal>
          <div>
            <div className="section-kicker light">
              <span>02</span>
              <p>Что мы делаем</p>
            </div>
            <h2>
              Один подрядчик.
              <br />
              <em>Весь путь.</em>
            </h2>
          </div>
          <p>
            От первой линии на плане до последней лампы: одна команда отвечает за результат целиком.
          </p>
        </div>

        <div className="service-list">
          {services.map((service) => (
            <article className="service-card" key={service.id} data-reveal>
              <span className="service-number">{service.number}</span>
              <div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
              <ul>
                {service.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <Link to={`/services#${service.id}`} aria-label={`Подробнее: ${service.title}`}>
                <ArrowIcon />
              </Link>
            </article>
          ))}
        </div>
      </section>

      
  )
}
