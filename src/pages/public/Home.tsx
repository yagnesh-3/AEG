import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../context/DataContext'
import { blogPosts, faqItems, heroSlides, services, storyStats, timelineMilestones, values } from '../../data/content'

export default function Home() {
  const { projects } = useData()
  const navigate = useNavigate()
  const [activeSlide, setActiveSlide] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((p) => (p + 1) % heroSlides.length), 5000)
    return () => window.clearInterval(timer)
  }, [])

  const currentSlide = heroSlides[activeSlide]
  const featured = projects.slice(0, 4)

  return (
    <>
      <section className="hero-section">
        <div className="hero-slide" style={{ backgroundImage: `url(${currentSlide.image})` }}>
          <div className="hero-overlay" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow light">{currentSlide.kicker}</span>
              <h1>{currentSlide.title}</h1>
              <p>{currentSlide.subtitle}</p>
              <div className="hero-actions">
                <button className="button button-solid" type="button" onClick={() => navigate('/projects')}>Explore projects</button>
                <button className="button button-outline" type="button" onClick={() => navigate('/about')}>Learn more</button>
              </div>
            </div>

            <div className="cta-panel">
              <h3>Have a project in mind?</h3>
              <p className="cta-panel-note">Talk with our team about a project, property or potential collaboration.</p>
              <button type="button" className="button button-solid full-width" onClick={() => navigate('/contact')}>Make an enquiry</button>
            </div>
          </div>
        </div>

        <div className="container slider-controls">
          <button type="button" aria-label="Previous slide" onClick={() => setActiveSlide((p) => (p - 1 + heroSlides.length) % heroSlides.length)}>←</button>
          <div className="slider-dots" aria-label="Hero slider pagination">
            {heroSlides.map((slide, index) => (
              <button key={slide.kicker} type="button" className={index === activeSlide ? 'active' : ''} aria-label={`Show slide ${index + 1}`} onClick={() => setActiveSlide(index)} />
            ))}
          </div>
          <button type="button" aria-label="Next slide" onClick={() => setActiveSlide((p) => (p + 1) % heroSlides.length)}>→</button>
        </div>
      </section>

      <section className="about-section container">
        <div className="about-visual">
          <div className="about-image tall"><img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80" alt="Property exterior" /></div>
          <div className="about-image"><img src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80" alt="Property development site" /></div>
        </div>
        <div className="about-copy">
          <span className="eyebrow">About Alliance Estate Group</span>
          <h2>Your Trusted Property Partner</h2>
          <p>We bring together local knowledge, careful planning and practical expertise across property projects in Australia and select international markets.</p>
          <p>From residential communities to commercial places, our team takes a thoughtful, long-term view of every project.</p>
          <button type="button" className="button button-solid" onClick={() => navigate('/about')}>More info</button>
        </div>
      </section>

      <section className="mission-section">
        <div className="container">
          <div className="section-heading center">
            <span className="eyebrow">What drives us</span>
            <h2>Built on clarity, trust and disciplined growth.</h2>
          </div>
          <div className="value-grid">
            {values.map((item) => (
              <article key={item.title} className="value-card">
                <div className="icon-box">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="projects-section container">
        <div className="section-heading split-heading">
          <div>
            <span className="eyebrow">Our Projects</span>
            <h2>Current opportunities across key growth sectors.</h2>
          </div>
          <button type="button" className="button button-outline-dark" onClick={() => navigate('/projects')}>View all {projects.length}</button>
        </div>
        <div className="project-grid">
          {featured.map((project) => (
            <article key={project.id} className="project-card">
              <div className="project-image-wrap">
                <img src={project.image} alt={project.name} />
                <span className="project-status">{project.status}</span>
              </div>
              <div className="project-body">
                <span className="project-category">{project.category}</span>
                <h3>{project.name}</h3>
                <p>{project.location}</p>
                <button type="button" className="card-link" onClick={() => navigate(`/projects/${project.id}`)}>View project →</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="track-record-section">
        <div className="container track-record-grid">
          <div className="track-copy">
            <span className="eyebrow">Our Track Record</span>
            <h2>Delivered with discipline, strategy and measurable outcomes.</h2>
            <p>Our work spans residential, commercial and rural property, guided by local understanding and a long-term perspective.</p>
            <div className="track-stats">
              {storyStats.map((item) => (
                <div key={item.label} className="mini-stat">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="timeline-panel">
            <h3>Key milestones</h3>
            <ul>
              {timelineMilestones.map((item) => (
                <li key={item.year}>
                  <span>{item.year}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.copy}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="services-section">
        <div className="container">
          <div className="section-heading split-heading">
            <div>
              <span className="eyebrow">What We Do</span>
              <h2>Sustainable real estate opportunities designed for long-term value.</h2>
            </div>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <article key={service.title} className="service-card">
                <div className="service-image" style={{ backgroundImage: `url(${service.image})` }} />
                <div className="service-body">
                  <span className="service-icon">→</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <button type="button" className="link-button" onClick={() => navigate('/projects')}>Read more</button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="faq-section container">
        <div className="section-heading center faq-heading">
          <span className="eyebrow">Frequently Asked Questions</span>
          <h2>Why Should You Love To Work With Us?</h2>
        </div>
        <div className="faq-list">
          {faqItems.map((item, index) => (
            <div key={item.question} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
              <button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                <span>{item.question}</span>
                <strong>{openFaq === index ? '−' : '+'}</strong>
              </button>
              {openFaq === index && <p>{item.answer}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-panel-grid">
          <div className="cta-copy">
            <span className="eyebrow light">Ready to talk?</span>
            <h2>Our team is ready to assist you with all your needs.</h2>
            <div className="cta-actions">
              <button type="button" className="button button-solid" onClick={() => navigate('/contact')}>Contact us</button>
              <button type="button" className="button button-outline light" onClick={() => navigate('/projects')}>Get our services</button>
            </div>
          </div>
          <div className="cta-visual" aria-hidden="true" />
        </div>
      </section>

      <section className="blog-section container">
        <div className="section-heading split-heading">
          <div>
            <span className="eyebrow">Insights</span>
            <h2>Latest market thinking and project updates.</h2>
          </div>
          <button type="button" className="button button-outline-dark" onClick={() => navigate('/blog')}>Read more</button>
        </div>
        <div className="blog-grid">
          {blogPosts.map((post) => (
            <article key={post.title} className="blog-card">
              <img src={post.image} alt={post.title} />
              <div className="blog-body">
                <span>{post.date}</span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <button type="button" className="link-button" onClick={() => navigate('/blog')}>Read more</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
