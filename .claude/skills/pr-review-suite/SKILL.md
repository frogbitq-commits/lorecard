---
name: pr-review-suite
description: Runs a comprehensive multi-pass PR review covering code quality, security, simplification opportunities, and bug discovery. Use when asked to "review this PR", "run the review suite", "do a full code review", or via /review-pr. Produces a consolidated report with findings from all review passes organized by severity.
---

# PR Review Suite

Perform a comprehensive code review by running four specialized review passes and consolidating findings into a single report.

## Review Passes

**Always run:**
1. **Code Quality** — Readability, maintainability, code smells, best practices
2. **Security Audit** — Vulnerabilities, injection risks, unsafe patterns, edge cases
3. **Simplification** — Complexity reduction, KISS violations, refactoring opportunities
4. **Bug Discovery** — Logic errors, edge cases, potential runtime failures

**Conditional:**
5. **UI/UX Review** — Visual design, accessibility, interaction patterns, responsive behavior
   - *Triggers when changes include*: `.jsx`, `.tsx`, `.vue`, `.svelte`, `.css`, `.scss`, `.html`, or component files

## Execution

1. Identify the code to review (diff, staged changes, specific files, or PR)
2. Run each review pass using the prompts in `references/`
3. Consolidate findings into a single report organized by severity

### Getting the Code Context

Determine what to review based on user request:
- **Uncommitted changes**: `git diff`
- **Staged changes**: `git diff --cached`
- **Branch vs main**: `git diff main...HEAD` or `git diff master...HEAD`
- **Specific files**: Read the files directly
- **PR**: `gh pr diff` if gh CLI available

### Running Review Passes

For each pass, read the corresponding reference file and apply that reviewer's lens to the code:

```
references/
├── code-quality.md      # Pass 1: Quality review criteria
├── security.md          # Pass 2: Security audit criteria  
├── simplify.md          # Pass 3: Simplification criteria
├── bugs.md              # Pass 4: Bug discovery criteria
└── ui-ux.md             # Pass 5: UI/UX review (frontend only)
```

Apply each review sequentially. For each pass:
1. Read the reference file for that reviewer's methodology
2. Analyze the code through that specific lens
3. Record findings with severity, location, and recommendations

**For UI/UX pass**: Only run if the diff contains frontend files (jsx/tsx/vue/svelte/css/scss/html or files in `components/`, `pages/`, `views/` directories). Skip silently if no frontend code is present.

## Output Format

Produce a consolidated markdown report:

```markdown
# PR Review Report

**Reviewed**: [description of what was reviewed]
**Date**: [timestamp]

## Severity Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | X |
| 🟠 High | X |
| 🟡 Medium | X |
| 🟢 Low | X |

---

## Critical & High Priority Issues

[List all CRITICAL and HIGH issues from all passes here, grouped together]

---

## Code Quality Review

[Findings from code-quality pass]

## Security Audit

[Findings from security pass]

## Simplification Opportunities

[Findings from simplify pass]

## Bug Discovery

[Findings from bugs pass]

## UI/UX Review (if applicable)

[Findings from ui-ux pass — omit section if no frontend code reviewed]

---

## Action Items

1. [Prioritized list of what to fix first]
```

## Guidelines

- **Be specific**: Reference exact lines, functions, and code snippets
- **Be actionable**: Every issue needs a concrete fix recommendation
- **Deduplicate**: If multiple passes flag the same issue, consolidate it
- **Prioritize**: Lead with critical/high severity items
- **Acknowledge good code**: Note well-implemented patterns worth preserving
