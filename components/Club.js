'use client';
import { useState } from 'react';
import { AREAS, COURTS, ME } from '../lib/data';
import { ntrp } from '../lib/rating';
import Matches from './Matches';

const pad = (n) => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const quarter = (s) => Math.floor((+s.slice(5, 7) - 1) / 3) + 1;
const SUBS = ['클럽프로필', '공지', '정모매칭', '월례대회', '클럽랭킹', '회비', '사진첩'];
const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const NTRPS = [2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
const tally = (club, pred) => {
  const m = Object.fromEntries(club.members.map((x) => [x.name, 0]));
  club.rankLog.filter(pred).forEach((l) => { const r = club.rankRules.find((x) => x.id === l.ruleId); if (r) m[l.member] = (m[l.member] || 0) + r.pts; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
};
const area = { width: '100%', font: 'inherit', padding: 10, border: '1px solid var(--line)', borderRadius: 10, background: 'var(--bg)', color: 'var(--fg)', margin: '4px 0 8px' };

function AddLine({ label, onAdd }) {
  const [o, setO] = useState(false), [v, setV] = useState('');
  if (!o) return <button className="btn" onClick={() => setO(true)}>＋ {label}</button>;
  return (
    <div className="row" style={{ gap: 6 }}>
      <input aria-label={label} value={v} onChange={(e) => setV(e.target.value)} placeholder={label} style={{ margin: 0 }} />
      <button className="btn" onClick={() => { if (v.trim()) { onAdd(v.trim()); setV(''); setO(false); } }}>저장</button>
    </div>
  );
}

function Info({ club, upd, admin, me }) {
  const [add, setAdd] = useState(false), [f, setF] = useState({ name: '', birth: '', career: '', ntrp: 3.0, joined: today().slice(0, 7) });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const yr = tally(club, (l) => l.date.startsWith(today().slice(0, 4))), rankOf = Object.fromEntries(yr.map(([n], i) => [n, i + 1]));
  const addMember = () => { if (!f.name.trim()) { alert('이름을 입력해 주세요'); return; } upd((c) => ({ ...c, members: [...c.members, { ...f, name: f.name.trim(), ntrp: +f.ntrp }] })); setAdd(false); setF({ ...f, name: '', birth: '', career: '' }); };
  return (
    <div>
      <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div className="photo" style={{ width: 'min(130px, 34vw)', height: 'auto', aspectRatio: '1' }}>사진</div>
        <div style={{ flex: 1, minWidth: 0, fontSize: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 900 }}>{club.name}</div>
          <div style={{ margin: '4px 0' }}>{club.intro}</div>
          <div><span className="mute">주코트 </span>{admin ? <select value={club.court} onChange={(e) => upd((c) => ({ ...c, court: e.target.value }))} style={{ width: 'auto', margin: 0 }}>{Object.keys(COURTS).map((c) => <option key={c}>{c}</option>)}</select> : club.court}</div>
          <div style={{ margin: '4px 0' }}><span className="mute">정모요일 </span>{admin ? <select value={club.meetDay} onChange={(e) => upd((c) => ({ ...c, meetDay: e.target.value }))} style={{ width: 'auto', margin: 0 }}>{DAYS.map((d) => <option key={d}>{d}</option>)}</select> : club.meetDay}요일</div>
          <div><span className="mute">회원 </span>{club.members.map((m) => m.name).join(', ')}</div>
        </div>
      </div>
      <div className="card"><b>업적</b>
        <ul style={{ margin: '6px 0', paddingLeft: 18 }}>{club.achievements.length ? club.achievements.map((a) => <li key={a}>🏆 {a}</li>) : <li className="mute" style={{ listStyle: 'none', marginLeft: -18 }}>아직 없어요</li>}</ul>
        {admin && <AddLine label="업적 추가" onAdd={(v) => upd((c) => ({ ...c, achievements: [...c.achievements, v] }))} />}
      </div>
      <div className="card"><b>클럽회칙</b>
        <ol style={{ margin: '6px 0', paddingLeft: 20 }}>{club.rules.length ? club.rules.map((r) => <li key={r}>{r}</li>) : <li className="mute" style={{ listStyle: 'none', marginLeft: -20 }}>등록된 회칙이 없어요</li>}</ol>
        {admin && <AddLine label="회칙 추가" onAdd={(v) => upd((c) => ({ ...c, rules: [...c.rules, v] }))} />}
      </div>
      <div className="card"><b>회원정보 ({club.members.length}명)</b>
        <div style={{ overflowX: 'auto', marginTop: 8 }}>
          <table style={{ whiteSpace: 'nowrap' }}>
            <thead><tr>{['이름', '생년', '구력', 'NTRP', '클럽랭킹', '가입년월'].map((h) => <th key={h} className="mute" style={{ fontWeight: 400 }}>{h}</th>)}</tr></thead>
            <tbody>{club.members.map((m) => (
              <tr key={m.name}><td><b>{m.name}</b></td><td>{m.birth}</td><td>{m.career}{m.career !== '-' && '년'}</td><td>{(m.name === ME ? ntrp(me.tier, me.pts) : +m.ntrp).toFixed(1)}</td><td>{rankOf[m.name]}위</td><td>{m.joined}</td></tr>))}</tbody>
          </table>
        </div>
        {admin && !add && <button className="btn" style={{ marginTop: 10 }} onClick={() => setAdd(true)}>＋ 회원 추가</button>}
        {admin && add && (
          <div style={{ marginTop: 10 }}>
            <div className="grid2">
              <div><label>이름</label><input value={f.name} onChange={set('name')} /></div>
              <div><label>생년</label><input inputMode="numeric" maxLength={4} value={f.birth} onChange={set('birth')} placeholder="1990" /></div>
              <div><label>구력(년)</label><input inputMode="numeric" value={f.career} onChange={set('career')} /></div>
              <div><label>NTRP</label><select value={f.ntrp} onChange={set('ntrp')}>{NTRPS.map((n) => <option key={n} value={n}>{n.toFixed(1)}</option>)}</select></div>
            </div>
            <label>가입년월</label><input type="month" value={f.joined} onChange={set('joined')} />
            <div className="row"><button className="btn" onClick={() => setAdd(false)}>취소</button><button className="btn ball" onClick={addMember}>추가</button></div>
          </div>)}
      </div>
    </div>
  );
}

function Notices({ club, upd, isMember }) {
  const [w, setW] = useState(false), [t, setT] = useState(''), [b, setB] = useState(''), [open, setOpen] = useState(null);
  const post = () => { if (!t.trim()) return; upd((c) => ({ ...c, notices: [{ id: Date.now(), title: t.trim(), body: b.trim(), date: today(), author: ME }, ...c.notices] })); setT(''); setB(''); setW(false); };
  return (
    <div>
      {club.notices.length === 0 && <div className="card mute">등록된 공지가 없어요.</div>}
      {club.notices.map((n) => (
        <div className="card" key={n.id} role="button" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => setOpen(open === n.id ? null : n.id)} onKeyDown={(e) => e.key === 'Enter' && setOpen(open === n.id ? null : n.id)}>
          <div className="row"><b>{n.title}</b><span className="mute">{n.date}</span></div>
          <div className="mute">{n.author}</div>
          {open === n.id && <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{n.body || '(내용 없음)'}</div>}
        </div>))}
      {w ? (
        <div className="card"><label>제목</label><input value={t} onChange={(e) => setT(e.target.value)} /><label>내용</label><textarea rows={4} value={b} onChange={(e) => setB(e.target.value)} style={area} />
          <div className="row"><button className="btn" onClick={() => setW(false)}>취소</button><button className="btn ball" onClick={post}>등록</button></div></div>
      ) : isMember && <button className="btn ball" onClick={() => setW(true)}>글쓰기</button>}
    </div>
  );
}

function RankTab({ club, upd, admin }) {
  const y = today().slice(0, 4), [q, setQ] = useState(quarter(today()));
  const [mem, setMem] = useState(''), [rid, setRid] = useState(''), [rn, setRn] = useState(''), [rp, setRp] = useState(10);
  const season = tally(club, (l) => l.date.startsWith(y) && quarter(l.date) === q), year = tally(club, (l) => l.date.startsWith(y));
  const award = () => { const member = mem || club.members[0]?.name, ruleId = +rid || club.rankRules[0]?.id; if (!member || !ruleId) return; upd((c) => ({ ...c, rankLog: [...c.rankLog, { id: Date.now(), member, ruleId, date: today() }] })); };
  const addRule = () => { if (!rn.trim()) return; upd((c) => ({ ...c, rankRules: [...c.rankRules, { id: Date.now(), name: rn.trim(), pts: +rp }] })); setRn(''); };
  const medal = ['🥇', '🥈', '🥉'];
  return (
    <div>
      <div className="card"><b>점수 획득방법</b>
        {club.rankRules.map((r) => <div className="row" key={r.id} style={{ marginTop: 6 }}><span>{r.name}</span><b className="up">+{r.pts}</b></div>)}
        {admin && <div style={{ marginTop: 10 }}><div className="grid2"><input aria-label="방법 이름" placeholder="예) 월례대회 참가" value={rn} onChange={(e) => setRn(e.target.value)} style={{ margin: 0 }} />
          <select aria-label="점수" value={rp} onChange={(e) => setRp(e.target.value)} style={{ margin: 0 }}>{[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((n) => <option key={n} value={n}>+{n}점</option>)}</select></div>
          <button className="btn" style={{ marginTop: 8 }} onClick={addRule}>＋ 점수 방법 추가</button></div>}
      </div>
      {admin && club.rankRules.length > 0 && (
        <div className="card"><b>점수 부여</b>
          <div className="grid2" style={{ marginTop: 6 }}>
            <select aria-label="회원" value={mem} onChange={(e) => setMem(e.target.value)}>{club.members.map((m) => <option key={m.name}>{m.name}</option>)}</select>
            <select aria-label="방법" value={rid} onChange={(e) => setRid(e.target.value)}>{club.rankRules.map((r) => <option key={r.id} value={r.id}>{r.name} (+{r.pts})</option>)}</select>
          </div>
          <button className="btn ball" onClick={award}>점수 부여</button>
        </div>)}
      <div className="card"><div className="row"><b>시즌 랭킹 (분기)</b>
        <select aria-label="분기" value={q} onChange={(e) => setQ(+e.target.value)} style={{ width: 'auto', margin: 0 }}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{y}년 {n}분기</option>)}</select></div>
        {season.slice(0, 3).map(([n, p], i) => <div className="row" key={n} style={{ marginTop: 8 }}><span>{medal[i]} <b>{n}</b></span><b>{p}점</b></div>)}
        {season.every(([, p]) => p === 0) && <div className="mute" style={{ marginTop: 6 }}>이 분기에 쌓인 점수가 없어요.</div>}
      </div>
      <div className="card"><b>{y}년 MVP (4시즌 통합)</b>
        {year[0] && year[0][1] > 0 ? <div style={{ marginTop: 8, fontSize: 18 }}>👑 <b>{year[0][0]}</b> <span className="mute">{year[0][1]}점</span></div> : <div className="mute" style={{ marginTop: 6 }}>아직 없어요.</div>}
      </div>
    </div>
  );
}

function Fees({ club, upd, admin }) {
  const d = new Date(), months = Array.from({ length: 6 }, (_, i) => { const x = new Date(d.getFullYear(), d.getMonth() - 5 + i, 1); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}`; });
  const toggle = (mo, name) => { if (admin) upd((c) => { const cur = c.fees.paid[mo] || []; return { ...c, fees: { ...c.fees, paid: { ...c.fees.paid, [mo]: cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name] } } }; }); };
  const now = months[5], paid = (club.fees.paid[now] || []).length;
  return (
    <div className="card">
      <div className="row" style={{ flexWrap: 'wrap' }}><b>월회비 {club.fees.amount.toLocaleString()}원</b><span className="mute">{now} 납부 {paid}/{club.members.length}명 · {(paid * club.fees.amount).toLocaleString()}원</span></div>
      <div style={{ overflowX: 'auto', marginTop: 8 }}>
        <table style={{ whiteSpace: 'nowrap' }}>
          <thead><tr><th className="mute" style={{ fontWeight: 400 }}>이름</th>{months.map((mo) => <th key={mo} className="mute" style={{ fontWeight: 400 }}>{+mo.slice(5)}월</th>)}</tr></thead>
          <tbody>{club.members.map((m) => (
            <tr key={m.name}><td><b>{m.name}</b></td>{months.map((mo) => { const ok = (club.fees.paid[mo] || []).includes(m.name); return (
              <td key={mo}><button type="button" disabled={!admin} aria-label={`${m.name} ${mo} ${ok ? '납부' : '미납'}`} onClick={() => toggle(mo, m.name)} style={{ border: 0, background: 'none', font: 'inherit', cursor: admin ? 'pointer' : 'default', color: ok ? 'var(--win)' : 'var(--lose)', fontWeight: 700 }}>{ok ? '✓' : '–'}</button></td>); })}</tr>))}</tbody>
        </table>
      </div>
      {admin ? <div className="mute" style={{ marginTop: 6 }}>칸을 누르면 납부/미납이 바뀌어요.</div> : <div className="mute" style={{ marginTop: 6 }}>납부 처리는 운영진만 할 수 있어요.</div>}
    </div>
  );
}

function CreateClub({ onSubmit, onClose }) {
  const [f, setF] = useState({ name: '', intro: '', area: '서울', district: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <div role="dialog" aria-modal="true" aria-label="클럽 만들기" style={{ position: 'fixed', inset: 0, background: 'var(--bg)', overflowY: 'auto', zIndex: 20, padding: 'calc(16px + env(safe-area-inset-top)) 16px 40px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="row"><h1>클럽 만들기</h1><button className="btn" onClick={onClose}>닫기</button></div>
        <div className="card">
          <label>클럽명</label><input value={f.name} onChange={set('name')} />
          <label>클럽소개</label><textarea rows={4} value={f.intro} onChange={set('intro')} style={area} />
          <div className="grid2"><div><label>지역</label><select value={f.area} onChange={set('area')}>{AREAS.map((a) => <option key={a}>{a}</option>)}</select></div>
            <div><label>구/시</label><input value={f.district} onChange={set('district')} placeholder="예) 송파구" /></div></div>
          <button className="btn ball" style={{ width: '100%' }} onClick={() => { if (!f.name.trim()) { alert('클럽명을 입력해 주세요'); return; } onSubmit({ ...f, name: f.name.trim() }); }}>완료</button>
        </div>
      </div>
    </div>
  );
}

export default function Club({ me, setMe, clubs, setClubs, posts, setPosts }) {
  const [ar, setAr] = useState(''), [dist, setDist] = useState(''), [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null), [creating, setCreating] = useState(false), [sub, setSub] = useState('클럽프로필');
  const club = clubs.find((c) => c.id === openId);
  const upd = (fn) => setClubs((cs) => cs.map((c) => (c.id === openId ? fn(c) : c)));
  const ym = today().slice(0, 7), mine = (c) => c.members.some((m) => m.name === ME);
  const join = (c) => setClubs(clubs.map((x) => (x.id === c.id ? { ...x, members: [...x.members, { name: ME, birth: '-', career: '-', ntrp: ntrp(me.tier, me.pts), joined: ym }] } : x)));
  const create = (f) => { setClubs([{ id: 'c' + Date.now(), ...f, admin: ME, court: Object.keys(COURTS)[0], meetDay: '토', rules: [], achievements: [], members: [{ name: ME, birth: '-', career: '-', ntrp: ntrp(me.tier, me.pts), joined: ym }], notices: [], rankRules: [], rankLog: [], fees: { amount: 20000, paid: {} } }, ...clubs]); setCreating(false); };

  if (club) {
    const admin = club.admin === ME, isMember = mine(club);
    return (
      <div>
        <div className="row" style={{ marginBottom: 10 }}><button className="btn" onClick={() => { setOpenId(null); setSub('클럽프로필'); }}>← 클럽 목록</button><b>{club.name}</b></div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
          {SUBS.map((s) => <button key={s} className={'btn' + (sub === s ? ' ball' : '')} style={{ flex: 'none' }} aria-pressed={sub === s} onClick={() => setSub(s)}>{s}</button>)}
        </div>
        {sub === '클럽프로필' && <Info club={club} upd={upd} admin={admin} me={me} />}
        {sub === '공지' && <Notices club={club} upd={upd} isMember={isMember} />}
        {sub === '정모매칭' && <Matches me={me} setMe={setMe} posts={posts} setPosts={setPosts} clubId={club.id} />}
        {sub === '월례대회' && <div className="card"><span className="tag ball">다음 업데이트</span><p style={{ margin: '8px 0 0' }}>대회와 같은 규칙·대진표로 월례대회(교류전)를 만들 수 있게 연결할 예정이에요. 대회 만들기에는 공개여부 체크도 들어가요.</p></div>}
        {sub === '클럽랭킹' && <RankTab club={club} upd={upd} admin={admin} />}
        {sub === '회비' && <Fees club={club} upd={upd} admin={admin} />}
        {sub === '사진첩' && <div className="card"><span className="tag ball">개발 예정</span><p style={{ margin: '8px 0 0' }}>추후 업데이트</p></div>}
      </div>
    );
  }

  const list = clubs.filter((c) => (!ar || c.area === ar) && (!dist || c.district.includes(dist)) && (!q || (c.name + c.intro).includes(q)));
  return (
    <div>
      <h1>클럽 모집</h1>
      <div className="grid2">
        <select aria-label="지역" value={ar} onChange={(e) => setAr(e.target.value)}><option value="">지역 전체</option>{AREAS.map((a) => <option key={a}>{a}</option>)}</select>
        <input aria-label="구" placeholder="구/시 검색" value={dist} onChange={(e) => setDist(e.target.value)} />
      </div>
      <input placeholder="클럽 검색 (이름, 소개)" value={q} onChange={(e) => setQ(e.target.value)} />
      {list.length === 0 && <div className="card mute">조건에 맞는 클럽이 없어요.</div>}
      {list.map((c) => (
        <div className="card" key={c.id} role="button" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => setOpenId(c.id)} onKeyDown={(e) => e.key === 'Enter' && setOpenId(c.id)}>
          <div className="row"><b>{c.name}</b><span className="mute">{c.area} {c.district}</span></div>
          <div className="mute" style={{ margin: '4px 0' }}>{c.intro}</div>
          <div className="row"><span className="mute">회원 {c.members.length}명 · 주코트 {c.court} · 정모 {c.meetDay}요일</span>
            {mine(c) ? <span className="tag ball">가입됨</span> : <button className="btn" onClick={(e) => { e.stopPropagation(); join(c); }}>가입</button>}</div>
        </div>))}
      <button aria-label="클럽 만들기" onClick={() => setCreating(true)}
        style={{ position: 'fixed', right: 16, bottom: 'calc(84px + env(safe-area-inset-bottom))', width: 56, height: 56, borderRadius: '50%', border: 0, background: 'var(--ball)', color: 'var(--ballfg)', fontSize: 32, lineHeight: 1, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,.3)', zIndex: 10 }}>+</button>
      {creating && <CreateClub onSubmit={create} onClose={() => setCreating(false)} />}
    </div>
  );
}
