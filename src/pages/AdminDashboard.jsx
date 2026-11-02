import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AdminDashboard() {
const navigate = useNavigate()

const [loading, setLoading] = useState(true)
const [admin, setAdmin] = useState(null)
const [unreadMessages, setUnreadMessages] = useState(0)

const [stats, setStats] = useState({
contributors: 0,
articles: 0,
pending: 0,
published: 0
})

useEffect(() => {
checkAdminAccess()
}, [])

useEffect(() => {
if (!admin) return

fetchUnreadMessageCount()

const interval = setInterval(() => {
  fetchUnreadMessageCount()
}, 30000)

return () => clearInterval(interval)

}, [admin])

const checkAdminAccess = async () => {
try {
const { data: { user }, error: authError } =
await supabase.auth.getUser()

  if (authError || !user) {
    navigate('/login')
    return
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, email, role, avatar_url')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'admin') {
    navigate('/dashboard')
    return
  }

  setAdmin(profile)

  await fetchDashboardStats()

} catch (error) {
  console.error('Admin verification failed:', error)
  navigate('/dashboard')
} finally {
  setLoading(false)
}

}

// Fetch dashboard statistics
const fetchDashboardStats = async () => {
try {
const [
contributorsResult,
articlesResult,
pendingResult,
publishedResult
] = await Promise.all([
supabase
.from('profiles')
.select('*', { count: 'exact', head: true })
.eq('role', 'contributor'),

    supabase
      .from('articles')
      .select('*', { count: 'exact', head: true }),

    supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),

    supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
  ])

  setStats({
    contributors: contributorsResult.count ?? 0,
    articles: articlesResult.count ?? 0,
    pending: pendingResult.count ?? 0,
    published: publishedResult.count ?? 0
  })

  if (
    contributorsResult.error ||
    articlesResult.error ||
    pendingResult.error ||
    publishedResult.error
  ) {
    console.error('One or more statistics could not be loaded.')
  }

} catch (error) {
  console.error('Statistics error:', error)
}

}

// Fetch unread contact messages
const fetchUnreadMessageCount = async () => {
try {
const { count, error } = await supabase
.from('contact_messages')
.select('*', { count: 'exact', head: true })
.eq('is_read', false)

  if (error) {
    console.error('Unread messages error:', error)
    return
  }

  setUnreadMessages(count ?? 0)

} catch (error) {
  console.error('Could not fetch unread messages:', error)
}

}

const handleLogout = async () => {
await supabase.auth.signOut()
navigate('/login')
}

if (loading) {
return (
<div className="admin-loading">
Verifying administrator access...
</div>
)
}

if (!admin) return null

return (
<div className="admin-dashboard">

  <aside className="admin-sidebar">
    <h2>TechScope</h2>
    <p>ADMINISTRATION</p>

    <nav>
      <a href="/admin">Overview</a>

      <h4>CONTENT MANAGEMENT</h4>
      <a href="/admin/articles">Articles Management</a>
      <a href="/admin/pending">Pending Reviews</a>
      <a href="/admin/published">Published Articles</a>
      <a href="/admin/write">Write Article</a>

      <h4>CONTRIBUTORS</h4>
      <a href="/admin/contributors">All Contributors</a>
      <a href="/admin/deactivated">Deactivated Accounts</a>

      <h4>MEDIA</h4>
      <a href="/admin/gallery">Gallery Management</a>

      <h4>COMMUNICATIONS</h4>
      <a href="/admin/messages" className="admin-messages-nav-link">
        <span>Messages</span>

        {unreadMessages > 0 && (
          <span className="admin-unread-badge">
            {unreadMessages > 99 ? '99+' : unreadMessages}
          </span>
        )}
      </a>

      <h4>ACCOUNT</h4>
      <a href="/admin/profile">Admin Profile</a>
      <a href="/admin/settings">Account Settings</a>
    </nav>

    <button onClick={handleLogout}>Logout</button>
  </aside>

  <main className="admin-main">

    <header className="admin-header">
      <div>
        <h1>Administrator Dashboard</h1>
        <p>
          Manage TechScope content, contributors and publications.
        </p>
      </div>

      <div className="admin-user">
        <strong>{admin.full_name}</strong>
        <span>Administrator</span>
      </div>
    </header>

    <section className="admin-welcome">
      <h2>Welcome, {admin.full_name}!</h2>

      <p>
        You have administrative access to the TechScope platform.
        Manage publications, review submissions and oversee contributors.
      </p>
    </section>

    <section className="admin-overview">
      <h2>Platform Overview</h2>

      <div className="admin-stat-grid">

        <div className="admin-stat-card">
          <h3>Contributors</h3>
          <p>{stats.contributors}</p>
        </div>

        <div className="admin-stat-card">
          <h3>Total Articles</h3>
          <p>{stats.articles}</p>
        </div>

        <div className="admin-stat-card">
          <h3>Pending Reviews</h3>
          <p>{stats.pending}</p>
        </div>

        <div className="admin-stat-card">
          <h3>Published Articles</h3>
          <p>{stats.published}</p>
        </div>

      </div>
    </section>

  </main>
</div>

)
}

export default AdminDashboard