# Agent Instructions for Nourished Rebel Development

## Purpose

This document defines how AI agents must behave when working on the Nourished Rebel website. These rules govern all development decisions, feature additions, and design choices to ensure consistency and alignment with the brand mission.

## Scope Rules

### What You Must NOT Do

**1. Do Not Invent New Branding**
- Never change the brand mission, values, or personality
- Never introduce new taglines or positioning statements
- Never alter the core messaging framework
- Always reference DesignStrategy.md for brand voice

**2. Do Not Redesign Visual Identity**
- Never change the color palette without explicit instruction
- Never introduce purple, indigo, or violet hues unless requested
- Never alter the typography scale or font families
- Never change the logo or brand mark
- Stick to established spacing and layout patterns
- Always reference `colors.md` for the complete color system
- Always use colors from `src/styles/tokens.css` for consistency

**3. Do Not Add Features Beyond Requested Phases**
- Phase 1: Static website with homepage, navigation, footer, placeholder pages
- Phase 2: Quizzes and interactive assessments (not yet)
- Phase 3: Programs, courses, and dashboards (not yet)
- Phase 4: Membership, accounts, and payments (not yet)
- Only build what is explicitly requested for the current phase

**4. Do Not Use Prohibited Language**
- Never use diagnostic or medical claims
- Never use fear-based messaging
- Never use diet culture framing
- Never use aggressive marketing language
- Reference DesignStrategy.md Content Guardrails section

## Build Rules

### Component Architecture

**1. All Components Must Be Modular and Reusable**
- Create small, single-purpose components
- Use composition over large monolithic components
- Extract repeated patterns into shared components
- Store reusable components in `/src/components/shared/`
- Store page-specific components in `/src/components/[pagename]/`

**2. Placeholder Data Must Be Used for Dynamic Content**
- Use TypeScript interfaces for all data structures
- Create mock data that aligns with brand voice
- Prepare for easy swap to real data from Supabase
- Never hardcode content directly in components
- Store data types in `/src/types/`

**3. Assume Future Phases Will Add Features**
- Structure navigation to accommodate logged-in states
- Design database schemas for future expansion
- Build flexible layout components that can adapt
- Leave clear comments for future integration points
- Avoid patterns that would require major refactoring

### Code Quality Standards

**1. TypeScript**
- Use strict TypeScript types for all props and state
- Define interfaces for all data structures
- Avoid `any` types unless absolutely necessary
- Export types from a central types file

**2. React Best Practices**
- Use functional components with hooks
- Extract custom hooks for reusable logic
- Implement proper error boundaries
- Use React.memo for expensive components
- Handle loading and error states gracefully

**3. Accessibility**
- Use semantic HTML elements
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers in mind
- Maintain color contrast ratios (WCAG AA minimum)

**4. Performance**
- Lazy load images and heavy components
- Optimize bundle size
- Use appropriate image formats
- Implement proper caching strategies
- Monitor and optimize render performance

### File Organization

```
src/
├── components/
│   ├── shared/          # Reusable components (Button, Card, etc.)
│   ├── layout/          # Navigation, Footer, Layout wrapper
│   └── home/            # Homepage-specific sections
├── pages/               # Page components for routing
├── lib/                 # Utilities, Supabase client, helpers
├── types/               # TypeScript interfaces and types
├── hooks/               # Custom React hooks
├── styles/              # CSS files including tokens.css
└── assets/              # Images, icons, static files
```

### Color System

**CRITICAL:** The Nourished Rebel brand color system is fully documented in `colors.md` and implemented in `src/styles/tokens.css`.

**Primary Brand Color:** #675C53 (Warm Brown)
- This MUST be the dominant color in all UI
- Use for: CTAs, H1/H2 headings, active states, primary buttons
- Defined in Tailwind as `brand-primary`

**Reference Files:**
- **`colors.md`** - Complete color documentation with all variants (50-950), usage guidelines, and accessibility standards
- **`src/styles/tokens.css`** - CSS custom properties for all color variants
- **`tailwind.config.js`** - Simplified color tokens for Tailwind classes
- **`DesignStrategy.md`** - High-level brand color philosophy

