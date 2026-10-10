import { apiDelete, apiGet, apiPost, apiPut } from 'utils/fetch';

export async function fetchContentList(resource) {
  const response = await apiGet(`/api/content/${resource}`);
  return response.data?.items || [];
}

export async function fetchContentItem(resource, id) {
  const response = await apiGet(`/api/content/${resource}/${id}`);
  return response.data?.item || null;
}

export async function createContentItem(resource, payload) {
  const response = await apiPost(`/api/content/${resource}`, payload);
  return response.data?.item || null;
}

export async function updateContentItem(resource, id, payload) {
  const response = await apiPut(`/api/content/${resource}/${id}`, payload);
  return response.data?.item || null;
}

export async function deleteContentItem(resource, id) {
  await apiDelete(`/api/content/${resource}/${id}`);
}

export async function fetchSetting(key) {
  try {
    const response = await apiGet(`/api/settings/${key}`);
    return response.data?.item || null;
  } catch (error) {
    if (error.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function saveSetting(key, payload) {
  const response = await apiPut(`/api/settings/${key}`, payload);
  return response.data?.item || null;
}

export async function deleteSetting(key) {
  await apiDelete(`/api/settings/${key}`);
}
