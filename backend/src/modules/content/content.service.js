import { fetchMany, fetchOne } from '../../db/query.js';
import { query } from '../../db/pool.js';
import { HttpError } from '../../utils/http-error.js';
import {
  sanitizeStructuredContent,
  sanitizeUrl,
  summarizeStructuredContent
} from '../../utils/html-security.js';
import { touchPublicSiteRevision } from './public-site-revision.service.js';

const supportedResources = new Set([
  'menus',
  'academic-menus',
  'banners',
  'advantages',
  'news',
  'announcements',
  'students',
  'partners',
  'statistics',
  'pages',
  'faculties',
  'directions',
  'faculty-page-menus',
  'employees-portfolios'
]);

const resourceAliases = {
  'menu-management': 'menus',
  'academic-menu-management': 'academic-menus',
  'banner-management': 'banners',
  'advantages-management': 'advantages',
  'news-management': 'news',
  'announcements-management': 'announcements',
  'students-management': 'students',
  'partners-management': 'partners',
  'statistics-management': 'statistics',
  'new-page-management': 'pages',
  'faculties-management': 'faculties',
  'directions-management': 'directions',
  'faculty-page-menu-management': 'faculty-page-menus',
  'employees-portfolio-management': 'employees-portfolios'
};

const languageKeys = ['uz', 'ru', 'en'];
const reservedKeys = new Set([
  'id',
  'resource',
  'slug',
  'title',
  'image',
  'imageUrl',
  'order',
  'sortOrder',
  'active',
  'translations',
  'metadata',
  'createdBy',
  'updatedBy',
  'createdAt',
  'updatedAt'
]);
const managedImagePolicies = Object.freeze({
  banners: {
    label: 'Banner rasmi',
    maxStoredBytes: 900 * 1024
  },
  news: {
    label: 'Yangilik rasmi',
    maxStoredBytes: 700 * 1024
  },
  announcements: {
    label: 'E’lon rasmi',
    maxStoredBytes: 700 * 1024
  }
});

function normalizeResource(resource) {
  return resourceAliases[resource] || resource;
}

function getStorageResource(resource) {
  return resource === 'academic-menus' ? 'menus' : resource;
}

function ensureSupportedResource(resource) {
  if (!supportedResources.has(resource)) {
    throw new HttpError(404, `Unsupported resource "${resource}".`);
  }
}

function normalizeString(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const trimmed = String(value).trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeBoolean(value, defaultValue = true) {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function normalizeNumber(value, defaultValue = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function normalizeDateTime(value) {
  const normalized = normalizeString(value);

  if (!normalized) {
    return null;
  }

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    throw new HttpError(400, 'Sana formati noto‘g‘ri yuborildi.');
  }

  return date;
}

function normalizeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function normalizeImageMode(value) {
  return String(value || '').trim().toLowerCase() === 'separate' ? 'separate' : 'inline';
}

function buildEntryImagePath(resource, id, updatedAt) {
  const version = updatedAt ? new Date(updatedAt).getTime() || 0 : 0;
  return `/api/content/${resource}/${id}/image?v=${version}`;
}

function formatBytes(bytes = 0) {
  const size = Number(bytes || 0);

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.round(size / 1024)} KB`;
}

function getDataUrlPayloadSize(value = '') {
  const base64 = String(value || '').split(',')[1] || '';
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

function validateManagedImage(resource, imageUrl) {
  const policy = managedImagePolicies[resource];
  const value = normalizeString(imageUrl);

  if (!policy || !value || !String(value).startsWith('data:image/')) {
    return;
  }

  if (!/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(value)) {
    throw new HttpError(400, 'Faqat JPG, PNG yoki WEBP formatdagi rasmlar ruxsat etiladi.');
  }

  const payloadSize = getDataUrlPayloadSize(value);

  if (payloadSize > policy.maxStoredBytes) {
    throw new HttpError(
      400,
      `${policy.label} ${formatBytes(policy.maxStoredBytes)} dan katta bo‘lmasligi kerak.`
    );
  }
}

function buildTranslations(payload) {
  const translations = {
    ...sanitizeStructuredContent(normalizeObject(payload.translations))
  };

  for (const key of languageKeys) {
    if (payload[key] !== undefined) {
      translations[key] = sanitizeStructuredContent(normalizeObject(payload[key]));
    }
  }

  return translations;
}

function buildMetadata(payload) {
  const base = normalizeObject(payload.metadata);
  const metadata = { ...base };

  for (const [key, value] of Object.entries(payload)) {
    if (reservedKeys.has(key) || languageKeys.includes(key)) {
      continue;
    }

    metadata[key] = value;
  }

  return sanitizeStructuredContent(metadata);
}

function mapEntry(row, options = {}) {
  const summaryOnly = normalizeBoolean(options.summaryOnly, false);
  const translationsSource = normalizeObject(row.translations);
  const metadataSource = { ...normalizeObject(row.metadata) };
  const translations = summaryOnly
    ? summarizeStructuredContent(translationsSource)
    : translationsSource;
  const metadata = summaryOnly
    ? summarizeStructuredContent(metadataSource)
    : metadataSource;
  const imageMode = normalizeImageMode(options.imageMode);

  return {
    id: row.id,
    resource: row.resource,
    slug: row.slug,
    title: row.title,
    image:
      imageMode === 'separate' && row.image_url
        ? buildEntryImagePath(row.resource, row.id, row.updated_at || row.created_at)
        : row.image_url,
    imageUrl:
      imageMode === 'separate' && row.image_url
        ? buildEntryImagePath(row.resource, row.id, row.updated_at || row.created_at)
        : row.image_url,
    order: row.sort_order,
    sortOrder: row.sort_order,
    active: row.active,
    translations,
    metadata,
    ...metadata,
    ...translations,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function sortEntries(list = []) {
  return [...list].sort((left, right) => Number(left.order || 0) - Number(right.order || 0));
}

function normalizeMenuName(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/o‘/g, 'o')
    .replace(/g‘/g, 'g')
    .replace(/ʻ/g, '')
    .replace(/'/g, '')
    .replace(/`/g, '');
}

