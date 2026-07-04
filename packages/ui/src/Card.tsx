import React from 'react';
import { clsx } from 'clsx';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'rounded-lg border border-gray-200 bg-white p-6 shadow-sm',
        className
      )}
      {...props}
    />
  )
);

Card.displayName = 'Card';
