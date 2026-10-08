import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Play, Pause, ChevronDown } from 'lucide-react';
import { Button } from '@/shadcn/components/ui/button';
import { Slider } from '@/shadcn/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shadcn/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { SERVER_URL } from '@/shared/constants/server';

interface CustomAudioPlayerProps {
  src?: string;
  className?: string;
}

export const CustomAudioPlayer = ({ src, className }: CustomAudioPlayerProps) => {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  const speedOptions = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState<(typeof speedOptions)[number]>(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    // Reset state when src changes
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsLoading(true);
    setLoadError(null);

    // Clean up previous blob URL if it exists
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    // Ensure the URL is absolute
    let audioUrl = src;
    if (
      src &&
      !src.startsWith('http://') &&
      !src.startsWith('https://') &&
      !src.startsWith('blob:') &&
      !src.startsWith('data:')
    ) {
      // If it's a relative URL, make it absolute using SERVER_URL
      audioUrl = src.startsWith('/') ? `${SERVER_URL}${src}` : `${SERVER_URL}/${src}`;
    }

    // Set the audio source directly - the browser will handle cookies automatically for same-origin requests
    // For cross-origin requests, CORS must be configured on the server
    audio.src = audioUrl;
    audio.load();

    // Handle loading state
    const handleCanPlay = () => {
      setIsLoading(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      const audioElement = e.target as HTMLAudioElement;
      const error = audioElement.error;
      let errorMessage = 'Failed to load audio';

      if (error) {
        switch (error.code) {
          case error.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio loading aborted';
            break;
          case error.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error while loading audio';
            break;
          case error.MEDIA_ERR_DECODE:
            errorMessage = 'Audio decoding error';
            break;
          case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio format not supported';
            break;
          default:
            errorMessage = 'Unknown audio error';
        }
      }

      setLoadError(errorMessage);
      setIsLoading(false);
      setIsPlaying(false);
    };

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadeddata', updateDuration);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadeddata', updateDuration);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);

      // Clean up blob URL on unmount or src change
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackRate;
  }, [playbackRate]);

  const togglePlay = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio || !src) {
      console.warn('Audio element or src not available');
      return;
    }

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        // Ensure audio is loaded before playing
        if (audio.readyState < 2) {
          // If not loaded, wait for it to load
          await new Promise((resolve, reject) => {
            const handleCanPlayOnce = () => {
              audio.removeEventListener('canplay', handleCanPlayOnce);
              audio.removeEventListener('error', handleErrorOnce);
              resolve(undefined);
            };
            const handleErrorOnce = () => {
              audio.removeEventListener('canplay', handleCanPlayOnce);
              audio.removeEventListener('error', handleErrorOnce);
              reject(new Error('Failed to load audio'));
            };
            audio.addEventListener('canplay', handleCanPlayOnce);
            audio.addEventListener('error', handleErrorOnce);
            audio.load();
          });
        }
        await audio.play();
      }
    } catch (error) {
      // Autoplay might be blocked or other error
      console.error('Failed to play/pause audio:', error);
      setIsPlaying(false);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlaybackRateChange = (value: string) => {
    const next = Number(value);
    if (!Number.isFinite(next)) return;
    if (!speedOptions.includes(next as (typeof speedOptions)[number])) return;
    setPlaybackRate(next as (typeof speedOptions)[number]);
  };

  if (!src) {
    return (
      <div
        className={cn(
          'rounded-lg border-2 border-dashed border-muted bg-muted/30 p-8 text-center',
          className
        )}
      >
        <p className='text-sm text-muted-foreground'>
          {t('audio.noAudioAvailable', 'No audio available')}
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className={cn(
          'rounded-lg border-2 border-dashed border-destructive bg-destructive/10 p-8 text-center',
          className
        )}
      >
        <p className='text-sm text-destructive'>{t('audio.loadError', 'Failed to load audio')}</p>
        <p className='text-xs text-muted-foreground mt-2'>{loadError}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4 sm:p-6',
        className
      )}
    >
      <audio ref={audioRef} preload='none' />

      {/* Single line: Play/Pause button and timeline */}
      <div className='flex items-center gap-3'>
        <Button
          onClick={togglePlay}
          size='lg'
          disabled={isLoading}
          className='h-10 w-10 rounded-full p-0 bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0 disabled:opacity-50'
          aria-label={isPlaying ? t('audio.pause', 'Pause') : t('audio.play', 'Play')}
        >
          {isLoading ? (
            <div className='animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent' />
          ) : isPlaying ? (
            <Pause className='w-5 h-5' />
          ) : (
            <Play className='w-5 h-5 ml-0.5' />
          )}
        </Button>

        <div className='flex-1 min-w-0'>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            disabled={isLoading}
            className='w-full cursor-pointer disabled:opacity-50'
          />
          <div className='flex justify-between text-xs text-muted-foreground mt-1'>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type='button'
              variant='outline'
              size='sm'
              disabled={isLoading}
              className='min-w-[72px] justify-between'
              aria-label={t('audio.playbackSpeed', 'Playback speed')}
            >
              <span>{playbackRate}x</span>
              <ChevronDown className='h-4 w-4 opacity-70' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>{t('audio.playbackSpeed', 'Playback speed')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={String(playbackRate)}
              onValueChange={handlePlaybackRateChange}
            >
              {speedOptions.map(rate => (
                <DropdownMenuRadioItem key={rate} value={String(rate)}>
                  {rate}x
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