function isAcademicRootEntry(item = {}) {
  if (item?.nodeType !== 'menu') {
    return false;
  }

  if (item?.metadata?.menuScope === 'academic') {
    return true;
  }

  const titles = [item?.uz?.title, item?.ru?.title, item?.en?.title, item?.title];

  return titles.some((title) => {
    const normalizedTitle = normalizeMenuName(title);
    return normalizedTitle.includes('akademik') || normalizedTitle.includes('academic');
  });
}

function matchesEntrySearch(item = {}, search = '') {
  const normalizedSearch = String(search || '').trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  const haystack = [
    item?.title,
    item?.slug,
    item?.uz?.title,
    item?.ru?.title,
    item?.en?.title
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

  return haystack.some((value) => value.includes(normalizedSearch));
}

function buildEntryTree(items = []) {
  const nodeMap = new Map();

  items.forEach((item) => {
    nodeMap.set(String(item.id), {
      ...item,
      parentId: item.parentId || null,
      children: []
    });
  });

  const roots = [];

  nodeMap.forEach((node) => {
    if (node.parentId && nodeMap.has(String(node.parentId))) {
      nodeMap.get(String(node.parentId)).children.push(node);
      return;
    }

    roots.push(node);
  });

  const sortNested = (nodes) =>
    sortEntries(nodes).map((node) => ({
      ...node,
      children: sortNested(node.children || [])
    }));

  return sortNested(roots);
}

function collectAcademicEntryIds(items = []) {
  const tree = buildEntryTree(items);
  const ids = new Set();

  const collectChildren = (node) => {
    ids.add(String(node.id));
    (node.children || []).forEach(collectChildren);
  };

  tree.forEach((node) => {
    if (isAcademicRootEntry(node)) {
      collectChildren(node);
    }
  });

  return ids;
}

function filterAcademicEntries(items = [], queryParams = {}) {
  const activeOnly = normalizeBoolean(queryParams.activeOnly, false);
  const search = normalizeString(queryParams.search);
  const academicIds = collectAcademicEntryIds(items);

  return sortEntries(
    items.filter((item) => {
      if (!academicIds.has(String(item.id))) {
        return false;
      }

      if (activeOnly && item.active === false) {
        return false;
      }

      if (search && !matchesEntrySearch(item, search)) {
        return false;
      }

      return true;
    })
  );
}

function filterMainEntries(items = [], queryParams = {}) {
  const activeOnly = normalizeBoolean(queryParams.activeOnly, false);
  const search = normalizeString(queryParams.search);
  const academicIds = collectAcademicEntryIds(items);

  return sortEntries(
    items.filter((item) => {
      if (academicIds.has(String(item.id))) {
        return false;
      }

      if (activeOnly && item.active === false) {
        return false;
      }

      if (search && !matchesEntrySearch(item, search)) {
        return false;
      }

      return true;
    })
  );
}

async function fetchRowsByResource(resource, queryParams = {}) {
  const activeOnly = normalizeBoolean(queryParams.activeOnly, false);
  const search = normalizeString(queryParams.search);
  const slug = normalizeString(queryParams.slug);
  const attachType = normalizeString(queryParams.attachType);
  const entityType = normalizeString(queryParams.entityType);
  const facultyId = normalizeString(queryParams.facultyId);
  const departmentId = normalizeString(queryParams.departmentId);
  const sectionId = normalizeString(queryParams.sectionId);
  const roleType = normalizeString(queryParams.roleType);
  const limit = Math.max(0, normalizeNumber(queryParams.limit, 0));
  const orderBy = normalizeString(queryParams.orderBy);

  const params = [resource];
  const conditions = ['resource = $1'];

  if (activeOnly) {
    conditions.push('active = TRUE');
  }

  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    conditions.push(
      `(
        LOWER(COALESCE(title, '')) LIKE $${params.length}
        OR LOWER(COALESCE(slug, '')) LIKE $${params.length}
        OR LOWER(COALESCE(metadata->>'link', '')) LIKE $${params.length}
      )`
    );
  }

  if (slug) {
    params.push(slug.toLowerCase());
    conditions.push(
      `(
        LOWER(COALESCE(slug, '')) = $${params.length}
        OR LOWER(REGEXP_REPLACE(COALESCE(metadata->>'link', ''), '^/?employees/', '')) = $${params.length}
      )`
    );
  }

  if (attachType) {
    params.push(attachType);
    conditions.push(`COALESCE(metadata->>'attachType', '') = $${params.length}`);
  }

  if (entityType) {
    params.push(entityType);
    conditions.push(`COALESCE(metadata->>'entityType', '') = $${params.length}`);
  }

  if (facultyId) {
    params.push(facultyId);
    conditions.push(`COALESCE(metadata->>'facultyId', '') = $${params.length}`);
  }

  if (departmentId) {
    params.push(departmentId);
    conditions.push(`COALESCE(metadata->>'departmentId', '') = $${params.length}`);
  }

  if (sectionId) {
    params.push(sectionId);
    conditions.push(`COALESCE(metadata->>'sectionId', '') = $${params.length}`);
  }

  if (roleType) {
    params.push(roleType);
    conditions.push(`COALESCE(metadata->>'roleType', '') = $${params.length}`);
  }

  const orderClause =
    orderBy === 'recent' ? 'created_at DESC, id DESC' : 'sort_order ASC, id DESC';
  const limitClause = limit > 0 ? `LIMIT ${limit}` : '';

  return fetchMany(
    `
      SELECT *
      FROM content_entries
      WHERE ${conditions.join(' AND ')}
      ORDER BY ${orderClause}
      ${limitClause}
    `,
    params
  );
}

