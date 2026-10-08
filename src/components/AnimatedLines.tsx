export default function AnimatedLines() {
  return (
    <div
      className='absolute inset-0 overflow-visible pointer-events-none z-0'
      style={{ minHeight: '100%' }}
    >
      {/* Lines moving left to right */}
      <div
        className='absolute h-[3px] bg-primary line-ltr-1'
        style={{
          top: '10%',
          left: '-200px',
          width: '200px',
          boxShadow: '0 0 10px oklch(65% 0.20 280 / 0.8)',
          opacity: 1,
        }}
      />
      <div
        className='absolute h-[3px] bg-primary line-ltr-2'
        style={{
          top: '25%',
          left: '-300px',
          width: '300px',
          boxShadow: '0 0 10px oklch(65% 0.20 280 / 0.8)',
          opacity: 1,
        }}
      />
      <div
        className='absolute h-[3px] bg-primary line-ltr-3'
        style={{
          top: '40%',
          left: '-150px',
          width: '150px',
          boxShadow: '0 0 10px oklch(65% 0.20 280 / 0.8)',
          opacity: 1,
        }}
      />
      <div
        className='absolute h-[3px] bg-primary line-ltr-4'
        style={{
          top: '55%',
          left: '-250px',
          width: '250px',
          boxShadow: '0 0 10px oklch(65% 0.20 280 / 0.8)',
          opacity: 1,
        }}
      />
      <div
        className='absolute h-[3px] bg-primary line-ltr-5'
        style={{
          top: '70%',
          left: '-180px',
          width: '180px',
          boxShadow: '0 0 10px oklch(65% 0.20 280 / 0.8)',
          opacity: 1,
        }}
      />
      <div
        className='absolute h-[3px] bg-primary line-ltr-6'
        style={{
          top: '85%',
          left: '-350px',
          width: '350px',
          boxShadow: '0 0 10px oklch(65% 0.20 280 / 0.8)',
          opacity: 1,
        }}
      />

      {/* Lines moving right to left */}
      <div
        className='absolute h-[3px] bg-primary line-rtl-1'
        style={{
          top: '15%',
          right: '-180px',
          width: '180px',
          boxShadow: '0 0 10px oklch(65% 0.20 280 / 0.8)',
          opacity: 1,
        }}
      />
      <div
        className='absolute h-[3px] bg-primary line-rtl-2'
        style={{
          top: '30%',
          right: '-220px',
          width: '220px',
          boxShadow: '0 0 10px oklch(65% 0.20 280 / 0.8)',
          opacity: 1,
        }}
      />
      <div
        className='absolute h-[3px] bg-primary line-rtl-3'
        style={{
          top: '45%',
          right: '-280px',
          width: '280px',
          boxShadow: '0 0 10px oklch(65% 0.20 280 / 0.8)',
          opacity: 1,
        }}
      />
      <div
        className='absolute h-[3px] bg-primary line-rtl-4'
        style={{
          top: '60%',
          right: '-160px',
          width: '160px',
          boxShadow: '0 0 10px oklch(65% 0.20 280 / 0.8)',
          opacity: 1,
        }}
      />
      <div
        className='absolute h-[3px] bg-primary line-rtl-5'
        style={{
          top: '75%',
          right: '-240px',
          width: '240px',
          boxShadow: '0 0 10px oklch(65% 0.20 280 / 0.8)',
          opacity: 1,
        }}
      />
      <div
        className='absolute h-[3px] bg-primary line-rtl-6'
        style={{
          top: '90%',
          right: '-200px',
          width: '200px',
          boxShadow: '0 0 10px oklch(65% 0.20 280 / 0.8)',
          opacity: 1,
        }}
      />
    </div>
  );
}
