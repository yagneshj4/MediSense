import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Users, Activity, FileText, MessageSquare,
  TrendingUp, BarChart3, Loader2, ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const fadeUp = { hidden:{ opacity:0, y:18 }, show:{ opacity:1, y:0, transition:{ duration:.45 } } };
const stagger = { hidden:{}, show:{ transition:{ staggerChildren:.07 } } };

export default function AdminDashboard() {
  const { user, isAuth } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  if (!isAuth) return <Navigate to="/auth"/>;
  if (user?.role !== 'admin') return <Navigate to="/dashboard"/>;

  useEffect(() => {
    api.get('/admin/analytics')
      .then(res => {
        if (res.data.success) {
          setData(res.data.analytics);
        } else {
          toast.error('Failed to load metrics');
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to connect to admin API');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:12 }}>
        <Loader2 size={36} style={{ color:'var(--teal)', animation:'_spin .85s linear infinite' }}/>
        <span style={{ color:'var(--t3)', fontSize:'.9rem' }}>Fetching admin metrics…</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <Activity size={40} style={{ color:'var(--t3)', opacity:.35 }}/>
        <p style={{ color:'var(--t3)', fontSize:'.88rem' }}>Could not load system analytics.</p>
      </div>
    );
  }

  const statCards = [
    { icon: Users,         label: 'Total Platform Users', value: data.totalUsers,        color: 'var(--teal)',   sub: 'Registered accounts' },
    { icon: Activity,      label: 'Predictions Executed', value: data.totalPredictions,  color: 'var(--purple)', sub: 'Symptom checks run' },
    { icon: FileText,      label: 'Uploaded Records',     value: data.totalPrescriptions,color: 'var(--green)',  sub: 'Cloud prescription files' },
    { icon: MessageSquare, label: 'Chat Conversations',   value: data.totalChatMessages, color: 'var(--orange)', sub: `Avg: ${data.avgChatMessages} messages/session` },
  ];

  return (
    <div style={{ maxWidth: 1140, margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Header */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} style={{ marginBottom: '2rem' }}>
        <span className="badge badge-purple" style={{ marginBottom: 10, display: 'inline-flex', gap: 6 }}>
          <ShieldCheck size={12}/> Enterprise Operations
        </span>
        <h1 className="h2">Admin <span className="grad">Analytics Console</span></h1>
        <p style={{ color: 'var(--t2)', fontSize: '.88rem', marginTop: 6 }}>
          Real-time system health checks, growth projection charts, and diagnostic distributions.
        </p>
      </motion.div>

      {/* Primary Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '1.5rem', marginBottom: '1.5rem' }} className="admin-grid-top">
        {/* Daily Active Card */}
        <div className="glass" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '2rem', background: 'linear-gradient(135deg,rgba(139,92,246,.05),rgba(0,212,255,.05))', borderColor: 'rgba(0,212,255,.15)' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(0,212,255,.08)', border: '2px dashed var(--teal)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: '2rem', color: 'var(--teal)', lineHeight: 1 }}>{data.dailyActiveUsers}</span>
            <span style={{ fontSize: '.58rem', color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 2 }}>DAU</span>
          </div>
          <div>
            <div style={{ fontSize: '.72rem', color: 'var(--t3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>System Engagement</div>
            <h2 style={{ fontFamily: 'var(--f-display)', fontWeight: 800, fontSize: '1.4rem', lineHeight: 1.2, marginBottom: 8 }}>Unique users active today</h2>
            <p style={{ color: 'var(--t2)', fontSize: '.83rem', lineHeight: 1.7 }}>
              Aggregated daily active user (DAU) count based on diagnoses, file uploads, and bot messages logged in the last 24 hours.
            </p>
          </div>
        </div>

        {/* Live Status monitor */}
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
          <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Service Status</div>
          {[
            { name: 'Node REST API', status: 'Online', color: 'var(--green)' },
            { name: 'Python ML', status: 'Online', color: 'var(--green)' },
            { name: 'MongoDB', status: 'Connected', color: 'var(--green)' }
          ].map(s => (
            <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 9, background: 'rgba(255,255,255,.03)', border: '1px solid var(--border)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.color, boxShadow: `0 0 6px ${s.color}` }}/>
              <span style={{ fontSize: '.78rem', color: 'var(--t2)', flex: 1 }}>{s.name}</span>
              <span style={{ fontSize: '.72rem', color: s.color, fontWeight: 700 }}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="card-grid-4" style={{ marginBottom: '2rem' }}>
        {statCards.map((c, i) => (
          <motion.div key={i} variants={fadeUp} className="glass" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at 100% 0%,${c.color}10,transparent 65%)`, pointerEvents: 'none' }}/>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${c.color}12`, border: `1px solid ${c.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <c.icon size={16} style={{ color: c.color }}/>
              </div>
              <span style={{ fontSize: '.76rem', color: 'var(--t3)', fontWeight: 600 }}>{c.label}</span>
            </div>
            <div style={{ fontFamily: 'var(--f-display)', fontSize: '2.1rem', fontWeight: 800, color: c.color, lineHeight: 1, marginBottom: 6 }}>{c.value}</div>
            <div style={{ fontSize: '.72rem', color: 'var(--t4)' }}>{c.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.5rem' }} className="admin-grid-bottom">
        {/* Left: Disease Distribution */}
        <div className="glass" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
            <BarChart3 size={18} style={{ color: 'var(--teal)' }}/>
            <h2 style={{ fontFamily: 'var(--f-display)', fontSize: '1.1rem', fontWeight: 700 }}>Disease Prediction Distribution</h2>
          </div>
          {data.diseaseDistribution?.length === 0 ? (
            <p style={{ color: 'var(--t3)', fontSize: '.88rem', textAlign: 'center', padding: '2rem' }}>No prediction history collected.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.diseaseDistribution.slice(0, 8).map((d, idx) => {
                const total = data.totalPredictions || 1;
                const percent = Math.round((d.count / total) * 100);
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600 }}>{d.disease}</span>
                      <span style={{ color: 'var(--t3)' }}>{d.count} ({percent}%)</span>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div className="progress-fill" style={{ width: `${percent}%`, background: 'var(--teal)' }}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Storage & User Growth */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* User growth list */}
          <div className="glass" style={{ padding: '1.5rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
              <TrendingUp size={16} style={{ color: 'var(--purple)' }}/>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: '.92rem', fontWeight: 700 }}>User Growth Metrics</span>
            </div>
            {data.monthlyGrowth?.length === 0 ? (
              <p style={{ color: 'var(--t3)', fontSize: '.78rem', textAlign: 'center' }}>No growth metrics available.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.monthlyGrowth.slice(-6).map((g, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,.02)', border: '1px solid var(--border)', fontSize: '.8rem' }}>
                    <span style={{ color: 'var(--t2)' }}>{g.month}</span>
                    <strong style={{ color: 'var(--purple)' }}>+{g.count} users</strong>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload stats */}
          <div className="glass" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
              <FileText size={16} style={{ color: 'var(--green)' }}/>
              <span style={{ fontFamily: 'var(--f-display)', fontSize: '.92rem', fontWeight: 700 }}>Prescription File Stats</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {data.prescriptionStats?.length === 0 ? (
                <span style={{ color: 'var(--t3)', fontSize: '.78rem' }}>No files uploaded yet.</span>
              ) : (
                data.prescriptionStats.map((p, idx) => (
                  <div key={idx} style={{ padding: '6px 12px', borderRadius: 9, background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '.75rem', color: 'var(--t2)', fontWeight: 600 }}>{p.fileType}</span>
                    <span style={{ padding: '1px 6px', borderRadius: 99, background: 'var(--green)', color: '#03070e', fontSize: '.68rem', fontWeight: 800 }}>{p.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width: 800px) {
          .admin-grid-top { grid-template-columns: 1fr !important; }
          .admin-grid-bottom { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
