'use client';
import { useEffect, useRef, useState } from 'react';
import { ME } from '../lib/data';

const pad = (n) => String(n).padStart(2, '0');
const fmt = (ts) => { const d = new Date(ts), h = d.getHours(); return `${h < 12 ? '오전' : '오후'} ${h % 12 || 12}:${pad(d.getMinutes())}`; };
const avatar = { width: 44, height: 44, borderRadius: '50%', background: 'var(--line)', display: 'grid', placeItems: 'center', fontWeight: 700, flex: 'none' };

export default function Chat({ clubs, chats, setChats }) {
  const [room, setRoom] = useState(null), [text, setText] = useState('');
  const endRef = useRef(null);
  const mine = clubs.filter((c) => c.members.some((m) => m.name === ME));
  const groups = mine.map((c) => ({ id: 'c:' + c.id, name: `${c.name} 단체채팅`, members: c.members.map((m) => m.name).filter((n) => n !== ME), group: true }));
  const names = [...new Set(mine.flatMap((c) => c.members.map((m) => m.name)).filter((n) => n !== ME))];
  const dms = names.map((n) => ({ id: 'd:' + n, name: n, members: [n], group: false }));
  const rooms = [...groups, ...dms], cur = rooms.find((r) => r.id === room);
  const msgs = room ? chats[room] || [] : [];
  const last = (id) => (chats[id] || []).slice(-1)[0];
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [msgs.length, room]);

  const push = (id, from, t) => setChats((c) => ({ ...c, [id]: [...(c[id] || []), { id: Date.now() + Math.random(), from, text: t, ts: Date.now() }] }));
  const send = (e) => {
    e.preventDefault();
    const t = text.trim(); if (!t || !cur) return;
    push(cur.id, ME, t); setText('');
    const who = cur.members[Math.floor(Math.random() * cur.members.length)];
    if (who) setTimeout(() => push(cur.id, who, '네 확인했어요 👍'), 900);   // 시연용 자동 답장
  };

  if (cur) {
    return (
      <div>
        <div className="row" style={{ marginBottom: 10 }}><button className="btn" onClick={() => setRoom(null)}>← 목록</button><b>{cur.name}</b><span style={{ width: 56 }} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 70 }}>
          {msgs.length === 0 && <div className="mute" style={{ textAlign: 'center', margin: '20px 0' }}>대화를 시작해 보세요.</div>}
          {msgs.map((m) => {
            const my = m.from === ME;
            return (
              <div key={m.id} style={{ alignSelf: my ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                {!my && cur.group && <div className="mute" style={{ fontSize: 12, marginBottom: 2 }}>{m.from}</div>}
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', flexDirection: my ? 'row-reverse' : 'row' }}>
                  <div style={{ padding: '8px 12px', borderRadius: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: my ? 'var(--ball)' : 'var(--card)', color: my ? 'var(--ballfg)' : 'var(--fg)', border: my ? 0 : '1px solid var(--line)' }}>{m.text}</div>
                  <span className="mute" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>{fmt(m.ts)}</span>
                </div>
              </div>);
          })}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} style={{ position: 'fixed', left: 0, right: 0, bottom: 'calc(50px + env(safe-area-inset-bottom))', background: 'var(--card)', borderTop: '1px solid var(--line)', zIndex: 12 }}>
          <div style={{ maxWidth: 560, margin: '0 auto', display: 'flex', gap: 8, padding: 8 }}>
            <input aria-label="메시지" value={text} onChange={(e) => setText(e.target.value)} placeholder="메시지 입력" style={{ margin: 0 }} />
            <button className="btn ball" type="submit" style={{ flex: 'none' }}>전송</button>
          </div>
        </form>
      </div>
    );
  }

  const row = (r) => { const l = last(r.id); return (
    <button key={r.id} className="card" onClick={() => setRoom(r.id)} style={{ width: '100%', textAlign: 'left', display: 'flex', gap: 12, alignItems: 'center', cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
      <span style={avatar}>{r.group ? '👥' : r.name[0]}</span>
      <span style={{ flex: 1, minWidth: 0 }}><b>{r.name}</b><div className="mute" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l ? l.text : '대화를 시작해 보세요'}</div></span>
      <span className="mute" style={{ fontSize: 12 }}>{l ? fmt(l.ts) : ''}</span>
    </button>); };
  return (
    <div>
      <h1>채팅</h1>
      {rooms.length === 0 && <div className="card mute">가입한 클럽이 없어요. 클럽에 가입하면 단체채팅과 개인채팅을 쓸 수 있어요.</div>}
      {groups.length > 0 && <div className="mute" style={{ margin: '8px 0' }}>클럽 단체채팅</div>}
      {groups.map(row)}
      {dms.length > 0 && <div className="mute" style={{ margin: '12px 0 8px' }}>개인채팅 (클럽 회원)</div>}
      {dms.map(row)}
    </div>
  );
}
