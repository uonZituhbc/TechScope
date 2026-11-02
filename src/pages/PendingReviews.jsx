import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function PendingReviews() {
const navigate = useNavigate()

const [articles, setArticles] = useState([])
const [loading, setLoading] = useState(true)
const [admin, setAdmin] = useState(false)
const [feedback, setFeedback] = useState({})
const [processing, setProcessing] = useState(null)

useEffect(() => {
checkAdmin()
}, [])

const checkAdmin = async () => {
try {
const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    navigate('/login')
    return
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error || profile?.role !== 'admin') {
    navigate('/dashboard')
    return
  }

  setAdmin(true)
  await fetchPendingArticles()

} catch (error) {
  console.error('Admin verification error:', error)
  navigate('/dashboard')
} finally {
  setLoading(false)
}

}

const fetchPendingArticles = async () => {
const { data, error } = await supabase
.from('articles')
.select("id, title, slug, excerpt, content, category, featured_image_url, source_url, tags, created_at, author_id, profiles ( full_name, email, avatar_url )")
.eq('status', 'pending')
.order('created_at', { ascending: false })

if (error) {
  console.error('Failed to fetch articles:', error)
  alert('Unable to load pending articles: ' + error.message)
  return
}

setArticles(data || [])

}

const updateArticle = async (articleId, newStatus) => {
const message = feedback[articleId]?.trim() || ''

if (newStatus === 'rejected' && !message) {
  alert('Please provide feedback before requesting corrections or rejecting an article.')
  return
}

setProcessing(articleId)

const updateData = {
  status: newStatus,
  admin_feedback: message || null,
  updated_at: new Date().toISOString()
}

const { error } = await supabase
  .from('articles')
  .update(updateData)
  .eq('id', articleId)

if (error) {
  console.error('Article update error:', error)
  alert('Action failed: ' + error.message)
  setProcessing(null)
  return
}

alert(
  newStatus === 'approved'
    ? 'Article approved successfully.'
    : newStatus === 'rejected'
    ? 'Article returned to the contributor with feedback.'
    : 'Article updated successfully.'
)

setFeedback(prev => {
  const updated = { ...prev }
  delete updated[articleId]
  return updated
})

await fetchPendingArticles()
setProcessing(null)

}

if (loading) {
return <div className="admin-loading">Loading pending reviews...</div>
}

if (!admin) return null

return (
<div className="pending-reviews-page">

  <header className="pending-header">
    <div>
      <h1>Pending Article Reviews</h1>
      <p>Review submissions and manage publication decisions.</p>
    </div>

    <button onClick={() => navigate('/admin')}>
      Back to Dashboard
    </button>
  </header>

  <div className="pending-summary">
    <h2>{articles.length}</h2>
    <p>Articles awaiting review</p>
  </div>

  {articles.length === 0 ? (
    <div className="no-pending">
      <h2>All caught up!</h2>
      <p>There are currently no articles awaiting review.</p>
    </div>
  ) : (

    <div className="pending-articles">

      {articles.map(article => (

        <article className="pending-article-card" key={article.id}>

          {article.featured_image_url && (
            <img
              src={article.featured_image_url}
              alt={article.title}
              className="pending-article-image"
            />
          )}

          <div className="pending-article-content">

            <span className="pending-category">
              {article.category}
            </span>

            <h2>{article.title}</h2>

            <p className="pending-excerpt">
              {article.excerpt}
            </p>

            <div className="pending-author">
              {article.profiles?.avatar_url && (
                <img
                  src={article.profiles.avatar_url}
                  alt=""
                />
              )}

              <div>
                <strong>
                  {article.profiles?.full_name || 'Unknown contributor'}
                </strong>
                <span>
                  {article.profiles?.email || 'No email available'}
                </span>
              </div>
            </div>

            <p className="pending-date">
              Submitted: {new Date(article.created_at).toLocaleDateString()}
            </p>

            {article.source_url && (
              <p>
                Source:{' '}
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View source
                </a>
              </p>
            )}

            {article.tags?.length > 0 && (
              <p className="pending-tags">
                Tags: {article.tags.join(', ')}
              </p>
            )}

            <button
              className="read-article-btn"
             onClick={() => navigate(`/admin/article/${article.id}`)}
            >
              Preview Article
            </button>

            <textarea
              placeholder="Enter feedback for the contributor..."
              value={feedback[article.id] || ''}
              onChange={e =>
                setFeedback(prev => ({
                  ...prev,
                  [article.id]: e.target.value
                }))
              }
            />

            <div className="review-actions">

              <button
                className="approve-btn"
                disabled={processing === article.id}
                onClick={() => updateArticle(article.id, 'approved')}
              >
                Approve
              </button>

              <button
                className="correction-btn"
                disabled={processing === article.id}
                onClick={() => updateArticle(article.id, 'rejected')}
              >
                Request Corrections
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

export default PendingReviews