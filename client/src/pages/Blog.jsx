import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Clock, Tag, ArrowUpRight, TrendingUp, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import toast from 'react-hot-toast';

const posts = [
  {
    id: 1,
    tag: 'AI/ML', tagColor: 'badge-teal', emoji: '🤖',
    title: 'How AI is Revolutionizing Early Disease Detection',
    excerpt: 'Machine learning models like Support Vector Classifiers analyze symptom patterns across 41 diseases with clinical-grade accuracy. Here\'s how Medi-Assist\'s SVC model achieves top-3 differential diagnosis…',
    date: 'Jun 2025', read: '5 min', featured: true,
    content: {
      intro: 'In modern medicine, early detection is the key to successful treatment. Machine learning is bridging the gap between patient symptoms and clinical insight, enabling rapid screening before condition escalation.',
      sections: [
        {
          heading: 'The Math Behind SVC in Medicine',
          text: 'Support Vector Classification (SVC) operates by finding the optimal hyperplane that separates distinct disease classes in a multi-dimensional symptom space. With 132 unique clinical inputs, the model maps complex interactions that are often subtle to the human eye.'
        },
        {
          heading: 'Differential Diagnosis & Top-3 Likelihoods',
          text: 'Rather than outputting a single diagnosis, clinical safety demands a differential diagnosis model. Medi-Assist computes the decision functions to rank the top three most likely diseases, alongside their corresponding match confidence levels.'
        },
        {
          heading: 'Clinical Guardrails & Severity Classification',
          text: 'AI is a tool, not a doctor. Integrating severe emergency guards ensures that symptoms indicating cardiac arrest, stroke, or severe respiratory failure bypass normal checkups and immediately route users to emergency services.'
        }
      ],
      conclusion: 'By combining robust ML classifiers with real-time severity classification, platforms like Medi-Assist empower individuals to make informed decisions about when to seek professional care.'
    }
  },
  {
    id: 2,
    tag: 'Gemini AI', tagColor: 'badge-purple', emoji: '✨',
    title: 'Building Multilingual Healthcare Apps with Gemini',
    excerpt: 'Language barriers in healthcare can be life-threatening. With Google\'s Gemini API, Medi-Assist delivers fluent health guidance in English, Hindi, and Bengali…',
    date: 'May 2025', read: '4 min', featured: false,
    content: {
      intro: 'Healthcare is universal, but medical information is often restricted by language. By integrating advanced generative models, we can translate complex medical jargon into easy-to-understand guidance in any native language.',
      sections: [
        {
          heading: 'The Power of Generative Healthcare AI',
          text: 'Unlike static translation tools, Large Language Models (LLMs) like Gemini understand the context of symptoms and clinical terms. This allows the system to adjust tone, simplify descriptions, and provide comforting, clear guidance.'
        },
        {
          heading: 'Implementing Multilingual Fallbacks',
          text: 'To ensure uptime even during API limits, the system utilizes a local rule-based engine mapping translated core disease datasets. This dual-layer architecture guarantees that the user always gets a response.'
        }
      ],
      conclusion: 'Empowering patients with information in their native tongue reduces panic and improves the quality of clinical consultations.'
    }
  },
  {
    id: 3,
    tag: 'Architecture', tagColor: 'badge-green', emoji: '🏗️',
    title: 'MERN + Python Microservices: A Polyglot Architecture',
    excerpt: 'Why force everything into one language? Our architecture keeps the Python ML service intact while adding a full MERN stack layer — best of both worlds for production healthcare apps…',
    date: 'Apr 2025', read: '7 min', featured: false,
    content: {
      intro: 'Choosing the right tool for the job is software engineering 101. By utilizing Node.js for scalable API routing and Python for scientific computation, developers create high-performance hybrid systems.',
      sections: [
        {
          heading: 'Decoupling compute from web servers',
          text: 'Node.js is exceptionally fast for handling concurrent I/O operations, database queries, and file uploads. However, heavy matrix operations like running SVM predictions can block the Node event loop. Routing these tasks to a Flask/FastAPI microservice keeps the web layer ultra-responsive.'
        },
        {
          heading: 'Defining Clean API Contracts',
          text: 'Using structured JSON exchanges over internal networks (e.g., localhost or internal VPCs) makes component swapping trivial. If we want to replace the Python server with a Go implementation in the future, the Node API client remains untouched.'
        }
      ],
      conclusion: 'Polyglot microservices represent the industry standard for combining modern web frameworks with data science and artificial intelligence.'
    }
  },
  {
    id: 4,
    tag: 'Safety', tagColor: 'badge-red', emoji: '🚨',
    title: 'Emergency Detection in Healthcare AI: A Safety-First Approach',
    excerpt: 'When a user mentions "severe chest pain" or "can\'t breathe", the AI must respond correctly and immediately. Here\'s how Medi-Assist implements multi-layer emergency detection…',
    date: 'Mar 2025', read: '3 min', featured: false,
    content: {
      intro: 'In critical scenarios, seconds save lives. Healthcare apps must possess safety nets that actively parse inputs for red-flag symptoms and trigger urgent care warnings immediately.',
      sections: [
        {
          heading: 'Identifying Clinical Red Flags',
          text: 'Symptoms like crushing chest pain, sudden numbness on one side of the body, and severe breathlessness represent clinical emergencies. Our safety layer uses tokenized keyword matching and NLP phrase mapping to scan all symptoms before executing model classification.'
        },
        {
          heading: 'The UX of Emergency Alerts',
          text: 'An emergency alert should be highly visual, unmissable, and actionable. Medi-Assist displays a red alert box highlighting direct emergency hotlines and nearby medical center recommendations, advising the user to cease app usage and seek immediate help.'
        }
      ],
      conclusion: 'Safety is not an optional feature in medical tech; it is the foundation upon which all other features must be built.'
    }
  },
  {
    id: 5,
    tag: 'Security', tagColor: 'badge-purple', emoji: '🔒',
    title: 'Security & HIPAA Guidelines in Modern Healthcare Portals',
    excerpt: 'Patient data confidentiality is paramount. Learn how JWT, encrypted database strings, and strict CORS configuration safeguard sensitive patient medical records…',
    date: 'Feb 2025', read: '6 min', featured: false,
    content: {
      intro: 'Protecting patient records is both an ethical duty and a strict legal requirement under guidelines like HIPAA. Building secure healthcare portals requires applying defense-in-depth across the entire MERN stack.',
      sections: [
        {
          heading: 'Authentication and JWT Security',
          text: 'Stateless JWT authentication must be implemented securely. We sign tokens using strong cryptographic keys, set reasonable expirations, and store them securely in the client state or HTTP-only cookies to thwart Cross-Site Scripting (XSS) attempts.'
        },
        {
          heading: 'Restricting Origin Resource Sharing',
          text: 'Cross-Origin Resource Sharing (CORS) rules should never use wildcards in production. Limiting API access to specific whitelisted client URLs prevents unauthorized third-party apps from scraping backend diagnostic routes.'
        }
      ],
      conclusion: 'A secure healthcare app builds user trust, preventing data leaks and compliance violations before they can happen.'
    }
  },
  {
    id: 6,
    tag: 'ML Science', tagColor: 'badge-teal', emoji: '🧬',
    title: 'Comparing SVC with Neural Networks for Symptom Mapping',
    excerpt: 'Why did we choose a Support Vector Classifier over Deep Learning? We dive into sample efficiency, training speeds, and why simpler models often win in clinical classifications…',
    date: 'Jan 2025', read: '5 min', featured: false,
    content: {
      intro: 'It is easy to get caught up in deep learning hype. However, for structured, tabular datasets like symptom classification arrays, classical machine learning algorithms often outperform multi-layer neural networks.',
      sections: [
        {
          heading: 'Sample Efficiency and Model Size',
          text: 'Neural networks require millions of parameters and thousands of samples to avoid overfitting. SVCs, which utilize kernel tricks to map boundaries, run efficiently on smaller clinical datasets and require minimal CPU resources to perform predictions in milliseconds.'
        },
        {
          heading: 'Explainability & Confidence Scoring',
          text: 'In healthcare, black-box decisions are dangerous. SVC decision boundaries allow us to calculate clear confidence scores and trace prediction paths, which is crucial for auditing model outputs.'
        }
      ],
      conclusion: 'Selecting models based on clinical utility rather than complexity ensures reliable, fast, and maintainable software.'
    }
  },
  {
    id: 7,
    tag: 'UX Design', tagColor: 'badge-orange', emoji: '🎨',
    title: 'The Role of Dark Mode and Visual Hierarchy in Health Portals',
    excerpt: 'Aesthetics aren\'t just about beauty. Visual hierarchy, accessible contrast ratios, and soothing color schemes reduce cognitive load for patients undergoing health stress…',
    date: 'Dec 2024', read: '4 min', featured: false,
    content: {
      intro: 'A patient checking symptoms is often anxious. Visual elements and user experience choices can either calm the user or increase their anxiety. Here is how we design with empathy.',
      sections: [
        {
          heading: 'Soothing Palettes & Accessible Text',
          text: 'Avoiding high-contrast stark whites and instead using dark backgrounds with soft cyan and violet accents reduces visual fatigue. High contrast text ensures readability for users who might be visually impaired or viewing the app in stressful conditions.'
        },
        {
          heading: 'Reducing Action Fatigue',
          text: 'Input fields should autofill and offer quick-select options. If a user is feeling ill, searching through dropdowns is exhausting. Providing quick-select symptom chips streamlines the user journey.'
        }
      ],
      conclusion: 'Designing with empathy translates to clear typography, helpful micro-interactions, and accessible visual flows.'
    }
  },
  {
    id: 8,
    tag: 'Data Pipelines', tagColor: 'badge-green', emoji: '💾',
    title: 'Syncing Local Predictions with MongoDB Cloud Sync',
    excerpt: 'Storing patient history securely is vital. We examine the sync loop between our prediction endpoints and Mongoose models for a seamless user timeline…',
    date: 'Nov 2024', read: '5 min', featured: false,
    content: {
      intro: 'A dashboard is only as good as the history it displays. Persisting diagnostic records automatically keeps patients informed and lets them track condition timelines across weeks or months.',
      sections: [
        {
          heading: 'Database Schema Design for Health Reports',
          text: 'Mongoose schemas should capture symptoms, matched diseases, confidence scores, and recommendation datasets in a structured schema. Adding user indexes guarantees fast retrieval speeds as database sizes scale.'
        },
        {
          heading: 'Ensuring Atomic Writes',
          text: 'To avoid double submissions, API controllers validate incoming payload hashes and update reports atomically. This prevents duplicate entries in case of slow internet connection retries.'
        }
      ],
      conclusion: 'Robust data syncing provides the backbone for long-term health tracking and medical trends analysis.'
    }
  }
];

