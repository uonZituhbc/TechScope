import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function ApprovedArticles() {
const navigate = useNavigate()

const [articles, setArticles] = useState([])
const [loading, setLoading] = useState(true)
const [publishingId, setPublishingId] = useState(null)

useEffect(() => {
checkAdminAndFetchArticles()
}, [])

const checkAdminAndFetchArticles = async () => {
try {
const { data: { user }, error: authError } =
await supabase.auth.getUser()

  if (authError || !user) {
    navigate('/login')
    return
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    navigate('/dashboard')
    return
  }

  await fetchApprovedArticles()
} catch (error) {
  console.error('Admin verification error:', error)
} finally {
  setLoading(false)
}

}

const fetchApprovedArticles = async () => {
const { data, error } = await supabase
.from('articles')
.select("id, title, slug, excerpt, category, featured_image_url, created_at, profiles ( full_name, email, avatar_url )")
.eq('status', 'approved')
.order('created_at', { ascending: false })

if (error) {
  console.error('Approved articles error:', error)
  alert('Unable to load approved articles: ' + error.message)
  return
}

setArticles(data || [])

}

const publishArticle = async (article) => {
const confirmation = window.confirm(
`Are you sure you want to publish "${article.title}"?`
)

if (!confirmation) return

setPublishingId(article.id)

const { error } = await supabase
  .from('articles')
  .update({
    status: 'published',
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  .eq('id', article.id)
  .eq('status', 'approved')

if (error) {
  alert('Publishing failed: ' + error.message)
  setPublishingId(null)
  return
}

alert('Article published successfully!')
setArticles(previous =>
  previous.filter(item => item.id !== article.id)
)

setPublishingId(null)

}

if (loading) {
return <div className="admin-loading">Loading approved articles...</div>
}

return (
<div className="approved-articles-page">

  <header className="approved-header">
    <div>
      <h1>Approved Articles</h1>
      <p>Review approved submissions and publish them when ready.</p>
    </div>

    <button onClick={() => navigate('/admin')}>
      Back to Dashboard
    </button>
  </header>

  <div className="approved-summary">
    <div>
      <span>Awaiting Publication</span>
      <strong>{articles.length}</strong>
    </div>
  </div>

  {articles.length === 0 ? (
    <div className="approved-empty">
      <h2>No approved articles yet</h2>
      <p>
        Articles approved by the editorial team will appear here.
      </p>
    </div>
  ) : (
    <div className="approved-articles-list">

      {articles.map(article => (
        <article className="approved-article-card" key={article.id}>

          {article.featured_image_url && (
            <img
              src={article.featured_image_url}
              alt={article.title}
            />
          )}

          <div className="approved-article-info">

            <span className="approved-category">
              {article.category}
            </span>

            <h2>{article.title}</h2>

            <p>{article.excerpt}</p>

            <div className="approved-author">
              By {article.profiles?.full_name || 'Unknown contributor'}
            </div>

            <small>
              Submitted: {new Date(article.created_at).toLocaleDateString()}
            </small>

            <div className="approved-actions">

              <button
                className="approved-preview-btn"
                onClick={() =>
                  navigate(`/admin/article/${article.id}`)
                }
              >
                Preview Article
              </button>

              <button
                className="publish-article-btn"
                disabled={publishingId === article.id}
                onClick={() => publishArticle(article)}
              >
                {publishingId === article.id
                  ? 'Publishing...'
                  : 'Publish Article'}
              </button>

            </div>
          </div>
        </article>
      ))}

    </div>
  )}

</div>

)
}

export default ApprovedArticles