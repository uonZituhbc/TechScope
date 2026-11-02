import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Enquiry',
    message: '',
  })

  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })

    setSubmitted(false)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setSubmitted(false)
    setError('')

    try {
      const { error: submissionError } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            subject: formData.subject,
            message: formData.message.trim(),
          },
        ])

      if (submissionError) {
        throw submissionError
      }

      setSubmitted(true)

      setFormData({
        name: '',
        email: '',
        subject: 'General Enquiry',
        message: '',
      })

    } catch (err) {
      console.error('Contact form error:', err)
      setError('Your message could not be sent. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="contact-page">

      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero-content">
          <span className="section-label">GET IN TOUCH</span>

          <h1>Let's start a conversation.</h1>

          <p>
            Have a question, an idea, a contribution or an opportunity?
            We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-container">

        <div className="contact-information">
          <span className="section-label">CONTACT TECHSCOPE</span>

          <h2>We are always open to meaningful conversations.</h2>

          <p>
            Whether you're a student, developer, researcher,
            technology enthusiast or organization, TechScope
            welcomes your ideas and enquiries.
          </p>

          <div className="contact-info-card">
            <span>✉️</span>
            <div>
              <h3>Email</h3>
              <p>Official email address coming soon.</p>
            </div>
          </div>

          <div className="contact-info-card">
            <span>🌍</span>
            <div>
              <h3>Platform</h3>
              <p>TechScope – Technology Made Simple.</p>
            </div>
          </div>

          <div className="contact-info-card">
            <span>🤝</span>
            <div>
              <h3>Contributions & Partnerships</h3>
              <p>
                Interested in writing, collaborating or partnering
                with us? Send us a message.
              </p>
            </div>
          </div>

          <div className="contact-community">
            <h3>Explore TechScope</h3>
            <p>
              Discover educational content, technology updates
              and innovation stories.
            </p>

            <Link to="/explore">
              Explore Technology →
            </Link>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form-wrapper">
          <h2>Send us a message</h2>

          <p>Fill in the details below and tell us how we can help.</p>

          {submitted && (
            <div className="contact-success">
              Thank you for contacting TechScope!
              Your message has been received successfully.
              Our team will review your enquiry.
            </div>
          )}

          {error && (
            <div className="contact-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Enquiry Type</label>

              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              >
                <option>General Enquiry</option>
                <option>Article Contribution</option>
                <option>Partnership</option>
                <option>Technical Support</option>
                <option>Feedback</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Your Message</label>

              <textarea
                id="message"
                name="message"
                rows="6"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <button
              type="submit"
              className="contact-submit-btn"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Message →'}
            </button>

          </form>
        </div>

      </section>

    </div>
  )
}

export default Contact