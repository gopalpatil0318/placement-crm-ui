# Placement CRM UI — Copilot Instructions & Development Standards

> This file is automatically loaded by GitHub Copilot in every session. Every feature
> implemented in this project MUST follow these standards without exception.
> Launching 2027 — nationwide India college deployment. Quality is non-negotiable.

---

## 1. Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 19 + TypeScript 5.9 (`erasableSyntaxOnly: true`) |
| Build Tool | Vite 7 with `@vitejs/plugin-react-swc` |
| Styling | Tailwind CSS 4 (oklch color space, `dark:` variant for dark mode) |
| Icons | Lucide React ONLY — no other icon libraries |
| Routing | React Router v7 |
| HTTP | Axios via `src/lib/api.ts` (NEVER import axios directly in hooks/components) |
| Server State | TanStack React Query 5 via `src/lib/queryClient.ts` + `src/lib/queryKeys.ts` |
| Animations | Framer Motion 12 via `src/lib/animations.ts` (GPU-only: opacity + transform) |
| Validation | Zod 4 (client-side) |
| Toasts | `showToast` from `src/utils/ToastUtils.ts` |
| Theme | `next-themes` (`ThemeProvider` in `main.tsx`, attribute="class") |
| Auth | Cookie-based (`withCredentials: true`), 3 contexts: SysAdmin / CollegeAdmin / Student |

---

## 2. Folder Structure (MANDATORY)

```
src/
├── lib/
│   ├── api.ts                      # Axios instance + ApiError class
│   ├── animations.ts               # Framer Motion variants (fadeIn, stagger, page, modal, tab)
│   ├── queryClient.ts              # React Query client (staleTime 2min, gcTime 10min)
│   └── queryKeys.ts                # Hierarchical query key factory for all domains
├── validators/
│   └── <Domain>Schema.ts           # Zod schemas, one file per domain
├── services/
│   └── collegeadmin/
│       └── collegeadmin.services.ts # ALL collegeadmin API calls in ONE file
├── hooks/
│   └── collegeadmin/
│       └── <module>/               # e.g., company_management/
│           ├── useCreate<Module>.tsx
│           ├── useUpdate<Module>.tsx
│           ├── useView<Module>s.tsx  # list
│           └── useView<Module>.tsx   # single detail
├── components/
│   ├── ui/                         # Shared UI primitives (ALWAYS use these)
│   │   ├── AnimatedPage.tsx        # Page enter/exit transitions
│   │   ├── AnimatedTabContent.tsx  # Direction-aware tab slide
│   │   ├── AnimatedList.tsx        # AnimatedTableBody, AnimatedRow, AnimatedGrid, AnimatedGridItem
│   │   ├── ModalWrapper.tsx        # Spring modal + focus trap + Escape + scroll lock
│   │   ├── FloatingInput.tsx       # Titled input (label above) with animated error
│   │   ├── FloatingTextarea.tsx    # Titled textarea (label above) + char counter
│   │   ├── FloatingSelect.tsx      # Titled select (label above) with animated chevron
│   │   ├── PageLoadingSkeleton.tsx # Full-page skeleton matching DashboardLayout
│   │   └── ErrorBoundary.tsx       # Render crash recovery with retry
│   └── collegeadmin/
│       ├── CollegeAdminLayout.tsx   # Layout route: DashboardLayout + <Outlet />
│       ├── DashboardLayout.tsx     # Sidebar + Header + content area
│       └── <module>/
│           ├── <Module>Form.tsx     # SHARED create + edit form
│           ├── Create<Module>Form.tsx  # thin wrapper
│           └── Update<Module>Form.tsx  # skeleton/error/form states
└── pages/
    └── collegeadmin/
        └── <module>/
            ├── View<Module>s.tsx    # list page (NO DashboardLayout — layout route provides it)
            ├── <Module>Detail.tsx   # detail/profile page
            ├── Create<Module>.tsx   # thin page wrapper
            └── Update<Module>.tsx   # dynamic breadcrumb pattern
```

**Data flow:** `services` → `hooks` → `components` → `pages`  
Each layer knows nothing about the layer above it.

---

## 3. TypeScript Rules (CRITICAL — `erasableSyntaxOnly: true`)

### ❌ FORBIDDEN — class parameter properties
```ts
// WILL NOT COMPILE
class ApiError {
  constructor(private message: string, readonly status?: number) {}
}
```

### ✅ REQUIRED — explicit field declarations
```ts
class ApiError extends Error {
  readonly status?: number;           // explicit field

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;             // explicit assignment
  }
}
```

### Other TypeScript rules
- Use `import { type X }` for type-only imports
- Prefer `interface` for component props, `type` for unions/mapped types
- Never use `as` casting on API responses — type the response shape at the service level
- Never use `any` — use `unknown` in catch blocks

---

## 4. API Error Handling (MANDATORY in ALL hooks)

```ts
import { ApiError } from "@/lib/api";

// ✅ CORRECT pattern — always in catch blocks
} catch (error: unknown) {
  const message = error instanceof ApiError ? error.message : "Something went wrong";
  const status  = error instanceof ApiError ? error.status  : undefined;

  if (status === 409) { setErrors({ fieldName: message }); }
  if (status === 404) { /* handle not found */ }
  if (status === 400) { /* handle bad request */ }

  showToast({ type: "error", title: "Error", description: message });
}
```

### ❌ NEVER use these patterns
```ts
import type { AxiosError } from "axios";           // ❌ AxiosError direct usage
catch (e) { const err = e as AxiosError; ... }     // ❌ casting
catch (e) { const msg = (e as any).message; ... }  // ❌ any casting
err instanceof Error                               // ❌ loses status code
```

