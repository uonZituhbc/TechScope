import { Link } from 'react-router-dom'

function About() {
  return (
    <div className="about-page">

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="section-label">ABOUT TECHSCOPE</span>

          <h1>
            Exploring Technology.
            <span> Inspiring Innovation.</span>
          </h1>

          <p>
            Technology is shaping the world around us.
            TechScope exists to make that world easier to understand,
            explore and contribute to.
          </p>

          <Link to="/explore" className="about-button">
            Explore Technology →
          </Link>
        </div>
      </section>

      {/* Who We Are */}
      <section className="about-section">
        <div className="about-content">
          <span className="section-label">WHO WE ARE</span>

          <h2>Technology knowledge for everyone.</h2>

          <p>
            TechScope is a technology-focused digital platform dedicated
            to sharing knowledge, exploring emerging technologies and
            highlighting innovation across the digital world.
          </p>

          <p>
            We bring together learners, developers, researchers,
            technology enthusiasts and contributors who believe in
            the power of technology to solve problems and create
            opportunities.
          </p>

          <p>
            Through educational articles, technology updates,
            tutorials and innovation stories, we aim to make
            technology more accessible and understandable.
          </p>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="about-mission-section">
        <div className="about-info-card">
          <div className="about-icon">🎯</div>
          <h3>Our Mission</h3>
          <p>
            To simplify technology, provide valuable knowledge,
            encourage innovation and create opportunities for
            people to learn, share and grow.
          </p>
        </div>

        <div className="about-info-card">
          <div className="about-icon">🌍</div>
          <h3>Our Vision</h3>
          <p>
            To become a trusted technology knowledge platform
            connecting curious minds, inspiring innovators and
            empowering the next generation of technology leaders.
          </p>
        </div>
      </section>

      {/* What We Cover */}
      <section className="about-topics-section">
        <div className="about-heading">
          <span className="section-label">WHAT WE COVER</span>
          <h2>Explore the world of technology.</h2>
          <p>
            We cover different areas of technology to support
            learning, discovery and innovation.
          </p>
        </div>

        <div className="about-topics-grid">
          {[
            ['🤖', 'Artificial Intelligence'],
            ['☁️', 'Cloud Computing'],
            ['🔐', 'Cybersecurity'],
            ['💻', 'Software Development'],
            ['🌐', 'Computer Networking'],
            ['📊', 'Data Science'],
            ['🚀', 'Emerging Technologies'],
            ['🔬', 'Research & Innovation'],
          ].map(([icon, title]) => (
            <div className="about-topic-card" key={title}>
              <span>{icon}</span>
              <h3>{title}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="about-values-section">
        <div className="about-heading">
          <span className="section-label">WHAT DRIVES US</span>
          <h2>Our Core Values</h2>
        </div>

        <div className="about-values-grid">
          <div>
            <h3>Knowledge</h3>
            <p>We believe knowledge should be accessible and shared.</p>
          </div>

          <div>
            <h3>Innovation</h3>
            <p>We encourage creative thinking and technological progress.</p>
          </div>

          <div>
            <h3>Collaboration</h3>
            <p>We believe great ideas grow when people work together.</p>
          </div>

          <div>
            <h3>Integrity</h3>
            <p>We value accuracy, responsibility and trustworthy information.</p>
          </div>
        </div>
      </section>

      {/* Contributors */}
      <section className="about-contributors-section">
        <div>
          <span className="section-label">BE PART OF THE COMMUNITY</span>
          <h2>Have something valuable to share?</h2>

          <p>
            TechScope welcomes writers, developers, researchers,
            students and technology enthusiasts who want to share
            knowledge, publish ideas and contribute to the technology
            community.
          </p>

          <Link to="/contact" className="about-button">
            Get In Touch →
          </Link>
        </div>
      </section>

    </div>
  )
}

export default About