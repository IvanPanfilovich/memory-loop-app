import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shadcn/components/ui/card';
import { Button } from '@/shadcn/components/ui/button';
import { Label } from '@/shadcn/components/ui/label';
import { Input } from '@/shadcn/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shadcn/components/ui/tabs';
import { Palette, RotateCcw, Check } from 'lucide-react';
import {
  saveThemeToBackend,
  resetThemeOnBackend,
  setBothColors,
  resetToDefaults,
  type ThemeColors,
} from '@/store/slices/themeSlice';
import { ConfirmDialog } from './ConfirmDialog';
import { showToast } from '@/shared/ui';
import { formatHex, oklch, parse } from 'culori';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorInput = ({ label, value, onChange }: ColorInputProps) => {
  // Convert OKLCH to hex for color picker
  const convertOklchToHex = (oklchString: string): string => {
    try {
      const parsed = parse(oklchString);
      if (parsed) {
        const hex = formatHex(parsed);
        return hex || '#6366f1';
      }
    } catch (error) {
      console.error('Failed to parse OKLCH color:', oklchString, error);
    }
    return '#6366f1'; // Fallback color
  };

  // Convert hex to OKLCH
  const convertHexToOklch = (hex: string): string => {
    try {
      const color = oklch(hex);
      if (color && color.l !== undefined && color.c !== undefined && color.h !== undefined) {
        // Format as oklch(L% C H) with proper precision
        const l = (color.l * 100).toFixed(1);
        const c = color.c.toFixed(3);
        const h = color.h?.toFixed(0) || '0';
        return `oklch(${l}% ${c} ${h})`;
      }
    } catch (error) {
      console.error('Failed to convert hex to OKLCH:', hex, error);
    }
    return value; // Return original value if conversion fails
  };

  const [hexValue, setHexValue] = useState(convertOklchToHex(value));

  // Update hex value when value prop changes
  useEffect(() => {
    setHexValue(convertOklchToHex(value));
  }, [value]);

  const handleColorChange = (hex: string) => {
    setHexValue(hex);
    // Convert hex back to OKLCH and update
    const oklchValue = convertHexToOklch(hex);
    onChange(oklchValue);
  };

  const handleTextChange = (text: string) => {
    onChange(text);
    // Update hex preview if valid OKLCH
    try {
      const hex = convertOklchToHex(text);
      setHexValue(hex);
    } catch (_error) {
      // If conversion fails, color is likely invalid but let user continue typing
      console.warn('Invalid OKLCH color during typing:', text);
    }
  };

  return (
    <div className='space-y-2'>
      <Label className='text-sm font-medium'>{label}</Label>
      <div className='flex gap-2'>
        <Input
          type='color'
          value={hexValue}
          onChange={e => handleColorChange(e.target.value)}
          className='w-14 h-10 p-1 cursor-pointer'
          title='Pick a color'
        />
        <Input
          type='text'
          value={value}
          onChange={e => handleTextChange(e.target.value)}
          className='flex-1 font-mono text-sm'
          placeholder='oklch(50% 0.2 280)'
        />
      </div>
    </div>
  );
};

