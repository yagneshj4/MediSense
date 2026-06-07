import { motion } from 'framer-motion';
import { Code2, Cpu, Database, Award, GitBranch, Layers, Zap, Lock } from 'lucide-react';

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:.09 } } };
const it = { hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0, transition:{ duration:.45 } } };

const stack = [
  { e:'⚛️', name:'React 18 + Vite',     cat:'Frontend',    desc:'Lightning-fast SPA with React Router v6 and Framer Motion animations.' },
  { e:'🟢', name:'Express.js',          cat:'Backend API',  desc:'RESTful API server with JWT auth, CORS, Helmet, and Morgan logging.' },
  { e:'🍃', name:'MongoDB Atlas',       cat:'Database',     desc:'Cloud NoSQL database with Mongoose ODM for users, chats, and uploads.' },
  { e:'🐍', name:'Python Flask',        cat:'ML Service',   desc:'Internal microservice serving the trained SVC model on port 5001.' },
  { e:'🤖', name:'Scikit-learn SVC',    cat:'ML Model',     desc:'Support Vector Classifier trained on 41 diseases × 132 symptoms.' },
  { e:'✨', name:'Gemini 2.5 Flash',    cat:'Generative AI',desc:'Google AI model powering multilingual MediBot health guidance.' },
  { e:'🔐', name:'JWT + bcrypt',        cat:'Security',     desc:'Stateless token auth with bcrypt password hashing (12 salt rounds).' },
  { e:'🎞️', name:'Framer Motion',       cat:'Animations',   desc:'Production-grade motion library for fluid page transitions and reveals.' },
];

const pillars = [
  { icon: Layers,   color:'var(--teal)',   title:'Microservice Architecture',  desc:'Python ML service decoupled from Node.js API — true polyglot microservices.' },
  { icon: Lock,     color:'var(--purple)', title:'JWT Security',               desc:'Stateless auth with 7-day tokens, bcrypt hashing, and protected routes.' },
  { icon: Zap,      color:'var(--green)',  title:'Real-time AI',               desc:'Sub-second ML predictions with Gemini streaming responses.' },
  { icon: Database, color:'var(--orange)', title:'MongoDB Atlas',              desc:'Cloud database with Mongoose ODM, indexing, and per-user data isolation.' },
];

export default function About() {
  return (
    <div style={{ maxWidth:980, margin:'0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:'3rem' }}>
        <span className="badge badge-purple" style={{ marginBottom:12, display:'inline-flex' }}>About the Platform</span>
        <h1 className="h2" style={{ marginBottom:'1rem' }}>
          Built for <span className="grad">TCS Prime Level</span>
        </h1>
        <p className="sub" style={{ maxWidth:64 }}>
          Medi-Assist is a production-grade AI healthcare platform demonstrating industry-standard MERN architecture with Python ML microservice integration, Gemini AI, multilingual support, and JWT security — engineered to TCS Digital/Prime standards.
        </p>
      </motion.div>

      {/* Architecture pillars */}
      <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }} className="card-grid-2" style={{ marginBottom:'3rem' }}>
        {pillars.map(({ icon: Icon, color, title, desc }) => (
          <motion.div key={title} variants={it} className="glass glass-hover" style={{ padding:'1.5rem', display:'flex', gap:14 }}>
            <div className="icon-box" style={{ background:`${color}15`, borderRadius:13, flexShrink:0 }}>
              <Icon size={22} style={{ color }} />
            </div>
            <div>
              <h3 className="h3" style={{ marginBottom:6 }}>{title}</h3>
              <p style={{ color:'var(--t2)', fontSize:'.85rem', lineHeight:1.75 }}>{desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tech Stack */}
      <div className="glass" style={{ padding:'2rem', marginBottom:'2rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.5rem' }}>
          <div className="icon-box" style={{ background:'var(--teal-dim)', borderRadius:12 }}>
            <Code2 size={20} style={{ color:'var(--teal)' }} />
          </div>
          <h2 style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:'1.1rem' }}>Full Technology Stack</h2>
        </div>
        <div className="card-grid-2" style={{ gap:'1rem' }}>
          {stack.map(({ e, name, cat, desc }) => (
            <motion.div key={name} initial={{ opacity:0, x:-12 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }}
              style={{ display:'flex', gap:13, padding:'13px', background:'rgba(255,255,255,.025)', borderRadius:'var(--r-md)', border:'1px solid var(--border)', alignItems:'flex-start' }}>
              <span style={{ fontSize:'1.6rem', lineHeight:1 }}>{e}</span>
              <div>
                <div style={{ fontWeight:700, fontSize:'.88rem' }}>{name}</div>
                <div style={{ fontSize:'.68rem', color:'var(--teal)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:3 }}>{cat}</div>
                <div style={{ fontSize:'.78rem', color:'var(--t3)', lineHeight:1.65 }}>{desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ padding:'1.25rem 1.75rem', background:'rgba(245,158,11,.06)', border:'1px solid rgba(245,158,11,.18)', borderRadius:'var(--r-md)', display:'flex', gap:12 }}>
        <Award size={18} style={{ color:'var(--orange)', flexShrink:0, marginTop:2 }} />
        <p style={{ color:'var(--t2)', fontSize:'.85rem', lineHeight:1.75 }}>
          <strong style={{ color:'var(--orange)' }}>Medical Disclaimer:</strong> Medi-Assist is an educational AI platform. It does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
        </p>
      </div>
    </div>
  );
}