---

## 5. Zod Validation Pattern (MANDATORY in every handleSubmit)

```ts
const result = schema.safeParse(formData);
if (!result.success) {
  const fieldErrors: FormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof FormType;
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  setErrors(fieldErrors);
  showToast({
    type: "warning",
    title: "Validation Failed",
    description: result.error.issues[0].message,
  });
  return;
}
setErrors({});
```

**Schema conventions:**
- Required string fields: `.min(2).max(N)`
- Optional URL fields: custom `.refine(val => val === "" || /^https?:\/\/.+/i.test(val))`
- Optional text fields: `.max(N).optional().or(z.literal(""))`

---

## 6. Input Trimming (MANDATORY)

All user-entered name/title fields MUST be `.trim()`-ed before building the API payload:

```ts
// ✅ Always trim names
company_name:    formData.companyName.trim(),
job_title:       formData.jobTitle.trim(),
contact_name:    formData.contactName.trim(),
```

This prevents:
- Leading/trailing whitespace passing `min(2)` check with spaces
- Duplicate 409 errors caused by `" TCS"` vs `"TCS"`
- Database inconsistencies

---

## 7. React Hook Patterns

### Stable `handleChange` — ALWAYS `[]` dependency array
```ts
const handleChange = useCallback(
  (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error INSIDE setErrors updater — never reference errors in deps
    setErrors(prev => {
      if (!prev[name as keyof T]) return prev;
      return { ...prev, [name]: undefined };
    });
  },
  []   // ← STABLE — never add errors to deps
);
```

### Diff-based Update (MANDATORY for all edit forms)
Store original fetched data in a `useRef`. Only send changed fields to the API:

```ts
const originalData = useRef<FormType | null>(null);
// After fetch: originalData.current = { ...loaded };

// In handleSubmit, before API call:
const payload: Record<string, unknown> = {};
if (!orig || formData.name.trim() !== orig.name.trim())
  payload.name = formData.name.trim();
// ... repeat for each field

if (Object.keys(payload).length === 0) {
  showToast({ type: "warning", title: "No Changes", description: "Nothing has been changed." });
  return;
}
```

Why: Sending unchanged fields causes false 409 (duplicate name vs itself) and unnecessary DB writes.

### Separate display state from editable form state
When showing "Editing: {CompanyName}" in the header, the company name displayed must NOT
change as the user types in the form field. Use two separate states:

```ts
const [formData, setFormData] = useState({ name: "" });        // editable
const [fetchedName, setFetchedName] = useState("");             // display only
```

### Debounced Search (300ms) — React Query pattern
Debounce updates `debouncedSearch` state — React Query auto-refetches when queryKey changes.
No manual `fetchItems` call needed.

```ts
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");
const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleSearchChange = useCallback((value: string) => {
  setSearch(value);
  if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
  searchTimerRef.current = setTimeout(() => {
    setDebouncedSearch(value);
    setPage(1);  // reset to page 1 on new search
  }, 300);
}, []);

// debouncedSearch is included in queryFilters → queryKey changes → auto-refetch
const queryFilters = { search: debouncedSearch || undefined, ...otherFilters };
```

---

## 8. Component Architecture

### Layout Route Architecture (CRITICAL)
DashboardLayout (sidebar + header) is provided ONCE via a **layout route** in `App.tsx`.
Individual page components NEVER import or wrap themselves in `<DashboardLayout>`.
This ensures the sidebar/header stay mounted across navigations — no remount, no re-animation,
no "page reload" feeling.

```
App.tsx routing structure:
├── /college/login           → PublicRoute (no layout)
├── /college/forgot-password  → PublicRoute (no layout)
└── <Route element={<ProtectedRoute><CollegeAdminLayout /></ProtectedRoute>}>
    ├── /college/dashboard    → <CollegeDashboard />
    ├── /college/companies    → <ViewCompanies />
    ├── /college/company/:id  → <CompanyDetail />
    └── ... all other /college/* routes
```

`CollegeAdminLayout.tsx` = `<DashboardLayout><Outlet /></DashboardLayout>`

**Key rule:** Pages render ONLY their content (wrapped in `<AnimatedPage>`).
The layout is inherited from the parent route. NEVER import `DashboardLayout` in pages.

### Pages are THIN — content only, no layout wrapper
```tsx
const BREADCRUMBS = [
  { label: "Dashboard", path: "/college/dashboard" },
  { label: "Module",    path: "/college/module" },
  { label: "Action",    active: true },
];

const CreateModule = () => (
  <AnimatedPage>
    <div className="space-y-6">
      <PageHeader title="Register New Module" breadcrumbs={BREADCRUMBS} />
      <CreateModuleForm />
    </div>
  </AnimatedPage>
);
```

Dynamic breadcrumbs (edit pages) via `useMemo` + `useCallback`:
```tsx
const UpdateModule = () => {
  const [entityName, setEntityName] = useState("");
  const breadcrumbs = useMemo(() => [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: entityName || "Edit Module", active: true },
  ], [entityName]);

  const handleLoaded = useCallback((name: string) => setEntityName(name), []);
  return (
    <AnimatedPage>
      <div className="space-y-6">
        <PageHeader title="Edit Module" breadcrumbs={breadcrumbs} />
        <UpdateModuleForm onItemLoaded={handleLoaded} />
      </div>
    </AnimatedPage>
  );
};
```

