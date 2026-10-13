'use client';
import { useState } from 'react';

// 담당자 연락처: 아래 두 값만 실제 정보로 바꾸면 돼요
const EMAIL = 'support@example.com';
const KAKAO = '@카카오채널ID';

export default function Inquiry() {
  const [t, setT] = useState(''), [b, setB] = useState('');
  const href = `mailto:${EMAIL}?subject=${encodeURIComponent(t || '[코트메이트] 문의')}&body=${encodeURIComponent(b)}`;
  const box = { width: '100%', font: 'inherit', padding: 10, border: '1px solid var(--line)', borderRadius: 10, background: 'var(--bg)', color: 'var(--fg)', margin: '4px 0 8px' };
  return (
    <div>
      <h1>문의</h1>
      <div className="card">
        <div className="row"><span className="mute">담당자 이메일</span><a href={`mailto:${EMAIL}`} style={{ color: 'var(--court)', fontWeight: 700 }}>{EMAIL}</a></div>
        <div className="row" style={{ marginTop: 8 }}><span className="mute">카카오톡</span><b>{KAKAO}</b></div>
      </div>
      <div className="card">
        <b>메일로 문의하기</b>
        <label style={{ display: 'block', marginTop: 8 }}>제목</label><input value={t} onChange={(e) => setT(e.target.value)} />
        <label>내용</label><textarea rows={5} value={b} onChange={(e) => setB(e.target.value)} style={box} />
        <a className="btn ball" href={href} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>메일 앱으로 보내기</a>
      </div>
    </div>
  );
}
