import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Trash2, Bot, User, Loader2, AlertTriangle,
  Paperclip, X, Sparkles, Plus,
  MessageSquare, Clock, Stethoscope,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PROMPTS = [
  'What are symptoms of diabetes?',
  'How to manage high blood pressure?',
  'Best diet for fever recovery?',
  'When is chest pain serious?',
  'What is dengue fever?',
  'How to reduce headache naturally?',
];

const INIT = [{
  role:'bot',
  text:"👋 Hello! I'm MediBot — your AI health companion powered by Gemini. Ask me about symptoms, medications, or general health advice. I provide health education only, not medical diagnosis. How can I help you today?",
  timestamp: new Date(),
}];

function Bubble({ msg }) {
  const isBot   = msg.role === 'bot';
  const isEmerg = msg.type === 'emergency';
  return (
    <motion.div
      initial={{ opacity:0, y:10, scale:.97 }}
      animate={{ opacity:1, y:0, scale:1 }}
      transition={{ duration:.25 }}
      style={{ display:'flex', gap:12, justifyContent:isBot?'flex-start':'flex-end', marginBottom:16, alignItems:'flex-end' }}
    >
      {isBot && (
        <div style={{
          width:34, height:34, borderRadius:11, flexShrink:0,
          background: isEmerg ? 'rgba(239,68,68,.2)' : 'linear-gradient(135deg,var(--teal),var(--purple))',
          border: isEmerg ? '1px solid rgba(239,68,68,.4)' : 'none',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: isEmerg ? 'none' : '0 4px 12px rgba(0,212,255,.25)',
        }}>
          {isEmerg ? <AlertTriangle size={15} color="var(--red)"/> : <Bot size={16} color="#03070e"/>}
        </div>
      )}

      <div style={{
        maxWidth:'72%', padding:'12px 16px',
        borderRadius: isBot ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
        background: isEmerg
          ? 'rgba(239,68,68,.1)'
          : isBot
          ? 'rgba(255,255,255,.055)'
          : 'linear-gradient(135deg,var(--teal),#6366f1,var(--purple))',
        border: isEmerg
          ? '1px solid rgba(239,68,68,.28)'
          : isBot ? '1px solid var(--border)' : 'none',
        color: isBot ? 'var(--t1)' : '#03070e',
        fontSize:'.88rem', lineHeight:1.75, fontWeight: isBot ? 400 : 500,
        boxShadow: isBot ? 'none' : '0 4px 18px rgba(0,212,255,.2)',
      }}>
        <p style={{ whiteSpace:'pre-wrap', wordBreak:'break-word' }}>{msg.text}</p>
        {msg.timestamp && (
          <div style={{ fontSize:'.62rem', opacity:.4, marginTop:5, textAlign:isBot?'left':'right' }}>
            {new Date(msg.timestamp).toLocaleTimeString([],{ hour:'2-digit', minute:'2-digit' })}
          </div>
        )}
      </div>

      {!isBot && (
        <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,.08)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <User size={14}/>
        </div>
      )}
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div style={{ display:'flex', gap:12, marginBottom:16, alignItems:'flex-end' }}>
      <div style={{ width:34, height:34, borderRadius:11, background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(0,212,255,.25)', flexShrink:0 }}>
        <Bot size={16} color="#03070e"/>
      </div>
      <div style={{ padding:'14px 18px', background:'rgba(255,255,255,.055)', border:'1px solid var(--border)', borderRadius:'4px 18px 18px 18px', display:'flex', gap:6, alignItems:'center' }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ width:7, height:7, borderRadius:'50%', background:'var(--teal)', display:'inline-block', animation:`pulse 1.4s ease-in-out ${i*.2}s infinite` }}/>
        ))}
      </div>
    </div>
  );
}

