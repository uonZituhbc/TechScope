import { useEffect, useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { supabase } from './lib/supabase'
import './DashboardMobile.css';

import Explore from './pages/Explore'
import Topic from './pages/Topic'
import TechNews from './pages/TechNews'
import Article from './pages/Article'
import About from './pages/About'
import Contact from './pages/Contact'
import Register from './pages/Register'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import WriteArticle from './pages/WriteArticle'
import MyArticles from './pages/MyArticles'
import MyProfile from './pages/MyProfile'
import AccountSettings from './pages/AccountSettings'
import ContributorProfile from './pages/ContributorProfile'
import AdminDashboard from './pages/AdminDashboard'
import PendingReviews from './pages/PendingReviews'
import AdminArticlePreview from './pages/AdminArticlePreview'
import ApprovedArticles from './pages/ApprovedArticles'
import AdminArticles from './pages/AdminArticles'
import AdminContributors from './pages/AdminContributors'
import AdminDeactivatedAccounts from './pages/AdminDeactivatedAccounts'
import AdminWriteArticle from './pages/AdminWriteArticle'
import AdminProfile from './pages/AdminProfile'
import GalleryManagement from './pages/GalleryManagement'
import Gallery from './pages/Gallery'
import AdminAccountSettings from './pages/AdminAccountSettings'
import AdminMessages from './pages/AdminMessages'

const categories = [
  {
    icon: '🤖',
    title: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    desc: 'Explore AI, machine learning and intelligent systems.'
  },
  {
    icon: '☁️',
    title: 'Cloud Computing & AWS',
    slug: 'cloud-computing-aws',
    desc: 'Discover AWS, cloud infrastructure and deployment.'
  },
  {
    icon: '🔐',
    title: 'Cybersecurity',
    slug: 'cybersecurity',
    desc: 'Understand digital security, privacy and encryption.'
  },
  {
    icon: '🌐',
    title: 'Computer Networking',
    slug: 'computer-networking',
    desc: 'Explore networks, internet technologies and protocols.'
  },
  {
    icon: '💻',
    title: 'Software Development',
    slug: 'software-development',
    desc: 'Learn programming, applications and software engineering.'
  },
  {
    icon: '📊',
    title: 'Data Science',
    slug: 'data-science',
    desc: 'Discover data analytics, visualization and insights.'
  }
]

const featuredArticles = [
  {
    id: 'featured-ai',
    slug: 'understanding-the-evolution-of-artificial-intelligence',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=700',
    category: 'Artificial Intelligence',
    title: 'Understanding the evolution of Artificial Intelligence',
    date: 'Technology Insights',
    author: 'TechScope Editorial',
    featured: true
  },
  {
    id: 'featured-cloud',
    slug: 'how-cloud-computing-is-transforming-modern-businesses',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=700',
    category: 'Cloud Computing',
    title: 'How cloud computing is transforming modern businesses',
    date: 'Cloud Technology',
    author: 'TechScope Editorial',
    featured: true
  },
  {
    id: 'featured-cybersecurity',
    slug: 'why-cybersecurity-matters-in-our-digital-world',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=700',
    category: 'Cybersecurity',
    title: 'Why cybersecurity matters in our digital world',
    date: 'Digital Security',
    author: 'TechScope Editorial',
    featured: true
  }
]

/* =====================================
   HOMEPAGE GALLERY
   Three static images + latest public
   images uploaded by the administrator.
===================================== */

function HomepageGallery() {
  const [galleryImages, setGalleryImages] = useState([])

  const staticImages = [
    {
      id: 'static-1',
      image_url:
        'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
      title: 'Technology collaboration'
    },
    {
      id: 'static-2',
      image_url:
        'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
      title: 'Robotics innovation'
    },
    {
      id: 'static-3',
      image_url:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      title: 'Digital technology'
    }
  ]

  useEffect(() => {
    const fetchGalleryImages = async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('id, title, image_url, category')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) {
        console.error('Homepage gallery error:', error)
        return
      }

      setGalleryImages(data || [])
    }

    fetchGalleryImages()
  }, [])

  const images = [
    ...staticImages,
    ...galleryImages.map((image) => ({
      ...image,
      id: `uploaded-${image.id}`
    }))
  ]

  return (
    <div className="gallery-grid">
      {images.map((image) => (
        <img
          key={image.id}
          src={image.image_url}
          alt={image.title || 'Technology image'}
          loading="lazy"
        />
      ))}
    </div>
  )
}

/* =====================================
   HOMEPAGE
===================================== */

