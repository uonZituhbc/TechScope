import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function ContributorProfile() {
  const { id } = useParams()

  const [contributor, setContributor] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadContributor()
  }, [id])

  async function loadContributor() {
    setLoading(true)
    setError('')

    const { data: profileData, error: profileError } =
      await supabase.rpc('get_public_contributor_profile', {
        contributor_id: id
      })

    if (profileError || !profileData || profileData.length === 0) {
      setError('Contributor profile not found.')
      setLoading(false)
      return
    }

    const profile = profileData[0]
    setContributor(profile)

    const { data: articleData, error: articleError } =
      await supabase
        .from('articles')
        .select('id, title, slug, excerpt, category, featured_image_url, published_at')
        .eq('author_id', id)
        .eq('status', 'published')
        .order('published_at', { ascending: false })

    if (articleError) {
      setError('Unable to load contributor articles.')
    } else {
      setArticles(articleData || [])
    }

    setLoading(false)
  }

  function formatDate(date) {
    if (!date) return ''

    return new Date(date).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return <div className="dashboard-loading">Loading contributor profile...</div>
  }

  if (error || !contributor) {
    return (
      <main className="public-contributor-page">
        <h2>{error || 'Contributor not found.'}</h2>
        <Link to="/explore">Explore Technology</Link>
      </main>
    )
  }

  return (
    <main className="public-contributor-page">

      <Link to="/" className="contributor-back-link">
        ← TechScope
      </Link>

      <section className="public-contributor-header">

        {contributor.avatar_url ? (
          <img
            src={contributor.avatar_url}
            alt={contributor.full_name}
            className="public-contributor-avatar"
          />
        ) : (
          <div className="public-contributor-avatar-placeholder">
            {contributor.full_name?.charAt(0).toUpperCase()}
          </div>
        )}

        <div>
          <span className="public-contributor-label">
            TECHSCOPE CONTRIBUTOR
          </span>

          <h1>{contributor.full_name}</h1>

          <p>
            {contributor.bio || 'Technology enthusiast and TechScope contributor.'}
          </p>

          <small>
            Contributor since {formatDate(contributor.created_at)}
          </small>
        </div>

      </section>

      <section className="public-contributor-articles">

        <div className="public-contributor-articles-heading">
          <h2>Published Articles</h2>
          <span>{articles.length} Articles</span>
        </div>

        {articles.length === 0 ? (
          <p>No published articles yet.</p>
        ) : (
          <div className="public-articles-grid">

            {articles.map(article => (
              <article className="public-article-card" key={article.id}>

                {article.featured_image_url && (
                  <img
                    src={article.featured_image_url}
                    alt={article.title}
                  />
                )}

                <div className="public-article-content">

                  <span>{article.category}</span>

                  <h3>{article.title}</h3>

                  <p>{article.excerpt}</p>

                  <small>{formatDate(article.published_at)}</small>

                  <Link to={`/article/${article.slug}`}>
                    Read Article →
                  </Link>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>

    </main>
  )
}

export default ContributorProfile