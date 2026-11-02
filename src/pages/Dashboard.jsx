import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function Dashboard() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)

  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    pending: 0,
    drafts: 0
  })

  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser()

      if (authError || !authData.user) {
        navigate('/login')
        return
      }

      const user = authData.user

      const { data: profileData, error: profileError } =
        await supabase
          .from('profiles')
          .select('full_name, email, role, bio, avatar_url')
          .eq('id', user.id)
          .maybeSingle()

      if (profileError) throw profileError

      setProfile(profileData)

      const { data: articles, error: articlesError } =
        await supabase
          .from('articles')
          .select('id, status')
          .eq('author_id', user.id)

      if (articlesError) throw articlesError

      setStats({
        total: articles.length,
        published: articles.filter(a => a.status === 'published').length,
        pending: articles.filter(a => a.status === 'pending').length,
        drafts: articles.filter(a => a.status === 'draft').length
      })

    } catch (error) {
      console.error('Dashboard error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    setLoggingOut(true)

    const { error } = await supabase.auth.signOut()

    if (error) {
      alert(error.message)
      setLoggingOut(false)
      return
    }

    navigate('/login')
  }

  if (loading) {
    return <div className="auth-page">Loading your dashboard...</div>
  }

  const name = profile?.full_name || 'Contributor'
  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="dashboard-page">

      <aside className="dashboard-sidebar">

        <Link to="/" className="dashboard-brand">
          TechScope
        </Link>

        <nav className="dashboard-nav">
          <Link to="/dashboard" className="active">Overview</Link>
          <Link to="/dashboard/articles">My Articles</Link>
          <Link to="/dashboard/write">Write Article</Link>
          <Link to="/dashboard/profile">My Profile</Link>
          <Link to="/dashboard/settings">Account Settings</Link>
          <Link to="/explore">Explore Technology</Link>
        </nav>

        <button
          className="dashboard-logout"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>

      </aside>

      <main className="dashboard-main">

        {/* Dashboard Header */}

        <header className="dashboard-header">

          <div>
            <h1>Welcome, {name}!</h1>
            <p>Your TechScope contributor workspace.</p>
          </div>

          <Link to="/dashboard/profile" className="dashboard-profile">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={name} />
            ) : (
              initial
            )}
          </Link>

        </header>

        {/* Article Statistics */}

        <section className="dashboard-stats">

          <div className="dashboard-stat">
            <p>Total Articles</p>
            <h2>{stats.total}</h2>
          </div>

          <div className="dashboard-stat">
            <p>Published</p>
            <h2>{stats.published}</h2>
          </div>

          <div className="dashboard-stat">
            <p>Pending Review</p>
            <h2>{stats.pending}</h2>
          </div>

          <div className="dashboard-stat">
            <p>Drafts</p>
            <h2>{stats.drafts}</h2>
          </div>

        </section>

        {/* Quick Actions */}

        <section className="dashboard-section">

          <h2>Quick Actions</h2>

          <p>
            Share your knowledge, publish technology insights
            and contribute to the TechScope community.
          </p>

          <div className="dashboard-actions">
            <Link to="/dashboard/write">Write an Article +</Link>
            <Link to="/explore">Explore Technology →</Link>
          </div>

        </section>

        {/* Contributor Profile */}

        <section className="dashboard-section contributor-profile-section">

          <div className="contributor-profile-heading">
            <h2>Contributor Profile</h2>

            <Link to="/dashboard/profile">
              Edit Profile →
            </Link>
          </div>

          <div className="contributor-profile-content">

            <div className="contributor-profile-avatar">

              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={name}
                />
              ) : (
                <span>{initial}</span>
              )}

            </div>

            <div className="contributor-profile-details">

              <h3>{name}</h3>

              <p className="contributor-role">
                {profile?.role || 'Contributor'}
              </p>

              <p className="contributor-email">
                {profile?.email || 'Email unavailable'}
              </p>

              <div className="contributor-bio">

                <h4>About Me</h4>

                <p>
                  {profile?.bio?.trim()
                    ? profile.bio
                    : 'You have not added a biography yet. Tell the TechScope community about yourself.'}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* Recent Articles */}

        <section className="dashboard-section">

          <h2>Recent Articles</h2>

          {stats.total === 0 ? (
            <p>You haven't submitted any articles yet.</p>
          ) : (
            <p>You have submitted {stats.total} article(s) to TechScope.</p>
          )}

          <Link to="/dashboard/articles">
            View My Articles →
          </Link>

        </section>

      </main>
    </div>
  )
}

export default Dashboard