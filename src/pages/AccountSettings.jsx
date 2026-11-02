import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AccountSettings() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAccount()
  }, [])

  async function loadAccount() {
    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      window.location.href = '/login'
      return
    }

    const currentUser = authData.user
    setUser(currentUser)

    const { data: profileData, error: profileError } =
      await supabase
        .from('profiles')
        .select('full_name, email, role, created_at')
        .eq('id', currentUser.id)
        .maybeSingle()

    if (!profileError) {
      setProfile(profileData)
    }

    setLoading(false)
  }

  function formatDate(date) {
    if (!date) return 'Not available'

    return new Date(date).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return <div className="dashboard-loading">Loading account settings...</div>
  }

  return (
    <main className="account-settings-page">

      <div className="account-settings-header">
        <h1>Account Settings</h1>
        <p>Manage your TechScope account information.</p>
      </div>

      <section className="profile-card">

        <h2>Account Information</h2>

        <div className="settings-information">

          <div>
            <span>Full Name</span>
            <strong>{profile?.full_name || 'Not available'}</strong>
          </div>

          <div>
            <span>Email Address</span>
            <strong>{user?.email}</strong>
          </div>

          <div>
            <span>Account Role</span>
            <strong>{profile?.role || 'Contributor'}</strong>
          </div>

          <div>
            <span>Account Created</span>
            <strong>{formatDate(user?.created_at)}</strong>
          </div>

          <div>
            <span>Email Verification</span>
            <strong className={
              user?.email_confirmed_at
                ? 'verified-status'
                : 'unverified-status'
            }>
              {user?.email_confirmed_at ? 'Verified' : 'Not Verified'}
            </strong>
          </div>

        </div>

        <div className="settings-actions">
          <Link to="/dashboard/profile" className="profile-save-btn">
            Edit My Profile
          </Link>
        </div>

      </section>

    </main>
  )
}

export default AccountSettings