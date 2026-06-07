import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Activity, MessageSquare, FileText, Trash2,
  Download, Calendar, Plus, User, ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="glass" style={{ padding:'1.5rem' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
        <div className="icon-box" style={{ background:`${color}18`, width:40, height:40, borderRadius:11 }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span style={{ fontSize:'.78rem', color:'var(--t3)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.06em' }}>{label}</span>
      </div>
      <div style={{ fontFamily:'var(--f-display)', fontSize:'2rem', fontWeight:800, color, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:'.72rem', color:'var(--t3)', marginTop:5 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { user, isAuth } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [chatHistory,   setChatHistory]   = useState([]);
  const [predictions,   setPredictions]   = useState([]);
  const [loading, setLoading]             = useState(true);

  // Pagination states
  const [rxPage, setRxPage] = useState(1);
  const [chatPage, setChatPage] = useState(1);
  const [predPage, setPredPage] = useState(1);

  if (!isAuth) return <Navigate to="/auth" />;

  useEffect(() => {
    Promise.all([
      api.get('/prescriptions').then(r => setPrescriptions(r.data.prescriptions || [])),
      api.get('/chat/history').then(r => setChatHistory(r.data.messages || [])),
      api.get('/predictions/history').then(r => setPredictions(r.data.predictions || [])),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const delPrescription = async (id) => {
    try { await api.delete(`/prescriptions/${id}`); setPrescriptions(p => p.filter(x => x._id !== id)); toast.success('Deleted'); }
    catch { toast.error('Delete failed'); }
  };

  if (loading) return <div className="center-spin"><div className="spin"/></div>;

  const userMsgs   = chatHistory.filter(m => m.role === 'user').length;
  const daysSince  = Math.max(1, Math.floor((Date.now() - new Date(user?.createdAt || Date.now())) / 86400000));
  const memberSince= new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month:'short', year:'numeric' });

  const stats = [
    { icon: Activity,      label:'Diagnoses',    value: predictions.length,  color:'var(--teal)',   sub:'Symptom checks run'         },
    { icon: MessageSquare, label:'Chat Messages', value: userMsgs,            color:'var(--purple)', sub:'With MediBot'                },
    { icon: FileText,      label:'Prescriptions', value: prescriptions.length,color:'var(--green)',  sub:'Uploaded & stored'          },
    { icon: Calendar,      label:'Days Active',   value: daysSince,           color:'var(--orange)', sub:`Member since ${memberSince}` },
  ];

  return (
    <div style={{ maxWidth:1000, margin:'0 auto' }}>

      {/* ── Profile Header ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass"
        style={{ padding:'2rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap', background:'linear-gradient(135deg,rgba(0,212,255,.04),rgba(139,92,246,.04))' }}>
        <div style={{ width:64, height:64, borderRadius:'50%', background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:800, color:'#060b17', flexShrink:0 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:'.72rem', color:'var(--t3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:4 }}>Welcome back</div>
          <h1 style={{ fontFamily:'var(--f-display)', fontSize:'1.6rem', fontWeight:800, lineHeight:1 }}>
            {user?.name} <span className="grad">👋</span>
          </h1>
          <p style={{ color:'var(--t3)', fontSize:'.8rem', marginTop:4 }}>{user?.email} · Member since {memberSince}</p>
        </div>
        <Link to="/predict" className="btn btn-primary">
          <Activity size={16}/> New Diagnosis <ChevronRight size={14}/>
        </Link>
      </motion.div>

      {/* ── Stats ── */}
      <div className="card-grid-4" style={{ marginBottom:'1.5rem' }}>
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*.07 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      {/* ── Prescriptions ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0, transition:{ delay:.2 } }} className="glass" style={{ padding:'1.75rem', marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.5rem' }}>
          <div className="icon-box" style={{ background:'rgba(16,185,129,.1)', width:38, height:38, borderRadius:11 }}>
            <FileText size={17} style={{ color:'var(--green)' }} />
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:'1rem' }}>Prescriptions</h2>
            <p style={{ fontSize:'.72rem', color:'var(--t3)' }}>{prescriptions.length} uploaded</p>
          </div>
          <Link to="/chat" className="btn btn-ghost btn-sm"><Plus size={13}/> Upload via Chat</Link>
        </div>

        {prescriptions.length === 0 ? (
          <div style={{ textAlign:'center', padding:'2.5rem', border:'1px dashed var(--border)', borderRadius:'var(--r-md)' }}>
            <FileText size={36} style={{ color:'var(--t3)', marginBottom:12, opacity:.4 }} />
            <p style={{ color:'var(--t3)', fontSize:'.88rem' }}>No prescriptions yet</p>
            <Link to="/chat" className="btn btn-ghost btn-sm" style={{ marginTop:12 }}>Upload in MediBot</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {(() => {
              const rxPerPage = 5;
              const displayedRx = prescriptions.slice((rxPage - 1) * rxPerPage, rxPage * rxPerPage);
              return displayedRx.map((p, i) => (
                <motion.div key={p._id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.05 }} className="table-row">
                  <div style={{ width:36, height:36, borderRadius:9, background:'rgba(16,185,129,.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <FileText size={15} style={{ color:'var(--green)' }} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:500, fontSize:'.88rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.originalName}</div>
                    <div style={{ fontSize:'.7rem', color:'var(--t3)' }}>
                      {new Date(p.createdAt).toLocaleDateString('en-IN')} · {p.fileType?.toUpperCase()}
                      {p.note ? ` · ${p.note}` : ''}
                    </div>
                  </div>
                  <a href={`/api/prescriptions/${p._id}/file?token=${localStorage.getItem('token')}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" title="View"><Download size={13}/></a>
                  <button onClick={() => delPrescription(p._id)} className="btn btn-red btn-sm" title="Delete"><Trash2 size={13}/></button>
                </motion.div>
              ));
            })()}
            {(() => {
              const rxPerPage = 5;
              const totalRxPages = Math.ceil(prescriptions.length / rxPerPage);
              if (totalRxPages > 1) {
                return (
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, marginTop:'1rem' }}>
                    <button disabled={rxPage === 1} onClick={() => setRxPage(p => p - 1)} className="btn btn-ghost btn-sm" style={{ opacity: rxPage===1?.4:1 }}>Prev</button>
                    <span style={{ fontSize:'.75rem', color:'var(--t3)' }}>Page {rxPage} of {totalRxPages}</span>
                    <button disabled={rxPage === totalRxPages} onClick={() => setRxPage(p => p + 1)} className="btn btn-ghost btn-sm" style={{ opacity: rxPage===totalRxPages?.4:1 }}>Next</button>
                  </div>
                );
              }
            })()}
          </div>
        )}
      </motion.div>

      {/* ── AI Diagnosis History ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0, transition:{ delay:.24 } }} className="glass" style={{ padding:'1.75rem', marginBottom:'1.25rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.5rem' }}>
          <div className="icon-box" style={{ background:'rgba(13,148,136,.1)', width:38, height:38, borderRadius:11 }}>
            <Activity size={17} style={{ color:'var(--teal)' }} />
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:'1rem' }}>AI Diagnosis History</h2>
            <p style={{ fontSize:'.72rem', color:'var(--t3)' }}>{predictions.length} checks run</p>
          </div>
          <Link to="/predict" className="btn btn-ghost btn-sm"><Plus size={13}/> New Check</Link>
        </div>

        {predictions.length === 0 ? (
          <div style={{ textAlign:'center', padding:'2.5rem', border:'1px dashed var(--border)', borderRadius:'var(--r-md)' }}>
            <Activity size={36} style={{ color:'var(--t3)', marginBottom:12, opacity:.4 }} />
            <p style={{ color:'var(--t3)', fontSize:'.88rem' }}>No diagnosis history yet</p>
            <Link to="/predict" className="btn btn-ghost btn-sm" style={{ marginTop:12 }}>Run AI Diagnosis</Link>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {(() => {
              const predPerPage = 5;
              const displayedPred = predictions.slice((predPage - 1) * predPerPage, predPage * predPerPage);
              return displayedPred.map((p, i) => (
                <motion.div key={p._id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.05 }} className="table-row" style={{ flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:'rgba(13,148,136,.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Activity size={15} style={{ color:'var(--teal)' }} />
                  </div>
                  <div style={{ flex:1, minWidth:200 }}>
                    <div style={{ fontWeight:700, fontSize:'.9rem', color:'var(--teal)' }}>{p.predictedDisease}</div>
                    <div style={{ fontSize:'.72rem', color:'var(--t3)' }}>
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })} · Match Confidence: <strong style={{ color:'var(--teal)' }}>{p.confidence}%</strong>
                    </div>
                    {p.symptoms && p.symptoms.length > 0 && (
                      <div style={{ fontSize:'.72rem', color:'var(--t2)', marginTop:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        Symptoms: {p.symptoms.map(s => s.replace("_", " ")).join(", ")}
                      </div>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    <a href={`/api/predictions/${p._id}/report?token=${localStorage.getItem('token')}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap:5 }} title="Download Report">
                      <Download size={13}/> <span style={{ fontSize:'.72rem' }}>PDF Report</span>
                    </a>
                  </div>
                </motion.div>
              ));
            })()}
            {(() => {
              const predPerPage = 5;
              const totalPredPages = Math.ceil(predictions.length / predPerPage);
              if (totalPredPages > 1) {
                return (
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, marginTop:'1rem' }}>
                    <button disabled={predPage === 1} onClick={() => setPredPage(p => p - 1)} className="btn btn-ghost btn-sm" style={{ opacity: predPage===1?.4:1 }}>Prev</button>
                    <span style={{ fontSize:'.75rem', color:'var(--t3)' }}>Page {predPage} of {totalPredPages}</span>
                    <button disabled={predPage === totalPredPages} onClick={() => setPredPage(p => p + 1)} className="btn btn-ghost btn-sm" style={{ opacity: predPage===totalPredPages?.4:1 }}>Next</button>
                  </div>
                );
              }
            })()}
          </div>
        )}
      </motion.div>

      {/* ── Recent Chat ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0, transition:{ delay:.28 } }} className="glass" style={{ padding:'1.75rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:'1.5rem' }}>
          <div className="icon-box" style={{ background:'var(--purple-dim)', width:38, height:38, borderRadius:11 }}>
            <MessageSquare size={17} style={{ color:'var(--purple)' }} />
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:'1rem' }}>Recent MediBot Conversations</h2>
            <p style={{ fontSize:'.72rem', color:'var(--t3)' }}>Last {Math.min(chatHistory.length, 10)} messages</p>
          </div>
          <Link to="/chat" className="btn btn-ghost btn-sm">Open Chat →</Link>
        </div>

        {chatHistory.length === 0 ? (
          <div style={{ textAlign:'center', padding:'2.5rem', border:'1px dashed var(--border)', borderRadius:'var(--r-md)' }}>
            <MessageSquare size={36} style={{ color:'var(--t3)', marginBottom:12, opacity:.4 }} />
            <p style={{ color:'var(--t3)', fontSize:'.88rem' }}>No conversations yet</p>
            <Link to="/chat" className="btn btn-ghost btn-sm" style={{ marginTop:12 }}>Start chatting</Link>
          </div>
        ) : (
          <div>
            <div className="scroll-y" style={{ display:'flex', flexDirection:'column', gap:6, maxHeight:'none' }}>
              {(() => {
                const reversedHistory = [...chatHistory].reverse();
                const chatPerPage = 5;
                const displayedChat = reversedHistory.slice((chatPage - 1) * chatPerPage, chatPage * chatPerPage);
                return displayedChat.map((m, i) => (
                  <div key={i} className="table-row">
                    <span className={`badge ${m.role==='user'?'badge-teal':'badge-purple'}`} style={{ flexShrink:0 }}>{m.role}</span>
                    <p style={{ flex:1, color:'var(--t2)', fontSize:'.82rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.text}</p>
                    {m.timestamp && <span style={{ fontSize:'.65rem', color:'var(--t3)', flexShrink:0 }}>{new Date(m.timestamp).toLocaleTimeString([],{ hour:'2-digit', minute:'2-digit' })}</span>}
                  </div>
                ));
              })()}
            </div>
            {(() => {
              const chatPerPage = 5;
              const totalChatPages = Math.ceil(chatHistory.length / chatPerPage);
              if (totalChatPages > 1) {
                return (
                  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, marginTop:'1rem' }}>
                    <button disabled={chatPage === 1} onClick={() => setChatPage(p => p - 1)} className="btn btn-ghost btn-sm" style={{ opacity: chatPage===1?.4:1 }}>Prev</button>
                    <span style={{ fontSize:'.75rem', color:'var(--t3)' }}>Page {chatPage} of {totalChatPages}</span>
                    <button disabled={chatPage === totalChatPages} onClick={() => setChatPage(p => p + 1)} className="btn btn-ghost btn-sm" style={{ opacity: chatPage===totalChatPages?.4:1 }}>Next</button>
                  </div>
                );
              }
            })()}
          </div>
        )}
      </motion.div>
    </div>
  );
}
