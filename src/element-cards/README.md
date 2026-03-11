# Object cards

Re-export of design system object cards for reuse across projects.

## Components

- **CourseObjectCard** – course/learning card
- **PeopleObjectCard** – person card
- **ProjectObjectCard** – project card

The DS also exports **MentorInsightCard** (different from the old MentorObjectCard); import that directly from `@tonyh-2-eightfold/ef-design-system` if needed.

## Use in another project

1. Copy the `element-cards` folder into your app (e.g. `src/element-cards/`).
2. Install the design system:
   ```bash
   npm i @tonyh-2-eightfold/ef-design-system
   ```
3. Import where needed:
   ```tsx
   import { CourseObjectCard, PeopleObjectCard, ProjectObjectCard } from './element-cards'
   ```

The cards expect React Router’s `Link` (or a compatible component) when used with `LinkComponent={Link}` for client-side navigation.
