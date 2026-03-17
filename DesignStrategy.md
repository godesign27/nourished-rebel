# Nourished Rebel Design Strategy

## Purpose

This document serves as the single source of truth for the Nourished Rebel website. It governs tone, UX decisions, layout patterns, visual design, and future scalability. All design and development decisions must align with the principles outlined here.

## Brand Mission

Empower people to reclaim their health through real food, holistic nutrition, and self-trust.

Nourished Rebel exists to guide individuals away from diet culture, medical confusion, and restrictive eating toward a sustainable, intuitive relationship with food and their bodies. We believe in evidence-informed nutrition that honors individual needs and experiences.

**Core Beliefs:**
- No diets, no extremes, no medicalized language
- Real food as the foundation of health
- Gut health as central to overall wellness
- Personalized approaches over one-size-fits-all solutions
- Self-trust and body wisdom over external rules

## Brand Personality

**Calm, Grounded, Supportive**
- We provide a peaceful refuge from the chaos of conflicting nutrition advice
- Our presence is steady and reassuring, never frantic or urgent
- We hold space for individual journeys without judgment

**Evidence-Informed but Intuitive**
- We respect both scientific research and lived experience
- We present information clearly without overwhelming technical jargon
- We trust that people can make good decisions when given the right tools

**Warm and Human, Never Preachy or Sales-Heavy**
- We speak as a trusted friend, not an authority figure
- We share authentically from personal experience
- We never use fear, shame, or pressure tactics
- We present options without pushing or creating false urgency

## UX Principles

### 1. Reduce Decision Fatigue
- Clear navigation with logical grouping
- Limited choices at key decision points
- Progressive disclosure of information
- Guided pathways rather than overwhelming options

### 2. Guide Users Gently Toward Clarity
- Natural flow from awareness to understanding to action
- Contextual help and explanations when needed
- Clear next steps at the end of each section
- Breadcrumb trails for longer journeys

### 3. Trust-Building Over Urgency
- No countdown timers or artificial scarcity
- Transparent pricing and program details
- Authentic testimonials and case studies
- Clear privacy and communication expectations

### 4. Accessibility and Readability Are Mandatory
- WCAG AA compliance minimum
- Clear color contrast ratios
- Keyboard navigation support
- Screen reader compatibility
- Simple, readable language (8th grade reading level)
- Generous text sizing and line height

## Visual Design Principles

### Brand Color System

