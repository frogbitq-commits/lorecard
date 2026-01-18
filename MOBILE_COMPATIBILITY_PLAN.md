# Lorecard Mobile Compatibility Plan

## Overview

This document outlines the plan to make Lorecard fully responsive and mobile-friendly. The application currently works well on desktop but has significant usability issues on mobile devices.

**Current State**: Desktop-first with minimal mobile optimization
**Target State**: Fully responsive across all device sizes

---

## Design Principles

### 1. Mobile-First Approach
- Design for the smallest screen first, then enhance for larger screens
- Use Mantine's responsive props: `{{ base: X, sm: Y, md: Z }}`
- Base breakpoint (mobile) should always be functional

### 2. Touch-Friendly Targets
- Minimum touch target size: 44x44px
- Adequate spacing between interactive elements
- Larger buttons on mobile where possible

### 3. Content Priority
- Show essential information first on mobile
- Progressive disclosure for secondary actions
- Collapse/hide non-critical columns on small screens

### 4. Consistent Patterns
- Same responsive patterns across all components
- Predictable behavior when resizing

---

## Breakpoint Strategy

Using Mantine's default breakpoints:

| Breakpoint | Size | Target Devices |
|------------|------|----------------|
| `base` | 0-575px | Phones (portrait) |
| `xs` | 576px+ | Phones (landscape) |
| `sm` | 768px+ | Tablets (portrait) |
| `md` | 992px+ | Tablets (landscape), Small laptops |
| `lg` | 1200px+ | Desktops |
| `xl` | 1400px+ | Large desktops |

---

## Component Design Specifications

### 1. Navigation (AppLayout)

**Current**: 300px fixed sidebar, collapses on `sm`
**Proposed Changes**:

```
Mobile (base):
┌─────────────────────────┐
│ ☰  Lorecard        [?]  │  ← Header with burger menu
├─────────────────────────┤
│                         │
│      Page Content       │
│                         │
└─────────────────────────┘

Tablet+ (sm):
┌────────┬────────────────┐
│ Logo   │                │
│ Nav 1  │  Page Content  │
│ Nav 2  │                │
│ Nav 3  │                │
└────────┴────────────────┘
```

**Changes Required**:
- Reduce navbar width: `width: { base: 250, md: 300 }`
- Add swipe-to-close gesture support (optional enhancement)

---

### 2. Tables → Responsive Cards/Lists

**Current**: Standard HTML tables that overflow on mobile
**Proposed**: Card-based layout on mobile, table on desktop

```
Desktop (md+):
┌──────────────────────────────────────────────┐
│ Name          │ Status    │ Updated   │ ⚙️   │
├──────────────────────────────────────────────┤
│ Project A     │ Complete  │ 2 hrs ago │ •••  │
│ Project B     │ Running   │ 1 day ago │ •••  │
└──────────────────────────────────────────────┘

Mobile (base):
┌─────────────────────────┐
│ Project A          •••  │
│ Status: Complete        │
│ Updated: 2 hrs ago      │
├─────────────────────────┤
│ Project B          •••  │
│ Status: Running         │
│ Updated: 1 day ago      │
└─────────────────────────┘
```

**Implementation Pattern**:
```tsx
// Use visibility based on breakpoint
<Box hiddenFrom="md">
  <Stack gap="sm">
    {items.map(item => <ItemCard key={item.id} item={item} />)}
  </Stack>
</Box>
<Box visibleFrom="md">
  <Table>...</Table>
</Box>
```

**Affected Components**:
- `ProjectsPage.tsx` - Projects list
- `CredentialsPage.tsx` - Credentials list
- `GlobalTemplatesPage.tsx` - Templates list
- `StepProcessEntries.tsx` - Entry processing list
- `StepCompletedView.tsx` - Completed entries
- `ApiRequestLogModal.tsx` - API logs (8 columns!)

---

### 3. Forms → Stacked on Mobile

**Current**: Side-by-side inputs using `<Group grow>`
**Proposed**: Stack vertically on mobile, side-by-side on tablet+

```
Desktop (sm+):
┌─────────────────────────────────────┐
│ [Provider ▼]     [Model Name    ]   │
│ [API Key                        ]   │
│              [Cancel] [Save]        │
└─────────────────────────────────────┘

Mobile (base):
┌─────────────────────────┐
│ [Provider           ▼]  │
│ [Model Name          ]  │
│ [API Key             ]  │
│ [Cancel]                │
│ [Save]                  │
└─────────────────────────┘
```

**Implementation Pattern**:
```tsx
// Replace Group grow with SimpleGrid
<SimpleGrid cols={{ base: 1, sm: 2 }}>
  <Select ... />
  <TextInput ... />
</SimpleGrid>
```

**Affected Components**:
- `ProjectModal.tsx`
- `CredentialModal.tsx`
- `ProjectSourceModal.tsx`

---

### 4. Button Groups → Wrap or Stack

