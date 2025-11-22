import React from 'react';
import { cn } from '@/lib/utils';
import type { ButtonProps } from './types';

export interface ButtonPropsExtended extends ButtonProps {
  children: React.ReactNode;
}

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  ariaLabel?: string;
  className?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = React.memo(({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ariaLabel,
  className,
  children
}) => {
  const base = 'rounded';
  const variantCls = variant === 'primary'
    ? 'bg-primary text-white'
    : variant === 'secondary'
      ? 'bg-white text-primary border border-primary'
      : 'bg-transparent text-primary';
  const sizeCls = size === 'sm' ? 'px-3 py-1 text-sm' : size === 'md' ? 'px-4 py-2' : 'px-6 py-3';

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(base, variantCls, sizeCls, className ?? '')}
      aria-disabled={disabled || loading}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
