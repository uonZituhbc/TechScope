import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AdminProfile() {
const navigate = useNavigate()

const [user, setUser] = useState(null)
const [loading, setLoading] = useState(true)
const [saving, setSaving] = useState(false)
const [message, setMessage] = useState('')
const [image, setImage] = useState(null)
const [preview, setPreview] = useState('')

const [form, setForm] = useState({
full_name: '',
bio: '',
avatar_url: ''
})

useEffect(() => {
loadProfile()
}, [])

async function loadProfile() {
try {
const { data: authData, error: authError } =
await supabase.auth.getUser()

  if (authError || !authData.user) {
    navigate('/login')
    return
  }

  const currentUser = authData.user
  setUser(currentUser)

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single()

  if (error) throw error

  if (data.role !== 'admin') {
    navigate('/dashboard')
    return
  }

  setForm({
    full_name: data.full_name || '',
    bio: data.bio || '',
    avatar_url: data.avatar_url || ''
  })
} catch (error) {
  setMessage(error.message)
} finally {
  setLoading(false)
}

}

function handleChange(e) {
setForm({
...form,
[e.target.name]: e.target.value
})
}

function handleImageChange(e) {
const file = e.target.files[0]

if (!file) return

if (!file.type.startsWith('image/')) {
  setMessage('Please select a valid image.')
  e.target.value = ''
  return
}

if (file.size > 5 * 1024 * 1024) {
  setMessage('Image size must not exceed 5 MB.')
  e.target.value = ''
  return
}

if (preview) URL.revokeObjectURL(preview)

setImage(file)
setPreview(URL.createObjectURL(file))
setMessage('')

}

async function handleSave(e) {
e.preventDefault()
setSaving(true)
setMessage('')

let uploadedImagePath = null

try {
  if (!user) throw new Error('Please log in again.')

  let avatarUrl = form.avatar_url

  if (image) {
    const safeName = image.name.replace(/[^a-zA-Z0-9.-]/g, '-')
    const filePath = `${user.id}/profile-${Date.now()}-${safeName}`

    const { error: uploadError } = await supabase.storage
      .from('article-images')
      .upload(filePath, image, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    uploadedImagePath = filePath

    const { data: imageData } = supabase.storage
      .from('article-images')
      .getPublicUrl(filePath)

    avatarUrl = imageData.publicUrl
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: form.full_name.trim(),
      bio: form.bio.trim(),
      avatar_url: avatarUrl
    })
    .eq('id', user.id)

  if (error) throw error

  setForm({
    ...form,
    full_name: form.full_name.trim(),
    bio: form.bio.trim(),
    avatar_url: avatarUrl
  })

  if (preview) URL.revokeObjectURL(preview)

  setImage(null)
  setPreview('')
  setMessage('Administrator profile updated successfully!')
} catch (error) {
  if (uploadedImagePath) {
    await supabase.storage
      .from('article-images')
      .remove([uploadedImagePath])
  }

  setMessage(error.message)
} finally {
  setSaving(false)
}

}

if (loading) {
return <div className="auth-page">Loading administrator profile...</div>
}

return (
<div className="admin-profile-page">
<div className="admin-profile-container">

    <header className="admin-profile-heading">
      <div>
        <span className="admin-profile-eyebrow">ADMINISTRATION</span>
        <h1>Admin Profile</h1>
        <p>Manage your professional identity on TechScope.</p>
      </div>

      <button
        className="admin-profile-back"
        onClick={() => navigate('/admin')}
      >
        ← Back to Dashboard
      </button>
    </header>

    <div className="admin-profile-layout">

      <section className="admin-profile-card admin-profile-summary">
        <div className="admin-profile-avatar">
          {preview || form.avatar_url ? (
            <img
              src={preview || form.avatar_url}
              alt="Administrator profile"
            />
          ) : (
            <div className="admin-profile-placeholder">
              {form.full_name.charAt(0).toUpperCase() || 'A'}
            </div>
          )}
        </div>

        <h2>{form.full_name || 'Administrator'}</h2>

        <span className="admin-profile-role">
          TECHSCOPE ADMINISTRATOR
        </span>

        <p>{user?.email}</p>

        <div className="admin-profile-summary-note">
          Your professional identity represents you across TechScope.
        </div>
      </section>

      <section className="admin-profile-card admin-profile-details">
        <div className="admin-profile-section-heading">
          <h2>Personal Information</h2>
          <p>Update your public administrator profile.</p>
        </div>

        <form onSubmit={handleSave}>

          <div className="admin-profile-field">
            <label htmlFor="full_name">Full Name</label>
            <input
              id="full_name"
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="admin-profile-field">
            <label htmlFor="bio">Professional Biography</label>
            <textarea
              id="bio"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows="5"
              placeholder="Tell the TechScope community about yourself..."
            />
          </div>

          <div className="admin-profile-field">
            <label htmlFor="avatar">Profile Picture</label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            <small>JPEG, PNG or WEBP recommended. Maximum size: 5 MB.</small>
          </div>

          <div className="admin-profile-field">
            <label htmlFor="email">Registered Email</label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
            />
          </div>

          <div className="admin-profile-field">
            <label htmlFor="created">Account Created</label>
            <input
              id="created"
              type="text"
              value={
                user?.created_at
                  ? new Date(user.created_at).toLocaleDateString()
                  : ''
              }
              disabled
            />
          </div>

          {message && (
            <div className={`admin-profile-message ${
              message.includes('successfully') ? 'success' : 'error'
            }`}>
              {message}
            </div>
          )}

          <button
            className="admin-profile-save-btn"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>

        </form>
      </section>

    </div>
  </div>
</div>

)
}

export default AdminProfile