### Shared Form Component
One `<ModuleForm mode="create" | "edit" />` component handles both create and edit.
Props must include the hook's return values: `formData`, `errors`, `loading`,
`handleChange`, `handleSubmit`, `handleCancel`.
Edit mode additionally receives `fetchedName` for the header display.

### Sub-component icons — references not instances
```ts
// ❌ WRONG — pre-creates JSX, breaks when used in arrays
const TAB_ICONS = { overview: <FileText className="h-4 w-4" /> };

// ✅ CORRECT — component reference, Lucide icon rendered lazily
const TAB_ICONS: Record<TabKey, React.ComponentType<{ className?: string }>> = {
  overview: FileText,
  contacts: Users,
};
// Usage: const Icon = TAB_ICONS[tab.key]; return <Icon className="h-4 w-4" />;
```

### Conditional tab rendering (don't mount all tabs)
```tsx
// ❌ WRONG — all 3 tabs mount simultaneously
const content = { overview: <Overview />, contacts: <Contacts /> };
return <div>{content[activeTab]}</div>;

// ✅ CORRECT — only active tab mounts
{activeTab === "overview"  && <OverviewTab  data={data} />}
{activeTab === "contacts"  && <ContactsTab  contacts={data.contacts} />}
{activeTab === "jobs"      && <JobsTab      count={data.jobs_count} />}
```

---

## 9. UI/UX Standards (2026/2027 — Generation Z College Users)

### Loading States — ALWAYS skeleton, NEVER spinner for page content
Skeleton must mirror the real layout:
- Table rows → skeleton rows with same column widths
- Detail hero → skeleton matching avatar + title + buttons
- Stats cards → skeleton cards matching dimensions
- Form → skeleton inputs matching grid layout

Inline submit button loading: show `animate-spin` on the button itself, disable it.

### Empty States — contextual and actionable
Two variants always required:

```
┌─────────────────────────────────────────┐
│     [Large domain icon in soft circle]  │
│ "No companies yet"                      │
│ "Get started by registering your first  │
│  company..."                            │
│         [Primary CTA Button]            │
└─────────────────────────────────────────┘
```
```
┌─────────────────────────────────────────┐
│     [Search/filter icon]                │
│ "No results match your filters"         │
│ "Try adjusting your search or filters"  │
│  (no CTA — user needs to change filters)│
└─────────────────────────────────────────┘
```

### Confirmation Modals — consequences, not "are you sure?"
Every destructive/impactful action gets a modal (never `window.confirm`):

```
Modal structure:
├── Header: icon + title + close button
├── Body:
│   ├── "Are you sure you want to {action} {entityName}?"
│   └── Consequence box (amber for deactivate, emerald for activate):
│       ├── "This action will:"
│       ├── • bullet 1
│       ├── • bullet 2
│       └── • You can reverse this at any time
└── Footer: Cancel | Confirm (colored by severity)
```

Close button and Cancel are disabled during in-progress state.
Confirm button shows `Loader2 animate-spin` while processing.

### Status Badges — consistent across ALL modules

```tsx
// Active — emerald
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
  Active
</span>

// Inactive — red
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
  Inactive
</span>

// Pending — amber
<span className="... bg-amber-50 text-amber-700">
  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
  Pending
</span>
```

### Avatar Fallbacks — always `useState`, never DOM hacks
```tsx
const Avatar = ({ src, name }: { src: string | null; name: string }) => {
  const [imgError, setImgError] = useState(false);
  if (src && !imgError)
    return <img src={src} alt={name} onError={() => setImgError(true)} className="..." />;
  return (
    <div className={`initials-color-class`}>
      {getInitials(name)}
    </div>
  );
};
```
Use `charCodeAt(0) % COLORS.length` for deterministic color assignment.

### Table Design
- No Actions column in list tables — entire row is clickable
- Row hover: `group hover:bg-blue-50/40 transition-colors cursor-pointer`
- Company/entity name in row: `group-hover:text-blue-600 transition`
- Columns: #, Entity (avatar + name + subtitle), Status badge, counts, date
- `overflow-x-auto` wrapper for mobile

### Pagination
- Numbered pages with ellipsis, not just Prev/Next
- Show "Showing 1–20 of 47 results" text
- Page size selector: [10, 20, 50]
- Reset to page 1 on any filter/sort change

### Deadline / Time-Remaining Display (MANDATORY for all deadline cards)
Always show granular time remaining — not just "3d" or "Expired". Include hours and minutes.
When expired, show how long ago it expired.

```ts
// Compute days + hours + minutes
const diffMs = deadlineDate.getTime() - now.getTime();
const absDiffMs = Math.abs(diffMs);
const expired = diffMs < 0;
const days  = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
const hours = Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
const mins  = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));

// Display:
// Active:  "5d 12h" with sublabel "5d 12h left"     (green, or amber if < 3 days)
// Expired: "Expired" with sublabel "Expired 2d 5h ago" (red)
// < 1 day: "2h 30m" with sublabel "2h 30m left"     (amber)
```

Color thresholds:
- Expired → red (`text-red-700 dark:text-red-400`, `bg-red-50 dark:bg-red-900/20`)
- < 3 days → amber (`text-amber-700 dark:text-amber-400`, `bg-amber-50 dark:bg-amber-900/20`)
- ≥ 3 days → emerald (`text-emerald-700 dark:text-emerald-400`, `bg-emerald-50 dark:bg-emerald-900/20`)

Reference: `JobDetailView.tsx` `formatDeadlineRemaining()` and `StatsRow` component.

