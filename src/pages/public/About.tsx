import { storyStats, values } from '../../data/content'

export default function About() {
  return (
    <div className="page-shell">
      <section className="page-hero compact-hero">
        <div className="container page-hero-inner">
          <div>
            <span className="eyebrow">About us</span>
            <h1>Your trusted property partner.</h1>
          </div>
        </div>
      </section>

      <div className="container page-card-stack">
        <section className="content-panel about-story">
          <div className="panel-image">
            <img src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80" alt="AEG team discussion" />
          </div>
          <div className="panel-copy">
            <span className="eyebrow">Who we are</span>
            <h2>We create lasting places through thoughtful property development.</h2>
            <p>Alliance Estate Group works with communities and project partners to shape property projects that respond to their setting and create lasting value for the people around them.</p>
            <p>Our approach is built around clear communication, considered planning and practical delivery. We work across residential, commercial, farming and international property in Australia, Dubai and India.</p>
          </div>
        </section>

        <section className="content-panel stats-panel">
          {storyStats.map((stat) => (
            <div key={stat.label} className="stat-box">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </section>

        <section className="content-panel mission-grid-panel">
          {values.map((item) => (
            <article key={item.title} className="value-card">
              <div className="icon-box">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </section>
      </div>
    </div>
  )
}
