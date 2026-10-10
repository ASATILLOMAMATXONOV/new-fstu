import React, { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';

import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUser
} from 'api/admin-users';
import AdminTablePagination from 'components/AdminTablePagination';
import MainCard from 'components/MainCard';
import { useTablePagination } from 'hooks/useTablePagination';
import {
  allMenuKeys,
  getMenuTitle,
  menuAccessGroups
} from 'constants/admin-access';
import { getPasswordValidationErrors } from 'utils/password-validation';

const roleOptions = [
  { value: 'super_admin', label: 'Super admin', color: 'error' },
  { value: 'admin', label: 'Admin', color: 'primary' },
  { value: 'editor', label: 'Editor', color: 'secondary' },
  { value: 'moderator', label: 'Moderator', color: 'success' }
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getEmptyForm = () => ({
  id: null,
  fullName: '',
  login: '',
  email: '',
  password: '',
  role: 'admin',
  active: true,
  menuAccess: []
});

const getRoleMeta = (role) => roleOptions.find((item) => item.value === role) || roleOptions[1];

function formatDateTime(value) {
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

export default function AdminUsersManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(getEmptyForm());
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const adminsPagination = useTablePagination(admins);

  const passwordErrors = useMemo(
    () => (form.password ? getPasswordValidationErrors(form.password) : []),
    [form.password]
  );

  const loadAdmins = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const items = await fetchAdminUsers();
      setAdmins(items);
    } catch (error) {
      setErrorMessage(error.message || 'Adminlar ro‘yxatini yuklab bo‘lmadi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const openCreate = () => {
    setForm(getEmptyForm());
    setShowPassword(false);
    setErrorMessage('');
    setMode('form');
  };

  const openEdit = (admin) => {
    setForm({
      id: admin.id,
      fullName: admin.fullName || '',
      login: admin.login || '',
      email: admin.email || '',
      password: '',
      role: admin.role || 'admin',
      active: Boolean(admin.active),
      menuAccess: Array.isArray(admin.menuAccess) ? [...admin.menuAccess] : []
    });
    setShowPassword(false);
    setErrorMessage('');
    setMode('form');
  };

  const handleBaseChange = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'role' && value !== 'super_admin'
        ? {
            menuAccess: prev.menuAccess.filter((key) => key !== 'admin-users-management')
          }
        : {})
    }));
  };

  const toggleMenuAccess = (menuKey) => {
    setForm((prev) => {
      const exists = prev.menuAccess.includes(menuKey);

      return {
        ...prev,
        menuAccess: exists
          ? prev.menuAccess.filter((key) => key !== menuKey)
          : [...prev.menuAccess, menuKey]
      };
    });
  };

  const toggleGroupAccess = (group) => {
    const groupKeys = group.items
      .filter((item) => !(item.superAdminOnly && form.role !== 'super_admin'))
      .map((item) => item.key);
    const allSelected = groupKeys.every((key) => form.menuAccess.includes(key));

    setForm((prev) => ({
      ...prev,
      menuAccess: allSelected
        ? prev.menuAccess.filter((key) => !groupKeys.includes(key))
        : Array.from(new Set([...prev.menuAccess, ...groupKeys]))
    }));
  };

  const selectAllMenus = () => {
    setForm((prev) => ({
      ...prev,
      menuAccess: menuAccessGroups
        .flatMap((group) => group.items)
        .filter((item) => !(item.superAdminOnly && prev.role !== 'super_admin'))
        .map((item) => item.key)
    }));
  };

  const clearMenus = () => {
    setForm((prev) => ({
      ...prev,
      menuAccess: []
    }));
  };

  const validateForm = () => {
    if (!form.fullName.trim()) {
      return 'Ism-familya kiritilishi shart.';
    }

    if (!/^[A-Za-z0-9._-]{4,64}$/.test(form.login.trim())) {
      return 'Login kamida 4 ta belgi bo‘lishi va faqat harf, raqam, nuqta, tire yoki _ dan iborat bo‘lishi kerak.';
    }

    if (form.email.trim() && !emailPattern.test(form.email.trim())) {
      return 'Email formati noto‘g‘ri.';
    }

    if (!form.id && !form.password.trim()) {
      return 'Yangi admin uchun parol majburiy.';
    }

    if (form.password.trim() && passwordErrors.length) {
      return passwordErrors[0];
    }

    return '';
  };

  const handleActiveChange = async (admin) => {
    try {
      setErrorMessage('');
      const updated = await updateAdminUser(admin.id, {
        active: !admin.active
      });

      setAdmins((prev) => prev.map((item) => (item.id === admin.id ? updated : item)));
    } catch (error) {
      setErrorMessage(error.message || 'Admin holatini yangilab bo‘lmadi.');
    }
  };

  const handleDelete = async (admin) => {
    const confirmed = window.confirm(`${admin.fullName || admin.login} adminini o‘chirmoqchimisiz?`);

    if (!confirmed) {
      return;
    }

    try {
      setErrorMessage('');
      await deleteAdminUser(admin.id);
      setAdmins((prev) => prev.filter((item) => item.id !== admin.id));
    } catch (error) {
      setErrorMessage(error.message || 'Adminni o‘chirib bo‘lmadi.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      login: form.login.trim(),
      email: form.email.trim().toLowerCase(),
      role: form.role,
      active: form.active,
      menuAccess: form.menuAccess,
      ...(form.password.trim() ? { password: form.password.trim() } : {})
    };

    try {
      setSubmitting(true);
      setErrorMessage('');

      if (form.id) {
        const updated = await updateAdminUser(form.id, payload);
        setAdmins((prev) => prev.map((item) => (item.id === form.id ? updated : item)));
      } else {
        const created = await createAdminUser(payload);
        setAdmins((prev) => [created, ...prev]);
      }

      setMode('table');
      setForm(getEmptyForm());
      setShowPassword(false);
    } catch (error) {
      setErrorMessage(error.message || 'Adminni saqlab bo‘lmadi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (mode === 'form') {
    return (
      <MainCard
        title={form.id ? 'Admin tahrirlash' : 'Yangi admin qo‘shish'}
        secondary={
          <Button startIcon={<ArrowLeftOutlined />} variant="outlined" onClick={() => setMode('table')}>
            Orqaga
          </Button>
        }
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
            </Grid>

            <Grid item xs={12} lg={4}>
              <Stack spacing={2.5}>
                <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
                  <Box sx={{ p: 3, background: 'linear-gradient(135deg, #082e69 0%, #0f4a9d 100%)', color: '#fff' }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2.5,
                          bgcolor: 'rgba(255,255,255,0.16)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 24
                        }}
                      >
                        <UserOutlined />
                      </Box>

                      <Box>
                        <Typography variant="h4" fontWeight={900}>
                          Admin profili
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.82 }}>
                          Login, email, parol va rol
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>

                  <Box sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <TextField fullWidth label="Ism-familya" name="fullName" value={form.fullName} onChange={handleBaseChange} required />

                      <TextField
                        fullWidth
                        label="Login"
                        name="login"
                        value={form.login}
                        onChange={handleBaseChange}
                        placeholder="admin_login"
                        required
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <UserOutlined />
                            </InputAdornment>
                          )
                        }}
                      />

                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleBaseChange}
                        placeholder="admin@fstu.uz"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MailOutlined />
                            </InputAdornment>
                          )
                        }}
                      />

                      <TextField
                        fullWidth
                        label={form.id ? 'Yangi parol (ixtiyoriy)' : 'Parol'}
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleBaseChange}
                        placeholder="Kamida 12 ta belgi"
                        required={!form.id}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlined />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        helperText={
                          form.password
                            ? passwordErrors.length
                              ? passwordErrors.join(', ')
                              : 'Parol xavfsizlik talablari bo‘yicha to‘g‘ri.'
                            : '12+ belgi, katta/kichik harf, raqam va maxsus belgi talab qilinadi.'
                        }
                        error={Boolean(form.password && passwordErrors.length)}
                      />

                      <TextField select fullWidth label="Rol" name="role" value={form.role} onChange={handleBaseChange} required>
                        {roleOptions.map((role) => (
                          <MenuItem key={role.value} value={role.value}>
                            {role.label}
                          </MenuItem>
                        ))}
                      </TextField>

                      <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, bgcolor: '#fafafa' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1" fontWeight={900}>
                              Admin holati
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Admin tizimga kira oladimi yoki yo‘q.
                            </Typography>
                          </Box>

                          <Switch checked={form.active} onChange={handleBaseChange} name="active" />
                        </Stack>

                        <Chip sx={{ mt: 1.5, fontWeight: 800 }} color={form.active ? 'success' : 'default'} label={form.active ? 'Faol' : 'Nofaol'} />
                      </Paper>
                    </Stack>
                  </Box>
                </Paper>

                <Paper variant="outlined" sx={{ borderRadius: 4, p: 3, bgcolor: '#f8fbff' }}>
                  <Stack spacing={1}>
                    <Typography variant="h5" fontWeight={900} color="#082e69">
                      Ruxsatlar soni
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tanlangan menular
                    </Typography>
                    <Typography variant="h2" fontWeight={950} color="#082e69">
                      {form.menuAccess.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      jami {allMenuKeys.length} ta menudan
                    </Typography>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>

            <Grid item xs={12} lg={8}>
              <Paper variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ p: 3, bgcolor: '#f8fbff', borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
                    <Box>
                      <Typography variant="h4" fontWeight={900} color="#082e69">
                        Ko‘rinadigan menular
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                        Server va frontend ikkala qatlamda ham shu ruxsatlar tekshiriladi.
                      </Typography>
                    </Box>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                      <Button variant="outlined" onClick={selectAllMenus}>
                        Hammasini tanlash
                      </Button>
                      <Button variant="outlined" color="error" onClick={clearMenus}>
                        Tozalash
                      </Button>
                    </Stack>
                  </Stack>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Stack spacing={2.5}>
                    {menuAccessGroups.map((group) => {
                      const groupKeys = group.items.map((item) => item.key);
                      const selectedCount = groupKeys.filter((key) => form.menuAccess.includes(key)).length;
                      const allSelected = selectedCount === groupKeys.length;

                      return (
                        <Paper key={group.id} variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: '#fafafa' }}>
                          <Box sx={{ px: 2.5, py: 2, bgcolor: '#fff', borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
                              <Box>
                                <Typography variant="h5" fontWeight={900}>
                                  {group.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {selectedCount} / {group.items.length} ta menu tanlangan
                                </Typography>
                              </Box>

                              <FormControlLabel
                                control={<Checkbox checked={allSelected} indeterminate={selectedCount > 0 && !allSelected} onChange={() => toggleGroupAccess(group)} />}
                                label="Guruhni tanlash"
                              />
                            </Stack>
                          </Box>

                          <Box sx={{ p: 2.5 }}>
                            <Grid container spacing={1.5}>
                              {group.items.map((menu) => {
                                const checked = form.menuAccess.includes(menu.key);
                                const disabled = Boolean(menu.superAdminOnly && form.role !== 'super_admin');

                                return (
                                  <Grid item xs={12} md={6} key={menu.key}>
                                    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5, bgcolor: checked ? '#eef4ff' : '#fff', borderColor: checked ? '#082e69' : 'divider' }}>
                                      <FormControlLabel
                                        sx={{ m: 0, width: '100%' }}
                                        control={<Checkbox checked={checked} disabled={disabled} onChange={() => toggleMenuAccess(menu.key)} />}
                                        label={
                                          <Box>
                                            <Typography variant="subtitle2" fontWeight={900}>
                                              {menu.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {menu.url}
                                            </Typography>
                                            {disabled ? (
                                              <Typography display="block" variant="caption" color="error.main">
                                                Faqat super admin uchun
                                              </Typography>
                                            ) : null}
                                          </Box>
                                        }
                                      />
                                    </Paper>
                                  </Grid>
                                );
                              })}
                            </Grid>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Stack>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => setMode('table')}>
                  Bekor qilish
                </Button>
                <Button type="submit" variant="contained" startIcon={submitting ? <CircularProgress color="inherit" size={16} /> : <SafetyCertificateOutlined />} disabled={submitting}>
                  {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="Adminlar boshqaruvi"
      secondary={
        <Button variant="contained" startIcon={<PlusOutlined />} onClick={openCreate}>
          Admin qo‘shish
        </Button>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Admin login, email, parol, rol va qaysi menular ko‘rinishini real backend orqali boshqarish.
      </Typography>

      {errorMessage ? <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert> : null}

      <Divider sx={{ mb: 2 }} />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Login / Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Menular</TableCell>
              <TableCell>Xavfsizlik</TableCell>
              <TableCell align="center">Faol</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ py: 3 }}>
                    <CircularProgress size={20} />
                    <span>Yuklanmoqda...</span>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : null}

            {!loading &&
              adminsPagination.paginatedItems.map((admin, index) => {
                const roleMeta = getRoleMeta(admin.role);
                const isLocked = Boolean(admin.lockedUntil && new Date(admin.lockedUntil).getTime() > Date.now());

                return (
                  <TableRow hover key={admin.id}>
                    <TableCell>{adminsPagination.getRowNumber(index)}</TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: '50%',
                            bgcolor: '#eef4ff',
                            color: '#082e69',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20
                          }}
                        >
                          <TeamOutlined />
                        </Box>

                        <Box>
                          <Typography variant="subtitle1" fontWeight={900}>
                            {admin.fullName || '-'}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            ID: {admin.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Typography variant="subtitle2" fontWeight={800}>
                        {admin.login}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {admin.email || 'Email yo‘q'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip size="small" color={roleMeta.color} label={roleMeta.label} sx={{ fontWeight: 800 }} />
                    </TableCell>

                    <TableCell>
                      <Stack spacing={0.7}>
                        <Chip size="small" variant="outlined" label={`${admin.menuAccess.length} ta menu`} sx={{ width: 'fit-content', fontWeight: 800 }} />
                        <Typography variant="caption" color="text.secondary">
                          {admin.menuAccess.slice(0, 3).map(getMenuTitle).join(', ') || '—'}
                          {admin.menuAccess.length > 3 ? ' ...' : ''}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack spacing={0.7}>
                        <Chip
                          size="small"
                          color={isLocked ? 'error' : admin.failedLoginAttempts > 0 ? 'warning' : 'success'}
                          label={
                            isLocked
                              ? `Blok: ${formatDateTime(admin.lockedUntil)}`
                              : `${admin.failedLoginAttempts || 0} xato urinish`
                          }
                          sx={{ width: 'fit-content', fontWeight: 800 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Oxirgi kirish: {formatDateTime(admin.lastLoginAt)}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell align="center">
                      <Switch checked={admin.active} onChange={() => handleActiveChange(admin)} />
                    </TableCell>

                    <TableCell align="right">
                      <Tooltip title="Tahrirlash" arrow>
                        <IconButton color="primary" onClick={() => openEdit(admin)}>
                          <EditOutlined />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="O‘chirish" arrow>
                        <IconButton color="error" onClick={() => handleDelete(admin)}>
                          <DeleteOutlined />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}

            {!loading && !admins.length ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  Admin mavjud emas
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>

      <AdminTablePagination
        count={admins.length}
        page={adminsPagination.page}
        rowsPerPage={adminsPagination.rowsPerPage}
        onPageChange={adminsPagination.handlePageChange}
        onRowsPerPageChange={adminsPagination.handleRowsPerPageChange}
      />
    </MainCard>
  );
}
