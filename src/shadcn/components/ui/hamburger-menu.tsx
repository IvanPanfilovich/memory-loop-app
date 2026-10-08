import React from 'react';
import { cn } from '@/lib/utils';

interface HamburgerMenuProps {
  className?: string;
  isOpen?: boolean;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ className, isOpen = false }) => {
  return (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={cn('transition-transform duration-200', className)}
    >
      <path
        d='M3 12H21M3 6H21M3 18H21'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={cn('transition-all duration-200', isOpen && 'opacity-0')}
      />
      <path
        d='M6 6L18 18M6 18L18 6'
        stroke='currentColor'
        strokeWidth='2'
        strokeLinecap='round'
        strokeLinejoin='round'
        className={cn('transition-all duration-200 opacity-0', isOpen && 'opacity-100')}
      />
    </svg>
  );
};
