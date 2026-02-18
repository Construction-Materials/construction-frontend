# Construction API

**Base URL:** `http://localhost:3000/api/v1`

**Swagger UI:** `http://localhost:3000/api`

---

## Units

### GET `/units`
Returns all units.

**Response:** `200`
```json
[
  {
    "unitId": "uuid",
    "code": "meters",
    "name": "Metry"
  }
]
```

### GET `/units/:id`
Returns a single unit by ID.

**Params:** `id` — UUID

**Response:** `200` | `404`
```json
{
  "unitId": "uuid",
  "code": "meters",
  "name": "Metry"
}
```

### POST `/units`
Creates a new unit.

**Body:**
```json
{
  "code": "string (required, max 30)",
  "name": "string (required, max 100)"
}
```

**Response:** `201` | `400` (validation) | `409` (duplicate name or code)

### PUT `/units/:id`
Updates an existing unit.

**Params:** `id` — UUID

**Body:**
```json
{
  "code": "string (optional, max 30)",
  "name": "string (optional, max 100)"
}
```

**Response:** `200` | `400` | `404`

### DELETE `/units/:id`
Deletes a unit.

**Params:** `id` — UUID

**Response:** `200` | `404` | `409` (referenced by materials)

---

## Categories

### GET `/categories`
Returns all categories.

**Response:** `200`
```json
[
  {
    "categoryId": "uuid",
    "name": "Category Name",
    "createdAt": "2024-01-15T09:30:00.000Z"
  }
]
```

### GET `/categories/:id`
Returns a single category by ID.

**Params:** `id` — UUID

**Response:** `200` | `404`

### POST `/categories`
Creates a new category.

**Body:**
```json
{
  "name": "string (required, max 100)"
}
```

**Response:** `201` | `400` | `409` (duplicate name)

### PUT `/categories/:id`
Updates an existing category.

**Params:** `id` — UUID

**Body:**
```json
{
  "name": "string (optional, max 100)"
}
```

**Response:** `200` | `400` | `404`

### DELETE `/categories/:id`
Deletes a category.

**Params:** `id` — UUID

**Response:** `200` | `404` | `409` (referenced by materials)

---

## Materials

### GET `/materials`
Returns all materials.

**Response:** `200`
```json
[
  {
    "materialId": "uuid",
    "categoryId": "uuid",
    "unitId": "uuid",
    "name": "Material Name",
    "description": "Description text",
    "createdAt": "2024-01-15T09:30:00.000Z"
  }
]
```

### GET `/materials/:id`
Returns a single material by ID.

**Params:** `id` — UUID

**Response:** `200` | `404`

### POST `/materials`
Creates a new material.

**Body:**
```json
{
  "name": "string (required, max 100)",
  "description": "string (required)",
  "categoryId": "uuid (required)",
  "unitId": "uuid (required)"
}
```

**Response:** `201` | `400` | `409` (duplicate name)

### PUT `/materials/:id`
Updates an existing material.

**Params:** `id` — UUID

**Body:**
```json
{
  "name": "string (optional, max 100)",
  "description": "string (optional)",
  "categoryId": "uuid (optional)",
  "unitId": "uuid (optional)"
}
```

**Response:** `200` | `400` | `404`

### DELETE `/materials/:id`
Deletes a material.

**Params:** `id` — UUID

**Response:** `200` | `404` | `409` (referenced by storage items)

---

## Constructions

### GET `/constructions`
Returns all constructions.

**Response:** `200`
```json
[
  {
    "constructionId": "uuid",
    "name": "Construction Name",
    "description": "Description text",
    "address": "ul. Example 1",
    "startDate": "2024-01-15T09:30:00.000Z | null",
    "status": "active",
    "imgUrl": "https://... | null",
    "createdAt": "2024-01-15T09:30:00.000Z"
  }
]
```

### GET `/constructions/:id`
Returns a single construction by ID.

**Params:** `id` — UUID

**Response:** `200` | `404`

### POST `/constructions`
Creates a new construction.

**Body:**
```json
{
  "name": "string (required, max 100)",
  "description": "string (required)",
  "address": "string (required, max 255)",
  "status": "string (required, max 20)",
  "startDate": "ISO date string (optional)",
  "imgUrl": "string (optional, max 500)"
}
```

**Response:** `201` | `400` | `409` (duplicate name)

### PUT `/constructions/:id`
Updates an existing construction.

**Params:** `id` — UUID

**Body:**
```json
{
  "name": "string (optional, max 100)",
  "description": "string (optional)",
  "address": "string (optional, max 255)",
  "status": "string (optional, max 20)",
  "startDate": "ISO date string (optional)",
  "imgUrl": "string (optional, max 500)"
}
```

**Response:** `200` | `400` | `404`

### DELETE `/constructions/:id`
Deletes a construction.

**Params:** `id` — UUID

**Response:** `200` | `404` | `409` (referenced by storage items)

---

## Storage Items

Storage items link a material to a construction with a quantity. They use a composite key (`constructionId` + `materialId`).

### GET `/storage-items`
Returns all storage items.

**Response:** `200`
```json
[
  {
    "constructionId": "uuid",
    "materialId": "uuid",
    "quantityValue": 10.50,
    "createdAt": "2024-01-15T09:30:00.000Z"
  }
]
```

### GET `/storage-items/:constructionId/:materialId`
Returns a single storage item by composite key.

**Params:** `constructionId` — UUID, `materialId` — UUID

**Response:** `200` | `404`

### POST `/storage-items`
Creates a new storage item.

**Body:**
```json
{
  "constructionId": "uuid (required)",
  "materialId": "uuid (required)",
  "quantityValue": "number (required, min 0)"
}
```

**Response:** `201` | `400` | `409` (already exists)

### PUT `/storage-items/:constructionId/:materialId`
Updates an existing storage item.

**Params:** `constructionId` — UUID, `materialId` — UUID

**Body:**
```json
{
  "quantityValue": "number (required, min 0)"
}
```

**Response:** `200` | `400` | `404`

### DELETE `/storage-items/:constructionId/:materialId`
Deletes a storage item.

**Params:** `constructionId` — UUID, `materialId` — UUID

**Response:** `200` | `404`

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400 | 404 | 409 | 500,
  "message": "Error description",
  "error": "Bad Request | Not Found | Conflict | Internal Server Error"
}
```

| Code | When |
|------|------|
| `400` | Validation failed (missing/invalid fields) |
| `404` | Entity not found |
| `409` | Duplicate unique field or cannot delete due to references |
| `500` | Unexpected server error |
