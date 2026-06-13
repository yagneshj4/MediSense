import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, Activity, Shield, ArrowRight, Zap, ChevronRight,
  Sparkles, HeartPulse, FlaskConical, Globe, Languages,
  CheckCircle, Star, Heart, TrendingUp, Users, Award,
  Stethoscope, MessageCircle,
} from 'lucide-react';

const fadeUp = { hidden:{ opacity:0, y:24 }, show:{ opacity:1, y:0, transition:{ duration:.5, ease:[.4,0,.2,1] } } };
const stagger = { hidden:{}, show:{ transition:{ staggerChildren:.1 } } };

const features = [
  { icon:Brain,     grad:'linear-gradient(135deg,#00d4ff,#6366f1)', tag:'ML Powered',   title:'AI Disease Prediction',   desc:'SVM classifier analyzes 132 symptoms across 41 conditions, returning top-3 differential diagnoses with confidence scores and evidence-based care plans.', stats:['41 diseases','132 symptoms','~99% accuracy'], color:'var(--teal)'   },
  { icon:HeartPulse,grad:'linear-gradient(135deg,#8b5cf6,#ec4899)', tag:'Personalized', title:'Complete Care Plans',      desc:'Beyond diagnosis — get detailed medications, tailored diet charts, clinical precautions, and personalized recovery workouts for each condition.',          stats:['Medications','Diet plans','Workouts'],     color:'var(--purple)' },
  { icon:Shield,    grad:'linear-gradient(135deg,#10b981,#00d4ff)', tag:'Safety First', title:'Emergency Detection',       desc:'Multi-layer emergency screening detects critical symptoms in real time — chest pain, breathlessness, stroke signs — with immediate 108 routing.',       stats:['Real-time scan','108 routing','Zero lag'],  color:'var(--green)'  },
  { icon:Languages, grad:'linear-gradient(135deg,#f59e0b,#ef4444)', tag:'Multilingual', title:'MediBot · EN + HI',         desc:'Gemini AI health chatbot responds fluently in English and Hindi with context-aware medical guidance, prescription upload, and persistent chat history.',  stats:['English','Hindi','Chat history'],          color:'var(--orange)' },
];

const statsRow = [
  { n:'41+',  label:'Diseases Covered', icon:FlaskConical, color:'var(--teal)'   },
  { n:'132',  label:'Symptom Signals',  icon:Activity,     color:'var(--purple)' },
  { n:'2',    label:'Languages',        icon:Globe,        color:'var(--green)'  },
  { n:'~99%', label:'Model Accuracy',   icon:Zap,          color:'var(--orange)' },
];

const steps = [
  { n:'01', title:'Select Symptoms', desc:'Search and pick from 132 clinical signals. Add multiple symptoms at once with instant autocomplete.', color:'var(--teal)' },
  { n:'02', title:'AI Analysis',     desc:'SVM ML model runs differential diagnosis across 41 conditions — results delivered in milliseconds.',    color:'var(--purple)' },
  { n:'03', title:'Get Care Plan',   desc:'Receive top-3 diagnoses with confidence scores, medications, diet recommendations, and recovery plan.', color:'var(--green)' },
];

const testimonials = [
  { name:'Dr. Priya Sharma',   role:'MBBS, General Physician', text:'The symptom prediction accuracy is impressive. I recommend it to patients for a quick preliminary assessment before consultation.', stars:5, avatar:'PS' },
  { name:'Rahul Mehta',        role:'Engineering Student',      text:'Used it when I had fever and body pain at midnight. Got the exact diagnosis within seconds. Life-saving tool!',                    stars:5, avatar:'RM' },
  { name:'Ananya Krishnamurthy',role:'Healthcare Researcher',   text:'The multilingual support is a game changer for rural India. Hindi interface makes it accessible to everyone.',                   stars:5, avatar:'AK' },
];

