import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const API_URL = 'http://localhost:5002'

function AdminContributors() {
  const navigate = useNavigate()

  const [contributors, setContributors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
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

    fetchContributors()
  }

  const fetchContributors = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        bio,
        avatar_url,
        created_at,
        role,
        account_status,
        suspension_reason,
        suspended_at
      `)
      .eq('role', 'contributor')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Contributor loading error:', error)
      alert('Unable to load contributors: ' + error.message)
      setLoading(false)
      return
    }

    const contributorData = await Promise.all(
      (data || []).map(async contributor => {
        const { data: articles, error: articleError } = await supabase
          .from('articles')
          .select('status')
          .eq('author_id', contributor.id)

        if (articleError) {
          console.error('Article count error:', articleError)
        }

        const records = articles || []

        return {
          ...contributor,
          totalArticles: records.length,
          published: records.filter(a => a.status === 'published').length,
          pending: records.filter(a => a.status === 'pending').length,
          drafts: records.filter(a => a.status === 'draft').length,
          rejected: records.filter(a => a.status === 'rejected').length
        }
      })
    )

    setContributors(contributorData)
    setLoading(false)
  }

  const suspendContributor = async (contributor) => {
    const reason = window.prompt(
      `Enter the reason for suspending ${contributor.full_name}:`
    )

    if (reason === null) return

    if (!reason.trim()) {
      alert('Please provide a suspension reason.')
      return
    }

    const confirmed = window.confirm(
      `Are you sure you want to suspend ${contributor.full_name}?`
    )

    if (!confirmed) return

    try {
      setProcessing(contributor.id)

      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Your administrator session has expired. Please log in again.')
      }

      const response = await fetch(
        `${API_URL}/api/admin/suspend/${contributor.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ reason: reason.trim() })
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Unable to suspend contributor.')
      }

      alert('Contributor account suspended successfully.')

      await fetchContributors()

    } catch (error) {
      console.error('Suspension error:', error)
      alert(error.message)
    } finally {
      setProcessing(null)
    }
  }

  const filteredContributors = contributors.filter(contributor => {
    const searchText = search.toLowerCase()

    return (
      contributor.full_name?.toLowerCase().includes(searchText) ||
      contributor.email?.toLowerCase().includes(searchText)
    )
  })

  return (
    <div className="admin-contributors-page">

      <div className="admin-contributors-header">
        <div>
          <span className="admin-section-label">
            COMMUNITY MANAGEMENT
          </span>

          <h1>All Contributors</h1>

          <p>
            Manage and monitor the TechScope contributor community.
          </p>
        </div>

        <Link to="/admin" className="admin-back-button">
          ← Dashboard
        </Link>
      </div>

      <div className="contributors-summary">
        <div>
          <span>Total Contributors</span>
          <strong>{contributors.length}</strong>
        </div>

        <div>
          <span>Published Articles</span>
          <strong>
            {contributors.reduce((sum, c) => sum + c.published, 0)}
          </strong>
        </div>

        <div>
          <span>Pending Articles</span>
          <strong>
            {contributors.reduce((sum, c) => sum + c.pending, 0)}
          </strong>
        </div>
      </div>

      <div className="contributors-toolbar">
        <input
          type="text"
          placeholder="Search by contributor name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="contributors-message">
          Loading contributors...
        </p>
      ) : filteredContributors.length === 0 ? (
        <p className="contributors-message">
          No contributors found.
        </p>
      ) : (

        <div className="contributors-grid">

          {filteredContributors.map(contributor => (

            <div className="contributor-admin-card" key={contributor.id}>

              <div className="contributor-admin-profile">

                {contributor.avatar_url ? (
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.full_name}
                  />
                ) : (
                  <div className="contributor-avatar-placeholder">
                    {contributor.full_name?.charAt(0).toUpperCase() || 'T'}
                  </div>
                )}

                <div>
                  <h3>{contributor.full_name}</h3>
                  <span>TechScope Contributor</span>
                </div>

              </div>

              <p className="contributor-admin-email">
                {contributor.email}
              </p>

              {contributor.bio && (
                <p className="contributor-admin-bio">
                  {contributor.bio}
                </p>
              )}

              <div className="contributor-article-stats">

                <div>
                  <strong>{contributor.totalArticles}</strong>
                  <span>Total</span>
                </div>

                <div>
                  <strong>{contributor.published}</strong>
                  <span>Published</span>
                </div>

                <div>
                  <strong>{contributor.pending}</strong>
                  <span>Pending</span>
                </div>

                <div>
                  <strong>{contributor.drafts}</strong>
                  <span>Drafts</span>
                </div>

              </div>

              <div className="contributor-admin-actions">

                <Link to={`/contributor/${contributor.id}`}>
                  View Public Profile
                </Link>

              </div>

              <div style={{ marginTop: '16px' }}>

                {contributor.account_status === 'suspended' ? (

                  <div>
                    <span style={{
                      display: 'inline-block',
                      padding: '7px 12px',
                      borderRadius: '20px',
                      background: '#fee2e2',
                      color: '#991b1b',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      SUSPENDED
                    </span>

                    <p style={{ fontSize: '12px', marginTop: '8px' }}>
                      Reason: {contributor.suspension_reason}
                    </p>

                  </div>

                ) : (

                  <button
                    type="button"
                    disabled={processing === contributor.id}
                    onClick={() => suspendContributor(contributor)}
                    style={{
                      background: '#fee2e2',
                      color: '#991b1b',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '7px',
                      cursor: processing === contributor.id
                        ? 'not-allowed'
                        : 'pointer',
                      fontWeight: '600',
                      opacity: processing === contributor.id ? 0.6 : 1
                    }}
                  >
                    {processing === contributor.id
                      ? 'Suspending...'
                      : 'Suspend Account'}
                  </button>

                )}

              </div>

              <small>
                Joined {new Date(contributor.created_at).toLocaleDateString()}
              </small>

            </div>

          ))}

        </div>

      )}

    </div>
  )
}

export default AdminContributors