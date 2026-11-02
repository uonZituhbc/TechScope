import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const categories = [
'Technology',
'Artificial Intelligence',
'Cloud Computing',
'Cybersecurity',
'Networking',
'Software Development',
'Data Science',
'Events',
'Other'
]

function GalleryManagement() {
const [images, setImages] = useState([])
const [loading, setLoading] = useState(true)
const [uploading, setUploading] = useState(false)
const [message, setMessage] = useState('')
const [filter, setFilter] = useState('all')
const [search, setSearch] = useState('')

const [form, setForm] = useState({
title: '',
description: '',
category: 'Technology',
visibility: 'internal'
})

const [file, setFile] = useState(null)
const [preview, setPreview] = useState('')

useEffect(() => {
loadImages()
}, [])

async function loadImages() {
setLoading(true)

try {
  const { data, error } = await supabase
    .from('gallery')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error

  setImages(data || [])
} catch (error) {
  setMessage(error.message)
} finally {
  setLoading(false)
}

}

function handleFileChange(e) {
const selectedFile = e.target.files[0]

if (!selectedFile) return

if (!selectedFile.type.startsWith('image/')) {
  setMessage('Please select a valid image.')
  e.target.value = ''
  return
}

if (selectedFile.size > 5 * 1024 * 1024) {
  setMessage('Image must not exceed 5 MB.')
  e.target.value = ''
  return
}

if (preview) URL.revokeObjectURL(preview)

setFile(selectedFile)
setPreview(URL.createObjectURL(selectedFile))
setMessage('')

}

async function handleUpload(e) {
e.preventDefault()

if (!file) {
  setMessage('Please select an image first.')
  return
}

setUploading(true)
setMessage('')

let uploadedPath = null

try {
  const { data: authData, error: authError } =
    await supabase.auth.getUser()

  if (authError || !authData.user) {
    throw new Error('Please log in again.')
  }

  const authenticatedUser = authData.user
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '-')
  const storagePath = `${authenticatedUser.id}/gallery/${Date.now()}-${safeName}`

  const { error: uploadError } = await supabase.storage
    .from('article-images')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) throw uploadError

  uploadedPath = storagePath

  const { data: imageData } = supabase.storage
    .from('article-images')
    .getPublicUrl(storagePath)

  const { error: insertError } = await supabase
    .from('gallery')
    .insert({
      title: form.title.trim(),
      description: form.description.trim(),
      image_url: imageData.publicUrl,
      storage_path: storagePath,
      category: form.category,
      visibility: form.visibility,
      uploaded_by: authenticatedUser.id
    })

  if (insertError) throw insertError

  if (preview) URL.revokeObjectURL(preview)

  setForm({
    title: '',
    description: '',
    category: 'Technology',
    visibility: 'internal'
  })

  setFile(null)
  setPreview('')
  setMessage('Image uploaded successfully!')

  await loadImages()
} catch (error) {
  if (uploadedPath) {
    await supabase.storage
      .from('article-images')
      .remove([uploadedPath])
  }

  setMessage(error.message)
} finally {
  setUploading(false)
}

}

async function toggleVisibility(item) {
const newVisibility =
item.visibility === 'public' ? 'internal' : 'public'

const { error } = await supabase
  .from('gallery')
  .update({ visibility: newVisibility })
  .eq('id', item.id)

if (error) {
  setMessage(error.message)
  return
}

setMessage(`Image moved to ${newVisibility} successfully.`)
loadImages()

}

async function deleteImage(item) {
const confirmed = window.confirm(
`Delete "${item.title}" permanently?`
)

if (!confirmed) return

try {
  const { error: storageError } = await supabase.storage
    .from('article-images')
    .remove([item.storage_path])

  if (storageError) throw storageError

  const { error: deleteError } = await supabase
    .from('gallery')
    .delete()
    .eq('id', item.id)

  if (deleteError) throw deleteError

  setMessage('Image deleted successfully.')
  loadImages()
} catch (error) {
  setMessage(error.message)
}

}

