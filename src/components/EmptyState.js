import React from 'react';
import Button from './ui/Button';

function EmptyState({
  icon = '👔',
  title = '暫無資料',
  description = '目前沒有內容，試著新增或調整篩選條件。',
  primaryAction,
  secondaryAction,
  className = ''
}) {
  return (
    <div
      className={[
        'text-center rounded-lg border border-border bg-surface p-10 shadow-sm',
        className
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <div className="text-6xl mb-4" aria-hidden>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-textPrimary mb-2">{title}</h3>
      <p className="text-sm text-textSecondary mb-6">{description}</p>

      <div className="flex items-center justify-center gap-3">
        {primaryAction && (
          <Button onClick={primaryAction.onClick} variant={primaryAction.variant || 'primary'} size={primaryAction.size || 'lg'}>
            {primaryAction.label}
          </Button>
        )}
        {secondaryAction && (
          <Button onClick={secondaryAction.onClick} variant={secondaryAction.variant || 'secondary'} size={secondaryAction.size || 'md'}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  );
}

export default EmptyState;


