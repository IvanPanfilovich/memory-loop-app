import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/shadcn/components/ui/card';
import { Separator } from '@/shadcn/components/ui/separator';
import { Input } from '@/shadcn/components/ui/input';
import { HelpCircle, Search, X } from 'lucide-react';
import AnimatedQuestionMarks from '@/components/AnimatedQuestionMarks';

// Parse FAQ content from markdown format
const parseFAQContent = (content: string) => {
  const sections: Array<{
    category?: string;
    questions: Array<{ number: number; question: string; answer: string[] }>;
  }> = [];

  const lines = content.split('\n');
  let currentCategory: string | undefined;
  let currentQuestion: { number: number; question: string; answer: string[] } | null = null;
  let currentAnswer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if it's a category header (##)
    if (line.startsWith('## ')) {
      // Save previous question if exists
      if (currentQuestion) {
        if (!sections.length || sections[sections.length - 1].category !== currentCategory) {
          sections.push({ category: currentCategory, questions: [] });
        }
        currentQuestion.answer = currentAnswer;
        sections[sections.length - 1].questions.push(currentQuestion);
        currentQuestion = null;
        currentAnswer = [];
      }
      currentCategory = line.replace(/^##\s+/, '').trim();
      continue;
    }

    // Check if it's a question header (###)
    if (line.startsWith('### ')) {
      // Save previous question if exists
      if (currentQuestion) {
        if (!sections.length || sections[sections.length - 1].category !== currentCategory) {
          sections.push({ category: currentCategory, questions: [] });
        }
        currentQuestion.answer = currentAnswer;
        sections[sections.length - 1].questions.push(currentQuestion);
      }

      // Extract question number and text
      const questionText = line.replace(/^###\s+/, '').trim();
      const questionMatch = questionText.match(/^(\d+)\.\s*(.+)$/);

      if (questionMatch) {
        currentQuestion = {
          number: parseInt(questionMatch[1], 10),
          question: questionMatch[2],
          answer: [],
        };
        currentAnswer = [];
      }
      continue;
    }

    // Skip horizontal rules (---)
    if (line.trim() === '---') {
      continue;
    }

    // Skip the main title (# Memory Loop...)
    if (line.startsWith('# ')) {
      continue;
    }

    // Add to current answer (skip empty lines at the start of answer)
    if (currentQuestion) {
      if (line.trim() || currentAnswer.length > 0) {
        currentAnswer.push(line);
      }
    }
  }

  // Save last question
  if (currentQuestion) {
    if (!sections.length || sections[sections.length - 1].category !== currentCategory) {
      sections.push({ category: currentCategory, questions: [] });
    }
    currentQuestion.answer = currentAnswer;
    sections[sections.length - 1].questions.push(currentQuestion);
  }

  return sections;
};

export const FAQPage = () => {
  const { t } = useTranslation();
  const [faqContent, setFaqContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/faq/faq.md')
      .then(res => res.text())
      .then(text => {
        setFaqContent(text);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load FAQ content:', err);
        setIsLoading(false);
      });
  }, []);

  // Parse FAQ content - handle empty content gracefully
  const faqSections = useMemo(() => {
    if (!faqContent) {
      return [];
    }
    return parseFAQContent(faqContent);
  }, [faqContent]);

  // Filter FAQs based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return faqSections;
    }

    const query = searchQuery.toLowerCase();
    return faqSections
      .map(section => {
        const filteredQuestions = section.questions.filter(item => {
          // Search in question
          const questionMatch = item.question.toLowerCase().includes(query);

          // Search in answer (combine all answer paragraphs)
          const answerText = item.answer.join(' ').toLowerCase();
          const answerMatch = answerText.includes(query);

          return questionMatch || answerMatch;
        });

        // Only include section if it has matching questions
        if (filteredQuestions.length === 0) {
          return null;
        }

        return {
          ...section,
          questions: filteredQuestions,
        };
      })
      .filter((section): section is NonNullable<typeof section> => section !== null);
  }, [faqSections, searchQuery]);

  const hasResults = filteredSections.length > 0;
  const totalQuestions = filteredSections.reduce(
    (sum, section) => sum + section.questions.length,
    0
  );

  // Early returns after all hooks
  if (isLoading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <p className='text-muted-foreground'>{t('common.loading', 'Loading...')}</p>
      </div>
    );
  }

  if (!faqContent) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <p className='text-muted-foreground'>{t('faq.error', 'Failed to load FAQ content')}</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background relative overflow-hidden'>
      <AnimatedQuestionMarks />
      <div className='w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-8 relative z-10'>
        <div className='space-y-4 sm:space-y-8'>
          {/* Header */}
          <div className='text-center space-y-2 sm:space-y-4'>
            <div className='inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-2 sm:mb-4'>
              <HelpCircle className='w-6 h-6 sm:w-8 sm:h-8 text-primary' />
            </div>
            <h1 className='text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight'>
              {t('faq.title', 'Frequently Asked Questions')}
            </h1>
            <p className='text-sm sm:text-lg text-muted-foreground'>
              {t('faq.subtitle', 'Find answers to common questions about Memory Loop')}
            </p>
          </div>

          {/* Search Area */}
          <div className='w-full max-w-2xl mx-auto relative z-20'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
              <Input
                type='search'
                placeholder={t('faq.searchPlaceholder', 'Search FAQs...')}
                className='pl-9 pr-9 h-10 w-full'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                  aria-label={t('faq.clearSearch', 'Clear search')}
                >
                  <X className='w-4 h-4' />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className='text-sm text-muted-foreground mt-2 text-center'>
                {hasResults
                  ? t('faq.searchResults', '{{count}} result(s) found', { count: totalQuestions })
                  : t('faq.noResults', 'No results found')}
              </p>
            )}
          </div>

          <Separator />

          {/* FAQ Sections */}
          {hasResults ? (
            <div className='space-y-6 sm:space-y-8'>
              {filteredSections.map((section, sectionIndex) => (
                <div key={sectionIndex} className='space-y-4 sm:space-y-6'>
                  {section.category && (
                    <h2 className='text-xl sm:text-2xl font-bold text-foreground pt-4 sm:pt-6 border-t border-border'>
                      {section.category}
                    </h2>
                  )}
                  <div className='space-y-4 sm:space-y-6'>
                    {section.questions.map(item => (
                      <Card key={item.number} className='border-2'>
                        <CardHeader className='px-3 sm:px-6 pb-3'>
                          <CardTitle className='text-base sm:text-lg font-semibold text-foreground leading-tight'>
                            {item.number}. {item.question}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='px-3 sm:px-6 pb-4 sm:pb-6'>
                          <div className='space-y-2 sm:space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed'>
                            {item.answer.map((paragraph, pIndex) => {
                              const trimmed = paragraph.trim();

                              // Skip empty lines
                              if (!trimmed) {
                                return null;
                              }

                              // Check if paragraph is a list item (starts with -)
                              if (trimmed.startsWith('-')) {
                                // Remove markdown bold formatting and render
                                const text = trimmed.replace(/^-/, '').trim();
                                const parts = text.split(/(\*\*.*?\*\*)/g);
                                return (
                                  <div key={pIndex} className='pl-4 flex items-start gap-2'>
                                    <span className='text-primary mt-1'>•</span>
                                    <p>
                                      {parts.map((part, partIndex) => {
                                        if (part.startsWith('**') && part.endsWith('**')) {
                                          return (
                                            <strong
                                              key={partIndex}
                                              className='font-semibold text-foreground'
                                            >
                                              {part.slice(2, -2)}
                                            </strong>
                                          );
                                        }
                                        return <span key={partIndex}>{part}</span>;
                                      })}
                                    </p>
                                  </div>
                                );
                              }

                              // Check if paragraph is a numbered list item (starts with number)
                              if (/^\d+\.\s/.test(trimmed)) {
                                const match = trimmed.match(/^(\d+)\.\s(.+)$/);
                                if (match) {
                                  const text = match[2];
                                  const parts = text.split(/(\*\*.*?\*\*)/g);
                                  return (
                                    <div key={pIndex} className='pl-4 flex items-start gap-2'>
                                      <span className='text-primary mt-1 font-medium'>
                                        {match[1]}.
                                      </span>
                                      <p>
                                        {parts.map((part, partIndex) => {
                                          if (part.startsWith('**') && part.endsWith('**')) {
                                            return (
                                              <strong
                                                key={partIndex}
                                                className='font-semibold text-foreground'
                                              >
                                                {part.slice(2, -2)}
                                              </strong>
                                            );
                                          }
                                          return <span key={partIndex}>{part}</span>;
                                        })}
                                      </p>
                                    </div>
                                  );
                                }
                              }

                              // Regular paragraph with markdown bold support
                              const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                              return (
                                <p key={pIndex}>
                                  {parts.map((part, partIndex) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                      return (
                                        <strong
                                          key={partIndex}
                                          className='font-semibold text-foreground'
                                        >
                                          {part.slice(2, -2)}
                                        </strong>
                                      );
                                    }
                                    return <span key={partIndex}>{part}</span>;
                                  })}
                                </p>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className='text-center py-12'>
              <p className='text-muted-foreground text-lg'>
                {t('faq.noResults', 'No results found')}
              </p>
              <p className='text-sm text-muted-foreground mt-2'>
                {t('faq.tryDifferentSearch', 'Try a different search term')}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
