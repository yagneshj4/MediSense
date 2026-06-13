import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, Activity, Shield, ArrowRight,
  Zap, ChevronRight, Sparkles, HeartPulse,
  FlaskConical, Globe, Languages, CheckCircle,
} from 'lucide-react';

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:.1 } } };
const item    = { hidden:{ opacity:0, y:24 }, show:{ opacity:1, y:0, transition:{ duration:.5, ease:[.4,0,.2,1] } } };

const features = [
  {
    icon: Brain,
    grad:'linear-gradient(135deg,#00d4ff,#7c3aed)',
    tag:'ML Powered', title:'AI Disease Prediction',
    desc:'SVM classifier analyzes 132 symptoms across 41 conditions with top-3 differential diagnoses, confidence scoring, and evidence-based care plans.',
    stats:['41 diseases', '132 symptoms', '~99% accuracy'],
    color:'var(--teal)',
  },
  {
    icon: HeartPulse,
    grad:'linear-gradient(135deg,#8b5cf6,#ec4899)',
    tag:'Personalized', title:'Complete Care Plans',
    desc:'Beyond diagnosis — get detailed medications, tailored diet charts, clinical precautions, and personalized recovery workouts.',
    stats:['Medications', 'Diet plans', 'Workouts'],
    color:'var(--purple)',
  },
  {
    icon: Shield,
    grad:'linear-gradient(135deg,#10b981,#00d4ff)',
    tag:'Safety First', title:'Emergency Detection',
    desc:'Multi-layer emergency screening detects critical symptoms in real time — chest pain, breathlessness, stroke signs — with 108 routing.',
    stats:['Real-time scan', 'Emergency routing', 'Zero latency'],
    color:'var(--green)',
  },
  {
    icon: Languages,
    grad:'linear-gradient(135deg,#f59e0b,#ef4444)',
    tag:'Multilingual', title:'MediBot · EN + HI',
    desc:'Gemini-powered health chatbot responds fluently in English and Hindi with context-aware medical guidance and prescription upload.',
    stats:['English', 'Hindi', 'Chat history'],
    color:'var(--orange)',
  },
];

const statsRow = [
  { n:'41+',  label:'Diseases Covered',  icon: FlaskConical, color:'var(--teal)'   },
  { n:'132',  label:'Symptom Signals',   icon: Activity,     color:'var(--purple)' },
  { n:'2',    label:'Languages',         icon: Globe,        color:'var(--green)'  },
  { n:'~99%', label:'Model Accuracy',    icon: Zap,          color:'var(--orange)' },
];

const steps = [
  { n:'01', title:'Select Symptoms', desc:'Search and pick symptoms from 132 clinical signals. Add multiple at once.', color:'var(--teal)' },
  { n:'02', title:'AI Analyzes',     desc:'SVM model runs differential diagnosis across 41 conditions in milliseconds.', color:'var(--purple)' },
  { n:'03', title:'Get Care Plan',   desc:'Receive diagnoses with confidence scores, medications, diet, precautions, workouts.', color:'var(--green)' },
];