**Current**: Horizontal buttons that overflow
**Proposed**: Wrap on mobile, consider icon-only for space-constrained areas

```
Desktop (sm+):
┌──────────────────────────────────────────────────────┐
│ [Start Generation] [Reprocess] [Delete] [Add Links] │
└──────────────────────────────────────────────────────┘

Mobile - Option A (Wrapped):
┌─────────────────────────┐
│ [Start Gen] [Reprocess] │
│ [Delete] [Add Links]    │
└─────────────────────────┘

Mobile - Option B (Stacked with full width):
┌─────────────────────────┐
│ [  Start Generation   ] │
│ [     Reprocess       ] │
│ [       Delete        ] │
│ [     Add Links       ] │
└─────────────────────────┘

Mobile - Option C (Icon buttons in toolbar):
┌─────────────────────────┐
│  [▶️] [🔄] [🗑️] [➕]     │
└─────────────────────────┘
```

**Implementation Pattern**:
```tsx
// Option A - Wrap
<Group wrap="wrap" gap="xs">
  <Button>...</Button>
</Group>

// Option B - Stack on mobile
<Stack hiddenFrom="sm">
  <Button fullWidth>...</Button>
</Stack>
<Group visibleFrom="sm">
  <Button>...</Button>
</Group>

// Option C - Icon buttons on mobile
<ActionIcon hiddenFrom="sm" title="Start Generation">
  <IconPlayerPlay />
</ActionIcon>
<Button visibleFrom="sm" leftSection={<IconPlayerPlay />}>
  Start Generation
</Button>
```

**Affected Components**:
- `ProjectDetailPage.tsx` - 3 buttons
- `StepProcessEntries.tsx` - 4 buttons
- `CharacterEditor.tsx` - 3 buttons

---

### 5. Modals → Fullscreen on Mobile

**Current**: Fixed sizes (xl, lg) that may exceed viewport
**Proposed**: Fullscreen on mobile, sized on desktop

```
Desktop (sm+):
┌─────────────────────────────────────┐
│                                     │
│      ┌─────────────────────┐        │
│      │   Modal Content     │        │
│      │                     │        │
│      └─────────────────────┘        │
│                                     │
└─────────────────────────────────────┘

Mobile (base):
┌─────────────────────────┐
│ ✕  Modal Title          │
├─────────────────────────┤
│                         │
│    Modal Content        │
│    (Scrollable)         │
│                         │
├─────────────────────────┤
│        [Actions]        │
└─────────────────────────┘
```

**Implementation Pattern**:
```tsx
<Modal
  size="xl"
  fullScreen={useMediaQuery('(max-width: 768px)')}
  // Or use Mantine's built-in:
  // fullScreen  // Always fullscreen, then override
>
```

**Affected Components**:
- `ProjectModal.tsx` - size="xl"
- `CredentialModal.tsx` - size="lg"
- `ProjectSourceModal.tsx` - size="lg"
- `ApiRequestLogModal.tsx` - size="90%"
- `ProjectAnalyticsModal.tsx` - size="xl"

---

### 6. Source Lists (wrap="nowrap" fixes)

**Current**: Items overflow horizontally
**Proposed**: Multi-line layout on mobile

```
Desktop (sm+):
┌────────────────────────────────────────────────────┐
│ ☑️ https://example.com/very-long-url...  [🔗][🗑️]  │
└────────────────────────────────────────────────────┘

Mobile (base):
┌─────────────────────────┐
│ ☑️ https://example.com/ │
│    very-long-url...     │
│              [🔗] [🗑️]   │
└─────────────────────────┘
```

**Implementation Pattern**:
```tsx
// Change wrap="nowrap" to wrap="wrap"
<Group justify="space-between" wrap="wrap">
  <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
    <Checkbox />
    <Text truncate style={{ flex: 1 }}>URL here</Text>
  </Group>
  <Group gap="xs">
    <ActionIcon>...</ActionIcon>
  </Group>
</Group>
```

**Affected Components**:
- `CharacterSources.tsx` - Lines 112, 148
- `ManageSourcesStep.tsx` - Lines 76, 91
- `CredentialModal.tsx` - Line 243

---

### 7. ScrollArea Heights

**Current**: Fixed heights (e.g., `h={400}`)
**Proposed**: Responsive heights

```tsx
<ScrollArea h={{ base: 250, sm: 350, md: 400 }}>
```

**Affected Components**:
- `StepConfirmLinks.tsx` - Line 148

---

## Implementation Plan

### Phase 1: Critical Fixes (High Impact, Low Effort)

| Task | Component | Change |
|------|-----------|--------|
| 1.1 | Global | Add responsive modal hook utility |
| 1.2 | CharacterSources.tsx | Remove `wrap="nowrap"` (2 instances) |
| 1.3 | ManageSourcesStep.tsx | Remove `wrap="nowrap"` (2 instances) |
| 1.4 | CredentialModal.tsx | Remove `wrap="nowrap"` (1 instance) |
| 1.5 | All button Groups | Add `wrap="wrap"` |

