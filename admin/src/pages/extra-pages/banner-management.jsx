import React, { useEffect, useRef, useState } from 'react';

// material-ui

import {

  Accordion,

  AccordionDetails,

  AccordionSummary,

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

  DownOutlined,

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

import {

  getManagedImageHelperText,

  prepareManagedImageDataUrl,

  prepareManagedImageUpload

} from 'utils/content-images';

const langList = [

  { key: 'uz', label: 'O‘zbekcha' },

  { key: 'ru', label: 'Русский' },

  { key: 'en', label: 'English' }

];

const emptyLang = {

  title: '',

  subtitle: '',

  primaryButtonText: ''

};

const createLangs = () => ({

  uz: { ...emptyLang },

  ru: { ...emptyLang },

  en: { ...emptyLang }

});

const getEmptyForm = () => ({

  id: null,

  image: '',

  imageFile: null,

  primaryButtonLink: '',

  order: '',

  active: true,

  ...createLangs()

});

const initialBanners = [];

const isExternalLink = (link) => {

  return link?.startsWith('http://') || link?.startsWith('https://');

};

const openLink = (link) => {

  if (!link) return;

  window.open(link, isExternalLink(link) ? '_blank' : '_self', 'noreferrer');

};

export default function BannerManagementPage() {

  const fileInputRef = useRef(null);

  const imageHelperText = getManagedImageHelperText('banners');

  const [banners, setBanners] = useState(initialBanners);

  const [mode, setMode] = useState('table');

  const [form, setForm] = useState(getEmptyForm());
  const [textSectionOpen, setTextSectionOpen] = useState(false);

  const bannersPagination = useTablePagination(banners);

  useEffect(() => {

    let cancelled = false;

    const loadBanners = async () => {

      try {

        const items = await fetchContentList('banners');

        if (!cancelled) {

          setBanners(items);

        }

      } catch (error) {

        console.error('Failed to load banners:', error);

      }

    };

    loadBanners();

    return () => {

      cancelled = true;

    };

  }, []);

  const openCreate = () => {

    setForm(getEmptyForm());
    setTextSectionOpen(false);

    setMode('form');

  };

  const openEdit = (banner) => {

    setForm(JSON.parse(JSON.stringify(banner)));
    setTextSectionOpen(false);

    setMode('form');

  };

  const handleBaseChange = (e) => {

    const { name, value, checked, type } = e.target;

    setForm((prev) => ({

      ...prev,

      [name]: type === 'checkbox' ? checked : value

    }));

  };

  const handleLangChange = (lang, field, value) => {

    setForm((prev) => ({

      ...prev,

      [lang]: {

        ...prev[lang],

        [field]: value

      }

    }));

  };

  const clearTextAndButtons = () => {
    setForm((prev) => ({
      ...prev,
      primaryButtonLink: '',
      uz: { ...emptyLang },
      ru: { ...emptyLang },
      en: { ...emptyLang }
    }));
    setTextSectionOpen(false);
  };

  const handleImageUpload = async (e) => {

    const file = e.target.files?.[0];

    if (!file) return;

    try {

      const { dataUrl } = await prepareManagedImageUpload(file, 'banners');

      setForm((prev) => ({

        ...prev,

        image: dataUrl,

        imageFile: file

      }));

    } catch (error) {

      window.alert(error.message);

    } finally {

      e.target.value = '';

    }

  };

  const handleDelete = async (id) => {

    try {

      await deleteContentItem('banners', id);

      setBanners((prev) => prev.filter((item) => item.id !== id));

    } catch (error) {

      console.error('Failed to delete banner:', error);

    }

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    let normalizedImage = form.image;

    try {

      normalizedImage = await prepareManagedImageDataUrl(form.image, 'banners');

    } catch (error) {

      window.alert(error.message);

      return;

    }

    const preparedForm = {

      ...form,

      image: normalizedImage,

      imageFile: null,

      title: form.uz.title.trim(),

      primaryButtonLink: form.primaryButtonLink.trim(),

      secondaryButtonLink: '',

      uz: { ...form.uz, secondaryButtonText: '' },

      ru: { ...form.ru, secondaryButtonText: '' },

      en: { ...form.en, secondaryButtonText: '' },

      order: form.order ? Number(form.order) : banners.length + 1

    };

    try {

      if (form.id) {

        const updatedItem = await updateContentItem('banners', form.id, preparedForm);

        setBanners((prev) =>

          prev.map((item) => (item.id === form.id ? updatedItem : item))

        );

      } else {

        const createdItem = await createContentItem('banners', preparedForm);

        setBanners((prev) => [createdItem, ...prev]);

      }

      setMode('table');

      setForm(getEmptyForm());

    } catch (error) {

      console.error('Failed to save banner:', error);

    }

  };

  const hasBannerText = Boolean(
    form.uz.title?.trim() || form.uz.subtitle?.trim() || form.uz.primaryButtonText?.trim()
  );

  const showPrimaryButton = Boolean(
    form.uz.primaryButtonText?.trim() && form.primaryButtonLink?.trim()
  );

  if (mode === 'form') {

    return (

      <MainCard

        title={form.id ? 'Banner tahrirlash' : 'Yangi banner qo‘shish'}

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

            {/* LIVE PREVIEW ENG YUQORIDA */}

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

                    Banner saytda taxminan shunday ko‘rinadi. Buttonlar link bilan ishlaydi.

                  </Typography>

                </Box>

                <Box

                  sx={{

                    position: 'relative',

                    minHeight: { xs: 360, md: 430 },

                    overflow: 'hidden',

                    backgroundImage: form.image ? `url(${form.image})` : 'none',

                    backgroundSize: 'cover',

                    backgroundPosition: 'center',

                    bgcolor: form.image ? 'transparent' : '#eaf1fb'

                  }}

                >

                  {hasBannerText && (
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.88) 34%, rgba(255,255,255,0.42) 58%, rgba(255,255,255,0.05) 100%)'
                      }}
                    />
                  )}

                  <IconButton

                    sx={{

                      position: 'absolute',

                      left: 18,

                      top: '50%',

                      transform: 'translateY(-50%)',

                      bgcolor: '#163f78',

                      color: '#fff',

                      width: 46,

                      height: 46,

                      zIndex: 2,

                      '&:hover': {

                        bgcolor: '#0b2f63'

                      }

                    }}

                  >

                    ‹

                  </IconButton>

                  <IconButton

                    sx={{

                      position: 'absolute',

                      right: 18,

                      top: '50%',

                      transform: 'translateY(-50%)',

                      bgcolor: '#163f78',

                      color: '#fff',

                      width: 46,

                      height: 46,

                      zIndex: 2,

                      '&:hover': {

                        bgcolor: '#0b2f63'

                      }

                    }}

                  >

                    ›

                  </IconButton>

                  {hasBannerText && (
                    <Box
                      sx={{
                        position: 'relative',
                        zIndex: 1,
                        maxWidth: 650,
                        pl: { xs: 8, md: 12 },
                        pr: { xs: 8, md: 4 },
                        py: { xs: 8, md: 10 }
                      }}
                    >
                      {form.uz.title?.trim() && (
                        <Typography
                          sx={{
                            fontSize: { xs: 34, md: 48 },
                            lineHeight: 1.15,
                            fontWeight: 900,
                            color: '#082e69',
                            mb: form.uz.subtitle?.trim() || showPrimaryButton ? 3 : 0
                          }}
                        >
                          {form.uz.title}
                        </Typography>
                      )}

                      {form.uz.subtitle?.trim() && (
                        <Typography
                          sx={{
                            fontSize: { xs: 16, md: 18 },
                            lineHeight: 1.75,
                            color: '#24436d',
                            fontWeight: 600,
                            maxWidth: 560,
                            mb: showPrimaryButton ? 4 : 0
                          }}
                        >
                          {form.uz.subtitle}
                        </Typography>
                      )}

                      {showPrimaryButton && (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                          <Button
                            component="a"
                            href={form.primaryButtonLink}
                            target={isExternalLink(form.primaryButtonLink) ? '_blank' : '_self'}
                            rel="noreferrer"
                            variant="contained"
                            sx={{
                              bgcolor: '#082e69',
                              color: '#fff',
                              px: 3,
                              py: 1.5,
                              borderRadius: '6px',
                              fontWeight: 800,
                              boxShadow: '0 10px 22px rgba(8, 46, 105, 0.25)',
                              '&:hover': { bgcolor: '#061f49' }
                            }}
                          >
                            {form.uz.primaryButtonText} →
                          </Button>
                        </Stack>
                      )}
                    </Box>
                  )}

                </Box>

              </Paper>

            </Grid>

            {/* BANNER RASMI */}

            <Grid item xs={12}>
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: '6px',
                  p: { xs: 2, md: 3 },
                  bgcolor: 'background.paper'
                }}
              >
                <Stack spacing={2.5}>
                  <Box>
                    <Typography variant="h5" fontWeight={800}>
                      Banner rasmi
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {imageHelperText} Rasmning o‘zini ham title va buttonlarsiz saqlash mumkin.
                    </Typography>
                  </Box>

                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2.5}
                    alignItems={{ xs: 'stretch', md: 'center' }}
                  >
                    <Box
                      sx={{
                        width: { xs: '100%', md: 320 },
                        height: 180,
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: '1px dashed',
                        borderColor: form.image ? 'divider' : 'primary.light',
                        bgcolor: '#f7f9fc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {form.image ? (
                        <Box
                          component="img"
                          src={form.image}
                          alt="Banner preview"
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Stack alignItems="center" spacing={1}>
                          <UploadOutlined style={{ fontSize: 28 }} />
                          <Typography variant="body2" color="text.secondary">
                            Rasm tanlanmagan
                          </Typography>
                        </Stack>
                      )}
                    </Box>

                    <Stack spacing={1.5} sx={{ flex: 1 }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                      />

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Button
                          variant="contained"
                          startIcon={<UploadOutlined />}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {form.image ? 'Rasmni almashtirish' : 'Rasm yuklash'}
                        </Button>

                        {form.image && (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                image: '',
                                imageFile: null
                              }))
                            }
                          >
                            Rasmni olib tashlash
                          </Button>
                        )}

                        <Button
                          variant="outlined"
                          color="secondary"
                          onClick={clearTextAndButtons}
                        >
                          Faqat rasm
                        </Button>
                      </Stack>

                      <Typography variant="caption" color="text.secondary">
                        Tavsiya: keng formatdagi sifatli rasm ishlating. Faqat rasm kerak bo‘lsa, title va buttonlar bo‘sh qoladi.
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <TextField
                        fullWidth
                        label="Rasm URL (ixtiyoriy)"
                        name="image"
                        value={form.image}
                        onChange={handleBaseChange}
                        placeholder="https://..."
                        helperText="Rasmni yuklash yoki tashqi URL kiritish mumkin."
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
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

                    <Grid item xs={12} sm={6} md={2}>
                      <Box
                        sx={{
                          minHeight: 56,
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          px: 1
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
                </Stack>
              </Paper>
            </Grid>

            {/* TITLE VA MATNLAR */}

            <Grid item xs={12}>
              <Accordion
                expanded={textSectionOpen}
                onChange={(_, expanded) => setTextSectionOpen(expanded)}
                disableGutters
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '6px !important',
                  overflow: 'hidden',
                  '&:before': { display: 'none' }
                }}
              >
                <AccordionSummary
                  expandIcon={<DownOutlined />}
                  sx={{
                    px: { xs: 2, md: 3 },
                    py: 0.75,
                    bgcolor: '#fafafa',
                    '& .MuiAccordionSummary-content': { my: 1.25 }
                  }}
                >
                  <Box>
                    <Typography variant="h5" fontWeight={800}>
                      Title va matnlar
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ixtiyoriy. Kerak bo‘lsa ochib title, subtitle va button matnlarini kiriting.
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ p: { xs: 2, md: 3 }, pt: 2.5 }}>
                  <Stack spacing={3}>
                    {langList.map((lang) => (
                      <Paper
                        key={lang.key}
                        variant="outlined"
                        sx={{ borderRadius: '6px', p: { xs: 2, md: 2.5 } }}
                      >
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                          {lang.label}
                        </Typography>

                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Katta title (ixtiyoriy)"
                              value={form[lang.key].title}
                              onChange={(e) => handleLangChange(lang.key, 'title', e.target.value)}
                              placeholder="Kelajagingizni FSTU bilan boshlang"
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              multiline
                              minRows={3}
                              label="Subtitle / izoh (ixtiyoriy)"
                              value={form[lang.key].subtitle}
                              onChange={(e) => handleLangChange(lang.key, 'subtitle', e.target.value)}
                              placeholder="Xalqaro tajriba asosida sifatli ta’lim oling..."
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Button matni (ixtiyoriy)"
                              value={form[lang.key].primaryButtonText}
                              onChange={(e) =>
                                handleLangChange(lang.key, 'primaryButtonText', e.target.value)
                              }
                              placeholder="Biz haqimizda"
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* BUTTON LINKLARI */}

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

                    Button linki

                  </Typography>

                  <Typography variant="body2" color="text.secondary">

                    Ixtiyoriy. Button ishlatilsa, bosilganda ochiladigan linkni kiriting.

                  </Typography>

                </Stack>

                <Grid container spacing={2}>

                  <Grid item xs={12}>

                    <TextField

                      fullWidth

                      label="Button linki (ixtiyoriy)"

                      name="primaryButtonLink"

                      value={form.primaryButtonLink}

                      onChange={handleBaseChange}

                      placeholder="/about"

                      helperText="Masalan: /about yoki https://hemis.fstu.uz"

                    />

                  </Grid>

                </Grid>

              </Paper>

            </Grid>

            {/* SAQLASH */}

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

      title="Banner qo‘yish"

      secondary={

        <Button

          variant="contained"

          startIcon={<PlusOutlined />}

          onClick={openCreate}

        >

          Banner qo‘shish

        </Button>

      }

    >

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>

        Bosh sahifadagi slider banner: rasm, title, subtitle, button matni va

        button linkini boshqarish. Title va buttonlarsiz faqat rasm ham qo‘yish mumkin.

      </Typography>

      <Divider sx={{ mb: 2 }} />

      <TableContainer component={Paper} variant="outlined">

        <Table>

          <TableHead>

            <TableRow>

              <TableCell>#</TableCell>

              <TableCell>Preview</TableCell>

              <TableCell>Title</TableCell>

              <TableCell>Button</TableCell>

              <TableCell>Link</TableCell>

              <TableCell>Tartib</TableCell>

              <TableCell>Status</TableCell>

              <TableCell align="right">Amallar</TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {bannersPagination.paginatedItems.map((banner, index) => (

              <TableRow hover key={banner.id}>

                <TableCell>{bannersPagination.getRowNumber(index)}</TableCell>

                <TableCell>

                  <Box

                    sx={{

                      width: 180,

                      height: 90,

                      borderRadius: '6px',

                      overflow: 'hidden',

                      border: '1px solid',

                      borderColor: 'divider',

                      bgcolor: '#f5f5f5',

                      position: 'relative'

                    }}

                  >

                    {banner.image ? (

                      <Box

                        component="img"

                        src={banner.image}

                        alt={banner.uz.title || 'Banner'}

                        sx={{

                          width: '100%',

                          height: '100%',

                          objectFit: 'cover'

                        }}

                      />

                    ) : (

                      <Box

                        sx={{

                          height: '100%',

                          display: 'flex',

                          alignItems: 'center',

                          justifyContent: 'center'

                        }}

                      >

                        <Typography variant="caption" color="text.secondary">

                          No image

                        </Typography>

                      </Box>

                    )}

                  </Box>

                </TableCell>

                <TableCell>

                  <Box>

                    <Typography variant="subtitle1" fontWeight={700}>

                      {banner.uz.title || 'Faqat rasm'}

                    </Typography>

                    <Typography variant="caption" color="text.secondary">

                      {banner.uz.subtitle || (!banner.uz.title ? 'Title va matn yo‘q' : '-')}

                    </Typography>

                    <Typography

                      variant="caption"

                      color="text.secondary"

                      sx={{ display: 'block', mt: 0.5 }}

                    >

                      RU: {banner.ru.title || '-'} | EN: {banner.en.title || '-'}

                    </Typography>

                  </Box>

                </TableCell>

                <TableCell>

                  <Chip

                    size="small"

                    label={banner.uz.primaryButtonText || 'Button yo‘q'}

                  />

                </TableCell>

                <TableCell>

                  <Typography variant="caption">

                    {banner.primaryButtonLink || '-'}

                  </Typography>

                </TableCell>

                <TableCell>{banner.order}</TableCell>

                <TableCell>

                  <Chip

                    size="small"

                    color={banner.active ? 'success' : 'default'}

                    label={banner.active ? 'Faol' : 'Nofaol'}

                  />

                </TableCell>

                <TableCell align="right">

                  {banner.primaryButtonLink && (

                    <IconButton

                      color="secondary"

                      onClick={() => openLink(banner.primaryButtonLink)}

                    >

                      <EyeOutlined />

                    </IconButton>

                  )}

                  <IconButton color="primary" onClick={() => openEdit(banner)}>

                    <EditOutlined />

                  </IconButton>

                  <IconButton color="error" onClick={() => handleDelete(banner.id)}>

                    <DeleteOutlined />

                  </IconButton>

                </TableCell>

              </TableRow>

            ))}

            {!banners.length && (

              <TableRow>

                <TableCell colSpan={8} align="center">

                  Banner mavjud emas

                </TableCell>

              </TableRow>

            )}

          </TableBody>

        </Table>

      </TableContainer>

      <AdminTablePagination

        count={banners.length}

        page={bannersPagination.page}

        rowsPerPage={bannersPagination.rowsPerPage}

        onPageChange={bannersPagination.handlePageChange}

        onRowsPerPageChange={bannersPagination.handleRowsPerPageChange}

      />

    </MainCard>

  );

}
