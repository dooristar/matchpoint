'use client';
import { useState } from 'react';
import { TIERS, ntrp } from '../lib/rating';
import { SKILLS, SHORT, M_ITEMS, ntrpOfEval } from '../lib/skills';

// 프로필 기본 정보 (데모 값)
const PROFILE = {
  id: '뚜리스타',
  racket: '헤드 레디컬 MP 300g',
  string: '하이브리드 (시그넘프로 익스피어리언스 / 던롭 익스플로시브 레드)',
  badges: ['첫 랭크 승리', '10연승', '신규 상대 20명'],
};
const STYLES = ['올라운더', '베이스라이너', '서브앤발리', '슬라이스(스핀 마스터)', '문볼러'];
const SKILL_ORDER = SKILLS.map((x) => x.k);   // 목록·육각형 축 순서(시계방향)
const RADAR_ORDER = SKILL_ORDER;
const DEFAULT_SKILLS = { 포핸드: 15, 백핸드: 13, '서브&리턴': 16, '발리&네트플레이': 10, 안정성: 12, '파워&풋워크': 11 };
const DEFAULT_REVIEW = { 시간약속: 5, 라인콜: 4, 매너: 4, 재경기의향: 4 };
const DEFAULT_NTRP = 3.0;
const RECORDS = { 일반: { g: 50, w: 40 }, 랭크: { g: 30, w: 24 }, 클럽: { g: 15, w: 11 }, 대회: { g: 5, w: 5 } };

// 점수(1~20)에 따라 모양이 바뀌는 육각형
function Radar({ skills }) {
  const c = 110, r = 70;
  const pt = (i, v) => { const a = (-90 + i * 60) * Math.PI / 180; return [c + Math.cos(a) * r * v, c + Math.sin(a) * r * v]; };
  const ring = (v) => RADAR_ORDER.map((_, i) => pt(i, v).join(',')).join(' ');
  return (
    <svg viewBox="-40 0 300 220" width="228" height="167" role="img" aria-label="능력치 육각형 그래프">
      {[0.5, 1].map((v) => <polygon key={v} points={ring(v)} fill="none" stroke="var(--line)" />)}
      <polygon points={RADAR_ORDER.map((k, i) => pt(i, skills[k] / 20).join(',')).join(' ')} fill="var(--court)" fillOpacity=".35" stroke="var(--court)" strokeWidth="2" />
      {RADAR_ORDER.map((k, i) => { const [x, y] = pt(i, 1.3); return <text key={k} x={x} y={y} fontSize="11" textAnchor="middle" dominantBaseline="middle" fill="var(--mute)">{SHORT[k]}</text>; })}
    </svg>
  );
}

