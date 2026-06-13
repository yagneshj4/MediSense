import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Search, Plus, X, AlertTriangle, Loader2,
  ChevronDown, Pill, Salad, Dumbbell, ShieldCheck,
  Activity, TrendingUp, ArrowRight, Sparkles,
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

function sevColor(sev = '') {
  const s = sev.toLowerCase();
  if (s.includes('urgent'))   return { bg:'rgba(239,68,68,.08)',   border:'rgba(239,68,68,.22)',   text:'var(--red)',    label:'Urgent'   };
  if (s.includes('moderate')) return { bg:'rgba(245,158,11,.08)', border:'rgba(245,158,11,.22)', text:'var(--orange)', label:'Moderate' };
  return                              { bg:'rgba(16,185,129,.08)', border:'rgba(16,185,129,.22)', text:'var(--green)',  label:'Mild'    };
}

function ConfidenceBar({ value }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 150); return () => clearTimeout(t); }, [value]);
  const c = value >= 80 ? 'var(--red)' : value >= 55 ? 'var(--orange)' : 'var(--green)';
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.78rem', color:'var(--t2)', marginBottom:6 }}>
        <span>Match Confidence</span>
        <strong style={{ color:c, fontFamily:'var(--f-display)' }}>{value}%</strong>
      </div>
      <div className="progress">
        <div className="progress-fill" style={{ width:`${w}%`, background:`linear-gradient(90deg,${c}88,${c})` }} />
      </div>
    </div>
  );
}

