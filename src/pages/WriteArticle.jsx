import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function WriteArticle() {
const navigate = useNavigate()
const [searchParams] = useSearchParams()

const editId = searchParams.get('edit')
const isEditing = Boolean(editId)

const [form, setForm] = useState({
title: '',
category: '',
excerpt: '',
content: '',
source_url: '',
tags: ''
})

const [image, setImage] = useState(null)
const [preview, setPreview] = useState('')
const [existingImage, setExistingImage] = useState('')
const [loading, setLoading] = useState(false)
const [pageLoading, setPageLoading] = useState(isEditing)
const [message, setMessage] = useState('')
const [article, setArticle] = useState(null)

useEffect(() => {
if (isEditing) {
loadArticle()
}
}, [editId])

async function loadArticle() {
try {
const { data: authData, error: authError } =
await supabase.auth.getUser()

  if (authError || !authData.user) {
    navigate('/login')
    return
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', editId)
    .eq('author_id', authData.user.id)
    .single()

  if (error) throw error

  if (!['draft', 'rejected'].includes(data.status)) {
    throw new Error('Only draft or rejected articles can be edited.')
  }

  setArticle(data)

  setForm({
    title: data.title || '',
    category: data.category || '',
    excerpt: data.excerpt || '',
    content: data.content || '',
    source_url: data.source_url || '',
    tags: Array.isArray(data.tags) ? data.tags.join(', ') : ''
  })

  setExistingImage(data.featured_image_url || '')

} catch (error) {
  setMessage(error.message)
} finally {
  setPageLoading(false)
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

const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif'
]

if (!allowedTypes.includes(file.type)) {
  setMessage('Please select a JPG, PNG, WEBP or GIF image.')
  e.target.value = ''
  return
}

if (file.size > 5 * 1024 * 1024) {
  setMessage('Image size must not exceed 5 MB.')
  e.target.value = ''
  return
}

setImage(file)
setPreview(URL.createObjectURL(file))
setMessage('')

}

async function handleSubmit(e, status) {
e.preventDefault()
setMessage('')

if (form.source_url.trim()) {
  try {
    const url = new URL(form.source_url)

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error()
    }
  } catch {
    setMessage('Please enter a valid source URL.')
    return
  }
}

setLoading(true)

let uploadedImagePath = null

try {
  const { data: authData, error: authError } =
    await supabase.auth.getUser()

  if (authError || !authData.user) {
    throw new Error('Please log in before continuing.')
  }

  const user = authData.user

  let imageUrl = existingImage

  // Upload a replacement image if selected
  if (image) {
    const safeName = image.name.replace(/[^a-zA-Z0-9.-]/g, '-')
    const filePath = `${user.id}/${Date.now()}-${safeName}`

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

    imageUrl = imageData.publicUrl
  }

  const tags = form.tags
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)

  const articleData = {
    title: form.title.trim(),
    category: form.category,
    excerpt: form.excerpt.trim(),
    content: form.content.trim(),
    source_url: form.source_url.trim() || null,
    tags,
    featured_image_url: imageUrl,
    status
  }

  if (isEditing) {
    const { error } = await supabase
      .from('articles')
      .update(articleData)
      .eq('id', editId)
      .eq('author_id', user.id)

    if (error) throw error

  } else {
    const slug =
      form.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now()

    const { error } = await supabase
      .from('articles')
      .insert({
        ...articleData,
        author_id: user.id,
        slug
      })

    if (error) throw error
  }

  setMessage(
    status === 'draft'
      ? 'Article saved successfully as a draft!'
      : 'Article submitted successfully for admin review!'
  )

  setTimeout(() => {
    navigate('/dashboard/articles')
  }, 1800)

} catch (error) {
  // Remove a newly uploaded image if the database operation failed
  if (uploadedImagePath) {
    await supabase.storage
      .from('article-images')
      .remove([uploadedImagePath])
  }

  setMessage(error.message)

} finally {
  setLoading(false)
}

}

if (pageLoading) {
return <div className="auth-page">Loading article...</div>
}

return (
<div className="write-page">

  <header className="write-header">
    <Link to="/dashboard" className="write-brand">
      TechScope
    </Link>

    <Link to="/dashboard/articles" className="write-back">
      ← My Articles
    </Link>
  </header>

  <main className="write-container">

    <div className="write-intro">
      <h1>{isEditing ? 'Edit Article' : 'Create an Article'}</h1>

      <p>
        {isEditing
          ? 'Update your article and submit your changes.'
          : 'Share your knowledge, ideas and discoveries with TechScope.'}
      </p>
    </div>

    {article?.status === 'rejected' && (
      <div className="write-message">
        <strong>Administrator Feedback:</strong>
        <p>{article.admin_feedback || 'Please review and improve your article.'}</p>
      </div>
    )}

    <form className="write-form" onSubmit={e => handleSubmit(e, 'pending')}>

      <div className="write-field">
        <label>Article Title *</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter an engaging article title"
          required
        />
      </div>

      <div className="write-field">
        <label>Category *</label>
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="">Select a category</option>
          <option>Artificial Intelligence</option>
          <option>Cloud Computing & AWS</option>
          <option>Cybersecurity</option>
          <option>Computer Networking</option>
          <option>Software Development</option>
          <option>Data Science</option>
          <option>Technology News</option>
          <option>Innovation</option>
        </select>
      </div>

      <div className="write-field">
        <label>Short Description *</label>
        <textarea
          name="excerpt"
          value={form.excerpt}
          onChange={handleChange}
          placeholder="Give readers a brief introduction..."
          rows="3"
          required
        />
      </div>

      <div className="write-field">
        <label>Featured Image</label>

        <p className="write-hint">
          Upload JPG, PNG, WEBP or GIF. Maximum size: 5 MB.
        </p>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageChange}
        />

        {(preview || existingImage) && (
          <div className="image-preview">

            <img
              src={preview || existingImage}
              alt="Article featured image"
            />

            <button
              type="button"
              onClick={() => {
                if (preview) URL.revokeObjectURL(preview)
                setImage(null)
                setPreview('')
                setExistingImage('')
              }}
            >
              Remove Image
            </button>

          </div>
        )}
      </div>

      <div className="write-field">
        <label>Article Content *</label>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="Write your complete article here..."
          rows="14"
          required
        />
      </div>

      <div className="write-field">
        <label>Source / Reference URL</label>
        <input
          type="url"
          name="source_url"
          value={form.source_url}
          onChange={handleChange}
          placeholder="https://example.com/reference"
        />
      </div>

      <div className="write-field">
        <label>Article Tags</label>
        <input
          type="text"
          name="tags"
          value={form.tags}
          onChange={handleChange}
          placeholder="AI, Technology, Innovation"
        />
        <p className="write-hint">Separate tags using commas.</p>
      </div>

      {message && (
        <div className="write-message">
          {message}
        </div>
      )}

      <div className="write-buttons">

        <button
          type="button"
          disabled={loading}
          onClick={e => handleSubmit(e, 'draft')}
        >
          {loading ? 'Processing...' : 'Save as Draft'}
        </button>

        <button type="submit" disabled={loading}>
          {loading
            ? 'Processing...'
            : isEditing
              ? 'Resubmit for Review →'
              : 'Submit for Review →'}
        </button>

      </div>

    </form>

  </main>
</div>

)
}

export default WriteArticle