function Stars({ value, onChange, label, max = 5, size = 28 }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'flex' }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n}점`} onClick={() => onChange(n)}
          style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', fontSize: size, lineHeight: 1.2, color: n <= value ? '#e6b800' : 'var(--line)' }}>★</button>
      ))}
    </div>
  );
}

export default function Profile({ me, setMe }) {
  const [rec, setRec] = useState('일반'), [mode, setMode] = useState('통합');
  const received = (me.received || []).filter((e) => e.m && e.s);   // 새 평가 형식만 집계
  const avg = (get) => (received.length ? Math.round((received.reduce((a, e) => a + get(e), 0) / received.length) * 10) / 10 : null);
  const skills = {};
  SKILL_ORDER.forEach((k) => { const a = avg((e) => e.s[k]); skills[k] = a === null ? DEFAULT_SKILLS[k] : a; });
  const review = {};
  M_ITEMS.forEach((k) => { const a = avg((e) => e.m[k]); review[k] = a === null ? DEFAULT_REVIEW[k] : a; });
  const ntrpAvg = avg((e) => ntrpOfEval(e.s)), ntrpShow = ntrpAvg === null ? DEFAULT_NTRP : ntrpAvg;
  const styles = me.styles || ['올라운더'];
  const toggleStyle = (s) => setMe({ ...me, styles: styles.includes(s) ? styles.filter((x) => x !== s) : [...styles, s] });

  const log = me.matchLog || [];
  const stat = (arr) => { const w = arr.filter((x) => x.win).length; return `${arr.length}전 ${w}승 ${arr.length - w}패`; };
  const isSingle = (x) => (x.format || '단식') === '단식';
  const rows = log.filter((x) => x.kind === rec && (mode === '통합' || (mode === '단식' ? isSingle(x) : !isSingle(x))));
  const rate = rows.length ? Math.round((rows.filter((x) => x.win).length / rows.length) * 100) : 0;
  const dateOf = (ts) => { const d = new Date(ts); return `${d.getMonth() + 1}/${d.getDate()}`; };
  const infoRow = { marginBottom: 6, fontSize: 14 };
  const t = TIERS[me.tier];

  return (
    <div>
      <h1>프로필</h1>

      {/* 사진 + 뱃지 + 기본 정보 */}
      <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ position: 'relative', flex: 'none', width: 'min(150px, 38vw)' }}>
          <div className="photo" style={{ width: '100%', height: 'auto', aspectRatio: '1' }}>사진</div>
          <span className="tag ball" style={{ position: 'absolute', top: -8, right: -10 }}>🏅 {t.name}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={infoRow}><span className="mute">아이디 </span><b>{PROFILE.id}</b></div>
          <div style={infoRow}><span className="mute">랭크 </span><b>{t.name} ({ntrp(me.tier, me.pts)})</b></div>
          <div style={infoRow}><span className="mute">라켓 </span>{PROFILE.racket}</div>
          <div style={infoRow}><span className="mute">스트링 </span>{PROFILE.string}</div>
          <div style={infoRow}>
            <div className="mute">플레이스타일</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {STYLES.map((s) => (
                <button key={s} type="button" aria-pressed={styles.includes(s)} onClick={() => toggleStyle(s)}
                  className={'tag' + (styles.includes(s) ? ' ball' : '')} style={{ cursor: 'pointer', font: 'inherit', fontSize: 12, fontWeight: 700 }}>{s}</button>
              ))}
            </div>
          </div>
          <div style={infoRow}>
            <div className="mute">뱃지(업적)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              {PROFILE.badges.map((b) => <span key={b} className="tag">🏆 {b}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* 능력치: 육각형 + 점수 (받은 평가 평균이 반영돼요) */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
        <Radar skills={skills} />
        <div style={{ flex: '1 1 230px', minWidth: 0 }}>
          {SKILL_ORDER.map((k) => (
            <div key={k} className="row" style={{ padding: '5px 0' }}>
              <span style={{ fontSize: 14 }}>{k.replace('&', ' & ')}</span>
              <b>{skills[k]}<span className="mute" style={{ fontWeight: 400 }}>/20</span></b>
            </div>
          ))}
          <div className="mute" style={{ fontSize: 12, marginTop: 4 }}>{received.length ? `받은 평가 ${received.length}개 평균 반영` : '아직 받은 평가가 없어 예시 값이에요'}</div>
        </div>
      </div>

      {/* 랭크 경험치바 */}
      <div className="card">
        <b style={{ fontSize: 20 }}>랭크 {t.name} ({t.n.toFixed(1)})</b>
        {me.promo
          ? <div style={{ marginTop: 8 }}>승급전 {me.promo.w}승 {me.promo.l}패 · 5판 3승 (같은 등급 이상 상대만)</div>
          : <>
              <div className="bar" role="progressbar" aria-label="경험치" aria-valuemin="0" aria-valuemax="100" aria-valuenow={me.pts}><i style={{ width: me.pts + '%' }} /></div>
              <div className="row mute"><span>경험치 {me.pts}%</span><span>{me.tier < 6 ? `100%가 되면 승급전 · 다음 ${TIERS[me.tier + 1].name}` : '최고 등급'}</span></div>
            </>}
      </div>

      {/* 전적 */}
      <div className="card">
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <b>전적</b>
          <span>통산전적 <b>{stat(log)}</b></span>
        </div>
        <div className="mute">단식 {stat(log.filter(isSingle))} · 복식 {stat(log.filter((x) => !isSingle(x)))}</div>
        <div className="grid3" style={{ margin: '10px 0 8px' }}>
          {['통합', '단식', '복식'].map((k) => <button key={k} className={'btn' + (mode === k ? ' ball' : '')} aria-pressed={mode === k} onClick={() => setMode(k)}>{k}</button>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, margin: '0 0 10px' }}>
          {['일반', '랭크', '클럽', '대회'].map((k) => (
            <button key={k} className={'btn' + (rec === k ? ' ball' : '')} aria-pressed={rec === k} onClick={() => setRec(k)}>{k}</button>
          ))}
        </div>
        <div>{rec} {mode} · <b>{stat(rows)}</b> <span className="mute">· 승률 {rate}%</span></div>
        <div style={{ marginTop: 8 }}>
          {rows.length === 0 && <div className="mute">아직 경기 기록이 없어요.</div>}
          {rows.slice().reverse().map((x, i) => (
            <div className="row" key={(x.id || '') + i} style={{ padding: '6px 0', borderTop: '1px solid var(--line)', alignItems: 'flex-start' }}>
              <span style={{ minWidth: 0 }}><span className="mute">{dateOf(x.ts)}</span> {(x.a || ['나']).join(', ')} <b>{x.sa == null ? '' : x.sa}</b> vs <b>{x.sb == null ? '' : x.sb}</b> {(x.b || ['상대']).join(', ')}</span>
              <b className={x.win ? 'up' : 'down'} style={{ flex: 'none' }}>{x.win ? '승' : '패'}</b>
            </div>))}
        </div>
      </div>

      {/* 받은 평가 */}
      <div className="card">
        <b>받은 평가</b> <span className="mute">{received.length ? `${received.length}개 평가 누적` : '아직 없어요 (예시 값)'}</span>
        <div className="row" style={{ marginTop: 10 }}><span>NTRP</span><b style={{ fontSize: 22 }}>{ntrpShow.toFixed(1)}</b></div>
        <div className="mute" style={{ fontSize: 12 }}>상대방이 평가한 NTRP를 누적한 평균이에요.</div>
        {M_ITEMS.map((name) => (
          <div className="row" key={name} style={{ marginTop: 8 }}>
            <span>{name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span role="img" aria-label={`${name} 평균 ${review[name]}점`} style={{ fontSize: 24, color: '#e6b800' }}>{'★'.repeat(Math.round(review[name]))}<span style={{ color: 'var(--line)' }}>{'★'.repeat(5 - Math.round(review[name]))}</span></span>
              <span className="mute" style={{ minWidth: 30, textAlign: 'right' }}>{Number(review[name]).toFixed(1)}/5</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
