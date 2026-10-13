'use client';
import { useState } from 'react';
import { AREAS, COURTS, ME } from '../lib/data';
import { TIERS } from '../lib/rating';
import RankHelp from './RankHelp';
import TierIcon from './TierIcon';
import MatchDetail from './MatchDetail';

const TIMES = Array.from({ length: 34 }, (_, i) => { const m = 360 + i * 30; return String(Math.floor(m / 60)).padStart(2, '0') + (m % 60 ? ':30' : ':00'); });
const band = (t) => (t < '12' ? '오전' : t < '18' ? '오후' : '저녁');
const careerText = (c) => (c >= 10 ? '10년 이상' : `${c}년 이상`);
const tierOpts = TIERS.map((t, i) => [i, `${t.n.toFixed(1)} ${t.name}`]);
const nums = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

function CreateForm({ onSubmit, onClose, club }) {
  const courts = Object.keys(COURTS);
  const [f, setF] = useState({ court: courts[0], no: 1, date: '', time: '19:00', kind: '일반', format: '복식', gender: '무관', lo: 0, hi: 6, career: 1, fee: '', cap: 3, memo: '', public: true });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const sel = (k, opts) => <select value={f[k]} onChange={set(k)}>{opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>;
  const submit = () => {
    if (!f.date) { alert('날짜를 선택해 주세요'); return; }
    if (+f.lo > +f.hi) { alert('모집 등급 범위를 확인해 주세요'); return; }
    onSubmit({ ...f, no: +f.no, lo: +f.lo, hi: +f.hi, career: +f.career, cap: +f.cap, fee: +f.fee || 0 });
  };
  return (
    <div role="dialog" aria-modal="true" aria-label="매칭 만들기" style={{ position: 'fixed', inset: 0, background: 'var(--bg)', overflowY: 'auto', zIndex: 20, padding: 'calc(16px + env(safe-area-inset-top)) 16px 40px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="row"><h1>매칭 만들기</h1><button className="btn" onClick={onClose}>닫기</button></div>
        <div className="card">
          <label>테니스코트</label>{sel('court', courts.map((c) => [c, c]))}
          <label>코트 번호</label>{sel('no', nums(1, COURTS[f.court].n).map((v) => [v, `${v}번 코트`]))}
          <div className="grid2">
            <div><label>날짜</label><input type="date" value={f.date} onChange={set('date')} /></div>
            <div><label>시간</label>{sel('time', TIMES.map((t) => [t, t]))}</div>
            <div><label>일반 / 랭크</label>{sel('kind', [['일반', '일반'], ['랭크', '랭크']])}</div>
            <div><label>단식 / 복식</label>{sel('format', [['단식', '단식'], ['복식', '복식'], ['단복식', '단복식']])}</div>
            <div><label>성별</label>{sel('gender', [['무관', '무관'], ['남', '남'], ['여', '여']])}</div>
            <div><label>구력</label>{sel('career', nums(1, 10).map((v) => [v, careerText(v)]))}</div>
            <div><label>모집등급 (최소)</label>{sel('lo', tierOpts)}</div>
            <div><label>모집등급 (최대)</label>{sel('hi', tierOpts)}</div>
            <div><label>참가비 (원)</label><input type="number" inputMode="numeric" min="0" value={f.fee} onChange={set('fee')} placeholder="0" /></div>
            <div><label>모집인원 (호스트 제외)</label>{sel('cap', nums(1, 8).map((v) => [v, String(v)]))}</div>
          </div>
          <label>매칭 메모 ({f.memo.length}/100)</label>
          <textarea value={f.memo} maxLength={100} rows={3} onChange={set('memo')} placeholder="자유롭게 적어 주세요"
            style={{ width: '100%', font: 'inherit', padding: 10, border: '1px solid var(--line)', borderRadius: 10, background: 'var(--bg)', color: 'var(--fg)', marginBottom: 10 }} />
          {club && <label style={{ display: 'block', color: 'var(--fg)', fontSize: 14, marginBottom: 10 }}><input type="checkbox" style={{ width: 'auto', margin: '0 6px 0 0' }} checked={f.public} onChange={(e) => setF({ ...f, public: e.target.checked })} />공개 (일반/랭크 매칭 목록에도 표시)</label>}
          <button className="btn ball" style={{ width: '100%' }} onClick={submit}>완료</button>
        </div>
      </div>
    </div>
  );
}

export default function Matches({ me, setMe, posts, setPosts, clubId }) {
  const [q, setQ] = useState(''), [kind, setKind] = useState(''), [date, setDate] = useState('');
  const [time, setTime] = useState(''), [area, setArea] = useState(''), [help, setHelp] = useState(false);
  const [creating, setCreating] = useState(false), [openId, setOpenId] = useState(null);
  const open = posts.find((p) => p.id === openId);
  if (open) return <MatchDetail post={open} me={me} setMe={setMe} setPosts={setPosts} onBack={() => setOpenId(null)} />;

  const list = posts.filter((p) => { const c = COURTS[p.court];
    return (clubId ? p.clubId === clubId : !p.clubId || p.public) && (!q || (p.court + c.addr).includes(q)) && (!kind || p.kind === kind) && (!date || p.date === date) && (!time || band(p.time) === time) && (!area || c.area === area); });
  const apply = (p) => setPosts(posts.map((x) => (x.id === p.id ? { ...x, waiting: [...x.waiting, { name: ME, tier: me.tier }] } : x)));
  const create = (d) => { setPosts([{ ...d, clubId: clubId || null, id: Date.now(), host: { name: ME, tier: me.tier }, waiting: [], accepted: [], result: null, evals: {}, recvDemo: false }, ...posts]); setCreating(false); };

  return (
    <div>
      <h1>{clubId ? '정모 매칭' : '일반 / 랭크 매칭'}</h1>
      <input placeholder="검색 (코트명, 주소)" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid2">
        <select value={kind} onChange={(e) => setKind(e.target.value)}><option value="">일반/랭크 전체</option><option>일반</option><option>랭크</option></select>
        <select value={area} onChange={(e) => setArea(e.target.value)}><option value="">지역 전체</option>{AREAS.map((a) => <option key={a}>{a}</option>)}</select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <select value={time} onChange={(e) => setTime(e.target.value)}><option value="">시간 전체</option><option>오전</option><option>오후</option><option>저녁</option></select>
      </div>
      <button className="btn ball" aria-expanded={help} onClick={() => setHelp(!help)}>랭크 설명 {help ? '닫기' : '보기'}</button>
      {help && <RankHelp />}
      <div style={{ marginTop: 12 }}>
        {list.length === 0 && <div className="card mute">조건에 맞는 매칭이 없어요.</div>}
        {list.map((p) => {
          const isHost = p.host.name === ME, acc = p.accepted.some((a) => a.name === ME), wait = p.waiting.some((a) => a.name === ME);
          const full = p.accepted.length >= p.cap, inRange = me.tier >= p.lo && me.tier <= p.hi, blocked = p.kind === '랭크' && !inRange;
          let btn;
          if (isHost) btn = <span className="tag ball">내 매칭</span>;
          else if (acc) btn = <span className="tag ball">참가 확정</span>;
          else if (wait) btn = <span className="tag">대기 중</span>;
          else btn = <button className="btn" disabled={full || blocked} onClick={(e) => { e.stopPropagation(); apply(p); }}>{full ? '마감' : blocked ? '등급 범위 밖' : '참가 신청'}</button>;
          return (
            <div className="card" key={p.id} role="button" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => setOpenId(p.id)} onKeyDown={(e) => e.key === 'Enter' && setOpenId(p.id)}>
              <div className="row"><b>{p.court} {p.no}번 코트</b><span className={p.kind === '랭크' ? 'tag ball' : 'tag'}>{p.kind}</span></div>
              <div className="mute">{COURTS[p.court].addr}</div>
              <div style={{ margin: '4px 0' }}>{p.date} {p.time} · {p.format} · 성별 {p.gender}</div>
              <div className="mute">등급 {TIERS[p.lo].n.toFixed(1)}~{TIERS[p.hi].n.toFixed(1)} · 구력 {careerText(p.career)} · 참가비 {p.fee.toLocaleString()}원</div>
              <div className="row" style={{ marginTop: 10 }}>
                <span><TierIcon tier={p.host.tier} /> {p.host.name} <span className="mute">· {p.accepted.length}/{p.cap}명 확정 · 대기 {p.waiting.length}</span></span>
                {btn}
              </div>
            </div>
          );
        })}
      </div>
      <button aria-label="매칭 만들기" onClick={() => setCreating(true)}
        style={{ position: 'fixed', right: 16, bottom: 'calc(84px + env(safe-area-inset-bottom))', width: 56, height: 56, borderRadius: '50%', border: 0, background: 'var(--ball)', color: 'var(--ballfg)', fontSize: 32, lineHeight: 1, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,.3)', zIndex: 10 }}>+</button>
      {creating && <CreateForm onSubmit={create} onClose={() => setCreating(false)} club={!!clubId} />}
    </div>
  );
}
