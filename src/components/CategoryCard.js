import React from 'react';
import { Link } from 'react-router-dom';

function CategoryCard({ title = '類別', count = 0, href = '#', className = '' }) {
  return (
    <div className={[
      'rounded-2xl p-4 border border-pink-100 shadow-sm bg-white',
      className
    ].join(' ')}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-[18px] text-slate-800">{title}</h3>
            <span className="bg-pink-100 text-pink-600 rounded-xl px-2 py-0.5 text-[12px] font-medium">
              {count}個
            </span>
          </div>

          <div className="mt-4">
            <div className="h-24 w-24 rounded-xl bg-slate-100 grid place-content-center">
              <span className="text-slate-400 text-3xl">＋</span>
              <span className="sr-only">添加</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2">
          <Link
            to={href}
            className="h-9 w-9 rounded-full grid place-content-center text-white bg-gradient-to-br from-pink-400 to-orange-300 shadow"
            aria-label="進入"
          >
            <span className="text-sm">→</span>
          </Link>
          <button
            className="h-9 w-9 rounded-full bg-pink-50 text-pink-500 hover:text-pink-600"
            aria-label="設定"
          >
            ⚙️
          </button>
        </div>
      </div>
    </div>
  );
}

export default CategoryCard;


