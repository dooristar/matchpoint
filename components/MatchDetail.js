'use client';
import { useState } from 'react';
import { COURTS, ME, NAMES } from '../lib/data';
import { TIERS, applyResult } from '../lib/rating';
import TierIcon from './TierIcon';
import Stars from './Stars';
import { SKILLS, M_ITEMS, ntrpOfScore, levelOf } from '../lib/skills';

const careerText = (c) => (c >= 10 ? '10년 이상' : `${c}년 이상`);

// 상호평가 3단계: 1) 안내·신고 → 2) 기술/실력(NTRP) 슬라이더 → 3) 매너/태도
const CSS = `.energy{-webkit-appearance:none;appearance:none;width:100%;height:14px;border-radius:99px;outline:none;margin:8px 0 2px;border:0;padding:0;cursor:pointer}
.energy::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:26px;height:26px;border-radius:50%;background:#fff;border:3px solid var(--court);box-shadow:0 1px 4px rgba(0,0,0,.4)}
.energy::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:#fff;border:3px solid var(--court);box-shadow:0 1px 4px rgba(0,0,0,.4)}
.energy:focus-visible{outline:3px solid var(--ball);outline-offset:3px}`;

function EvalForm({ name, onDone }) {
  const [step, setStep] = useState(1), [focus, setFocus] = useState(SKILLS[0].k), [rep, setRep] = useState({ noshow: false, rude: false });
  const [s, setS] = useState(Object.fromEntries(SKILLS.map((x) => [x.k, 10])));
  const [m, setM] = useState(Object.fromEntries(M_ITEMS.map((k) => [k, 3])));
  const report = (k, label) => { if (rep[k] || !confirm(`${name} 님을 ${label}로 신고할까요?`)) return; setRep({ ...rep, [k]: true }); };
  return (
    <div className="card">
      <style>{CSS}</style>
      <b>{name} 님 평가 ({step}/3)</b>

      {step === 1 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ padding: 12, borderRadius: 12, background: 'var(--bg)', border: '1px solid var(--line)' }}>
            🔒 <b>익명성 보장</b><div style={{ marginTop: 4 }}>내가 매긴 평점은 상대방에게 개인별로 공개되지 않고, 누적 평균 스탯으로만 반영돼요.</div>
          </div>
          <div className="mute" style={{ margin: '12px 0 6px' }}>문제가 있었나요?</div>
          <div className="grid2">
            <button className="btn" style={{ background: rep.noshow ? 'var(--mute)' : 'var(--lose)' }} disabled={rep.noshow} onClick={() => report('noshow', '노쇼')}>{rep.noshow ? '노쇼 신고 접수됨' : '노쇼 신고'}</button>
            <button className="btn" style={{ background: rep.rude ? 'var(--mute)' : 'var(--lose)' }} disabled={rep.rude} onClick={() => report('rude', '비매너')}>{rep.rude ? '비매너 신고 접수됨' : '비매너 신고'}</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ marginTop: 6 }}>
          <div className="mute">NTRP 평가 · 슬라이더를 움직이면 항목 설명이 나와요 (1~20점)</div>
          {SKILLS.map((x) => {
            const v = s[x.k], pct = ((v - 1) / 19) * 100, on = focus === x.k, n = ntrpOfScore(v), lv = levelOf(n);
            return (
              <div key={x.k} style={{ marginTop: 14 }}>
                <div className="row">
                  <button type="button" aria-expanded={on} onClick={() => setFocus(x.k)} style={{ border: 0, background: 'none', font: 'inherit', fontWeight: 700, color: 'var(--fg)', cursor: 'pointer', padding: 0, textAlign: 'left' }}>{x.k.replace('&', ' & ')}</button>
                  <b>{v}<span className="mute" style={{ fontWeight: 400 }}>/20</span></b>
                </div>
                <input type="range" className="energy" min="1" max="20" step="1" value={v} aria-label={`${x.k} 점수`} onFocus={() => setFocus(x.k)} onPointerDown={() => setFocus(x.k)}
                  onChange={(e) => setS({ ...s, [x.k]: +e.target.value })} style={{ background: `linear-gradient(90deg, var(--ball) ${pct}%, var(--line) ${pct}%)` }} />
                {on && (
                  <div style={{ padding: '8px 10px', borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--line)', fontSize: 13 }}>
                    <b>{x.title}</b>: {x.desc}
                    <div className="mute" style={{ marginTop: 4 }}>지금 선택: NTRP {n.toFixed(1)} · {lv[1]} — {lv[2]}</div>
                  </div>)}
              </div>);
          })}
        </div>
      )}

      {step === 3 && (
        <div style={{ marginTop: 6 }}>
          <div className="mute">매너/태도 평가 (1~5점)</div>
          {M_ITEMS.map((k) => <div className="row" key={k} style={{ marginTop: 8 }}><span>{k}</span><Stars value={m[k]} onChange={(v) => setM({ ...m, [k]: v })} label={k} /></div>)}
        </div>
      )}

      <div className="row" style={{ marginTop: 14 }}>
        {step > 1 ? <button className="btn" onClick={() => setStep(step - 1)}>이전</button> : <span />}
        <button className="btn ball" onClick={() => (step < 3 ? setStep(step + 1) : onDone({ s, m, report: rep }))}>{step < 3 ? '다음' : '완료'}</button>
      </div>
    </div>
  );
}

