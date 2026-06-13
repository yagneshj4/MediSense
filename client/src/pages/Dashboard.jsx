import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Activity, MessageSquare, FileText, Trash2,
  Download, Calendar, Plus, ChevronRight,
  TrendingUp, Brain, Heart, Clock, Zap,
  ArrowUpRight, Shield,
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const fadeUp = { hidden:{ opacity:0, y:18 }, show:{ opacity:1, y:0, transition:{ duration:.45 } } };
const stagger = { hidden:{}, show:{ transition:{ staggerChildren:.07 } } };

function SkeletonCard() {
  return (
    <div className="glass" style={{ padding:'1.5rem' }}>
      <div className="skeleton" style={{ width:40, height:40, borderRadius:11, marginBottom:12 }}/>
      <div className="skeleton" style={{ width:'60%', height:12, borderRadius:6, marginBottom:8 }}/>
      <div className="skeleton" style={{ width:'40%', height:20, borderRadius:6 }}/>
    </div>
  );
}

function HealthScore({ predictions, chatCount }) {
  const score = Math.min(100, Math.round(
    (predictions.length > 0 ? 30 : 0) +
    (chatCount > 0 ? 25 : 0) +
    (predictions.length > 2 ? 20 : 0) +
    25
  ));
  const color = score >= 80 ? 'var(--green)' : score >= 50 ? 'var(--orange)' : 'var(--red)';
  const label = score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : 'Getting started';
  const deg = (score / 100) * 360;
  return (
    <div className="glass" style={{ padding:'2rem', display:'flex', alignItems:'center', gap:'2rem', background:'linear-gradient(135deg,rgba(0,212,255,.04),rgba(139,92,246,.04))', borderColor:'rgba(0,212,255,.12)', flexWrap:'wrap' }}>
      {/* Donut */}
      <div style={{ textAlign:'center', flexShrink:0 }}>
        <div style={{ width:120, height:120, borderRadius:'50%', background:`conic-gradient(${color} ${deg}deg,rgba(255,255,255,.06) 0deg)`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
          <div style={{ width:92, height:92, borderRadius:'50%', background:'var(--bg-2)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontFamily:'var(--f-display)', fontWeight:800, fontSize:'1.8rem', color, lineHeight:1 }}>{score}</span>
            <span style={{ fontSize:'.6rem', color:'var(--t3)', textTransform:'uppercase', letterSpacing:'.06em' }}>/ 100</span>
          </div>
        </div>
        <div style={{ marginTop:8, fontSize:'.78rem', fontWeight:600, color }}>{label}</div>
      </div>
      {/* Info */}
      <div style={{ flex:1, minWidth:160 }}>
        <div style={{ fontSize:'.72rem', color:'var(--t3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:6 }}>Health Engagement Score</div>
        <h2 style={{ fontFamily:'var(--f-display)', fontWeight:800, fontSize:'1.5rem', lineHeight:1.1, marginBottom:8 }}>
          Your health profile <span className="grad">is active</span>
        </h2>
        <p style={{ color:'var(--t2)', fontSize:'.83rem', lineHeight:1.7, marginBottom:'1.25rem' }}>
          Score based on diagnosis history, chatbot interactions, and platform engagement.
        </p>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <Link to="/predict" className="btn btn-primary btn-sm"><Brain size={13}/>New Diagnosis</Link>
          <Link to="/chat"    className="btn btn-ghost   btn-sm"><MessageSquare size={13}/>Ask MediBot</Link>
        </div>
      </div>
      {/* Mini stats */}
      <div style={{ display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
        {[
          { label:'Diagnoses Run',    value:predictions.length, color:'var(--teal)',   icon:Activity },
          { label:'Chat Messages',    value:chatCount,          color:'var(--purple)', icon:MessageSquare },
        ].map(({ label, value, color:c, icon:Icon }) => (
          <div key={label} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:11, background:'rgba(255,255,255,.04)', border:'1px solid var(--border)' }}>
            <Icon size={14} style={{ color:c, flexShrink:0 }}/>
            <div>
              <div style={{ fontFamily:'var(--f-display)', fontWeight:800, fontSize:'1.2rem', color:c, lineHeight:1 }}>{value}</div>
              <div style={{ fontSize:'.68rem', color:'var(--t3)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon:Icon, label, value, color, sub, trend }) {
  return (
    <div className="glass" style={{ padding:'1.5rem', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, right:0, width:80, height:80, background:`radial-gradient(circle at 100% 0%,${color}12,transparent 65%)`, pointerEvents:'none' }}/>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
        <div style={{ width:42, height:42, borderRadius:12, background:`${color}14`, border:`1px solid ${color}22`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Icon size={18} style={{ color }}/>
        </div>
        {trend != null && (
          <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:'.72rem', fontWeight:600, color:'var(--green)' }}>
            <ArrowUpRight size={12}/>{trend}
          </span>
        )}
      </div>
      <div style={{ fontFamily:'var(--f-display)', fontSize:'2.2rem', fontWeight:800, color, lineHeight:1, letterSpacing:'-.03em', marginBottom:4 }}>{value}</div>
      <div style={{ fontSize:'.8rem', fontWeight:600, color:'var(--t2)', marginBottom:3 }}>{label}</div>
      {sub && <div style={{ fontSize:'.72rem', color:'var(--t3)' }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ icon:Icon, title, sub, link, linkLabel, color='var(--teal)' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.25rem' }}>
      <div style={{ width:38, height:38, borderRadius:11, background:`${color}14`, border:`1px solid ${color}22`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={17} style={{ color }}/>
      </div>
      <div style={{ flex:1 }}>
        <h2 style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:'1rem' }}>{title}</h2>
        {sub && <p style={{ fontSize:'.72rem', color:'var(--t3)' }}>{sub}</p>}
      </div>
      {link && linkLabel && (
        <Link to={link} className="btn btn-ghost btn-sm" style={{ gap:5, fontSize:'.75rem' }}><Plus size={12}/>{linkLabel}</Link>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuth } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [chatHistory,   setChatHistory]   = useState([]);
  const [predictions,   setPredictions]   = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [rxPage,        setRxPage]        = useState(1);
  const [predPage,      setPredPage]      = useState(1);
  const [chatPage,      setChatPage]      = useState(1);

  if (!isAuth) return <Navigate to="/auth"/>;

  useEffect(() => {
    Promise.all([
      api.get('/prescriptions').then(r => setPrescriptions(r.data.prescriptions || [])),
      api.get('/chat/history').then(r => setChatHistory(r.data.messages || [])),
      api.get('/predictions/history').then(r => setPredictions(r.data.predictions || [])),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const delPrescription = async id => {
    try { await api.delete(`/prescriptions/${id}`); setPrescriptions(p => p.filter(x => x._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  const memberSince = new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month:'short', year:'numeric' });
  const daysSince   = Math.max(1, Math.floor((Date.now() - new Date(user?.createdAt || Date.now())) / 86400000));
  const userMsgs    = chatHistory.filter(m => m.role === 'user').length;

  const stats = [
    { icon:Activity,       label:'Diagnoses Run',    value:predictions.length,   color:'var(--teal)',   sub:'Symptom checks',    trend:predictions.length > 0 ? '+'+predictions.length : null },
    { icon:MessageSquare,  label:'Chat Messages',    value:userMsgs,             color:'var(--purple)', sub:'With MediBot',      trend:userMsgs > 0 ? '+'+userMsgs : null },
    { icon:FileText,       label:'Prescriptions',    value:prescriptions.length, color:'var(--green)',  sub:'Uploaded & stored', trend:null },
    { icon:Calendar,       label:'Days Active',      value:daysSince,            color:'var(--orange)', sub:`Since ${memberSince}`, trend:null },
  ];

  const PER = 5;

  if (loading) return (
    <div style={{ maxWidth:1040, margin:'0 auto' }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:'1.5rem' }}>
        <div className="skeleton" style={{ width:64, height:64, borderRadius:'50%' }}/>
        <div>
          <div className="skeleton" style={{ width:120, height:12, borderRadius:6, marginBottom:8 }}/>
          <div className="skeleton" style={{ width:200, height:20, borderRadius:6 }}/>
        </div>
      </div>
      <div className="card-grid-4" style={{ marginBottom:'1.5rem' }}>
        {[0,1,2,3].map(i => <SkeletonCard key={i}/>)}
      </div>
      <div className="skeleton" style={{ height:140, borderRadius:20 }}/>
    </div>
  );

  return (
    <div style={{ maxWidth:1040, margin:'0 auto' }}>

      {/* ── Profile header ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass"
        style={{ padding:'1.75rem 2rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap', background:'linear-gradient(135deg,rgba(0,212,255,.04),rgba(139,92,246,.04))', borderColor:'rgba(0,212,255,.1)' }}>
        <div style={{ width:60, height:60, borderRadius:'50%', background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', fontWeight:800, color:'#03070e', flexShrink:0, boxShadow:'0 0 24px rgba(0,212,255,.3)' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'.68rem', color:'var(--t3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4 }}>Welcome back</div>
          <h1 style={{ fontFamily:'var(--f-display)', fontSize:'1.55rem', fontWeight:800, lineHeight:1.1, marginBottom:4 }}>
            {user?.name} <span style={{ opacity:.7 }}>👋</span>
          </h1>
          <p style={{ color:'var(--t3)', fontSize:'.8rem' }}>{user?.email} · Member since {memberSince}</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <Link to="/predict" className="btn btn-primary btn-sm"><Zap size={13}/>New Diagnosis</Link>
          <Link to="/chat"    className="btn btn-ghost   btn-sm"><MessageSquare size={13}/>MediBot</Link>
        </div>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="card-grid-4" style={{ marginBottom:'1.5rem' }}>
        {stats.map(s => (
          <motion.div key={s.label} variants={fadeUp}><StatCard {...s}/></motion.div>
        ))}
      </motion.div>

      {/* ── Health score ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0, transition:{ delay:.2 } }} style={{ marginBottom:'1.5rem' }}>
        <HealthScore predictions={predictions} chatCount={userMsgs}/>
      </motion.div>

      {/* ── Quick Actions ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0, transition:{ delay:.25 } }} style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { icon:Brain,         label:'Run AI Diagnosis', desc:'Check your symptoms now',    to:'/predict', color:'var(--teal)',   grad:'linear-gradient(135deg,rgba(0,212,255,.12),rgba(0,212,255,.06))' },
          { icon:MessageSquare, label:'Ask MediBot',      desc:'Get instant health answers', to:'/chat',    color:'var(--purple)', grad:'linear-gradient(135deg,rgba(139,92,246,.12),rgba(139,92,246,.06))' },
          { icon:FileText,      label:'Upload Prescription', desc:'Save your medical files', to:'/chat',    color:'var(--green)',  grad:'linear-gradient(135deg,rgba(16,185,129,.12),rgba(16,185,129,.06))' },
          { icon:Shield,        label:'Safety Check',     desc:'Emergency symptoms info',    to:'/predict', color:'var(--orange)', grad:'linear-gradient(135deg,rgba(245,158,11,.12),rgba(245,158,11,.06))' },
        ].map(({ icon:Icon, label, desc, to, color, grad }) => (
          <Link key={label} to={to} style={{
            display:'flex', flexDirection:'column', gap:10, padding:'1.25rem',
            background:grad, border:`1px solid ${color}20`, borderRadius:'var(--r-lg)',
            transition:'transform .2s,box-shadow .2s',
          }}
          onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow=`0 12px 32px ${color}20`;}}
          onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}
          >
            <Icon size={22} style={{ color }}/>
            <div>
              <div style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:'.88rem', marginBottom:3 }}>{label}</div>
              <div style={{ fontSize:'.73rem', color:'var(--t3)' }}>{desc}</div>
            </div>
            <ArrowUpRight size={14} style={{ color, marginTop:'auto', alignSelf:'flex-end' }}/>
          </Link>
        ))}
      </motion.div>

      {/* ── Diagnosis History ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0, transition:{ delay:.3 } }} className="glass" style={{ padding:'1.75rem', marginBottom:'1.25rem' }}>
        <SectionHeader icon={Activity} title="AI Diagnosis History" sub={`${predictions.length} checks run`} link="/predict" linkLabel="New Check" color="var(--teal)"/>
        {predictions.length === 0 ? (
          <div className="empty-state">
            <Activity size={40} style={{ color:'var(--t3)', opacity:.35 }}/>
            <p style={{ color:'var(--t3)', fontSize:'.88rem' }}>No diagnosis history yet</p>
            <Link to="/predict" className="btn btn-ghost btn-sm">Run AI Diagnosis</Link>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {predictions.slice((predPage-1)*PER, predPage*PER).map((p, i) => (
                <motion.div key={p._id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.04 }} className="table-row" style={{ flexWrap:'wrap', gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:'rgba(0,212,255,.1)', border:'1px solid rgba(0,212,255,.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Brain size={15} style={{ color:'var(--teal)' }}/>
                  </div>
                  <div style={{ flex:1, minWidth:180 }}>
                    <div style={{ fontWeight:700, fontSize:'.9rem', color:'var(--teal)', marginBottom:2 }}>{p.predictedDisease}</div>
                    <div style={{ fontSize:'.71rem', color:'var(--t3)' }}>
                      {new Date(p.createdAt).toLocaleDateString('en-IN',{ day:'2-digit', month:'short', year:'numeric' })} · Confidence: <strong style={{ color:'var(--teal)' }}>{p.confidence}%</strong>
                    </div>
                    {p.symptoms?.length > 0 && (
                      <div style={{ fontSize:'.7rem', color:'var(--t2)', marginTop:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {p.symptoms.slice(0,5).map(s=>s.replace(/_/g,' ')).join(' · ')}
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <a href={`/api/predictions/${p._id}/report?token=${localStorage.getItem('token')}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" title="Download PDF Report" style={{ gap:5 }}>
                      <Download size={12}/><span style={{ fontSize:'.72rem' }}>PDF</span>
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
            {Math.ceil(predictions.length/PER) > 1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, marginTop:'1rem' }}>
                <button disabled={predPage===1} onClick={()=>setPredPage(p=>p-1)} className="btn btn-ghost btn-sm" style={{ opacity:predPage===1?.38:1 }}>← Prev</button>
                <span style={{ fontSize:'.75rem', color:'var(--t3)' }}>Page {predPage} of {Math.ceil(predictions.length/PER)}</span>
                <button disabled={predPage===Math.ceil(predictions.length/PER)} onClick={()=>setPredPage(p=>p+1)} className="btn btn-ghost btn-sm" style={{ opacity:predPage===Math.ceil(predictions.length/PER)?.38:1 }}>Next →</button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* ── Prescriptions ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0, transition:{ delay:.35 } }} className="glass" style={{ padding:'1.75rem', marginBottom:'1.25rem' }}>
        <SectionHeader icon={FileText} title="Prescriptions" sub={`${prescriptions.length} uploaded`} link="/chat" linkLabel="Upload via Chat" color="var(--green)"/>
        {prescriptions.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} style={{ color:'var(--t3)', opacity:.35 }}/>
            <p style={{ color:'var(--t3)', fontSize:'.88rem' }}>No prescriptions yet</p>
            <Link to="/chat" className="btn btn-ghost btn-sm">Upload in MediBot</Link>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {prescriptions.slice((rxPage-1)*PER, rxPage*PER).map((p, i) => (
                <motion.div key={p._id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.04 }} className="table-row">
                  <div style={{ width:36, height:36, borderRadius:10, background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <FileText size={15} style={{ color:'var(--green)' }}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:500, fontSize:'.88rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.originalName}</div>
                    <div style={{ fontSize:'.7rem', color:'var(--t3)' }}>{new Date(p.createdAt).toLocaleDateString('en-IN')} · {p.fileType?.toUpperCase()}{p.note?` · ${p.note}`:''}</div>
                  </div>
                  <a href={`/api/prescriptions/${p._id}/file?token=${localStorage.getItem('token')}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm"><Download size={13}/></a>
                  <button onClick={() => delPrescription(p._id)} className="btn btn-red btn-sm"><Trash2 size={13}/></button>
                </motion.div>
              ))}
            </div>
            {Math.ceil(prescriptions.length/PER) > 1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, marginTop:'1rem' }}>
                <button disabled={rxPage===1} onClick={()=>setRxPage(p=>p-1)} className="btn btn-ghost btn-sm" style={{ opacity:rxPage===1?.38:1 }}>← Prev</button>
                <span style={{ fontSize:'.75rem', color:'var(--t3)' }}>Page {rxPage} of {Math.ceil(prescriptions.length/PER)}</span>
                <button disabled={rxPage===Math.ceil(prescriptions.length/PER)} onClick={()=>setRxPage(p=>p+1)} className="btn btn-ghost btn-sm" style={{ opacity:rxPage===Math.ceil(prescriptions.length/PER)?.38:1 }}>Next →</button>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* ── Recent Chat ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0, transition:{ delay:.4 } }} className="glass" style={{ padding:'1.75rem' }}>
        <SectionHeader icon={MessageSquare} title="Recent MediBot Conversations" sub={`${chatHistory.length} messages`} link="/chat" linkLabel="Open Chat" color="var(--purple)"/>
        {chatHistory.length === 0 ? (
          <div className="empty-state">
            <MessageSquare size={40} style={{ color:'var(--t3)', opacity:.35 }}/>
            <p style={{ color:'var(--t3)', fontSize:'.88rem' }}>No conversations yet</p>
            <Link to="/chat" className="btn btn-ghost btn-sm">Start chatting</Link>
          </div>
        ) : (
          <>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[...chatHistory].reverse().slice((chatPage-1)*PER, chatPage*PER).map((m, i) => (
                <div key={i} className="table-row">
                  <span className={`badge ${m.role==='user'?'badge-teal':'badge-purple'}`} style={{ flexShrink:0, fontSize:'.62rem' }}>{m.role}</span>
                  <p style={{ flex:1, color:'var(--t2)', fontSize:'.82rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.text}</p>
                  {m.timestamp && <span style={{ fontSize:'.65rem', color:'var(--t3)', flexShrink:0 }}>{new Date(m.timestamp).toLocaleTimeString([],{ hour:'2-digit', minute:'2-digit' })}</span>}
                </div>
              ))}
            </div>
            {Math.ceil(chatHistory.length/PER) > 1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, marginTop:'1rem' }}>
                <button disabled={chatPage===1} onClick={()=>setChatPage(p=>p-1)} className="btn btn-ghost btn-sm" style={{ opacity:chatPage===1?.38:1 }}>← Prev</button>
                <span style={{ fontSize:'.75rem', color:'var(--t3)' }}>Page {chatPage} of {Math.ceil(chatHistory.length/PER)}</span>
                <button disabled={chatPage===Math.ceil(chatHistory.length/PER)} onClick={()=>setChatPage(p=>p+1)} className="btn btn-ghost btn-sm" style={{ opacity:chatPage===Math.ceil(chatHistory.length/PER)?.38:1 }}>Next →</button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