export default function Home() {
  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ minHeight:'86vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', padding:'5rem 0 4rem', overflow:'hidden' }}>
        {/* Orbs */}
        <div className="orb" style={{ width:700, height:700, top:'-20%', left:'-12%', background:'radial-gradient(circle,rgba(139,92,246,0.11),transparent 60%)' }} />
        <div className="orb" style={{ width:600, height:600, bottom:'-15%', right:'-10%', background:'radial-gradient(circle,rgba(0,212,255,0.1),transparent 60%)' }} />
        <div className="orb" style={{ width:350, height:350, top:'45%', left:'42%', background:'radial-gradient(circle,rgba(16,185,129,0.055),transparent 65%)' }} />

        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:860 }}>

          {/* Pill badge */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.45 }}>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:8,
              padding:'5px 16px 5px 6px', borderRadius:99,
              background:'rgba(0,212,255,0.06)',
              border:'1px solid rgba(0,212,255,0.18)',
              marginBottom:'2.5rem',
            }}>
              <span style={{ background:'linear-gradient(135deg,var(--teal),var(--purple))', borderRadius:99, padding:'3px 11px', fontSize:'.65rem', fontWeight:800, color:'#04090f', textTransform:'uppercase', letterSpacing:'.1em' }}>New</span>
              <span style={{ fontSize:'.8rem', color:'var(--t2)', letterSpacing:'.01em' }}>MERN + Python ML + Gemini AI · Production-Grade</span>
            </div>
          </motion.div>

          <motion.h1 className="h1" initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.08 }} style={{ marginBottom:'1.75rem' }}>
            Your AI-Powered<br />
            <span className="grad">Health Guardian</span>
          </motion.h1>

          <motion.p className="sub" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.18 }} style={{ margin:'0 auto 3rem', fontSize:'1.05rem' }}>
            Medi-Assist combines <strong style={{ color:'var(--t1)', fontWeight:600 }}>Scikit-learn ML</strong> disease prediction,{' '}
            <strong style={{ color:'var(--t1)', fontWeight:600 }}>Gemini AI</strong> multilingual chatbot, and a full-stack MERN backend — healthcare intelligence engineered for everyone.
          </motion.p>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.28 }} style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:'4rem' }}>
            <Link to="/predict" className="btn btn-primary btn-lg">
              <Brain size={18}/> Start Free Diagnosis <ArrowRight size={15}/>
            </Link>
            <Link to="/chat" className="btn btn-outline btn-lg">
              <Sparkles size={18}/> Talk to MediBot
            </Link>
          </motion.div>

          {/* Tech tags */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.5 }}
            style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
            {['React 19 + Vite','Express.js','MongoDB','Python Flask','Scikit-learn SVC','Gemini AI','JWT Auth','Framer Motion'].map(t => (
              <span key={t} style={{
                padding:'4px 13px', borderRadius:99,
                background:'rgba(255,255,255,0.035)',
                border:'1px solid rgba(255,255,255,0.08)',
                fontSize:'.71rem', color:'var(--t3)',
                letterSpacing:'.03em',
              }}>
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STATS ROW ─────────────────────────────────────────────── */}
      <section style={{ padding:'2.5rem 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', background:'rgba(255,255,255,0.01)' }}>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
          style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'var(--border)' }}>
          {statsRow.map(({ n, label, icon: Icon, color }) => (
            <motion.div key={label} variants={item} style={{ background:'var(--bg)', padding:'2rem 1.5rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 50% 0%, ${color}08, transparent 65%)`, pointerEvents:'none' }} />
              <Icon size={20} style={{ color, marginBottom:12, opacity:.85 }} />
              <div className="stat-num" style={{ color }}>{n}</div>
              <div style={{ fontSize:'.78rem', color:'var(--t3)', marginTop:7, letterSpacing:'.03em' }}>{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section style={{ padding:'6rem 0' }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:'center', marginBottom:'4rem' }}>
          <span className="badge badge-purple" style={{ marginBottom:16, display:'inline-flex' }}>Core Features</span>
          <h2 className="h2">Everything you need for<br/><span className="grad">smarter healthcare</span></h2>
          <p className="sub" style={{ margin:'1.25rem auto 0' }}>Four pillars of intelligent health assistance — ML diagnosis, AI chat, multilingual, and safety.</p>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }} className="card-grid-2">
          {features.map(({ icon: Icon, grad, tag, title, desc, stats: fs, color }) => (
            <motion.div key={title} variants={item} className="glass glass-hover"
              style={{ padding:'2.25rem', display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
                <div style={{
                  width:52, height:52, borderRadius:16, flexShrink:0,
                  background:grad,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:`0 8px 24px ${color}30`,
                }}>
                  <Icon size={24} color="#04090f" strokeWidth={2}/>
                </div>
                <div style={{ flex:1 }}>
                  <span className="badge badge-teal" style={{ marginBottom:10, display:'inline-flex' }}>{tag}</span>
                  <h3 className="h3">{title}</h3>
                </div>
              </div>
              <p style={{ color:'var(--t2)', fontSize:'.88rem', lineHeight:1.85 }}>{desc}</p>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginTop:'auto' }}>
                {fs.map(s => (
                  <span key={s} style={{
                    display:'inline-flex', alignItems:'center', gap:5,
                    padding:'4px 11px', borderRadius:99,
                    background:'rgba(255,255,255,0.04)',
                    border:'1px solid var(--border)',
                    fontSize:'.72rem', color:'var(--t2)',
                  }}>
                    <CheckCircle size={10} style={{ color }} /> {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section style={{ padding:'2rem 0 5rem' }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <span className="badge badge-green" style={{ marginBottom:16, display:'inline-flex' }}>How It Works</span>
          <h2 className="h2">Diagnosis in <span className="grad-green">3 steps</span></h2>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1.5rem' }}>
          {steps.map(({ n, title, desc, color }, i) => (
            <motion.div key={n} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*.12 }}
              className="glass" style={{ padding:'2.25rem', position:'relative', overflow:'hidden' }}>
              {/* Ghost number */}
              <div style={{ fontFamily:'var(--f-display)', fontSize:'5rem', fontWeight:900, color, opacity:.07, position:'absolute', top:'-12px', right:'12px', lineHeight:1, pointerEvents:'none', userSelect:'none' }}>{n}</div>
              <div style={{ display:'inline-block', padding:'3px 12px', borderRadius:99, background:`${color}15`, border:`1px solid ${color}30`, fontSize:'.7rem', fontWeight:700, color, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:16 }}>Step {n}</div>
              <h3 className="h3" style={{ marginBottom:12 }}>{title}</h3>
              <p style={{ color:'var(--t2)', fontSize:'.88rem', lineHeight:1.8 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding:'2rem 0 4rem' }}>
        <motion.div
          initial={{ opacity:0, scale:.98 }}
          whileInView={{ opacity:1, scale:1 }}
          viewport={{ once:true }}
          className="highlight-box"
          style={{ padding:'5rem 3rem', textAlign:'center', position:'relative', overflow:'hidden' }}
        >
          <div className="orb" style={{ width:500, height:500, top:'-30%', left:'15%', background:'radial-gradient(circle,rgba(139,92,246,0.1),transparent 60%)' }} />
          <div className="orb" style={{ width:400, height:400, bottom:'-25%', right:'10%', background:'radial-gradient(circle,rgba(0,212,255,0.08),transparent 60%)' }} />
          <div style={{ position:'relative', zIndex:1 }}>
            <span className="badge badge-teal" style={{ marginBottom:20, display:'inline-flex' }}>Free Forever</span>
            <h2 className="h2" style={{ marginBottom:'1.25rem' }}>
              Ready to check your <span className="grad">symptoms?</span>
            </h2>
            <p className="sub" style={{ margin:'0 auto 2.5rem' }}>AI-powered health assessment in under 30 seconds. No appointment, no waiting room.</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/predict" className="btn btn-primary btn-lg">
                <Brain size={19}/> Get My Diagnosis <ChevronRight size={16}/>
              </Link>
              <Link to="/chat" className="btn btn-outline btn-lg">
                <Sparkles size={18}/> Chat with MediBot
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
