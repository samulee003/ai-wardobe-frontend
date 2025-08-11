import React from 'react';

export default function AdCard() {
  return (
    <div className="rounded-2xl p-4 bg-gradient-to-br from-orange-50 to-pink-50 border border-orange-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-slate-800 font-semibold">AI 穿搭小提醒</div>
          <div className="text-slate-600 text-sm mt-1">上傳更多單品可獲得更精準的推薦</div>
        </div>
        <a
          href="/upload"
          className="h-9 px-3 inline-grid place-content-center rounded-full text-white bg-gradient-to-br from-pink-400 to-orange-300 shadow"
        >
          立即上傳
        </a>
      </div>
    </div>
  );
}


