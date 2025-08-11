import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function MobileShell({
  title = '標題',
  children,
  showBack = false,
  action = { type: 'none' }, // { type: 'text', label, href?, onClick? } | { type: 'none' }
  hideBottomNav = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white">
      {/* Top gradient header */}
      <header className="relative">
        <div className="h-28 w-full bg-gradient-to-br from-pink-200 via-pink-100 to-blue-100" />
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-4 pb-3 flex items-center justify-between text-slate-800">
            <button
              aria-label="返回"
              onClick={() => navigate(-1)}
              className={[
                'h-10 w-10 grid place-content-center rounded-full text-slate-700/80',
                showBack ? 'opacity-100' : 'opacity-0 pointer-events-none',
              ].join(' ')}
            >
              ←
            </button>
            <h1 className="text-[22px] font-semibold tracking-wide">{title}</h1>
            {action?.type === 'text' ? (
              action.href ? (
                <Link
                  to={action.href}
                  className="text-[16px] text-slate-700/90 hover:text-slate-900"
                  aria-label={action.label}
                >
                  {action.label}
                </Link>
              ) : (
                <button
                  onClick={action.onClick}
                  className="text-[16px] text-slate-700/90 hover:text-slate-900"
                  aria-label={action.label}
                >
                  {action.label}
                </button>
              )
            ) : (
              <span className="w-10" />
            )}
          </div>
        </div>
      </header>

      {/* Page body */}
      <main className="flex-1 px-4 pb-32 pt-4">{children}</main>

      {!hideBottomNav && <BottomNav currentPath={location.pathname} />}
    </div>
  );
}

function BottomNav({ currentPath }) {
  const items = [
    { href: '/items', icon: '🧩', label: '單品' },
    { href: '/outfits', icon: '✨', label: '穿搭' },
    { href: '/wardrobe', icon: '👔', label: '衣櫃' },
    { href: '/settings', icon: '⚙️', label: '我的' },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-t">
      <div className="relative mx-auto max-w-sm">
        <ul className="grid grid-cols-5 items-end text-xs text-slate-500 px-2 pt-2 pb-4">
          {items.map((it) => {
            const active = currentPath === it.href || (it.href !== '/' && currentPath.startsWith(it.href));
            return (
              <li key={it.href} className="flex flex-col items-center">
                <Link
                  to={it.href}
                  className={[
                    'flex flex-col items-center gap-1 pt-6',
                    active ? 'text-pink-500' : 'text-slate-500',
                  ].join(' ')}
                >
                  <span className="h-5 w-5 text-base">{it.icon}</span>
                  <span>{it.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Center FAB */}
        <Link
          to="/upload"
          aria-label="新增"
          className="absolute -top-7 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full grid place-content-center shadow-lg bg-gradient-to-br from-pink-400 to-orange-300 text-white"
        >
          ＋
        </Link>
      </div>
    </nav>
  );
}

export default MobileShell;


