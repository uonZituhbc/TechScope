import { Link } from 'react-router-dom'

const topics = [
  {
    icon: "🤖",
    title: "Artificial Intelligence",
    slug: "artificial-intelligence",
    description: "Understand intelligent machines, machine learning, neural networks and generative AI.",
    level: "Beginner to Advanced"
  },
  {
    icon: "☁️",
    title: "Cloud Computing & AWS",
    slug: "cloud-computing-aws",
    description: "Explore cloud infrastructure, Amazon Web Services, cloud storage and deployment.",
    level: "Beginner to Advanced"
  },
  {
    icon: "🔐",
    title: "Cybersecurity",
    slug: "cybersecurity",
    description: "Discover encryption, ethical hacking, network security and digital protection.",
    level: "Beginner to Advanced"
  },
  {
    icon: "🌐",
    title: "Computer Networking",
    slug: "computer-networking",
    description: "Learn about IP addresses, routers, protocols, servers and internet communication.",
    level: "Beginner to Advanced"
  },
  {
    icon: "💻",
    title: "Software Development",
    slug: "software-development",
    description: "Explore programming languages, web development, APIs and software engineering.",
    level: "Beginner to Advanced"
  },
  {
    icon: "📊",
    title: "Data Science",
    slug: "data-science",
    description: "Understand data analysis, visualization, statistics and machine learning.",
    level: "Beginner to Advanced"
  }
];

function Explore() {
  return (
    <div className="explore-page">

      <section className="explore-hero">
        <span className="eyebrow">DISCOVER TECHNOLOGY</span>

        <h1>
          Explore the world of
          <span> technology.</span>
        </h1>

        <p>
          From the fundamentals of computing to emerging innovations,
          discover knowledge that helps you understand our digital world.
        </p>
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">KNOWLEDGE HUB</span>
            <h2>Explore by category</h2>
            <p>Choose an area and begin your learning journey.</p>
          </div>
        </div>

        <div className="category-grid">
          {topics.map((topic) => (
            <div className="category-card" key={topic.title}>
              <div className="category-icon">{topic.icon}</div>

              <h3>{topic.title}</h3>

              <p>{topic.description}</p>

              <small>{topic.level}</small>

              <div style={{ marginTop: "20px" }}>
                <Link to={`/explore/${topic.slug}`}>
                  Explore topic →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="community">
        <span className="eyebrow">KEEP DISCOVERING</span>

        <h2>Knowledge begins with curiosity.</h2>

        <p>
          Every technology has a story. Start exploring,
          asking questions and discovering how things work.
        </p>
      </section>

    </div>
  );
}

export default Explore;