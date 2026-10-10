const roleLabels = {
  super_admin: 'Super admin',
  admin: 'Admin',
  editor: 'Editor',
  moderator: 'Moderator'
};

export function getAdminDisplayName(user) {
  return user?.fullName || user?.name || user?.login || 'Admin';
}

export function getAdminRoleLabel(user) {
  return roleLabels[user?.role] || 'Admin';
}

export function getAdminInitials(user) {
  const source = getAdminDisplayName(user);
  const parts = String(source || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return 'A';
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('');
}

export function getAdminIdentifier(user) {
  return user?.email || user?.login || '—';
}

export function formatAdminDateTime(value) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('uz-UZ', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}
