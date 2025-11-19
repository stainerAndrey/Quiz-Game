# Quick Start Guide - New UI Components

## 🎨 Design System

### Using the Theme

```javascript
import { theme } from '../theme';

// Colors
theme.colors.primary[600]    // Main brand color
theme.colors.success[500]    // Success green
theme.colors.warning[600]    // Warning orange
theme.colors.danger[600]     // Error red
theme.colors.neutral[700]    // Text color

// Spacing
theme.spacing.sm    // 0.5rem (8px)
theme.spacing.md    // 0.75rem (12px)
theme.spacing.lg    // 1rem (16px)
theme.spacing.xl    // 1.5rem (24px)

// Typography
theme.fontSizes.sm         // 0.875rem
theme.fontSizes.base       // 1rem
theme.fontSizes.lg         // 1.125rem
theme.fontWeights.medium   // 500
theme.fontWeights.semibold // 600

// Border Radius
theme.radii.md    // 0.5rem
theme.radii.lg    // 0.75rem
theme.radii.xl    // 1rem

// Shadows
theme.shadows.sm    // Subtle
theme.shadows.md    // Medium
theme.shadows.lg    // Large

// Transitions
theme.transitions.fast  // 150ms
theme.transitions.base  // 200ms
theme.transitions.slow  // 300ms
```

---

## 🧩 Components

### Button

```javascript
import Button from './components/ui/Button';

// Primary button
<Button onClick={handleClick}>
  Click Me
</Button>

// With variant and size
<Button variant="secondary" size="lg" onClick={handleClick}>
  Large Secondary
</Button>

// With icons
<Button leftIcon="🚀" onClick={handleClick}>
  Start
</Button>

<Button rightIcon="→" variant="primary">
  Next
</Button>

// Loading state
<Button loading={isLoading} disabled={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>

// Danger button
<Button variant="danger" onClick={handleDelete}>
  Delete
</Button>

// Ghost button (transparent)
<Button variant="ghost" onClick={handleCancel}>
  Cancel
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost' (default: 'primary')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')
- `loading`: boolean (shows spinner)
- `disabled`: boolean
- `leftIcon`: ReactNode
- `rightIcon`: ReactNode
- All standard button props (onClick, type, etc.)

---

### Card

```javascript
import Card from './components/ui/Card';

// Default card
<Card>
  <h2>Title</h2>
  <p>Content</p>
</Card>

// With variant
<Card variant="elevated">
  {/* Has shadow, no border */}
</Card>

<Card variant="gradient">
  {/* Gradient background */}
</Card>

// With padding
<Card padding="xl">
  {/* Extra large padding */}
</Card>
```

**Props:**
- `variant`: 'default' | 'elevated' | 'gradient' (default: 'default')
- `padding`: 'sm' | 'md' | 'lg' | 'xl' (default: 'lg')
- All standard div props

---

### Badge

```javascript
import Badge from './components/ui/Badge';

// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="info">New</Badge>
<Badge variant="default">Default</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>

// Common patterns
<Badge variant="success">✓ Connected</Badge>
<Badge variant="danger">✗ Disconnected</Badge>
<Badge variant="info">Question 1 of 10</Badge>
<Badge variant="warning">⏱ 15s</Badge>
```

**Props:**
- `variant`: 'success' | 'warning' | 'danger' | 'info' | 'default' (default: 'default')
- `size`: 'sm' | 'md' | 'lg' (default: 'md')

---

### Skeleton

```javascript
import { Skeleton } from './components/ui/Skeleton';

// Loading states
<Skeleton height="2rem" width="60%" />
<Skeleton height="1rem" width="40%" style={{ marginTop: '1rem' }} />

// Variants
<Skeleton variant="text" height="1rem" />
<Skeleton variant="circular" width="40px" height="40px" />
<Skeleton variant="rectangular" height="200px" />