### Color Palette (Consistent across ALL modules)
| Purpose | Color |
|---------|-------|
| Primary action (buttons, active tab underline) | `blue-600` |
| Active / success | `emerald-600` |
| Danger / deactivate | `red-600` |
| Warning / pending | `amber-600` |
| Category / industry tags | `purple-600` |
| Neutral counts | `gray-600` |
| Page section icons | `blue-600` on `blue-50` background |
| Stats: contacts | `cyan-600` |
| Stats: jobs | `orange-600` |

### Spacing & Layout
- Page level: `space-y-6` between PageHeader and content card
- Card sections: `border-b border-gray-100` separators
- Form sections: `space-y-8` between sections, `gap-5` in grids
- Tab content padding: `p-6`

### Navigation Flow (MANDATORY)
```
List Page
  └─→ click row (whole row) → Detail/Profile Page
        ├─→ Edit button → Edit Page → save → Detail Page
        ├─→ Deactivate/Activate → confirmation modal → reload
        └─→ breadcrumb → List Page
```

- Detail page: hero header with avatar, name, status badge, industry/category tag, action buttons
- Tabs on detail page: Overview | Contacts | Jobs (or domain equivalents)
- Edit page: "Edit {EntityName}" in page title, entity name in breadcrumb after fetch

### 2026/2027 UX Principles for Next-Gen College Users
1. **Zero Loading Jank** — skeleton placeholders match real content layout pixel for pixel
2. **Instant Visual Feedback** — button disables + spinner starts BEFORE async call resolves
3. **Soft Destructive Confirmation** — explain what will and won't be affected + reversibility
4. **Progressive Disclosure** — tabs on detail pages, not one long scrolling page
5. **Search-First** — debounced search (300ms) always at top of filter bars
6. **Smart Sort** — sort by field with direction toggle, visual arrow indicator
7. **Clickable Rows** — entire card/row is the navigation target, not a separate View button
8. **Breadcrumb Truth** — breadcrumb always shows the real entity name, not a placeholder
9. **Context-Aware Empty States** — different message when there's no data vs. no matching filters
10. **Error Recovery** — error states always include a back/retry action, never dead ends
11. **Form Resilience** — 409 highlights the exact duplicate field, 422 highlights each bad field
12. **Mobile First** — `flex-col` on mobile → `flex-row` on `lg`, table wrapped in `overflow-x-auto`
13. **Accessibility** — all `<button>` have `type="button"` (prevent accidental form submit),
    icon-only buttons have `aria-label`, images have `alt` text
14. **Micro-interactions** — `transition` / `transition-colors` on every interactive element,
    `hover` and `focus` states never omitted

---

## 10. Toast Usage

```ts
import { showToast } from "@/utils/ToastUtils";

showToast({ type: "success", title: "Success",           description: response?.message || "Created successfully" });
showToast({ type: "error",   title: "Error",             description: message });
showToast({ type: "warning", title: "Validation Failed", description: result.error.issues[0].message });
showToast({ type: "warning", title: "No Changes",        description: "Nothing has been changed." });
```

---

## 11. Service Layer Rules

- ALL `api.get/post/put/patch/delete` calls live in `src/services/collegeadmin/collegeadmin.services.ts`
- Hooks call `CollegeAdminService.methodName(...)` — never call `api` directly
- Services return `response.data` (unwrapped from Axios)
- Services do NOT contain business logic, error handling, or state management
- URL construction for query strings: use `URLSearchParams`, skip falsy params

```ts
getAllItems: async (params = {}) => {
  const query = new URLSearchParams();
  if (params.status)   query.append("status",   params.status);
  if (params.search)   query.append("search",   params.search);
  if (params.page)     query.append("page",     String(params.page));
  const url = query.toString()
    ? `/college/get_all_items?${query}`
    : "/college/get_all_items";
  return (await api.get(url)).data;
},
```

---

## 12. React Query Patterns (MANDATORY for all data fetching)

### Query Keys — always use `queryKeys` factory from `src/lib/queryKeys.ts`
```ts
import { queryKeys } from "@/lib/queryKeys";

// List with filters — keys auto-include filter params for cache granularity
useQuery({
  queryKey: queryKeys.companies.all({ page, limit, search, status }),
  queryFn: () => CollegeAdminService.getAllCompanies({ page, limit, search, status }),
});

// Single detail
useQuery({
  queryKey: queryKeys.companies.detail(companyId),
  queryFn: () => CollegeAdminService.getCompanyById(companyId),
  enabled: !!companyId,
});
```

### Mutations with cache invalidation
```ts
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (payload: CreateCompanyPayload) =>
    CollegeAdminService.createCompany(payload),
  onSuccess: (response) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.companies.all() });
    showToast({ type: "success", title: "Success", description: response?.message || "Created successfully" });
    navigate("/college/companies");
  },
  onError: (error: unknown) => {
    const message = error instanceof ApiError ? error.message : "Something went wrong";
    const status  = error instanceof ApiError ? error.status  : undefined;
    if (status === 409) setErrors({ fieldName: message });
    showToast({ type: "error", title: "Error", description: message });
  },
});
```

### Rules
- NEVER call `useQuery`/`useMutation` outside hooks or at the top level of a component conditionally
- ALWAYS use `enabled` option when query depends on dynamic params (e.g., `enabled: !!id`)
- NEVER manually set query data — use `invalidateQueries` to refetch
- Query client config: `staleTime: 2min`, `gcTime: 10min`, `retry: 1` (already set globally)
- Use `queryKeys` factory so invalidation cascades correctly (e.g., `queryKeys.companies.all()` invalidates all company lists regardless of filter params)

