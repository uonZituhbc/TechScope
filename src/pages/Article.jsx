import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const editorialArticles = {
  'understanding-the-evolution-of-artificial-intelligence': {
    title: 'Understanding the evolution of Artificial Intelligence',
    category: 'Artificial Intelligence',
    excerpt: 'Discover how artificial intelligence has evolved and how it continues to transform our world.',
    content: `Artificial Intelligence (AI) has become one of the most influential technologies of our time. From intelligent assistants to advanced healthcare systems, AI is changing how people interact with technology.

What is Artificial Intelligence?

Artificial Intelligence refers to the ability of computer systems to perform tasks that normally require human intelligence. These tasks include learning, reasoning, recognizing patterns, understanding language and solving problems.

The Evolution of AI

The development of AI began with early research into whether machines could simulate human thinking. Over the years, improvements in computing power, algorithms and access to large amounts of data have made AI systems increasingly capable.

Machine learning introduced systems that can learn patterns from data rather than relying entirely on explicitly programmed instructions. Deep learning later expanded these capabilities through artificial neural networks.

How AI Is Transforming Industries

In healthcare, AI helps professionals analyze medical information and support diagnosis.

In education, intelligent learning platforms can help personalize learning experiences.

In software development, AI tools assist developers with writing, reviewing and debugging code.

In business, AI supports automation, customer service and data analysis.

The Future of Artificial Intelligence

AI will continue to influence research, business, education and everyday life. However, responsible development remains important. Issues such as privacy, fairness, transparency and security must be considered.

Conclusion

Artificial Intelligence is not simply a passing technology trend. It is an evolving field that is reshaping the digital world and creating new opportunities for innovation.`,
    source_url: ''
  },

  'how-cloud-computing-is-transforming-modern-businesses': {
    title: 'How cloud computing is transforming modern businesses',
    category: 'Cloud Computing',
    excerpt: 'Discover how cloud platforms are changing the way organizations build, deploy and manage applications.',
    content: `Cloud computing has transformed how businesses access and use computing resources. Instead of maintaining all their own physical infrastructure, organizations can access computing services over the internet.

What Is Cloud Computing?

Cloud computing is the delivery of computing services such as servers, storage, databases, networking and software through the internet.

This allows organizations to access resources when needed without having to purchase and maintain all the necessary hardware themselves.

Benefits of Cloud Computing

Scalability: Businesses can increase or decrease computing resources depending on their needs.

Cost Efficiency: Organizations can reduce some infrastructure and maintenance expenses by using cloud services.

Accessibility: Authorized users can access cloud-based services from different locations.

Reliability: Cloud providers offer infrastructure and services designed to support availability and recovery.

Understanding AWS

Amazon Web Services (AWS) is one of the major cloud computing platforms. It provides services for computing, storage, databases, networking, security and application deployment.

Developers can use AWS services to build applications, host websites, store information and deploy cloud-native systems.

Cloud Computing and Modern Development

Cloud platforms support modern development approaches such as microservices, containers, serverless computing and continuous integration and deployment.

These approaches help development teams build, deploy and maintain applications more efficiently.

Conclusion

Cloud computing has become an important part of modern digital infrastructure. Understanding platforms such as AWS gives developers and organizations valuable skills for building and managing modern applications.`,
    source_url: ''
  },

  'why-cybersecurity-matters-in-our-digital-world': {
    title: 'Why cybersecurity matters in our digital world',
    category: 'Cybersecurity',
    excerpt: 'Understand modern cyber threats and the importance of protecting digital information.',
    content: `As more activities move online, protecting digital information has become increasingly important. Individuals, businesses and institutions depend on technology to communicate, store information and conduct transactions.

What Is Cybersecurity?

Cybersecurity refers to the practices, technologies and processes used to protect computer systems, networks, applications and information from unauthorized access, attacks and damage.

Common Cybersecurity Threats

Phishing: Attackers use deceptive messages and websites to trick people into revealing sensitive information.

Malware: Malicious software can damage devices, steal information or disrupt computer systems.

Ransomware: This type of malware can prevent users from accessing their files until a ransom is demanded.

Data Breaches: Unauthorized access to databases and systems can expose private or confidential information.

Why Cybersecurity Matters

Protecting Personal Information: Security measures help protect passwords, financial information and personal records.

Protecting Organizations: Businesses need to protect their systems, employees and customer information.

Maintaining Trust: Strong security practices help people trust digital platforms and services.

How to Stay Safe Online

Use strong and unique passwords.

Enable multi-factor authentication whenever possible.

Keep operating systems and applications updated.

Avoid suspicious links and unexpected attachments.

Back up important information regularly.

Conclusion

Cybersecurity is a shared responsibility. As technology continues to develop, understanding digital threats and practicing good security habits will remain essential.`,
    source_url: ''
  }
}

