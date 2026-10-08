# Memory Loop - Complete Capabilities & User Guide

## Table of Contents
1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Complete User Flows](#complete-user-flows)
4. [Authentication & Account Management](#authentication--account-management)
5. [Recap Creation Process](#recap-creation-process)
6. [Learning Features](#learning-features)
7. [Dashboard & Organization](#dashboard--organization)
8. [Credits & Subscription System](#credits--subscription-system)
9. [Profile & Settings](#profile--settings)
10. [Technical Capabilities](#technical-capabilities)

---

## Overview

**Memory Loop** is a web application that transforms long-form educational content (YouTube videos and documents) into personalized learning recaps. It uses AI to extract, analyze, and organize content into digestible learning materials.

### What Memory Loop Does

Memory Loop helps users:
- **Remember** what they've learned from videos and documents
- **Review** key concepts through active recall
- **Organize** their learning materials in one place
- **Listen** to audio summaries on the go
- **Test** their knowledge retention

### Target Audience

- Students and lifelong learners
- Professionals consuming educational content
- Anyone who watches educational YouTube videos
- People who read PDFs and documents for learning
- Users who struggle to retain information from long-form content

---

## Core Features

### 1. **Content Processing**
- **YouTube Video Processing**: Paste any YouTube video link to extract transcript and generate recap
- **Document Upload**: Upload PDF and Word documents (up to 10 files at once, max 10MB each)
- **AI-Powered Analysis**: Automatic extraction of themes/topics from content
- **Multi-format Support**: Handles various document formats (PDF, DOC, DOCX)

### 2. **Personalized Recaps**
- **Text Summaries**: AI-generated summaries of selected themes
- **Audio Recaps**: Text-to-speech audio versions of summaries
- **Theme Selection**: Choose which parts of content to include in recap
- **Timestamps**: Direct links back to original content with timestamps (YouTube)

### 3. **Active Learning Tools**
- **Flashcards**: AI-generated question-answer pairs for active recall
- **Spaced Repetition**: Flashcard review system with quality ratings
- **Knowledge Testing**: "Test your knowledge" feature that analyzes user recall
- **Flashcard Statistics**: Track your progress and review history

### 4. **Organization & Management**
- **Dashboard**: Centralized view of all recaps
- **Search**: Find recaps by title, episode, or themes
- **Pinning**: Pin important recaps to top of dashboard
- **Bulk Operations**: Select and delete multiple recaps at once
- **Time-based Grouping**: Organize recaps by Pinned, Today, This Week, This Month, Earlier

### 5. **User Account Features**
- **Email/Password Authentication**: Traditional sign-up and login
- **Google OAuth**: Quick sign-in with Google account
- **Email Verification**: Secure account verification system
- **Password Reset**: Self-service password recovery
- **Profile Management**: Update display name, language, and preferences
- **Account Deletion**: Complete account removal option

### 6. **Monetization & Credits**
- **Credits System**: Pay-per-use model for AI operations
- **Basic Plan**: Free tier with limited credits
- **Premium Plan**: Subscription-based with enhanced features
- **Stripe Integration**: Secure payment processing
- **Subscription Management**: Manage, upgrade, or cancel subscriptions

### 7. **Referral System**
- **Invite Friends**: Share referral codes with others
- **Cookie-based Tracking**: Automatic referral code detection
- **URL Parameters**: Support for referral codes in signup URLs

### 8. **Internationalization**
- **Multi-language Support**: English (default) and Russian
- **Language Switching**: Change language in header or profile
- **Auto-detection**: Browser language detection on first visit

### 9. **Progressive Web App (PWA)**
- **Installable**: Can be installed on desktop and mobile devices
- **Offline Viewing**: View cached content when offline
- **App-like Experience**: Standalone window with custom icon

### 10. **Theme Customization**
- **Color Themes**: Customize app appearance
- **Dark/Light Mode**: Theme switching support
- **User Preferences**: Save theme preferences per user

---

## Complete User Flows

### Flow 1: New User Registration & First Recap

1. **Landing Page** (`/`)
   - User arrives at landing page
   - Can view basic information about Memory Loop

2. **Sign Up** (`/signup` or `/auth`)
   - User clicks "Sign Up" or "Create Account"
   - Fills in:
     - Full name
     - Email address
     - Password (with validation)
     - Optional: Referral code (from cookie or manual entry)
     - Optional: Country, date of birth, locale
   - Accepts terms and conditions
   - Submits registration

3. **Email Verification** (`/verify-email`)
   - User receives verification email
   - Clicks verification link
   - Email is verified, account activated

4. **First Login** (`/auth`)
   - User enters email and password
   - Or uses Google OAuth
   - Redirected to dashboard

5. **Empty Dashboard** (`/dashboard`)
   - User sees empty state with "Create recap" button
   - Two options presented:
     - **YouTube Tab**: Paste video link
     - **Documents Tab**: Upload PDF/Word files

6. **Create Recap from YouTube**
   - User pastes YouTube link
   - Clicks "Create new recap"
   - System:
     - Creates recap record
     - Starts processing (transcribing, extracting themes)
     - Shows progress bar (0-100%)
     - Background processing continues even if user navigates away

7. **Theme Selection** (`/dashboard/themes?id={recapId}`)
   - System extracts themes/topics from content
   - User sees:
     - List of themes with descriptions
     - For YouTube: Timestamps for each theme
     - For Documents: Source document references
   - User selects/deselects themes of interest
   - Clicks "Generate recap"

8. **Recap Generation**
   - System generates:
     - Personalized text summary (from selected themes)
     - 10 flashcards (default)
     - Audio recap (optional, can be generated later)
   - Shows countdown timer (30 seconds)
   - Redirects to recap page when complete

9. **View Recap** (`/dashboard/{recapId}`)
   - User sees complete recap with:
     - Audio player section
     - Flashcards section
     - Text summary section
     - Test your knowledge section

### Flow 2: Returning User - Review Existing Recap

1. **Dashboard** (`/dashboard`)
   - User logs in
   - Sees list of recaps organized by:
     - Pinned (at top)
     - Today
     - This week
     - This month
     - Earlier

2. **Search Recaps**
   - User types in search bar
   - Filters recaps by:
     - Title
     - Episode title
     - Themes/topics

3. **Open Recap** (`/dashboard/{recapId}`)
   - User clicks on recap card
   - Or clicks "Open recap" button
   - Navigates to recap detail page

4. **Listen to Audio**
   - User clicks play on audio player
   - Can pause, seek, adjust volume
   - If audio not generated, can click "Generate Audio"
   - Audio generation takes ~2 minutes (120 second countdown)

5. **Review Flashcards**
   - User scrolls to flashcards section
   - Sees carousel of flashcards
   - For each card:
     - Views question
     - Flips card to see answer
     - Marks as "Correct" or "Incorrect"
     - System updates flashcard quality (spaced repetition algorithm)
   - Can view statistics (correct/incorrect counts)
   - Can start over to review again

6. **Read Summary**
   - User scrolls to text summary
   - Reads markdown-formatted summary
   - Can copy summary to clipboard

7. **Test Knowledge**
   - User scrolls to "Test your knowledge" section
   - Types what they remember from recap (min 10 characters)
   - Clicks "Analyze my recall"
   - System:
     - Analyzes user's text against original summary
     - Returns:
       - Facts analyzed (with status: correct, incorrect, partially correct, needs clarification)
       - Missing facts (from summary not mentioned)
       - Correct/incorrect counts
   - User reviews feedback and identifies knowledge gaps

### Flow 3: Document-Based Recap

1. **Upload Documents** (`/dashboard`)
   - User selects "Documents" tab
   - Drags and drops files OR clicks to browse
   - Can upload up to 10 files
   - Supported formats: PDF, DOC, DOCX
   - Max size: 10MB per file
   - Max total size: 100MB

2. **File Validation**
   - System validates file types
   - Checks file sizes
   - Shows error if invalid

3. **Create Recap**
   - User clicks "Create new recap"
   - System:
     - Uploads files to server
     - Extracts text from documents
     - Processes content
     - Extracts themes

4. **Theme Selection** (`/dashboard/themes?id={recapId}`)
   - User sees themes extracted from documents
   - Can see which document each theme came from
   - Selects themes of interest
   - Generates recap

5. **View Recap**
   - Similar to YouTube recap
   - Shows source documents used
   - References to specific documents in themes

### Flow 4: Account Management

1. **Profile Page** (`/profile`)
   - User clicks profile icon or "Profile" in sidebar
   - Sees:
     - Display name (editable)
     - Email (read-only)
     - Language preference (dropdown)
     - Credits balance
     - Subscription status
     - Account creation date

2. **Update Profile**
   - User edits display name
   - Changes language
   - Changes auto-save immediately

3. **Manage Subscription**
   - User sees current plan (Basic/Premium)
   - If Premium:
     - Can see subscription details
     - Can cancel subscription
     - Can manage payment (Stripe portal)
   - If Basic:
     - Can upgrade to Premium
     - Redirects to paywall page

4. **Upgrade to Premium** (`/paywall`)
   - User sees Premium features
   - Clicks "Upgrade" or "Start Premium"
   - Redirected to Stripe checkout
   - Completes payment
   - Returns to profile with Premium status

5. **Delete Account**
   - User scrolls to "Delete account" section
   - Clicks delete button
   - Confirms deletion
   - Account and all data removed

### Flow 5: Recap Management

1. **Pin/Unpin Recap**
   - User opens recap card menu (three dots)
   - Clicks "Pin" or "Unpin"
   - Recap moves to top of dashboard (if pinned)

2. **Rename Recap**
   - User opens recap card menu
   - Clicks "Rename"
   - Enters new title
   - Saves changes

3. **Delete Recap**
   - User opens recap card menu
   - Clicks "Delete"
   - Confirms deletion
   - Recap removed from dashboard

4. **Bulk Delete**
   - User enables selection mode
   - Selects multiple recaps
   - Clicks delete button
   - Confirms bulk deletion
   - All selected recaps removed

---

## Authentication & Account Management

### Sign Up Process

1. **Registration Form**
   - Full name (required)
   - Email (required, validated)
   - Password (required, min length, strength validation)
   - Optional fields:
     - Referral code (from cookie or manual)
     - Country (auto-detected)
     - Date of birth
     - Locale (auto-detected from browser)

2. **Email Verification**
   - Verification email sent after registration
   - User clicks link in email
   - Redirected to verification page
   - Account activated

3. **First Login**
   - User can login immediately after verification
   - Or use Google OAuth

### Sign In Options

1. **Email/Password**
   - Enter email and password
   - Click "Sign In"
   - Session created with JWT tokens

2. **Google OAuth**
   - Click "Sign in with Google"
   - Redirected to Google authentication
   - Returns with OAuth token
   - Account created/linked automatically
   - Referral code preserved if in cookie

### Password Reset

1. **Request Reset**
   - Click "Forgot password" on login page
   - Enter email address
   - Reset email sent

2. **Reset Password** (`/reset-password`)
   - User clicks link in email
   - Enters new password
   - Password updated
   - User can login with new password

### Session Management

- **JWT Tokens**: Access token and refresh token
- **Auto-refresh**: Tokens refreshed automatically
- **Cookie Storage**: Tokens stored in secure cookies
- **Logout**: Clears tokens and redirects to landing page

---

## Recap Creation Process

### Step 1: Content Input

#### YouTube Video
1. User pastes YouTube link in input field
2. System validates URL format
3. User clicks "Create new recap"
4. System creates recap record in database
5. Starts background processing

#### Documents
1. User selects "Documents" tab
2. Drags files or clicks to browse
3. System validates:
   - File type (PDF, DOC, DOCX)
   - File size (max 10MB each)
   - Total files (max 10)
   - Total size (max 100MB)
4. User clicks "Create new recap"
5. Files uploaded to server
6. System extracts text from documents
7. Creates recap record

### Step 2: Processing

**Processing States:**
- `pending`: Initial state
- `transcribing`: Extracting transcript/text (YouTube) or parsing documents
- `extracting_topics`: AI analyzing content for themes
- `generating`: Creating summary and flashcards
- `completed`: Ready for theme selection
- `failed`: Error occurred

**Progress Tracking:**
- Progress bar shows 0-100%
- Status text indicates current stage
- Background processing continues if user navigates away
- User can see processing status in dashboard

### Step 3: Theme Selection

**Theme Display:**
- List of themes with descriptions
- For YouTube: Timestamps linking to video moments
- For Documents: Source document references
- Checkboxes to select/deselect themes

**User Actions:**
- Select themes of interest
- Deselect irrelevant themes
- Click "Generate recap" button
- System generates recap only from selected themes

### Step 4: Recap Generation

**What Gets Generated:**
1. **Text Summary**: Personalized markdown summary
2. **Flashcards**: 10 question-answer pairs (default)
3. **Audio Recap**: Optional, can be generated later

**Generation Time:**
- Typically 30-60 seconds
- Shows countdown timer
- Redirects to recap page when complete

### Step 5: View Recap

User sees complete recap with all sections:
- Audio player
- Flashcards
- Text summary
- Test your knowledge

---

## Learning Features

### Flashcards

**Features:**
- AI-generated question-answer pairs
- Carousel navigation
- Flip animation
- Correct/Incorrect buttons
- Spaced repetition algorithm
- Quality ratings (0-5)
- Statistics tracking

**Review Process:**
1. User sees question on front of card
2. Flips card to see answer
3. Marks as "Correct" or "Incorrect"
4. System updates:
   - Quality rating
   - Next review date
   - Repetition count
   - Ease factor
5. Moves to next card automatically

**Flashcard Statistics:**
- Total flashcards
- Correct count
- Incorrect count
- Review progress
- Quality distribution

**Flashcard Management:**
- Delete individual flashcards
- Start over (reset review progress)
- Shuffle order

### Test Your Knowledge

**Purpose:** Analyze how well user remembers recap content

**Process:**
1. User types what they remember (min 10 characters)
2. Clicks "Analyze my recall"
3. System sends to AI analysis endpoint:
   - Original summary
   - User's recall text
4. AI analyzes and returns:
   - **Facts Analyzed**: Each fact from user's text with:
     - Status: `true`, `false`, `partially_correct`, `needs_clarification`
     - Explanation
     - Corresponding fact from summary
   - **Missing Facts**: Important facts from summary not mentioned
   - **Correct Facts Count**: Number of correct facts
   - **Incorrect Facts Count**: Number of incorrect facts

**Display:**
- Color-coded fact cards:
  - Green: Correct
  - Red: Incorrect
  - Yellow: Partially correct
  - Blue: Needs clarification
- Missing facts list
- Feedback helps user identify knowledge gaps

**Credit Cost:**
- Uses credits from user balance
- Pre-checked before analysis
- Deducted after successful analysis

### Audio Recaps

**Generation:**
- Optional feature
- Can be generated after recap creation
- Text-to-speech conversion
- Takes ~2 minutes (120 seconds)
- Shows countdown timer

**Audio Player Features:**
- Play/Pause
- Seek bar
- Volume control
- Duration display
- Regenerate option

**Use Cases:**
- Listen while commuting
- Hands-free learning
- Audio learners
- Review while doing other tasks

---

## Dashboard & Organization

### Dashboard Layout

**Sections:**
1. **Header**
   - Search bar
   - Create recap button
   - User menu (credits, profile, logout)

2. **Recap Cards**
   - Grouped by time:
     - Pinned (always at top)
     - Today
     - This week
     - This month
     - Earlier
   - Infinite scroll (pagination)

3. **Empty State**
   - Message when no recaps
   - "Create recap" button
   - Instructions

### Recap Card Information

Each card shows:
- **Title**: Recap title
- **Duration**: Recap length in minutes
- **Flashcard Count**: Number of flashcards
- **Status Badge**: Processing, Generating, Generating Audio
- **Actions Menu**: Pin, Rename, Delete
- **Open Recap Button**: Navigate to detail page

### Search Functionality

**Search Fields:**
- Recap title
- Episode/content title
- Themes/topics

**Search Behavior:**
- Real-time filtering
- Case-insensitive
- Searches across all recaps
- Updates URL with query parameter

### Organization Features

**Pinning:**
- Pin important recaps
- Pinned recaps always at top
- Visual indicator (pin icon)
- Can unpin anytime

**Bulk Operations:**
- Selection mode toggle
- Select multiple recaps
- Bulk delete
- Visual selection indicators

**Sorting:**
- Automatic time-based grouping
- Pinned items prioritized
- Recent items first

---

## Credits & Subscription System

### Credits System

**What Credits Are:**
- Virtual currency for AI operations
- Required for:
  - Recap generation
  - Audio generation
  - Knowledge testing (analyze recall)
  - Other AI-powered features

**Credit Balance:**
- Displayed in header
- Shown on profile page
- Updated in real-time
- Pre-checked before operations

**Credit Costs:**
- Varies by operation
- Based on:
  - Input tokens
  - Output tokens
  - Model used
- Calculated after operation completes

**Credit Management:**
- Deducted automatically
- Insufficient credits show error (402 Payment Required)
- Can top up via subscription

### Subscription Plans

**Basic Plan:**
- Free tier
- Limited credits
- Basic features

**Premium Plan:**
- Monthly subscription
- More credits
- Enhanced features
- Priority processing (if implemented)

**Subscription Features:**
- Stripe integration
- Secure payment processing
- Automatic renewal
- Cancel anytime
- Access until period end after cancellation

### Payment Flow

1. **Upgrade Prompt**
   - User sees "Upgrade to Premium" button
   - Or redirected to paywall page

2. **Paywall Page** (`/paywall`)
   - Shows Premium features
   - Pricing information
   - "Start Premium" button

3. **Stripe Checkout**
   - Redirected to Stripe
   - Enter payment details
   - Complete payment

4. **Return to App**
   - Redirected back with status
   - Success dialog shown
   - Profile updated with Premium status

5. **Subscription Management**
   - Manage payment methods
   - Update billing info
   - Cancel subscription
   - All via Stripe customer portal

---

## Profile & Settings

### Profile Page Features

**User Information:**
- Display name (editable)
- Email (read-only)
- Account creation date
- Language preference

**Credits Display:**
- Current balance
- Balance in USD
- Plan status

**Subscription Section:**
- Current plan (Basic/Premium)
- Subscription status
- Expiration date (if Premium)
- Manage payment button
- Cancel subscription option

**Theme Customization:**
- Color theme selector
- Dark/light mode toggle
- Custom color preferences
- Auto-save settings

**Account Actions:**
- Logout
- Delete account
- Language switching

### Settings Management

**Display Name:**
- Editable field
- Validation (min/max length)
- Auto-save on blur
- Error handling

**Language:**
- Dropdown selector
- Supported languages:
  - English (en)
  - Russian (ru)
- Changes apply immediately
- Saved to user profile

**Theme:**
- Color picker
- Theme preview
- Save preferences
- Applied globally

### Account Deletion

**Process:**
1. User clicks "Delete account"
2. Confirmation dialog appears
3. User confirms deletion
4. Account and all data removed:
   - User profile
   - All recaps
   - Flashcards
   - Summaries
   - Audio files
5. Redirected to landing page

**Data Retention:**
- Follows privacy policy
- Complete removal
- No recovery possible

---

## Technical Capabilities

### Progressive Web App (PWA)

**Installation:**
- Installable on desktop and mobile
- Custom app icon
- Standalone window
- App-like experience

**Offline Support:**
- View cached content offline
- Cannot create new recaps offline
- Service worker for caching

**Install Prompt:**
- Browser shows install prompt
- User can install from menu
- Or use install button in header

### Internationalization (i18n)

**Supported Languages:**
- English (en) - Default
- Russian (ru)

**Language Features:**
- Browser language detection
- Manual language switching
- Per-user language preference
- All UI text translated
- RTL support (if needed)

**Translation Files:**
- JSON-based translations
- Separate files per language
- FAQ translations
- Legal document translations

### Responsive Design

**Breakpoints:**
- Mobile (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)

**Mobile Optimizations:**
- Touch-friendly buttons
- Swipe gestures (flashcards)
- Mobile navigation
- Responsive cards
- Optimized forms

### Background Processing

**Features:**
- Recap processing continues in background
- Audio generation runs in background
- User can navigate away
- Status tracked in background
- Notifications when complete (if implemented)

**Background Request Tracking:**
- Tracks active operations
- Shows status in dashboard
- Removes when complete
- Persists across sessions

### Security Features

**Authentication:**
- JWT tokens
- Secure cookie storage
- Token refresh
- OAuth 2.0 (Google)

**Data Protection:**
- HTTPS required
- Secure API endpoints
- Input validation
- XSS protection
- CSRF protection

**Privacy:**
- User data encrypted
- Private recaps (not shared)
- GDPR compliance
- Cookie consent
- Data deletion options

### API Integration

**Backend Endpoints:**
- RESTful API
- Authentication required
- Error handling
- Rate limiting
- Credit checking

**Services:**
- Recap service
- Auth service
- Credits service
- Subscription service
- User service
- Theme service

### Error Handling

**User-Friendly Errors:**
- Clear error messages
- Toast notifications
- Error states in UI
- Retry options
- Fallback content

**Error Types:**
- Network errors
- Authentication errors
- Validation errors
- Credit insufficient
- Rate limiting
- Server errors

---

## Additional Features

### Referral System

**How It Works:**
1. User gets referral code
2. Shares with friends
3. Friend signs up with code
4. Both users get benefits (if implemented)

**Referral Code Sources:**
- Cookie storage
- URL parameters
- Manual entry
- OAuth flow preservation

### Email System

**Email Types:**
- Verification email
- Password reset email
- Welcome email (if implemented)
- Notification emails (if implemented)

**Email Templates:**
- HTML formatted
- Responsive design
- Branded styling
- Action buttons

### Analytics & Tracking

**Cookie Consent:**
- User can accept/reject
- Analytics only if accepted
- Preference saved (1 year)
- Google Analytics integration
- Smartlook integration (if implemented)

### Legal Pages

**Privacy Policy** (`/privacy-policy`)
- Data collection
- Data usage
- User rights
- Cookie policy

**Terms & Conditions** (`/terms-and-conditions`)
- Service terms
- User obligations
- Liability
- Dispute resolution

**FAQ** (`/faq`)
- Common questions
- Feature explanations
- Troubleshooting
- Multi-language support

---

## User Journey Summary

### First-Time User
1. Lands on site → Signs up → Verifies email → Logs in
2. Creates first recap → Selects themes → Views recap
3. Reviews flashcards → Tests knowledge → Listens to audio

### Regular User
1. Logs in → Views dashboard → Searches recaps
2. Opens recap → Reviews flashcards → Generates audio
3. Tests knowledge → Pins important recaps → Manages account

### Power User
1. Creates multiple recaps → Organizes with pins
2. Uses bulk operations → Manages subscription
3. Customizes theme → Invites friends → Exports data (if available)

---

## Future Enhancements (Roadmap)

Based on FAQ and codebase analysis:

1. **Export Functionality**
   - Export recaps as PDF
   - Download summaries
   - Export flashcards

2. **Sharing Features**
   - Public recap links
   - Share with friends
   - Collaborative editing

3. **Enhanced Analytics**
   - Learning progress tracking
   - Review statistics
   - Knowledge retention metrics

4. **More Content Sources**
   - Podcast support
   - Web articles
   - Video platforms beyond YouTube

5. **Advanced Learning**
   - Spaced repetition scheduling
   - Learning streaks
   - Achievement system

---

## Conclusion

Memory Loop is a comprehensive learning platform that transforms educational content into personalized, reviewable learning materials. With features ranging from AI-powered summarization to active recall testing, it provides a complete solution for learners who want to better retain information from long-form content.

The platform combines modern web technologies (PWA, i18n, responsive design) with powerful AI capabilities to create an engaging and effective learning experience.