// Multiple skeletons
{[1, 2, 3].map(i => (
  <Skeleton key={i} height="4rem" style={{ marginBottom: '0.5rem' }} />
))}
```

**Props:**
- `width`: string (default: '100%')
- `height`: string (default: '1rem')
- `variant`: 'text' | 'circular' | 'rectangular' (default: 'text')
- `style`: CSSProperties

---

### EmptyState

```javascript
import EmptyState from './components/ui/EmptyState';

// Basic empty state
<EmptyState
  icon="📭"
  title="No items"
  description="There are no items to display"
/>

// With action
<EmptyState
  icon="👥"
  title="No participants yet"
  description="Waiting for players to join"
  action={
    <Button onClick={handleRefresh}>Refresh</Button>
  }
/>

// Custom icons
<EmptyState icon="🔍" title="No results" />
<EmptyState icon="🎯" title="Ready to start" />
<EmptyState icon="🏆" title="No scores yet" />
```

**Props:**
- `icon`: string (emoji or character, default: '📭')
- `title`: string (default: 'No data')
- `description`: string (optional)
- `action`: ReactNode (optional - usually a Button)

---

### AnswerChart

```javascript
import AnswerChart from './components/ui/AnswerChart';

// Answer distribution
<AnswerChart
  options={['Option A', 'Option B', 'Option C', 'Option D']}
  counts={[5, 12, 8, 3]}
  correctIndex={1}
  revealed={true}
/>
```

**Props:**
- `options`: string[] (answer text)
- `counts`: number[] (vote counts per option)
- `correctIndex`: number (index of correct answer)
- `revealed`: boolean (whether to highlight correct answer)

---

## 🪝 Custom Hooks

### useMediaQuery

```javascript
import { useMediaQuery } from '../hooks/useMediaQuery';

function MyComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  
  return (
    <div style={{
      flexDirection: isMobile ? 'column' : 'row',
      padding: isMobile ? '1rem' : '2rem',
    }}>
      {isMobile ? 'Mobile View' : 'Desktop View'}
    </div>
  );
}
```

**Parameters:**
- `query`: string (any valid media query)

**Returns:**
- boolean (true if matches, false otherwise)

---

## 🎨 CSS Utilities

### Screen Reader Only

```javascript
// Hide visually but keep for screen readers
<span className="sr-only">
  This text is only for screen readers
</span>

// Example: form labels
<label>
  <span className="sr-only">Enter your name</span>
  <input placeholder="Name" />
</label>
```

### Animations

Available animations (use in style object):
```javascript
// Slide in from right
animation: 'slideInRight 200ms ease-out'

// Fade out
animation: 'fadeOut 200ms ease-in'

// Spin (for loaders)
animation: 'spin 1s linear infinite'

// Pulse
animation: 'pulse 2s ease-in-out infinite'

// Scale in
animation: 'scaleIn 200ms ease-out'

// Shimmer (for skeletons)
animation: 'shimmer 1.5s infinite'
```

---

## 🎯 Common Patterns

### Loading States

```javascript
// Instead of this:
if (loading) return <div>Loading...</div>;

// Do this:
if (loading) {
  return (
    <div>
      <Skeleton height="2rem" width="60%" />
      <Skeleton height="1rem" width="40%" style={{ marginTop: '1rem' }} />
    </div>
  );
}
```

### Empty States

```javascript
// Instead of this:
if (items.length === 0) return <p>No items</p>;

// Do this:
if (items.length === 0) {
  return (
    <EmptyState
      icon="📦"
      title="No items yet"
      description="Items you add will appear here"
      action={<Button onClick={handleAdd}>Add Item</Button>}
    />
  );
}
```

### Status Indicators

```javascript
// Instead of this:
<span>{isConnected ? 'Connected' : 'Disconnected'}</span>

