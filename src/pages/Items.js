import React from 'react';
import MobileShell from '../components/MobileShell';
import CategoryCard from '../components/CategoryCard';

function GradientPanel({ children }) {
  return (
    <div className="rounded-3xl p-3 bg-gradient-to-br from-pink-50 via-pink-50 to-blue-50">
      <div className="space-y-4">{children}</div>
    </div>
  );
}

const Items = () => {
  return (
    <MobileShell title="單品">
      <div className="space-y-4">
        <GradientPanel>
          <div className="space-y-4">
            <CategoryCard title="無分類" count={0} href="/items/uncategorized" />
            <CategoryCard title="內衣" count={0} href="/items/underwear" />
            <CategoryCard title="上裝" count={0} href="/items/tops" />
            <CategoryCard title="下裝" count={0} href="/items/bottoms" />
          </div>
        </GradientPanel>
      </div>
    </MobileShell>
  );
};

export default Items;


