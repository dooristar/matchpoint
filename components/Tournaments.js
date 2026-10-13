'use client';
import { useState } from 'react';
import { AREAS, COURTS, ME, NAMES } from '../lib/data';
import { TIERS } from '../lib/rating';
import { makeSlots, buildRounds } from '../lib/tournaments';
import TierIcon from './TierIcon';

const pad = (n) => String(n).padStart(2, '0');
const nowStr = () => { const n = new Date(); return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`; };
const tierOf = (s) => Math.min(6, Math.floor(s / 100));
const status = (t) => { const d = nowStr(); return t.participants.length >= t.cap ? '마감' : d < t.regStart ? '접수예정' : d > t.regEnd ? '접수마감' : '접수중'; };
const METHODS = [['random', '올랜덤'], ['seedRandom', '시드 배정 후 랜덤'], ['rank', '랭크점수 시드·배정']];
const mLabel = Object.fromEntries(METHODS);

function Calendar({ y, m, setYM, sel, setSel, marks }) {
  const first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const go = (d) => { const x = new Date(y, m + d, 1); setYM([x.getFullYear(), x.getMonth()]); setSel(''); };
  return (
    <div className="card">
      <div className="row" style={{ marginBottom: 8 }}>
        <button className="btn" aria-label="이전 달" onClick={() => go(-1)}>‹</button>
        <b>{y}년 {m + 1}월</b>
        <button className="btn" aria-label="다음 달" onClick={() => go(1)}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
        {['일', '월', '화', '수', '목', '금', '토'].map((w) => <div key={w} className="mute" style={{ fontSize: 12 }}>{w}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = `${y}-${pad(m + 1)}-${pad(d)}`, on = sel === key;
          return (
            <button key={i} type="button" aria-pressed={on} aria-label={`${m + 1}월 ${d}일${marks.has(key) ? ', 대회 있음' : ''}`} onClick={() => setSel(on ? '' : key)}
              style={{ aspectRatio: '1', border: 0, borderRadius: 10, cursor: 'pointer', font: 'inherit', fontSize: 14, background: on ? 'var(--court)' : 'transparent', color: on ? '#fff' : 'var(--fg)', padding: 0 }}>
              {d}
              <span style={{ display: 'block', width: 6, height: 6, borderRadius: '50%', margin: '1px auto 0', background: marks.has(key) ? (on ? 'var(--ball)' : 'var(--court)') : 'transparent' }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

const TeamLine = ({ x }) => (
  <div style={{ padding: '4px 0', fontSize: 13, whiteSpace: 'nowrap' }}>
    {x === null ? <span className="mute">부전승</span> : x === undefined ? <span className="mute">승자 미정</span> : <span>{x.seed ? <b>({x.seed}) </b> : null}{x.name}</span>}
  </div>
);

function Detail({ t, me, setTours, onBack }) {
  const [tab, setTab] = useState('요강'), [pn, setPn] = useState(''), [pt, setPt] = useState(2), [method, setMethod] = useState('rank');
  const upd = (fn) => setTours((ts) => ts.map((x) => (x.id === t.id ? fn(x) : x)));
  const isHost = t.host === ME, mine = t.participants.some((p) => p.id === 'me'), st = status(t);
  const my = me.tier * 100 + me.pts;
  const apply = () => {
    let name = ME, score = my;
    if (t.format !== '단식') { if (!pn.trim()) { alert('파트너 이름을 입력해 주세요'); return; } name = `${ME} / ${pn.trim()}`; score = Math.round((my + pt * 100 + 50) / 2); }
    upd((x) => ({ ...x, participants: [...x.participants, { id: 'me', name, score }] }));
  };
  const demoTeam = () => {
    const pick = () => NAMES[Math.floor(Math.random() * NAMES.length)], n = t.participants.length + 1;
    const name = t.format === '단식' ? `${pick()}${n}` : `${pick()}${n} / ${pick()}`;
    upd((x) => ({ ...x, participants: [...x.participants, { id: 'd' + Date.now(), name, score: 100 + Math.floor(Math.random() * 400) }] }));
  };
  const ranked = [...t.participants].sort((a, b) => b.score - a.score);
  const info = [['모집팀수', `${t.participants.length} / ${t.cap}팀`], ['대회일시', `${t.date} ${t.time}`], ['장소', t.place], ['접수일시', `${t.regStart} ~ ${t.regEnd}`], ['게임방법', t.format], ['참가비', `${t.fee.toLocaleString()}원`], ['시상', t.prize]];
  const rounds = t.bracket ? buildRounds(t.bracket.slots) : [];

  return (
    <div>
      <button className="btn" onClick={onBack}>← 목록</button>
      <h1 style={{ marginTop: 12 }}>{t.name}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 10 }}>
        {['요강', '참가자', '대진표'].map((k) => <button key={k} className={'btn' + (tab === k ? ' ball' : '')} aria-pressed={tab === k} onClick={() => setTab(k)}>{k === '요강' ? '대회요강' : k === '참가자' ? '참가자목록' : '대진표'}</button>)}
      </div>

      {tab === '요강' && (
        <div className="card">
          {info.map(([k, v]) => <div className="row" key={k} style={{ padding: '6px 0', alignItems: 'flex-start' }}><span className="mute" style={{ flex: 'none' }}>{k}</span><span style={{ textAlign: 'right' }}>{v}</span></div>)}
          <div className="row" style={{ marginTop: 8 }}><span className={st === '접수중' ? 'tag ball' : 'tag'}>{st}</span></div>
        </div>
      )}

      {tab === '참가자' && (
        <div>
          <div className="card">
            <b>참가팀 ({t.participants.length}/{t.cap}) <span className="mute">· 랭크점수순</span></b>
            <div style={{ marginTop: 8 }}>
              {ranked.length === 0 && <div className="mute">아직 참가팀이 없어요.</div>}
              {ranked.map((p, i) => (
                <div className="row" key={p.id} style={{ marginBottom: 6 }}>
                  <span><span className="mute">{i + 1}.</span> <TierIcon tier={tierOf(p.score)} /> <b>{p.name}</b></span>
                  <span className="mute">{TIERS[tierOf(p.score)].name} {p.score % 100}점</span>
                </div>
              ))}
            </div>
          </div>
          {!isHost && !mine && (
            <div className="card">
              {t.format !== '단식' && <div className="grid2"><div><label>파트너 이름</label><input value={pn} onChange={(e) => setPn(e.target.value)} placeholder="예) 지현" /></div>
                <div><label>파트너 등급</label><select value={pt} onChange={(e) => setPt(+e.target.value)}>{TIERS.map((x, i) => <option key={i} value={i}>{x.n.toFixed(1)} {x.name}</option>)}</select></div></div>}
              <button className="btn ball" disabled={st !== '접수중' || !!t.bracket} onClick={apply}>{t.bracket ? '대진표 확정됨' : st === '접수중' ? '참가 신청' : st}</button>
            </div>
          )}
          {mine && <div className="card row"><span className="tag ball">참가 신청 완료</span><button className="btn" disabled={!!t.bracket} onClick={() => upd((x) => ({ ...x, participants: x.participants.filter((p) => p.id !== 'me') }))}>신청 취소</button></div>}
          {isHost && <button className="btn" disabled={t.participants.length >= t.cap || !!t.bracket} onClick={demoTeam}>(시연) 참가팀 추가</button>}
        </div>
      )}

      {tab === '대진표' && (
        <div>
          {isHost && (
            <div className="card">
              <b>대진표 방식 (호스트)</b>
              <div style={{ margin: '8px 0' }}>{METHODS.map(([k, v]) => (
                <label key={k} style={{ display: 'block', color: 'var(--fg)', fontSize: 14, padding: '3px 0' }}><input type="radio" name="bm" style={{ width: 'auto', margin: '0 6px 0 0' }} checked={method === k} onChange={() => setMethod(k)} />{v}</label>))}</div>
              <div className="row">
                <button className="btn ball" disabled={t.participants.length < 2} onClick={() => upd((x) => ({ ...x, bracket: { method, slots: makeSlots(x.participants, method) } }))}>{t.bracket ? '다시 생성' : '대진표 생성'}</button>
                {t.bracket && <button className="btn" onClick={() => upd((x) => ({ ...x, bracket: null }))}>초기화</button>}
              </div>
              {t.participants.length < 2 && <div className="mute" style={{ marginTop: 6 }}>참가팀이 2팀 이상이어야 해요.</div>}
            </div>
          )}
          {!t.bracket && !isHost && <div className="card mute">호스트가 대진표를 확정하면 표시돼요.</div>}
          {t.bracket && (
            <div className="card">
              <div className="mute" style={{ marginBottom: 8 }}>배정 방식: {mLabel[t.bracket.method]} · ({'{'}번호{'}'}는 시드)</div>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                {rounds.map((r, ri) => (
                  <div key={ri} style={{ minWidth: 150, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: 8 }}>
                    <b style={{ fontSize: 13 }}>{r.length === 1 ? '결승' : r.length === 2 ? '4강' : `${r.length * 2}강`}</b>
                    {r.map(([a, b], mi) => (
                      <div key={mi} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '2px 8px', background: 'var(--bg)' }}><TeamLine x={a} /><div style={{ borderTop: '1px solid var(--line)' }} /><TeamLine x={b} /></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TIMES = Array.from({ length: 17 }, (_, i) => `${pad(6 + i)}:00`);
const FAB = { position: 'fixed', right: 16, bottom: 'calc(84px + env(safe-area-inset-bottom))', width: 56, height: 56, borderRadius: '50%', border: 0, background: 'var(--ball)', color: 'var(--ballfg)', fontSize: 32, lineHeight: 1, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,.3)', zIndex: 10 };

function CreateTour({ club, onSubmit, onClose }) {
  const [f, setF] = useState({ name: '', place: club.court, date: '', time: '09:00', regStart: '', regEnd: '', format: '복식', cap: 8, fee: '', prize: '', public: true });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const opt = (arr) => arr.map((v) => <option key={v} value={v}>{v}</option>);
  const submit = () => {
    if (!f.name.trim() || !f.date || !f.regStart || !f.regEnd) { alert('대회명, 대회일, 접수 기간을 입력해 주세요'); return; }
    if (f.regStart > f.regEnd || f.regEnd > f.date) { alert('접수 기간과 대회일을 확인해 주세요'); return; }
    onSubmit({ ...f, name: f.name.trim(), area: (COURTS[f.place] || {}).area || club.area, cap: +f.cap, fee: +f.fee || 0 });
  };
  return (
    <div role="dialog" aria-modal="true" aria-label="월례대회 만들기" style={{ position: 'fixed', inset: 0, background: 'var(--bg)', overflowY: 'auto', zIndex: 20, padding: 'calc(16px + env(safe-area-inset-top)) 16px 40px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="row"><h1>월례대회 만들기</h1><button className="btn" onClick={onClose}>닫기</button></div>
        <div className="card">
          <label>대회명</label><input value={f.name} onChange={set('name')} />
          <label>장소</label><select value={f.place} onChange={set('place')}>{opt(Object.keys(COURTS))}</select>
          <div className="grid2">
            <div><label>대회일</label><input type="date" value={f.date} onChange={set('date')} /></div>
            <div><label>시간</label><select value={f.time} onChange={set('time')}>{opt(TIMES)}</select></div>
            <div><label>접수 시작</label><input type="date" value={f.regStart} onChange={set('regStart')} /></div>
            <div><label>접수 마감</label><input type="date" value={f.regEnd} onChange={set('regEnd')} /></div>
            <div><label>게임방법</label><select value={f.format} onChange={set('format')}>{opt(['단식', '복식', '혼합복식'])}</select></div>
            <div><label>모집팀수</label><select value={f.cap} onChange={set('cap')}>{opt([4, 8, 16, 32])}</select></div>
          </div>
          <label>참가비 (원)</label><input type="number" inputMode="numeric" min="0" value={f.fee} onChange={set('fee')} placeholder="0" />
          <label>시상</label><input value={f.prize} onChange={set('prize')} placeholder="예) 우승 상품권, 준우승 음료권" />
          <label style={{ display: 'block', color: 'var(--fg)', fontSize: 14, margin: '4px 0 10px' }}><input type="checkbox" style={{ width: 'auto', margin: '0 6px 0 0' }} checked={f.public} onChange={(e) => setF({ ...f, public: e.target.checked })} />공개 (대회 메뉴·클럽교류전에도 표시)</label>
          <button className="btn ball" style={{ width: '100%' }} onClick={submit}>완료</button>
        </div>
      </div>
    </div>
  );
}

export default function Tournaments({ tours, setTours, me, clubId, club, exchange }) {
  const [area, setArea] = useState(''), [ym, setYM] = useState([2026, 9]), [sel, setSel] = useState('');
  const [q, setQ] = useState(''), [fmt, setFmt] = useState(''), [st, setSt] = useState(''), [openId, setOpenId] = useState(null), [creating, setCreating] = useState(false);
  const open = tours.find((t) => t.id === openId);
  if (open) return <Detail t={open} me={me} setTours={setTours} onBack={() => setOpenId(null)} />;

  const [y, m] = ym, prefix = `${y}-${pad(m + 1)}`;
  const noCal = !!clubId || !!exchange;
  const scope = (t) => (clubId ? t.clubId === clubId : exchange ? t.clubId && t.public : !t.clubId || t.public);
  const inArea = tours.filter((t) => scope(t) && (!area || t.area === area));
  const marks = new Set(inArea.map((t) => t.date));
  const list = inArea.filter((t) => (sel ? t.date === sel : noCal || t.date.startsWith(prefix)) && (!q || (t.name + t.place).includes(q)) && (!fmt || t.format === fmt) && (!st || status(t) === st)).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <h1>{clubId ? '월례대회' : exchange ? '클럽교류전' : '대회'}</h1>
      <select aria-label="지역" value={area} onChange={(e) => setArea(e.target.value)}><option value="">지역 전체</option>{AREAS.map((a) => <option key={a}>{a}</option>)}</select>
      {noCal ? <input type="date" aria-label="날짜" value={sel} onChange={(e) => setSel(e.target.value)} /> : <Calendar y={y} m={m} setYM={setYM} sel={sel} setSel={setSel} marks={marks} />}
      <input placeholder="대회 검색 (대회명, 장소)" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid2">
        <select value={fmt} onChange={(e) => setFmt(e.target.value)}><option value="">게임방법 전체</option><option>단식</option><option>복식</option><option>혼합복식</option></select>
        <select value={st} onChange={(e) => setSt(e.target.value)}><option value="">접수상태 전체</option><option>접수중</option><option>접수예정</option><option>접수마감</option><option>마감</option></select>
      </div>
      <div className="mute" style={{ margin: '6px 0' }}>{sel ? `${sel} 대회` : noCal ? '전체 대회' : `${y}년 ${m + 1}월 대회`} {list.length}건 {sel && <button className="btn" style={{ padding: '2px 8px', marginLeft: 6 }} onClick={() => setSel('')}>날짜 해제</button>}</div>
      {list.length === 0 && <div className="card mute">조건에 맞는 대회가 없어요.</div>}
      {list.map((t) => (
        <div className="card" key={t.id} role="button" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => setOpenId(t.id)} onKeyDown={(e) => e.key === 'Enter' && setOpenId(t.id)}>
          <div className="row"><b>{t.name}</b><span className={status(t) === '접수중' ? 'tag ball' : 'tag'}>{status(t)}</span></div>
          <div className="mute">{t.place} · {t.area}</div>
          <div style={{ margin: '4px 0' }}>{t.date} {t.time} · {t.format}</div>
          <div className="mute">참가비 {t.fee.toLocaleString()}원 · {t.participants.length}/{t.cap}팀</div>
        </div>
      ))}
      {clubId && club && club.admin === ME && (
        <>
          <button aria-label="월례대회 만들기" onClick={() => setCreating(true)} style={FAB}>+</button>
          {creating && <CreateTour club={club} onClose={() => setCreating(false)} onSubmit={(t) => { setTours([{ ...t, id: 't' + Date.now(), host: ME, clubId, participants: [], bracket: null }, ...tours]); setCreating(false); }} />}
        </>
      )}
    </div>
  );
}