export default function Home() {
  return (
    <div>
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section style={{ minHeight:'88vh', display:'flex', alignItems:'center', position:'relative', padding:'5rem 0 3rem', overflow:'hidden' }}>
        <div className="orb" style={{ width:700, height:700, top:'-20%', left:'-12%', background:'radial-gradient(circle,rgba(139,92,246,.12),transparent 60%)' }}/>
        <div className="orb" style={{ width:600, height:600, bottom:'-15%', right:'-10%', background:'radial-gradient(circle,rgba(0,212,255,.1),transparent 60%)' }}/>

        <div style={{ position:'relative', zIndex:1, width:'100%', display:'grid', gridTemplateColumns:'1fr auto', gap:'4rem', alignItems:'center' }}>
          {/* Left: copy */}
          <div style={{ maxWidth:700 }}>
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'5px 16px 5px 6px', borderRadius:99, background:'rgba(0,212,255,.07)', border:'1px solid rgba(0,212,255,.18)', marginBottom:'2rem' }}>
                <span style={{ background:'linear-gradient(135deg,var(--teal),var(--purple))', borderRadius:99, padding:'3px 11px', fontSize:'.63rem', fontWeight:800, color:'#03070e', textTransform:'uppercase', letterSpacing:'.1em' }}>New</span>
                <span style={{ fontSize:'.8rem', color:'var(--t2)' }}>MERN · Python ML · Gemini AI · Production-Grade</span>
              </div>
            </motion.div>

            <motion.h1 className="h1" initial={{ opacity:0, y:28 }} animate={{ opacity:1, y:0 }} transition={{ duration:.55, delay:.08 }} style={{ marginBottom:'1.5rem' }}>
              Your AI-Powered<br/><span className="grad">Health Guardian</span>
            </motion.h1>

            <motion.p className="sub" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:.5, delay:.16 }} style={{ marginBottom:'2.75rem', maxWidth:'54ch' }}>
              Medi-Assist combines <strong style={{ color:'var(--t1)', fontWeight:600 }}>Scikit-learn ML</strong> disease prediction, <strong style={{ color:'var(--t1)', fontWeight:600 }}>Gemini AI</strong> multilingual chatbot, and a production-grade MERN stack — healthcare intelligence for everyone.
            </motion.p>

            <motion.div initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:.45, delay:.24 }} style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:'3rem' }}>
              <Link to="/predict" className="btn btn-primary btn-lg"><Brain size={18}/>Start Free Diagnosis<ArrowRight size={15}/></Link>
              <Link to="/chat"    className="btn btn-outline btn-lg"><Sparkles size={18}/>Talk to MediBot</Link>
            </motion.div>

            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:.4 }} style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {['React 19 + Vite','Express.js','MongoDB','Python Flask','Scikit-learn SVC','Gemini AI','JWT Auth'].map(t => (
                <span key={t} style={{ padding:'4px 13px', borderRadius:99, background:'rgba(255,255,255,.035)', border:'1px solid var(--border)', fontSize:'.7rem', color:'var(--t3)' }}>{t}</span>
              ))}
            </motion.div>
          </div>

          {/* Right: floating diagnosis card */}
          <motion.div
            initial={{ opacity:0, x:40, y:20 }}
            animate={{ opacity:1, x:0, y:0 }}
            transition={{ duration:.7, delay:.3, ease:[.4,0,.2,1] }}
            style={{ flexShrink:0 }}
            className="float"
          >
            <div style={{ width:280, padding:'1.5rem', borderRadius:20, background:'rgba(10,16,32,.9)', border:'1px solid rgba(0,212,255,.2)', boxShadow:'0 24px 80px rgba(0,0,0,.6),0 0 40px rgba(0,212,255,.1)', backdropFilter:'blur(20px)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.25rem' }}>
                <div style={{ width:36, height:36, borderRadius:11, background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Brain size={18} color="#03070e"/>
                </div>
                <div>
                  <div style={{ fontSize:'.7rem', color:'var(--t3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.07em' }}>AI Diagnosis</div>
                  <div style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:'.9rem' }}>Common Cold</div>
                </div>
                <div style={{ marginLeft:'auto', padding:'3px 10px', borderRadius:99, background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)', fontSize:'.68rem', fontWeight:700, color:'var(--green)' }}>Mild</div>
              </div>
              <div style={{ marginBottom:'1rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.72rem', color:'var(--t2)', marginBottom:5 }}>
                  <span>Match Confidence</span><strong style={{ color:'var(--green)' }}>87%</strong>
                </div>
                <div style={{ height:5, borderRadius:99, background:'rgba(255,255,255,.06)' }}>
                  <div style={{ width:'87%', height:'100%', borderRadius:99, background:'linear-gradient(90deg,var(--green)88,var(--green))' }}/>
                </div>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:'1rem' }}>
                {['fever','headache','runny nose','fatigue'].map(s => (
                  <span key={s} style={{ padding:'3px 10px', borderRadius:99, background:'rgba(0,212,255,.08)', border:'1px solid rgba(0,212,255,.18)', fontSize:'.68rem', color:'var(--teal)' }}>{s}</span>
                ))}
              </div>
              <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1rem', display:'flex', flexDirection:'column', gap:6 }}>
                {[{icon:HeartPulse,label:'Rest & hydration',color:'var(--teal)'},{icon:Shield,label:'Paracetamol 500mg',color:'var(--purple)'},{icon:Zap,label:'Light exercise only',color:'var(--orange)'}].map(({icon:I,label,color}) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <I size={12} style={{ color, flexShrink:0 }}/>
                    <span style={{ fontSize:'.75rem', color:'var(--t2)' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────── */}
      <section style={{ borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', background:'rgba(255,255,255,.01)' }}>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }}
          style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'var(--border)' }}>
          {statsRow.map(({ n, label, icon:Icon, color }) => (
            <motion.div key={label} variants={fadeUp} style={{ background:'var(--bg)', padding:'2rem 1.5rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', inset:0, background:`radial-gradient(circle at 50% 0%,${color}09,transparent 65%)`, pointerEvents:'none' }}/>
              <Icon size={20} style={{ color, marginBottom:12, opacity:.85 }}/>
              <div style={{ fontFamily:'var(--f-display)', fontSize:'2.4rem', fontWeight:800, color, lineHeight:1, letterSpacing:'-.03em' }}>{n}</div>
              <div style={{ fontSize:'.78rem', color:'var(--t3)', marginTop:7 }}>{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section style={{ padding:'6rem 0' }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:'center', marginBottom:'4rem' }}>
          <span className="badge badge-purple" style={{ marginBottom:16, display:'inline-flex' }}>Core Features</span>
          <h2 className="h2">Everything for <span className="grad">smarter healthcare</span></h2>
          <p className="sub" style={{ margin:'1.25rem auto 0' }}>Four pillars of intelligent health assistance built for scale.</p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }} className="card-grid-2">
          {features.map(({ icon:Icon, grad, tag, title, desc, stats:fs, color }) => (
            <motion.div key={title} variants={fadeUp} className="glass glass-hover" style={{ padding:'2.25rem', display:'flex', flexDirection:'column', gap:'1.5rem' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:16 }}>
                <div style={{ width:52, height:52, borderRadius:16, flexShrink:0, background:grad, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 8px 24px ${color}30` }}>
                  <Icon size={24} color="#03070e" strokeWidth={2}/>
                </div>
                <div style={{ flex:1 }}>
                  <span className="badge badge-teal" style={{ marginBottom:10, display:'inline-flex' }}>{tag}</span>
                  <h3 className="h3">{title}</h3>
                </div>
              </div>
              <p style={{ color:'var(--t2)', fontSize:'.88rem', lineHeight:1.85 }}>{desc}</p>
              <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginTop:'auto' }}>
                {fs.map(s => (
                  <span key={s} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 11px', borderRadius:99, background:'rgba(255,255,255,.04)', border:'1px solid var(--border)', fontSize:'.72rem', color:'var(--t2)' }}>
                    <CheckCircle size={10} style={{ color }}/> {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section style={{ padding:'2rem 0 6rem' }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <span className="badge badge-green" style={{ marginBottom:16, display:'inline-flex' }}>How It Works</span>
          <h2 className="h2">Diagnosis in <span className="grad-green">3 steps</span></h2>
        </motion.div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'1.5rem' }}>
          {steps.map(({ n, title, desc, color }, i) => (
            <motion.div key={n} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*.12 }}
              className="glass" style={{ padding:'2.25rem', position:'relative', overflow:'hidden' }}>
              <div style={{ fontFamily:'var(--f-display)', fontSize:'5rem', fontWeight:900, color, opacity:.06, position:'absolute', top:'-12px', right:'12px', lineHeight:1, userSelect:'none' }}>{n}</div>
              <div style={{ display:'inline-block', padding:'3px 12px', borderRadius:99, background:`${color}14`, border:`1px solid ${color}28`, fontSize:'.68rem', fontWeight:700, color, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:16 }}>Step {n}</div>
              <h3 className="h3" style={{ marginBottom:12 }}>{title}</h3>
              <p style={{ color:'var(--t2)', fontSize:'.88rem', lineHeight:1.8 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────── */}
      <section style={{ padding:'2rem 0 6rem' }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:'center', marginBottom:'3.5rem' }}>
          <span className="badge badge-orange" style={{ marginBottom:16, display:'inline-flex' }}><Star size={10}/>Trusted By</span>
          <h2 className="h2">What users <span className="grad-warm">are saying</span></h2>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once:true }} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.25rem' }}>
          {testimonials.map(({ name, role, text, stars, avatar }) => (
            <motion.div key={name} variants={fadeUp} className="glass glass-hover" style={{ padding:'2rem' }}>
              <div style={{ display:'flex', gap:3, marginBottom:'1.25rem' }}>
                {Array(stars).fill(0).map((_,i) => <Star key={i} size={14} style={{ color:'var(--orange)', fill:'var(--orange)' }}/>)}
              </div>
              <p style={{ color:'var(--t2)', fontSize:'.88rem', lineHeight:1.85, marginBottom:'1.5rem', fontStyle:'italic' }}>"{text}"</p>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:'.75rem', color:'#03070e', flexShrink:0 }}>{avatar}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:'.88rem' }}>{name}</div>
                  <div style={{ fontSize:'.73rem', color:'var(--t3)' }}>{role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section style={{ padding:'2rem 0 4rem' }}>
        <motion.div initial={{ opacity:0, scale:.98 }} whileInView={{ opacity:1, scale:1 }} viewport={{ once:true }}
          className="highlight-box" style={{ padding:'5rem 3rem', textAlign:'center', position:'relative', overflow:'hidden' }}>
          <div className="orb" style={{ width:500, height:500, top:'-30%', left:'15%', background:'radial-gradient(circle,rgba(139,92,246,.1),transparent 60%)' }}/>
          <div className="orb" style={{ width:400, height:400, bottom:'-25%', right:'10%', background:'radial-gradient(circle,rgba(0,212,255,.08),transparent 60%)' }}/>
          <div style={{ position:'relative', zIndex:1 }}>
            <span className="badge badge-teal" style={{ marginBottom:20, display:'inline-flex' }}><Zap size={10}/>Free Forever</span>
            <h2 className="h2" style={{ marginBottom:'1.25rem' }}>Ready to check your <span className="grad">symptoms?</span></h2>
            <p className="sub" style={{ margin:'0 auto 2.5rem' }}>AI-powered health assessment in under 30 seconds. No appointment, no waiting room.</p>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <Link to="/predict" className="btn btn-primary btn-lg"><Brain size={19}/>Get My Diagnosis<ChevronRight size={16}/></Link>
              <Link to="/chat"    className="btn btn-outline btn-lg"><MessageCircle size={18}/>Chat with MediBot</Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ borderTop:'1px solid var(--border)', padding:'3rem 0 2rem', marginTop:'2rem' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:'3rem', marginBottom:'2.5rem' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1rem' }}>
              <div style={{ width:36, height:36, borderRadius:11, background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Stethoscope size={18} color="#03070e"/>
              </div>
              <div>
                <div style={{ fontFamily:'var(--f-display)', fontWeight:800, fontSize:'1rem' }}>Medi-Assist</div>
                <div style={{ fontSize:'.6rem', color:'var(--t3)', textTransform:'uppercase', letterSpacing:'.06em' }}>AI Healthcare Platform</div>
              </div>
            </div>
            <p style={{ color:'var(--t3)', fontSize:'.83rem', lineHeight:1.8, maxWidth:'32ch' }}>An AI-powered healthcare platform combining ML disease prediction and Gemini AI chatbot for intelligent health guidance.</p>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:'.82rem', color:'var(--t2)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'1rem' }}>Platform</div>
            {['AI Diagnosis','MediBot Chat','Dashboard','Sign Up'].map(l => (
              <div key={l} style={{ marginBottom:8 }}><Link to={l==='Sign Up'?'/auth':l==='AI Diagnosis'?'/predict':l==='MediBot Chat'?'/chat':'/dashboard'} style={{ color:'var(--t3)', fontSize:'.85rem', transition:'var(--t)' }} onMouseEnter={e=>e.target.style.color='var(--teal)'} onMouseLeave={e=>e.target.style.color='var(--t3)'}>{l}</Link></div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:'.82rem', color:'var(--t2)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:'1rem' }}>Tech Stack</div>
            {['React 19 + Vite','Express.js + MongoDB','Python Flask','Scikit-learn SVC','Gemini AI'].map(l => (
              <div key={l} style={{ marginBottom:8, color:'var(--t3)', fontSize:'.83rem' }}>{l}</div>
            ))}
          </div>
        </div>
        <div style={{ borderTop:'1px solid var(--border)', paddingTop:'1.5rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <p style={{ color:'var(--t3)', fontSize:'.72rem' }}>© 2025 Medi-Assist · Educational AI Platform · Not a substitute for professional medical advice</p>
          <div style={{ display:'flex', gap:4 }}>
            <span style={{ fontSize:'.72rem', color:'var(--t3)' }}>Built with</span>
            <Heart size={12} style={{ color:'var(--red)', margin:'0 3px' }}/>
            <span style={{ fontSize:'.72rem', color:'var(--t3)' }}>for healthcare accessibility</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
