'use client';
import { useState } from 'react';
import { TIERS, tierLabel, ntrp, applyResult, initialMe } from '../lib/rating';

const SKILLS = [['스트로크', 70], ['서브', 55], ['발리', 45], ['매너', 90], ['운영', 65], ['무브먼트', 60]]; // 데모 값

function Radar() {
  const c = 110, r = 70, pt = (i, v) => { const a = (-90 + i * 60) * Math.PI / 180; return [c + Math.cos(a) * r * v, c + Math.sin(a) * r * v]; };
  const ring = (v) => SKILLS.map((_, i) => pt(i, v).join(',')).join(' ');
  return (
    <svg viewBox="0 0 220 220" width="200" height="200" role="img" aria-label="능력치 육각형 차트">
      {[0.5, 1].map((v) => <polygon key={v} points={ring(v)} fill="none" stroke="var(--line)" />)}
      <polygon points={SKILLS.map(([, v], i) => pt(i, v / 100).join(',')).join(' ')} fill="var(--court)" fillOpacity=".35" stroke="var(--court)" strokeWidth="2" />
      {SKILLS.map(([name], i) => { const [x, y] = pt(i, 1.28); return <text key={name} x={x} y={y} fontSize="11" textAnchor="middle" dominantBaseline="middle" fill="var(--mute)">{name}</text>; })}
    </svg>
  );
}

export default function Profile({ me, setMe }) {
  const [opp, setOpp] = useState(''), [oppTier, setOppTier] = useState(me.tier), [win, setWin] = useState('1'), [kind, setKind] = useState('일반');
  const [rec, setRec] = useState('일반');
  const submit = () => {
    if (!opp.trim()) return;
    setMe(applyResult(me, { opp: opp.trim(), oppTier: +oppTier, win: win === '1', kind }));
    setOpp('');
  };
  const count = (k) => { const m = me.matches.filter((x) => x.kind === k); const w = m.filter((x) => x.win).length; return `${m.length}전 ${w}승 ${m.length - w}패`; };
  return (
    <div>
      <h1>프로필</h1>
      <div className="card row">
        <div className="photo" style={{ width: 96, height: 96 }}>사진</div>
        <Radar />
      </div>
      <div className="card">
        <div className="row"><b style={{ fontSize: 20 }}>랭크 {TIERS[me.tier].name} ({ntrp(me.tier, me.pts)})</b><span className="tag">{tierLabel(me.tier)}</span></div>
        {me.promo
          ? <div style={{ marginTop: 8 }}>승급전 {me.promo.w}승 {me.promo.l}패 · 5판 3승 (같은 등급 이상 상대만)</div>
          : <><div className="bar"><i style={{ width: me.pts + '%' }} /></div><div className="mute">{me.pts} / 100점</div></>}
      </div>
      <div className="card">
        <b>전적</b>
        <div className="grid2" style={{ margin: '8px 0' }}>
          {['일반', '랭크', '클럽', '대회'].map((k) => <button key={k} className={'btn' + (rec === k ? ' ball' : '')} onClick={() => setRec(k)}>{k}</button>)}
        </div>
        <div>{rec} · {count(rec)}</div>
      </div>
      <div className="card">
        <b>경기 결과 입력</b>
        <label>상대 이름</label><input value={opp} onChange={(e) => setOpp(e.target.value)} placeholder="예) 민수" />
        <div className="grid3">
          <div><label>상대 등급</label><select value={oppTier} onChange={(e) => setOppTier(e.target.value)}>{TIERS.map((t, i) => <option key={i} value={i}>{t.n.toFixed(1)} {t.name}</option>)}</select></div>
          <div><label>결과</label><select value={win} onChange={(e) => setWin(e.target.value)}><option value="1">승</option><option value="0">패</option></select></div>
          <div><label>유형</label><select value={kind} onChange={(e) => setKind(e.target.value)}><option>일반</option><option>랭크</option></select></div>
        </div>
        <button className="btn" onClick={submit}>결과 반영</button>
        {me.matches.slice().reverse().slice(0, 8).map((m) => (
          <div className="row mute" key={m.ts} style={{ marginTop: 6 }}>
            <span>{m.opp} ({TIERS[m.oppTier].n.toFixed(1)}) {m.win ? '승' : '패'}</span>
            <span><span className={m.delta >= 0 ? 'up' : 'down'}>{m.delta > 0 ? '+' : ''}{m.delta}</span> {m.note}</span>
          </div>
        ))}
        <button className="btn" style={{ marginTop: 10 }} onClick={() => confirm('데모 데이터를 초기화할까요?') && setMe(initialMe())}>데모 초기화</button>
      </div>
    </div>
  );
}
