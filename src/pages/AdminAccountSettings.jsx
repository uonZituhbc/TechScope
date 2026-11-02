import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function AdminAccountSettings() {
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingEmail, setSavingEmail] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadAccount()
  }, [])

  const loadAccount = async () => {
    setLoading(true)

    const { data: { user: currentUser }, error: authError } =
      await supabase.auth.getUser()

    if (authError || !currentUser) {
      navigate('/login')
      return
    }

    const { data: adminProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single()

    if (profileError || adminProfile?.role !== 'admin') {
      navigate('/dashboard')
      return
    }

    setUser(currentUser)
    setProfile(adminProfile)
    setNewEmail(currentUser.email || '')
    setLoading(false)
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (newPassword.length < 8) {
      setError('Password must contain at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setSavingPassword(true)

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated successfully.')
      setNewPassword('')
      setConfirmPassword('')
    }

    setSavingPassword(false)
  }

  const changeEmail = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!newEmail.trim() || newEmail === user.email) {
      setError('Enter a different valid email address.')
      return
    }

    setSavingEmail(true)

    const { error } = await supabase.auth.updateUser({
      email: newEmail.trim()
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage(
        'Email update requested. Check your email for the confirmation instructions.'
      )
    }

    setSavingEmail(false)
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'global' })

    if (error) {
      setError(error.message)
      return
    }

    navigate('/login')
  }

  if (loading) {
    return <div className="admin-settings-loading">Loading account settings...</div>
  }

  return (
    <div className="admin-settings-page">
      <div className="admin-settings-container">

        <div className="admin-settings-header">
          <span>ADMINISTRATION</span>
          <h1>Account Settings</h1>
          <p>Manage your administrator account, security and preferences.</p>
        </div>

        {message && <div className="admin-settings-success">{message}</div>}
        {error && <div className="admin-settings-error">{error}</div>}

        <section className="admin-settings-card">
          <h2>Account Information</h2>

          <div className="admin-settings-info">
            <div>
              <span>Full Name</span>
              <strong>{profile?.full_name || 'Not provided'}</strong>
            </div>

            <div>
              <span>Email Address</span>
              <strong>{user?.email}</strong>
            </div>

            <div>
              <span>Account Role</span>
              <strong>Administrator</strong>
            </div>

            <div>
              <span>Email Verification</span>
              <strong>
                {user?.email_confirmed_at ? 'Verified' : 'Not verified'}
              </strong>
            </div>

            <div>
              <span>Account Created</span>
              <strong>
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'Unavailable'}
              </strong>
            </div>
          </div>
        </section>

        <section className="admin-settings-card">
          <h2>Change Password</h2>
          <p>Use a strong password that you do not use elsewhere.</p>

          <form onSubmit={changePassword}>
            <label>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              minLength={8}
              required
            />

            <label>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={8}
              required
            />

            <button type="submit" disabled={savingPassword}>
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </section>

        <section className="admin-settings-card">
          <h2>Change Email Address</h2>
          <p>
            Supabase may require confirmation through your current and new
            email addresses before the change takes effect.
          </p>

          <form onSubmit={changeEmail}>
            <label>New Email Address</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />

            <button type="submit" disabled={savingEmail}>
              {savingEmail ? 'Processing...' : 'Update Email'}
            </button>
          </form>
        </section>

        <section className="admin-settings-card admin-settings-danger">
          <h2>Security</h2>
          <p>
            Sign out of this account on all devices and return to the login page.
          </p>

          <button onClick={signOut}>
            Sign Out of All Sessions
          </button>
        </section>

        <button
          className="admin-settings-back"
          onClick={() => navigate('/admin')}
        >
          ← Back to Admin Dashboard
        </button>

      </div>
    </div>
  )
}