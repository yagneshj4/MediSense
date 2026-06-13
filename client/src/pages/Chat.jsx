import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Trash2, Bot, User, Loader2, AlertTriangle,
  Paperclip, X, Mic, Sparkles, ChevronDown,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LANGS = [
  { code:'en', flag:'🇬🇧', label:'English' },
  { code:'hi', flag:'🇮🇳', label:'Hindi'   },
];

const PROMPTS_BY_LANG = {
  en: [
    'What are the symptoms of diabetes?',
    'How to manage high blood pressure?',
    'Best diet for fever recovery?',
    'When is chest pain serious?',
    'What is dengue fever?',
    'How to reduce headache naturally?',
  ],
  hi: [
    'डायबिटीज के लक्षण क्या हैं?',
    'हाई ब्लड प्रेशर को कैसे नियंत्रित करें?',
    'बुखार में क्या खाएं?',
    'सीने में दर्द कब खतरनाक होता है?',
    'डेंगू बुखार क्या है?',
    'सिरदर्द को प्राकृतिक तरीके से कैसे कम करें?',
  ],
};


function Bubble({ msg }) {
  const isBot = msg.role === 'bot';
  const isEmerg = msg.type === 'emergency';
  return (
    <motion.div initial={{ opacity:0, y:10, scale:.97 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ duration:.28 }}
      style={{ display:'flex', gap:10, justifyContent:isBot?'flex-start':'flex-end', marginBottom:14, alignItems:'flex-end' }}
    >
      {isBot && (
        <div style={{ width:32, height:32, borderRadius:'50%', background: isEmerg ? 'rgba(239,68,68,.2)' : 'linear-gradient(135deg,var(--teal),var(--purple))', border: isEmerg ? '1px solid var(--red)' : 'none', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          {isEmerg ? <AlertTriangle size={15} color="var(--red)"/> : <Bot size={15} color="#060b17"/>}
        </div>
      )}
      <div style={{
        maxWidth:'76%', padding:'11px 15px',
        borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
        background: isEmerg
          ? 'rgba(239,68,68,.1)'
          : isBot ? 'rgba(255,255,255,.055)' : 'linear-gradient(135deg,var(--teal),var(--purple))',
        border: isEmerg ? '1px solid rgba(239,68,68,.3)' : isBot ? '1px solid var(--border)' : 'none',
        color: isBot ? 'var(--t1)' : '#060b17',
        fontSize:'.88rem', lineHeight:1.75, fontWeight: isBot ? 400 : 500,
      }}>
        {msg.text}
        {msg.timestamp && (
          <div style={{ fontSize:'.65rem', opacity:.45, marginTop:4, textAlign:isBot?'left':'right' }}>
            {new Date(msg.timestamp).toLocaleTimeString([],{ hour:'2-digit', minute:'2-digit' })}
          </div>
        )}
      </div>
      {!isBot && (
        <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(255,255,255,.08)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <User size={14}/>
        </div>
      )}
    </motion.div>
  );
}

function TypingDots() {
  return (
    <div style={{ display:'flex', gap:10, marginBottom:14, alignItems:'flex-end' }}>
      <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Bot size={15} color="#060b17"/>
      </div>
      <div style={{ padding:'12px 18px', background:'rgba(255,255,255,.055)', border:'1px solid var(--border)', borderRadius:'4px 16px 16px 16px', display:'flex', gap:5, alignItems:'center' }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ width:7, height:7, borderRadius:'50%', background:'var(--teal)', display:'inline-block', animation:`pulse 1.4s ease-in-out ${i*.18}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

const INIT = [{
  role:'bot',
  text:"👋 Hello! I'm MediBot — your AI health companion powered by Gemini. Ask me about symptoms, medications, or general health advice. I provide health education only, not medical diagnosis. How can I help you today?",
  timestamp: new Date(),
}];

export default function Chat() {
  const { isAuth } = useAuth();
  const [msgs, setMsgs]       = useState(INIT);
  const [input, setInput]     = useState('');
  const [lang, setLang]       = useState('en');
  const [loading, setLoading] = useState(false);
  const [lastDis, setLastDis] = useState(null);
  const [file, setFile]       = useState(null);
  const [showLang, setShowLang] = useState(false);
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

    setMsgs(p => [...p, { role:'user', text: file ? `📎 ${file.name} — ${msg || 'Prescription upload'}` : msg, timestamp: new Date() }]);
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
      const { data } = await api.post('/chat', { message:msg, lang, lastDisease:lastDis, context:ctx });
      setMsgs(p => [...p, { role:'bot', text:data.response.text, type:data.response.type, timestamp:new Date() }]);
    } catch {
      setMsgs(p => [...p, { role:'bot', text:'⚠️ Something went wrong. Please try again.', timestamp:new Date() }]);
    } finally { setLoading(false); }
  };

  const clear = async () => {
    setMsgs(INIT);
    if (isAuth) await api.delete('/chat/history').catch(()=>{});
    toast.success('Chat cleared');
  };

  const curLang = LANGS.find(l => l.code===lang);

  return (
    <div style={{ height:'calc(100vh - 3.5rem)', display:'flex', flexDirection:'column', maxWidth:860, margin:'0 auto' }}>

      {/* ── Top bar ── */}
      <div className="glass" style={{ padding:'12px 18px', marginBottom:12, display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <div style={{ width:40, height:40, borderRadius:12, background:'linear-gradient(135deg,var(--teal),var(--purple))', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <Bot size={20} color="#060b17"/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'var(--f-display)', fontWeight:700, fontSize:'.95rem' }}>MediBot</div>
          <div style={{ fontSize:'.7rem', display:'flex', alignItems:'center', gap:5, color:'var(--green)' }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'var(--green)', display:'inline-block' }}/>
            Online · Gemini AI
          </div>
        </div>

        {/* Language selector */}
        <div style={{ position:'relative' }}>
          <button onClick={() => setShowLang(!showLang)} style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 12px', background:'rgba(255,255,255,.05)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', color:'var(--t1)', fontSize:'.8rem', cursor:'pointer', transition:'var(--t)' }}>
            {curLang.flag} {curLang.label} <ChevronDown size={12}/>
          </button>
          <AnimatePresence>
            {showLang && (
              <motion.div initial={{ opacity:0, y:-6, scaleY:.9 }} animate={{ opacity:1, y:0, scaleY:1 }} exit={{ opacity:0, y:-6 }}
                style={{ position:'absolute', top:'110%', right:0, background:'rgba(6,11,23,.98)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:6, zIndex:50, minWidth:130 }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => { setLang(l.code); setShowLang(false); }}
                    style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'none', border:'none', color: l.code===lang ? 'var(--teal)' : 'var(--t2)', fontSize:'.82rem', borderRadius:8, cursor:'pointer', transition:'var(--t)' }}
                    onMouseEnter={e => e.currentTarget.style.background='var(--teal-dim)'}
                    onMouseLeave={e => e.currentTarget.style.background='none'}
                  >
                    {l.flag} {l.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={clear} className="btn btn-ghost btn-sm" title="Clear chat"><Trash2 size={13}/></button>
      </div>

      {/* ── Quick prompts (only when fresh) ── */}
      {msgs.length <= 1 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:12, flexShrink:0 }}>
          {(PROMPTS_BY_LANG[lang] || PROMPTS_BY_LANG.en).map(p => (
            <button key={p} onClick={() => send(p)} style={{ padding:'5px 13px', borderRadius:99, background:'rgba(255,255,255,.04)', border:'1px solid var(--border)', color:'var(--t2)', fontSize:'.76rem', cursor:'pointer', transition:'var(--t)' }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--teal-dim)'; e.currentTarget.style.color='var(--teal)'; e.currentTarget.style.borderColor='rgba(0,212,255,.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.color='var(--t2)'; e.currentTarget.style.borderColor='var(--border)'; }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* ── Messages ── */}
      <div style={{ flex:1, overflowY:'auto', paddingRight:4 }}>
        {msgs.map((m,i) => <Bubble key={i} msg={m}/>)}
        {loading && <TypingDots/>}
        <div ref={bottomRef}/>
      </div>

      {/* ── File preview ── */}
      <AnimatePresence>
        {file && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
            style={{ marginBottom:8, padding:'8px 14px', background:'var(--teal-dim)', border:'1px solid rgba(0,212,255,.25)', borderRadius:'var(--r-md)', display:'flex', alignItems:'center', gap:8, fontSize:'.8rem', color:'var(--teal)' }}>
            <Paperclip size={13}/> <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{file.name}</span>
            <button onClick={() => setFile(null)} style={{ background:'none', border:'none', color:'inherit', cursor:'pointer', display:'flex' }}><X size={13}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input ── */}
      <div className="glass" style={{ padding:'10px 12px', display:'flex', gap:9, alignItems:'flex-end', flexShrink:0 }}>
        {isAuth && (
          <>
            <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.webp,.pdf" style={{ display:'none' }} onChange={e => setFile(e.target.files[0]||null)} />
            <button onClick={() => fileRef.current?.click()} className="btn btn-ghost btn-sm" style={{ padding:'9px', flexShrink:0 }} title="Upload prescription">
              <Paperclip size={16}/>
            </button>
          </>
        )}
        <textarea ref={textRef} value={input} onChange={e => setInput(e.target.value)} rows={1}
          onKeyDown={e => { if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask MediBot anything about your health… (Enter to send)"
          style={{ flex:1, background:'rgba(255,255,255,.04)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', color:'var(--t1)', padding:'10px 14px', fontSize:'.88rem', resize:'none', maxHeight:130, outline:'none', transition:'var(--t)', lineHeight:1.6 }}
          onFocus={e => { e.target.style.borderColor='var(--teal)'; e.target.style.boxShadow='0 0 0 3px var(--teal-dim)'; }}
          onBlur={e => { e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'; }}
        />
        <button onClick={() => send()} className="btn btn-primary" style={{ padding:'10px 16px', flexShrink:0 }} disabled={loading || (!input.trim() && !file)}>
          {loading ? <Loader2 size={17} style={{ animation:'_spin .8s linear infinite' }}/> : <Send size={17}/>}
        </button>
      </div>
    </div>
  );
}
