import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Stethoscope, Mail, Lock, User, ArrowRight, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const perks = [
  'AI-powered disease prediction & diagnosis',
  'Multilingual MediBot (English & Hindi)',
  'Prescription storage & tracking',
  'Personalized care plans & history',
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
        toast.success('Welcome back!');
      } else {
        if (!form.name.trim()) { toast.error('Name is required'); setLoading(false); return; }
        await register(form.name, form.email, form.password);
        toast.success('Account created! Welcome aboard.');
      }
      navigate('/predict');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'100vh', display:'grid', gridTemplateColumns:'1fr 1fr', overflow:'hidden' }}>

      {/* ── Left panel — branding ── */}
      <div style={{
        background:'linear-gradient(160deg,rgba(0,212,255,0.04),rgba(139,92,246,0.07))',
        borderRight:'1px solid var(--border)',
        padding:'3.5rem',
        display:'flex', flexDirection:'column', justifyContent:'space-between',
        position:'relative', overflow:'hidden',
      }}>
        <div className="orb" style={{ width:500, height:500, top:'-20%', left:'-20%', background:'radial-gradient(circle,rgba(0,212,255,0.09),transparent 60%)' }} />
        <div className="orb" style={{ width:450, height:450, bottom:'-20%', right:'-15%', background:'radial-gradient(circle,rgba(139,92,246,0.1),transparent 60%)' }} />

        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', gap:12, position:'relative', zIndex:1 }}>
          <div style={{
            width:44, height:44, borderRadius:14,
            background:'linear-gradient(135deg,var(--teal),var(--purple))',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 24px rgba(0,212,255,0.3)',
          }}>
            <Stethoscope size={22} color="#04090f" />
          </div>
          <div>
            <div style={{ fontFamily:'var(--f-display)', fontWeight:800, fontSize:'1.1rem' }}>Medi-Assist</div>
            <div style={{ fontSize:'.65rem', color:'var(--t3)', textTransform:'uppercase', letterSpacing:'.08em' }}>AI Healthcare Platform</div>
          </div>
        </div>

        {/* Main message */}
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'4px 12px 4px 5px', borderRadius:99, background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.16)', marginBottom:'1.5rem' }}>
            <span style={{ background:'linear-gradient(135deg,var(--teal),var(--purple))', borderRadius:99, padding:'2px 9px', fontSize:'.62rem', fontWeight:800, color:'#04090f', textTransform:'uppercase', letterSpacing:'.08em' }}>Free</span>
            <span style={{ fontSize:'.78rem', color:'var(--t2)' }}>No credit card required</span>
          </div>

          <h2 style={{ fontFamily:'var(--f-display)', fontWeight:800, fontSize:'clamp(1.5rem,3vw,2.1rem)', lineHeight:1.2, marginBottom:'1.5rem' }}>
            Healthcare intelligence,<br/><span className="grad">at your fingertips</span>
          </h2>

          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {perks.map(p => (
              <div key={p} style={{ display:'flex', alignItems:'flex-start', gap:11 }}>
                <div style={{ width:20, height:20, borderRadius:'50%', background:'rgba(0,212,255,0.1)', border:'1px solid rgba(0,212,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
                  <CheckCircle2 size={11} style={{ color:'var(--teal)' }} />
                </div>
                <span style={{ color:'var(--t2)', fontSize:'.88rem', lineHeight:1.6 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position:'relative', zIndex:1 }}>
          <p style={{ color:'var(--t3)', fontSize:'.7rem', lineHeight:1.6 }}>
            © 2025 Medi-Assist · Educational AI Platform<br/>
            Not a substitute for professional medical advice.
          </p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'3rem 2.5rem', position:'relative', overflow:'hidden',
        background:'var(--bg)',
      }}>
        <div className="orb" style={{ width:350, height:350, top:'10%', right:'-15%', background:'radial-gradient(circle,rgba(139,92,246,0.07),transparent 65%)' }} />
        <div className="orb" style={{ width:300, height:300, bottom:'5%', left:'-10%', background:'radial-gradient(circle,rgba(0,212,255,0.05),transparent 65%)' }} />

        <motion.div
          key={mode}
          initial={{ opacity:0, x:16 }}
          animate={{ opacity:1, x:0 }}
          exit={{ opacity:0, x:-16 }}
          transition={{ duration:.28 }}
          style={{ width:'100%', maxWidth:420, position:'relative', zIndex:1 }}
        >
          {/* Header */}
          <div style={{ marginBottom:'2.5rem' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:7, marginBottom:16, padding:'5px 14px', borderRadius:99, background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.18)' }}>
              <Sparkles size={12} style={{ color:'#c4b5fd' }} />
              <span style={{ fontSize:'.72rem', fontWeight:700, color:'#c4b5fd', textTransform:'uppercase', letterSpacing:'.08em' }}>
                {mode === 'login' ? 'Welcome back' : 'Get started free'}
              </span>
            </div>
            <h1 style={{ fontFamily:'var(--f-display)', fontSize:'2rem', fontWeight:800, marginBottom:8, letterSpacing:'-.02em' }}>
              {mode === 'login' ? 'Sign in to Medi-Assist' : 'Create your account'}
            </h1>
            <p style={{ color:'var(--t3)', fontSize:'.88rem' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
              <button
                onClick={() => setMode(mode==='login'?'register':'login')}
                style={{ background:'none', border:'none', color:'var(--teal)', fontWeight:600, cursor:'pointer', fontSize:'.88rem', transition:'var(--t)' }}
                onMouseEnter={e => e.currentTarget.style.color='var(--t1)'}
                onMouseLeave={e => e.currentTarget.style.color='var(--teal)'}
              >
                {mode==='login' ? 'Register free →' : 'Sign in →'}
              </button>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div key="name" initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }} style={{ overflow:'hidden' }}>
                  <label className="label">Full Name</label>
                  <div style={{ position:'relative' }}>
                    <User size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--t3)' }} />
                    <input className="inp" style={{ paddingLeft:42 }} type="text" name="name" placeholder="Dr. Jane Smith" value={form.name} onChange={onChange} required />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="label">Email Address</label>
              <div style={{ position:'relative' }}>
                <Mail size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--t3)' }} />
                <input className="inp" style={{ paddingLeft:42 }} type="email" name="email" placeholder="you@example.com" value={form.email} onChange={onChange} required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div style={{ position:'relative' }}>
                <Lock size={15} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--t3)' }} />
                <input className="inp" style={{ paddingLeft:42, paddingRight:44 }} type={showPw?'text':'password'} name="password" placeholder={mode==='register'?'Min. 6 characters':'••••••••'} value={form.password} onChange={onChange} required />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'var(--t3)', display:'flex', cursor:'pointer', transition:'var(--t)' }}
                  onMouseEnter={e => e.currentTarget.style.color='var(--t2)'}
                  onMouseLeave={e => e.currentTarget.style.color='var(--t3)'}
                >
                  {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'14px', marginTop:4, fontSize:'.92rem', borderRadius:'var(--r-md)' }} disabled={loading}>
              {loading
                ? <><Loader2 size={17} style={{ animation:'_spin .8s linear infinite' }}/> {mode==='login'?'Signing in…':'Creating account…'}</>
                : <>{mode==='login'?'Sign In':'Create Account'} <ArrowRight size={16}/></>
              }
            </button>
          </form>

          <div style={{ margin:'1.75rem 0', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ flex:1, height:1, background:'var(--border)' }} />
            <span style={{ fontSize:'.7rem', color:'var(--t3)', letterSpacing:'.04em' }}>MEDI-ASSIST IS FREE</span>
            <div style={{ flex:1, height:1, background:'var(--border)' }} />
          </div>

          <p style={{ fontSize:'.72rem', color:'var(--t3)', textAlign:'center', lineHeight:1.7 }}>
            By continuing you agree to our educational platform terms.<br/>
            Medi-Assist cannot replace professional medical diagnosis.
          </p>
        </motion.div>
      </div>

      <style>{`@media(max-width:700px){div[style*="gridTemplateColumns"]{grid-template-columns:1fr!important;} div[style*="borderRight"]{display:none!important;}}`}</style>
    </div>
  );
}
