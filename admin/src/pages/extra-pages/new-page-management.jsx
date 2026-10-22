import React, { useEffect, useState } from 'react';

// material-ui
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
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
  Tooltip,
  Typography
} from '@mui/material';

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  LinkOutlined,
  PlusOutlined
} from '@ant-design/icons';

// project import
import AttachedFilesEditor, { normalizeAttachedFiles } from 'components/AttachedFilesEditor';
import AdminTablePagination from 'components/AdminTablePagination';
import LinkTableEditor, { normalizeLinkTableItems } from 'components/LinkTableEditor';
import MainCard from 'components/MainCard';
import TinyMceField from 'components/editor/TinyMceField';
import { useTablePagination } from 'hooks/useTablePagination';
import {
  createContentItem,
  deleteContentItem,
  fetchContentList,
  updateContentItem
} from 'api/cms';

const langList = [
  { key: 'uz', label: 'O‘zbekcha' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' }
];

const emptyLang = {
  title: '',
  content: ''
};

const createLangs = () => ({
  uz: { ...emptyLang },
  ru: { ...emptyLang },
  en: { ...emptyLang }
});

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/o‘/g, 'o')
    .replace(/g‘/g, 'g')
    .replace(/ʻ/g, '')
    .replace(/'/g, '')
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const createLink = (id) => {
  if (!id) {
    return '';
  }

  return `/pages/${id}`;
};

const getEmptyForm = () => ({
  id: null,
  slug: '',
  link: '',
  order: '',
  active: true,
  files: [],
  linkTable: [],
  ...createLangs()
});

const initialPages = [];

const normalizePageItem = (item = {}) => {
  const fallbackSlug = item.slug || slugify(item.uz?.title || item.title || '');
  const fallbackLink = createLink(item.id);

  return {
    ...getEmptyForm(),
    ...item,
    slug: fallbackSlug,
    link: fallbackLink,
    order: item.order ?? '',
    active: item.active ?? true,
    files: normalizeAttachedFiles(item.files || []),
    linkTable: normalizeLinkTableItems(item.linkTable || []),
    uz: { ...emptyLang, title: item.uz?.title || item.title || '', content: item.uz?.content || '' },
    ru: { ...emptyLang, ...(item.ru || {}) },
    en: { ...emptyLang, ...(item.en || {}) }
  };
};

const copyToClipboard = async (text) => {
  if (!text) return false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const copied = document.execCommand('copy');
    textarea.remove();

    return copied;
  } catch (error) {
    return false;
  }
};

