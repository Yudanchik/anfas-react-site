

export function HomeTicker() {
  return (
<div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((group) => (
            <div className="ticker-group" key={group}>
              <span>Дизайн без компромиссов</span>
              <i>✦</i>
              <span>Прозрачная реализация</span>
              <i>✦</i>
              <span>Гарантия на работы</span>
              <i>✦</i>
            </div>
          ))}
        </div>
      </div>

      
  )
}
