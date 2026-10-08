import React from 'react';

interface LoadingScreenProps {
  isVisible: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className='fixed inset-0 z-[9999] bg-white dark:bg-black flex items-center justify-center'>
      <div className='text-black dark:text-white text-4xl sm:text-6xl font-bold tracking-wider'>
        <div className='flex flex-col sm:flex-row items-center sm:items-baseline gap-0 sm:gap-0'>
          <span className='animate-pulse'>memory</span>
          <span className='animate-pulse sm:ml-0'>loop</span>
        </div>
      </div>
    </div>
  );
};