function Home() {
  const [publishedArticles, setPublishedArticles] = useState([])

  useEffect(() => {
    fetchPublishedArticles()
  }, [])

  const fetchPublishedArticles = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select(
        'id, slug, title, category, excerpt, featured_image_url, published_at, profiles ( full_name )'
      )
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(6)

    if (error) {
      console.error('Homepage articles loading error:', error)
      return
    }

    setPublishedArticles(data || [])
  }

  const contributorArticles = publishedArticles.map(article => ({
    id: article.id,
    slug: article.slug,
    image: article.featured_image_url,
    category: article.category,
    title: article.title,
    description: article.excerpt,
    date: article.published_at
      ? new Date(article.published_at).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric'
        })
      : 'Recently published',
    author: article.profiles?.full_name || 'TechScope Contributor',
    featured: false
  }))

  const homepageArticles = [
    ...featuredArticles,
    ...contributorArticles
  ]

  return (
    <>
      <header className="navbar">
        <Link to="/" className="logo">
          Tech<span>Scope</span>
          <small>TECHNOLOGY MADE SIMPLE</small>
        </Link>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/explore">Explore</Link>
          <Link to="/news">Tech News</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <a href="#community" className="nav-button">
          Join Community
        </a>
      </header>

      <main>
        {/* HERO SECTION */}

        <section className="hero">
          <div className="hero-content">
            <span className="eyebrow">WELCOME TO TECHSCOPE</span>

            <h1>
              Understand technology.
              <span> Explore what's possible.</span>
            </h1>

            <p>
              Your destination for technology knowledge, discoveries,
              innovations and the latest developments shaping our digital world.
            </p>

            <div className="hero-buttons">
              <a href="#explore" className="primary-button">
                Explore Technology →
              </a>

              <a href="#news" className="secondary-button">
                Discover Updates
              </a>
            </div>

            <div className="hero-note">
              <span></span>
              Knowledge. Discovery. Innovation.
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000"
              alt="Modern computer technology"
            />

            <div className="image-caption">
              <span>01 / EXPLORE TECHNOLOGY</span>
              <strong>Discover the world behind technology.</strong>
            </div>
          </div>
        </section>

        {/* INTRODUCTION SECTION */}

        <section className="intro section" id="about">
          <span className="eyebrow">INTRODUCING TECHSCOPE</span>

          <h2>
            Technology becomes powerful
            <span> when knowledge is shared.</span>
          </h2>

          <p>
            From emerging technologies to everyday digital innovations,
            TechScope brings complex ideas closer to everyone through
            explanations, news, tutorials and visual discoveries.
          </p>
        </section>

        {/* CATEGORIES SECTION */}

        <section className="categories section" id="explore">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE AND LEARN</span>
              <h2>Explore technology</h2>
              <p>Discover the fields shaping our digital future.</p>
            </div>

            <Link to="/explore" className="text-link">
              Explore more →
            </Link>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <div className="category-card" key={category.title}>
                <div className="category-icon">{category.icon}</div>

                <h3>{category.title}</h3>

                <p>{category.desc}</p>

                <Link
                  to={`/explore/${category.slug}`}
                  className="text-link"
                >
                  Discover topic →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* LATEST ARTICLES SECTION */}

        <section className="news section" id="news">
          <div className="section-heading">
            <div>
              <span className="eyebrow">STAY INFORMED</span>
              <h2>Latest technology insights</h2>
              <p>Ideas and developments worth exploring.</p>
            </div>

            <Link to="/news" className="text-link">
              View all articles →
            </Link>
          </div>

          <div className="article-grid">
            {homepageArticles.map((article) => (
              <article className="article-card" key={article.id}>
                {article.image ? (
                  <img src={article.image} alt={article.title} />
                ) : (
                  <div className="article-image-placeholder">
                    TechScope
                  </div>
                )}

                <div className="article-content">
                  <span className="article-category">
                    {article.category}
                  </span>

                  <h3>{article.title}</h3>

                  {article.description && (
                    <p>{article.description}</p>
                  )}

                  <p>
                    {article.author} · {article.date}
                  </p>

                  <Link to={`/article/${article.slug}`}>
                    Read article →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* TECHNOLOGY GALLERY SECTION */}

        <section className="gallery section" id="gallery">
          <div className="section-heading">
            <div>
              <span className="eyebrow">VISUAL DISCOVERIES</span>
              <h2>Technology in pictures</h2>
              <p>
                A closer look at the innovations shaping our world.
              </p>
            </div>

            <Link to="/gallery" className="text-link">
              View full gallery →
            </Link>
          </div>

          <HomepageGallery />
        </section>

        {/* COMMUNITY SECTION */}

        <section className="community" id="community">
          <span className="eyebrow">BE PART OF THE DISCOVERY</span>

          <h2>Technology grows when knowledge is shared.</h2>

          <p>
            Join a growing community of learners, developers,
            researchers and technology enthusiasts.
          </p>

          <div className="community-actions">
            <Link to="/register" className="primary-button">
              Become a Contributor →
            </Link>

            <p className="community-login">
              Already a contributor?
              <Link to="/login">Login here</Link>
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}

      <footer>
        <Link to="/" className="logo">
          Tech<span>Scope</span>
          <small>TECHNOLOGY MADE SIMPLE</small>
        </Link>

        <p>
          Exploring technology. Sharing knowledge. Inspiring innovation.
        </p>

        <p className="copyright">
          © 2026 TechScope. All rights reserved.
        </p>
      </footer>
    </>
  )
}

/* =====================================
   APPLICATION ROUTES
===================================== */

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/explore/:slug" element={<Topic />} />
      <Route path="/news" element={<TechNews />} />
      <Route path="/article/:slug" element={<Article />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/write" element={<WriteArticle />} />
      <Route path="/dashboard/articles" element={<MyArticles />} />
      <Route path="/dashboard/profile" element={<MyProfile />} />
      <Route path="/dashboard/settings" element={<AccountSettings />} />
      <Route path="/contributor/:id" element={<ContributorProfile />} />

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/pending" element={<PendingReviews />} />

      <Route
        path="/admin/article/:id"
        element={<AdminArticlePreview />}
      />

      <Route
        path="/admin/published"
        element={<ApprovedArticles />}
      />

      <Route path="/admin/articles" element={<AdminArticles />} />

      <Route
        path="/admin/contributors"
        element={<AdminContributors />}
      />

      <Route
        path="/admin/deactivated"
        element={<AdminDeactivatedAccounts />}
      />

      <Route path="/admin/write" element={<AdminWriteArticle />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
      <Route path="/admin/gallery" element={<GalleryManagement />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/admin/settings" element={<AdminAccountSettings />} />
      <Route path="/admin/messages" element={<AdminMessages />} />
    </Routes>
  )
}

export default App