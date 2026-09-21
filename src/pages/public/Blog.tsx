import { blogPosts } from '../../data/content'

export default function Blog() {
  return (
    <div className="page-shell">
      <section className="page-hero compact-hero">
        <div className="container page-hero-inner">
          <div>
            <span className="eyebrow">Insights</span>
            <h1>Market updates, strategy and property insight.</h1>
          </div>
        </div>
      </section>

      <div className="container blog-page-grid">
        {blogPosts.map((post) => (
          <article key={post.title} className="blog-card blog-page-card">
            <img src={post.image} alt={post.title} />
            <div className="blog-body">
              <span>{post.date}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <button type="button" className="link-button">Read article</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
