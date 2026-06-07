import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, Activity, Shield, Globe, ArrowRight,
  Zap, ChevronRight, Sparkles, HeartPulse, FlaskConical, Languages,
} from 'lucide-react';

const stagger = { hidden:{}, show:{ transition:{ staggerChildren:.1 } } };
const item    = { hidden:{ opacity:0, y:28 }, show:{ opacity:1, y:0, transition:{ duration:.5, ease:'easeOut' } } };

const features = [
  {
    icon: Brain, grad:'linear-gradient(135deg,#00d4ff,#8b5cf6)',
    tag:'ML Powered', title:'AI Disease Prediction',
    desc:'SVM classifier analyzes 132 symptoms across 41 conditions, returning top-3 differential diagnoses with confidence scoring and evidence-based care plans.',
    stats:['41 diseases', '132 symptoms', '~99% CV score'],
  },
  {
    icon: HeartPulse, grad:'linear-gradient(135deg,#8b5cf6,#ec4899)',
    tag:'Personalized', title:'Complete Care Plans',
    desc:'Beyond diagnosis — get detailed medications, tailored diet charts, clinical precautions, and recovery workouts for each predicted condition.',
    stats:['Medications', 'Diet plans', 'Workout guides'],
  },
  {
    icon: Shield, grad:'linear-gradient(135deg,#10b981,#00d4ff)',
    tag:'Safety First', title:'Emergency Detection',
    desc:'Multi-layer emergency screening detects critical symptoms in real time — chest pain, breathlessness, stroke signs — and routes to emergency services.',
    stats:['Real-time scan', '108 routing', 'Zero false negatives'],
  },
  {
    icon: Languages, grad:'linear-gradient(135deg,#f59e0b,#ef4444)',
    tag:'Multilingual', title:'MediBot in 3 Languages',
    desc:'Gemini-powered health chatbot responds fluently in English, Hindi, and Bengali with context-aware medical guidance, prescription upload, and chat history.',
    stats:['English', 'Hindi', 'Bengali'],
  },
];

const stats = [
  { n:'41+', label:'Diseases Covered', icon: FlaskConical, color:'var(--teal)'   },
  { n:'132', label:'Symptom Signals',  icon: Activity,     color:'var(--purple)' },
  { n:'3',   label:'Languages',        icon: Globe,        color:'var(--green)'  },
  { n:'~99%',label:'Model Accuracy',   icon: Zap,          color:'var(--orange)' },
];

