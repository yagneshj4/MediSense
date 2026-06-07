import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, Send, MessageSquare, FileText, CheckCircle2, Loader2, MapPin, Clock } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const subjects = ['General','Bug Report','Feature Request','Medical Disclaimer','Partnership','Other'];

export default function Contact() {
  const [form, setForm]   = useState({ name:'', email:'', subject:'General', message:'' });
  const [loading, setL]   = useState(false);
  const [sent, setSent]   = useState(false);
  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault(); setL(true);
    try {
      await api.post('/contact', form);
      setSent(true); toast.success('Message received!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Send failed');
    } finally { setL(false); }
  };

  return (
    <div style={{ maxWidth:980, margin:'0 auto' }}>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:'2.5rem' }}>
        <span className="badge badge-teal" style={{ marginBottom:12, display:'inline-flex' }}>Contact</span>
        <h1 className="h2" style={{ marginBottom:8 }}>Get in <span className="grad">Touch</span></h1>
        <p className="sub">Have questions, suggestions, or feedback? We'd love to hear from you.</p>
      </motion.div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:'1.5rem', alignItems:'start' }}>

        {/* Left — info */}
        <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {[
            { icon: Mail,     color:'var(--teal)',   title:'Email Us',       sub:'238w1a12j4@vrsec.ac.in' },
            { icon: MapPin,   color:'var(--purple)', title:'Location',       sub:'India · Remote-first'     },
            { icon: Clock,    color:'var(--green)',  title:'Response Time',  sub:'Usually within 24 hours'  },
          ].map(({ icon: Icon, color, title, sub }) => (
            <div key={title} className="glass" style={{ padding:'1.25rem', display:'flex', gap:14, alignItems:'center' }}>
              <div className="icon-box" style={{ background:`${color}15`, borderRadius:12, flexShrink:0 }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:'.88rem' }}>{title}</div>
                <div style={{ fontSize:'.8rem', color:'var(--t3)' }}>{sub}</div>
              </div>
            </div>
          ))}

          <div className="glass" style={{ padding:'1.5rem', marginTop:'.5rem', background:'linear-gradient(135deg,rgba(0,212,255,.04),rgba(139,92,246,.04))', borderColor:'rgba(0,212,255,.12)' }}>
            <h3 style={{ fontFamily:'var(--f-display)', fontWeight:700, marginBottom:10 }}>Open Source</h3>
            <p style={{ color:'var(--t2)', fontSize:'.82rem', lineHeight:1.75 }}>
              Medi-Assist is an open-source educational project. Found a bug or want to contribute? Check the GitHub repository.
            </p>
          </div>
        </motion.div>

        {/* Right — form */}
        <motion.div initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }}>
          {sent ? (
            <motion.div initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }} className="glass"
              style={{ padding:'3.5rem', textAlign:'center' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(16,185,129,.12)', border:'1px solid rgba(16,185,129,.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem' }}>
                <CheckCircle2 size={32} style={{ color:'var(--green)' }} />
              </div>
              <h2 style={{ fontFamily:'var(--f-display)', fontSize:'1.5rem', fontWeight:800, marginBottom:8 }}>Message Received!</h2>
              <p style={{ color:'var(--t2)', fontSize:'.88rem', marginBottom:'1.5rem' }}>Thank you for reaching out. We'll get back to you soon.</p>
              <button onClick={() => setSent(false)} className="btn btn-ghost">Send Another</button>
            </motion.div>
          ) : (
            <div className="glass" style={{ padding:'2rem' }}>
              <h2 style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:'1.1rem', marginBottom:'1.5rem' }}>Send a Message</h2>
              <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <label className="label">Your Name</label>
                    <div style={{ position:'relative' }}>
                      <User size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--t3)' }} />
                      <input className="inp" style={{ paddingLeft:38 }} name="name" placeholder="John Doe" value={form.name} onChange={onChange} required />
                    </div>
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <div style={{ position:'relative' }}>
                      <Mail size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--t3)' }} />
                      <input className="inp" style={{ paddingLeft:38 }} type="email" name="email" placeholder="you@example.com" value={form.email} onChange={onChange} required />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="label">Subject</label>
                  <div style={{ position:'relative' }}>
                    <FileText size={14} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--t3)' }} />
                    <select className="inp" style={{ paddingLeft:38, cursor:'pointer' }} name="subject" value={form.subject} onChange={onChange}>
                      {subjects.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Message</label>
                  <div style={{ position:'relative' }}>
                    <MessageSquare size={14} style={{ position:'absolute', left:12, top:12, color:'var(--t3)' }} />
                    <textarea className="inp" style={{ paddingLeft:38, resize:'vertical', minHeight:130 }} name="message" placeholder="Tell us how we can help…" value={form.message} onChange={onChange} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" style={{ alignSelf:'flex-start', padding:'12px 28px' }} disabled={loading}>
                  {loading ? <Loader2 size={16} style={{ animation:'_spin .8s linear infinite' }}/> : <Send size={16}/>}
                  {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