function normalizeEntryPayload(resource, payload) {
  const normalizedResource = normalizeResource(resource);
  ensureSupportedResource(normalizedResource);
  const storageResource = getStorageResource(normalizedResource);
  const normalizedImageUrl = sanitizeUrl(normalizeString(payload.image ?? payload.imageUrl), {
    allowDataImage: true
  });
  const normalizedTitle =
    normalizeString(payload.title) ||
    normalizeString(payload?.uz?.title) ||
    normalizeString(payload.fullName);
  const metadata = buildMetadata(payload);

  if (normalizedResource === 'academic-menus' && payload.nodeType === 'menu') {
    metadata.menuScope = 'academic';
  }

  validateManagedImage(storageResource, normalizedImageUrl);

  return {
    resource: storageResource,
    slug: normalizeString(payload.slug),
    title: normalizedTitle,
    imageUrl: normalizedImageUrl,
    createdAt: normalizeDateTime(payload.createdAt),
    sortOrder: normalizeNumber(payload.order ?? payload.sortOrder, 0),
    active: normalizeBoolean(payload.active, true),
    translations: buildTranslations(payload),
    metadata
  };
}

export async function listEntries(resource, queryParams = {}) {
  const normalizedResource = normalizeResource(resource);
  ensureSupportedResource(normalizedResource);
  const storageResource = getStorageResource(normalizedResource);
  const mapOptions = {
    imageMode: queryParams.imageMode,
    summaryOnly: queryParams.summaryOnly
  };

  if (normalizedResource === 'academic-menus') {
    const rows = await fetchRowsByResource(storageResource);
    return filterAcademicEntries(rows.map((row) => mapEntry(row, mapOptions)), queryParams);
  }

  if (normalizedResource === 'menus') {
    const rows = await fetchRowsByResource(storageResource);
    return filterMainEntries(rows.map((row) => mapEntry(row, mapOptions)), queryParams);
  }

  const rows = await fetchRowsByResource(storageResource, queryParams);
  return rows.map((row) => mapEntry(row, mapOptions));
}

export async function listEntryTree(resource, queryParams = {}) {
  const items = await listEntries(resource, queryParams);
  return buildEntryTree(items);
}

export async function getEntryById(resource, id, queryParams = {}) {
  const normalizedResource = normalizeResource(resource);
  ensureSupportedResource(normalizedResource);
  const storageResource = getStorageResource(normalizedResource);

  const row = await fetchOne(
    'SELECT * FROM content_entries WHERE resource = $1 AND id = $2 LIMIT 1',
    [storageResource, id]
  );

  if (!row) {
    throw new HttpError(404, 'Content item not found.');
  }

  const item = mapEntry(row, {
    imageMode: queryParams.imageMode
  });

  if (normalizedResource === 'academic-menus') {
    const academicItems = await listEntries('academic-menus');
    if (!academicItems.some((entry) => String(entry.id) === String(id))) {
      throw new HttpError(404, 'Content item not found.');
    }
  }

  return item;
}

