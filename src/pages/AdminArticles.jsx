import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AdminArticles() {
  const navigate = useNavigate()

  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const [selectedArticle, setSelectedArticle] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [modalAction, setModalAction] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    checkAdmin()
  }, [])

  async function checkAdmin() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      navigate('/dashboard')
      return
    }

    fetchArticles()
  }

  async function fetchArticles() {
    setLoading(true)

    const { data, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        category,
        status,
        created_at,
        published_at,
        admin_feedback,
        author_id,
        profiles (
          full_name,
          email,
          role
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching articles:', error)
      alert('Unable to load articles: ' + error.message)
    } else {
      setArticles(data || [])
    }

    setLoading(false)
  }

  const filteredArticles = articles.filter(article => {
    const matchesFilter =
      filter === 'all' || article.status === filter

    const searchText = search.toLowerCase()

    const matchesSearch =
      article.title?.toLowerCase().includes(searchText) ||
      article.profiles?.full_name?.toLowerCase().includes(searchText) ||
      article.category?.toLowerCase().includes(searchText)

    return matchesFilter && matchesSearch
  })

  const statusCounts = {
    all: articles.length,
    draft: articles.filter(a => a.status === 'draft').length,
    pending: articles.filter(a => a.status === 'pending').length,
    approved: articles.filter(a => a.status === 'approved').length,
    published: articles.filter(a => a.status === 'published').length,
    unpublished: articles.filter(a => a.status === 'unpublished').length,
    rejected: articles.filter(a => a.status === 'rejected').length
  }

  function openAction(article, action) {
    setSelectedArticle(article)
    setModalAction(action)
    setFeedback('')
  }

  function closeModal() {
    setSelectedArticle(null)
    setModalAction('')
    setFeedback('')
  }

  async function handleUnpublish() {
    if (!feedback.trim()) {
      alert('Please provide feedback explaining why this article is being unpublished.')
      return
    }

    setProcessing(true)

    try {
      const { error } = await supabase
        .from('articles')
        .update({
          status: 'unpublished',
          admin_feedback: feedback.trim()
        })
        .eq('id', selectedArticle.id)

      if (error) throw error

      alert('Article successfully unpublished.')
      closeModal()
      fetchArticles()

    } catch (error) {
      alert(error.message)
    } finally {
      setProcessing(false)
    }
  }

  async function handleQualityReview() {
    if (!feedback.trim()) {
      alert('Please provide quality review feedback.')
      return
    }

    setProcessing(true)

    try {
      const { error } = await supabase
        .from('articles')
        .update({
          admin_feedback: feedback.trim()
        })
        .eq('id', selectedArticle.id)

      if (error) throw error

      alert('Article quality feedback saved successfully.')
      closeModal()
      fetchArticles()

    } catch (error) {
      alert(error.message)
    } finally {
      setProcessing(false)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${selectedArticle.title}"? This action cannot be undone.`
    )

    if (!confirmed) return

    setProcessing(true)

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', selectedArticle.id)

      if (error) throw error

      alert('Article permanently deleted.')
      closeModal()
      fetchArticles()

    } catch (error) {
      alert(error.message)
    } finally {
      setProcessing(false)
    }
  }

  async function handleRestore(article) {
    const confirmed = window.confirm(
      'Restore this article to draft status?'
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('articles')
      .update({
        status: 'draft',
        admin_feedback: null
      })
      .eq('id', article.id)

    if (error) {
      alert(error.message)
      return
    }

    alert('Article restored to draft successfully.')
    fetchArticles()
  }

  return (
    <div className="admin-articles-page">

      <div className="admin-articles-header">
        <div>
          <span className="admin-section-label">
            EDITORIAL CONTROL CENTRE
          </span>

          <h1>Articles Management</h1>

          <p>
            Manage, edit, evaluate and monitor all TechScope articles.
          </p>
        </div>

        <Link to="/admin" className="admin-back-button">
          ← Dashboard
        </Link>
      </div>

      <div className="admin-article-stats">

        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            className={`admin-article-stat ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            <span>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>

            <strong>{count}</strong>
          </button>
        ))}

      </div>

      <div className="admin-articles-toolbar">

        <input
          type="text"
          placeholder="Search by title, author or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
          <option value="rejected">Rejected</option>
        </select>

      </div>

      <div className="admin-articles-list">

        {loading ? (
          <p className="admin-articles-message">
            Loading articles...
          </p>
        ) : filteredArticles.length === 0 ? (
          <p className="admin-articles-message">
            No articles found.
          </p>
        ) : (

          filteredArticles.map(article => (

            <div className="admin-article-card" key={article.id}>

              <div className="admin-article-information">

                <span className={`admin-status-badge ${article.status}`}>
                  {article.status}
                </span>

                <h3>{article.title}</h3>

                <p>{article.excerpt}</p>

                <div className="admin-article-details">
                  <span>{article.category}</span>

                  <span>
                    By {article.profiles?.full_name || 'Unknown author'}
                  </span>

                  <span>
                    {article.profiles?.role === 'admin'
                      ? 'TechScope Admin'
                      : 'TechScope Contributor'}
                  </span>

                  <span>
                    {new Date(article.created_at).toLocaleDateString()}
                  </span>
                </div>

                {article.admin_feedback && (
                  <div className="write-message">
                    <strong>Admin Feedback:</strong>
                    <p>{article.admin_feedback}</p>
                  </div>
                )}

              </div>

              <div className="admin-article-actions">

                <button
                  onClick={() => navigate(`/admin/article/${article.id}`)}
                >
                  Preview
                </button>

                <button
                  onClick={() => navigate(`/admin/write?edit=${article.id}`)}
                >
                  Edit
                </button>

                <button
                  onClick={() => openAction(article, 'quality')}
                >
                  Quality Review
                </button>

                {article.status === 'published' && (
                  <button
                    onClick={() => openAction(article, 'unpublish')}
                  >
                    Unpublish
                  </button>
                )}

                {article.status === 'unpublished' && (
                  <button
                    onClick={() => handleRestore(article)}
                  >
                    Restore to Draft
                  </button>
                )}

                <button
                  onClick={() => openAction(article, 'delete')}
                >
                  Delete
                </button>

              </div>

            </div>

          ))

        )}

      </div>

      {selectedArticle && (
        <div className="admin-review-overlay">

          <div className="admin-review-modal">

            <button
              className="admin-review-close"
              onClick={closeModal}
            >
              ×
            </button>

            <h2>
              {modalAction === 'unpublish'
                ? 'Unpublish Article'
                : modalAction === 'quality'
                  ? 'Article Quality Review'
                  : 'Delete Article'}
            </h2>

            <h3>{selectedArticle.title}</h3>

            {modalAction === 'unpublish' && (
              <>
                <p>
                  Explain why this article is being removed from public view.
                  The contributor will be able to see this feedback.
                </p>

                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Explain the reason for unpublishing this article..."
                  rows="5"
                />

                <button
                  disabled={processing}
                  onClick={handleUnpublish}
                >
                  {processing ? 'Processing...' : 'Confirm Unpublish'}
                </button>
              </>
            )}

            {modalAction === 'quality' && (
              <>
                <p>
                  Evaluate the article's accuracy, originality, relevance,
                  structure and presentation. Record your feedback below.
                </p>

                <textarea
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Write your article quality assessment..."
                  rows="6"
                />

                <button
                  disabled={processing}
                  onClick={handleQualityReview}
                >
                  {processing ? 'Saving...' : 'Save Quality Feedback'}
                </button>
              </>
            )}

            {modalAction === 'delete' && (
              <>
                <p>
                  This will permanently delete the article and its database
                  record. This action cannot be undone.
                </p>

                <button
                  disabled={processing}
                  onClick={handleDelete}
                >
                  {processing ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </>
            )}

          </div>

        </div>
      )}

    </div>
  )
}

export default AdminArticles