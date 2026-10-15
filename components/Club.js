'use client';
import { useState } from 'react';
import { AREAS, COURTS, ME } from '../lib/data';
import { ntrp } from '../lib/rating';
import Matches from './Matches';
import Tournaments from './Tournaments';

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

const BANKS = ['카카오뱅크 모임통장', '토스뱅크 모임통장', '국민은행', '신한은행', '우리은행', '하나은행', '농협은행'];
const won = (n) => `${Number(n).toLocaleString()}원`;
const dt = (s) => new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const addDays = (s, n) => { const d = dt(s); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const net = (arr) => arr.reduce((a, x) => a + (x.type === 'in' ? x.amount : -x.amount), 0);

function Fees({ club, upd, admin }) {
  const f = club.fees, tx = f.tx || [], alerts = f.alerts || [], acct = f.account || null, due = f.dueDay || 5;
  const [mo, setMo] = useState(today().slice(0, 7)), [sec, setSec] = useState('납부현황');
  const [bank, setBank] = useState(BANKS[0]), [no, setNo] = useState(''), [holder, setHolder] = useState(club.name);
  const [inWho, setInWho] = useState(''), [inAmt, setInAmt] = useState(f.amount);
  const [outCat, setOutCat] = useState('공구입'), [outAmt, setOutAmt] = useState(''), [outMemo, setOutMemo] = useState('');
  const shift = (d) => { const x = new Date(+mo.slice(0, 4), +mo.slice(5) - 1 + d, 1); setMo(`${x.getFullYear()}-${pad(x.getMonth() + 1)}`); };

  const total = club.members.length, paidNames = f.paid[mo] || [];
  const unpaid = club.members.filter((m) => !paidNames.includes(m.name)), paidCnt = total - unpaid.length;
  const rate = total ? Math.round((paidCnt / total) * 1000) / 10 : 0;
  const setPaid = (name, v) => admin && upd((c) => { const cur = c.fees.paid[mo] || []; return { ...c, fees: { ...c.fees, paid: { ...c.fees.paid, [mo]: v ? [...cur.filter((n) => n !== name), name] : cur.filter((n) => n !== name) } } }; });
  const connect = () => {
    const d = no.replace(/\D/g, '');
    if (d.length < 8) { alert('계좌번호를 확인해 주세요'); return; }
    upd((c) => ({ ...c, fees: { ...c.fees, account: { bank, last4: d.slice(-4), holder: holder.trim() || c.name } } })); setNo('');   // 뒤 4자리만 저장
  };
  const disconnect = () => { if (confirm('모임통장 연결을 해제할까요?')) upd((c) => ({ ...c, fees: { ...c.fees, account: null } })); };
  // (시연) 통장 입금 알림: 입금자명이 회원이고 금액이 월회비 이상이면 납부 자동 체크
  const addIn = () => {
    const who = inWho || (club.members[0] || {}).name, amount = +inAmt, date = today(), m = date.slice(0, 7);
    if (!who || !amount) return;
    upd((c) => {
      const fe = c.fees, cur = fe.paid[m] || [], ok = c.members.some((x) => x.name === who) && amount >= fe.amount;
      const text = ok ? `${who}님 ${+m.slice(5)}월 회비 ${won(amount)} 입금 확인 → 납부 자동 체크` : `${who} ${won(amount)} 입금 · 회원 또는 금액이 달라 확인이 필요해요`;
      return { ...c, fees: { ...fe, paid: ok && !cur.includes(who) ? { ...fe.paid, [m]: [...cur, who] } : fe.paid, tx: [{ id: Date.now(), date, type: 'in', amount, who, cat: '회비' }, ...(fe.tx || [])], alerts: [{ id: Date.now() + 1, date, text }, ...(fe.alerts || [])] } };
    });
  };
  const addOut = () => {
    const amount = +outAmt, date = today(), memo = outMemo.trim();
    if (!amount) return;
    upd((c) => ({ ...c, fees: { ...c.fees, tx: [{ id: Date.now(), date, type: 'out', amount, cat: outCat, memo }, ...(c.fees.tx || [])], alerts: [{ id: Date.now() + 1, date, text: `통장 출금 ${won(amount)} · ${outCat}${memo ? ` (${memo})` : ''}` }, ...(c.fees.alerts || [])] } }));
    setOutAmt(''); setOutMemo('');
  };

  // 납부일 알림 (앱 안에서 계산해 보여줌 — 실제 푸시는 서버 연동 후)
  const t = today(), cur = t.slice(0, 7), dueDate = `${cur}-${pad(due)}`, plus5 = addDays(dueDate, 5);
  const curUnpaid = club.members.filter((m) => !(f.paid[cur] || []).includes(m.name));
  const days = Math.round((dt(dueDate) - dt(t)) / 864e5), auto = [];
  auto.push(days > 0 ? `이번 달 회비 납부일까지 D-${days} (${+cur.slice(5)}월 ${due}일)` : `${+cur.slice(5)}월 회비 납부일(${due}일)이에요 · 미납 ${curUnpaid.length}명`);
  if (t >= plus5 && curUnpaid.length) auto.push(`납부일 +5일 경과 · 미납자 알림: ${curUnpaid.map((m) => m.name).join(', ')}`);

  const mtx = tx.filter((x) => x.date.startsWith(mo)), opening = net(tx.filter((x) => x.date.slice(0, 7) < mo));
  const inSum = net(mtx.filter((x) => x.type === 'in')), outSum = -net(mtx.filter((x) => x.type === 'out'));
  const months = Array.from({ length: 6 }, (_, i) => { const x = new Date(+mo.slice(0, 4), +mo.slice(5) - 1 - 5 + i, 1); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}`; });
  const txRow = (x) => (
    <div className="row" key={x.id} style={{ marginBottom: 6 }}>
      <span><span className="mute">{x.date.slice(5)}</span> {x.type === 'in' ? <b>{x.who}</b> : <b>{x.cat}</b>} <span className="mute">{x.type === 'in' ? x.cat : x.memo}</span></span>
      <b className={x.type === 'in' ? 'up' : 'down'}>{x.type === 'in' ? '+' : '-'}{won(x.amount)}</b>
    </div>);
  const big = { fontSize: 20 };

  return (
    <div>
      <div className="card">
        <div className="row"><b style={{ fontSize: 18 }}>{club.name} 회비 관리</b>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="btn" style={{ padding: '2px 8px' }} aria-label="이전 달" onClick={() => shift(-1)}>‹</button>
            <span className="tag">{+mo.slice(5)}월 회비</span>
            <button className="btn" style={{ padding: '2px 8px' }} aria-label="다음 달" onClick={() => shift(1)}>›</button></span></div>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginTop: 10 }}>
          {['납부현황', '통장내역', '명세서', '알림'].map((s) => <button key={s} className={'btn' + (sec === s ? ' ball' : '')} style={{ flex: 'none' }} aria-pressed={sec === s} onClick={() => setSec(s)}>{s}</button>)}
        </div>
      </div>

      {sec === '납부현황' && (
        <div>
          <div className="card">
            <div className="grid3">
              <div><div className="mute">전체 회원</div><b style={big}>{total}명</b></div>
              <div><div className="mute">납부 완료</div><b className="up" style={big}>{paidCnt}명</b></div>
              <div><div className="mute">미납</div><b style={big}>{unpaid.length}명</b></div>
            </div>
            <div className="row" style={{ marginTop: 14, gap: 16 }}>
              <div><div className="mute">납부율</div><b style={big}>{rate}%</b></div>
              <div style={{ flex: 1 }}><div className="bar" role="progressbar" aria-label="납부율" aria-valuemin="0" aria-valuemax="100" aria-valuenow={rate}><i style={{ width: rate + '%', background: 'var(--win)' }} /></div></div>
            </div>
            <div className="mute" style={{ marginTop: 6 }}>월회비 {won(f.amount)} · 납부일 매월 {due}일</div>
          </div>
          <div className="card"><b>미납 회원</b>
            {unpaid.length === 0 && <div className="mute" style={{ marginTop: 8 }}>미납 회원이 없어요 🎉</div>}
            {unpaid.map((m) => (
              <div className="row" key={m.name} style={{ marginTop: 10 }}>
                <span><div>{m.name}</div><div className="mute">{won(f.amount)}</div></span>
                <button type="button" className="tag" disabled={!admin} aria-label={`${m.name} 미납${admin ? ', 눌러서 납부 확인' : ''}`} onClick={() => setPaid(m.name, true)} style={{ cursor: admin ? 'pointer' : 'default', font: 'inherit', fontSize: 12, fontWeight: 700, color: 'var(--fg)' }}>미납</button>
              </div>))}
            {admin && unpaid.length > 0 && <div className="mute" style={{ marginTop: 10 }}>미납 표시를 누르면 수동으로 납부 확인돼요. (통장 입금은 자동 체크)</div>}
            {paidCnt > 0 && <div className="mute" style={{ marginTop: 10 }}>납부 완료: {club.members.filter((m) => paidNames.includes(m.name)).map((m) => m.name).join(', ')}</div>}
          </div>
        </div>)}

      {sec === '통장내역' && (
        <div>
          <div className="card">
            <b>모임통장</b>
            {acct ? (
              <div style={{ marginTop: 8 }}>
                <div className="row"><span>{acct.bank} ****{acct.last4}</span><span className="tag ball">연결됨</span></div>
                <div className="mute">예금주 {acct.holder}</div>
                <div className="row" style={{ marginTop: 8 }}><span className="mute">현재 잔액</span><b style={big}>{won(net(tx))}</b></div>
                {admin && <button className="btn" style={{ marginTop: 8 }} onClick={disconnect}>연결 해제</button>}
              </div>
            ) : admin ? (
              <div style={{ marginTop: 8 }}>
                <label>은행</label><select value={bank} onChange={(e) => setBank(e.target.value)}>{BANKS.map((b) => <option key={b}>{b}</option>)}</select>
                <label>계좌번호</label><input inputMode="numeric" value={no} onChange={(e) => setNo(e.target.value)} placeholder="숫자만 입력 (뒤 4자리만 저장돼요)" />
                <label>예금주</label><input value={holder} onChange={(e) => setHolder(e.target.value)} />
                <button className="btn ball" onClick={connect}>모임통장 연결</button>
              </div>
            ) : <div className="mute" style={{ marginTop: 8 }}>연결된 모임통장이 없어요.</div>}
          </div>
          {acct && admin && (
            <div className="card"><b>(시연) 통장 알림 받기</b>
              <div className="mute" style={{ margin: '4px 0 8px' }}>실제 연동 전, 통장에 입금·출금이 생겼을 때의 동작을 미리 볼 수 있어요.</div>
              <div className="grid2">
                <select aria-label="입금자" value={inWho} onChange={(e) => setInWho(e.target.value)}>{club.members.map((m) => <option key={m.name}>{m.name}</option>)}</select>
                <input aria-label="입금액" type="number" inputMode="numeric" value={inAmt} onChange={(e) => setInAmt(e.target.value)} />
              </div>
              <button className="btn" onClick={addIn}>입금 발생</button>
              <div className="grid2" style={{ marginTop: 12 }}>
                <select aria-label="지출 항목" value={outCat} onChange={(e) => setOutCat(e.target.value)}>{['공구입', '코트비', '회식', '기타'].map((x) => <option key={x}>{x}</option>)}</select>
                <input aria-label="출금액" type="number" inputMode="numeric" placeholder="출금액" value={outAmt} onChange={(e) => setOutAmt(e.target.value)} />
              </div>
              <input aria-label="메모" placeholder="메모 (예: 테니스공 2박스)" value={outMemo} onChange={(e) => setOutMemo(e.target.value)} />
              <button className="btn" onClick={addOut}>출금 발생</button>
            </div>)}
          <div className="card"><b>{+mo.slice(5)}월 거래내역</b>
            <div style={{ marginTop: 8 }}>{mtx.length ? mtx.map(txRow) : <div className="mute">거래내역이 없어요.</div>}</div></div>
        </div>)}

      {sec === '명세서' && (
        <div>
          <div className="card"><b>{+mo.slice(5)}월 명세서</b> <span className="mute">· 모든 회원이 볼 수 있어요</span>
            <div className="row" style={{ marginTop: 10 }}><span className="mute">전월 이월</span><span>{won(opening)}</span></div>
            <div className="row"><span className="mute">입금 합계</span><b className="up">+{won(inSum)}</b></div>
            <div className="row"><span className="mute">출금 합계</span><b className="down">-{won(outSum)}</b></div>
            <div className="row" style={{ marginTop: 6 }}><b>월말 잔액</b><b style={big}>{won(opening + inSum - outSum)}</b></div>
            <div className="row" style={{ marginTop: 6 }}><span className="mute">회비 납부</span><span>{paidCnt}/{total}명 ({rate}%)</span></div>
          </div>
          <div className="card"><b>거래 상세</b><div style={{ marginTop: 8 }}>{mtx.length ? mtx.map(txRow) : <div className="mute">거래내역이 없어요.</div>}</div></div>
          <div className="card"><b>회원별 납부 내역 (6개월)</b>
            <div style={{ overflowX: 'auto', marginTop: 8 }}>
              <table style={{ whiteSpace: 'nowrap' }}>
                <thead><tr><th className="mute" style={{ fontWeight: 400 }}>이름</th>{months.map((x) => <th key={x} className="mute" style={{ fontWeight: 400 }}>{+x.slice(5)}월</th>)}</tr></thead>
                <tbody>{club.members.map((m) => (
                  <tr key={m.name}><td><b>{m.name}</b></td>{months.map((x) => { const ok = (f.paid[x] || []).includes(m.name); return <td key={x} style={{ color: ok ? 'var(--win)' : 'var(--lose)', fontWeight: 700 }} aria-label={`${m.name} ${x} ${ok ? '납부' : '미납'}`}>{ok ? '✓' : '–'}</td>; })}</tr>))}</tbody>
              </table>
            </div>
          </div>
        </div>)}

      {sec === '알림' && (
        <div className="card"><b>알림</b>
          <div className="mute" style={{ margin: '4px 0 8px' }}>앱 안에서 보이는 알림이에요. 휴대폰 푸시 알림은 서버 연동 후에 보내져요.</div>
          {auto.map((a) => <div key={a} style={{ padding: '6px 0', borderTop: '1px solid var(--line)' }}>🔔 {a}</div>)}
          {alerts.map((a) => <div key={a.id} style={{ padding: '6px 0', borderTop: '1px solid var(--line)' }}><span className="mute">{a.date.slice(5)}</span> {a.text}</div>)}
        </div>)}
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

const FAB = { position: 'fixed', right: 16, bottom: 'calc(84px + env(safe-area-inset-bottom))', width: 56, height: 56, borderRadius: '50%', border: 0, background: 'var(--ball)', color: 'var(--ballfg)', fontSize: 32, lineHeight: 1, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,.3)', zIndex: 10 };

export default function Club({ me, setMe, clubs, setClubs, posts, setPosts, tours, setTours }) {
  const [top, setTop] = useState('내클럽'), [sub, setSub] = useState('클럽프로필'), [curId, setCurId] = useState(null);
  const [ar, setAr] = useState(''), [dist, setDist] = useState(''), [q, setQ] = useState(''), [viewId, setViewId] = useState(null), [creating, setCreating] = useState(false);
  const ym = today().slice(0, 7), mine = (c) => c.members.some((m) => m.name === ME), myClubs = clubs.filter(mine);
  const club = myClubs.find((c) => c.id === curId) || myClubs[0], viewed = clubs.find((c) => c.id === viewId);
  const upd = (id) => (fn) => setClubs((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));
  const me0 = { name: ME, birth: '-', career: '-', ntrp: ntrp(me.tier, me.pts), joined: ym };
  const join = (c) => setClubs(clubs.map((x) => (x.id === c.id ? { ...x, members: [...x.members, me0] } : x)));
  const create = (f) => {
    const id = 'c' + Date.now();
    setClubs([{ id, ...f, admin: ME, court: Object.keys(COURTS)[0], meetDay: '토', rules: [], achievements: [], members: [me0], notices: [], rankRules: [], rankLog: [], fees: { amount: 20000, paid: {} } }, ...clubs]);
    setCreating(false); setCurId(id); setSub('클럽프로필'); setTop('내클럽');
  };

  let body;
  if (top === '내클럽') {
    if (!club) body = <div className="card"><div>가입한 클럽이 없어요.</div><button className="btn ball" style={{ marginTop: 8 }} onClick={() => setTop('클럽모집')}>클럽모집 보러가기</button></div>;
    else {
      const admin = club.admin === ME, u = upd(club.id);
      body = (
        <div>
          {myClubs.length > 1 && <select aria-label="내 클럽" value={club.id} onChange={(e) => { setCurId(e.target.value); setSub('클럽프로필'); }}>{myClubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 12, paddingBottom: 4 }}>
            {SUBS.map((s) => <button key={s} className={'btn' + (sub === s ? ' ball' : '')} style={{ flex: 'none' }} aria-pressed={sub === s} onClick={() => setSub(s)}>{s}</button>)}
          </div>
          {sub === '클럽프로필' && <Info key={club.id} club={club} upd={u} admin={admin} me={me} />}
          {sub === '공지' && <Notices key={club.id} club={club} upd={u} isMember />}
          {sub === '정모매칭' && <Matches key={club.id} me={me} setMe={setMe} posts={posts} setPosts={setPosts} clubId={club.id} />}
          {sub === '월례대회' && <Tournaments key={club.id} tours={tours} setTours={setTours} me={me} clubId={club.id} club={club} />}
          {sub === '클럽랭킹' && <RankTab key={club.id} club={club} upd={u} admin={admin} />}
          {sub === '회비' && <Fees key={club.id} club={club} upd={u} admin={admin} />}
          {sub === '사진첩' && <div className="card"><span className="tag ball">개발 예정</span><p style={{ margin: '8px 0 0' }}>추후 업데이트</p></div>}
        </div>
      );
    }
  } else if (top === '클럽교류전') {
    body = <Tournaments tours={tours} setTours={setTours} me={me} exchange />;
  } else if (viewed) {
    body = (
      <div>
        <div className="row" style={{ marginBottom: 10 }}><button className="btn" onClick={() => setViewId(null)}>← 클럽 목록</button>
          {mine(viewed) ? <span className="tag ball">가입됨</span> : <button className="btn ball" onClick={() => join(viewed)}>가입</button>}</div>
        <Info key={viewed.id} club={viewed} upd={upd(viewed.id)} admin={viewed.admin === ME} me={me} />
      </div>
    );
  } else {
    const list = clubs.filter((c) => (!ar || c.area === ar) && (!dist || c.district.includes(dist)) && (!q || (c.name + c.intro).includes(q)));
    body = (
      <div>
        <h1>클럽 모집</h1>
        <div className="grid2">
          <select aria-label="지역" value={ar} onChange={(e) => setAr(e.target.value)}><option value="">지역 전체</option>{AREAS.map((a) => <option key={a}>{a}</option>)}</select>
          <input aria-label="구" placeholder="구/시 검색" value={dist} onChange={(e) => setDist(e.target.value)} />
        </div>
        <input placeholder="클럽 검색 (이름, 소개)" value={q} onChange={(e) => setQ(e.target.value)} />
        {list.length === 0 && <div className="card mute">조건에 맞는 클럽이 없어요.</div>}
        {list.map((c) => (
          <div className="card" key={c.id} role="button" tabIndex={0} style={{ cursor: 'pointer' }} onClick={() => setViewId(c.id)} onKeyDown={(e) => e.key === 'Enter' && setViewId(c.id)}>
            <div className="row"><b>{c.name}</b><span className="mute">{c.area} {c.district}</span></div>
            <div className="mute" style={{ margin: '4px 0' }}>{c.intro}</div>
            <div className="row"><span className="mute">회원 {c.members.length}명 · 주코트 {c.court} · 정모 {c.meetDay}요일</span>
              {mine(c) ? <span className="tag ball">가입됨</span> : <button className="btn" onClick={(e) => { e.stopPropagation(); join(c); }}>가입</button>}</div>
          </div>))}
        <button aria-label="클럽 만들기" onClick={() => setCreating(true)} style={FAB}>+</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
        {['내클럽', '클럽모집', '클럽교류전'].map((k) => <button key={k} className={'btn' + (top === k ? ' ball' : '')} aria-pressed={top === k} onClick={() => { setTop(k); setViewId(null); }}>{k}</button>)}
      </div>
      {body}
      {creating && <CreateClub onSubmit={create} onClose={() => setCreating(false)} />}
    </div>
  );
}
