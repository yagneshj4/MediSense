import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  FileText, Trash2, Download,
  Shield, Paperclip, Search, Loader2, Plus
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Vault() {
  const { user, isAuth } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rxPage, setRxPage] = useState(1);

  // Upload states
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCategory, setUploadCategory] = useState('Prescription');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isAuth) return <Navigate to="/auth"/>;

  useEffect(() => {
    api.get('/prescriptions')
      .then(r => setPrescriptions(r.data.prescriptions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const delPrescription = async id => {
    try {
      await api.delete(`/prescriptions/${id}`);
      setPrescriptions(p => p.filter(x => x._id !== id));
      toast.success('Document deleted successfully');
    } catch {
      toast.error('Failed to delete document');
    }
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

  const PER = 6;

  if (loading) return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'2rem 0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:'2rem' }}>
        <div className="skeleton" style={{ width:48, height:48, borderRadius:'50%' }}/>
        <div>
          <div className="skeleton" style={{ width:150, height:16, borderRadius:6, marginBottom:8 }}/>
          <div className="skeleton" style={{ width:300, height:12, borderRadius:6 }}/>
        </div>
      </div>
      <div className="skeleton" style={{ height:140, borderRadius:20, marginBottom:'2rem' }}/>
      <div className="skeleton" style={{ height:250, borderRadius:20 }}/>
    </div>
  );

  return (
    <div style={{ maxWidth:900, margin:'0 auto', padding:'1rem 0' }}>
      {/* ── Page Header ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass"
        style={{ padding:'1.75rem 2rem', marginBottom:'2rem', display:'flex', alignItems:'center', gap:'1.5rem', flexWrap:'wrap', background:'linear-gradient(135deg,rgba(16,185,129,0.04),rgba(13,148,136,0.04))', borderColor:'rgba(16,185,129,0.1)' }}>
        <div style={{ width:54, height:54, borderRadius:16, background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', color:'#ffffff', flexShrink:0, boxShadow:'0 4px 16px rgba(16,185,129,0.2)' }}>
          <Shield size={24} />
        </div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontFamily:'var(--f-display)', fontSize:'1.6rem', fontWeight:800, lineHeight:1.1, marginBottom:4 }}>
            Medical Records Vault
          </h1>
          <p style={{ color:'var(--t3)', fontSize:'.85rem' }}>
            Securely store, organize, and manage your prescriptions, lab reports, scans, and insurance details.
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span className="badge badge-teal" style={{ textTransform:'none', padding:'6px 12px', fontSize:'.72rem', fontWeight:700 }}>
            {prescriptions.length} Total Records
          </span>
        </div>
      </motion.div>

      {/* ── Upload Panel ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass" style={{ padding:'1.75rem', marginBottom:'1.5rem' }}>
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <span style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--t1)', display: 'block', marginBottom: 2 }}>Upload Document or Photo</span>
              <span style={{ fontSize: '.72rem', color: 'var(--t3)' }}>Supported formats: PDF, JPG, PNG, WEBP (Max 8MB)</span>
            </div>
            <div>
              <input 
                id="page-vault-file-input"
                type="file" 
                accept=".png,.jpg,.jpeg,.webp,.pdf" 
                style={{ display: 'none' }} 
                onChange={(e) => setUploadFile(e.target.files[0] || null)}
              />
              <button 
                type="button"
                onClick={() => document.getElementById('page-vault-file-input').click()} 
                className="btn btn-ghost btn-sm" 
                style={{ height: 38, borderColor: uploadFile ? 'var(--teal)' : 'var(--border)', color: uploadFile ? 'var(--teal)' : 'var(--t2)', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Paperclip size={14}/>
                {uploadFile ? 'Change Selected File' : 'Select Document'}
              </button>
            </div>
          </div>

          {uploadFile && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '16px', background: 'var(--hover-bg)', borderRadius: 12, border: '1px solid rgba(16, 185, 129, 0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '.82rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--teal)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                  📎 {uploadFile.name} ({(uploadFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
                <button type="button" onClick={() => setUploadFile(null)} style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '.75rem', fontWeight: 700 }}>Remove</button>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
                  <label className="label">Category</label>
                  <select 
                    value={uploadCategory} 
                    onChange={(e) => setUploadCategory(e.target.value)}
                    style={{
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border)',
                      borderRadius: 8,
                      padding: '8px 12px',
                      fontSize: '.85rem',
                      color: 'var(--t1)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {["Prescription", "Lab Report", "Scan", "Medical Image", "Insurance", "Other"].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 220 }}>
                  <label className="label">Description / Note</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Blood report, Chest X-ray..." 
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    className="inp"
                    style={{ padding: '8px 12px', fontSize: '.85rem' }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={uploading} 
                  className="btn btn-primary"
                  style={{
                    alignSelf: 'flex-end',
                    padding: '9px 20px',
                    fontWeight: 700,
                    height: '38px',
                    fontSize: '.82rem'
                  }}
                >
                  {uploading ? <Loader2 size={14} className="spin"/> : <Plus size={14}/>}
                  {uploading ? 'Saving...' : 'Save to Vault'}
                </button>
              </div>
            </div>
          )}
        </form>
      </motion.div>

      {/* ── Search and Vault Table ── */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} className="glass" style={{ padding:'1.75rem' }}>
        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg-3)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: '1.25rem'
        }}>
          <Search size={16} style={{ color: 'var(--t3)' }}/>
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
              fontSize: '.88rem'
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--t3)', cursor: 'pointer', fontSize: '.8rem', fontWeight: 600 }}>Clear</button>
          )}
        </div>

        {filteredPrescriptions.length === 0 ? (
          <div className="empty-state" style={{ padding: '4rem 2rem' }}>
            <FileText size={48} style={{ color:'var(--t3)', opacity:.35 }} />
            <p style={{ color:'var(--t3)', fontSize:'.92rem', fontWeight: 600 }}>
              {prescriptions.length === 0 ? 'No documents in your vault yet.' : 'No matching records found.'}
            </p>
            {prescriptions.length === 0 && (
              <span style={{ fontSize: '.8rem', color: 'var(--t4)' }}>Select a file above to save your first Personal Health Record.</span>
            )}
          </div>
        ) : (
          <>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {filteredPrescriptions.slice((rxPage-1)*PER, rxPage*PER).map((p, i) => {
                const badge = getCategoryColor(p.category || 'Other');
                return (
                  <motion.div key={p._id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*.04 }} className="table-row">
                    <div style={{ width:38, height:38, borderRadius:10, background:badge.bg, border:`1px solid ${badge.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <FileText size={16} style={{ color:badge.text }}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span 
                          onClick={() => handleSecureDownload(`/prescriptions/${p._id}/file`, p.originalName)}
                          style={{ fontWeight:600, fontSize:'.9rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', color: 'var(--teal)', cursor: 'pointer', textDecoration: 'underline' }}
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
                      <div style={{ fontSize:'.72rem', color:'var(--t3)', marginTop: 3 }}>
                        Uploaded: {formatDate(p.createdAt)} · {p.fileType?.toUpperCase()}
                        {(p.description || p.note) ? ` · ${p.description || p.note}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleSecureDownload(`/prescriptions/${p._id}/file`, p.originalName)} className="btn btn-ghost btn-sm btn-icon" title="Download Record"><Download size={14}/></button>
                      <button onClick={() => delPrescription(p._id)} className="btn btn-red btn-sm btn-icon" title="Delete Record"><Trash2 size={14}/></button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {Math.ceil(filteredPrescriptions.length/PER) > 1 && (
              <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:10, marginTop:'1.5rem' }}>
                <button disabled={rxPage===1} onClick={()=>setRxPage(p=>p-1)} className="btn btn-ghost btn-sm" style={{ opacity:rxPage===1?.38:1 }}>← Prev</button>
                <span style={{ fontSize:'.78rem', color:'var(--t3)' }}>Page {rxPage} of {Math.ceil(filteredPrescriptions.length/PER)}</span>
                <button disabled={rxPage===Math.ceil(filteredPrescriptions.length/PER)} onClick={()=>setRxPage(p=>p+1)} className="btn btn-ghost btn-sm" style={{ opacity:rxPage===Math.ceil(filteredPrescriptions.length/PER)?.38:1 }}>Next →</button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
