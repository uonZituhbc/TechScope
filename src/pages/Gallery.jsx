import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function Gallery() {
const [images, setImages] = useState([])
const [loading, setLoading] = useState(true)
const [category, setCategory] = useState('All')
const [selectedImage, setSelectedImage] = useState(null)

useEffect(() => {
loadGallery()
}, [])

async function loadGallery() {
try {
const { data, error } = await supabase
.from('gallery')
.select('id, title, description, image_url, category, created_at')
.eq('visibility', 'public')
.order('created_at', { ascending: false })

  if (error) throw error

  setImages(data || [])
} catch (error) {
  console.error('Gallery loading error:', error.message)
} finally {
  setLoading(false)
}

}

const categories = [
'All',
...new Set(images.map(image => image.category))
]

const filteredImages =
category === 'All'
? images
: images.filter(image => image.category === category)

return (
<main className="public-gallery-page">

  <section className="public-gallery-hero">
    <span>EXPLORE OUR VISUAL WORLD</span>
    <h1>The TechScope Gallery</h1>
    <p>
      Discover technology, innovation, events and ideas
      through our collection of images.
    </p>
  </section>

  <section className="public-gallery-content">

    <div className="public-gallery-heading">
      <div>
        <h2>Explore the Gallery</h2>
        <p>{images.length} published images</p>
      </div>
    </div>

    {!loading && images.length > 0 && (
      <div className="public-gallery-filters">
        {categories.map(item => (
          <button
            key={item}
            className={category === item ? 'active' : ''}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
    )}

    {loading ? (
      <div className="public-gallery-empty">
        Loading gallery...
      </div>
    ) : filteredImages.length === 0 ? (
      <div className="public-gallery-empty">
        <h3>No images available yet</h3>
        <p>
          Our gallery is being updated.
          Please check back soon.
        </p>
      </div>
    ) : (
      <div className="public-gallery-grid">
        {filteredImages.map(image => (
          <article
            className="public-gallery-card"
            key={image.id}
            onClick={() => setSelectedImage(image)}
          >
            <div className="public-gallery-image">
              <img src={image.image_url} alt={image.title} />
              <span>View Image ↗️</span>
            </div>

            <div className="public-gallery-card-info">
              <span>{image.category}</span>
              <h3>{image.title}</h3>
              {image.description && (
                <p>{image.description}</p>
              )}
            </div>
          </article>
        ))}
      </div>
    )}

  </section>

  {selectedImage && (
    <div
      className="public-gallery-modal"
      onClick={() => setSelectedImage(null)}
    >
      <div
        className="public-gallery-modal-content"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="public-gallery-close"
          onClick={() => setSelectedImage(null)}
        >
          ×
        </button>

        <img
          src={selectedImage.image_url}
          alt={selectedImage.title}
        />

        <div>
          <span>{selectedImage.category}</span>
          <h2>{selectedImage.title}</h2>
          <p>{selectedImage.description}</p>
        </div>
      </div>
    </div>
  )}

</main>

)
}

export default Gallery