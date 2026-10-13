'use client';
import { useEffect, useState } from 'react';
import Profile from '../components/Profile';
import Matches from '../components/Matches';
import Soon from '../components/Soon';
import { initialMe } from '../lib/rating';
import { SEED_POSTS } from '../lib/data';

const TABS = [['profile', '프로필'], ['match', '일반/랭크 매칭'], ['club', '클럽'], ['tour', '대회(대관)'], ['market', '중고마켓 · 추후'], ['lesson', '레슨 · 추후']];
const KEY = 'court-mate-dev', PKEY = 'court-mate-posts-v2';

export default function Page() {
  const [tab, setTab] = useState('match');
  const [me, setMe] = useState(initialMe());
  const [posts, setPosts] = useState(SEED_POSTS);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s) setMe(s); } catch (e) {}
    try { const p = JSON.parse(localStorage.getItem(PKEY)); if (p) setPosts(p); } catch (e) {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(me)); localStorage.setItem(PKEY, JSON.stringify(posts)); } catch (e) {} }, [me, posts, ready]);
  return (
    <>
      <main>
        {tab === 'profile' && <Profile me={me} setMe={setMe} />}
        {tab === 'match' && <Matches me={me} setMe={setMe} posts={posts} setPosts={setPosts} />}
        {tab === 'club' && <Soon title="클럽" items={['클럽 만들기 · 멤버 관리', '클럽 내 경기 기록과 랭킹', '자동 대진 생성']} />}
        {tab === 'tour' && <Soon title="대회 (대관)" items={['대회 개설 · 참가 신청', '앱 랭크 기준 참가 자격 확인', '코트 대관']} />}
        {tab === 'market' && <Soon title="중고마켓" items={['추후 업데이트']} />}
        {tab === 'lesson' && <Soon title="레슨" items={['추후 업데이트']} />}
      </main>
      <nav>{TABS.map(([k, t]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => { setTab(k); scrollTo(0, 0); }}>{t}</button>)}</nav>
    </>
  );
}
