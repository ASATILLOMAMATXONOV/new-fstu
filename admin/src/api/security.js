import { apiGet, apiPost, apiPatch, apiDelete } from 'utils/fetch';

export async function securityFetcher(path) {
  const response = await apiGet(path, { useCache: false });
  return response.data;
}

export async function blockSecurityIp(payload) {
  return apiPost('/api/security/blocks', payload);
}

export async function unblockSecurityIp(ip) {
  return apiDelete(`/api/security/blocks/${encodeURIComponent(ip)}`);
}

export async function createHoneytoken(payload) {
  return apiPost('/api/security/honeytokens', payload);
}

export async function setHoneytokenActive(id, active) {
  return apiPatch(`/api/security/honeytokens/${id}`, { active });
}

export async function deleteHoneytoken(id) {
  return apiDelete(`/api/security/honeytokens/${id}`);
}
