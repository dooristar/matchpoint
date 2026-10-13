'use client';
import { useState } from 'react';
import { COURTS, ME, NAMES } from '../lib/data';
import { TIERS, applyResult } from '../lib/rating';
import TierIcon from './TierIcon';
import Stars from './Stars';

const R_ITEMS = [['level', '실력수준'], ['manner', '매너'], ['time', '시간약속'], ['attitude', '경기태도'], ['rematch', '재경기의향']];
const S_ITEMS = ['스트로크', '서브', '발리', '무브먼트', '운영', '매너'];
const careerText = (c) => (c >= 10 ? '10년 이상' : `${c}년 이상`);

// 상호평가: 1단계(5항목) → 다음 → 2단계(능력치 6항목) → 완료
function EvalForm({ name, onDone }) {
  const [step, setStep] = useState(1);
  const [r, setR] = useState({ level: 3, manner: 3, time: 3, attitude: 3, rematch: 3 });
  const [s, setS] = useState(Object.fromEntries(S_ITEMS.map((k) => [k, 3])));
  const rows = step === 1 ? R_ITEMS : S_ITEMS.map((k) => [k, k]);
  const val = step === 1 ? r : s, set = step === 1 ? setR : setS;
  return (
    <div className="card">
      <b>{name} 님 평가 ({step}/2)</b>
      {rows.map(([k, t]) => (
        <div className="row" key={k} style={{ marginTop: 6 }}><span>{t}</span><Stars value={val[k]} onChange={(v) => set({ ...val, [k]: v })} label={t} /></div>
      ))}
      <div className="row" style={{ marginTop: 12 }}>
        {step === 2 ? <button className="btn" onClick={() => setStep(1)}>이전</button> : <span />}
        <button className="btn ball" onClick={() => (step === 1 ? setStep(2) : onDone({ r, s }))}>{step === 1 ? '다음' : '완료'}</button>
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
  const [wv, setWv] = useState('1'), [opps, setOpps] = useState([]), [evTarget, setEvTarget] = useState(null);

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
    upd((x) => ({ ...x, result: { win: wv === '1', opps: o, confirmed: [], final: false, gain: null } }));
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
    setMe({ ...next, matchLog: [...(next.matchLog || []), { id: p.id, kind: p.kind, win, ts: Date.now() }] });
    upd((x) => ({ ...x, result: { ...x.result, confirmed, final: true, gain } }));
  };
  const rnd = () => 3 + Math.floor(Math.random() * 3);
  const demoReceive = () => {
    const ents = others.map((o) => ({ from: o.name, postId: p.id, r: Object.fromEntries(R_ITEMS.map(([k]) => [k, rnd()])), s: Object.fromEntries(S_ITEMS.map((k) => [k, rnd()])) }));
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