export default function NewPageManagementPage() {
  const [pages, setPages] = useState(initialPages);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(getEmptyForm());
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadPages = async () => {
      try {
        const items = await fetchContentList('pages');

        if (!cancelled) {
          setPages(items.map(normalizePageItem));
        }
      } catch (error) {
        console.error('Failed to load pages:', error);
      }
    };

    loadPages();

    return () => {
      cancelled = true;
    };
  }, []);

  const sortedPages = [...pages].sort(
    (a, b) => Number(a.order || 0) - Number(b.order || 0)
  );
  const pagesPagination = useTablePagination(sortedPages);

  const openCreate = () => {
    setForm(getEmptyForm());
    setMode('form');
  };

  const openEdit = (page) => {
    setForm({
      ...normalizePageItem(page)
    });

    setMode('form');
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

  const handleBaseChange = (e) => {
    const { name, value, checked, type } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLinkTableChange = (nextItems) => {
    setForm((prev) => ({
      ...prev,
      linkTable: nextItems
    }));
  };

  const handleFilesChange = (nextItems) => {
    setForm((prev) => ({
      ...prev,
      files: nextItems
    }));
  };

  const handleDelete = async (id) => {
    try {
      await deleteContentItem('pages', id);
      setPages((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  };

  const handleActiveChange = async (page) => {
    const nextActive = !page.active;

    try {
      const updatedItem = await updateContentItem('pages', page.id, {
        ...page,
        active: nextActive,
        title: page.uz?.title || page.title || '',
        slug: page.slug || slugify(page.uz?.title || page.title || ''),
        link: createLink(page.id)
      });

      setPages((prev) =>
        prev.map((item) => (item.id === page.id ? normalizePageItem(updatedItem) : item))
      );
    } catch (error) {
      console.error('Failed to change page status:', error);
    }
  };

  const handleCopyLink = async (page) => {
    const copied = await copyToClipboard(page.link);

    if (copied) {
      setCopiedId(page.id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1200);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const generatedSlug =
      form.slug || slugify(form.uz.title || form.ru.title || form.en.title || '');
    const generatedLink = createLink(form.id);

    const preparedForm = {
      ...form,
      title: form.uz.title.trim(),
      slug: generatedSlug,
      link: generatedLink,
      order: form.order ? Number(form.order) : pages.length + 1
    };

    try {
      if (form.id) {
        const updatedItem = await updateContentItem('pages', form.id, preparedForm);
        setPages((prev) =>
          prev.map((item) => (item.id === form.id ? normalizePageItem(updatedItem) : item))
        );
      } else {
        const createdItem = await createContentItem('pages', preparedForm);
        const linkedItem = await updateContentItem('pages', createdItem.id, {
          ...createdItem,
          title: createdItem.uz?.title || createdItem.title || form.uz.title.trim(),
          slug: createdItem.slug || generatedSlug,
          link: createLink(createdItem.id)
        });

        setPages((prev) => [normalizePageItem(linkedItem), ...prev]);
      }

      setMode('table');
      setForm(getEmptyForm());
    } catch (error) {
      console.error('Failed to save page:', error);
    }
  };

  if (mode === 'form') {
    return (
      <MainCard
        title={form.id ? 'Page tahrirlash' : 'Yangi page qo‘shish'}
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
              <LinkTableEditor
                items={form.linkTable}
                onChange={handleLinkTableChange}
                description="Frontendda sahifa contentidan yuqorida chiqadigan linkli jadval satrlarini kiriting."
              />
            </Grid>

            <Grid item xs={12}>
              <AttachedFilesEditor
                items={form.files}
                onChange={handleFilesChange}
                description="Sahifa contentidan alohida ko‘rinadigan yuklab olish fayllarini shu yerga joylang."
              />
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
                    Asosiy sozlamalar
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Link preview, tartib va statusni boshqaring.
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={7}>
                    <TextField
                      fullWidth
                      label="Link preview"
                      value={form.link || createLink(form.id)}
                      InputProps={{ readOnly: true }}
                      helperText="Saqlangandan keyin link avtomatik `/pages/id` ko‘rinishida yaratiladi."
                    />
                  </Grid>

                  <Grid item xs={12} md={2}>
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

                  <Grid item xs={12} md={3}>
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
                  p: { xs: 2, md: 3 },
                  bgcolor: '#fafafa'
                }}
              >
                <Stack spacing={0.5} sx={{ mb: 2.5 }}>
                  <Typography variant="h5" fontWeight={800}>
                    Titlelar
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Har bir til uchun sahifa titlelarini pastma-past kiriting.
                  </Typography>
                </Stack>

                <Grid container spacing={2}>
                  {langList.map((lang) => (
                    <Grid item xs={12} key={lang.key}>
                      <TextField
                        fullWidth
                        label={`${lang.label} title`}
                        value={form[lang.key].title}
                        onChange={(e) =>
                          handleLangChange(lang.key, 'title', e.target.value)
                        }
                        required={lang.key === 'uz'}
                      />
                    </Grid>
                  ))}
                </Grid>
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
                    Contentlar
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Har bir til uchun page contentini kiriting.
                  </Typography>
                </Stack>

                <Stack spacing={3}>
                  {langList.map((lang) => (
                    <Paper
                      key={lang.key}
                      variant="outlined"
                      sx={{
                        borderRadius: '6px',
                        overflow: 'hidden',
                        bgcolor: 'background.paper'
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: 'background.paper',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          px: { xs: 2, md: 2.5 },
                          py: 2
                        }}
                      >
                        <Typography variant="h6" fontWeight={800}>
                          {lang.label} content
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Shu til uchun sahifa matni
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          p: { xs: 2, md: 2.5 },
                          width: '100%',

                          '& .tox-tinymce': {
                            minHeight: '420px !important',
                            borderRadius: '6px !important'
                          },

                          '& .tox-editor-header': {
                            position: 'static !important',
                            top: 'auto !important',
                            zIndex: '1 !important'
                          },

                          '& .tox-toolbar-overlord': {
                            position: 'static !important'
                          },

                          '& .tox-toolbar': {
                            position: 'static !important'
                          },

                          '& .tox-menubar': {
                            position: 'static !important'
                          }
                        }}
                      >
                        <TinyMceField
                          value={form[lang.key].content}
                          onChange={(value) =>
                            handleLangChange(lang.key, 'content', value)
                          }
                          height={420}
                        />
                      </Box>
                    </Paper>
                  ))}
                </Stack>
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
      title="New Page"
      secondary={
        <Button
          variant="contained"
          startIcon={<PlusOutlined />}
          onClick={openCreate}
        >
          Page qo‘shish
        </Button>
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sahifalar title, content va linklarini boshqarish.
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Title</TableCell>
              <TableCell align="center">Link</TableCell>
              <TableCell align="center">Faol</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pagesPagination.paginatedItems.map((page, index) => (
              <TableRow hover key={page.id}>
                <TableCell>{pagesPagination.getRowNumber(index)}</TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {page.uz.title || '-'}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 0.5 }}
                    >
                      RU: {page.ru.title || '-'} | EN: {page.en.title || '-'}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="center">
                  <Tooltip
                    arrow
                    title={
                      copiedId === page.id
                        ? 'Nusxa olindi'
                        : page.link || 'Link mavjud emas'
                    }
                  >
                    <span>
                      <IconButton
                        disabled={!page.link}
                        color={copiedId === page.id ? 'success' : 'secondary'}
                        onClick={() => handleCopyLink(page)}
                        sx={{
                          border: '1px solid',
                          borderColor:
                            copiedId === page.id ? 'success.main' : 'divider',
                          bgcolor:
                            copiedId === page.id ? 'success.lighter' : 'transparent',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <LinkOutlined />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>

                <TableCell align="center">
                  <Switch
                    checked={page.active}
                    onChange={() => handleActiveChange(page)}
                  />
                </TableCell>

                <TableCell align="right">
                  <IconButton color="primary" onClick={() => openEdit(page)}>
                    <EditOutlined />
                  </IconButton>

                  <IconButton color="error" onClick={() => handleDelete(page.id)}>
                    <DeleteOutlined />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {!pages.length && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Page mavjud emas
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AdminTablePagination
        count={sortedPages.length}
        page={pagesPagination.page}
        rowsPerPage={pagesPagination.rowsPerPage}
        onPageChange={pagesPagination.handlePageChange}
        onRowsPerPageChange={pagesPagination.handleRowsPerPageChange}
      />
    </MainCard>
  );
}