const ITEMS_PER_PAGE = 4;

export default function Blog() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [savedPosts, setSavedPosts] = useState([]);

  const selectedPost = id ? posts.find(p => p.id === parseInt(id)) : null;

  const handleSave = (id, e) => {
    e.stopPropagation();
    if (savedPosts.includes(id)) {
      setSavedPosts(savedPosts.filter(x => x !== id));
      toast.success('Removed from bookmarks');
    } else {
      setSavedPosts([...savedPosts, id]);
      toast.success('Saved to bookmarks');
    }
  };

  const handleShare = (title, e) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/blog - ${title}`);
      toast.success('Link copied to clipboard!');
    } else {
      toast.error('Could not copy link');
    }
  };

  // Pagination logic
  // Page 1: 1 Featured at the top + 3 items
  // Page 2: 4 items
  const featuredPost = posts.find(p => p.featured);
  const nonFeatured = posts.filter(p => !p.featured);

  let displayedPosts = [];
  if (currentPage === 1) {
    displayedPosts = nonFeatured.slice(0, 3);
  } else {
    displayedPosts = nonFeatured.slice(3, 7);
  }

  const totalPages = Math.ceil(nonFeatured.length / 3); // 7 non-featured / 3 per page = 3 pages

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', minHeight: '85vh', position: 'relative' }}>
      <AnimatePresence mode="wait">
        {!selectedPost ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {/* Header */}
            <div style={{ marginBottom: '2.5rem' }}>
              <span className="badge badge-teal" style={{ marginBottom: 12, display: 'inline-flex' }}>Health & Tech Journal</span>
              <h1 className="h2" style={{ marginBottom: 8 }}>Medi-Assist <span className="grad">Insights</span></h1>
              <p className="sub">Explore deep dives into AI diagnostics, microservice engineering, compliance, and user-centric design.</p>
            </div>

            {/* Featured Post - Only show on Page 1 */}
            {currentPage === 1 && featuredPost && (
              <motion.article
                onClick={() => navigate(`/blog/${featuredPost.id}`)}
                className="glass glass-hover"
                style={{
                  padding: '2.5rem',
                  marginBottom: '2rem',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(139,92,246,0.05))',
                  border: '1px solid rgba(0,212,255,0.18)'
                }}
              >
                <div className="orb" style={{ width: 300, height: 300, top: '-30%', right: '-5%', background: 'radial-gradient(circle,rgba(0,212,255,.08),transparent 65%)' }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.5rem' }}>{featuredPost.emoji}</span>
                    <span className={`badge ${featuredPost.tagColor}`}>{featuredPost.tag}</span>
                    <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <TrendingUp size={10} /> Featured
                    </span>
                    <span style={{ marginLeft: 'auto', color: 'var(--t3)', fontSize: '.75rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Clock size={12} /> {featuredPost.read} read · {featuredPost.date}
                    </span>
                  </div>
                  <h2 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.3rem, 3.5vw, 1.8rem)', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.25 }}>
                    {featuredPost.title}
                  </h2>
                  <p style={{ color: 'var(--t2)', fontSize: '.92rem', lineHeight: 1.85, marginBottom: '1.75rem' }}>{featuredPost.excerpt}</p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button className="btn btn-primary btn-sm">
                      <BookOpen size={14} /> Read Full Article <ArrowUpRight size={13} />
                    </button>
                    <button onClick={(e) => handleSave(featuredPost.id, e)} className="btn btn-ghost btn-sm" style={{ padding: '8px 10px' }} title="Bookmark">
                      <Bookmark size={13} color={savedPosts.includes(featuredPost.id) ? 'var(--teal)' : 'var(--t2)'} fill={savedPosts.includes(featuredPost.id) ? 'var(--teal)' : 'none'} />
                    </button>
                    <button onClick={(e) => handleShare(featuredPost.title, e)} className="btn btn-ghost btn-sm" style={{ padding: '8px 10px' }} title="Share">
                      <Share2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.article>
            )}

            {/* List Grid */}
            <div className="card-grid-2" style={{ gap: '1.25rem', marginBottom: '2.5rem' }}>
              {displayedPosts.map((post, i) => (
                <motion.article
                  key={post.title}
                  onClick={() => navigate(`/blog/${post.id}`)}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="glass glass-hover"
                  style={{ padding: '1.75rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: 9, alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '1.25rem' }}>{post.emoji}</span>
                      <span className={`badge ${post.tagColor}`}>{post.tag}</span>
                      <span style={{ marginLeft: 'auto', color: 'var(--t3)', fontSize: '.72rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={11} /> {post.read} · {post.date}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: 10, lineHeight: 1.4, color: 'var(--t1)' }}>{post.title}</h3>
                    <p style={{ color: 'var(--t2)', fontSize: '.84rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>{post.excerpt}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" style={{ fontSize: '.78rem' }}>
                      <BookOpen size={12} /> Read More <ArrowUpRight size={12} />
                    </button>
                    <button onClick={(e) => handleSave(post.id, e)} className="btn btn-ghost btn-sm" style={{ padding: '6px 8px', marginLeft: 'auto' }}>
                      <Bookmark size={12} color={savedPosts.includes(post.id) ? 'var(--teal)' : 'var(--t2)'} fill={savedPosts.includes(post.id) ? 'var(--teal)' : 'none'} />
                    </button>
                    <button onClick={(e) => handleShare(post.title, e)} className="btn btn-ghost btn-sm" style={{ padding: '6px 8px' }}>
                      <Share2 size={12} />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: '2rem' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="btn btn-ghost btn-sm"
                style={{ opacity: currentPage === 1 ? 0.4 : 1, transition: '0.2s' }}
              >
                Previous
              </button>
              {[1, 2, 3].map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`btn btn-sm ${currentPage === pageNum ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ minWidth: 36, padding: '6px 0', justifyContent: 'center' }}
                >
                  {pageNum}
                </button>
              ))}
              <button
                disabled={currentPage === 3}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="btn btn-ghost btn-sm"
                style={{ opacity: currentPage === 3 ? 0.4 : 1, transition: '0.2s' }}
              >
                Next
              </button>
            </div>
          </motion.div>
        ) : (
          /* Detailed Post View */
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{ paddingBottom: '3rem' }}
          >
            {/* Back Button */}
            <button onClick={() => navigate('/blog')} className="btn btn-ghost btn-sm" style={{ marginBottom: '2rem', gap: 8 }}>
              <ArrowLeft size={14} /> Back to Articles
            </button>

            {/* Article Container */}
            <article className="glass" style={{ padding: '2.5rem 3rem', position: 'relative', overflow: 'hidden' }}>
              <div className="orb" style={{ width: 400, height: 400, top: '-15%', right: '-10%', background: 'radial-gradient(circle,rgba(139,92,246,.08),transparent 65%)' }} />
              
              <header style={{ position: 'relative', zIndex: 1, marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.75rem' }}>{selectedPost.emoji}</span>
                  <span className={`badge ${selectedPost.tagColor}`} style={{ fontSize: '.78rem', padding: '4px 12px' }}>{selectedPost.tag}</span>
                  <span style={{ color: 'var(--t3)', fontSize: '.8rem', marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={13} /> {selectedPost.read} read · {selectedPost.date}
                  </span>
                </div>
                
                <h1 style={{ fontFamily: 'var(--f-display)', fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 800, color: 'var(--t1)', lineHeight: 1.2, margin: '12px 0' }}>
                  {selectedPost.title}
                </h1>
                
                <div style={{ display: 'flex', gap: 10, marginTop: '1.5rem' }}>
                  <button onClick={(e) => handleSave(selectedPost.id, e)} className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', gap: 6 }}>
                    <Bookmark size={13} color={savedPosts.includes(selectedPost.id) ? 'var(--teal)' : 'var(--t2)'} fill={savedPosts.includes(selectedPost.id) ? 'var(--teal)' : 'none'} />
                    {savedPosts.includes(selectedPost.id) ? 'Saved' : 'Save Bookmark'}
                  </button>
                  <button onClick={(e) => handleShare(selectedPost.title, e)} className="btn btn-ghost btn-sm" style={{ display: 'inline-flex', gap: 6 }}>
                    <Share2 size={13} /> Share Link
                  </button>
                </div>
              </header>

              {/* Main Body */}
              <div style={{ position: 'relative', zIndex: 1, fontSize: '.98rem', lineHeight: 1.9, color: 'var(--t2)' }}>
                {/* Intro block */}
                <p style={{ fontSize: '1.08rem', fontWeight: 500, color: 'var(--t1)', marginBottom: '2rem', fontStyle: 'italic', borderLeft: '3px solid var(--teal)', paddingLeft: '1.25rem' }}>
                  {selectedPost.content.intro}
                </p>

                {/* Content Sections */}
                {selectedPost.content.sections.map((section, idx) => (
                  <div key={idx} style={{ marginBottom: '2.25rem' }}>
                    <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--teal)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '1rem', opacity: 0.5 }}>0{idx + 1}.</span> {section.heading}
                    </h2>
                    <p style={{ textIndent: '0.5rem' }}>{section.text}</p>
                  </div>
                ))}

                {/* Divider */}
                <div style={{ height: 1, background: 'var(--border)', margin: '2.5rem 0' }} />

                {/* Conclusion */}
                <div>
                  <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--t1)', marginBottom: '0.5rem' }}>Summary & Key Takeaway</h3>
                  <p>{selectedPost.content.conclusion}</p>
                </div>
              </div>
            </article>

            {/* Read Next Section */}
            <div style={{ marginTop: '3rem' }}>
              <h3 style={{ fontFamily: 'var(--f-display)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={16} color="var(--purple)" /> Read Next
              </h3>
              <div className="card-grid-2" style={{ gap: '1.25rem' }}>
                {posts
                  .filter(p => p.id !== selectedPost.id)
                  .slice(0, 2)
                  .map(post => (
                    <div
                      key={post.id}
                      onClick={() => navigate(`/blog/${post.id}`)}
                      className="glass glass-hover"
                      style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                      <div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span className={`badge ${post.tagColor}`} style={{ fontSize: '.65rem' }}>{post.tag}</span>
                          <span style={{ marginLeft: 'auto', color: 'var(--t3)', fontSize: '.68rem' }}>{post.date}</span>
                        </div>
                        <h4 style={{ fontFamily: 'var(--f-display)', fontSize: '.92rem', fontWeight: 700, color: 'var(--t1)', marginBottom: 6 }}>{post.title}</h4>
                      </div>
                      <span style={{ color: 'var(--teal)', fontSize: '.78rem', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 12 }}>
                        Read Article <ArrowUpRight size={11} />
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
