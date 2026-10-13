'use client';
import { useState } from 'react';
import { TIERS, tierLabel, ntrp } from '../lib/rating';

// 프로필 기본 정보 (데모 값)
const PROFILE = {
  id: '뚜리스타',
  racket: '헤드 레디컬 MP 300g',
  string: '하이브리드 (시그넘프로 익스피어리언스 / 던롭 익스플로시브 레드)',
  badges: ['첫 랭크 승리', '10연승', '신규 상대 20명'],
};
const STYLES = ['올라운더', '베이스라이너', '서브앤발리', '슬라이스(스핀 마스터)', '문볼러'];
const SKILLS = [['스트로크', 70], ['서브', 55], ['발리', 45], ['매너', 90], ['운영', 65], ['무브먼트', 60]];
const LEVELS = [2.0, 2.5, 3.0, 3.5, 4.0];
const REVIEW_ROWS = [['level', '실력수준'], ['manner', '매너'], ['time', '시간약속'], ['attitude', '경기태도'], ['rematch', '재경기의향']];
const DEFAULT_REVIEW = { level: 3, manner: 4, time: 5, attitude: 4, rematch: 4 };
const RECORDS = { 일반: { g: 50, w: 40 }, 랭크: { g: 30, w: 24 }, 클럽: { g: 15, w: 11 }, 대회: { g: 5, w: 5 } };

function Radar() {
  const c = 110, r = 70;
  const pt = (i, v) => { const a = (-90 + i * 60) * Math.PI / 180; return [c + Math.cos(a) * r * v, c + Math.sin(a) * r * v]; };
  const ring = (v) => SKILLS.map((_, i) => pt(i, v).join(',')).join(' ');
  return (
    <svg viewBox="0 0 220 220" width="220" height="220" role="img" aria-label="능력치 육각형 그래프">
      {[0.5, 1].map((v) => <polygon key={v} points={ring(v)} fill="none" stroke="var(--line)" />)}
      <polygon points={SKILLS.map(([, v], i) => pt(i, v / 100).join(',')).join(' ')} fill="var(--court)" fillOpacity=".35" stroke="var(--court)" strokeWidth="2" />
      {SKILLS.map(([name], i) => { const [x, y] = pt(i, 1.28); return <text key={name} x={x} y={y} fontSize="11" textAnchor="middle" dominantBaseline="middle" fill="var(--mute)">{name}</text>; })}
    </svg>
  );
}

function Stars({ value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n}번째 별`} onClick={() => onChange(n)}
          style={{ background: 'none', border: 0, padding: 2, cursor: 'pointer', fontSize: 28, lineHeight: 1, color: n <= value ? '#e6b800' : 'var(--line)' }}>★</button>
      ))}
    </div>
  );
}

export default function Profile({ me, setMe }) {
  const [rec, setRec] = useState('일반');
  const review = { ...DEFAULT_REVIEW, ...(me.review || {}) };
  const styles = me.styles || ['올라운더'];
  const setReview = (k, v) => setMe({ ...me, review: { ...review, [k]: v } });
  const toggleStyle = (s) => setMe({ ...me, styles: styles.includes(s) ? styles.filter((x) => x !== s) : [...styles, s] });

  const fmt = (r) => `${r.g}전 ${r.w}승 ${r.g - r.w}패`;
  const total = Object.values(RECORDS).reduce((a, r) => ({ g: a.g + r.g, w: a.w + r.w }), { g: 0, w: 0 });
  const cur = RECORDS[rec];
  const infoRow = { marginBottom: 6, fontSize: 14 };

  return (
    <div>
      <h1>프로필</h1>

      {/* 사진 + 뱃지 + 기본 정보 */}
      <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ position: 'relative', flex: 'none' }}>
          <div className="photo" style={{ width: 104, height: 104 }}>사진</div>
          <span className="tag ball" style={{ position: 'absolute', top: -8, right: -10 }}>🏅 {TIERS[me.tier].name}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={infoRow}><span className="mute">아이디 </span><b>{PROFILE.id}</b></div>
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

      {/* 육각형 그래프 */}
      <div className="card" style={{ display: 'grid', placeItems: 'center' }}>
        <Radar />
      </div>

      {/* 랭크 */}
      <div className="card">
        <div className="row"><b style={{ fontSize: 20 }}>랭크 {TIERS[me.tier].name} ({ntrp(me.tier, me.pts)})</b><span className="tag">{tierLabel(me.tier)}</span></div>
        {me.promo
          ? <div style={{ marginTop: 8 }}>승급전 {me.promo.w}승 {me.promo.l}패 · 5판 3승 (같은 등급 이상 상대만)</div>
          : <><div className="bar"><i style={{ width: me.pts + '%' }} /></div><div className="mute">{me.pts} / 100점</div></>}
      </div>

      {/* 전적 */}
      <div className="card">
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <b>전적</b>
          <span>통산전적 <b>{fmt(total)}</b></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, margin: '10px 0' }}>
          {Object.keys(RECORDS).map((k) => (
            <button key={k} className={'btn' + (rec === k ? ' ball' : '')} aria-pressed={rec === k} onClick={() => setRec(k)}>{k}</button>
          ))}
        </div>
        <div>{rec} 전적 · <b>{fmt(cur)}</b> <span className="mute">· 승률 {Math.round((cur.w / cur.g) * 100)}%</span></div>
      </div>

      {/* 평가 */}
      <div className="card">
        <b>평가</b>
        {REVIEW_ROWS.map(([k, name]) => (
          <div className="row" key={k} style={{ marginTop: 8 }}>
            <span>{name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Stars value={review[k]} onChange={(v) => setReview(k, v)} label={name} />
              <span className="mute" style={{ minWidth: 30, textAlign: 'right' }}>{k === 'level' ? LEVELS[review[k] - 1].toFixed(1) : `${review[k]}/5`}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
