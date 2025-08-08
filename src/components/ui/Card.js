import React from 'react';

export function Card({ className = '', children, ...props }) {
  return (
    <div
      className={[
        'bg-white rounded-lg border border-border shadow-sm',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }) {
  return (
    <div className={["p-4 border-b border-border", className].join(' ')} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }) {
  return (
    <h3 className={["text-base font-semibold text-textPrimary", className].join(' ')} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = '', children, ...props }) {
  return (
    <div className={["p-4", className].join(' ')} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = '', children, ...props }) {
  return (
    <div className={["p-4 border-t border-border", className].join(' ')} {...props}>
      {children}
    </div>
  );
}

export default Card;