export default function Chat() {
  const { isAuth } = useAuth();
  const [msgs, setMsgs]         = useState(INIT);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [lastDis, setLastDis]   = useState(null);
  const [file, setFile]         = useState(null);
  const bottomRef = useRef(null);
  const fileRef   = useRef(null);
  const textRef   = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, loading]);

  useEffect(() => {
    if (!isAuth) return;
    api.get('/chat/history').then(r => {
      if (r.data.messages?.length) {
        setMsgs([...INIT, ...r.data.messages]);
        setLastDis(r.data.lastDisease);
      }
    }).catch(() => {});
  }, [isAuth]);

  const send = async (text = input) => {
    const msg = text.trim();
    if (!msg && !file) return;
    setInput(''); textRef.current?.focus();
    setMsgs(p => [...p, { role:'user', text: file ? `📎 ${file.name} — ${msg || 'Prescription upload'}` : msg, timestamp:new Date() }]);
    setLoading(true);
    if (file) {
      try {
        const fd = new FormData(); fd.append('file', file); fd.append('note', msg);
        await api.post('/prescriptions/upload', fd, { headers:{ 'Content-Type':'multipart/form-data' } });
        setMsgs(p => [...p, { role:'bot', text:'✅ Prescription saved to your health records!', timestamp:new Date() }]);
      } catch {
        setMsgs(p => [...p, { role:'bot', text:'❌ Upload failed — please sign in to save prescriptions.', timestamp:new Date() }]);
      }
      setFile(null); setLoading(false); return;
    }
    try {
      const ctx = msgs.slice(-6).map(m => ({ role:m.role, text:m.text }));
      const { data } = await api.post('/chat', { message:msg, lang:'en', lastDisease:lastDis, context:ctx });
      setMsgs(p => [...p, { role:'bot', text:data.response.text, type:data.response.type, timestamp:new Date() }]);
    } catch {
      setMsgs(p => [...p, { role:'bot', text:'⚠️ Something went wrong. Please try again.', timestamp:new Date() }]);
    } finally { setLoading(false); }
  };

  const clear = async () => {
    setMsgs(INIT);
    if (isAuth) await api.delete('/chat/history').catch(() => {});
    toast.success('Chat cleared');
  };

  const userMsgCount = msgs.filter(m => m.role === 'user').length;
  const isFresh = msgs.length <= 1;

  return (
    <div style={{ display:'flex', height:'calc(100vh - 60px)', overflow:'hidden' }}>

      {/* ── Sidebar (desktop only) ─────────────────────────── */}
      <aside style={{
        width:260, flexShrink:0, borderRight:'1px solid var(--border)',
        background:'rgba(5,10,22,.95)', display:'flex', flexDirection:'column',
        padding:'1.25rem 0',
      }} className="desktop-nav" style={{ display:'flex', flexDirection:'column' }}>
        {/* New chat button */}
        <div style={{ padding:'0 1rem 1rem' }}>
          <button onClick={clear} style={{
            width:'100%', display:'flex', alignItems:'center', gap:10,
            padding:'10px 14px', borderRadius:12,
            background:'rgba(0,212,255,.08)', border:'1px solid rgba(0,212,255,.2)',
            color:'var(--teal)', fontSize:'.85rem', fontWeight:600, cursor:'pointer',
            transition:'var(--t)',
          }}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(0,212,255,.14)'}
          onMouseLeave={e=>e.currentTarget.style.background='rgba(0,212,255,.08)'}
          >
            <Plus size={16}/> New Conversation
          </button>
        </div>

        {/* Bot info */}
        <div style={{ padding:'0 1rem', marginBottom:'1.25rem' }}>
          <div style={{ padding:'12px 14px', borderRadius:12, background:'rgba(255,255,255,.04)', border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              <div style={{ width:36, height:36, borderRadius:11, background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Bot size={18} color="#03070e"/>
              </div>
              <div>
                <div style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:'.88rem' }}>MediBot</div>
                <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'.68rem', color:'var(--green)' }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--green)', display:'inline-block' }}/>
                  Online · Gemini AI
                </div>
              </div>
            </div>
            <p style={{ fontSize:'.72rem', color:'var(--t3)', lineHeight:1.6 }}>Health education AI. Always consult a doctor for diagnosis.</p>
          </div>
        </div>

        {/* Session stats */}
        <div style={{ padding:'0 1rem', marginBottom:'1.25rem' }}>
          <div style={{ fontSize:'.68rem', fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>This Session</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {[
              { icon:MessageSquare, label:'Messages sent', value:userMsgCount },
              { icon:Clock,         label:'Conversation', value:userMsgCount > 0 ? 'Active' : 'Ready' },
            ].map(({ icon:Icon, label, value }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:9, background:'rgba(255,255,255,.03)' }}>
                <Icon size={13} style={{ color:'var(--t3)', flexShrink:0 }}/>
                <span style={{ flex:1, fontSize:'.76rem', color:'var(--t3)' }}>{label}</span>
                <span style={{ fontSize:'.76rem', color:'var(--t2)', fontWeight:600 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick topics */}
        <div style={{ padding:'0 1rem', flex:1 }}>
          <div style={{ fontSize:'.68rem', fontWeight:700, color:'var(--t3)', textTransform:'uppercase', letterSpacing:'.08em', marginBottom:8 }}>Quick Topics</div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {['Fever & cold','Diabetes info','Heart health','Skin conditions','Diet advice'].map(t => (
              <button key={t} onClick={() => send(t)} style={{
                textAlign:'left', padding:'8px 12px', borderRadius:9,
                background:'none', border:'none',
                color:'var(--t3)', fontSize:'.8rem', cursor:'pointer', transition:'var(--t)',
              }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.05)';e.currentTarget.style.color='var(--t1)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='none';e.currentTarget.style.color='var(--t3)';}}
              >{t}</button>
            ))}
          </div>
        </div>

        <div style={{ padding:'1rem', borderTop:'1px solid var(--border)' }}>
          <p style={{ fontSize:'.68rem', color:'var(--t4)', lineHeight:1.6 }}>⚕️ Not a substitute for professional medical advice.</p>
        </div>
      </aside>

      {/* ── Main chat area ──────────────────────────────────── */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>

        {/* Top bar */}
        <div style={{
          padding:'12px 20px', borderBottom:'1px solid var(--border)',
          display:'flex', alignItems:'center', gap:12, flexShrink:0,
          background:'rgba(5,10,22,.95)', backdropFilter:'blur(20px)',
        }}>
          <div style={{ flex:1, display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--green)', boxShadow:'0 0 8px var(--green)', animation:'pulse 2s ease-in-out infinite' }}/>
            <div>
              <span style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:'.92rem' }}>MediBot</span>
              <span style={{ color:'var(--t3)', fontSize:'.75rem', marginLeft:8 }}>Powered by Gemini AI</span>
            </div>
          </div>

          <button onClick={clear} className="btn btn-ghost btn-sm" title="Clear chat"><Trash2 size={13}/></button>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'1.5rem 2rem' }}>

          {/* Welcome + Quick prompts */}
          {isFresh && (
            <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:.1 }} style={{ textAlign:'center', marginBottom:'2rem', paddingTop:'1rem' }}>
              <div style={{ width:64, height:64, borderRadius:20, background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.25rem', boxShadow:'0 8px 32px rgba(0,212,255,.3)' }}>
                <Stethoscope size={30} color="#03070e"/>
              </div>
              <h2 style={{ fontFamily:'var(--f-display)', fontWeight:800, fontSize:'1.4rem', marginBottom:8 }}>How can I help you today?</h2>
              <p style={{ color:'var(--t3)', fontSize:'.85rem', marginBottom:'2rem' }}>Ask me anything about health, symptoms, or medications.</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:8, textAlign:'left', maxWidth:700, margin:'0 auto' }}>
                {PROMPTS.map(p => (
                  <button key={p} onClick={() => send(p)} style={{
                    padding:'12px 16px', borderRadius:12,
                    background:'rgba(255,255,255,.04)',
                    border:'1px solid var(--border)',
                    color:'var(--t2)', fontSize:'.82rem', cursor:'pointer',
                    transition:'var(--t)', textAlign:'left', lineHeight:1.5,
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,212,255,.08)';e.currentTarget.style.borderColor='rgba(0,212,255,.25)';e.currentTarget.style.color='var(--teal)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.04)';e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--t2)';}}
                  >
                    <Sparkles size={12} style={{ color:'var(--purple)', marginRight:7, opacity:.7 }}/>{p}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {msgs.map((m, i) => <Bubble key={i} msg={m}/>)}
          {loading && <TypingDots/>}
          <div ref={bottomRef}/>
        </div>

        {/* File preview */}
        <AnimatePresence>
          {file && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
              style={{ margin:'0 1.5rem 8px', padding:'8px 14px', background:'rgba(0,212,255,.07)', border:'1px solid rgba(0,212,255,.2)', borderRadius:'var(--r-md)', display:'flex', alignItems:'center', gap:8, fontSize:'.8rem', color:'var(--teal)' }}>
              <Paperclip size={13}/><span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.name}</span>
              <button onClick={() => setFile(null)} style={{ background:'none', border:'none', color:'inherit', cursor:'pointer', display:'flex' }}><X size={13}/></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area */}
        <div style={{ padding:'1rem 1.5rem 1.25rem', borderTop:'1px solid var(--border)', background:'rgba(5,10,22,.95)', flexShrink:0 }}>
          <div style={{
            display:'flex', gap:10, alignItems:'flex-end',
            background:'rgba(255,255,255,.04)',
            border:'1px solid var(--border)',
            borderRadius:16, padding:'8px 10px 8px 14px',
            transition:'border-color .2s, box-shadow .2s',
          }}
          onFocusCapture={e => { e.currentTarget.style.borderColor='var(--teal)'; e.currentTarget.style.boxShadow='0 0 0 3px var(--teal-dim)'; }}
          onBlurCapture={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.boxShadow='none'; }}
          >
            {isAuth && (
              <>
                <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.webp,.pdf" style={{ display:'none' }} onChange={e => setFile(e.target.files[0]||null)}/>
                <button onClick={() => fileRef.current?.click()} style={{ background:'none', border:'none', color:'var(--t3)', display:'flex', padding:'4px', borderRadius:7, cursor:'pointer', transition:'var(--t)', flexShrink:0 }}
                  title="Upload prescription"
                  onMouseEnter={e=>e.currentTarget.style.color='var(--teal)'}
                  onMouseLeave={e=>e.currentTarget.style.color='var(--t3)'}
                ><Paperclip size={17}/></button>
              </>
            )}
            <textarea ref={textRef} value={input} onChange={e => setInput(e.target.value)} rows={1}
              onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask MediBot anything about your health… (Enter to send)"
              style={{ flex:1, background:'none', border:'none', color:'var(--t1)', padding:'6px 4px', fontSize:'.88rem', resize:'none', maxHeight:140, outline:'none', lineHeight:1.65 }}
            />
            <button onClick={() => send()} style={{
              background: input.trim() || file ? 'linear-gradient(135deg,var(--teal),var(--purple))' : 'rgba(255,255,255,.06)',
              border:'none', borderRadius:11, padding:'9px 12px',
              color: input.trim() || file ? '#03070e' : 'var(--t3)',
              display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', transition:'var(--t)', flexShrink:0,
              boxShadow: input.trim() || file ? '0 4px 14px rgba(0,212,255,.28)' : 'none',
            }} disabled={loading || (!input.trim() && !file)}>
              {loading ? <Loader2 size={17} style={{ animation:'_spin .75s linear infinite' }}/> : <Send size={17}/>}
            </button>
          </div>
          <p style={{ textAlign:'center', fontSize:'.68rem', color:'var(--t4)', marginTop:8 }}>MediBot provides health education only · Not a substitute for medical advice</p>
        </div>
      </div>
    </div>
  );
}
