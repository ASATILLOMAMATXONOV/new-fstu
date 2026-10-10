import { apiDelete, apiGet, apiPost, apiPut } from 'utils/fetch';

export async function fetchAdminUsers() {
  const response = await apiGet('/api/admin-users');
  return response.data?.items || [];
}

export async function createAdminUser(payload) {
  const response = await apiPost('/api/admin-users', payload);
  return response.data?.item || null;
}

export async function updateAdminUser(id, payload) {
  const response = await apiPut(`/api/admin-users/${id}`, payload);
  return response.data?.item || null;
}

export async function deleteAdminUser(id) {
  await apiDelete(`/api/admin-users/${id}`);
}
