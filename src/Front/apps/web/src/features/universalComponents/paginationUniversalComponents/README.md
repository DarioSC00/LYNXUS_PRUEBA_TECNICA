# Pagination Universal Component

Componente de paginación reutilizable y accesible para todas las vistas de la aplicación.

## Características

- ✅ **Responsive**: Se adapta a móviles y tablets
- ✅ **Accesible**: ARIA labels y navegación por teclado
- ✅ **Inteligente**: Muestra ellipsis (...) cuando hay muchas páginas
- ✅ **Informativo**: Muestra el rango de items actual
- ✅ **Consistente**: Sigue el diseño visual de la aplicación

## Uso Básico

```tsx
import PaginationUniversal from "../universalComponents/paginationUniversalComponents/paginationUniversal";

function MyList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(100);
  const pageSize = 10;

  return (
    <div>
      {/* Tu contenido */}
      
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

| Prop | Tipo | Requerido | Descripción |
|------|------|-----------|-------------|
| `currentPage` | `number` | ✅ | Página actual (1-indexed) |
| `totalPages` | `number` | ✅ | Total de páginas disponibles |
| `totalItems` | `number` | ⚪ | Total de items (para mostrar info) |
| `pageSize` | `number` | ⚪ | Items por página (para mostrar info) |
| `onPageChange` | `(page: number) => void` | ✅ | Callback cuando cambia la página |
| `disabled` | `boolean` | ⚪ | Deshabilitar controles (default: false) |

## Ejemplos de Implementación

### 1. Lista de Usuarios

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

### 2. Lista de Proyectos con Búsqueda

```tsx
const [projects, setProjects] = useState([]);
const [searchQuery, setSearchQuery] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [totalItems, setTotalItems] = useState(0);
const pageSize = 10;

// Reset page cuando cambia la búsqueda
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

## Comportamiento Visual

### Desktop
```
Showing 1 to 10 of 45 results    [← Previous] 1 2 3 ... 5 [Next →]
```

### Mobile
```
                1 to 10 of 45
            [←] 1 2 3 ... 5 [→]
```

### Con muchas páginas
```
Página 1:     [← Previous] 1 2 3 4 ... 10 [Next →]
Página 5:     [← Previous] 1 ... 4 5 6 ... 10 [Next →]
Página 10:    [← Previous] 1 ... 7 8 9 10 [Next →]
```

## Estilos CSS

El componente usa módulos CSS con las siguientes clases principales:

- `.paginationContainer`: Contenedor principal
- `.paginationInfo`: Información de items
- `.paginationControls`: Controles de navegación
- `.paginationButton`: Botones Previous/Next
- `.pageNumber`: Botones de número de página
- `.pageNumberActive`: Página activa
- `.ellipsis`: Puntos suspensivos

## Accesibilidad

- ✅ Botones con `aria-label` descriptivos
- ✅ Página actual marcada con `aria-current="page"`
- ✅ Estado disabled correctamente manejado
- ✅ Navegable por teclado (Tab + Enter/Space)
- ✅ Contraste de colores AAA

## Integración con Backend

El componente espera que tu API devuelva respuestas paginadas con este formato:

```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "page_size": 10
}
```

Parámetros de query esperados:
- `page`: número de página (1-indexed)
- `page_size` o `limit`: items por página

## Notas

- Si `totalPages <= 1`, el componente **no se renderiza** (auto-oculta)
- Los parámetros `totalItems` y `pageSize` son opcionales pero **recomendados** para mostrar la info de items
- El componente es **stateless**, toda la lógica de estado debe manejarse en el componente padre