**When Working with Colors:**
1. Always check `colors.md` for approved colors and variants
2. Use Tailwind color classes (e.g., `bg-brand-primary`, `text-text-heading`)
3. For custom needs, use CSS variables from tokens.css (e.g., `var(--color-brand-500)`)
4. NEVER use pure black (#000000) - use charcoal variants instead
5. Maintain WCAG AA contrast ratios minimum (check colors.md for tested combinations)
6. Use accent colors sparingly - primary brand color should dominate

## Decision Rules

### When You're Unsure

**1. Default to Simplicity**
- Choose the simpler implementation
- Don't over-engineer solutions
- Avoid premature optimization
- Build for current needs, not hypothetical futures

**2. Prioritize Clarity Over Cleverness**
- Write readable code over clever code
- Use descriptive variable and function names
- Add comments only when logic is complex
- Prefer explicit over implicit behavior

**3. Follow DesignStrategy.md Above All Else**
- When in doubt, reference the design strategy
- If the design strategy doesn't cover something, ask
- Never contradict established guidelines
- Maintain consistency with existing patterns

### Design Decision Framework

When making a design decision, ask:

1. **Does this align with the brand personality?** (Calm, grounded, supportive)
2. **Does this reduce decision fatigue?** (Simple, clear paths)
3. **Does this build trust?** (Transparent, honest, patient)
4. **Is this accessible?** (WCAG AA, keyboard nav, readable)
5. **Is this necessary?** (Avoid feature bloat)

If the answer to any question is "no," reconsider the decision.

### Content Decision Framework

When writing or editing content, ask:

1. **Is this empowering without being prescriptive?**
2. **Does this avoid medical/diagnostic claims?**
3. **Is this fear-free and shame-free?**
4. **Would this resonate with someone who's tried everything?**
5. **Is this in plain language (8th grade reading level)?**

If the answer to any question is "no," rewrite the content.

## Common Scenarios

### Scenario: User Asks to "Make It Pop"

**Don't:** Add bright colors, animations, or flashy effects
**Do:** Enhance visual hierarchy, improve spacing, add subtle hover states
**Why:** "Pop" for Nourished Rebel means clarity and breathing room, not visual excitement

### Scenario: User Wants to Add a New Section

**Don't:** Immediately build it
**Do:** First ask: What's the purpose? Who's it for? What should they do after seeing it?
**Why:** Every element should serve the user journey and brand mission

### Scenario: Content Feels Bland

**Don't:** Add superlatives, urgency, or hype
**Do:** Add specificity, personal voice, and authentic examples
**Why:** Warmth comes from humanity, not marketing language

### Scenario: Technical Decision Needed

**Don't:** Choose based on personal preference or latest trends
**Do:** Choose based on project needs, team skills, and long-term maintainability
**Why:** The best tool is the one that serves the project and can be maintained

### Scenario: User Requests a Feature from Phase 2+

**Don't:** Build it immediately
**Do:** Acknowledge the request, confirm it's planned, and ask if they want to move to that phase now
**Why:** Phased development ensures quality and prevents scope creep

## Supabase Database Guidelines

### Schema Design

**1. Plan for Future Features**
- Use clear, descriptive table names
- Add `created_at` and `updated_at` timestamps to all tables
- Use UUIDs for primary keys
- Consider relationships and foreign keys upfront

**2. Implement Row Level Security (RLS)**
- Enable RLS on all tables
- Start with public read access for content tables
- Prepare for user-specific policies in future phases
- Document security policies clearly

**3. Content Structure**
- Store rich text content in text fields
- Use JSONB for flexible metadata
- Add slug fields for URL-friendly identifiers
- Include status fields (draft, published, archived)

### Data Migration

- Use Supabase migrations for all schema changes
- Include rollback instructions
- Test migrations in development first
- Document all database changes

## Testing and Quality Assurance

### Before Considering Work Complete

- [ ] All TypeScript types are properly defined
- [ ] Components are responsive (mobile, tablet, desktop)
- [ ] Accessibility checklist passed (semantic HTML, ARIA labels, keyboard nav)
- [ ] Content follows voice and tone guidelines
- [ ] No console errors or warnings
- [ ] Images have alt text
- [ ] Forms have proper labels and validation
- [ ] Links have descriptive text
- [ ] Color contrast meets WCAG AA
- [ ] Build succeeds without errors

### Testing Checklist

- [ ] Test on mobile viewport (375px, 414px)
- [ ] Test on tablet viewport (768px, 1024px)
- [ ] Test on desktop viewport (1280px, 1920px)
- [ ] Test keyboard navigation
- [ ] Test with screen reader (if possible)
- [ ] Test hover states
- [ ] Test loading states
- [ ] Test error states
- [ ] Test empty states

## Communication Guidelines

### When Presenting Work

**Do:**
- Summarize what was built in plain English
- Explain how it serves the user
- Note any decisions made and why
- Flag any items that need review
- Suggest logical next steps

**Don't:**
- Use technical jargon unnecessarily
- Assume the user knows implementation details
- List every file changed
- Over-explain obvious things

### When Asking Questions

**Do:**
- Provide context for why you're asking
- Offer 2-3 options with pros/cons
- Make a recommendation
- Respect the user's time

**Don't:**
- Ask questions you can answer by checking DesignStrategy.md
- Present endless options without guidance
- Make the user do your job
- Ask leading questions

## Version Control

### Commit Messages

Use clear, descriptive commit messages:

**Format:** `[Component/Area] Brief description`

**Examples:**
- `[Navigation] Add scroll-based transparency effect`
- `[Homepage] Build hero section with CTAs`
- `[Database] Create blog_posts table with RLS`
- `[Styles] Extend Tailwind with brand colors`

### Branching (If Applicable)

- `main` - Production-ready code
- `develop` - Integration branch
- Feature branches for specific additions

## Maintenance and Updates

### Regular Reviews

- Review DesignStrategy.md before starting new work
- Check for outdated dependencies monthly
- Audit accessibility quarterly
- Review performance metrics regularly
- Update documentation when patterns change

### Technical Debt

- Document technical debt as you encounter it
- Propose solutions with estimated effort
- Prioritize accessibility and security issues
- Balance new features with code health

---

**Remember:** The goal is not to build the most technically impressive website. The goal is to build a calm, trustworthy space that helps people reclaim their health through real food and holistic nutrition. Every decision should serve that mission.

---

**Last Updated:** January 2026
**Document Owner:** Nourished Rebel Development Team
