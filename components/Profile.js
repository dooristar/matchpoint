'use client';
import { useState } from 'react';
import { TIERS, ntrp } from '../lib/rating';

// 프로필 기본 정보 (데모 값)
const PROFILE = {
  id: '뚜리스타',
  racket: '헤드 레디컬 MP 300g',
  string: '하이브리드 (시그넘프로 익스피어리언스 / 던롭 익스플로시브 레드)',
  badges: ['첫 랭크 승리', '10연승', '신규 상대 20명'],
};
const STYLES = ['올라운더', '베이스라이너', '서브앤발리', '슬라이스(스핀 마스터)', '문볼러'];
const SKILL_ORDER = ['스트로크', '서브', '발리', '무브먼트', '운영', '매너'];   // 목록 순서
const RADAR_ORDER = ['스트로크', '서브', '발리', '매너', '운영', '무브먼트'];   // 육각형 축 순서(시계방향)
const DEFAULT_SKILLS = { 스트로크: 9, 서브: 10, 발리: 5, 무브먼트: 5, 운영: 5, 매너: 10 };
const LEVELS = [2.0, 2.5, 3.0, 3.5, 4.0];
const REVIEW_ROWS = [['level', '실력수준'], ['manner', '매너'], ['time', '시간약속'], ['attitude', '경기태도'], ['rematch', '재경기의향']];
const DEFAULT_REVIEW = { level: 3, manner: 4, time: 5, attitude: 4, rematch: 4 };
const RECORDS = { 일반: { g: 50, w: 40 }, 랭크: { g: 30, w: 24 }, 클럽: { g: 15, w: 11 }, 대회: { g: 5, w: 5 } };

// 점수(1~10)에 따라 모양이 바뀌는 육각형
function Radar({ skills }) {
  const c = 110, r = 70;
  const pt = (i, v) => { const a = (-90 + i * 60) * Math.PI / 180; return [c + Math.cos(a) * r * v, c + Math.sin(a) * r * v]; };
  const ring = (v) => RADAR_ORDER.map((_, i) => pt(i, v).join(',')).join(' ');
  return (
    <svg viewBox="0 0 220 220" width="190" height="190" role="img" aria-label="능력치 육각형 그래프">
      {[0.5, 1].map((v) => <polygon key={v} points={ring(v)} fill="none" stroke="var(--line)" />)}
      <polygon points={RADAR_ORDER.map((k, i) => pt(i, skills[k] / 10).join(',')).join(' ')} fill="var(--court)" fillOpacity=".35" stroke="var(--court)" strokeWidth="2" />
      {RADAR_ORDER.map((k, i) => { const [x, y] = pt(i, 1.28); return <text key={k} x={x} y={y} fontSize="11" textAnchor="middle" dominantBaseline="middle" fill="var(--mute)">{k}</text>; })}
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
  const [rec, setRec] = useState('일반');
  const skills = { ...DEFAULT_SKILLS, ...(me.skills || {}) };
  const review = { ...DEFAULT_REVIEW, ...(me.review || {}) };
  const styles = me.styles || ['올라운더'];
  const setSkill = (k, v) => setMe({ ...me, skills: { ...skills, [k]: v } });
  const setReview = (k, v) => setMe({ ...me, review: { ...review, [k]: v } });
  const toggleStyle = (s) => setMe({ ...me, styles: styles.includes(s) ? styles.filter((x) => x !== s) : [...styles, s] });

  const fmt = (r) => `${r.g}전 ${r.w}승 ${r.g - r.w}패`;
  const total = Object.values(RECORDS).reduce((a, r) => ({ g: a.g + r.g, w: a.w + r.w }), { g: 0, w: 0 });
  const cur = RECORDS[rec];
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

      {/* 능력치: 육각형 + 별점 (별을 누르면 육각형 모양이 바뀜) */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
        <Radar skills={skills} />
        <div style={{ flex: '1 1 250px', minWidth: 0 }}>
          {SKILL_ORDER.map((k) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ width: 54, fontSize: 14 }}>{k}</span>
              <Stars value={skills[k]} onChange={(v) => setSkill(k, v)} label={k} max={10} size={17} />
              <span className="mute" style={{ minWidth: 34 }}>{skills[k]}/10</span>
            </div>
          ))}
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
