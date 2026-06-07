import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Search, Plus, X, AlertTriangle, Loader2,
  ChevronDown, Pill, Salad, Dumbbell, ShieldCheck,
  Activity, TrendingUp, ArrowRight,
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

/* ── Helpers ─────────────────────────────────────────────────────── */
function sevColor(sev = '') {
  const s = sev.toLowerCase();
  if (s.includes('urgent'))   return { bg:'rgba(239,68,68,.1)',   border:'rgba(239,68,68,.3)',   text:'var(--red)',    label:'🔴 Urgent'   };
  if (s.includes('moderate')) return { bg:'rgba(245,158,11,.1)', border:'rgba(245,158,11,.3)', text:'var(--orange)', label:'🟡 Moderate' };
  return                              { bg:'rgba(16,185,129,.1)', border:'rgba(16,185,129,.3)', text:'var(--green)',  label:'🟢 Mild'    };
}

function Bar({ value }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 120); return () => clearTimeout(t); }, [value]);
  const c = value >= 80 ? 'var(--red)' : value >= 55 ? 'var(--orange)' : 'var(--green)';
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.78rem', color:'var(--t2)', marginBottom:5 }}>
        <span>Match Confidence</span>
        <strong style={{ color:c }}>{value}%</strong>
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
    <div className="glass" style={{ overflow:'hidden', marginBottom:10 }}>
      <button onClick={() => setOpen(!open)} style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'13px 18px', background:'none', border:'none', color:'var(--t1)', fontWeight:600, fontSize:'.85rem', cursor:'pointer' }}>
        <div style={{ width:28, height:28, borderRadius:8, background:`${accent}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={14} style={{ color:accent }} />
        </div>
        {title}
        <ChevronDown size={14} style={{ marginLeft:'auto', color:'var(--t3)', transform:open?'rotate(180deg)':'none', transition:'var(--t)' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height:0 }} animate={{ height:'auto' }} exit={{ height:0 }} style={{ overflow:'hidden' }}>
            <div style={{ padding:'0 18px 16px', borderTop:'1px solid var(--border)' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const QUICK = ['fever','headache','cough','fatigue','nausea','vomiting','dizziness','chest pain','breathlessness','skin rash','joint pain','back pain'];

export default function Predict() {
  const { isAuth } = useAuth();
  const [all, setAll]     = useState([]);
  const [sel, setSel]     = useState([]);
  const [q, setQ]         = useState('');
  const [loading, setL]   = useState(false);
  const [res, setRes]     = useState(null);
  const [symLoad, setSymL]= useState(true);
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
        } catch (saveErr) {
          console.warn('[Auto-Save Diagnosis Error]', saveErr.message);
        }
      }

      setTimeout(() => resRef.current?.scrollIntoView({ behavior:'smooth', block:'start' }), 150);
    } catch (err) {
      toast.error(err.response?.data?.message || 'ML service unavailable. Is it running?');
    } finally { setL(false); }
  };

  return (
    <div style={{ maxWidth:920, margin:'0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:'2rem' }}>
        <span className="badge badge-teal" style={{ marginBottom:10, display:'inline-flex' }}>AI Symptom Checker</span>
        <h1 className="h2">Diagnose your <span className="grad">symptoms</span></h1>
        <p style={{ color:'var(--t2)', fontSize:'.9rem', marginTop:6 }}>Select symptoms → AI analyzes → get your personalized health report.</p>
      </motion.div>

      {/* Symptom Input Card */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0, transition:{ delay:.08 } }} className="glass" style={{ padding:'1.75rem', marginBottom:'1.5rem' }}>
        {/* Selected chips */}
        <AnimatePresence>
          {sel.length > 0 && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:'1rem' }}>
              {sel.map(s => (
                <motion.span key={s} initial={{ scale:.8, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:.8, opacity:0 }} className="chip chip-teal">
                  {s}
                  <button onClick={() => rem(s)} style={{ background:'none', border:'none', color:'inherit', display:'flex', padding:0, cursor:'pointer' }}><X size={11}/></button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search box */}
        <div style={{ position:'relative', marginBottom:'1rem' }}>
          <Search size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--t3)' }} />
          <input className="inp" style={{ paddingLeft:40 }} value={q} onChange={e => setQ(e.target.value)} placeholder={symLoad ? 'Loading 132 symptoms...' : 'Search symptoms…'} disabled={symLoad} />
          {q && <button onClick={() => setQ('')} style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--t3)', display:'flex' }}><X size={14}/></button>}
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {q && filtered.length > 0 && (
            <motion.div initial={{ opacity:0, y:-8, scaleY:.95 }} animate={{ opacity:1, y:0, scaleY:1 }} exit={{ opacity:0, y:-8 }} style={{ maxHeight:200, overflowY:'auto', background:'rgba(6,11,23,.98)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:6, marginBottom:'1rem' }}>
              {filtered.slice(0,22).map(s => (
                <button key={s} onClick={() => add(s)} style={{ width:'100%', textAlign:'left', padding:'9px 13px', background:'none', border:'none', color:'var(--t2)', fontSize:'.85rem', borderRadius:8, cursor:'pointer', transition:'var(--t)', display:'flex', alignItems:'center', gap:8 }}
                  onMouseEnter={e => { e.currentTarget.style.background='var(--teal-dim)'; e.currentTarget.style.color='var(--teal)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color=''; }}
                >
                  <Plus size={13}/> {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick symptoms */}
        {!q && (
          <div>
            <p style={{ fontSize:'.72rem', color:'var(--t3)', marginBottom:8, fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>Quick Select</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
              {QUICK.filter(s => !sel.includes(s)).map(s => (
                <button key={s} onClick={() => add(s)} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 13px', borderRadius:99, background:'transparent', border:'1px dashed rgba(139,92,246,.35)', color:'#c4b5fd', fontSize:'.78rem', fontWeight:500, cursor:'pointer', transition:'var(--t)' }}
                  onMouseEnter={e => { e.currentTarget.style.background='var(--purple-dim)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='transparent'; }}
                >
                  <Plus size={10}/> {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex', gap:10, marginTop:'1.5rem', alignItems:'center', flexWrap:'wrap' }}>
          <button onClick={predict} className="btn btn-primary" disabled={loading || !sel.length}>
            {loading ? <Loader2 size={17} style={{ animation:'_spin .8s linear infinite' }}/> : <Brain size={17}/>}
            {loading ? 'Analyzing…' : 'Run AI Diagnosis'}
          </button>
          {sel.length > 0 && (
            <button onClick={reset} className="btn btn-ghost btn-sm">
              <X size={13}/> Clear
            </button>
          )}
          {sel.length > 0 && (
            <span style={{ color:'var(--t3)', fontSize:'.78rem' }}>{sel.length} symptom{sel.length>1?'s':''} selected</span>
          )}
        </div>
      </motion.div>

      {/* ── Results ── */}
      <AnimatePresence>
        {res && (
          <motion.div ref={resRef} initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:.4 }}>

            {/* Primary Card */}
            <div className="glass" style={{ padding:'2rem', marginBottom:'1rem', borderColor:'rgba(0,212,255,.15)' }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:'1.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
                <div style={{ flex:1 }}>
                  <span className="badge badge-teal" style={{ marginBottom:10, display:'inline-flex' }}>Primary Diagnosis</span>
                  <h2 style={{ fontFamily:'var(--f-display)', fontSize:'2rem', fontWeight:800, lineHeight:1.1, marginBottom:8 }}>{res.disease}</h2>
                  {(() => { const sc = sevColor(res.severity); return (
                    <span style={{ padding:'5px 14px', borderRadius:99, background:sc.bg, border:`1px solid ${sc.border}`, color:sc.text, fontSize:'.8rem', fontWeight:700 }}>{sc.label}</span>
                  ); })()}
                </div>
                {/* Confidence ring */}
                <div style={{ textAlign:'center', flexShrink:0 }}>
                  <div style={{ width:80, height:80, borderRadius:'50%', background:`conic-gradient(var(--teal) ${res.confidence * 3.6}deg, rgba(255,255,255,.06) 0deg)`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 6px' }}>
                    <div style={{ width:62, height:62, borderRadius:'50%', background:'var(--bg-2,#0a1020)', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                      <span style={{ fontFamily:'var(--f-display)', fontWeight:800, fontSize:'1.1rem', color:'var(--teal)', lineHeight:1 }}>{res.confidence}%</span>
                    </div>
                  </div>
                  <span style={{ fontSize:'.7rem', color:'var(--t3)' }}>Confidence</span>
                </div>
              </div>

              <Bar value={res.confidence} />
              {res.confidence_note && <p style={{ color:'var(--t3)', fontSize:'.78rem', marginTop:10, fontStyle:'italic', lineHeight:1.7 }}>{res.confidence_note}</p>}

              {/* Alt diagnoses */}
              {res.top3?.length > 1 && (
                <div style={{ marginTop:'1.5rem' }}>
                  <p style={{ fontSize:'.72rem', color:'var(--t3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Other Possibilities</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {res.top3.slice(1).map((d,i) => (
                      <div key={i} className="table-row">
                        <span style={{ color:'var(--t3)', fontSize:'.75rem', width:22, fontFamily:'var(--f-display)', fontWeight:700 }}>#{i+2}</span>
                        <span style={{ flex:1, fontSize:'.88rem', fontWeight:500 }}>{d.disease}</span>
                        <div style={{ width:80 }}>
                          <div className="progress"><div className="progress-fill" style={{ width:`${d.confidence}%`, background:'var(--purple)' }} /></div>
                        </div>
                        <span style={{ color:'#c4b5fd', fontWeight:700, fontSize:'.82rem', width:42, textAlign:'right' }}>{d.confidence}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Info panels */}
            {res.description && (
              <Panel icon={Activity} title="About This Condition">
                <p style={{ color:'var(--t2)', lineHeight:1.85, fontSize:'.88rem', paddingTop:12 }}>{res.description}</p>
              </Panel>
            )}
            {res.precautions?.filter(Boolean).length > 0 && (
              <Panel icon={ShieldCheck} title="Clinical Precautions" accent="var(--green)">
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:8, paddingTop:12 }}>
                  {res.precautions.filter(Boolean).map((p,i) => (
                    <div key={i} style={{ display:'flex', gap:9, alignItems:'flex-start', padding:'10px 13px', background:'rgba(16,185,129,.05)', borderRadius:10, border:'1px solid rgba(16,185,129,.12)' }}>
                      <ShieldCheck size={13} style={{ color:'var(--green)', flexShrink:0, marginTop:2 }} />
                      <span style={{ color:'var(--t2)', fontSize:'.82rem', lineHeight:1.6 }}>{p}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
            {res.medication?.filter(Boolean).length > 0 && (
              <Panel icon={Pill} title="Medications" accent="var(--purple)" defaultOpen={false}>
                <div style={{ paddingTop:12 }}>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:10 }}>
                    {res.medication.filter(Boolean).map((m,i) => <span key={i} className="chip chip-purple">{m}</span>)}
                  </div>
                  <p style={{ fontSize:'.72rem', color:'var(--t3)', fontStyle:'italic' }}>⚠️ Always consult a licensed physician before taking any medication.</p>
                </div>
              </Panel>
            )}
            {res.diet?.filter(Boolean).length > 0 && (
              <Panel icon={Salad} title="Recommended Diet" accent="var(--green)" defaultOpen={false}>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7, paddingTop:12 }}>
                  {res.diet.filter(Boolean).map((d,i) => <span key={i} className="chip chip-green">{d}</span>)}
                </div>
              </Panel>
            )}
            {res.workout?.filter(Boolean).length > 0 && (
              <Panel icon={Dumbbell} title="Exercise & Recovery" accent="var(--orange)" defaultOpen={false}>
                <div style={{ display:'flex', flexDirection:'column', gap:8, paddingTop:12 }}>
                  {res.workout.filter(Boolean).map((w,i) => (
                    <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'10px 13px', background:'rgba(245,158,11,.05)', borderRadius:10, border:'1px solid rgba(245,158,11,.12)' }}>
                      <ArrowRight size={13} style={{ color:'var(--orange)', flexShrink:0, marginTop:2 }} />
                      <span style={{ color:'var(--t2)', fontSize:'.85rem' }}>{w}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
            {res.unrecognized?.length > 0 && (
              <div style={{ padding:'11px 16px', background:'rgba(245,158,11,.07)', border:'1px solid rgba(245,158,11,.18)', borderRadius:'var(--r-md)', marginTop:8, display:'flex', gap:10 }}>
                <AlertTriangle size={15} style={{ color:'var(--orange)', flexShrink:0 }} />
                <p style={{ color:'var(--orange)', fontSize:'.8rem' }}>Unrecognized terms: {res.unrecognized.join(', ')}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
