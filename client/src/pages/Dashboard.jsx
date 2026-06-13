import { useState, useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Activity, MessageSquare, FileText, Trash2,
  Download, Calendar, Plus, ChevronRight,
  TrendingUp, Brain, Heart, Clock, Zap,
  ArrowUpRight, Shield, Paperclip, Search,
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

  // Medical Records Vault states
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('Prescription');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { hash } = useLocation();

  useEffect(() => {
    if (hash === '#vault' && !loading) {
      setTimeout(() => {
        const el = document.getElementById('vault');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [hash, loading]);

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

  const handleSecureDownload = async (endpoint, filename) => {
    try {
      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[Download Error]", err);
      toast.error('Failed to download file.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Please select a file to upload.');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', uploadFile);
      fd.append('category', uploadCategory);
      fd.append('description', uploadDescription);

      const res = await api.post('/prescriptions/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Document saved to Medical Records Vault!');
        setPrescriptions(prev => [res.data.prescription, ...prev]);
        setUploadFile(null);
        setUploadDescription('');
        setUploadCategory('Prescription');
      } else {
        toast.error('Upload failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload file. Supports PDF/JPG/PNG/WEBP under 8MB.');
    } finally {
      setUploading(false);
    }
  };

  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'Prescription':   return { bg: 'rgba(16,185,129,.12)', text: 'var(--green)', border: 'rgba(16,185,129,.25)' };
      case 'Lab Report':     return { bg: 'rgba(139,92,246,.12)', text: 'var(--purple)', border: 'rgba(139,92,246,.25)' };
      case 'Scan':           return { bg: 'rgba(59,130,246,.12)', text: 'var(--blue)', border: 'rgba(59,130,246,.25)' };
      case 'Medical Image':  return { bg: 'rgba(20,184,166,.12)', text: 'var(--teal)', border: 'rgba(20,184,166,.25)' };
      case 'Insurance':      return { bg: 'rgba(245,158,11,.12)', text: 'var(--orange)', border: 'rgba(245,158,11,.25)' };
      default:               return { bg: 'rgba(255,255,255,.06)', text: 'var(--t3)', border: 'var(--border)' };
    }
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return dateStr;
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      p.originalName?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.note?.toLowerCase().includes(query)
    );
  });

  const memberSince = new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', { month:'short', year:'numeric' });
  const daysSince   = Math.max(1, Math.floor((Date.now() - new Date(user?.createdAt || Date.now())) / 86400000));
  const userMsgs    = chatHistory.filter(m => m.role === 'user').length;

  const stats = [
    { icon:Activity,       label:'Diagnoses Run',    value:predictions.length,   color:'var(--teal)',   sub:'Symptom checks',    trend:predictions.length > 0 ? '+'+predictions.length : null },
    { icon:MessageSquare,  label:'Chat Messages',    value:userMsgs,             color:'var(--purple)', sub:'With MediBot',      trend:userMsgs > 0 ? '+'+userMsgs : null },
    { icon:Shield,         label:'Medical Vault',    value:prescriptions.length, color:'var(--green)',  sub:'Personal Health Records', trend:null },
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
                    <button onClick={() => handleSecureDownload(`/predictions/${p._id}/report`, `Medi_Assist_Report_${p._id}.pdf`)} className="btn btn-ghost btn-sm" title="Download PDF Report" style={{ gap:5 }}>
                      <Download size={12}/><span style={{ fontSize:'.72rem' }}>PDF</span>
                    </button>
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

      {/* ── Medical Records Vault ── */}
      <motion.div id="vault" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0, transition:{ delay:.35 } }} className="glass" style={{ padding:'1.75rem', marginBottom:'1.25rem' }}>
        <SectionHeader icon={Shield} title="Medical Records Vault" sub={`${filteredPrescriptions.length} of ${prescriptions.length} records shown`} color="var(--green)"/>
        
        {/* Upload Form */}
        <form onSubmit={handleUpload} style={{
          background: 'rgba(255, 255, 255, 0.01)',
          border: '1px dashed rgba(16, 185, 129, 0.22)',
          borderRadius: 12,
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <span style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--t1)', display: 'block', marginBottom: 2 }}>Upload Document or Photo</span>
              <span style={{ fontSize: '.7rem', color: 'var(--t3)' }}>Supported formats: PDF, JPG, PNG, WEBP (Max 8MB)</span>
            </div>
            <div>
              <input 
                id="vault-file-input"
                type="file" 
                accept=".png,.jpg,.jpeg,.webp,.pdf" 
                style={{ display: 'none' }} 
                onChange={(e) => setUploadFile(e.target.files[0] || null)}
              />
              <button 
                type="button"
                onClick={() => document.getElementById('vault-file-input').click()} 
                className="btn btn-ghost btn-sm" 
                style={{ borderColor: uploadFile ? 'var(--green)' : 'var(--border)', color: uploadFile ? 'var(--green)' : 'var(--t2)', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Paperclip size={13}/>
                {uploadFile ? 'Change Selected File' : 'Select Document'}
              </button>
            </div>
          </div>

          {uploadFile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px', background: 'rgba(16, 185, 129, 0.04)', borderRadius: 10, border: '1px solid rgba(16, 185, 129, 0.12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '.78rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                  📎 {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
                <button type="button" onClick={() => setUploadFile(null)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '.72rem', fontWeight: 600 }}>Remove</button>
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
                  <label style={{ fontSize: '.65rem', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>Category</label>
                  <select 
                    value={uploadCategory} 
                    onChange={(e) => setUploadCategory(e.target.value)}
                    style={{
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '7px 10px',
                      fontSize: '.82rem',
                      color: 'var(--t1)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {["Prescription", "Lab Report", "Scan", "Medical Image", "Insurance", "Other"].map(cat => (
                      <option key={cat} value={cat} style={{ background: 'var(--bg-2)' }}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 200 }}>
                  <label style={{ fontSize: '.65rem', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>Description / Note</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Blood report, Chest X-ray..." 
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    style={{
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '7px 10px',
                      fontSize: '.82rem',
                      color: 'var(--t1)',
                      outline: 'none'
                    }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={uploading} 
                  className="btn btn-primary btn-sm"
                  style={{
                    background: 'var(--green)',
                    color: '#03070e',
                    border: 'none',
                    alignSelf: 'flex-end',
                    padding: '8px 16px',
                    fontWeight: 600,
                    height: '34px'
                  }}
                >
                  {uploading ? 'Saving...' : 'Save to Vault'}
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '8px 12px',
          marginBottom: '1rem'
        }}>
          <Search size={14} style={{ color: 'var(--t3)' }}/>
          <input 
            type="text" 
            placeholder="Search vault by file name, category, or description..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              color: 'var(--t1)',
              fontSize: '.84rem'
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: '.75rem' }}>Clear</button>
          )}
        </div>

        {filteredPrescriptions.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} style={{ color:'var(--t3)', opacity:.35 }}/>
            <p style={{ color:'var(--t3)', fontSize:'.88rem' }}>
              {prescriptions.length === 0 ? 'No documents in your vault yet.' : 'No matching records found.'}
            </p>
            {prescriptions.length === 0 && (
              <span style={{ fontSize: '.75rem', color: 'var(--t4)' }}>Select a file above to save your first Personal Health Record.</span>
            )}
          </div>
        ) : (
          <>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {filteredPrescriptions.slice((rxPage-1)*PER, rxPage*PER).map((p, i) => {
                const badge = getCategoryColor(p.category || 'Other');
                return (
                  <motion.div key={p._id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.04 }} className="table-row">
                    <div style={{ width:36, height:36, borderRadius:10, background:badge.bg, border:`1px solid ${badge.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <FileText size={15} style={{ color:badge.text }}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span 
                          onClick={() => handleSecureDownload(`/prescriptions/${p._id}/file`, p.originalName)}
                          style={{ fontWeight:500, fontSize:'.88rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: 'var(--teal)', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          {p.originalName}
                        </span>
                        <span style={{
                          fontSize: '.62rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 6,
                          background: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                          textTransform: 'uppercase',
                          letterSpacing: '.03em'
                        }}>
                          {p.category || 'Other'}
                        </span>
                      </div>
                      <div style={{ fontSize:'.7rem', color:'var(--t3)', marginTop: 2 }}>
                        Uploaded: {formatDate(p.createdAt)} · {p.fileType?.toUpperCase()}
                        {(p.description || p.note) ? ` · ${p.description || p.note}` : ''}
                      </div>
                    </div>
                    <button onClick={() => handleSecureDownload(`/prescriptions/${p._id}/file`, p.originalName)} className="btn btn-ghost btn-sm" title="Download Record"><Download size={13}/></button>
                    <button onClick={() => delPrescription(p._id)} className="btn btn-red btn-sm" title="Delete Record"><Trash2 size={13}/></button>
                  </motion.div>
                );
              })}
            </div>
            {Math.ceil(filteredPrescriptions.length/PER) > 1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, marginTop:'1rem' }}>
                <button disabled={rxPage===1} onClick={()=>setRxPage(p=>p-1)} className="btn btn-ghost btn-sm" style={{ opacity:rxPage===1?.38:1 }}>← Prev</button>
                <span style={{ fontSize:'.75rem', color:'var(--t3)' }}>Page {rxPage} of {Math.ceil(filteredPrescriptions.length/PER)}</span>
                <button disabled={rxPage===Math.ceil(filteredPrescriptions.length/PER)} onClick={()=>setRxPage(p=>p+1)} className="btn btn-ghost btn-sm" style={{ opacity:rxPage===Math.ceil(filteredPrescriptions.length/PER)?.38:1 }}>Next →</button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
