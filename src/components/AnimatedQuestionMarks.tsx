import { HelpCircle } from 'lucide-react';

export default function AnimatedQuestionMarks() {
  return (
    <div
      className='fixed inset-0 overflow-hidden pointer-events-none z-0'
      style={{ minHeight: '100vh' }}
    >
      {/* Question mark icons with different animations */}
      <HelpCircle
        className='absolute text-primary/50 question-mark-1'
        size={32}
        style={{
          top: '10%',
          left: '5%',
        }}
      />
      <HelpCircle
        className='absolute text-primary/50 question-mark-2'
        size={40}
        style={{
          top: '20%',
          right: '8%',
        }}
      />
      <HelpCircle
        className='absolute text-primary/50 question-mark-3'
        size={28}
        style={{
          top: '35%',
          left: '12%',
        }}
      />
      <HelpCircle
        className='absolute text-primary/50 question-mark-4'
        size={36}
        style={{
          top: '50%',
          right: '15%',
        }}
      />
      <HelpCircle
        className='absolute text-primary/50 question-mark-5'
        size={30}
        style={{
          top: '65%',
          left: '7%',
        }}
      />
      <HelpCircle
        className='absolute text-primary/50 question-mark-6'
        size={38}
        style={{
          top: '75%',
          right: '10%',
        }}
      />
      <HelpCircle
        className='absolute text-primary/50 question-mark-7'
        size={34}
        style={{
          top: '85%',
          left: '18%',
        }}
      />
      <HelpCircle
        className='absolute text-primary/50 question-mark-8'
        size={32}
        style={{
          top: '15%',
          left: '25%',
        }}
      />
      <HelpCircle
        className='absolute text-primary/50 question-mark-9'
        size={28}
        style={{
          top: '45%',
          right: '25%',
        }}
      />
      <HelpCircle
        className='absolute text-primary/50 question-mark-10'
        size={36}
        style={{
          top: '60%',
          left: '20%',
        }}
      />
    </div>
  );
}
