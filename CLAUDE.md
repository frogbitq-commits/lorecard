# Claude Development Notes for Lorecard

## Target Device

**Primary optimization target**: iPhone 17 Pro Max on Chrome

Note: Chrome on iOS uses WebKit (Safari's rendering engine), not Chromium's Blink engine. This is mandated by Apple for all iOS browsers. Therefore, when optimizing for "Chrome on iPhone", we are effectively optimizing for Safari/WebKit behavior.

## Mobile Considerations

1. **User Agent Detection**: iOS Chrome reports as Safari WebKit in user agent. Detection should look for:
   - `iPhone` in user agent string
   - `iPad` in user agent string (for tablet)
   - `Mobile` combined with `AppleWebKit`

2. **useMediaQuery Behavior**: The `@mantine/hooks` `useMediaQuery` hook returns `undefined` initially during hydration, then settles to the actual value. For mobile-first safety, the `useIsMobile` hook includes user agent fallback to detect iOS devices immediately on initial render.

3. **Monaco Editor**: Monaco Editor has limited mobile support. It is lazy-loaded and only used in modals, not on main pages.

4. **Touch Events**: iOS Safari requires `touch-action: manipulation` on interactive elements to prevent 300ms click delay.

5. **Safe Areas**: Consider iOS safe areas (notch, home indicator) with `env(safe-area-inset-*)`.

## Breakpoints

The app uses Mantine's breakpoint system:
- Mobile: `< 768px` (below `sm` breakpoint)
- Desktop: `>= 768px` (`sm` breakpoint and above)

The `useIsMobile()` hook uses `(max-width: 767px)` to align with Mantine's `hiddenFrom="sm"` and `visibleFrom="sm"` props.

## Git Workflow

- Always create a feature branch before making changes: `git checkout -b feature/<name>`
- Never commit directly to `main`

### PR Self-Review Loop

When pushing a PR in this repo, always run the pr-review-suite and address findings before requesting human review:

1. **Create the PR** — Push your branch and open the pull request
2. **Run `/review-pr`** — Execute the pr-review-suite skill against your changes
3. **Address findings** — Fix all Critical, High, and Medium severity issues; address Low as appropriate
4. **Track approvals** — Maintain a list of which reviewers have approved:
   - Code Quality: ⏳ pending / ✅ approved
   - Security Audit: ⏳ pending / ✅ approved
   - Simplification: ⏳ pending / ✅ approved
   - Bug Discovery: ⏳ pending / ✅ approved
   - UI/UX Review: ⏳ pending / ✅ approved / ⊘ skipped (no frontend changes)
5. **Re-run only pending reviewers** — After addressing issues, re-run only the review passes that haven't approved yet
6. **Loop until all approve** — Continue the fix → re-review cycle until all applicable reviewers show no Critical/High/Medium issues
7. **Commit the fixes** — Squash or add commits for the review fixes, then push

A reviewer "approves" when it returns no Critical, High, or Medium severity findings. Low findings don't block approval but should still be addressed when reasonable.

**Example loop:**
```
Iteration 1: Run all 5 passes
  - Code Quality: ✅ (no critical/high/medium)
  - Security: 🔴 2 high issues
  - Simplify: 🟡 1 medium issue
  - Bugs: 🔴 1 critical issue
  - UI/UX: ⊘ skipped

Iteration 2: Fix security + simplify + bug issues, re-run those 3 passes
  - Security: ✅ (fixed)
  - Simplify: ✅ (fixed)
  - Bugs: ✅ (fixed)

All reviewers approved → PR ready for human review
```
