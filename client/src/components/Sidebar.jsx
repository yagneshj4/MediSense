import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Brain, MessageSquare, LayoutDashboard,
  LogOut, Stethoscope, Menu, X,
} from 'lucide-react';

const nav = [
  { to:'/',         icon: Activity,       label:'Home'      },
  { to:'/predict',  icon: Brain,          label:'Diagnose'  },
  { to:'/chat',     icon: MessageSquare,  label:'MediBot'   },
  { to:'/dashboard',icon: LayoutDashboard,label:'Dashboard' },
];

export default function Navbar() {
  const { user, logout, isAuth } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 200,
        background: 'rgba(6,11,23,.97)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 20px',
          height: 60,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>

          {/* ── Logo ── */}
          <NavLink to="/" style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Stethoscope size={17} color="#060b17" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily:'var(--f-display)', fontWeight:800, fontSize:'.92rem', letterSpacing:'-.01em', color:'var(--t1)', lineHeight:1.1 }}>Medi-Assist</div>
              <div style={{ fontSize:'.6rem', color:'var(--t3)', lineHeight:1 }}>AI Healthcare Platform</div>
            </div>
          </NavLink>

          {/* ── Desktop Nav ── */}
          <nav style={{ display:'flex', alignItems:'center', gap:2, marginLeft:24, flex:1 }} className="desktop-nav">
            {nav.map(item => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} end={item.to === '/'}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '7px 13px', borderRadius: 10,
                    color: isActive ? 'var(--teal)' : 'var(--t3)',
                    background: isActive ? 'var(--teal-dim)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(0,212,255,.18)' : 'transparent'}`,
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '.85rem', whiteSpace: 'nowrap',
                    transition: 'var(--t)',
                  })}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.05)'; e.currentTarget.style.color = 'var(--t1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = ''; }}
                >
                  <Icon size={15} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* ── Right: User / Sign In ── */}
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            {isAuth ? (
              <div style={{ display:'flex', alignItems:'center', gap:9, padding:'6px 10px', borderRadius:'var(--r-md)', background:'rgba(255,255,255,.03)', border:'1px solid var(--border)' }}>
                <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'.72rem', fontWeight:700, color:'#060b17' }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ minWidth:0 }} className="user-name">
                  <div style={{ fontSize:'.78rem', fontWeight:600, color:'var(--t1)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:100 }}>{user?.name}</div>
                </div>
                <button onClick={() => { logout(); navigate('/'); }} title="Logout"
                  style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.18)', borderRadius:7, padding:'5px', color:'var(--red)', display:'flex', flexShrink:0, transition:'var(--t)' }}
                  onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,.2)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,.1)'}
                >
                  <LogOut size={13}/>
                </button>
              </div>
            ) : (
              <NavLink to="/auth" style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:10, background:'linear-gradient(135deg,var(--teal),var(--purple))', color:'#060b17', fontWeight:700, fontSize:'.82rem', whiteSpace:'nowrap' }}>
                Sign In / Register
              </NavLink>
            )}

            {/* Mobile menu toggle */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(v => !v)}
              style={{ background:'rgba(255,255,255,.05)', border:'1px solid var(--border)', borderRadius:8, padding:'7px', color:'var(--t2)', display:'none', alignItems:'center', transition:'var(--t)' }}
            >
              {mobileOpen ? <X size={16}/> : <Menu size={16}/>}
            </button>
          </div>
        </div>

        {/* ── Mobile Nav dropdown ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
              transition={{ duration:.2 }}
              style={{ overflow:'hidden', borderTop:'1px solid var(--border)' }}
            >
              <nav style={{ padding:'8px 16px 12px', display:'flex', flexDirection:'column', gap:2 }}>
                {nav.map(item => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.to} to={item.to} end={item.to === '/'}
                      onClick={() => setMobileOpen(false)}
                      style={({ isActive }) => ({
                        display:'flex', alignItems:'center', gap:10,
                        padding:'10px 12px', borderRadius:10,
                        color: isActive ? 'var(--teal)' : 'var(--t2)',
                        background: isActive ? 'var(--teal-dim)' : 'transparent',
                        fontWeight: isActive ? 600 : 400,
                        fontSize:'.88rem',
                      })}
                    >
                      <Icon size={16}/>
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