export default function MatchDetail({ post: p, me, setMe, setPosts, onBack }) {
  const upd = (fn) => setPosts((ps) => ps.map((x) => (x.id === p.id ? fn(x) : x)));
  const isHost = p.host.name === ME, isAcc = p.accepted.some((a) => a.name === ME), inWait = p.waiting.some((a) => a.name === ME);
  const joined = isHost || isAcc, full = p.accepted.length >= p.cap;
  const people = [p.host, ...p.accepted], others = people.filter((x) => x.name !== ME);
  const blocked = p.kind === '랭크' && !(me.tier >= p.lo && me.tier <= p.hi);
  const [wv, setWv] = useState('1'), [opps, setOpps] = useState([]), [evTarget, setEvTarget] = useState(null), [sc, setSc] = useState(['', '']);

  const accept = (w) => { if (!full) upd((x) => ({ ...x, waiting: x.waiting.filter((n) => n.name !== w.name), accepted: [...x.accepted, w] })); };
  const reject = (w) => upd((x) => ({ ...x, waiting: x.waiting.filter((n) => n.name !== w.name) }));
  const demoApplicant = () => {
    const used = [...people, ...p.waiting].map((x) => x.name), name = NAMES.find((n) => !used.includes(n));
    if (!name) return;
    const tier = p.lo + Math.floor(Math.random() * (p.hi - p.lo + 1));
    upd((x) => ({ ...x, waiting: [...x.waiting, { name, tier }] }));
  };
  const apply = () => upd((x) => ({ ...x, waiting: [...x.waiting, { name: ME, tier: me.tier }] }));
  const cancel = () => upd((x) => ({ ...x, waiting: x.waiting.filter((n) => n.name !== ME) }));
  const demoAcceptMe = () => upd((x) => ({ ...x, waiting: x.waiting.filter((n) => n.name !== ME), accepted: [...x.accepted, { name: ME, tier: me.tier }] }));

  const submitResult = () => {
    const o = p.format === '단식' ? others.map((x) => x.name) : opps;
    if (!o.length) { alert('상대를 선택해 주세요'); return; }
    upd((x) => ({ ...x, result: { win: wv === '1', opps: o, score: sc.map((v) => (v === '' ? null : +v)), confirmed: [], final: false, gain: null } }));
  };
  const confirm = (name) => {
    const confirmed = [...p.result.confirmed, name];
    if (confirmed.length < p.result.opps.length) { upd((x) => ({ ...x, result: { ...x.result, confirmed } })); return; }
    const win = p.result.win;
    const oppTier = Math.round(p.result.opps.map((n) => people.find((x) => x.name === n).tier).reduce((a, b) => a + b, 0) / p.result.opps.length);
    let next = me, gain = null;
    if (p.kind === '랭크') { // 랭크 경기만 경험치 반영
      next = applyResult(me, { opp: p.result.opps.join(','), oppTier, win, kind: '랭크' });
      const r = next.matches[next.matches.length - 1];
      gain = { delta: r.delta, note: r.note };
    }
    setMe({ ...next, matchLog: [...(next.matchLog || []), { id: p.id, kind: p.clubId ? '클럽' : p.kind, win, format: p.result.opps.length > 1 ? '복식' : '단식', a: [ME, ...others.map((x) => x.name).filter((nm) => !p.result.opps.includes(nm))], b: p.result.opps, sa: (p.result.score || [])[0], sb: (p.result.score || [])[1], ts: Date.now() }] });
    upd((x) => ({ ...x, result: { ...x.result, confirmed, final: true, gain } }));
  };
  const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const demoReceive = () => {
    const ents = others.map((o) => ({ from: o.name, postId: p.id, s: Object.fromEntries(SKILLS.map((x) => [x.k, rnd(8, 18)])), m: Object.fromEntries(M_ITEMS.map((k) => [k, rnd(3, 5)])) }));
    setMe({ ...me, received: [...(me.received || []), ...ents] });
    upd((x) => ({ ...x, recvDemo: true }));
  };

  const row = (m, tag) => (
    <div className="row" key={m.name} style={{ marginBottom: 6 }}>
      <span><TierIcon tier={m.tier} /> <b>{m.name}</b> <span className="mute">{TIERS[m.tier].n.toFixed(1)} {TIERS[m.tier].name}{tag ? ` · ${tag}` : ''}</span></span>
    </div>
  );

  return (
    <div>
      <button className="btn" onClick={onBack}>← 목록</button>
      <h1 style={{ marginTop: 12 }}>{p.court} {p.no}번 코트</h1>
      <div className="card">
        <div className="row"><span>{p.date} {p.time}</span><span className={p.kind === '랭크' ? 'tag ball' : 'tag'}>{p.kind}</span></div>
        <div className="mute">{COURTS[p.court].addr}</div>
        <div style={{ marginTop: 6 }}>{p.format} · 성별 {p.gender} · 등급 {TIERS[p.lo].n.toFixed(1)}~{TIERS[p.hi].n.toFixed(1)} · 구력 {careerText(p.career)} · 참가비 {p.fee.toLocaleString()}원</div>
        {p.memo && <div className="mute" style={{ marginTop: 6 }}>“{p.memo}”</div>}
      </div>

      <div className="card">
        <b>참가 인원 ({people.length}/{p.cap + 1})</b>
        <div style={{ marginTop: 8 }}>{people.map((m) => row(m, m.name === p.host.name ? '호스트' : m.name === ME ? '나' : ''))}</div>
      </div>

      <div className="card">
        <b>대기 목록 ({p.waiting.length})</b>
        <div style={{ marginTop: 8 }}>
          {p.waiting.length === 0 && <div className="mute">대기자가 없어요.</div>}
          {p.waiting.map((w) => (
            <div className="row" key={w.name} style={{ marginBottom: 6 }}>
              <span><TierIcon tier={w.tier} /> <b>{w.name}</b> <span className="mute">{TIERS[w.tier].n.toFixed(1)} {TIERS[w.tier].name}</span></span>
              {isHost && <span style={{ display: 'flex', gap: 6 }}><button className="btn" disabled={full} onClick={() => accept(w)}>선택</button><button className="btn" style={{ background: 'var(--lose)' }} onClick={() => reject(w)}>거절</button></span>}
              {w.name === ME && <span className="tag">내 신청</span>}
            </div>
          ))}
        </div>
        {isHost && <button className="btn" style={{ marginTop: 6 }} onClick={demoApplicant}>(시연) 신청자 추가</button>}
        {!isHost && !joined && !inWait && <button className="btn ball" disabled={full || blocked} onClick={apply}>{full ? '마감' : blocked ? '등급 범위 밖' : '참가 신청'}</button>}
        {inWait && <div className="row"><button className="btn" onClick={cancel}>신청 취소</button><button className="btn" onClick={demoAcceptMe}>(시연) 호스트가 나를 선택</button></div>}
      </div>

      {joined && others.length > 0 && !p.result && (
        <div className="card">
          <b>경기 결과 입력</b>
          <div className="grid2" style={{ marginTop: 8 }}>
            <button className={'btn' + (wv === '1' ? ' ball' : '')} aria-pressed={wv === '1'} onClick={() => setWv('1')}>승리</button>
            <button className={'btn' + (wv === '0' ? ' ball' : '')} aria-pressed={wv === '0'} onClick={() => setWv('0')}>패배</button>
          </div>
          <div className="grid2" style={{ marginTop: 8 }}>
            <input aria-label="내 게임 수" type="number" inputMode="numeric" min="0" placeholder="내 쪽 게임 수 (선택)" value={sc[0]} onChange={(e) => setSc([e.target.value, sc[1]])} style={{ margin: 0 }} />
            <input aria-label="상대 게임 수" type="number" inputMode="numeric" min="0" placeholder="상대 쪽 게임 수 (선택)" value={sc[1]} onChange={(e) => setSc([sc[0], e.target.value])} style={{ margin: 0 }} />
          </div>
          {p.format !== '단식' && (
            <div style={{ marginTop: 8 }}><div className="mute">상대 선택</div>
              {others.map((o) => (<label key={o.name} style={{ display: 'block', color: 'var(--fg)', fontSize: 14 }}><input type="checkbox" style={{ width: 'auto', margin: '0 6px 0 0' }} checked={opps.includes(o.name)} onChange={() => setOpps(opps.includes(o.name) ? opps.filter((n) => n !== o.name) : [...opps, o.name])} />{o.name}</label>))}
            </div>)}
          <button className="btn" style={{ marginTop: 10 }} onClick={submitResult}>결과 제출</button>
        </div>
      )}

      {p.result && (
        <div className="card">
          <b>경기 결과: {p.result.win ? '승리' : '패배'}</b> <span className="mute">(상대 {p.result.opps.join(', ')})</span>
          {!p.result.final
            ? <div style={{ marginTop: 8 }}><div className="mute">상대방의 결과 확인이 필요해요</div>
                {p.result.opps.map((n) => (<div className="row" key={n} style={{ marginTop: 6 }}><span>{n}</span>{p.result.confirmed.includes(n) ? <span className="tag ball">확인 완료</span> : <button className="btn" onClick={() => confirm(n)}>(시연) {n} 확인</button>}</div>))}</div>
            : <div style={{ marginTop: 8 }}>상호 확인 완료 · {p.kind === '랭크' ? <span>경험치 <b className={p.result.gain.delta >= 0 ? 'up' : 'down'}>{p.result.gain.delta > 0 ? '+' : ''}{p.result.gain.delta}</b> {p.result.gain.note}</span> : <span className="mute">일반 경기는 전적에만 반영돼요</span>}</div>}
        </div>
      )}

      {p.result?.final && (
        <div>
          <h2 style={{ fontSize: 16 }}>상호 평가</h2>
          {others.map((o) => (
            <div className="row card" key={o.name}><span><TierIcon tier={o.tier} /> {o.name}</span>
              {p.evals[o.name] ? <span className="tag ball">평가 완료</span> : <button className="btn" onClick={() => setEvTarget(o.name)}>평가하기</button>}</div>))}
          {evTarget && !p.evals[evTarget] && <EvalForm key={evTarget} name={evTarget} onDone={(v) => { upd((x) => ({ ...x, evals: { ...x.evals, [evTarget]: v } })); setEvTarget(null); }} />}
          {!p.recvDemo && <button className="btn" onClick={demoReceive}>(시연) 상대에게 평가 받기 → 프로필 반영</button>}
          {p.recvDemo && <div className="mute">받은 평가가 프로필에 반영됐어요.</div>}
        </div>
      )}
    </div>
  );
}
