import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Brain, MessageSquare, LayoutDashboard,
  Info, Mail, Code2, BookOpen, LogOut, ChevronLeft,
  ChevronRight, Stethoscope,
} from 'lucide-react';

const nav = [
  { to:'/',         icon: Activity,       label:'Home'      },
  { to:'/predict',  icon: Brain,          label:'Diagnose'  },
  { to:'/chat',     icon: MessageSquare,  label:'MediBot'   },
  { to:'/dashboard',icon: LayoutDashboard,label:'Dashboard' },
  null, // divider
  { to:'/about',    icon: Info,           label:'About'     },
  { to:'/blog',     icon: BookOpen,       label:'Blog'      },
  { to:'/contact',  icon: Mail,           label:'Contact'   },
  { to:'/developer',icon: Code2,          label:'Developer' },
];

export default function Sidebar() {
  const { user, logout, isAuth } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  return (
    <motion.aside
      animate={{ width: open ? 230 : 64 }}
      transition={{ duration: .28, ease: [.4,0,.2,1] }}
      style={{
        height:'100vh', background:'rgba(6,11,23,.97)',
        borderRight:'1px solid var(--border)',
        backdropFilter:'blur(30px)', position:'sticky', top:0, zIndex:200,
        display:'flex', flexDirection:'column', flexShrink:0, overflow:'hidden',
        alignSelf:'flex-start',
      }}
    >
      {/* ── Logo ── */}
      <div style={{ padding:'18px 12px 14px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:11, background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Stethoscope size={18} color="#060b17" strokeWidth={2.5} />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-10 }} transition={{ duration:.18 }} style={{ overflow:'hidden', whiteSpace:'nowrap' }}>
              <div style={{ fontFamily:'var(--f-display)', fontWeight:800, fontSize:'.95rem', letterSpacing:'-.01em', color:'var(--t1)' }}>Medi-Assist</div>
              <div style={{ fontSize:'.65rem', color:'var(--t3)', marginTop:1 }}>AI Healthcare Platform</div>
            </motion.div>
          )}
        </AnimatePresence>
        <button onClick={() => setOpen(!open)} style={{ marginLeft:'auto', background:'rgba(255,255,255,.05)', border:'1px solid var(--border)', borderRadius:8, padding:'5px', color:'var(--t3)', display:'flex', flexShrink:0, transition:'var(--t)' }}
          onMouseEnter={e=>e.currentTarget.style.color='var(--t1)'}
          onMouseLeave={e=>e.currentTarget.style.color='var(--t3)'}
        >
          {open ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav style={{ flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:2, overflowY:'auto' }}>
        {nav.map((item, i) => {
          if (!item) return <div key={i} style={{ height:1, background:'var(--border)', margin:'6px 4px' }} />;
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} end={item.to=='/'}
              style={({ isActive }) => ({
                display:'flex', alignItems:'center', gap:11,
                padding:'9px 11px', borderRadius:'10px',
                color: isActive ? 'var(--teal)' : 'var(--t3)',
                background: isActive ? 'var(--teal-dim)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(0,212,255,.18)' : 'transparent'}`,
                fontWeight: isActive ? 600 : 400,
                fontSize:'.85rem', whiteSpace:'nowrap', overflow:'hidden',
                transition:'var(--t)',
              })}
              onMouseEnter={e => { if(!e.currentTarget.dataset.active){ e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.color='var(--t1)'; }}}
              onMouseLeave={e => { if(!e.currentTarget.dataset.active){ e.currentTarget.style.background=''; e.currentTarget.style.color=''; }}}
            >
              <Icon size={17} style={{ flexShrink:0 }} />
              <AnimatePresence>
                {open && (
                  <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:.14 }} style={{ overflow:'hidden', textOverflow:'ellipsis' }}>
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* ── User ── */}
      <div style={{ padding:'10px 8px', borderTop:'1px solid var(--border)' }}>
        {isAuth ? (
          <div style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 10px', borderRadius:var_r_md(), background:'rgba(255,255,255,.03)', border:'1px solid var(--border)' }}>
            <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'.75rem', fontWeight:700, color:'#060b17' }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <AnimatePresence>
              {open && (
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ flex:1, minWidth:0, overflow:'hidden' }}>
                  <div style={{ fontSize:'.8rem', fontWeight:600, color:'var(--t1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
                  <div style={{ fontSize:'.68rem', color:'var(--t3)', overflow:'hidden', textOverflow:'ellipsis' }}>{user?.email}</div>
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => { logout(); navigate('/'); }} title="Logout"
              style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.18)', borderRadius:7, padding:'6px', color:'var(--red)', display:'flex', flexShrink:0, transition:'var(--t)' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,.2)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,.1)'}
            >
              <LogOut size={13}/>
            </button>
          </div>
        ) : (
          <NavLink to="/auth" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'9px 12px', borderRadius:'10px', background:'linear-gradient(135deg,var(--teal),var(--purple))', color:'#060b17', fontWeight:700, fontSize:'.82rem', whiteSpace:'nowrap', overflow:'hidden' }}>
            {open ? 'Sign In / Register' : '→'}
          </NavLink>
        )}
      </div>
    </motion.aside>
  );
}
