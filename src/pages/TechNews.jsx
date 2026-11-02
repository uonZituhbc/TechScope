import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const categories = [
'All',
'Artificial Intelligence',
'Cloud Computing',
'Cybersecurity',
'Software Development',
'Computer Networking',
'Data Science'
]

function TechNews() {
const [articles, setArticles] = useState([])
const [activeCategory, setActiveCategory] = useState('All')
const [searchTerm, setSearchTerm] = useState('')
const [loading, setLoading] = useState(true)

useEffect(() => {
fetchPublishedArticles()
}, [])

const fetchPublishedArticles = async () => {
setLoading(true)

const { data, error } = await supabase
  .from('articles')
  .select(`
    id,
    slug,
    category,
    title,
    excerpt,
    featured_image_url,
    published_at,
    profiles (
      full_name
    )
  `)
  .eq('status', 'published')
  .order('published_at', { ascending: false })

if (error) {
  console.error('Published articles loading error:', error)
  setArticles([])
} else {
  setArticles(data || [])
}

setLoading(false)

}

const filteredArticles = articles.filter((article) => {
const matchesCategory =
activeCategory === 'All' ||
article.category.toLowerCase().includes(activeCategory.toLowerCase())

const matchesSearch =
  article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (article.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
  article.category.toLowerCase().includes(searchTerm.toLowerCase())

return matchesCategory && matchesSearch

})

return (
<div className="news-page">

  <section className="news-hero">
    <div className="news-hero-content">

      <span className="section-label">
        THE TECHSCOPE NEWSROOM
      </span>

      <h1>Technology moves fast. Stay informed.</h1>

      <p>
        Explore technology developments, industry updates and ideas
        shaping our digital future.
      </p>

      <Link to="/explore" className="news-explore-btn">
        Explore Technology →
      </Link>

    </div>
  </section>

  <section className="news-container">

    <div className="news-heading">
      <div>
        <span className="section-label">
          LATEST UPDATES
        </span>

        <h2>Technology News & Insights</h2>

        <p>
          Discover stories and knowledge from across the tech world.
        </p>
      </div>
    </div>

    <div className="news-controls">

      <div className="news-categories">
        {categories.map((category) => (
          <button
            key={category}
            className={activeCategory === category ? 'active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search technology articles..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

    </div>

    {loading ? (

      <div className="no-news">
        Loading the latest technology articles...
      </div>

    ) : (

      <div className="news-grid">

        {filteredArticles.length > 0 ? (

          filteredArticles.map((article) => (

            <article className="news-card" key={article.id}>

              {article.featured_image_url ? (
                <img
                  src={article.featured_image_url}
                  alt={article.title}
                />
              ) : (
                <div className="news-card-image-placeholder">
                  TechScope
                </div>
              )}

              <div className="news-card-content">

                <span className="news-category">
                  {article.category}
                </span>

                <h3>{article.title}</h3>

                <p>{article.excerpt || 'Explore this technology article on TechScope.'}</p>

                <div className="news-meta">

                  <span>
                    {article.profiles?.full_name || 'TechScope Contributor'}
                  </span>

                  <span>
                    {article.published_at
                      ? new Date(article.published_at).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          }
                        )
                      : ''}
                  </span>

                </div>

                <Link
                  to={`/article/${article.slug}`}
                  className="read-news-btn"
                >
                  Read Article →
                </Link>

              </div>

            </article>

          ))

        ) : (

          <div className="no-news">
            <h3>No articles found.</h3>

            <p>
              {articles.length === 0
                ? 'Published technology articles will appear here.'
                : 'Try another category or search term.'}
            </p>

          </div>

        )}

      </div>

    )}

  </section>

</div>

)
}

export default TechNews