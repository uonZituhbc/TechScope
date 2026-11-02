import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'


function AdminArticlePreview() {
const { id } = useParams()
const navigate = useNavigate()

const [article, setArticle] = useState(null)
const [loading, setLoading] = useState(true)
const [processing, setProcessing] = useState(false)
const [feedback, setFeedback] = useState('')

useEffect(() => {
checkAdminAndFetchArticle()
}, [id])

const checkAdminAndFetchArticle = async () => {
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

  await fetchArticle()
} catch (error) {
  console.error('Admin verification error:', error)
} finally {
  setLoading(false)
}

}

const fetchArticle = async () => {
const { data, error } = await supabase
.from('articles')
.select("*, profiles ( full_name, email, avatar_url, bio )")
.eq('id', id)
.single()

if (error) {
  console.error('Article fetch error:', error)
  alert('Unable to load article: ' + error.message)
  navigate('/admin/pending')
  return
}

setArticle(data)

}

const updateArticleStatus = async (newStatus) => {
if (newStatus === 'rejected' && !feedback.trim()) {
alert('Please provide feedback before requesting corrections.')
return
}

const confirmation = window.confirm(
  newStatus === 'approved'
    ? 'Are you sure you want to approve this article?'
    : 'Are you sure you want to return this article to the contributor?'
)

if (!confirmation) return

setProcessing(true)

const { error } = await supabase
  .from('articles')
  .update({
    status: newStatus,
    admin_feedback: feedback.trim() || null,
    updated_at: new Date().toISOString()
  })
  .eq('id', id)

if (error) {
  alert('Update failed: ' + error.message)
  setProcessing(false)
  return
}

alert(
  newStatus === 'approved'
    ? 'Article approved successfully.'
    : 'Article returned to the contributor.'
)

navigate('/admin/pending')

}

if (loading) {
return (
<div className="admin-loading">
Loading article preview...
</div>
)
}

if (!article) return null

return (
<div className="admin-preview-page">

  <header className="admin-preview-header">
    <button onClick={() => navigate('/admin/pending')}>
      ← Back to Pending Reviews
    </button>

    <span className="preview-status">
      {article.status}
    </span>
  </header>

  <main className="admin-preview-layout">

    <article className="admin-preview-article">

      <span className="preview-category">
        {article.category}
      </span>

      <h1>{article.title}</h1>

      <p className="preview-excerpt">
        {article.excerpt}
      </p>

      <div className="preview-author">
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
            {article.profiles?.email}
          </span>

          <small>
            Submitted on{' '}
            {new Date(article.created_at).toLocaleDateString()}
          </small>
        </div>
      </div>

      {article.featured_image_url && (
        <img
          className="preview-featured-image"
          src={article.featured_image_url}
          alt={article.title}
        />
      )}

      <div className="preview-article-body">
        {article.content.split('\n').map((paragraph, index) => (
          paragraph.trim() && (
            <p key={index}>{paragraph}</p>
          )
        ))}
      </div>

      {article.source_url && (
        <div className="preview-source">
          <strong>Reference / Source:</strong>
          <a
            href={article.source_url}
            target="_blank"
            rel="noreferrer"
          >
            {article.source_url}
          </a>
        </div>
      )}

      {article.tags?.length > 0 && (
        <div className="preview-tags">
          <strong>Tags:</strong>
          {article.tags.map(tag => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}

    </article>

    <aside className="admin-review-panel">

      <h2>Editorial Review</h2>

      <p>
        Review the complete submission before making your decision.
      </p>

      <label htmlFor="adminFeedback">
        Feedback for contributor
      </label>

      <textarea
        id="adminFeedback"
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
        placeholder="Write feedback or explain required corrections..."
      />

      <button
        className="preview-approve-btn"
        disabled={processing || article.status !== 'pending'}
        onClick={() => updateArticleStatus('approved')}
      >
        Approve Article
      </button>

      <button
        className="preview-correction-btn"
        disabled={processing || article.status !== 'pending'}
        onClick={() => updateArticleStatus('rejected')}
      >
        Request Corrections
      </button>

      <div className="review-note">
        <strong>Editorial note</strong>
        <p>
          Approval does not automatically publish an article.
          Approved articles will await the publication decision.
        </p>
      </div>

    </aside>

  </main>
</div>

)
}

export default AdminArticlePreview