const editorialHeadings = [
  'What is Artificial Intelligence?',
  'The Evolution of AI',
  'How AI Is Transforming Industries',
  'The Future of Artificial Intelligence',
  'What Is Cloud Computing?',
  'Benefits of Cloud Computing',
  'Understanding AWS',
  'Cloud Computing and Modern Development',
  'What Is Cybersecurity?',
  'Common Cybersecurity Threats',
  'Why Cybersecurity Matters',
  'How to Stay Safe Online',
  'Conclusion'
]

function Article() {
  const { slug } = useParams()

  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetchArticle()
  }, [slug])

  const fetchArticle = async () => {
    setLoading(true)
    setNotFound(false)
    setArticle(null)

    // Check original TechScope editorial articles first.
    if (editorialArticles[slug]) {
      setArticle(editorialArticles[slug])
      setLoading(false)
      return
    }

    // Retrieve published articles from Supabase.
    const { data, error } = await supabase
      .from('articles')
      .select(`
        id,
        author_id,
        title,
        slug,
        excerpt,
        content,
        category,
        featured_image_url,
        source_url,
        tags,
        published_at,
        profiles (
          full_name,
          avatar_url,
          bio,
          role
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (error) {
      console.error('Article loading error:', error)
      setNotFound(true)
    } else if (!data) {
      setNotFound(true)
    } else {
      setArticle(data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="article-not-found">
        <h2>Loading article...</h2>
        <p>Please wait while we retrieve the article.</p>
      </div>
    )
  }

  if (notFound || !article) {
    return (
      <div className="article-not-found">
        <h2>Article not found</h2>
        <p>
          This article may not exist or may not have been published yet.
        </p>
        <Link to="/news">← Back to Tech News</Link>
      </div>
    )
  }

  const isEditorial = !article.id
  const paragraphs = article.content
    .split(/\n+/)
    .filter(paragraph => paragraph.trim())

  const author = article.profiles

  const authorRole = author?.role === 'admin'
    ? 'TechScope Admin'
    : 'TechScope Contributor'

  return (
    <div className={`article-page ${isEditorial ? 'editorial-article' : ''}`}>
      <div className="article-container">

        <Link to="/news" className="article-back">
          ← Back to Tech News
        </Link>

        <header className="article-header">

          <span className="article-category">
            {article.category}
          </span>

          <h1>{article.title}</h1>

          {article.excerpt && (
            <p className="article-description">
              {article.excerpt}
            </p>
          )}

          <div className="article-meta">

            <span>
              {isEditorial
                ? 'By TechScope Editorial'
                : `By ${author?.full_name || authorRole}`}
            </span>

            {article.published_at && (
              <span>
                {new Date(article.published_at).toLocaleDateString(
                  'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }
                )}
              </span>
            )}

          </div>

        </header>

        {article.featured_image_url && (
          <img
            src={article.featured_image_url}
            alt={article.title}
            className="article-featured-image"
          />
        )}

        <div className="article-body">
          {paragraphs.map((paragraph, index) => {
            const isHeading =
              isEditorial &&
              editorialHeadings.includes(paragraph.trim())

            return isHeading ? (
              <h2 className="editorial-subheading" key={index}>
                {paragraph}
              </h2>
            ) : (
              <p key={index}>{paragraph}</p>
            )
          })}
        </div>

        {article.source_url && (
          <div className="article-source">
            <strong>References and Further Reading</strong>

            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {article.source_url}
            </a>
          </div>
        )}

        {article.tags?.length > 0 && (
          <div className="article-tags">
            <strong>Topics:</strong>

            {article.tags.map(tag => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        )}

        <div className="article-author-card">

          {author?.avatar_url && (
            <img
              src={author.avatar_url}
              alt={author.full_name}
            />
          )}

          <div>
            <span>
              {isEditorial
                ? 'Published by'
                : `Written by ${authorRole}`}
            </span>

            <h3>
              {isEditorial
                ? 'TechScope Editorial'
                : author?.full_name || authorRole}
            </h3>

            {author?.bio && <p>{author.bio}</p>}

            {!isEditorial && author?.role !== 'admin' && article.author_id && (
              <Link to={`/contributor/${article.author_id}`}>
                View Contributor Profile →
              </Link>
            )}

          </div>

        </div>

        <div className="article-footer">
          <h3>Keep exploring technology.</h3>

          <p>
            Continue learning and discovering with TechScope.
          </p>

          <Link to="/explore">
            Explore More Topics →
          </Link>
        </div>

      </div>
    </div>
  )
}

export default Article