### Phase 2: Modal & Form Improvements

| Task | Component | Change |
|------|-----------|--------|
| 2.1 | ProjectModal.tsx | Fullscreen on mobile + responsive form grid |
| 2.2 | CredentialModal.tsx | Fullscreen on mobile + responsive form grid |
| 2.3 | ProjectSourceModal.tsx | Fullscreen on mobile + responsive form grid |
| 2.4 | ApiRequestLogModal.tsx | Fullscreen on mobile + card view for logs |
| 2.5 | ProjectAnalyticsModal.tsx | Fullscreen on mobile |

### Phase 3: Table → Card Transformations

| Task | Component | Change |
|------|-----------|--------|
| 3.1 | Create ResponsiveTable component | Reusable wrapper |
| 3.2 | ProjectsPage.tsx | Implement card view for mobile |
| 3.3 | CredentialsPage.tsx | Implement card view for mobile |
| 3.4 | GlobalTemplatesPage.tsx | Implement card view for mobile |
| 3.5 | StepProcessEntries.tsx | Implement card view for mobile |
| 3.6 | StepCompletedView.tsx | Implement card view for mobile |

### Phase 4: Polish & Enhancements

| Task | Component | Change |
|------|-----------|--------|
| 4.1 | AppLayout.tsx | Optimize navbar width |
| 4.2 | All | Add text truncation where missing |
| 4.3 | All | Ensure 44px touch targets |
| 4.4 | StepConfirmLinks.tsx | Responsive ScrollArea height |
| 4.5 | Global | Test and fix edge cases |

---

## Reusable Components to Create

### 1. `useIsMobile` Hook
```tsx
// hooks/useIsMobile.ts
import { useMediaQuery } from '@mantine/hooks';

export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}
```

### 2. `ResponsiveTable` Component
```tsx
// components/common/ResponsiveTable.tsx
interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  renderCard: (item: T) => React.ReactNode;
  mobileBreakpoint?: string;
}
```

### 3. `ResponsiveButtonGroup` Component
```tsx
// components/common/ResponsiveButtonGroup.tsx
interface ResponsiveButtonGroupProps {
  children: React.ReactNode;
  stackOnMobile?: boolean;
  fullWidthOnMobile?: boolean;
}
```

---

## Testing Checklist

### Device Targets
- [ ] iPhone SE (375px) - Smallest common phone
- [ ] iPhone 14 (390px) - Standard phone
- [ ] iPhone 14 Pro Max (430px) - Large phone
- [ ] iPad Mini (768px) - Small tablet
- [ ] iPad (1024px) - Standard tablet
- [ ] Desktop (1280px+)

### Feature Testing Per Device
- [ ] Navigation opens/closes properly
- [ ] All tables are readable without horizontal scroll
- [ ] Forms are usable and submittable
- [ ] Modals fit the viewport
- [ ] Buttons are tappable (44px minimum)
- [ ] Text is readable (16px minimum)
- [ ] No horizontal page scroll

---

## Files to Modify (Complete List)

### Priority 1 - Remove wrap="nowrap"
1. `client/src/components/workspace/CharacterSources.tsx`
2. `client/src/components/workspace/ManageSourcesStep.tsx`
3. `client/src/components/credentials/CredentialModal.tsx`

### Priority 2 - Modals
4. `client/src/components/projects/ProjectModal.tsx`
5. `client/src/components/projects/ApiRequestLogModal.tsx`
6. `client/src/components/projects/ProjectAnalyticsModal.tsx`
7. `client/src/components/workspace/ProjectSourceModal.tsx`

### Priority 3 - Button Groups
8. `client/src/pages/ProjectDetailPage.tsx`
9. `client/src/components/workspace/StepProcessEntries.tsx`
10. `client/src/components/workspace/CharacterEditor.tsx`

### Priority 4 - Tables
11. `client/src/pages/ProjectsPage.tsx`
12. `client/src/pages/CredentialsPage.tsx`
13. `client/src/pages/GlobalTemplatesPage.tsx`
14. `client/src/components/workspace/StepCompletedView.tsx`

### Priority 5 - Other
15. `client/src/components/workspace/StepConfirmLinks.tsx`
16. `client/src/App.tsx` or `main.tsx` (for hooks/utilities)

---

## Success Metrics

1. **No horizontal scrolling** on any page at 375px width
2. **All interactive elements** meet 44px minimum touch target
3. **All modals** fit within viewport on mobile
4. **All forms** are fully functional on mobile
5. **Tables** display data in a readable format on mobile
6. **Navigation** is accessible via burger menu on mobile

---

## Notes

- Mantine UI already provides excellent responsive primitives - we just need to use them
- The `visibleFrom` and `hiddenFrom` props are key for conditional rendering
- Consider using `@mantine/hooks` for `useMediaQuery` where JavaScript-based detection is needed
- Test with real devices when possible, not just browser dev tools