// Do this:
<Badge variant={isConnected ? 'success' : 'danger'}>
  {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
</Badge>
```

### Action Buttons

```javascript
// Instead of this:
<button onClick={handleSubmit} disabled={loading}>
  {loading ? 'Loading...' : 'Submit'}
</button>

// Do this:
<Button 
  onClick={handleSubmit} 
  loading={loading}
  size="lg"
>
  Submit
</Button>
```

### Responsive Layouts

```javascript
// Use the hook
const isMobile = useMediaQuery('(max-width: 1024px)');

// Conditional rendering
<div style={{ 
  display: 'flex',
  flexDirection: isMobile ? 'column' : 'row',
  gap: theme.spacing.xl,
}}>
  <main style={{ flex: isMobile ? '1' : '3 1 600px' }}>
    {/* Main content */}
  </main>
  <aside style={{ flex: isMobile ? '1' : '1 1 300px' }}>
    {/* Sidebar */}
  </aside>
</div>
```

---

## ♿ Accessibility Guidelines

### Buttons
```javascript
// Always provide aria-label for icon-only buttons
<Button aria-label="Close dialog">×</Button>

// Describe the action
<Button aria-label="Delete item">🗑️</Button>
```

### Live Regions
```javascript
// Announce updates to screen readers
<div role="status" aria-live="polite">
  {message}
</div>

// For critical alerts
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

### Form Fields
```javascript
// Associate labels
<label htmlFor="name">Name</label>
<input id="name" />

// Or hide label visually
<label>
  <span className="sr-only">Name</span>
  <input placeholder="Enter your name" />
</label>
```

---

## 🎨 Styling Best Practices

### Use Theme Values
```javascript
// ❌ Bad
style={{ color: '#2563eb', padding: '16px' }}

// ✅ Good
style={{ 
  color: theme.colors.primary[600],
  padding: theme.spacing.lg,
}}
```

### Transitions
```javascript
// ❌ Bad
style={{ transition: '0.2s' }}

// ✅ Good
style={{ transition: `all ${theme.transitions.base}` }}
```

### Responsive Sizing
```javascript
// ❌ Bad (fixed size)
style={{ fontSize: '32px' }}

// ✅ Good (responsive)
style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}
```

---

## 🚀 Migration Examples

### Before (Old Code)
```javascript
<div>
  <h1>Join the Quiz</h1>
  <form onSubmit={join}>
    <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
    <button type='submit' disabled={joining}>
      {joining ? 'Joining...' : 'Join'}
    </button>
  </form>
</div>
```

### After (New Code)
```javascript
<Card variant="gradient" padding="xl">
  <h1 style={{ marginTop: 0, textAlign: 'center' }}>Join the Quiz</h1>
  <p style={{ 
    textAlign: 'center', 
    color: theme.colors.neutral[600],
    marginBottom: theme.spacing.xl,
  }}>
    Enter your name to participate
  </p>
  <form onSubmit={join}>
    <input 
      value={name} 
      onChange={e => setName(e.target.value)} 
      placeholder="Your name" 
      aria-label="Enter your name"
      required
      autoFocus
      style={{ 
        padding: theme.spacing.md,
        fontSize: theme.fontSizes.lg,
        width: '100%',
        borderRadius: theme.radii.lg,
        border: `2px solid ${theme.colors.neutral[300]}`,
        marginBottom: theme.spacing.lg,
        fontFamily: 'inherit',
      }}
    />
    <Button 
      type='submit' 
      disabled={joining || !name.trim()} 
      loading={joining}
      size="lg"
      style={{ width: '100%' }}
    >
      Join Quiz
    </Button>
  </form>
</Card>
```

---

## 📚 Additional Resources

- **Theme Reference:** `frontend/src/theme.js`
- **Component Examples:** See `ParticipantApp.jsx` and `PresenterApp.jsx`
- **Animation Keyframes:** `frontend/src/index.css`
- **Full Documentation:** `IMPLEMENTATION_SUMMARY.md`

---

**Happy coding! 🚀**