### Pagination — always use `keepPreviousData`
List hooks with pagination MUST use `placeholderData: keepPreviousData` from React Query.
This prevents skeleton flicker when users change pages — old data stays visible until new data arrives.

```ts
import { useQuery, keepPreviousData } from "@tanstack/react-query";

const { data, isLoading, isFetching } = useQuery({
  queryKey: queryKeys.companies.all(queryFilters),
  queryFn: () => CollegeAdminService.getAllCompanies(queryFilters),
  placeholderData: keepPreviousData,  // ← smooth pagination, no skeleton flash
});
```

- `isLoading` = true only on first load (no data yet)
- `isFetching` = true on every background refetch (use for subtle loading indicators)
- Use `isLoading` for skeleton, NOT `isFetching`

### Cache invalidation — ALWAYS targeted, NEVER broad
After mutations, invalidate ONLY the specific caches affected. Never use broad root keys.

```ts
// ✅ CORRECT — targeted invalidation
queryClient.invalidateQueries({ queryKey: queryKeys.companies.contacts(companyId) });
queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(companyId) });

// ❌ WRONG — too broad, invalidates unrelated company queries
queryClient.invalidateQueries({ queryKey: ["companies"] });
```

Mutation hooks that affect related parent data must invalidate both:
- The direct collection (e.g., contacts list for that company)
- The parent detail (e.g., company detail, which shows contacts_count)

### Tab data — dedicated hooks, not manual state
Tab content that fetches its own data (e.g., CompanyJobsTab, ContactsTab inside CompanyDetail)
MUST use a dedicated `useView<X>` hook with `useQuery` — never manual `useState` + `useEffect` + `fetchData`.

```ts
// ✅ CORRECT — dedicated hook with React Query (cached, deduped, no race conditions)
const { jobs, loading, pagination } = useViewCompanyJobs(companyId);

// ❌ WRONG — manual state management in component (no caching, race conditions, mountedRef needed)
const [jobs, setJobs] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => { fetchJobs().then(setJobs); }, []);
```

