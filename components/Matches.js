'use client';
import { useState } from 'react';
import { AREAS, POSTS } from '../lib/data';
import { TIERS } from '../lib/rating';
import RankHelp from './RankHelp';

export default function Matches({ me }) {
  const [q, setQ] = useState(''), [kind, setKind] = useState(''), [date, setDate] = useState('');
  const [time, setTime] = useState(''), [area, setArea] = useState(''), [help, setHelp] = useState(false);
  const [joined, setJoined] = useState({});
  const list = POSTS.filter((p) =>
    (!q || (p.court + p.addr).includes(q)) && (!kind || p.kind === kind) && (!date || p.date === date) &&
    (!time || p.time === time) && (!area || p.area === area));
  return (
    <div>
      <h1>일반 / 랭크 매칭</h1>
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
          const inRange = me.tier >= p.lo && me.tier <= p.hi, ok = p.kind === '일반' || inRange;
          const on = joined[p.id], n = p.people.length + (on ? 1 : 0);
          return (
            <div className="card" key={p.id}>
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <div className="photo">사진</div>
                <div style={{ flex: 1 }}>
                  <b>{p.court}</b><div className="mute">{p.addr}</div>
                  <div style={{ margin: '4px 0' }}>{p.date} {p.clock} <span className={p.kind === '랭크' ? 'tag ball' : 'tag'}>{p.kind}</span></div>
                  <div className="mute">조건: {p.cond} · {TIERS[p.lo].n.toFixed(1)}~{TIERS[p.hi].n.toFixed(1)}</div>
                </div>
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <span className="mute">{n}/{p.cap}명 · {ok ? '참가 가능' : '등급 범위 밖'}</span>
                <button className="btn" disabled={!ok || (!on && n >= p.cap)} onClick={() => setJoined({ ...joined, [p.id]: !on })}>{on ? '참가 취소' : n >= p.cap ? '마감' : '참가 신청'}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
