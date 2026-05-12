"use client";

export default function ChannelTab({ active }: { active: boolean }) {
  return (
    <div className={`profile-panel${active ? " active" : ""}`}>
      <div className="profile-section">
        <div className="profile-section-title">
          Целевая аудитория <button className="btn btn-ghost btn-sm">Изменить</button>
        </div>
        <div className="profile-val">
          Начинающие инвесторы, 25–38 лет, работают в найме. Хотят начать инвестировать, но боятся
          сделать первый шаг.
        </div>
      </div>
      <div className="profile-section">
        <div className="profile-section-title">
          Рубрики <button className="btn btn-primary btn-sm">+ Рубрика</button>
        </div>
        <div className="rubric-item">
          <div className="rubric-dot" style={{ background: "var(--accent)" }} />
          <div className="rubric-name">Психология денег</div>
          <div className="rubric-freq">раз в 5 дней</div>
        </div>
        <div className="rubric-item">
          <div className="rubric-dot" style={{ background: "var(--orange)" }} />
          <div className="rubric-name">Разбор</div>
          <div className="rubric-freq">раз в неделю</div>
        </div>
        <div className="rubric-item">
          <div className="rubric-dot" style={{ background: "var(--green)" }} />
          <div className="rubric-name">Личный опыт</div>
          <div className="rubric-freq">раз в 2 нед.</div>
        </div>
      </div>
      <div className="profile-section">
        <div className="profile-section-title">
          Тон и голос <button className="btn btn-ghost btn-sm">Изменить</button>
        </div>
        <div className="profile-val">
          Разговорный, от 1-го лица, без жаргона. Личные истории + практичные выводы.
        </div>
      </div>
      <div className="profile-section">
        <div className="profile-section-title">
          Запрещённые темы <button className="btn btn-ghost btn-sm">Изменить</button>
        </div>
        <div className="profile-val">Крипто, конкретные брокеры, политика, агрессивный маркетинг.</div>
      </div>
    </div>
  );
}
