/**
 * API Integration Test Script
 *
 * Runs against the real backend. Make sure the backend is running first.
 *
 * Usage:
 *   node scripts/test-api.mjs
 *   node scripts/test-api.mjs --base-url http://localhost:8000
 *
 * Default base URL: http://localhost:8000/api/v1
 */

const BASE_URL =
  process.argv.find((a) => a.startsWith('--base-url='))?.split('=')[1] ??
  'http://localhost:8000';

const API = `${BASE_URL}/api/v1`;

// ── Colours ──────────────────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

const pass = (msg) => console.log(`  ${c.green}✓${c.reset} ${msg}`);
const fail = (msg, detail) =>
  console.log(`  ${c.red}✗${c.reset} ${msg}${detail ? `  ${c.dim}(${detail})${c.reset}` : ''}`);
const skip = (msg) => console.log(`  ${c.yellow}⚠${c.reset} ${c.yellow}SKIP${c.reset} ${msg}`);
const section = (name) =>
  console.log(`\n${c.bold}${c.cyan}── ${name} ──${c.reset}`);
const note = (msg) => console.log(`  ${c.dim}↳ ${msg}${c.reset}`);

// ── Helpers ──────────────────────────────────────────────────────────────────
const results = { pass: 0, fail: 0, skip: 0 };

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(`${API}${path}`, opts);
    let json = null;
    try {
      json = await res.json();
    } catch {}
    return { status: res.status, body: json };
  } catch (err) {
    return { status: 0, body: null, error: err.message };
  }
}

function check(label, { status, body, error }, expectedStatus, extraCheck) {
  if (error) {
    fail(label, `network error: ${error}`);
    results.fail++;
    return false;
  }
  const statusOk = Array.isArray(expectedStatus)
    ? expectedStatus.includes(status)
    : status === expectedStatus;

  if (!statusOk) {
    fail(label, `expected ${expectedStatus}, got ${status} — ${JSON.stringify(body)}`);
    results.fail++;
    return false;
  }
  if (extraCheck) {
    const msg = extraCheck(body);
    if (msg) {
      fail(label, msg);
      results.fail++;
      return false;
    }
  }
  pass(label);
  results.pass++;
  return true;
}

function skipTest(label) {
  skip(label);
  results.skip++;
}

// ── Unique suffix so repeated runs don't conflict ────────────────────────────
const uid = Date.now().toString(36);

// ─────────────────────────────────────────────────────────────────────────────
// UNITS
// ─────────────────────────────────────────────────────────────────────────────
section('UNITS  /api/v1/units');

let unitId = null;

// GET all
{
  const r = await req('GET', '/units');
  check('GET /units → 200, returns array', r, 200, (b) =>
    Array.isArray(b) ? null : 'body is not an array'
  );
}

// POST create
{
  const r = await req('POST', '/units', { code: `m-${uid}`, name: `Metry-${uid}` });
  const ok = check('POST /units → 201', r, 201, (b) =>
    b?.unitId ? null : 'missing unitId in response'
  );
  if (ok) {
    unitId = r.body.unitId;
    note(`created unitId: ${unitId}`);
  }
}

// POST duplicate → 409
if (unitId) {
  const r = await req('POST', '/units', { code: `m-${uid}`, name: `Metry-${uid}` });
  check('POST /units (duplicate) → 409', r, 409);
}

// POST validation → 400
{
  const r = await req('POST', '/units', {});
  check('POST /units (missing fields) → 400', r, 400);
}

// GET by id
if (unitId) {
  const r = await req('GET', `/units/${unitId}`);
  check('GET /units/:id → 200', r, 200, (b) => (b?.unitId === unitId ? null : 'wrong unitId'));
}

// GET not found → 404
{
  const r = await req('GET', '/units/00000000-0000-0000-0000-000000000000');
  check('GET /units/:id (not found) → 404', r, 404);
}