const filteredImages = images.filter(item => {
const matchesFilter =
filter === 'all' || item.visibility === filter

const matchesSearch =
  item.title.toLowerCase().includes(search.toLowerCase()) ||
  item.category.toLowerCase().includes(search.toLowerCase())

return matchesFilter && matchesSearch

})

if (loading) {
return <div className="auth-page">Loading gallery...</div>
}

return (
<div className="gallery-admin-page">

  <div className="gallery-admin-container">

    <header className="gallery-admin-header">
      <div>
        <span>CONTENT MANAGEMENT</span>
        <h1>Gallery Management</h1>
        <p>Manage TechScope images and media resources.</p>
      </div>

      <div className="gallery-admin-stats">
        <div>
          <strong>{images.length}</strong>
          <span>Total Media</span>
        </div>

        <div>
          <strong>
            {images.filter(i => i.visibility === 'public').length}
          </strong>
          <span>Public</span>
        </div>

        <div>
          <strong>
            {images.filter(i => i.visibility === 'internal').length}
          </strong>
          <span>Internal</span>
        </div>
      </div>
    </header>

    <section className="gallery-upload-card">
      <h2>Upload New Media</h2>
      <p>Add images to the TechScope media library.</p>

      <form onSubmit={handleUpload}>

        <div className="gallery-upload-grid">

          <div className="gallery-upload-fields">

            <label>Image Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e =>
                setForm({ ...form, title: e.target.value })
              }
              placeholder="Enter image title"
              required
            />

            <label>Description</label>
            <textarea
              value={form.description}
              onChange={e =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe this image..."
              rows="3"
            />

            <label>Category</label>
            <select
              value={form.category}
              onChange={e =>
                setForm({ ...form, category: e.target.value })
              }
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <label>Visibility</label>
            <select
              value={form.visibility}
              onChange={e =>
                setForm({ ...form, visibility: e.target.value })
              }
            >
              <option value="internal">Internal Library</option>
              <option value="public">Public Gallery</option>
            </select>

            <label>Select Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />

            <small>Maximum image size: 5 MB.</small>

            <button type="submit" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>

          </div>

          <div className="gallery-upload-preview">
            {preview ? (
              <img src={preview} alt="Upload preview" />
            ) : (
              <div>
                <span>＋</span>
                <p>Image preview will appear here</p>
              </div>
            )}
          </div>

        </div>
      </form>

      {message && (
        <div className="gallery-admin-message">
          {message}
        </div>
      )}
    </section>

    <section className="gallery-library-section">

      <div className="gallery-library-heading">
        <div>
          <h2>Media Library</h2>
          <p>Browse and manage your uploaded images.</p>
        </div>

        <input
          type="search"
          placeholder="Search images..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="gallery-filter-buttons">
        {[
          { label: 'All Media', value: 'all' },
          { label: 'Public Gallery', value: 'public' },
          { label: 'Internal Library', value: 'internal' }
        ].map(option => (
          <button
            key={option.value}
            className={filter === option.value ? 'active' : ''}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filteredImages.length === 0 ? (
        <div className="gallery-empty-state">
          <h3>No images found</h3>
          <p>Upload your first image to start building the library.</p>
        </div>
      ) : (
        <div className="gallery-admin-grid">
          {filteredImages.map(item => (
            <article className="gallery-admin-item" key={item.id}>

              <img src={item.image_url} alt={item.title} />

              <div className="gallery-admin-item-content">
                <span className="gallery-category">
                  {item.category}
                </span>

                <h3>{item.title}</h3>

                <p>{item.description || 'No description provided.'}</p>

                <span className={`gallery-visibility ${item.visibility}`}>
                  {item.visibility === 'public'
                    ? 'Public'
                    : 'Internal'}
                </span>

                <div className="gallery-admin-actions">
                  <button onClick={() => toggleVisibility(item)}>
                    {item.visibility === 'public'
                      ? 'Make Internal'
                      : 'Publish'}
                  </button>

                  <button
                    className="delete"
                    onClick={() => deleteImage(item)}
                  >
                    Delete
                  </button>
                </div>
              </div>

            </article>
          ))}
        </div>
      )}

    </section>

  </div>
</div>

)
}

export default GalleryManagement