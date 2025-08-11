import React from 'react';
import { useParams, Link } from 'react-router-dom';
import MobileShell from '../components/MobileShell';

const CATEGORY_LABELS = {
  uncategorized: '無分類',
  work: '工作',
  casual: '休閒',
};

function GradientPanel({ children }) {
  return (
    <div className="rounded-3xl p-3 bg-gradient-to-br from-pink-50 via-pink-50 to-blue-50">
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function OutfitCategory() {
  const { category } = useParams();
  const title = CATEGORY_LABELS[category] || '穿搭';

  return (
    <MobileShell title={title} showBack>
      <div className="space-y-4">
        <GradientPanel>
          <div className="space-y-3">
            <div className="text-slate-600 text-sm">目前尚無「{title}」穿搭分類內容。</div>
            <div className="flex gap-3">
              <Link
                to="/outfits"
                className="px-4 h-10 inline-grid place-content-center rounded-full border border-pink-200 text-pink-600 bg-white"
              >
                返回分類
              </Link>
              <Link
                to="/upload"
                className="px-4 h-10 inline-grid place-content-center rounded-full text-white bg-gradient-to-br from-pink-400 to-orange-300 shadow"
              >
                新增衣物
              </Link>
            </div>
          </div>
        </GradientPanel>
      </div>
    </MobileShell>
  );
}