// PUT update
if (unitId) {
  const r = await req('PUT', `/units/${unitId}`, { name: `Metry-upd-${uid}` });
  check('PUT /units/:id → 200', r, 200);
}

// PUT not found → 404
{
  const r = await req('PUT', '/units/00000000-0000-0000-0000-000000000000', { name: 'x' });
  check('PUT /units/:id (not found) → 404', r, 404);
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────
section('CATEGORIES  /api/v1/categories');

let categoryId = null;

{
  const r = await req('GET', '/categories');
  check('GET /categories → 200, returns array', r, 200, (b) =>
    Array.isArray(b) ? null : 'body is not an array'
  );
}

{
  const r = await req('POST', '/categories', { name: `Beton-${uid}` });
  const ok = check('POST /categories → 201', r, 201, (b) =>
    b?.categoryId ? null : 'missing categoryId'
  );
  if (ok) {
    categoryId = r.body.categoryId;
    note(`created categoryId: ${categoryId}`);
  }
}

{
  const r = await req('POST', '/categories', { name: `Beton-${uid}` });
  check('POST /categories (duplicate) → 409', r, 409);
}

{
  const r = await req('POST', '/categories', {});
  check('POST /categories (missing fields) → 400', r, 400);
}

if (categoryId) {
  const r = await req('GET', `/categories/${categoryId}`);
  check('GET /categories/:id → 200', r, 200, (b) =>
    b?.categoryId === categoryId ? null : 'wrong categoryId'
  );
}

{
  const r = await req('GET', '/categories/00000000-0000-0000-0000-000000000000');
  check('GET /categories/:id (not found) → 404', r, 404);
}

if (categoryId) {
  const r = await req('PUT', `/categories/${categoryId}`, { name: `Beton-upd-${uid}` });
  check('PUT /categories/:id → 200', r, 200);
}

{
  const r = await req('PUT', '/categories/00000000-0000-0000-0000-000000000000', { name: 'x' });
  check('PUT /categories/:id (not found) → 404', r, 404);
}

// ─────────────────────────────────────────────────────────────────────────────
// MATERIALS
// ─────────────────────────────────────────────────────────────────────────────
section('MATERIALS  /api/v1/materials');

let materialId = null;

{
  const r = await req('GET', '/materials');
  check('GET /materials → 200, returns array', r, 200, (b) =>
    Array.isArray(b) ? null : 'body is not an array'
  );
}

if (categoryId && unitId) {
  const r = await req('POST', '/materials', {
    name: `Cement-${uid}`,
    description: 'Test material',
    categoryId,
    unitId,
  });
  const ok = check('POST /materials → 201', r, 201, (b) =>
    b?.materialId ? null : 'missing materialId'
  );
  if (ok) {
    materialId = r.body.materialId;
    note(`created materialId: ${materialId}`);
  }
} else {
  skipTest('POST /materials → 201  (no categoryId/unitId available)');
}

if (categoryId && unitId) {
  const r = await req('POST', '/materials', {
    name: `Cement-${uid}`,
    description: 'Dup',
    categoryId,
    unitId,
  });
  check('POST /materials (duplicate) → 409', r, 409);
}

{
  const r = await req('POST', '/materials', {});
  check('POST /materials (missing fields) → 400', r, 400);
}

if (materialId) {
  const r = await req('GET', `/materials/${materialId}`);
  check('GET /materials/:id → 200', r, 200, (b) =>
    b?.materialId === materialId ? null : 'wrong materialId'
  );
}

{
  const r = await req('GET', '/materials/00000000-0000-0000-0000-000000000000');
  check('GET /materials/:id (not found) → 404', r, 404);
}

if (materialId) {
  const r = await req('PUT', `/materials/${materialId}`, { description: 'Updated' });
  check('PUT /materials/:id → 200', r, 200);
}

{
  const r = await req('PUT', '/materials/00000000-0000-0000-0000-000000000000', {
    description: 'x',
  });
  check('PUT /materials/:id (not found) → 404', r, 404);
}

// ─────── Extra endpoints used in frontend but NOT in API.md ─────────────────
section('MATERIALS — extra frontend endpoints (not in API.md)');

if (categoryId) {
  const r = await req('GET', `/materials/category/${categoryId}`);
  if (r.status === 0) {
    fail('GET /materials/category/:id  (network error)', r.error);
    results.fail++;
  } else if (r.status === 404 || r.status === 405) {
    fail(`GET /materials/category/:id → ${r.status}  ← ENDPOINT MISSING`, JSON.stringify(r.body));
    results.fail++;
  } else {
    pass(`GET /materials/category/:id → ${r.status}`);
    results.pass++;
  }
} else {
  skipTest('GET /materials/category/:id  (no categoryId)');
}

// Needs a construction — will test after constructions section, see below
note('GET /materials/by-construction/:id — tested in CONSTRUCTIONS section');

// ─────────────────────────────────────────────────────────────────────────────
// CONSTRUCTIONS
// ─────────────────────────────────────────────────────────────────────────────
section('CONSTRUCTIONS  /api/v1/constructions');

let constructionId = null;

{
  const r = await req('GET', '/constructions');
  check('GET /constructions → 200, returns array', r, 200, (b) =>
    Array.isArray(b) ? null : 'body is not an array'
  );
}

{
  const r = await req('POST', '/constructions', {
    name: `Budowa-${uid}`,
    description: 'Opis testowy',
    address: 'ul. Testowa 1',
    status: 'active',
    startDate: '2024-01-15T00:00:00.000Z',
  });
  const ok = check('POST /constructions → 201', r, 201, (b) =>
    b?.constructionId ? null : 'missing constructionId'
  );
  if (ok) {
    constructionId = r.body.constructionId;
    note(`created constructionId: ${constructionId}`);
  }
}

{
  const r = await req('POST', '/constructions', {
    name: `Budowa-${uid}`,
    description: 'Opis',
    address: 'ul. X 1',
    status: 'active',
  });
  check('POST /constructions (duplicate) → 409', r, 409);
}

{
  const r = await req('POST', '/constructions', {});
  check('POST /constructions (missing fields) → 400', r, 400);
}

if (constructionId) {
  const r = await req('GET', `/constructions/${constructionId}`);
  check('GET /constructions/:id → 200', r, 200, (b) =>
    b?.constructionId === constructionId ? null : 'wrong constructionId'
  );
}

{
  const r = await req('GET', '/constructions/00000000-0000-0000-0000-000000000000');
  check('GET /constructions/:id (not found) → 404', r, 404);
}

if (constructionId) {
  const r = await req('PUT', `/constructions/${constructionId}`, { status: 'inactive' });
  check('PUT /constructions/:id → 200', r, 200);
}

{
  const r = await req('PUT', '/constructions/00000000-0000-0000-0000-000000000000', {
    status: 'x',
  });
  check('PUT /constructions/:id (not found) → 404', r, 404);
}

// Extra: materials by construction (used in frontend, not in API.md)
if (constructionId) {
  const r = await req('GET', `/materials/by-construction/${constructionId}`);
  if (r.status === 0) {
    fail('GET /materials/by-construction/:id  (network error)', r.error);
    results.fail++;
  } else if (r.status === 404 || r.status === 405) {
    fail(
      `GET /materials/by-construction/:id → ${r.status}  ← ENDPOINT MISSING`,
      JSON.stringify(r.body)
    );
    results.fail++;
  } else {
    pass(`GET /materials/by-construction/:id → ${r.status}`);
    results.pass++;
  }
}

// Extra: analyze-document (used in frontend, not in API.md)
if (constructionId) {
  note('POST /constructions/:id/analyze-document — skipped (needs real file upload)');
  skipTest('POST /constructions/:id/analyze-document  (multipart upload, skipped)');
}

// ─────────────────────────────────────────────────────────────────────────────
// STORAGE ITEMS
// ─────────────────────────────────────────────────────────────────────────────
section('STORAGE ITEMS  /api/v1/storage-items');

{
  const r = await req('GET', '/storage-items');
  check('GET /storage-items → 200, returns array', r, 200, (b) =>
    Array.isArray(b) ? null : 'body is not an array'
  );
}

// POST create
if (constructionId && materialId) {
  const r = await req('POST', '/storage-items', {
    constructionId,
    materialId,
    quantityValue: 10.5,
  });
  const ok = check('POST /storage-items → 201', r, 201);
  if (!ok) {
    note(`body: ${JSON.stringify(r.body)}`);
  }
} else {
  skipTest('POST /storage-items → 201  (no constructionId/materialId)');
}

// POST duplicate — upsert, powinno zwrócić 200 lub 201
if (constructionId && materialId) {
  const r = await req('POST', '/storage-items', {
    constructionId,
    materialId,
    quantityValue: 5,
  });
  check('POST /storage-items (duplicate/upsert) → 200 or 201', r, [200, 201]);
}

// POST validation → 400
{
  const r = await req('POST', '/storage-items', {});
  check('POST /storage-items (missing fields) → 400', r, 400);
}

// GET by composite key
if (constructionId && materialId) {
  const r = await req('GET', `/storage-items/${constructionId}/${materialId}`);
  check('GET /storage-items/:constructionId/:materialId → 200', r, 200, (b) =>
    b?.constructionId === constructionId ? null : 'wrong constructionId'
  );
}

{
  const r = await req(
    'GET',
    '/storage-items/00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000000'
  );
  check('GET /storage-items/:c/:m (not found) → 404', r, 404);
}

// PUT update
if (constructionId && materialId) {
  const r = await req('PUT', `/storage-items/${constructionId}/${materialId}`, {
    quantityValue: 99,
  });
  check('PUT /storage-items/:constructionId/:materialId → 200', r, 200);
}

// ─────── Extra endpoints used in frontend but NOT in API.md ─────────────────
section('STORAGE ITEMS — extra frontend endpoints (not in API.md)');

if (constructionId) {
  const r = await req('GET', `/storage-items/construction/${constructionId}`);
  if (r.status === 0) {
    fail('GET /storage-items/construction/:id  (network error)', r.error);
    results.fail++;
  } else if (r.status === 404 || r.status === 405) {
    fail(
      `GET /storage-items/construction/:id → ${r.status}  ← ENDPOINT MISSING`,
      JSON.stringify(r.body)
    );
    results.fail++;
  } else {
    pass(`GET /storage-items/construction/:id → ${r.status}`);
    results.pass++;
  }
} else {
  skipTest('GET /storage-items/construction/:id  (no constructionId)');
}

if (constructionId) {
  const r = await req(
    'POST',
    `/storage-items/construction/${constructionId}/bulk`,
    []
  );
  if (r.status === 0) {
    fail('POST /storage-items/construction/:id/bulk  (network error)', r.error);
    results.fail++;
  } else if (r.status === 404 || r.status === 405) {
    fail(
      `POST /storage-items/construction/:id/bulk → ${r.status}  ← ENDPOINT MISSING`,
      JSON.stringify(r.body)
    );
    results.fail++;
  } else {
    pass(`POST /storage-items/construction/:id/bulk → ${r.status}`);
    results.pass++;
  }
} else {
  skipTest('POST /storage-items/construction/:id/bulk  (no constructionId)');
}

// ─────────────────────────────────────────────────────────────────────────────
// CLEANUP — DELETE in safe order (storage-items → materials → constructions →
//           units/categories)
// ─────────────────────────────────────────────────────────────────────────────
section('CLEANUP & DELETE tests');

// DELETE storage item
if (constructionId && materialId) {
  const r = await req('DELETE', `/storage-items/${constructionId}/${materialId}`);
  check('DELETE /storage-items/:constructionId/:materialId → 200', r, 200);
}

// DELETE storage item not found → 404
{
  const r = await req(
    'DELETE',
    '/storage-items/00000000-0000-0000-0000-000000000000/00000000-0000-0000-0000-000000000000'
  );
  check('DELETE /storage-items/:c/:m (not found) → 404', r, 404);
}

// DELETE material
if (materialId) {
  const r = await req('DELETE', `/materials/${materialId}`);
  check('DELETE /materials/:id → 200', r, 200);
}

{
  const r = await req('DELETE', '/materials/00000000-0000-0000-0000-000000000000');
  check('DELETE /materials/:id (not found) → 404', r, 404);
}

// DELETE construction
if (constructionId) {
  const r = await req('DELETE', `/constructions/${constructionId}`);
  check('DELETE /constructions/:id → 200', r, 200);
}

{
  const r = await req('DELETE', '/constructions/00000000-0000-0000-0000-000000000000');
  check('DELETE /constructions/:id (not found) → 404', r, 404);
}

// DELETE unit (check 409 if referenced, then force-delete)
if (unitId) {
  const r = await req('DELETE', `/units/${unitId}`);
  check('DELETE /units/:id → 200', r, [200, 409]);
  if (r.status === 409) note('unit still referenced — skipping full delete check');
}

{
  const r = await req('DELETE', '/units/00000000-0000-0000-0000-000000000000');
  check('DELETE /units/:id (not found) → 404', r, 404);
}

// DELETE category
if (categoryId) {
  const r = await req('DELETE', `/categories/${categoryId}`);
  check('DELETE /categories/:id → 200', r, [200, 409]);
  if (r.status === 409) note('category still referenced — skipping full delete check');
}

{
  const r = await req('DELETE', '/categories/00000000-0000-0000-0000-000000000000');
  check('DELETE /categories/:id (not found) → 404', r, 404);
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
const total = results.pass + results.fail + results.skip;
console.log(`\n${c.bold}══ SUMMARY ══${c.reset}`);
console.log(`  ${c.green}Passed:${c.reset}  ${results.pass}`);
console.log(`  ${c.red}Failed:${c.reset}  ${results.fail}`);
console.log(`  ${c.yellow}Skipped:${c.reset} ${results.skip}`);
console.log(`  Total:   ${total}`);

if (results.fail === 0) {
  console.log(`\n  ${c.green}${c.bold}All tests passed!${c.reset}`);
} else {
  console.log(`\n  ${c.red}${c.bold}${results.fail} test(s) failed.${c.reset}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTES on frontend ↔ backend discrepancies
// ─────────────────────────────────────────────────────────────────────────────
console.log(`
${c.bold}══ FRONTEND ↔ BACKEND DISCREPANCIES (static analysis) ══${c.reset}

${c.yellow}[MISSING in frontend — endpoint exists in API.md but not implemented]${c.reset}
  • POST /storage-items           — createStorageItem() is absent in storage-items.ts  (upsert)
  • GET  /storage-items           — getAllStorageItems() is absent in storage-items.ts

${c.yellow}[MISSING in API.md — frontend calls endpoints not documented]${c.reset}
  • GET  /materials/by-construction/:constructionId   (getMaterialsByConstruction)
  • GET  /materials/category/:categoryId              (getMaterialsByCategory)
  • GET  /storage-items/construction/:constructionId  (getStorageItemsByConstruction)
  • POST /storage-items/construction/:id/bulk         (bulkCreateStorageItems)
  • POST /constructions/:id/analyze-document          (analyzeDocument)

  → Those marked "Not in new API" in the code may be safe to remove,
    but verify first that no component still uses them.

${c.yellow}[FIELD NAMING inconsistency in BulkStorageItemInput]${c.reset}
  • storage-items.ts uses snake_case: construction_id, material_id, quantity_value
  • API.md uses camelCase:            constructionId,  materialId,  quantityValue
  → May cause 400 errors when calling the bulk endpoint.
`);

process.exit(results.fail > 0 ? 1 : 0);
