# Pagination Universal Component

A reusable, accessible pagination component for use across the application.

## Features

- ✅ Responsive: adapts to mobile and tablet layouts
- ✅ Accessible: ARIA labels and keyboard navigation
- ✅ Smart: displays ellipses (...) when there are many pages
- ✅ Informative: shows the current item range
- ✅ Consistent: follows the application's visual design

## Basic Usage

```tsx
import PaginationUniversal from "../universalComponents/paginationUniversalComponents/paginationUniversal";

function MyList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(100);
  const pageSize = 10;

  return (
    <div>
      {/* Your content */}
      <PaginationUniversal
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / pageSize)}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        disabled={false}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|-----------|-------------|
| `currentPage` | `number` | ✅ | Current page (1-indexed) |
| `totalPages` | `number` | ✅ | Total available pages |
| `totalItems` | `number` | ⚪ | Total items (for info display) |
| `pageSize` | `number` | ⚪ | Items per page (for info display) |
| `onPageChange` | `(page: number) => void` | ✅ | Callback when the page changes |
| `disabled` | `boolean` | ⚪ | Disable controls (default: false) |

## Implementation Examples

### 1. Users List

```tsx
const [users, setUsers] = useState([]);
const [currentPage, setCurrentPage] = useState(1);
const [totalItems, setTotalItems] = useState(0);
const pageSize = 10;

useEffect(() => {
  async function loadUsers() {
    const res = await userService.listUsers({
      page: currentPage,
      page_size: pageSize
    });
    setUsers(res.items);
    setTotalItems(res.total);
  }
  loadUsers();
}, [currentPage]);

return (
  <>
    <UserTable users={users} />
    <PaginationUniversal
      currentPage={currentPage}
      totalPages={Math.ceil(totalItems / pageSize)}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
    />
  </>
);
```

### 2. Projects List with Search

```tsx
const [projects, setProjects] = useState([]);
const [searchQuery, setSearchQuery] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [totalItems, setTotalItems] = useState(0);
const pageSize = 10;

// Reset page when search changes
useEffect(() => {
  setCurrentPage(1);
}, [searchQuery]);

useEffect(() => {
  async function loadProjects() {
    const res = await projectService.listProjects({
      q: searchQuery,
      page: currentPage,
      page_size: pageSize
    });
    setProjects(res.items);
    setTotalItems(res.total);
  }
  loadProjects();
}, [searchQuery, currentPage]);

return (
  <>
    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
    <ProjectTable projects={projects} />
    <PaginationUniversal
      currentPage={currentPage}
      totalPages={Math.ceil(totalItems / pageSize)}
      totalItems={totalItems}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
    />
  </>
);
```

## Visual Behavior

### Desktop
```
Showing 1 to 10 of 45 results    [← Previous] 1 2 3 ... 5 [Next →]
```

### Mobile
```
                1 to 10 of 45
            [←] 1 2 3 ... 5 [→]
```

### With many pages
```
Page 1:     [← Previous] 1 2 3 4 ... 10 [Next →]
Page 5:     [← Previous] 1 ... 4 5 6 ... 10 [Next →]
Page 10:    [← Previous] 1 ... 7 8 9 10 [Next →]
```

## CSS Classes

The component uses CSS modules with the following main classes:

- `.paginationContainer`: main container
- `.paginationInfo`: item info display
- `.paginationControls`: navigation controls
- `.paginationButton`: Previous/Next buttons
- `.pageNumber`: page number buttons
- `.pageNumberActive`: active page
- `.ellipsis`: ellipsis dots

## Accessibility

- ✅ Buttons include descriptive `aria-label`s
- ✅ Current page marked with `aria-current="page"`
- ✅ Disabled state handled correctly
- ✅ Keyboard navigable (Tab + Enter/Space)
- ✅ High contrast colors

## Backend Integration

The component expects your API to return paginated responses in this format:

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 10
}
```

Query parameters expected:
- `page`: page number (1-indexed)
- `page_size` or `limit`: items per page

## Notes

- If `totalPages <= 1`, the component will not render (it auto-hides)
- `totalItems` and `pageSize` are optional but recommended for showing item info
- The component is stateless; parent component should manage pagination state
