'use client';
import { useState } from 'react';

export default function Market() {
  const [tab, setTab] = useState('라켓');
  return (
    <div>
      <h1>마켓</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 12 }}>
        {['라켓', '스트링', '기타', '중고'].map((k) => <button key={k} className={'btn' + (tab === k ? ' ball' : '')} aria-pressed={tab === k} onClick={() => setTab(k)}>{k}</button>)}
      </div>
      <div className="card"><span className="tag ball">추후 업데이트</span><p style={{ margin: '8px 0 0' }}>{tab} 마켓은 준비 중이에요.</p></div>
    </div>
  );
}
