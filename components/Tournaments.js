'use client';
import { useState } from 'react';
import { AREAS, COURTS, ME, NAMES } from '../lib/data';
import { TIERS } from '../lib/rating';
import { makeSlots, buildRounds, computeStats, setsWon, winnerOf, playersOf } from '../lib/tournaments';
import TierIcon from './TierIcon';

const pad = (n) => String(n).padStart(2, '0');
const nowStr = () => { const n = new Date(); return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`; };
const nowTime = () => { const n = new Date(); return `${pad(n.getHours())}:${pad(n.getMinutes())}`; };
const tierOf = (s) => Math.min(6, Math.floor(s / 100));
const status = (t) => {
  const d = nowStr(), closed = d > t.regEnd || (d === t.regEnd && nowTime() > (t.regEndTime || '23:59'));
  return t.cap && t.participants.length >= t.cap ? '마감' : closed ? '접수마감' : '접수중';
};
const TIMES = Array.from({ length: 34 }, (_, i) => { const m = 360 + i * 30; return pad(Math.floor(m / 60)) + (m % 60 ? ':30' : ':00'); });
const M2 = [['random', '올랜덤'], ['rank', '랭킹 시드배정'], ['ntrp', 'NTRP배정'], ['manual', '운영진 자유배정']];
const M2L = Object.fromEntries(M2);
const FAB = { position: 'fixed', right: 16, bottom: 'calc(84px + env(safe-area-inset-bottom))', width: 56, height: 56, borderRadius: '50%', border: 0, background: 'var(--ball)', color: 'var(--ballfg)', fontSize: 32, lineHeight: 1, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,.3)', zIndex: 10 };
const chk = { display: 'block', color: 'var(--fg)', fontSize: 14, padding: '3px 0' };
const cbx = { width: 'auto', margin: '0 6px 0 0' };
const sel = { width: '100%', font: 'inherit', padding: 10, border: '1px solid var(--line)', borderRadius: 10, background: 'var(--bg)', color: 'var(--fg)', margin: '4px 0 8px' };

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

const TeamLine = ({ x, sc, win }) => (
  <div className="row" style={{ padding: '4px 0', fontSize: 13, whiteSpace: 'nowrap', gap: 8 }}>
    {x === null ? <span className="mute">부전승</span> : x === undefined ? <span className="mute">승자 미정</span> : <span style={{ fontWeight: win ? 700 : 400 }}>{x.seed ? <b>({x.seed}) </b> : null}{x.name}</span>}
    {sc ? <b>{sc}</b> : null}
  </div>
);

function CreateTour({ club, onSubmit, onClose }) {
  const [f, setF] = useState({ name: '', area: club.area || '서울', dq: '', place: '', date: '', time: '09:00', endTime: '12:00', regEnd: '', regEndTime: '23:00', gameType: '토너먼트', format: '복식', fee: '', notice: '', prize: '', pubExchange: true, pubMatch: false });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const districts = [...new Set(Object.values(COURTS).filter((c) => c.area === f.area).map((c) => c.district))];
  const courts = Object.entries(COURTS).filter(([, c]) => c.area === f.area && (!f.dq || c.district.includes(f.dq)));
  const place = courts.some(([n]) => n === f.place) ? f.place : (courts[0] || [''])[0];
  const opt = (arr) => arr.map((v) => <option key={v} value={v}>{v}</option>);
  const submit = () => {
    if (!f.name.trim() || !place || !f.date || !f.regEnd) { alert('대회명, 장소, 대회일, 접수마감을 입력해 주세요'); return; }
    if (f.regEnd > f.date) { alert('접수마감은 대회일 이전이어야 해요'); return; }
    if (f.endTime <= f.time) { alert('끝나는 시간은 시작 시간보다 늦어야 해요'); return; }
    onSubmit({ ...f, name: f.name.trim(), place, district: COURTS[place].district, fee: +f.fee || 0 });
  };
  return (
    <div role="dialog" aria-modal="true" aria-label="월례대회 만들기" style={{ position: 'fixed', inset: 0, background: 'var(--bg)', overflowY: 'auto', zIndex: 20, padding: 'calc(16px + env(safe-area-inset-top)) 16px 40px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="row"><h1>월례대회 만들기</h1><button className="btn" onClick={onClose}>닫기</button></div>
        <div className="card">
          <label>대회명</label><input value={f.name} onChange={set('name')} />
          <div className="grid2">
            <div><label>장소 지역</label><select value={f.area} onChange={(e) => setF({ ...f, area: e.target.value, dq: '', place: '' })}>{opt(AREAS)}</select></div>
            <div><label>구/시 검색</label><input list="dq-list" value={f.dq} onChange={set('dq')} placeholder="예) 송파구" /><datalist id="dq-list">{districts.map((x) => <option key={x} value={x} />)}</datalist></div>
          </div>
          <label>코트 선택</label>
          <select value={place} onChange={set('place')}>{courts.length === 0 ? <option value="">검색 결과가 없어요</option> : courts.map(([n, c]) => <option key={n} value={n}>{n} ({c.district})</option>)}</select>
          <div className="grid2">
            <div><label>대회일</label><input type="date" value={f.date} onChange={set('date')} /></div>
            <div />
            <div><label>시작 시간</label><select value={f.time} onChange={set('time')}>{opt(TIMES)}</select></div>
            <div><label>끝나는 시간</label><select value={f.endTime} onChange={set('endTime')}>{opt(TIMES)}</select></div>
            <div><label>접수마감 날짜</label><input type="date" value={f.regEnd} onChange={set('regEnd')} /></div>
            <div><label>접수마감 시간</label><select value={f.regEndTime} onChange={set('regEndTime')}>{opt(TIMES)}</select></div>
            <div><label>게임방법</label><select value={f.gameType} onChange={set('gameType')}>{opt(['개인전', '단체전', '토너먼트'])}</select></div>
            <div><label>종목</label><select value={f.format} onChange={set('format')}>{opt(['단식', '복식', '혼합복식'])}</select></div>
          </div>
          <label>참가비 (원)</label><input type="number" inputMode="numeric" min="0" value={f.fee} onChange={set('fee')} placeholder="0" />
          <label>안내</label><textarea rows={3} value={f.notice} onChange={set('notice')} placeholder="대회 안내 사항" style={sel} />
          <label>시상</label><input value={f.prize} onChange={set('prize')} placeholder="예) 우승 상품권, 준우승 음료권" />
          <div className="mute" style={{ margin: '4px 0' }}>공개</div>
          <label style={chk}><input type="checkbox" style={cbx} checked={f.pubExchange} onChange={(e) => setF({ ...f, pubExchange: e.target.checked })} />클럽교류전</label>
          <label style={{ ...chk, marginBottom: 10 }}><input type="checkbox" style={cbx} checked={f.pubMatch} onChange={(e) => setF({ ...f, pubMatch: e.target.checked })} />매칭</label>
          <button className="btn ball" style={{ width: '100%' }} onClick={submit}>완료</button>
        </div>
      </div>
    </div>
  );
}

export function Detail({ t, me, setMe, setTours, onBack, onMvp }) {
  const [tab, setTab] = useState('요강'), [pn, setPn] = useState(''), [pt, setPt] = useState(2);
  const [m2, setM2] = useState('rank'), [manual, setManual] = useState([]), [edit, setEdit] = useState(null), [mvp, setMvp] = useState('');
  const upd = (fn) => setTours((ts) => ts.map((x) => (x.id === t.id ? fn(x) : x)));
  const isHost = t.host === ME, mine = t.participants.some((p) => p.id === 'me'), st = status(t);
  const my = me.tier * 100 + me.pts, n = t.participants.length;
  let S = 2; while (S < n) S *= 2;
  const man = manual.length === S ? manual : Array(S).fill('');
  const setMan = (i) => (e) => { const a = [...man]; a[i] = e.target.value; setManual(a); };

  const apply = () => {
    let name = ME, score = my;
    if (t.format !== '단식') { if (!pn.trim()) { alert('파트너 이름을 입력해 주세요'); return; } name = `${ME} / ${pn.trim()}`; score = Math.round((my + pt * 100 + 50) / 2); }
    upd((x) => ({ ...x, participants: [...x.participants, { id: 'me', name, score }] }));
  };
  const demoTeam = () => {
    const pick = () => NAMES[Math.floor(Math.random() * NAMES.length)], k = t.participants.length + 1;
    upd((x) => ({ ...x, participants: [...x.participants, { id: 'd' + Date.now(), name: t.format === '단식' ? `${pick()}${k}` : `${pick()}${k} / ${pick()}`, score: 100 + Math.floor(Math.random() * 400) }] }));
  };
  const gen = () => {
    if (n < 2) return;
    let slots;
    if (m2 === 'manual') {
      const used = man.filter(Boolean);
      if (new Set(used).size !== n || used.length !== n) { alert('모든 참가팀을 한 번씩 배정해 주세요'); return; }
      slots = makeSlots(t.participants, 'manual', man);
    } else slots = makeSlots(t.participants, m2);
    upd((x) => ({ ...x, bracket: { m1: 'tour', m2, slots, results: {} }, mvp: null }));
  };
  const openEdit = (key, a, b, res) => setEdit({ key, a, b, sets: [0, 1, 2].map((i) => (res && res.sets[i] ? [String(res.sets[i][0]), String(res.sets[i][1])] : ['', ''])) });
  const save = () => {
    const sets = edit.sets.filter((s) => s[0] !== '' && s[1] !== '').map((s) => [+s[0], +s[1]]);
    if (!sets.length) { alert('세트 스코어를 입력해 주세요'); return; }
    const sw = setsWon({ sets });
    if (sw[0] === sw[1]) { alert('승패가 가려지게 입력해 주세요'); return; }
    const now = sw[0] > sw[1] ? 'a' : 'b', rk = +edit.key.split('-')[0], prev = winnerOf((t.bracket.results || {})[edit.key]);
    upd((x) => {
      const r = { ...(x.bracket.results || {}) };
      if (prev && prev !== now) Object.keys(r).forEach((k) => { if (+k.split('-')[0] > rk) delete r[k]; });   // 승자가 바뀌면 이후 라운드 결과 초기화
      r[edit.key] = { sets };
      return { ...x, bracket: { ...x.bracket, results: r } };
    });
    const side = playersOf(edit.a).includes(ME) ? 'a' : playersOf(edit.b).includes(ME) ? 'b' : null;   // 내 전적에 누적
    if (side) {
      const ga = sets.reduce((s, x) => s + x[0], 0), gb = sets.reduce((s, x) => s + x[1], 0), my0 = side === 'a' ? edit.a : edit.b, op = side === 'a' ? edit.b : edit.a;
      const entry = { id: `${t.id}-${edit.key}`, kind: t.clubId ? '클럽' : '대회', format: playersOf(my0).length > 1 ? '복식' : '단식', win: now === side, a: playersOf(my0), b: playersOf(op), sa: side === 'a' ? ga : gb, sb: side === 'a' ? gb : ga, ts: Date.now() };
      setMe({ ...me, matchLog: [...(me.matchLog || []).filter((x) => x.id !== entry.id), entry] });
    }
    setEdit(null);
  };

  const ranked = [...t.participants].sort((a, b) => b.score - a.score);
  const info = [['대회일시', `${t.date} ${t.time}${t.endTime ? ` ~ ${t.endTime}` : ''}`], ['장소', t.place], ['접수마감', `${t.regEnd} ${t.regEndTime || '23:59'}`], ['게임방법', t.gameType || '토너먼트'], ['종목', t.format], ['참가비', `${t.fee.toLocaleString()}원`], ['안내', t.notice || '-'], ['시상', t.prize || '-'], ['참가팀', `${n}팀${t.cap ? ` / ${t.cap}팀` : ''}`]];
  const rounds = t.bracket ? buildRounds(t.bracket.slots, t.bracket.results) : [];
  const champ = rounds.champion, stats = rounds.length ? computeStats(rounds) : [];
  const pct = (s) => (s.w + s.l ? Math.round((s.w / (s.w + s.l)) * 100) : 0);

  return (
    <div>
      <button className="btn" onClick={onBack}>← 목록</button>
      <h1 style={{ marginTop: 12 }}>{t.name}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 10 }}>
        {[['요강', '요강'], ['참가자', '참가자'], ['대진표', '대진표'], ['통계', '통계']].map(([k, v]) => <button key={k} className={'btn' + (tab === k ? ' ball' : '')} style={{ padding: '9px 4px' }} aria-pressed={tab === k} onClick={() => setTab(k)}>{v}</button>)}
      </div>

      {tab === '요강' && (
        <div className="card">
          {info.map(([k, v]) => <div className="row" key={k} style={{ padding: '6px 0', alignItems: 'flex-start' }}><span className="mute" style={{ flex: 'none' }}>{k}</span><span style={{ textAlign: 'right', whiteSpace: 'pre-wrap' }}>{v}</span></div>)}
          <div className="row" style={{ marginTop: 8 }}><span className={st === '접수중' ? 'tag ball' : 'tag'}>{st}</span></div>
        </div>
      )}

      {tab === '참가자' && (
        <div>
          <div className="card">
            <b>참가팀 ({n}{t.cap ? `/${t.cap}` : ''}) <span className="mute">· 랭크점수순</span></b>
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
          {isHost && <button className="btn" disabled={!!t.bracket || (t.cap && n >= t.cap)} onClick={demoTeam}>(시연) 참가팀 추가</button>}
        </div>
      )}

      {tab === '대진표' && (
        <div>
          {isHost && (
            <div className="card">
              <b>대진표 만들기 (운영진)</b>
              <div className="mute" style={{ margin: '8px 0 2px' }}>1차 선택</div>
              <label style={chk}><input type="radio" name="m1" style={cbx} checked readOnly />토너먼트방식</label>
              <label style={{ ...chk, opacity: 0.5 }}><input type="radio" name="m1" style={cbx} disabled />KDK방식 (준비 중)</label>
              <div className="mute" style={{ margin: '8px 0 2px' }}>2차 선택</div>
              {M2.map(([k, v]) => <label key={k} style={chk}><input type="radio" name="m2" style={cbx} checked={m2 === k} onChange={() => setM2(k)} />{v}</label>)}
              <label style={{ ...chk, opacity: 0.5 }}><input type="radio" name="m2" style={cbx} disabled />A/B조 (준비 중)</label>
              {m2 === 'manual' && (
                <div style={{ marginTop: 8 }}><div className="mute">1회전 자리 배정 (두 칸이 한 경기)</div>
                  {Array.from({ length: S / 2 }, (_, i) => (
                    <div className="grid2" key={i} style={{ marginTop: 4 }}>
                      {[2 * i, 2 * i + 1].map((j) => (
                        <select key={j} aria-label={`${i + 1}경기 ${j % 2 ? 'B' : 'A'}`} value={man[j]} onChange={setMan(j)} style={{ ...sel, margin: 0 }}>
                          <option value="">부전승</option>{t.participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>))}
                    </div>))}
                </div>)}
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn ball" disabled={n < 2} onClick={gen}>{t.bracket ? '다시 생성 (결과 초기화)' : '대진표 생성'}</button>
                {t.bracket && <button className="btn" onClick={() => { if (confirm('대진표와 결과를 모두 지울까요?')) upd((x) => ({ ...x, bracket: null, mvp: null })); }}>초기화</button>}
              </div>
              {n < 2 && <div className="mute" style={{ marginTop: 6 }}>참가팀이 2팀 이상이어야 해요.</div>}
            </div>
          )}
          {!t.bracket && !isHost && <div className="card mute">운영진이 대진표를 확정하면 표시돼요.</div>}
          {edit && (
            <div className="card"><b>경기 결과 입력</b>
              <div className="mute" style={{ margin: '4px 0 8px' }}>{edit.a.name} vs {edit.b.name} · 세트별 게임 수</div>
              {edit.sets.map((s, i) => (
                <div className="grid2" key={i}>
                  <input type="number" inputMode="numeric" min="0" aria-label={`${i + 1}세트 ${edit.a.name}`} placeholder={`${i + 1}세트 ${edit.a.name}`} value={s[0]} onChange={(e) => setEdit({ ...edit, sets: edit.sets.map((x, j) => (j === i ? [e.target.value, x[1]] : x)) })} />
                  <input type="number" inputMode="numeric" min="0" aria-label={`${i + 1}세트 ${edit.b.name}`} placeholder={`${i + 1}세트 ${edit.b.name}`} value={s[1]} onChange={(e) => setEdit({ ...edit, sets: edit.sets.map((x, j) => (j === i ? [x[0], e.target.value] : x)) })} />
                </div>))}
              <div className="row"><button className="btn" onClick={() => setEdit(null)}>취소</button><button className="btn ball" onClick={save}>저장</button></div>
            </div>)}
          {t.bracket && (
            <div className="card">
              <div className="mute" style={{ marginBottom: 8 }}>1차 토너먼트방식 · 2차 {M2L[t.bracket.m2] || '-'} · ({'{'}번호{'}'}는 시드)</div>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                {rounds.map((r, ri) => (
                  <div key={ri} style={{ minWidth: 170, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', gap: 8 }}>
                    <b style={{ fontSize: 13 }}>{r.length === 1 ? '결승' : r.length === 2 ? '4강' : `${r.length * 2}강`}</b>
                    {r.map((mt) => {
                      const w = winnerOf(mt.res), sc = (k) => (mt.res ? mt.res.sets.map((s) => s[k]).join(' ') : '');
                      return (
                        <div key={mt.key} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '2px 8px', background: 'var(--bg)' }}>
                          <TeamLine x={mt.a} sc={sc(0)} win={w === 'a'} /><div style={{ borderTop: '1px solid var(--line)' }} /><TeamLine x={mt.b} sc={sc(1)} win={w === 'b'} />
                          {isHost && mt.a && mt.b && <button className="btn" style={{ padding: '2px 8px', margin: '4px 0', fontSize: 12 }} onClick={() => openEdit(mt.key, mt.a, mt.b, mt.res)}>{mt.res ? '결과 수정' : '결과 입력'}</button>}
                        </div>);
                    })}
                  </div>
                ))}
              </div>
              {champ && <div style={{ marginTop: 8 }}>🏆 우승 <b>{champ.name}</b></div>}
            </div>
          )}
        </div>
      )}

      {tab === '통계' && (
        <div>
          {stats.length === 0 && <div className="card mute">대진표에 경기 결과가 입력되면 통계가 만들어져요.</div>}
          {stats.length > 0 && (
            <div className="card"><b>경기 통계</b> <span className="mute">{champ ? '· 경기 완료' : '· 진행 중 (잠정)'}</span>
              <div style={{ overflowX: 'auto', marginTop: 8 }}>
                <table style={{ whiteSpace: 'nowrap' }}>
                  <thead><tr>{['순위', '이름', '승', '패', '승률', '득실세트', '득실게임', '최대연승', '베이글승'].map((h) => <th key={h} className="mute" style={{ fontWeight: 400 }}>{h}</th>)}</tr></thead>
                  <tbody>{stats.map((s, i) => (
                    <tr key={s.name}><td>{i + 1}</td><td><b>{s.name}{t.mvp === s.name ? ' 👑' : ''}</b></td><td>{s.w}</td><td>{s.l}</td><td>{pct(s)}%</td><td>{s.sf - s.sa > 0 ? '+' : ''}{s.sf - s.sa}</td><td>{s.gf - s.ga > 0 ? '+' : ''}{s.gf - s.ga}</td><td>{s.best}</td><td>{s.bagel}</td></tr>))}</tbody>
                </table>
              </div>
              <div className="mute" style={{ marginTop: 6 }}>베이글승 = 6-0으로 이긴 세트 수</div>
            </div>)}
          {stats.length > 0 && (
            <div className="card"><b>월례대회 MVP</b>
              {t.mvp ? <div style={{ marginTop: 8, fontSize: 18 }}>👑 <b>{t.mvp}</b></div>
                : champ && isHost ? (
                  <div style={{ marginTop: 8 }}>
                    <div className="mute">추천: 승 → 득실세트 → 득실게임 순으로 1위 ({stats[0].name})</div>
                    <select aria-label="MVP" value={mvp || stats[0].name} onChange={(e) => setMvp(e.target.value)}>{stats.map((s) => <option key={s.name}>{s.name}</option>)}</select>
                    <button className="btn ball" onClick={() => { const nm = mvp || stats[0].name; upd((x) => ({ ...x, mvp: nm })); if (onMvp) onMvp(t, nm); }}>MVP 선정</button>
                  </div>)
                  : <div className="mute" style={{ marginTop: 8 }}>{champ ? '운영진이 MVP를 선정하면 표시돼요.' : '모든 경기가 끝나면 MVP를 선정할 수 있어요.'}</div>}
            </div>)}
        </div>
      )}
    </div>
  );
}

export default function Tournaments({ tours, setTours, me, setMe, clubId, club, exchange, onMvp }) {
  const [area, setArea] = useState(''), [ym, setYM] = useState([2026, 9]), [sel2, setSel] = useState('');
  const [q, setQ] = useState(''), [fmt, setFmt] = useState(''), [st, setSt] = useState(''), [openId, setOpenId] = useState(null), [creating, setCreating] = useState(false);
  const open = tours.find((t) => t.id === openId);
  if (open) return <Detail t={open} me={me} setMe={setMe} setTours={setTours} onBack={() => setOpenId(null)} onMvp={onMvp} />;

  const [y, m] = ym, prefix = `${y}-${pad(m + 1)}`, noCal = !!clubId || !!exchange;
  const scope = (t) => (clubId ? t.clubId === clubId : exchange ? t.clubId && t.pubExchange : !t.clubId || t.pubExchange);
  const inArea = tours.filter((t) => scope(t) && (!area || t.area === area));
  const marks = new Set(inArea.map((t) => t.date));
  const list = inArea.filter((t) => (sel2 ? t.date === sel2 : noCal || t.date.startsWith(prefix)) && (!q || (t.name + t.place).includes(q)) && (!fmt || t.format === fmt) && (!st || status(t) === st)).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <h1>{clubId ? '월례대회' : exchange ? '클럽교류전' : '대회'}</h1>
      <select aria-label="지역" value={area} onChange={(e) => setArea(e.target.value)}><option value="">지역 전체</option>{AREAS.map((a) => <option key={a}>{a}</option>)}</select>
      {noCal ? <input type="date" aria-label="날짜" value={sel2} onChange={(e) => setSel(e.target.value)} /> : <Calendar y={y} m={m} setYM={setYM} sel={sel2} setSel={setSel} marks={marks} />}
      <input placeholder="대회 검색 (대회명, 장소)" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="grid2">
        <select value={fmt} onChange={(e) => setFmt(e.target.value)}><option value="">종목 전체</option><option>단식</option><option>복식</option><option>혼합복식</option></select>
        <select value={st} onChange={(e) => setSt(e.target.value)}><option value="">접수상태 전체</option><option>접수중</option><option>접수마감</option><option>마감</option></select>
      </div>
      <div className="mute" style={{ margin: '6px 0' }}>{sel2 ? `${sel2} 대회` : noCal ? '전체 대회' : `${y}년 ${m + 1}월 대회`} {list.length}건 {sel2 && <button className="btn" style={{ padding: '2px 8px', marginLeft: 6 }} onClick={() => setSel('')}>날짜 해제</button>}</div>
      {list.length === 0 && <div className="card mute">조건에 맞는 대회가 없어요.</div>}
      {list.map((t) => (
        <div className="card" key={t.id} role="button" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => setOpenId(t.id)} onKeyDown={(e) => e.key === 'Enter' && setOpenId(t.id)}>
          <div className="row"><b>{t.name}</b><span className={status(t) === '접수중' ? 'tag ball' : 'tag'}>{status(t)}</span></div>
          <div className="mute">{t.place} · {t.area}</div>
          <div style={{ margin: '4px 0' }}>{t.date} {t.time}{t.endTime ? `~${t.endTime}` : ''} · {t.gameType || t.format}</div>
          <div className="mute">참가비 {t.fee.toLocaleString()}원 · {t.participants.length}팀</div>
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
