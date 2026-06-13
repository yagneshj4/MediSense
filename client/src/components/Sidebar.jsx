import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Brain, MessageSquare, LayoutDashboard,
  LogOut, Stethoscope, Menu, X, User, Shield,
} from 'lucide-react';

const nav = [
  { to:'/',          icon: Activity,        label:'Home'      },
  { to:'/predict',   icon: Brain,           label:'Diagnose'  },
  { to:'/chat',      icon: MessageSquare,   label:'MediBot'   },
  { to:'/dashboard', icon: LayoutDashboard, label:'Dashboard' },
];

export default function Navbar() {
  const { user, logout, isAuth } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeNav = [...nav];
  if (isAuth && user?.role === 'admin') {
    activeNav.push({ to: '/admin', icon: Shield, label: 'Admin' });
  }

  return (
    <>
      <header style={{
        position:'sticky', top:0, zIndex:200,
        background:'rgba(5,10,22,0.88)',
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        backdropFilter:'blur(40px)',
        WebkitBackdropFilter:'blur(40px)',
      }}>
        {/* Accent top line */}
        <div style={{ height:2, background:'linear-gradient(90deg,transparent,var(--teal),var(--purple),transparent)', opacity:.7 }} />

        <div style={{
          maxWidth:1280, margin:'0 auto',
          padding:'0 24px',
          height:58,
          display:'flex', alignItems:'center', gap:8,
        }}>

          {/* ── Logo ── */}
          <NavLink to="/" style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0, marginRight:8 }}>
            <div style={{
              width:36, height:36, borderRadius:11,
              background:'linear-gradient(135deg,var(--teal),var(--purple))',
              display:'flex', alignItems:'center', justifyContent:'center',
              boxShadow:'0 0 20px rgba(0,212,255,0.3)',
            }}>
              <Stethoscope size={18} color="#04090f" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontFamily:'var(--f-display)', fontWeight:800, fontSize:'.95rem', letterSpacing:'-.015em', color:'var(--t1)', lineHeight:1.1 }}>Medi-Assist</div>
              <div style={{ fontSize:'.58rem', color:'var(--t3)', lineHeight:1, letterSpacing:'.05em', textTransform:'uppercase' }}>AI Healthcare</div>
            </div>
          </NavLink>

          {/* ── Desktop Nav ── */}
          <nav style={{ display:'flex', alignItems:'center', gap:3, flex:1 }} className="desktop-nav">
            {activeNav.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to} end={to === '/'}
                style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap:6,
                  padding:'7px 14px', borderRadius:10,
                  color: isActive ? 'var(--teal)' : 'var(--t3)',
                  background: isActive ? 'rgba(0,212,255,0.1)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(0,212,255,0.2)' : 'transparent'}`,
                  fontWeight: isActive ? 600 : 400,
                  fontSize:'.84rem',
                  whiteSpace:'nowrap',
                  transition:'all 0.18s ease',
                  textDecoration:'none',
                  position:'relative',
                })}
                onMouseEnter={e => {
                  if (!e.currentTarget.style.background.includes('0.1')) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'var(--t1)';
                  }
                }}
                onMouseLeave={e => {
                  if (!e.currentTarget.style.background.includes('0.1')) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--t3)';
                  }
                }}
              >
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* ── Right: User / Sign In ── */}
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            {isAuth ? (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{
                  display:'flex', alignItems:'center', gap:9,
                  padding:'5px 5px 5px 10px',
                  borderRadius:99,
                  background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{
                    width:28, height:28, borderRadius:'50%',
                    background:'linear-gradient(135deg,var(--teal),var(--purple))',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    flexShrink:0, fontSize:'.72rem', fontWeight:700, color:'#04090f',
                  }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div style={{ minWidth:0 }} className="user-name">
                    <div style={{
                      fontSize:'.78rem', fontWeight:600, color:'var(--t1)',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:100,
                    }}>{user?.name}</div>
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    title="Sign out"
                    style={{
                      background:'rgba(239,68,68,0.1)',
                      border:'1px solid rgba(239,68,68,0.15)',
                      borderRadius:99, padding:'6px 10px',
                      color:'var(--red)', display:'flex', alignItems:'center', gap:5,
                      flexShrink:0, transition:'var(--t)', fontSize:'.72rem', fontWeight:600,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
                  >
                    <LogOut size={12}/> <span style={{ lineHeight:1 }}>Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <NavLink to="/auth" style={{
                display:'flex', alignItems:'center', gap:7,
                padding:'8px 18px', borderRadius:99,
                background:'linear-gradient(135deg,var(--teal),var(--purple))',
                color:'#04090f', fontWeight:700, fontSize:'.82rem',
                whiteSpace:'nowrap',
                boxShadow:'0 4px 16px rgba(0,212,255,0.25)',
                transition:'var(--t)',
              }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform='none'}
              >
                <User size={13}/>
                Sign In
              </NavLink>
            )}

            {/* Mobile toggle */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(v => !v)}
              style={{
                background:'rgba(255,255,255,0.05)',
                border:'1px solid var(--border)',
                borderRadius:9, padding:'7px 8px',
                color:'var(--t2)', display:'none',
                alignItems:'center', transition:'var(--t)',
              }}
            >
              {mobileOpen ? <X size={16}/> : <Menu size={16}/>}
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height:0, opacity:0 }}
              animate={{ height:'auto', opacity:1 }}
              exit={{ height:0, opacity:0 }}
              transition={{ duration:.18 }}
              style={{ overflow:'hidden', borderTop:'1px solid var(--border)' }}
            >
              <nav style={{ padding:'10px 16px 14px', display:'flex', flexDirection:'column', gap:3 }}>
                {activeNav.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to} end={to === '/'}
                    onClick={() => setMobileOpen(false)}
                    style={({ isActive }) => ({
                      display:'flex', alignItems:'center', gap:10,
                      padding:'11px 14px', borderRadius:10,
                      color: isActive ? 'var(--teal)' : 'var(--t2)',
                      background: isActive ? 'rgba(0,212,255,0.08)' : 'transparent',
                      fontWeight: isActive ? 600 : 400,
                      fontSize:'.88rem',
                    })}
                  >
                    <Icon size={16}/> {label}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
