'use client';
import { useEffect, useState } from 'react';
import Profile from '../components/Profile';
import Matches from '../components/Matches';
import Soon from '../components/Soon';
import { initialMe } from '../lib/rating';

// 기획서 1페이지 구조 그대로: 프로필 / 일반·랭크매칭 / 클럽 / 대회(대관) / 중고마켓(추후) / 레슨(추후)
const TABS = [['profile', '프로필'], ['match', '일반/랭크 매칭'], ['club', '클럽'], ['tour', '대회(대관)'], ['market', '중고마켓 · 추후'], ['lesson', '레슨 · 추후']];
const KEY = 'court-mate-dev';

export default function Page() {
  const [tab, setTab] = useState('match');
  const [me, setMe] = useState(initialMe());
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) setMe(s); } catch (e) {} setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(me)); } catch (e) {} }, [me, ready]);
  return (
    <>
      <main>
        {tab === 'profile' && <Profile me={me} setMe={setMe} />}
        {tab === 'match' && <Matches me={me} />}
        {tab === 'club' && <Soon title="클럽" items={['클럽 만들기 · 멤버 관리', '클럽 내 경기 기록과 랭킹', '자동 대진 생성']} />}
        {tab === 'tour' && <Soon title="대회 (대관)" items={['대회 개설 · 참가 신청', '앱 랭크 기준 참가 자격 확인', '코트 대관']} />}
        {tab === 'market' && <Soon title="중고마켓" items={['추후 업데이트']} />}
        {tab === 'lesson' && <Soon title="레슨" items={['추후 업데이트']} />}
      </main>
      <nav>{TABS.map(([k, t]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); scrollTo(0, 0); }}>{t}</button>)}</nav>
    </>
  );
}
