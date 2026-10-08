import { useCallback, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { showToast } from '@/shared/ui';

interface DocumentFile {
  file: File;
  id: string;
}

interface DocumentUploadProps {
  files: DocumentFile[];
  onFilesChange: (files: DocumentFile[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxTotalSize?: number; // in bytes, default 100MB
  acceptedTypes?: string[];
}

const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100 MB in bytes

export const DocumentUpload = ({
  files,
  onFilesChange,
  disabled = false,
  maxFiles = 10,
  maxTotalSize = MAX_TOTAL_SIZE,
  acceptedTypes = ['.pdf', '.docx'],
}: DocumentUploadProps) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const validateFile = (file: File): boolean => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    return acceptedTypes.includes(extension);
  };

  const calculateTotalSize = (fileList: DocumentFile[]): number => {
    return fileList.reduce((total, docFile) => total + docFile.file.size, 0);
  };

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const validFiles = fileArray.filter(validateFile);
      const remainingSlots = maxFiles - files.length;
      const currentTotalSize = calculateTotalSize(files);

      if (validFiles.length === 0) {
        showToast(
          t(
            'documentUpload.invalidFileType',
            'Invalid file type. Please upload PDF or Word (.docx) files only.'
          ),
          'error'
        );
        return;
      }

      // Check file count limit
      if (remainingSlots <= 0) {
        showToast(
          t('documentUpload.maxFilesReached', 'Maximum {{count}} files allowed', {
            count: maxFiles,
          }),
          'error'
        );
        return;
      }

      // Calculate how many files we can add based on size limit
      const filesToAdd: File[] = [];
      let totalSizeToAdd = 0;

      for (const file of validFiles.slice(0, remainingSlots)) {
        const newTotalSize = currentTotalSize + totalSizeToAdd + file.size;
        if (newTotalSize > maxTotalSize) {
          if (filesToAdd.length === 0) {
            // First file exceeds limit
            showToast(
              t(
                'documentUpload.fileTooLarge',
                'File "{{name}}" is too large. Total size must not exceed {{size}}.',
                {
                  name: file.name,
                  size: formatFileSize(maxTotalSize),
                }
              ),
              'error'
            );
          } else {
            // Some files fit, but this one doesn't
            showToast(
              t(
                'documentUpload.totalSizeExceeded',
                'Total size limit reached. Maximum total size is {{size}}.',
                {
                  size: formatFileSize(maxTotalSize),
                }
              ),
              'error'
            );
          }
          break;
        }
        filesToAdd.push(file);
        totalSizeToAdd += file.size;
      }

      if (filesToAdd.length === 0) {
        return;
      }

      const newDocumentFiles: DocumentFile[] = filesToAdd.map(file => ({
        file,
        id: `${Date.now()}-${Math.random()}`,
      }));

      onFilesChange([...files, ...newDocumentFiles]);
    },
    [files, onFilesChange, maxFiles, maxTotalSize, t]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        handleFiles(e.target.files);
      }
      // Reset input so same file can be selected again
      if (e.target) {
        e.target.value = '';
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles]
  );

  const removeFile = useCallback(
    (id: string) => {
      onFilesChange(files.filter(f => f.id !== id));
    },
    [files, onFilesChange]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div className='space-y-3 w-full max-w-full overflow-hidden'>
      {/* Only show upload area when no files are uploaded */}
      {files.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          <input
            ref={fileInputRef}
            type='file'
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInput}
            disabled={disabled}
            className='hidden'
            id='document-upload-input'
          />
          <div className='flex flex-col items-center gap-2'>
            <Upload className='w-8 h-8 text-muted-foreground' />
            <div className='space-y-1'>
              <p className='text-sm font-medium text-foreground'>
                {t('documentUpload.dragDrop', 'Drag and drop documents here, or')}{' '}
                <span className='text-primary'>{t('documentUpload.browse', 'browse')}</span>
              </p>
              <p className='text-xs text-muted-foreground'>
                {t('documentUpload.supportedFormats', 'Supported formats: PDF, Word (.docx)')}
                {maxFiles &&
                  ` • ${t('documentUpload.maxFiles', 'Max {{count}} files', { count: maxFiles })}`}
                {` • ${t('documentUpload.maxTotalSize', 'Max total size: {{size}}', { size: formatFileSize(maxTotalSize) })}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className='space-y-2 w-full overflow-hidden'>
          {/* Total size indicator */}
          <div className='flex items-center justify-between text-xs text-muted-foreground px-1'>
            <span>
              {t('documentUpload.filesCount', '{{count}} of {{max}} files', {
                count: files.length,
                max: maxFiles,
              })}
            </span>
            <span>
              {t('documentUpload.totalSize', 'Total: {{size}} / {{max}}', {
                size: formatFileSize(calculateTotalSize(files)),
                max: formatFileSize(maxTotalSize),
              })}
            </span>
          </div>
          {files.map(docFile => (
            <div
              key={docFile.id}
              className='flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border w-full min-w-0 max-w-full overflow-hidden'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='lucide lucide-file w-5 h-5 text-primary flex-shrink-0'
                aria-hidden='true'
              >
                <path d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'></path>
                <path d='M14 2v4a2 2 0 0 0 2 2h4'></path>
              </svg>
              <div className='flex-1 min-w-0 overflow-hidden max-w-full'>
                <p
                  className='text-sm font-medium text-foreground truncate block'
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                    display: 'block',
                  }}
                >
                  {docFile.file.name}
                </p>
                <p className='text-xs text-muted-foreground'>{formatFileSize(docFile.file.size)}</p>
              </div>
              {!disabled && (
                <button
                  type='button'
                  onClick={() => removeFile(docFile.id)}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 gap-1.5 has-[>svg]:px-2.5 h-8 w-8 p-0 flex-shrink-0"
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='24'
                    height='24'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    className='lucide lucide-x w-4 h-4'
                    aria-hidden='true'
                  >
                    <path d='M18 6 6 18'></path>
                    <path d='m6 6 12 12'></path>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