Benefits: automatic caching (switching tabs doesn't refetch), request deduplication,
no cleanup refs needed, `keepPreviousData` for smooth pagination within tabs.

---

## 13. Framer Motion & Animation (MANDATORY)

### Central animation library: `src/lib/animations.ts`
All animation variants MUST be imported from this file — never define inline variants.
All animations use ONLY `opacity` and `transform` (GPU-accelerated, no layout shifts).

```ts
import { fadeInUp, staggerContainer, staggerItem, pageVariants, smoothTransition } from "@/lib/animations";
```

Available exports:
- `fadeIn`, `fadeInUp`, `fadeInDown`, `scaleIn` — basic enter animations
- `staggerContainer` + `staggerItem` — list/grid stagger (0.03s per item)
- `pageVariants` — route-level enter/exit
- `modalVariants` + `backdropVariants` — modal spring + backdrop fade
- `tabContentVariants` — direction-aware tab slide (used with `custom` prop)
- `springTransition`, `smoothTransition`, `gentleTransition` — reusable durations

### `useReducedMotion()` — ALWAYS respect
Every component using Framer Motion MUST check `useReducedMotion()` from `framer-motion`.
When reduced motion is preferred, render plain `<div>` instead of `motion.div`.

```ts
import { useReducedMotion } from "framer-motion";
const shouldReduce = useReducedMotion();
// Use shouldReduce to disable animations or fall back to plain elements
```

### Shared UI wrappers (use INSTEAD of raw motion.div)

#### AnimatedPage — wrap every page's content
```tsx
import AnimatedPage from "@/components/ui/AnimatedPage";

// Pages do NOT wrap in DashboardLayout — layout route provides it
const ViewCompanies = () => (
  <AnimatedPage>
    <div className="space-y-6">
      <PageHeader ... />
      <CompanyListContent />
    </div>
  </AnimatedPage>
);
```

#### AnimatedTabContent — direction-aware tab transitions
```tsx
import AnimatedTabContent from "@/components/ui/AnimatedTabContent";

const TAB_KEYS = ["overview", "contacts", "jobs"] as const;

<AnimatedTabContent activeTab={activeTab} tabKeys={[...TAB_KEYS]}>
  {activeTab === "overview"  && <OverviewTab data={data} />}
  {activeTab === "contacts"  && <ContactsTab contacts={data.contacts} />}
  {activeTab === "jobs"      && <JobsTab count={data.jobs_count} />}
</AnimatedTabContent>
```

#### Tab Navigation — LayoutGroup + motion.span underline (MANDATORY)
ALL tabbed detail pages MUST use animated tab indicator matching CompanyDetail.tsx:

```tsx
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";

const shouldReduce = useReducedMotion();

<div className="px-6 border-b border-gray-100 dark:border-gray-800">
  <LayoutGroup>
    <nav className="flex gap-1 -mb-px" aria-label="Tabs">
      {TABS.map((tab) => {
        const isSelected = activeTab === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              isSelected
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
            {isSelected && (
              shouldReduce ? (
                <span className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              ) : (
                <motion.span
                  layoutId="tab-indicator"   // unique per LayoutGroup
                  className="absolute bottom-0 inset-x-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )
            )}
          </button>
        );
      })}
    </nav>
  </LayoutGroup>
</div>
```

Key rules:
- `LayoutGroup` wraps the tab nav — enables shared layout animations
- `motion.span` with `layoutId` — underline slides between tabs with spring animation
- `border-b-2` on individual buttons is WRONG — use `motion.span` absolute positioned at bottom
- `useReducedMotion()` fallback — plain `<span>` when user prefers reduced motion
- `AnimatedTabContent` wraps tab content for direction-aware slide (left→right or right→left)
- Each page's layoutId must be unique if multiple LayoutGroups exist (e.g., `"job-tab-indicator"`)
- Reference: `CompanyDetail.tsx` (gold standard), `JobDetailView.tsx`

#### ModalWrapper — ALL modals MUST use this
```tsx
import ModalWrapper from "@/components/ui/ModalWrapper";

<ModalWrapper
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  disabled={isProcessing}
  title="Deactivate Company"
  titleIcon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
  size="md"  // sm | md | lg | xl | 2xl
>
  {/* Modal body content */}
</ModalWrapper>
```
Features: focus trap, Escape key close (disabled while processing), body scroll lock,
AnimatePresence mount/unmount, spring scale animation, backdrop-blur-sm.

#### AnimatedTableBody + AnimatedRow — list page tables
```tsx
import { AnimatedTableBody, AnimatedRow } from "@/components/ui/AnimatedList";

<AnimatedTableBody>
  {items.map((item) => (
    <AnimatedRow key={item.id}>
      <td>...</td>
    </AnimatedRow>
  ))}
</AnimatedTableBody>
```

#### AnimatedGrid + AnimatedGridItem — card grids
```tsx
import { AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedList";

<AnimatedGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map((item, index) => (
    <AnimatedGridItem key={item.id} index={index}>
      <Card item={item} />
    </AnimatedGridItem>
  ))}
</AnimatedGrid>
```

---

## 14. Form Inputs — Titled Input Primitives (MANDATORY for all forms)

All form inputs use a **title-above-input** pattern: a `<label>` above the field (not floating
inside). Label color transitions: gray → blue on focus → red on error. Inputs use `rounded-xl`,
`bg-white dark:bg-gray-800`, `hover:border-gray-300`, `focus:border-blue-500 focus:ring-2`.

### FloatingInput — use for ALL text/email/tel/url inputs
```tsx
import FloatingInput from "@/components/ui/FloatingInput";

<FloatingInput
  label="Company Name"
  name="companyName"
  value={formData.companyName}
  onChange={handleChange}
  error={errors.companyName}
  placeholder="Enter company name"   // optional — defaults to label text
  required
/>
```

### FloatingTextarea — use for ALL multi-line inputs
```tsx
import FloatingTextarea from "@/components/ui/FloatingTextarea";

<FloatingTextarea
  label="Description"
  name="description"
  value={formData.description}
  onChange={handleChange}
  error={errors.description}
  placeholder="Add a brief description"   // optional — defaults to label text
  maxLength={500}
  rows={4}
/>
```
Includes animated character counter that changes color: gray → amber (≥80%) → red (≥95%).

### FloatingSelect — use for ALL select dropdowns
```tsx
import FloatingSelect from "@/components/ui/FloatingSelect";

<FloatingSelect
  label="Industry"
  name="industry"
  value={formData.industry}
  onChange={handleChange}
  error={errors.industry}
  options={[
    { value: "IT", label: "Information Technology" },
    { value: "Finance", label: "Finance & Banking" },
  ]}
  required
/>
```
FloatingSelect auto-generates a `"Select {label}"` placeholder as the first `<option>`.
Empty-value items in the `options` array are filtered out automatically.
Text color is `text-gray-400` when no value selected, `text-gray-900` when a value is chosen.
Options always have proper color via `[&>option]:text-gray-900 [&>option]:bg-white` + dark variants.

### Rules for form inputs
- ALWAYS use Floating* components — never use raw `<input>`, `<textarea>`, or `<select>` in forms
- Label is a **title above** the input (`block text-sm font-medium mb-1.5`), NOT a floating placeholder inside
- `placeholder` prop is optional — defaults to the `label` text when omitted
- Error messages auto-animate via AnimatePresence (slide in/out)
- Dark mode is built-in — no extra `dark:` classes needed
- Pass `required` prop for visual indicator (red asterisk on label)
- Pass `disabled` during form submission

---

## 15. Dark Mode (MANDATORY on every component)

Theme is managed by `next-themes` with `attribute="class"`. Every component MUST include
`dark:` variants for all color-dependent classes.

### Pattern: Always pair light + dark classes
```tsx
// ✅ CORRECT
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-800"

// ❌ WRONG — missing dark variant
className="bg-white text-gray-900 border-gray-200"
```

### Common dark mode pairs
| Light | Dark |
|-------|------|
| `bg-white` | `dark:bg-gray-900` |
| `bg-gray-50` | `dark:bg-gray-800` |
| `bg-gray-100` | `dark:bg-gray-800` |
| `text-gray-900` | `dark:text-gray-100` |
| `text-gray-700` | `dark:text-gray-300` |
| `text-gray-500` | `dark:text-gray-400` |
| `text-gray-400` | `dark:text-gray-500` |
| `border-gray-200` | `dark:border-gray-800` |
| `border-gray-100` | `dark:border-gray-700` |
| `hover:bg-gray-50` | `dark:hover:bg-gray-800` |
| `hover:bg-gray-100` | `dark:hover:bg-gray-800` |
| `bg-blue-50` | `dark:bg-blue-900/20` |
| `text-blue-600` | `dark:text-blue-400` |
| `bg-red-50` | `dark:bg-red-900/20` |
| `bg-emerald-50` | `dark:bg-emerald-900/20` |
| `bg-amber-50` | `dark:bg-amber-900/20` |

### Status Color Configs — ALWAYS include dark: variants
Status color records in validators (e.g., `APPLICATION_STATUS_COLORS`, `PLACEMENT_STATUS_COLORS`) MUST include `dark:` variants for `bg` and `text` fields. Dots are small enough to not need dark variants.

```ts
// ✅ CORRECT — dark: variants included
export const STATUS_COLORS = {
  pending:  { bg: "bg-amber-50 dark:bg-amber-900/20",     text: "text-amber-700 dark:text-amber-400",     dot: "bg-amber-500" },
  active:   { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
  rejected: { bg: "bg-red-50 dark:bg-red-900/20",        text: "text-red-600 dark:text-red-400",         dot: "bg-red-400" },
  inactive: { bg: "bg-gray-100 dark:bg-gray-800",         text: "text-gray-600 dark:text-gray-400",       dot: "bg-gray-400" },
};

// ❌ WRONG — missing dark: variants (unreadable in dark mode)
export const STATUS_COLORS = {
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};
```

Reference: `RoundResultSchema.ts` `RESULT_STATUS_COLORS` (gold standard).

### Cards / Panels
```tsx
<div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
```

### Page background (handled by DashboardLayout via layout route)
```tsx
// DashboardLayout applies this — pages inherit it automatically
<div className="bg-gray-50 dark:bg-gray-950">
```

---

## 16. Error Boundary (MANDATORY)

`ErrorBoundary` from `src/components/ui/ErrorBoundary.tsx` is already wrapped around
`<Routes>` in `App.tsx`. For granular crash isolation, wrap individual sections:

```tsx
import ErrorBoundary from "@/components/ui/ErrorBoundary";

<ErrorBoundary>
  <SomeComponentThatMightCrash />
</ErrorBoundary>
```

Provides: "Something went wrong" UI, error message, "Try Again" button, "Go to Dashboard" link.
Dark mode included. Accepts optional `fallback` prop for custom error UI.

---

## 17. Mistakes NEVER Allowed

```ts
// ❌ Pre-created JSX stored in constants (breaks Lucide icon tree-shaking)
const ICON = <BuildingIcon className="h-4 w-4" />;

// ❌ DOM manipulation for image fallbacks
img.nextElementSibling.style.display = "block";

// ❌ AxiosError direct cast
const err = error as AxiosError;

// ❌ handleChange depends on errors state (recreates on every keystroke)
const handleChange = useCallback(..., [errors, formData]);

// ❌ All tabs always mounted (triples DOM + JS cost)
const tabContent = { a: <TabA />, b: <TabB />, c: <TabC /> };
return <div>{tabContent[active]}</div>;

// ❌ Full payload on every update (causes false 409 duplicates)
await updateEntity(id, formData); // always all fields

// ❌ No .trim() on user text input
entity_name: formData.name,       // whitespace passes min(2) silently

// ❌ Display name changes while user is typing in the form
const [companyName, setCompanyName] = useState("");
// (form field and display name must be separate states)

// ❌ window.confirm for destructive actions
if (window.confirm("Delete?")) { ... }

// ❌ Inline API calls in components
await fetch("/api/college/create_company", { body: ... });

// ❌ type="submit" on non-submit buttons inside forms
<button onClick={handleCancel}>Cancel</button>  // must be type="button"

// ❌ Spinner as primary loading state for full-page data fetch
if (loading) return <Spinner />; // use skeleton layout instead

// ❌ Missing error state for data fetches
if (loading) return ...;
return <div>{data.items.map(...)}</div>; // crashes if fetch fails

// ❌ Raw <input>/<select>/<textarea> in forms — ALWAYS use Floating* components
<input type="text" name="name" className="..." />;

// ❌ Inline motion variants — ALWAYS import from src/lib/animations.ts
<motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }} />;

// ❌ Missing dark: variants on color-dependent classes
className="bg-white text-gray-900 border-gray-200"; // needs dark: pairs

// ❌ Inline modals — ALWAYS use ModalWrapper from src/components/ui/ModalWrapper.tsx
{showModal && <div className="fixed inset-0 ...">...</div>}

// ❌ Direct useQuery/useMutation without queryKeys factory
useQuery({ queryKey: ["companies", id], ... }); // use queryKeys.companies.detail(id)

// ❌ Broad cache invalidation after mutations (invalidates everything, wastes bandwidth)
queryClient.invalidateQueries({ queryKey: ["companies"] }); // too broad!
// Use targeted: queryKeys.companies.contacts(companyId) + queryKeys.companies.detail(companyId)

// ❌ Manual useState + useEffect for data fetching in tab components (no caching, race conditions)
const [data, setData] = useState([]);
useEffect(() => { fetchData().then(setData); }, []);
// Use a dedicated useView<X> hook with useQuery instead

// ❌ Missing AnimatedPage wrapper on loading/error return paths
if (loading) return <div><Skeleton /></div>; // must wrap in <AnimatedPage> too
if (error) return <div>Error</div>;          // must wrap in <AnimatedPage> too
// ALL return paths in a page component must be wrapped in <AnimatedPage>

// ❌ Missing useReducedMotion() check in animated components
// ALWAYS call useReducedMotion() and provide fallback for users who prefer reduced motion

// ❌ Missing AnimatedPage wrapper on page content
return <div>...</div>; // wrap content in <AnimatedPage>

// ❌ Importing DashboardLayout in page components
import DashboardLayout from "@/components/collegeadmin/DashboardLayout"; // layout route provides it
// Pages NEVER wrap in DashboardLayout — CollegeAdminLayout handles it via <Outlet />
```

---

## 18. Reference Implementation (Company Management)

The complete gold-standard reference for all patterns:

```
src/
├── lib/api.ts                                         ← ApiError class + interceptor
├── lib/animations.ts                                  ← Framer Motion variants
├── lib/queryClient.ts                                 ← React Query client config
├── lib/queryKeys.ts                                   ← Query key factory
├── validators/CompanySchema.ts                        ← Zod schemas pattern
├── services/collegeadmin/collegeadmin.services.ts    ← service methods pattern
├── hooks/collegeadmin/company_management/
│   ├── useCreateCompany.tsx                           ← create hook pattern
│   ├── useUpdateCompany.tsx                           ← update + diff pattern
│   ├── useViewCompanies.tsx                           ← list + filters + debounce
│   ├── useViewCompany.tsx                             ← single fetch pattern
│   └── useViewCompanyJobs.tsx                         ← tab data hook (React Query, not manual state)
├── components/collegeadmin/company_management/
│   ├── CompanyForm.tsx                                ← shared create/edit form
│   ├── CreateCompanyForm.tsx                          ← thin wrapper pattern
│   ├── UpdateCompanyForm.tsx                          ← skeleton/error/form
│   ├── ContactsTab.tsx                                ← tab with React Query hooks
│   └── CompanyJobsTab.tsx                             ← tab with dedicated useViewCompanyJobs hook
└── pages/collegeadmin/company_management/
    ├── ViewCompanies.tsx                              ← list page pattern
    ├── CompanyDetail.tsx                              ← tabbed detail pattern (AnimatedPage on ALL returns)
    ├── CreateCompany.tsx                              ← thin page wrapper
    └── UpdateCompany.tsx                              ← dynamic breadcrumb pattern
```

When implementing any new module (Contacts, Jobs, Rounds, etc.),
**clone and adapt** the company management structure — never invent new patterns.

---

## 19. Module Checklist (use for every new document and existing module review  )

Before marking a module complete, verify:

- [ ] Zod schema file in `src/validators/` with correct field constraints
- [ ] All API methods in `collegeadmin.services.ts` (each method matches doc endpoint)
- [ ] `useCreate<X>` hook: Zod validation, `.trim()` on text fields, `ApiError` 409/422 handling, navigate on success
- [ ] `useUpdate<X>` hook: fetch existing data, `originalData` ref, diff payload, no-changes guard
- [ ] `useView<X>s` hook: debounced search (300ms), all filter/sort params, pagination reset on filter change
- [ ] `useView<X>` hook: `CompanyDetail`-equivalent type with all doc fields
- [ ] Shared `<X>Form` component: mode="create"|"edit", sections with icons, char counter if textarea
- [ ] `Create<X>Form` thin wrapper (< 30 lines)
- [ ] `Update<X>Form` with skeleton, error state, `onItemLoaded` callback
- [ ] `View<X>s` page: clickable rows, filter bar, sort controls, pagination, both empty states
- [ ] `<X>Detail` page: hero header, stats row, tabs, toggle modal with consequences
- [ ] `Create<X>` page: correct title ("Register New X"), constant breadcrumbs
- [ ] `Update<X>` page: "Edit X" title, dynamic entity name breadcrumb
- [ ] All buttons have `type="button"` (except submit)
- [ ] All image load failures handled with `useState` (no DOM hacks)
- [ ] Zero TypeScript errors (`get_errors` tool confirms)
- [ ] Error states on every page that fetches data
- [ ] Skeleton loading matches real layout
- [ ] All forms use `FloatingInput`/`FloatingTextarea`/`FloatingSelect` (no raw `<input>`)
- [ ] All modals use `ModalWrapper` (no inline fixed overlays)
- [ ] All pages wrapped in `AnimatedPage` (NOT in `DashboardLayout` — layout route handles it)
- [ ] All tabs use `AnimatedTabContent` with conditional rendering
- [ ] All tables use `AnimatedTableBody` + `AnimatedRow`
- [ ] `useReducedMotion()` checked in every animated component
- [ ] `dark:` variants present on ALL color-dependent classes (see section 15 for common pairs)
- [ ] React Query used for server state: `useQuery`/`useMutation` with `queryKeys` factory
- [ ] `placeholderData: keepPreviousData` on all paginated list hooks (no skeleton flash on page change)
- [ ] Cache invalidation is targeted: use `queryKeys.domain.subKey(id)` — never broad `["root"]` arrays
- [ ] Mutation hooks that change child data invalidate BOTH the child list AND the parent detail
- [ ] Tab components use dedicated `useView<X>` hooks — never manual `useState` + `useEffect` fetch
- [ ] `AnimatedPage` wraps ALL return paths (loading, error, AND success) in page components
- [ ] Animation variants imported from `src/lib/animations.ts` (no inline variants)
- [ ] No `DashboardLayout` import in any page file — layout route provides it
- [ ] Detail pages with modals: wrap content in `<>` fragment (`<AnimatedPage>` + `<ModalWrapper>` as siblings)
- [ ] Status badge colors: emerald=active, red=inactive, amber=pending (consistent across all modules)
- [ ] Skeleton loading states: use `animate-pulse` with matching layout structure
- [ ] Every `hover:` class has matching `dark:hover:` variant
- [ ] Every `focus:` style has matching `dark:focus:` variant
- [ ] Colored badges (bg-blue-50, bg-emerald-50, etc.) have `dark:bg-{color}-900/20` counterparts
- [ ] Text on colored backgrounds: `text-{color}-700` paired with `dark:text-{color}-400`
