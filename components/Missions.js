'use client';
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monday = (d) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return ymd(x); };

export default function Missions({ me, setMe }) {
  const log = me.matchLog || [], now = new Date(), wk = monday(now), mo = ymd(now).slice(0, 7), td = ymd(now);
  const W = log.filter((m) => monday(new Date(m.ts)) === wk), M = log.filter((m) => ymd(new Date(m.ts)).slice(0, 7) === mo);
  const wins = (a) => a.filter((m) => m.win).length;
  const MS = [
    { k: 'w5win', t: '주간 5게임 승리', tok: wk, cur: wins(W), goal: 5, pt: 10 },
    { k: 'm20win', t: '월간 20게임 승리', tok: mo, cur: wins(M), goal: 20, pt: 10 },
    { k: 'w10', t: '주간 10게임하기', tok: wk, cur: W.length, goal: 10, pt: 10 },
    { k: 'm50', t: '월간 50게임하기', tok: mo, cur: M.length, goal: 50, pt: 10 },
    { k: 'm5s', t: '월간 단식 5게임하기', tok: mo, cur: M.filter((m) => m.format === '단식').length, goal: 5, pt: 10 },
    { k: 'att', t: '출석체크', tok: td, cur: (me.claims || {}).att === td ? 1 : 0, goal: 1, pt: 5, daily: true },
  ];
  const claim = (m) => setMe({ ...me, points: (me.points || 0) + m.pt, claims: { ...(me.claims || {}), [m.k]: m.tok } });
  return (
    <div>
      <h1>미션</h1>
      <div className="card row"><span>보유 포인트</span><b style={{ fontSize: 22 }}>{me.points || 0}P</b></div>
      {MS.map((m) => {
        const done = (me.claims || {})[m.k] === m.tok, ok = m.cur >= m.goal, pct = Math.min(100, Math.round((m.cur / m.goal) * 100));
        return (
          <div className="card" key={m.k}>
            <div className="row"><b>{m.t}</b><span className="tag ball">+{m.pt}P</span></div>
            <div className="bar" role="progressbar" aria-label={m.t} aria-valuemin="0" aria-valuemax={m.goal} aria-valuenow={Math.min(m.cur, m.goal)}><i style={{ width: pct + '%' }} /></div>
            <div className="row"><span className="mute">{m.daily ? (done ? '오늘 출석 완료' : '오늘 아직 출석 전') : `${Math.min(m.cur, m.goal)} / ${m.goal}`}</span>
              {m.daily
                ? <button className="btn ball" disabled={done} onClick={() => claim(m)}>{done ? '완료' : '출석체크'}</button>
                : <button className="btn ball" disabled={!ok || done} onClick={() => claim(m)}>{done ? '수령 완료' : ok ? '보상 받기' : '진행 중'}</button>}</div>
          </div>);
      })}
      <div className="mute">주간은 월요일 기준으로 초기화되고, 월간은 매월 1일에 초기화돼요. 경기 수는 상호 확인이 끝난 매칭 경기로 집계돼요.</div>
    </div>
  );
}