export const ThemeCustomizer = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { lightColors, darkColors, isLoading, defaultMode } = useAppSelector(state => state.theme);
  const { token, isAuthenticated } = useAppSelector(state => state.auth);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Local state for pending changes
  const [pendingLightColors, setPendingLightColors] = useState<ThemeColors>(lightColors);
  const [pendingDarkColors, setPendingDarkColors] = useState<ThemeColors>(darkColors);
  const [hasChanges, setHasChanges] = useState(false);

  // Update pending state when Redux state changes (e.g., after reset)
  useEffect(() => {
    setPendingLightColors(lightColors);
    setPendingDarkColors(darkColors);
    setHasChanges(false);
  }, [lightColors, darkColors]);

  const handleLightColorChange = (key: keyof ThemeColors, value: string) => {
    setPendingLightColors(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleDarkColorChange = (key: keyof ThemeColors, value: string) => {
    setPendingDarkColors(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleApplyChanges = async () => {
    try {
      if (isAuthenticated && token) {
        // Save to backend if authenticated (include current defaultMode)
        await dispatch(
          saveThemeToBackend({
            lightColors: pendingLightColors,
            darkColors: pendingDarkColors,
            defaultMode: defaultMode,
            customized: true,
          })
        ).unwrap();
      } else {
        // Fallback to local state and cookies if not authenticated
        dispatch(
          setBothColors({
            lightColors: pendingLightColors,
            darkColors: pendingDarkColors,
          })
        );
      }

      // Show success toast
      showToast(
        t('profile.themeCustomizer.applySuccess', 'Theme colors applied successfully!'),
        'success'
      );

      // Reload the page after a short delay to ensure state is saved
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('[ThemeCustomizer] Failed to save theme:', error);
      showToast(
        t('profile.themeCustomizer.applyError', 'Failed to save theme colors. Please try again.'),
        'error'
      );
    }
  };

  const handleResetClick = () => {
    setIsResetConfirmOpen(true);
  };

  const handleResetConfirm = async () => {
    try {
      if (isAuthenticated && token) {
        // Reset on backend if authenticated
        await dispatch(resetThemeOnBackend()).unwrap();
      } else {
        // Fallback to local reset if not authenticated
        dispatch(resetToDefaults());
      }

      showToast(
        t('profile.themeCustomizer.resetSuccess', 'Theme colors reset to defaults.'),
        'success'
      );

      // Reload the page to apply the default theme
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('[ThemeCustomizer] Failed to reset theme colors:', error);
      showToast(t('profile.themeCustomizer.resetError', 'Failed to reset theme colors.'), 'error');
    } finally {
      setIsResetConfirmOpen(false);
    }
  };

  const colorGroups = [
    {
      title: t('profile.theme.groups.base', 'Base Colors'),
      colors: [
        {
          key: 'background' as keyof ThemeColors,
          label: t('profile.theme.colors.background', 'Background'),
        },
        {
          key: 'foreground' as keyof ThemeColors,
          label: t('profile.theme.colors.foreground', 'Foreground'),
        },
        { key: 'card' as keyof ThemeColors, label: t('profile.theme.colors.card', 'Card') },
        {
          key: 'card-foreground' as keyof ThemeColors,
          label: t('profile.theme.colors.cardForeground', 'Card Text'),
        },
        {
          key: 'popover' as keyof ThemeColors,
          label: t('profile.theme.colors.popover', 'Popover'),
        },
        {
          key: 'popover-foreground' as keyof ThemeColors,
          label: t('profile.theme.colors.popoverForeground', 'Popover Text'),
        },
      ],
    },
    {
      title: t('profile.theme.groups.primary', 'Primary Colors'),
      colors: [
        {
          key: 'primary' as keyof ThemeColors,
          label: t('profile.theme.colors.primary', 'Primary'),
        },
        {
          key: 'primary-foreground' as keyof ThemeColors,
          label: t('profile.theme.colors.primaryForeground', 'Primary Text'),
        },
      ],
    },
    {
      title: t('profile.theme.groups.secondary', 'Secondary Colors'),
      colors: [
        {
          key: 'secondary' as keyof ThemeColors,
          label: t('profile.theme.colors.secondary', 'Secondary'),
        },
        {
          key: 'secondary-foreground' as keyof ThemeColors,
          label: t('profile.theme.colors.secondaryForeground', 'Secondary Text'),
        },
      ],
    },
    {
      title: t('profile.theme.groups.accent', 'Accent Colors'),
      colors: [
        { key: 'accent' as keyof ThemeColors, label: t('profile.theme.colors.accent', 'Accent') },
        {
          key: 'accent-foreground' as keyof ThemeColors,
          label: t('profile.theme.colors.accentForeground', 'Accent Text'),
        },
      ],
    },
    {
      title: t('profile.theme.groups.destructive', 'Error/Destructive Colors'),
      colors: [
        {
          key: 'destructive' as keyof ThemeColors,
          label: t('profile.theme.colors.destructive', 'Destructive'),
        },
        {
          key: 'destructive-foreground' as keyof ThemeColors,
          label: t('profile.theme.colors.destructiveForeground', 'Destructive Text'),
        },
      ],
    },
    {
      title: t('profile.theme.groups.muted', 'Muted Colors'),
      colors: [
        { key: 'muted' as keyof ThemeColors, label: t('profile.theme.colors.muted', 'Muted') },
        {
          key: 'muted-foreground' as keyof ThemeColors,
          label: t('profile.theme.colors.mutedForeground', 'Muted Text'),
        },
      ],
    },
    {
      title: t('profile.theme.groups.utility', 'Utility Colors'),
      colors: [
        { key: 'border' as keyof ThemeColors, label: t('profile.theme.colors.border', 'Border') },
        { key: 'input' as keyof ThemeColors, label: t('profile.theme.colors.input', 'Input') },
        { key: 'ring' as keyof ThemeColors, label: t('profile.theme.colors.ring', 'Focus Ring') },
      ],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Palette className='w-5 h-5' />
            <CardTitle>{t('profile.theme.title', 'Theme Customization')}</CardTitle>
          </div>
          <Button variant='outline' size='sm' onClick={handleResetClick} disabled={isLoading}>
            <RotateCcw className='w-4 h-4 mr-2' />
            {t('profile.theme.reset', 'Reset')}
          </Button>
        </div>
        <CardDescription>
          {t(
            'profile.theme.description',
            'Customize your theme colors separately for light and dark mode'
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue='light' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='light'>{t('profile.theme.lightMode', 'Light Mode')}</TabsTrigger>
            <TabsTrigger value='dark'>{t('profile.theme.darkMode', 'Dark Mode')}</TabsTrigger>
          </TabsList>

          <TabsContent value='light' className='space-y-6 mt-6'>
            {colorGroups.map(group => (
              <div key={group.title} className='space-y-3'>
                <h3 className='text-sm font-semibold text-foreground'>{group.title}</h3>
                <div className='grid gap-4 sm:grid-cols-2'>
                  {group.colors.map(color => (
                    <ColorInput
                      key={color.key}
                      label={color.label}
                      value={pendingLightColors[color.key]}
                      onChange={value => handleLightColorChange(color.key, value)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value='dark' className='space-y-6 mt-6'>
            {colorGroups.map(group => (
              <div key={group.title} className='space-y-3'>
                <h3 className='text-sm font-semibold text-foreground'>{group.title}</h3>
                <div className='grid gap-4 sm:grid-cols-2'>
                  {group.colors.map(color => (
                    <ColorInput
                      key={color.key}
                      label={color.label}
                      value={pendingDarkColors[color.key]}
                      onChange={value => handleDarkColorChange(color.key, value)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Floating Apply Changes button */}
      {hasChanges && (
        <div className='fixed inset-x-0 bottom-6 flex justify-center pointer-events-none px-4 z-50'>
          <Button
            onClick={handleApplyChanges}
            size='lg'
            disabled={isLoading}
            className='pointer-events-auto w-full max-w-md py-4 text-base sm:text-lg font-semibold shadow-xl rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50'
          >
            <Check className='w-5 h-5 mr-2' />
            {isLoading
              ? t('profile.themeCustomizer.saving', 'Saving...')
              : t('profile.themeCustomizer.apply', 'Apply Changes')}
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetConfirm}
        title={t('profile.themeCustomizer.resetConfirmTitle', 'Reset Theme Colors?')}
        description={t(
          'profile.themeCustomizer.resetConfirmDescription',
          'Are you sure you want to reset all custom theme colors to their default values? This action cannot be undone.'
        )}
        confirmText={t('common.confirm', 'Confirm')}
        cancelText={t('common.cancel', 'Cancel')}
        variant='destructive'
      />
    </Card>
  );
};