function Panel({ icon: Icon, title, children, accent='var(--teal)', defaultOpen=true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass fade-up" style={{ 
      overflow:'hidden', 
      marginBottom:12,
      borderLeft:`4px solid ${accent}`,
      background:'var(--bg-2)',
      boxShadow:'var(--sh-sm)',
      borderTop:'1px solid var(--border)',
      borderRight:'1px solid var(--border)',
      borderBottom:'1px solid var(--border)',
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width:'100%', display:'flex', alignItems:'center', gap:12,
        padding:'14px 20px', background:'none', border:'none',
        color:'var(--t1)', fontWeight:700, fontSize:'.9rem', cursor:'pointer',
      }}>
        <div style={{ width:32, height:32, borderRadius:8, background:`${accent}12`, border:`1px solid ${accent}25`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={15} style={{ color:accent }} />
        </div>
        <span style={{ fontFamily:'var(--f-display)', letterSpacing:'-0.015em' }}>{title}</span>
        <ChevronDown size={15} style={{ marginLeft:'auto', color:'var(--t3)', transform:open?'rotate(180deg)':'none', transition:'var(--t)' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }} style={{ overflow:'hidden' }}>
            <div style={{ padding:'0 20px 20px', borderTop:'1px solid var(--border)' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const QUICK = ['fever','headache','cough','fatigue','nausea','vomiting','dizziness','chest pain','breathlessness','skin rash','joint pain','back pain'];

export default function Predict() {
  const { isAuth } = useAuth();
  const [all, setAll]      = useState([]);
  const [sel, setSel]      = useState([]);
  const [q, setQ]          = useState('');
  const [loading, setL]    = useState(false);
  const [res, setRes]      = useState(null);
  const [symLoad, setSymL] = useState(true);
  const resRef = useRef(null);

  useEffect(() => {
    api.get('/predict/symptoms')
      .then(r => setAll(r.data.symptoms || []))
      .catch(() => toast.error('Could not load symptoms'))
      .finally(() => setSymL(false));
  }, []);

  const filtered = all.filter(s => s.toLowerCase().includes(q.toLowerCase()) && !sel.includes(s));
  const add  = s => { setSel(p => [...p, s]); setQ(''); };
  const rem  = s => setSel(p => p.filter(x => x !== s));
  const reset = () => { setSel([]); setRes(null); setQ(''); };

  const predict = async () => {
    if (!sel.length) { toast.error('Select at least one symptom'); return; }
    setL(true); setRes(null);
    try {
      const { data } = await api.post('/predict', { symptoms: sel });
      if (data.emergency) { toast.error(data.message, { duration:7000 }); return; }
      if (!data.success)  { toast.error(data.message); return; }
      setRes(data.result);
      if (isAuth) {
        try {
          await api.post('/predictions/save', {
            symptoms: sel,
            predictedDisease: data.result.disease,
            confidence: data.result.confidence,
            precautions: data.result.precautions || [],
          });
          toast.success('Diagnosis saved to history');
        } catch (e) { console.warn('[Auto-Save]', e.message); }
      }
      setTimeout(() => resRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 180);
    } catch (err) {
      toast.error(err.response?.data?.message || 'ML service unavailable');
    } finally { setL(false); }
  };

  return (
    <div style={{ maxWidth:940, margin:'0 auto' }}>

      {/* ── Page Header ── */}
      <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:'2rem' }}>
        <span className="badge badge-teal" style={{ marginBottom:12, display:'inline-flex' }}>
          <Sparkles size={10}/> AI Symptom Checker
        </span>
        <h1 className="h2">Diagnose your <span className="grad">symptoms</span></h1>
        <p style={{ color:'var(--t2)', fontSize:'.9rem', marginTop:8 }}>
          Select symptoms → AI analyzes → get your personalized health report.
        </p>
      </motion.div>

      {/* ── Symptom Input Card ── */}
      <motion.div 
        initial={{ opacity:0, y:16 }} 
        animate={{ opacity:1, y:0, transition:{ delay:.06 } }} 
        className="glass" 
        style={{ 
          padding:'2.25rem', 
          marginBottom:'1.5rem',
          boxShadow:'var(--sh-md)',
          border:'1px solid var(--border-2)'
        }}
      >
        {/* Selected chips */}
        <AnimatePresence>
          {sel.length > 0 && (
            <motion.div 
              initial={{ opacity:0, height:0 }} 
              animate={{ opacity:1, height:'auto' }} 
              exit={{ opacity:0, height:0 }}
              style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:'1.5rem' }}
            >
              {sel.map(s => (
                <motion.span 
                  key={s} 
                  initial={{ scale:.85, opacity:0 }} 
                  animate={{ scale:1, opacity:1 }} 
                  exit={{ scale:.85, opacity:0 }}
                  className="chip chip-teal" 
                  style={{ 
                    fontWeight:600, 
                    boxShadow:'var(--sh-xs)',
                    padding:'6px 14px',
                    display:'flex',
                    alignItems:'center',
                    gap:6,
                    border:'1px solid rgba(16, 185, 129, 0.25)'
                  }}
                >
                  {s}
                  <button 
                    onClick={() => rem(s)} 
                    style={{ 
                      background:'rgba(16, 185, 129, 0.15)', 
                      border:'none', 
                      color:'var(--teal)', 
                      display:'flex', 
                      alignItems:'center',
                      justifyContent:'center',
                      padding:2, 
                      borderRadius:'50%',
                      cursor:'pointer', 
                      transition:'var(--t)' 
                    }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--red-dim)'}
                    onMouseLeave={e => e.currentTarget.style.background='rgba(16, 185, 129, 0.15)'}
                  >
                    <X size={10} style={{ strokeWidth: 2.5 }} />
                  </button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search box */}
        <div style={{ position:'relative', marginBottom:'1.5rem' }}>
          <Search size={16} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--teal)', opacity:0.8 }} />
          <input 
            className="inp" 
            style={{ 
              paddingLeft:46, 
              paddingRight:40, 
              height:48, 
              fontSize:'.95rem',
              boxShadow:'var(--sh-xs)'
            }} 
            value={q} 
            onChange={e => setQ(e.target.value)}
            placeholder={symLoad ? 'Loading symptoms database…' : 'Type to search symptoms (e.g. headache, fever, cough)…'}
            disabled={symLoad} 
          />
          {q && (
            <button 
              onClick={() => setQ('')} 
              style={{ 
                position:'absolute', 
                right:16, 
                top:'50%', 
                transform:'translateY(-50%)', 
                background:'none', 
                border:'none', 
                color:'var(--t3)', 
                display:'flex', 
                cursor:'pointer',
                opacity:0.7
              }}
              onMouseEnter={e => e.currentTarget.style.opacity=1}
              onMouseLeave={e => e.currentTarget.style.opacity=0.7}
            >
              <X size={16}/>
            </button>
          )}
        </div>

        {/* Dropdown suggestions */}
        <AnimatePresence>
          {q && filtered.length > 0 && (
            <motion.div 
              initial={{ opacity:0, y:-6, scaleY:.95 }} 
              animate={{ opacity:1, y:0, scaleY:1 }} 
              exit={{ opacity:0, y:-6 }}
              style={{ 
                maxHeight:240, 
                overflowY:'auto', 
                background:'var(--card-dropdown)', 
                border:'1px solid var(--border-2)', 
                borderRadius:'var(--r-md)', 
                padding:6, 
                marginBottom:'1.5rem', 
                boxShadow:'var(--sh-lg)',
                zIndex:100,
                position:'relative'
              }}
            >
              {filtered.slice(0,24).map(s => (
                <button 
                  key={s} 
                  onClick={() => add(s)}
                  style={{ 
                    width:'100%', 
                    textAlign:'left', 
                    padding:'10px 14px', 
                    background:'none', 
                    border:'none', 
                    color:'var(--t2)', 
                    fontSize:'.88rem', 
                    borderRadius:9, 
                    cursor:'pointer', 
                    transition:'var(--t)', 
                    display:'flex', 
                    alignItems:'center', 
                    gap:8 
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.background='var(--teal-dim)'; 
                    e.currentTarget.style.color='var(--teal)'; 
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.background=''; 
                    e.currentTarget.style.color=''; 
                  }}
                >
                  <Plus size={14} style={{ opacity:.6, color:'var(--teal)' }}/> {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick select chips */}
        {!q && (
          <div>
            <p style={{ fontSize:'.75rem', color:'var(--t3)', marginBottom:12, fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', display:'flex', alignItems:'center', gap:5 }}>
              <Activity size={12} style={{ color:'var(--teal)' }} /> Quick Select Common Symptoms
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {QUICK.filter(s => !sel.includes(s)).map(s => (
                <button 
                  key={s} 
                  onClick={() => add(s)}
                  style={{ 
                    display:'flex', 
                    alignItems:'center', 
                    gap:6, 
                    padding:'6px 14px', 
                    borderRadius:99, 
                    background:'var(--teal-dim)', 
                    border:'1px solid rgba(16,185,129,0.18)', 
                    color:'var(--purple)', 
                    fontSize:'.8rem', 
                    fontWeight:600, 
                    cursor:'pointer', 
                    transition:'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)' 
                  }}
                  onMouseEnter={e => { 
                    e.currentTarget.style.background='rgba(16,185,129,0.12)'; 
                    e.currentTarget.style.borderColor='var(--teal)';
                    e.currentTarget.style.transform='scale(1.05)';
                  }}
                  onMouseLeave={e => { 
                    e.currentTarget.style.background='var(--teal-dim)'; 
                    e.currentTarget.style.borderColor='rgba(16,185,129,0.18)'; 
                    e.currentTarget.style.transform='none';
                  }}
                >
                  <Plus size={11} style={{ color:'var(--teal)' }}/> {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action row */}
        <div style={{ display:'flex', gap:10, marginTop:'2rem', alignItems:'center', flexWrap:'wrap', borderTop:'1px solid var(--border)', paddingTop:'1.5rem' }}>
          <button onClick={predict} className="btn btn-primary" disabled={loading || !sel.length} style={{ gap:8, height:42, padding:'0 24px' }}>
            {loading ? <Loader2 size={16} style={{ animation:'_spin .8s linear infinite' }}/> : <Brain size={16}/>}
            {loading ? 'Analyzing Symptoms…' : 'Run AI Diagnosis'}
          </button>
          {sel.length > 0 && (
            <button onClick={reset} className="btn btn-ghost btn-sm" style={{ height:36 }}><X size={13}/> Clear all</button>
          )}
          {sel.length > 0 && (
            <span style={{ color:'var(--t2)', fontSize:'.8rem', fontWeight:500, marginLeft:4 }}>
              {sel.length} symptom{sel.length>1?'s':''} selected
            </span>
          )}
          {!isAuth && (
            <span style={{ color:'var(--t3)', fontSize:'.78rem', marginLeft:'auto', background:'var(--bg-3)', padding:'4px 12px', borderRadius:6 }}>
              Sign in to save diagnosis history
            </span>
          )}
        </div>
      </motion.div>


      {/* ── Results ── */}
      <AnimatePresence>
        {res && (
          <motion.div ref={resRef} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:.4 }}>

            {/* Primary Diagnosis Card */}
            {(() => {
              const sc = sevColor(res.severity);
              return (
                <div 
                  className="glass fade-up" 
                  style={{ 
                    padding:'2.5rem', 
                    marginBottom:'1.5rem', 
                    boxShadow:'var(--sh-md)',
                    border:'1px solid var(--border-2)',
                    background:'var(--bg-2)'
                  }}
                >
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'2rem', flexWrap:'wrap', marginBottom:'2rem' }}>
                    <div style={{ flex:1, minWidth:240 }}>
                      <span className="badge badge-teal" style={{ marginBottom:14, display:'inline-flex' }}>Primary Diagnosis</span>
                      <h2 style={{ 
                        fontFamily:'var(--f-display)', 
                        fontSize:clamp('1.8rem','4vw','2.4rem'), 
                        fontWeight:800, 
                        lineHeight:1.15, 
                        marginBottom:16,
                        color:'var(--t1)'
                      }}>{res.disease}</h2>
                      <span style={{ 
                        display:'inline-flex', 
                        alignItems:'center', 
                        gap:8, 
                        padding:'6px 16px', 
                        borderRadius:99, 
                        background:sc.bg, 
                        border:`1px solid ${sc.border}`, 
                        color:sc.text, 
                        fontSize:'.8rem', 
                        fontWeight:700 
                      }}>
                        <span style={{ width:8, height:8, borderRadius:'50%', background:sc.text, display:'inline-block' }}/>
                        {sc.label} Severity Level
                      </span>
                    </div>

                    {/* Confidence donut */}
                    <div style={{ textAlign:'center', flexShrink:0, padding:'8px 16px', background:'var(--bg-3)', borderRadius:16, border:'1px solid var(--border)' }}>
                      <div style={{
                        width:88, height:88, borderRadius:'50%',
                        background:`conic-gradient(var(--teal) ${res.confidence * 3.6}deg, rgba(16, 185, 129, 0.08) 0deg)`,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        margin:'0 auto 10px',
                        boxShadow:'0 0 0 3px rgba(16, 185, 129, 0.12)',
                      }}>
                        <div style={{ 
                          width:66, 
                          height:66, 
                          borderRadius:'50%', 
                          background:'var(--bg-2)', 
                          display:'flex', 
                          alignItems:'center', 
                          justifyContent:'center', 
                          flexDirection:'column' 
                        }}>
                          <span style={{ fontFamily:'var(--f-display)', fontWeight:800, fontSize:'1.3rem', color:'var(--teal)', lineHeight:1 }}>{res.confidence}%</span>
                        </div>
                      </div>
                      <span style={{ fontSize:'.7rem', color:'var(--t2)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em' }}>Match Probability</span>
                    </div>
                  </div>

                  <div style={{ background:'var(--bg-3)', padding:'1.25rem', borderRadius:12, border:'1px solid var(--border)', marginBottom:'2rem' }}>
                    <ConfidenceBar value={res.confidence} />
                    {res.confidence_note && (
                      <p style={{ color:'var(--t2)', fontSize:'.82rem', marginTop:12, fontStyle:'italic', lineHeight:1.7 }}>
                        Note: {res.confidence_note}
                      </p>
                    )}
                  </div>

                  {/* Alternative diagnoses */}
                  {res.top3?.length > 1 && (
                    <div>
                      <p style={{ fontSize:'.75rem', color:'var(--t3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
                        <TrendingUp size={14} style={{ color:'var(--purple)' }}/> Other Possibilities Considered
                      </p>
                      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        {res.top3.slice(1).map((d,i) => (
                          <div key={i} className="table-row" style={{ background:'var(--bg-3)', border:'1px solid var(--border)' }}>
                            <span style={{ color:'var(--teal)', fontSize:'.78rem', width:24, fontFamily:'var(--f-display)', fontWeight:800 }}>#{i+2}</span>
                            <span style={{ flex:1, fontSize:'.88rem', fontWeight:600, color:'var(--t1)' }}>{d.disease}</span>
                            <div style={{ width:100 }}>
                              <div className="progress" style={{ background:'rgba(0, 0, 0, 0.05)', height:6 }}><div className="progress-fill" style={{ width:`${d.confidence}%`, background:'var(--purple)' }} /></div>
                            </div>
                            <span style={{ color:'var(--purple)', fontWeight:700, fontSize:'.85rem', width:48, textAlign:'right' }}>{d.confidence}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Info panels */}
            {res.description && (
              <Panel icon={Activity} title="About This Condition" accent="var(--teal)">
                <p style={{ color:'var(--t2)', lineHeight:1.9, fontSize:'.92rem', paddingTop:14, fontWeight:500 }}>{res.description}</p>
              </Panel>
            )}
            {res.precautions?.filter(Boolean).length > 0 && (
              <Panel icon={ShieldCheck} title="Clinical Precautions" accent="var(--green)">
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:10, paddingTop:14 }}>
                  {res.precautions.filter(Boolean).map((p,i) => (
                    <div 
                      key={i} 
                      style={{ 
                        display:'flex', 
                        gap:10, 
                        alignItems:'flex-start', 
                        padding:'12px 16px', 
                        background:'var(--bg-3)', 
                        borderRadius:12, 
                        border:'1px solid var(--border)',
                        boxShadow:'var(--sh-xs)',
                        transition:'all 0.2s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(16,185,129,0.3)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='none'; }}
                    >
                      <ShieldCheck size={14} style={{ color:'var(--green)', flexShrink:0, marginTop:3 }} />
                      <span style={{ color:'var(--t1)', fontSize:'.85rem', lineHeight:1.6, fontWeight:600 }}>{p}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
            {res.medication?.filter(Boolean).length > 0 && (
              <Panel icon={Pill} title="Suggested Medications" accent="var(--purple)" defaultOpen={false}>
                <div style={{ paddingTop:14 }}>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                    {res.medication.filter(Boolean).map((m,i) => (
                      <span 
                        key={i} 
                        className="chip chip-purple" 
                        style={{ 
                          fontWeight:600, 
                          padding:'6px 14px', 
                          border:'1px solid rgba(13, 148, 136, 0.25)',
                          boxShadow:'var(--sh-xs)'
                        }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'12px 16px', background:'var(--orange-dim)', borderRadius:12, border:'1px solid rgba(217,119,6,0.18)' }}>
                    <AlertTriangle size={15} style={{ color:'var(--orange)', flexShrink:0, marginTop:2 }} />
                    <p style={{ fontSize:'.8rem', color:'var(--orange)', fontWeight:600, lineHeight:1.5 }}>Always consult a licensed healthcare professional before taking any medication.</p>
                  </div>
                </div>
              </Panel>
            )}
            {res.diet?.filter(Boolean).length > 0 && (
              <Panel icon={Salad} title="Recommended Diet" accent="var(--green)" defaultOpen={false}>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, paddingTop:14 }}>
                  {res.diet.filter(Boolean).map((d,i) => (
                    <span 
                      key={i} 
                      className="chip chip-green" 
                      style={{ 
                        fontWeight:600, 
                        padding:'6px 14px', 
                        border:'1px solid rgba(5, 150, 105, 0.25)',
                        boxShadow:'var(--sh-xs)'
                      }}
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </Panel>
            )}
            {res.workout?.filter(Boolean).length > 0 && (
              <Panel icon={Dumbbell} title="Exercise & Recovery" accent="var(--orange)" defaultOpen={false}>
                <div style={{ display:'flex', flexDirection:'column', gap:10, paddingTop:14 }}>
                  {res.workout.filter(Boolean).map((w,i) => (
                    <div 
                      key={i} 
                      style={{ 
                        display:'flex', 
                        gap:12, 
                        alignItems:'flex-start', 
                        padding:'12px 16px', 
                        background:'var(--bg-3)', 
                        borderRadius:12, 
                        border:'1px solid var(--border)',
                        transition:'all 0.2s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(217,119,6,0.3)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; }}
                    >
                      <ArrowRight size={14} style={{ color:'var(--orange)', flexShrink:0, marginTop:4 }} />
                      <span style={{ color:'var(--t1)', fontSize:'.88rem', fontWeight:600 }}>{w}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
            {res.unrecognized?.length > 0 && (
              <div style={{ padding:'14px 18px', background:'var(--orange-dim)', border:'1px solid rgba(217,119,6,0.18)', borderRadius:'var(--r-md)', marginTop:14, display:'flex', gap:10, alignItems:'flex-start' }}>
                <AlertTriangle size={16} style={{ color:'var(--orange)', flexShrink:0, marginTop:2 }} />
                <p style={{ color:'var(--orange)', fontSize:'.85rem', fontWeight:600 }}>Unrecognized terms: {res.unrecognized.join(', ')}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function clamp(min, mid, max) {
  return `clamp(${min},${mid},${max})`;
}