function parseDataUrl(value = '') {
  const match = String(value || '').match(/^data:([^;,]+)?(?:;charset=[^;,]+)?;base64,(.+)$/i);

  if (!match) {
    return null;
  }

  return {
    mimeType: match[1] || 'application/octet-stream',
    buffer: Buffer.from(match[2], 'base64')
  };
}

export async function getEntryImage(resource, id) {
  const normalizedResource = normalizeResource(resource);
  ensureSupportedResource(normalizedResource);
  const storageResource = getStorageResource(normalizedResource);

  const row = await fetchOne(
    'SELECT id, resource, image_url, updated_at, created_at, active FROM content_entries WHERE resource = $1 AND id = $2 LIMIT 1',
    [storageResource, id]
  );

  if (!row || !row.image_url) {
    throw new HttpError(404, 'Image not found.');
  }

  const parsed = parseDataUrl(row.image_url);

  if (parsed) {
    return {
      type: 'buffer',
      mimeType: parsed.mimeType,
      body: parsed.buffer,
      updatedAt: row.updated_at || row.created_at
    };
  }

  return {
    type: 'redirect',
    location: row.image_url,
    updatedAt: row.updated_at || row.created_at
  };
}

export async function createEntry(resource, payload, userId = null) {
  const normalizedResource = normalizeResource(resource);
  const normalized = normalizeEntryPayload(resource, payload);

  if (normalizedResource === 'academic-menus' && payload.nodeType === 'dropdown') {
    throw new HttpError(400, 'Akademik menyuda dropdown qo‘shish o‘chirilgan.');
  }

  const result = await query(
    `
      INSERT INTO content_entries
        (resource, slug, title, image_url, sort_order, active, translations, metadata, created_by, updated_by, created_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9, $9, COALESCE($10, NOW()))
      RETURNING *
    `,
    [
      normalized.resource,
      normalized.slug,
      normalized.title,
      normalized.imageUrl,
      normalized.sortOrder,
      normalized.active,
      JSON.stringify(normalized.translations),
      JSON.stringify(normalized.metadata),
      userId,
      normalized.createdAt
    ]
  );

  const item = mapEntry(result.rows[0]);
  await touchPublicSiteRevision();
  return item;
}

export async function updateEntry(resource, id, payload, userId = null) {
  const normalizedResource = normalizeResource(resource);
  const storageResource = getStorageResource(normalizedResource);
  if (normalizedResource === 'academic-menus') {
    const academicItems = await listEntries('academic-menus');
    if (!academicItems.some((item) => String(item.id) === String(id))) {
      throw new HttpError(404, 'Content item not found.');
    }
  }

  const existing = await fetchOne(
    'SELECT * FROM content_entries WHERE resource = $1 AND id = $2 LIMIT 1',
    [storageResource, id]
  );

  if (!existing) {
    throw new HttpError(404, 'Content item not found.');
  }

  const normalized = normalizeEntryPayload(resource, {
    ...mapEntry(existing),
    ...payload
  });

  const result = await query(
    `
      UPDATE content_entries
      SET slug = $3,
          title = $4,
          image_url = $5,
          sort_order = $6,
          active = $7,
          translations = $8::jsonb,
          metadata = $9::jsonb,
          updated_by = $10,
          created_at = COALESCE($11, created_at),
          updated_at = NOW()
      WHERE resource = $1
        AND id = $2
      RETURNING *
    `,
    [
      storageResource,
      id,
      normalized.slug,
      normalized.title,
      normalized.imageUrl,
      normalized.sortOrder,
      normalized.active,
      JSON.stringify(normalized.translations),
      JSON.stringify(normalized.metadata),
      userId,
      normalized.createdAt
    ]
  );

  const item = mapEntry(result.rows[0]);
  await touchPublicSiteRevision();
  return item;
}

export async function deleteEntry(resource, id) {
  const normalizedResource = normalizeResource(resource);
  ensureSupportedResource(normalizedResource);
  const storageResource = getStorageResource(normalizedResource);

  if (normalizedResource === 'academic-menus') {
    const academicItems = await listEntries('academic-menus');
    if (!academicItems.some((item) => String(item.id) === String(id))) {
      throw new HttpError(404, 'Content item not found.');
    }
  }

  const result = await query(
    'DELETE FROM content_entries WHERE resource = $1 AND id = $2 RETURNING id',
    [storageResource, id]
  );

  if (result.rowCount === 0) {
    throw new HttpError(404, 'Content item not found.');
  }

  await touchPublicSiteRevision();
}