This is the source of truth for all color usage across the Nourished Rebel website. The PRIMARY brand color (#675C53) is the anchor and must be used consistently for CTAs, major headings, and active states.

**Primary (Anchor Color):**
- #675C53 — Primary brand color (CTAs, H1/H2, active states, primary buttons)
  - Use: Primary actions, hero headlines, navigation active states
  - AAA compliant with #EFE9E3 text
  - This is the dominant brand color and should be the most visible color in the UI

**Supporting Colors:**
- #EFE9E3 — Primary background (light cream)
  - Use: Main page background, cards on dark backgrounds
- #D6CFC4 — Secondary background / cards / dividers
  - Use: Alternating sections, card backgrounds, subtle separators
- #A6B640 — Muted accent (sparingly for tags, subtle highlights)
  - Use: Tags, badges, small accent elements (use sparingly)
- #C6866A — Secondary accent (icons, secondary buttons)
  - Use: Icon tints, secondary CTAs, decorative elements
- #C78553 — Deep accent (badges, emphasis, illustrations)
  - Use: Important badges, emphasis blocks, illustration accents

**Text Colors:**
- #3F3A36 — Primary text (derived dark neutral)
  - Use: Body copy, paragraphs, all main text content
- #675C53 — Headings (same as primary brand color)
  - Use: H1, H2 headlines for brand consistency
- #EFE9E3 — Inverse text
  - Use: Text on dark backgrounds, text on primary color buttons

**DO:**
- Use #675C53 as the primary color for all CTAs and major headings
- Alternate backgrounds between #EFE9E3 and #D6CFC4 for visual rhythm
- Maintain AAA contrast ratios for accessibility
- Use supporting colors sparingly to let the primary color dominate
- Keep the overall palette warm, grounded, and cohesive

**DO NOT:**
- Use pure black (#000000) anywhere in the design
- Overuse the accent colors (#A6B640, #C6866A, #C78553) - they should accent, not dominate
- Use purple, indigo, or violet hues unless explicitly requested
- Mix this palette with colors outside the system

### Typography

**Font Families:**
- Primary: System font stack (SF Pro, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)
- Accent: For special headings if needed, but prefer consistency

**Font Scale:**
- Display: 3.5rem / 56px (hero headlines only)
- H1: 2.5rem / 40px
- H2: 2rem / 32px
- H3: 1.5rem / 24px
- H4: 1.25rem / 20px
- Body Large: 1.125rem / 18px
- Body: 1rem / 16px
- Body Small: 0.875rem / 14px
- Caption: 0.75rem / 12px

**Line Heights:**
- Headings: 120% (1.2)
- Body text: 150% (1.5)
- Large text blocks: 165% (1.65)

**Font Weights:**
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700 (use sparingly)

### Layout Patterns

**Card-Based Layouts**
- Use subtle shadows (0 1px 3px rgba(0,0,0,0.1))
- Rounded corners (8px standard, 12px for larger cards)
- Generous internal padding (24px minimum)
- Hover states with subtle lift effect

**Section Spacing**
- Large section gaps: 96px (desktop) / 64px (mobile)
- Medium section gaps: 64px (desktop) / 48px (mobile)
- Small section gaps: 48px (desktop) / 32px (mobile)

**Grid Systems**
- Desktop: 12-column grid with 24px gutters
- Tablet: 8-column grid with 20px gutters
- Mobile: 4-column grid with 16px gutters

**Container Widths**
- Max width: 1200px for main content
- Narrow width: 800px for long-form text
- Wide width: 1400px for full-width sections with edge breathing room

### Spacing System

Based on 8px grid:
- 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px, 128px

### Interaction Design

**Button Styles**
- Primary: Filled background, high contrast
- Secondary: Outlined with border, transparent background
- Text link: No border, underline on hover

**Hover States**
- Buttons: Subtle darkening (8-10%)
- Cards: Lift with shadow (transform: translateY(-2px))
- Links: Underline or color shift

**Transitions**
- Fast: 150ms (small UI elements)
- Medium: 250ms (buttons, cards)
- Slow: 400ms (page transitions, large movements)
- Easing: ease-in-out for most, ease-out for entrances

## Content Guardrails

### Language We Avoid

**No Diagnostic or Medical Claims**
- ❌ "Cure your gut issues"
- ❌ "Treat SIBO naturally"
- ❌ "Diagnose food sensitivities"
- ✅ "Support digestive health"
- ✅ "Identify foods that work for you"
- ✅ "Understand your body's signals"

**No Fear-Based Messaging**
- ❌ "Toxic foods destroying your gut"
- ❌ "The hidden dangers in your diet"
- ❌ "Before it's too late"
- ✅ "Foods that may not serve you"
- ✅ "Gentle alternatives to explore"
- ✅ "When you're ready"

**No Diet Culture Framing**
- ❌ "Lose weight fast"
- ❌ "Detox your body"
- ❌ "Good foods vs. bad foods"
- ✅ "Find your sustainable eating pattern"
- ✅ "Nourish your body"
- ✅ "Foods that support your goals"

**No Aggressive Marketing Language**
- ❌ "Limited time offer - Act now!"
- ❌ "Only 3 spots left!"
- ❌ "You can't afford to miss this"
- ✅ "Ready to get started?"
- ✅ "Let's explore together"
- ✅ "Take the next step when you're ready"

### Voice and Tone Guidelines

**Active Voice, Second Person**
- "You'll discover" not "One will discover"
- "Let's explore" not "It can be explored"

**Clear and Concise**
- Short sentences and paragraphs
- One idea per sentence when possible
- Break up long text with subheadings and lists

**Inclusive and Non-Judgmental**
- Acknowledge different starting points
- Avoid assumptions about past experiences
- Celebrate progress of any size

**Honest and Transparent**
- Set realistic expectations
- Acknowledge when something is hard
- Don't promise overnight transformations

## Future Scalability

This design system is built to accommodate:

**Phase 2: Interactive Features**
- Health assessment quizzes
- Personalized recommendations
- Progress tracking tools
- Recipe databases with filtering

**Phase 3: Program Management**
- Course dashboards
- Lesson navigation
- Progress tracking
- Community features

**Phase 4: Membership & Commerce**
- User accounts and profiles
- Payment processing
- Membership tiers
- Resource libraries
- Email sequences

All future features must maintain:
- The calm, supportive brand personality
- Clear information hierarchy
- Accessibility standards
- Mobile-first responsiveness
- Trust-building over urgency

---

**Last Updated:** January 2026
**Document Owner:** Nourished Rebel Design Team