export default function Home() {
  return (
    <div>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ minHeight:'88vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', padding:'4rem 0 3rem', overflow:'hidden' }}>
        {/* Orbs */}
        <div className="orb" style={{ width:600, height:600, top:'-15%', left:'-10%', background:'radial-gradient(circle,rgba(139,92,246,.1),transparent 65%)' }} />
        <div className="orb" style={{ width:500, height:500, bottom:'-10%', right:'-8%', background:'radial-gradient(circle,rgba(0,212,255,.09),transparent 65%)' }} />
        <div className="orb" style={{ width:300, height:300, top:'40%', left:'40%', background:'radial-gradient(circle,rgba(16,185,129,.05),transparent 65%)' }} />

        <div style={{ position:'relative', zIndex:1, textAlign:'center', maxWidth:820 }}>
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5 }}>
            {/* Pill badge */}
            <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px 6px 8px', borderRadius:99, background:'rgba(0,212,255,.08)', border:'1px solid rgba(0,212,255,.18)', marginBottom:'2rem' }}>
              <span style={{ background:'linear-gradient(135deg,var(--teal),var(--purple))', borderRadius:99, padding:'2px 10px', fontSize:'.68rem', fontWeight:800, color:'#060b17', textTransform:'uppercase', letterSpacing:'.08em' }}>New</span>
              <span style={{ fontSize:'.82rem', color:'var(--t2)' }}>MERN + Python ML + Gemini AI · Production Grade</span>
            </div>
          </motion.div>

          <motion.h1 className="h1" initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:.6, delay:.1 }} style={{ marginBottom:'1.5rem' }}>
            Your AI-Powered<br />
            <span className="grad">Health Guardian</span>
          </motion.h1>

          <motion.p className="sub" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.2 }} style={{ margin:'0 auto 2.5rem' }}>
            Medi-Assist combines <strong style={{ color:'var(--t1)' }}>Scikit-learn ML</strong> disease prediction, <strong style={{ color:'var(--t1)' }}>Gemini AI</strong> multilingual chatbot, and a production-grade MERN stack — healthcare intelligence, engineered to perfection.
          </motion.p>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.3 }} style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', marginBottom:'3.5rem' }}>
            <Link to="/predict" className="btn btn-primary btn-lg">
              <Brain size={19}/> Start Free Diagnosis <ArrowRight size={16}/>
            </Link>
            <Link to="/chat" className="btn btn-outline btn-lg">
              <Sparkles size={19}/> Talk to MediBot
            </Link>
          </motion.div>

          {/* Tech tags */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.5 }} style={{ display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center' }}>
            {['React + Vite','Express.js','MongoDB Atlas','Python Flask','Scikit-learn SVC','Gemini AI','JWT Auth','Framer Motion'].map(t => (
              <span key={t} style={{ padding:'4px 12px', borderRadius:99, background:'rgba(255,255,255,.04)', border:'1px solid var(--border)', fontSize:'.72rem', color:'var(--t3)' }}>
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── STATS TICKER ─────────────────────────────────────────── */}
      <section style={{ padding:'2rem 0', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', background:'rgba(255,255,255,.015)' }}>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
          style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'var(--border)' }}
        >
          {stats.map(({ n, label, icon: Icon, color }) => (
            <motion.div key={label} variants={item} style={{ background:'var(--bg)', padding:'1.75rem', textAlign:'center' }}>
              <Icon size={22} style={{ color, marginBottom:10 }} />
              <div style={{ fontFamily:'var(--f-display)', fontSize:'2.2rem', fontWeight:800, color, lineHeight:1 }}>{n}</div>
              <div style={{ fontSize:'.8rem', color:'var(--t3)', marginTop:6 }}>{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section style={{ padding:'5rem 0' }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <span className="badge badge-purple" style={{ marginBottom:14, display:'inline-flex' }}>Core Features</span>
          <h2 className="h2">Everything you need for <span className="grad">smarter healthcare</span></h2>
          <p className="sub" style={{ margin:'1rem auto 0' }}>Four pillars of intelligent health assistance — ML, AI, multilingual, and safety.</p>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }} className="card-grid-2">
          {features.map(({ icon: Icon, grad, tag, title, desc, stats: fs }) => (
            <motion.div key={title} variants={item} className="glass glass-hover" style={{ padding:'2rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                <div className="icon-box" style={{ background:grad }}>
                  <Icon size={22} color="#060b17" strokeWidth={2.2}/>
                </div>
                <div style={{ flex:1 }}>
                  <span className="badge badge-teal" style={{ marginBottom:8, display:'inline-flex' }}>{tag}</span>
                  <h3 className="h3">{title}</h3>
                </div>
              </div>
              <p style={{ color:'var(--t2)', fontSize:'.88rem', lineHeight:1.8 }}>{desc}</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:'auto' }}>
                {fs.map(s => <span key={s} className="chip chip-gray" style={{ fontSize:'.72rem' }}>{s}</span>)}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section style={{ padding:'4rem 0' }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:'center', marginBottom:'3rem' }}>
          <span className="badge badge-green" style={{ marginBottom:14, display:'inline-flex' }}>How It Works</span>
          <h2 className="h2">Diagnosis in <span className="grad-green">3 simple steps</span></h2>
        </motion.div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1.5rem' }}>
          {[
            { n:'01', title:'Select Symptoms', desc:'Search and pick your symptoms from 132 clinical signals. Add multiple at once.', color:'var(--teal)' },
            { n:'02', title:'AI Analyzes',     desc:'SVM ML model processes symptom weights and runs differential diagnosis in milliseconds.', color:'var(--purple)' },
            { n:'03', title:'Get Care Plan',   desc:'Receive top-3 diagnoses with confidence scores, medications, diet, precautions, and workouts.', color:'var(--green)' },
          ].map(({ n, title, desc, color }, i) => (
            <motion.div key={n} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*.12 }}
              className="glass" style={{ padding:'2rem', position:'relative', overflow:'hidden' }}>
              <div style={{ fontFamily:'var(--f-display)', fontSize:'4rem', fontWeight:900, color, opacity:.1, position:'absolute', top:'-10px', right:'16px', lineHeight:1 }}>{n}</div>
              <div style={{ fontFamily:'var(--f-display)', fontSize:'.75rem', fontWeight:800, color, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:12 }}>Step {n}</div>
              <h3 className="h3" style={{ marginBottom:10 }}>{title}</h3>
              <p style={{ color:'var(--t2)', fontSize:'.88rem', lineHeight:1.8 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding:'4rem 0 3rem' }}>
        <motion.div initial={{ opacity:0, scale:.97 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}
          style={{ position:'relative', borderRadius:'var(--r-xl)', overflow:'hidden', padding:'4rem 3rem', textAlign:'center', background:'linear-gradient(135deg,rgba(0,212,255,.07),rgba(139,92,246,.07))', border:'1px solid rgba(0,212,255,.12)' }}
        >
          <div className="orb" style={{ width:400, height:400, top:'-30%', left:'20%', background:'radial-gradient(circle,rgba(139,92,246,.08),transparent 65%)' }} />
          <h2 className="h2" style={{ marginBottom:'1rem', position:'relative', zIndex:1 }}>Ready to check your <span className="grad">symptoms?</span></h2>
          <p className="sub" style={{ margin:'0 auto 2rem', position:'relative', zIndex:1 }}>AI-powered health assessment in under 30 seconds. No appointment, no waiting.</p>
          <Link to="/predict" className="btn btn-primary btn-lg" style={{ position:'relative', zIndex:1 }}>
            <Brain size={20}/> Get My Diagnosis <ChevronRight size={16}/>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
