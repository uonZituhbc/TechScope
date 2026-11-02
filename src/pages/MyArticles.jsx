import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function MyArticles() {
  const navigate = useNavigate()

  const [articles, setArticles] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadArticles()
  }, [])

  async function loadArticles() {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser()

      if (authError || !authData.user) {
        navigate('/login')
        return
      }

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('author_id', authData.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setArticles(data || [])

    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredArticles = filter === 'all'
    ? articles
    : articles.filter(article => article.status === filter)

  function statusClass(status) {
    return `article-status status-${status}`
  }

  return (
    <div className="my-articles-page">

      <header className="my-articles-header">
        <Link to="/dashboard" className="write-brand">
          TechScope
        </Link>

        <Link to="/dashboard" className="write-back">
          ← Dashboard
        </Link>
      </header>

      <main className="my-articles-container">

        <div className="my-articles-title">
          <div>
            <h1>My Articles</h1>
            <p>Manage and track your contributions to TechScope.</p>
          </div>

          <Link to="/dashboard/write" className="new-article-btn">
            + Write Article
          </Link>
        </div>

        <div className="article-filter">
          {['all', 'draft', 'pending', 'published', 'rejected'].map(status => (
            <button
              key={status}
              className={filter === status ? 'selected' : ''}
              onClick={() => setFilter(status)}
            >
              {status === 'all'
                ? 'All Articles'
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="articles-loading">Loading your articles...</p>
        ) : message ? (
          <div className="articles-error">{message}</div>
        ) : filteredArticles.length === 0 ? (

          <div className="empty-articles">
            <h2>No articles found</h2>
            <p>
              You don't have any articles in this category yet.
            </p>

            <Link to="/dashboard/write">
              Create Your First Article →
            </Link>
          </div>

        ) : (

          <div className="articles-list">

            {filteredArticles.map(article => (

              <article className="my-article-card" key={article.id}>

                {article.featured_image_url && (
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                    className="my-article-image"
                  />
                )}

                <div className="my-article-details">

                  <div className="my-article-top">
                    <span className="article-category">
                      {article.category}
                    </span>

                    <span className={statusClass(article.status)}>
                      {article.status}
                    </span>
                  </div>

                  <h2>{article.title}</h2>

                  <p>{article.excerpt}</p>

                  <div className="my-article-meta">
                    {new Date(article.created_at).toLocaleDateString()}
                  </div>

                  {article.admin_feedback && (
                    <div className="admin-feedback">
                      <strong>Administrator Feedback</strong>
                      <p>{article.admin_feedback}</p>
                    </div>
                  )}

                  {['draft', 'rejected'].includes(article.status) && (
                    <Link
                      to={`/dashboard/write?edit=${article.id}`}
                      className="edit-article-btn"
                    >
                      Edit Article
                    </Link>
                  )}

                </div>

              </article>

            ))}

          </div>

        )}

      </main>
    </div>
  )
}

export default MyArticles