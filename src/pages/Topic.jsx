import { useParams, Link } from 'react-router-dom'

const topics = {
  'artificial-intelligence': {
    icon: '🤖',
    title: 'Artificial Intelligence',
    subtitle: 'Understanding machines that can learn, reason and make decisions.',
    introduction: 'Artificial Intelligence (AI) is a branch of computer science focused on creating systems capable of performing tasks that normally require human intelligence.',
    concepts: [
      {
        title: 'Machine Learning',
        description: 'A technology that allows computers to learn patterns from data and improve their performance without being explicitly programmed for every task.'
      },
      {
        title: 'Deep Learning',
        description: 'A specialized area of machine learning that uses artificial neural networks to process complex information.'
      },
      {
        title: 'Generative AI',
        description: 'AI systems capable of generating new content, including text, images, audio and computer code.'
      },
      {
        title: 'Natural Language Processing',
        description: 'Technology that enables computers to understand, interpret and generate human language.'
      }
    ],
    applications: [
      'Healthcare and medical diagnosis',
      'Autonomous vehicles',
      'Virtual assistants and chatbots',
      'Fraud detection',
      'Education and personalized learning'
    ]
  },

  'cloud-computing-aws': {
    icon: '☁️',
    title: 'Cloud Computing & AWS',
    subtitle: 'Understanding computing resources delivered over the internet.',
    introduction: 'Cloud computing provides access to computing resources such as servers, storage, databases and software through the internet instead of relying entirely on local computers.',
    concepts: [
      {
        title: 'Infrastructure as a Service (IaaS)',
        description: 'Provides virtual computing infrastructure, including servers, storage and networking.'
      },
      {
        title: 'Platform as a Service (PaaS)',
        description: 'Provides an environment where developers can build, test and deploy applications.'
      },
      {
        title: 'Software as a Service (SaaS)',
        description: 'Delivers software applications over the internet without requiring users to install and maintain the underlying infrastructure.'
      },
      {
        title: 'Amazon Web Services (AWS)',
        description: 'A cloud computing platform offering services for computing, storage, databases, networking and application deployment.'
      }
    ],
    applications: [
      'Website hosting',
      'Cloud storage and backup',
      'Application deployment',
      'Data processing',
      'Enterprise infrastructure'
    ]
  },

  cybersecurity: {
    icon: '🔐',
    title: 'Cybersecurity',
    subtitle: 'Protecting computers, networks and information from digital threats.',
    introduction: 'Cybersecurity involves the technologies, processes and practices used to protect systems, networks and digital information against unauthorized access, attacks and damage.',
    concepts: [
      {
        title: 'Encryption',
        description: 'Converts readable information into an encoded form to protect it from unauthorized access.'
      },
      {
        title: 'Firewalls',
        description: 'Monitor and control network traffic according to predefined security rules.'
      },
      {
        title: 'Ethical Hacking',
        description: 'Authorized security testing used to identify and fix weaknesses in computer systems.'
      },
      {
        title: 'Authentication',
        description: 'Verifies the identity of users before granting access to systems and information.'
      }
    ],
    applications: [
      'Online banking security',
      'Personal data protection',
      'Network security',
      'Business information protection',
      'Secure communication'
    ]
  },

  'computer-networking': {
    icon: '🌐',
    title: 'Computer Networking',
    subtitle: 'Understanding how computers communicate and share resources.',
    introduction: 'Computer networking involves connecting computers and other devices so they can exchange information and share resources.',
    concepts: [
      {
        title: 'IP Addressing',
        description: 'A system used to identify devices and enable communication across networks.'
      },
      {
        title: 'Routers',
        description: 'Devices that forward data packets between different networks.'
      },
      {
        title: 'DNS',
        description: 'The Domain Name System translates domain names into IP addresses.'
      },
      {
        title: 'Network Protocols',
        description: 'Rules that govern how devices exchange information, including TCP, UDP and HTTP.'
      }
    ],
    applications: [
      'Internet connectivity',
      'University computer laboratories',
      'Enterprise communication',
      'Cloud infrastructure',
      'Wireless communication'
    ]
  },

  'software-development': {
    icon: '💻',
    title: 'Software Development',
    subtitle: 'Understanding how digital applications and systems are created.',
    introduction: 'Software development is the process of designing, building, testing and maintaining computer programs and applications.',
    concepts: [
      {
        title: 'Frontend Development',
        description: 'Focuses on the visible parts of applications that users interact with.'
      },
      {
        title: 'Backend Development',
        description: 'Handles server-side operations, databases, authentication and application logic.'
      },
      {
        title: 'APIs',
        description: 'Allow different software applications to communicate and exchange information.'
      },
      {
        title: 'Version Control',
        description: 'Helps developers track code changes and collaborate on software projects.'
      }
    ],
    applications: [
      'Web applications',
      'Mobile applications',
      'Desktop software',
      'Enterprise systems',
      'Digital platforms'
    ]
  },

  'data-science': {
    icon: '📊',
    title: 'Data Science',
    subtitle: 'Turning information into meaningful insights and decisions.',
    introduction: 'Data science combines statistics, programming and analytical techniques to extract useful information and knowledge from data.',
    concepts: [
      {
        title: 'Data Analysis',
        description: 'Examines datasets to discover patterns, trends and useful information.'
      },
      {
        title: 'Data Visualization',
        description: 'Uses charts, graphs and visual representations to communicate information.'
      },
      {
        title: 'Statistics',
        description: 'Provides mathematical methods for understanding and interpreting data.'
      },
      {
        title: 'Predictive Analytics',
        description: 'Uses historical information and statistical models to estimate future outcomes.'
      }
    ],
    applications: [
      'Business intelligence',
      'Healthcare research',
      'Financial forecasting',
      'Scientific research',
      'Artificial intelligence'
    ]
  }
}

function Topic() {
  const { slug } = useParams()
  const topic = topics[slug]

  if (!topic) {
    return (
      <div className="topic-not-found">
        <h2>Topic not found</h2>
        <Link to="/explore">Return to Explore</Link>
      </div>
    )
  }

  return (
    <div className="topic-page">

      <section className="topic-hero">
        <Link to="/explore" className="back-link">
          ← Back to Explore
        </Link>

        <div className="topic-icon">{topic.icon}</div>

        <span className="eyebrow">TECHSCOPE KNOWLEDGE HUB</span>

        <h1>{topic.title}</h1>

        <p>{topic.subtitle}</p>
      </section>

      <section className="topic-content">

        <div className="topic-introduction">
          <span className="eyebrow">INTRODUCTION</span>
          <h2>Understanding {topic.title}</h2>
          <p>{topic.introduction}</p>
        </div>

        <div className="topic-concepts">
          <span className="eyebrow">CORE KNOWLEDGE</span>
          <h2>Important concepts</h2>

          <div className="concept-grid">
            {topic.concepts.map((concept) => (
              <article className="concept-card" key={concept.title}>
                <h3>{concept.title}</h3>
                <p>{concept.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="topic-applications">
          <span className="eyebrow">REAL-WORLD APPLICATIONS</span>
          <h2>Where is it used?</h2>

          <ul>
            {topic.applications.map((application) => (
              <li key={application}>{application}</li>
            ))}
          </ul>
        </div>

        <div className="topic-bottom">
          <h2>Keep exploring technology.</h2>
          <p>There is always something new to discover.</p>
          <Link to="/explore" className="primary-button">
            Explore more topics →
          </Link>
        </div>

      </section>
    </div>
  )
}

export default Topic