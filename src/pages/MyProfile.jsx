import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function MyProfile() {
  const [user, setUser] = useState(null)

  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    bio: '',
    avatar_url: '',
    role: 'contributor'
  })

  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  // Password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [passwordMessage, setPasswordMessage] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: authData, error: authError } =
      await supabase.auth.getUser()

    if (authError || !authData.user) {
      window.location.href = '/login'
      return
    }

    setUser(authData.user)

    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, email, bio, avatar_url, role')
      .eq('id', authData.user.id)
      .single()

    if (error) {
      setMessage('Unable to load your profile.')
    } else {
      setProfile(data)
      setPreview(data.avatar_url || '')
    }

    setLoading(false)
  }

  function handleImageChange(e) {
    const selectedImage = e.target.files[0]

    if (!selectedImage) return

    if (!selectedImage.type.startsWith('image/')) {
      setMessage('Please select a valid image.')
      return
    }

    if (selectedImage.size > 5 * 1024 * 1024) {
      setMessage('Image must not exceed 5MB.')
      return
    }

    setImage(selectedImage)
    setPreview(URL.createObjectURL(selectedImage))
    setMessage('')
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      let avatarUrl = profile.avatar_url

      if (image) {
        const safeName = image.name.replace(/[^a-zA-Z0-9.-]/g, '-')

        const filePath =
          `${user.id}/profile-${Date.now()}-${safeName}`

        const { error: uploadError } = await supabase.storage
          .from('article-images')
          .upload(filePath, image, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        const { data } = supabase.storage
          .from('article-images')
          .getPublicUrl(filePath)

        avatarUrl = data.publicUrl
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name.trim(),
          bio: profile.bio.trim(),
          avatar_url: avatarUrl
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile(prev => ({
        ...prev,
        avatar_url: avatarUrl
      }))

      setImage(null)
      setMessage('Your profile has been updated successfully!')

    } catch (error) {
      setMessage(error.message || 'Unable to update your profile.')
    }

    setSaving(false)
  }

  // Change Password
  async function handleChangePassword(e) {
    e.preventDefault()
    setPasswordMessage('')

    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = passwordData

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage('Please fill in all password fields.')
      return
    }

    if (newPassword.length < 8) {
      setPasswordMessage('Your new password must have at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('The new passwords do not match.')
      return
    }

    if (currentPassword === newPassword) {
      setPasswordMessage('Your new password must be different.')
      return
    }

    setChangingPassword(true)

    try {
      // Verify current password
      const { error: verifyError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword
        })

      if (verifyError) {
        throw new Error('Your current password is incorrect.')
      }

      // Update password
      const { error: updateError } =
        await supabase.auth.updateUser({
          password: newPassword
        })

      if (updateError) throw updateError

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })

      setPasswordMessage(
        'Your password has been changed successfully!'
      )

    } catch (error) {
      setPasswordMessage(
        error.message || 'Unable to change your password.'
      )
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="profile-loading">
        Loading your profile...
      </div>
    )
  }

  return (
    <div className="profile-page">

      <header className="profile-header">
        <Link to="/dashboard" className="profile-back">
          ← Back to Dashboard
        </Link>

        <h1>My Profile</h1>
        <p>Manage your TechScope contributor information.</p>
      </header>

      <main className="profile-container">

        <section className="profile-card">

          {/* PROFILE PICTURE */}

          <div className="profile-avatar-section">

            <div className="profile-avatar">
              {preview ? (
                <img src={preview} alt="Profile" />
              ) : (
                <span>
                  {profile.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>

            <label
              htmlFor="profile-image"
              className="profile-upload"
            >
              Change Profile Picture
            </label>

            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />

            <small>JPG, PNG or WEBP. Maximum 5MB.</small>

          </div>

          {/* PERSONAL INFORMATION */}

          <form onSubmit={handleSave} className="profile-form">

            <div className="profile-field">
              <label>Full Name</label>

              <input
                type="text"
                value={profile.full_name}
                onChange={e =>
                  setProfile({
                    ...profile,
                    full_name: e.target.value
                  })
                }
                required
              />
            </div>

            <div className="profile-field">
              <label>Email Address</label>

              <input
                type="email"
                value={profile.email}
                disabled
              />

              <small>
                Your registered email cannot be changed here.
              </small>
            </div>

            <div className="profile-field">
              <label>Contributor Role</label>

              <input
                type="text"
                value={profile.role}
                disabled
              />
            </div>

            <div className="profile-field">
              <label>About Me / Biography</label>

              <textarea
                rows="5"
                placeholder="Tell the TechScope community about yourself..."
                value={profile.bio || ''}
                onChange={e =>
                  setProfile({
                    ...profile,
                    bio: e.target.value
                  })
                }
              />
            </div>

            {message && (
              <div className="profile-message">
                {message}
              </div>
            )}

            <button
              type="submit"
              className="profile-save-btn"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>

          </form>

          {/* CHANGE PASSWORD */}

          <div className="password-section">

            <h2>Change Password</h2>

            <p>
              Keep your TechScope account secure by updating your password.
            </p>

            <form
              onSubmit={handleChangePassword}
              className="profile-form"
            >

              <div className="profile-field">
                <label>Current Password</label>

                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value
                    })
                  }
                  required
                />
              </div>

              <div className="profile-field">
                <label>New Password</label>

                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value
                    })
                  }
                  minLength="8"
                  required
                />
              </div>

              <div className="profile-field">
                <label>Confirm New Password</label>

                <input
                  type={showPasswords ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={e =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value
                    })
                  }
                  minLength="8"
                  required
                />
              </div>

              <label className="password-visibility">
                <input
                  type="checkbox"
                  checked={showPasswords}
                  onChange={e =>
                    setShowPasswords(e.target.checked)
                  }
                />

                Show passwords
              </label>

              {passwordMessage && (
                <div className="profile-message">
                  {passwordMessage}
                </div>
              )}

              <button
                type="submit"
                className="profile-save-btn"
                disabled={changingPassword}
              >
                {changingPassword
                  ? 'Updating Password...'
                  : 'Update Password'}
              </button>

            </form>

          </div>

        </section>

      </main>

    </div>
  )
}

export default MyProfile