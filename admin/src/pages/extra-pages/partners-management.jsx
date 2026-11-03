import React, { useEffect, useRef, useState } from 'react';

// material-ui
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
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
  Typography,
  FormControlLabel
} from '@mui/material';

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons';

// project import
import AdminTablePagination from 'components/AdminTablePagination';
import MainCard from 'components/MainCard';
import { useTablePagination } from 'hooks/useTablePagination';
import {
  createContentItem,
  deleteContentItem,
  fetchContentList,
  updateContentItem
} from 'api/cms';
import { fileToDataUrl } from 'utils/file';

const getEmptyForm = () => ({
  id: null,
  image: '',
  imageFile: null,
  title: '',
  countryName: '',
  address: '',
  link: '',
  order: '',
  active: true
});

const initialPartners = [];

const isExternalLink = (link) => {
  return link?.startsWith('http://') || link?.startsWith('https://');
};

const openLink = (link) => {
  if (!link) return;

  window.open(link, isExternalLink(link) ? '_blank' : '_self', 'noreferrer');
};

export default function PartnersManagementPage({
  resource = 'partners',
  international = false
} = {}) {
  const fileInputRef = useRef(null);

  const [partners, setPartners] = useState(initialPartners);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(getEmptyForm());

  useEffect(() => {
    let cancelled = false;

    const loadPartners = async () => {
      try {
        const items = await fetchContentList(resource);

        if (!cancelled) {
          setPartners(items);
        }
      } catch (error) {
        console.error('Failed to load partners:', error);
      }
    };

    loadPartners();

    return () => {
      cancelled = true;
    };
  }, [resource]);

  const sortedPartners = [...partners].sort(
    (a, b) => Number(a.order || 0) - Number(b.order || 0)
  );
  const partnersPagination = useTablePagination(sortedPartners);

  const activePartners = sortedPartners.filter((item) => item.active);

  const openCreate = () => {
    setForm(getEmptyForm());
    setMode('form');
  };

  const openEdit = (partner) => {
    setForm({
      ...getEmptyForm(),
      ...partner,
      countryName: partner.countryName || partner.country || partner.countryCode || '',
      address: partner.address || partner.universityAddress || '',
      imageFile: null
    });

    setMode('form');
  };

  const handleBaseChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const setImageFile = async (file) => {
    if (!file) return;

    const imageUrl = await fileToDataUrl(file);

    setForm((prev) => ({
      ...prev,
      image: imageUrl,
      imageFile: file
    }));
  };

  const handleImageUpload = async (e) => {
    await setImageFile(e.target.files?.[0]);
  };

  const handleImageDrop = async (e) => {
    e.preventDefault();
    await setImageFile(e.dataTransfer.files?.[0]);
  };

  const handleDelete = async (id) => {
    try {
      await deleteContentItem(resource, id);
      setPartners((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete partner:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const preparedForm = {
      ...form,
      imageFile: null,
      title: form.title.trim(),
      countryName: form.countryName.trim(),
      country: form.countryName.trim(),
      address: form.address.trim(),
      image: form.image.trim(),
      link: form.link.trim(),
      order: form.order ? Number(form.order) : partners.length + 1
    };

    try {
      if (form.id) {
        const updatedItem = await updateContentItem(resource, form.id, preparedForm);
        setPartners((prev) =>
          prev.map((item) => (item.id === form.id ? updatedItem : item))
        );
      } else {
        const createdItem = await createContentItem(resource, preparedForm);
        setPartners((prev) => [createdItem, ...prev]);
      }

      setMode('table');
      setForm(getEmptyForm());
    } catch (error) {
      console.error('Failed to save partner:', error);
    }
  };

  if (mode === 'form') {
    return (
      <MainCard
        title={international
          ? (form.id ? 'Universitetni tahrirlash' : 'Yangi hamkor universitet qo‘shish')
          : (form.id ? 'Hamkorni tahrirlash' : 'Yangi hamkor qo‘shish')}
        secondary={
          <Button
            startIcon={<ArrowLeftOutlined />}
            variant="outlined"
            onClick={() => setMode('table')}
          >
            Orqaga
          </Button>
        }
      >
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: '6px',
                  p: { xs: 2, md: 3 },
                  bgcolor: '#fafafa'
                }}
              >
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" fontWeight={800}>
                    {international ? 'Universitet logosi' : 'Hamkor logosi / rasmi'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Rasm yuklash maydoniga bosing yoki rasmni shu joyga tashlang.
                  </Typography>
                </Stack>


                <input
                  ref={fileInputRef}
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                />

                <Box
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleImageDrop}
                  onDragOver={(e) => e.preventDefault()}
                  sx={{
                    minHeight: 260,
                    borderRadius: '6px',
                    border: '2px dashed',
                    borderColor: form.image ? 'primary.main' : 'divider',
                    bgcolor: 'background.paper',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  {form.image ? (
                    <>
                      <Box
                        component="img"
                        src={form.image}
                        alt="Hamkor logosi"
                        sx={{
                          width: '100%',
                          height: 260,
                          objectFit: 'contain',
                          p: 3,
                          bgcolor: '#fff'
                        }}
                      />

                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          bgcolor: 'rgba(8, 46, 105, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: '0.2s',
                          '&:hover': {
                            opacity: 1
                          }
                        }}
                      >
                        <Button
                          variant="contained"
                          startIcon={<UploadOutlined />}
                          sx={{
                            bgcolor: '#082e69',
                            '&:hover': {
                              bgcolor: '#061f49'
                            }
                          }}
                        >
                          Rasmni almashtirish
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Stack spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: '50%',
                          bgcolor: '#eef4ff',
                          color: '#082e69',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 30
                        }}
                      >
                        <UploadOutlined />
                      </Box>

                      <Typography variant="h5" fontWeight={800}>
                        Logo / rasm yuklash
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        PNG, JPG, JPEG, SVG yoki WEBP formatda rasm tanlang
                      </Typography>

                      <Button variant="outlined" startIcon={<UploadOutlined />}>
                        Fayl tanlash
                      </Button>
                    </Stack>
                  )}
                </Box>

                {form.image && (
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                    sx={{ mt: 2 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Rasm tanlandi. Almashtirish uchun rasm ustiga bosing.
                    </Typography>

                    <Button
                      variant="outlined"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        setForm((prev) => ({
                          ...prev,
                          image: '',
                          imageFile: null
                        }));
                      }}
                    >
                      Rasmni olib tashlash
                    </Button>
                  </Stack>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: '6px',
                  p: { xs: 2, md: 3 },
                  bgcolor: '#fafafa'
                }}
              >
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" fontWeight={800}>
                    Ma’lumotlar
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    {international
                      ? 'Universitet nomi, davlati, manzili, rasmiy sayti va statusini kiriting.'
                      : 'Hamkor nomi, linki, tartibi va statusini kiriting.'}
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={international ? 6 : 5}>
                    <TextField
                      fullWidth
                      label={international ? 'Universitet nomi' : 'Title'}
                      name="title"
                      value={form.title}
                      onChange={handleBaseChange}
                      placeholder="Korea International Cooperation Agency"
                      required
                    />
                  </Grid>

                  {international && <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Davlat"
                      name="countryName"
                      value={form.countryName}
                      onChange={handleBaseChange}
                      placeholder="South Korea"
                      helperText="Xaritada aniq chiqishi uchun davlatning xalqaro nomini kiriting. Masalan: South Korea, China, Germany."
                      required
                    />
                  </Grid>}

                  {international && <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Universitet manzili"
                      name="address"
                      value={form.address}
                      onChange={handleBaseChange}
                      placeholder="Seoul, Republic of Korea"
                    />
                  </Grid>}

                  <Grid item xs={12} md={international ? 6 : 5}>
                    <TextField
                      fullWidth
                      label={international ? 'Rasmiy sayt' : 'Link'}
                      name="link"
                      value={form.link}
                      onChange={handleBaseChange}
                      placeholder="https://www.koica.go.kr"
                      helperText="Hamkor saytiga o‘tish linki."
                    />
                  </Grid>

                  <Grid item xs={12} md={international ? 3 : 1}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Tartib"
                      name="order"
                      value={form.order}
                      onChange={handleBaseChange}
                      placeholder="1"
                    />
                  </Grid>

                  <Grid item xs={12} md={international ? 3 : 1}>
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={form.active}
                            onChange={handleBaseChange}
                            name="active"
                          />
                        }
                        label="Faol"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}
              >
                <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#fafafa' }}>
                  <Typography variant="h5" fontWeight={800}>
                    Live preview
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Hamkor cardi saytda taxminan shunday ko‘rinadi.
                  </Typography>
                </Box>

                <Box sx={{ p: { xs: 2, md: 3 } }}>
                  <Box
                    sx={{
                      maxWidth: 320,
                      minHeight: 180,
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      boxShadow: '0 16px 35px rgba(15, 23, 42, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 3,
                      textAlign: 'center'
                    }}
                  >
                    <Box
                      sx={{
                        width: 140,
                        height: 80,
                        borderRadius: '6px',
                        bgcolor: '#f8fafc',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        overflow: 'hidden'
                      }}
                    >
                      {form.image ? (
                        <Box
                          component="img"
                          src={form.image}
                          alt={form.title || 'partner'}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            p: 1
                          }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Logo
                        </Typography>
                      )}
                    </Box>

                    <Typography
                      sx={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: '#082e69',
                        lineHeight: 1.3
                      }}
                    >
                      {form.title || (international ? 'Universitet nomi' : 'Hamkor nomi')}
                    </Typography>

                    {international && form.countryName && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                        {form.countryName}{form.address ? ` · ${form.address}` : ''}
                      </Typography>
                    )}

                    {form.link && (
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => openLink(form.link)}
                      >
                        Saytga o‘tish
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                justifyContent="flex-end"
              >
                <Button variant="outlined" onClick={() => setMode('table')}>
                  Bekor qilish
                </Button>

                <Button type="submit" variant="contained">
                  Saqlash
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
      title={international ? 'Global ta’lim hamkorlari' : 'Xalqaro hamkorlarimiz'}
      secondary={
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={openCreate}
        >
          {international ? 'Universitet qo‘shish' : 'Hamkor qo‘shish'}
        </Button>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {international
          ? 'Universitetni davlatga bog‘lang. Frontendda davlat bosilganda unga tegishli universitetlar chiqadi.'
          : 'Hamkor logosi, title va linklarini boshqarish.'}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Paper
        variant="outlined"
        sx={{
          borderRadius: '6px',
          p: { xs: 2, md: 3 },
          mb: 3,
          bgcolor: '#fafafa'
        }}
      >
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={800}>
            Umumiy preview
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Faol hamkorlar tartib bo‘yicha ko‘rsatiladi.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 2
          }}
        >
          {activePartners.map((partner) => (
            <Box
              key={partner.id}
              onClick={() => openLink(partner.link)}
              sx={{
                minHeight: 170,
                borderRadius: '6px',
                bgcolor: '#fff',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 12px 26px rgba(15, 23, 42, 0.06)',
                cursor: partner.link ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2.5,
                textAlign: 'center',
                transition: '0.2s',
                '&:hover': {
                  transform: partner.link ? 'translateY(-3px)' : 'none',
                  boxShadow: partner.link
                    ? '0 18px 35px rgba(15, 23, 42, 0.12)'
                    : '0 12px 26px rgba(15, 23, 42, 0.06)'
                }
              }}
            >
              <Box
                sx={{
                  width: 140,
                  height: 80,
                  borderRadius: '6px',
                  bgcolor: '#f8fafc',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  overflow: 'hidden'
                }}
              >
                {partner.image ? (
                  <Box
                    component="img"
                    src={partner.image}
                    alt={partner.title}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      p: 1
                    }}
                  />
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Logo
                  </Typography>
                )}
              </Box>

              <Typography
                sx={{
                  fontSize: 16,
                  fontWeight: 900,
                  color: '#082e69',
                  lineHeight: 1.35
                }}
              >
                {partner.title || '-'}
              </Typography>
            </Box>
          ))}

          {!activePartners.length && (
            <Typography color="text.secondary">Faol hamkor mavjud emas</Typography>
          )}
        </Box>
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ minWidth: international ? 1150 : 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Logo</TableCell>
              <TableCell>{international ? 'Universitet' : 'Title'}</TableCell>
              {international && <TableCell>Davlat</TableCell>}
              {international && <TableCell>Manzil</TableCell>}
              <TableCell>{international ? 'Rasmiy sayt' : 'Link'}</TableCell>
              <TableCell>Tartib</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {partnersPagination.paginatedItems.map((partner, index) => (
              <TableRow hover key={partner.id}>
                <TableCell>{partnersPagination.getRowNumber(index)}</TableCell>

                <TableCell>
                  <Box
                    sx={{
                      width: 100,
                      height: 58,
                      borderRadius: '6px',
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {partner.image ? (
                      <Box
                        component="img"
                        src={partner.image}
                        alt={partner.title}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          p: 1
                        }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No logo
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {partner.title || '-'}
                  </Typography>
                </TableCell>

                {international && <TableCell>{partner.countryName || partner.country || partner.countryCode || '—'}</TableCell>}
                {international && <TableCell>{partner.address || partner.universityAddress || '—'}</TableCell>}

                <TableCell>
                  <Typography variant="caption" color="text.secondary">
                    {partner.link || '-'}
                  </Typography>
                </TableCell>

                <TableCell>{partner.order}</TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    color={partner.active ? 'success' : 'default'}
                    label={partner.active ? 'Faol' : 'Nofaol'}
                  />
                </TableCell>

                <TableCell align="right">
                  {partner.link && (
                    <IconButton
                      color="secondary"
                      onClick={() => openLink(partner.link)}
                    >
                      <EyeOutlined />
                    </IconButton>
                  )}

                  <IconButton color="primary" onClick={() => openEdit(partner)}>
                    <EditOutlined />
                  </IconButton>

                  <IconButton color="error" onClick={() => handleDelete(partner.id)}>
                    <DeleteOutlined />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {!partners.length && (
              <TableRow>
                <TableCell colSpan={international ? 9 : 7} align="center">
                  {international ? 'Hamkor universitetlar mavjud emas' : 'Hamkor mavjud emas'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AdminTablePagination
        count={sortedPartners.length}
        page={partnersPagination.page}
        rowsPerPage={partnersPagination.rowsPerPage}
        onPageChange={partnersPagination.handlePageChange}
        onRowsPerPageChange={partnersPagination.handleRowsPerPageChange}
      />
    </MainCard>
  );
}
