import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Stethoscope, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const perks = [
  'AI-powered disease prediction',
  'Multilingual MediBot (EN/HI/BN)',
  'Prescription storage & tracking',
  'Personalized care plans',
];

export default function Auth() {
  const [mode, setMode]       = useState('login');
  const [form, setForm]       = useState({ name:'', email:'', password:'' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register }   = useAuth();
  const navigate              = useNavigate();

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Welcome back! 👋');
      } else {
        if (!form.name.trim()) { toast.error('Name is required'); return; }
        await register(form.name, form.email, form.password);
        toast.success('Account created! Welcome 🎉');
      }
      navigate('/predict');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', overflow:'hidden', position:'relative' }}>
      {/* ── Left panel — branding ── */}
      <div style={{ background:'linear-gradient(160deg,rgba(0,212,255,.06),rgba(139,92,246,.08))', borderRight:'1px solid var(--border)', padding:'3rem', display:'flex', flexDirection:'column', justifyContent:'space-between', position:'relative', overflow:'hidden' }}>
        <div className="orb" style={{ width:400, height:400, top:'-15%', left:'-15%', background:'radial-gradient(circle,rgba(0,212,255,.08),transparent 65%)' }} />
        <div className="orb" style={{ width:350, height:350, bottom:'-15%', right:'-10%', background:'radial-gradient(circle,rgba(139,92,246,.09),transparent 65%)' }} />

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, position:'relative', zIndex:1 }}>
          <div style={{ width:42, height:42, borderRadius:13, background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Stethoscope size={22} color="#060b17" />
          </div>
          <div>
            <div style={{ fontFamily:'var(--f-display)', fontWeight:800, fontSize:'1.1rem' }}>Medi-Assist</div>
            <div style={{ fontSize:'.68rem', color:'var(--t3)' }}>AI Healthcare Platform</div>
          </div>
        </div>

        {/* Feature list */}
        <div style={{ position:'relative', zIndex:1 }}>
          <h2 className="h2" style={{ marginBottom:'1rem', fontSize:'clamp(1.4rem,3vw,2rem)' }}>
            Healthcare intelligence,<br/><span className="grad">at your fingertips</span>
          </h2>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {perks.map(p => (
              <div key={p} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <CheckCircle2 size={16} style={{ color:'var(--teal)', flexShrink:0 }} />
                <span style={{ color:'var(--t2)', fontSize:'.88rem' }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color:'var(--t3)', fontSize:'.72rem', position:'relative', zIndex:1 }}>
          © 2025 Medi-Assist · Educational AI Platform · Not a substitute for medical advice
        </p>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem 2rem', position:'relative', overflow:'hidden' }}>
        <div className="orb" style={{ width:300, height:300, top:'20%', right:'-10%', background:'radial-gradient(circle,rgba(139,92,246,.06),transparent 65%)' }} />

        <motion.div
          key={mode}
          initial={{ opacity:0, x:20 }}
          animate={{ opacity:1, x:0 }}
          exit={{ opacity:0, x:-20 }}
          transition={{ duration:.3 }}
          style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}
        >
          <div style={{ marginBottom:'2rem' }}>
            <h1 style={{ fontFamily:'var(--f-display)', fontSize:'1.8rem', fontWeight:800, marginBottom:6 }}>
              {mode === 'login' ? 'Sign in' : 'Create account'}
            </h1>
            <p style={{ color:'var(--t3)', fontSize:'.88rem' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
              <button onClick={() => setMode(mode==='login'?'register':'login')} style={{ background:'none', border:'none', color:'var(--teal)', fontWeight:600, cursor:'pointer', fontSize:'.88rem' }}>
                {mode==='login' ? 'Register free' : 'Sign in'}
              </button>
            </p>
          </div>

          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div key="name" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} style={{ overflow:'hidden' }}>
                  <label className="label">Full Name</label>
                  <div style={{ position:'relative' }}>
                    <User size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--t3)' }} />
                    <input className="inp" style={{ paddingLeft:40 }} type="text" name="name" placeholder="Dr. Jane Smith" value={form.name} onChange={onChange} required />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="label">Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--t3)' }} />
                <input className="inp" style={{ paddingLeft:40 }} type="email" name="email" placeholder="you@example.com" value={form.email} onChange={onChange} required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={15} style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'var(--t3)' }} />
                <input className="inp" style={{ paddingLeft:40, paddingRight:42 }} type={showPw?'text':'password'} name="password" placeholder={mode==='register'?'Min. 6 characters':'••••••••'} value={form.password} onChange={onChange} required />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--t3)', display:'flex' }}>
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'13px', marginTop:4 }} disabled={loading}>
              {loading
                ? <><Loader2 size={17} style={{ animation:'_spin .8s linear infinite' }}/> {mode==='login'?'Signing in...':'Creating account...'}</>
                : <>{mode==='login'?'Sign In':'Create Account'} <ArrowRight size={16}/></>
              }
            </button>
          </form>

          <div style={{ margin:'1.5rem 0', display:'flex', alignItems:'center', gap:12 }}>
            <div className="divider" style={{ flex:1, margin:0 }} />
            <span style={{ fontSize:'.72rem', color:'var(--t3)' }}>Medi-Assist is free forever</span>
            <div className="divider" style={{ flex:1, margin:0 }} />
          </div>

          <p style={{ fontSize:'.72rem', color:'var(--t3)', textAlign:'center', lineHeight:1.7 }}>
            By continuing you agree to our educational platform terms. Medi-Assist does not store medical records and cannot replace professional diagnosis.
          </p>
        </motion.div>
      </div>

      {/* Mobile fallback */}
      <style>{`@media(max-width:700px){.auth-grid{grid-template-columns:1fr!important;} .auth-left{display:none!important;}}`}</style>
    </div>
  );
}
