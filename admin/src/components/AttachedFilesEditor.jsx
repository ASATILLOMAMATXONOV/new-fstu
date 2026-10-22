import React from 'react';

import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { DeleteOutlined, LinkOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

import { fileToDataUrl } from '../utils/file';

const langList = [
  { key: 'uz', label: 'O‘zbekcha' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' }
];

const emptyLang = {
  title: ''
};

const FILE_ACCEPT =
  '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.csv,.rtf,.odt,.ods,.odp,.jpg,.jpeg,.png,.webp';

function createRowId() {
  return `file-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getFileNameFromHref(href = '') {
  const value = String(href || '').trim();

  if (!value) {
    return '';
  }

  if (value.startsWith('data:')) {
    return '';
  }

  const cleanValue = value.split('?')[0].split('#')[0];
  const parts = cleanValue.split('/');

  return decodeURIComponent(parts[parts.length - 1] || '');
}

function normalizeFileItem(item = {}, index = 0) {
  const fallbackName =
    String(item?.name || item?.fileName || item?.filename || '').trim() ||
    getFileNameFromHref(item?.href || item?.url || item?.link) ||
    '';

  return {
    id: item?.id || createRowId(),
    href: String(item?.href || item?.url || item?.link || '').trim(),
    name: fallbackName,
    size: Number(item?.size || 0),
    mimeType: String(item?.mimeType || item?.type || '').trim(),
    order: item?.order ?? index + 1,
    active: item?.active ?? true,
    uz: {
      ...emptyLang,
      ...(item?.uz || item?.translations?.uz || {}),
      title: item?.uz?.title || item?.translations?.uz?.title || item?.title || fallbackName
    },
    ru: {
      ...emptyLang,
      ...(item?.ru || item?.translations?.ru || {})
    },
    en: {
      ...emptyLang,
      ...(item?.en || item?.translations?.en || {})
    }
  };
}

export function normalizeAttachedFiles(items = []) {
  return (items || []).map((item, index) => normalizeFileItem(item, index));
}

export function createEmptyAttachedFileItem(order = 1) {
  return normalizeFileItem(
    {
      order,
      active: true
    },
    order - 1
  );
}

async function normalizeUploadedFile(file, order) {
  const href = await fileToDataUrl(file);

  return normalizeFileItem({
    href,
    name: file.name,
    size: file.size,
    mimeType: file.type,
    order,
    uz: { title: file.name },
    ru: { title: file.name },
    en: { title: file.name },
  });
}

function pickFiles(multiple = true) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = FILE_ACCEPT;
    input.multiple = multiple;
    input.style.display = 'none';

    const cleanup = () => {
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };

    input.addEventListener(
      'change',
      () => {
        resolve(Array.from(input.files || []));
        cleanup();
      },
      { once: true }
    );

    document.body.appendChild(input);
    input.click();
  });
}

export default function AttachedFilesEditor({
  items = [],
  onChange,
  title = 'Biriktirilgan fayllar',
  description = 'Alohida yuklab olinadigan fayllarni shu yerga qo‘shing.'
}) {
  const rows = React.useMemo(() => normalizeAttachedFiles(items), [items]);

  const updateRows = (nextRows) => {
    onChange?.(normalizeAttachedFiles(nextRows));
  };

  const handleAddEmpty = () => {
    updateRows([...rows, createEmptyAttachedFileItem(rows.length + 1)]);
  };

  const handleUpload = async () => {
    const selectedFiles = await pickFiles(true);

    if (!selectedFiles.length) {
      return;
    }

    const nextRows = await Promise.all(
      selectedFiles.map((file, index) => normalizeUploadedFile(file, rows.length + index + 1))
    );

    updateRows([...rows, ...nextRows]);
  };

  const handleReplaceFile = async (rowId) => {
    const [selectedFile] = await pickFiles(false);

    if (!selectedFile) {
      return;
    }

    const replacement = await normalizeUploadedFile(selectedFile, 1);

    updateRows(
      rows.map((item) =>
        item.id === rowId
          ? {
              ...item,
              href: replacement.href,
              name: replacement.name,
              size: replacement.size,
              mimeType: replacement.mimeType,
              uz: {
                ...item.uz,
                title: item.uz?.title || replacement.name
              },
              ru: {
                ...item.ru,
                title: item.ru?.title || replacement.name
              },
              en: {
                ...item.en,
                title: item.en?.title || replacement.name
              }
            }
          : item
      )
    );
  };

  const handleRemove = (rowId) => {
    updateRows(rows.filter((item) => item.id !== rowId));
  };

  const handleBaseChange = (rowId, field, value) => {
    updateRows(rows.map((item) => (item.id === rowId ? { ...item, [field]: value } : item)));
  };

  const handleLangChange = (rowId, lang, value) => {
    updateRows(
      rows.map((item) =>
        item.id === rowId
          ? {
              ...item,
              [lang]: {
                ...item[lang],
                title: value
              }
            }
          : item
      )
    );
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: '6px',
        p: { xs: 2, md: 3 },
        bgcolor: '#fafafa'
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2.5 }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h5" fontWeight={800}>
            {title}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button variant="outlined" startIcon={<UploadOutlined />} onClick={handleUpload}>
            Fayl yuklash
          </Button>

          <Button variant="outlined" startIcon={<PlusOutlined />} onClick={handleAddEmpty}>
            Qo‘lda qo‘shish
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={2}>
        {rows.map((item, index) => (
          <Paper
            key={item.id}
            variant="outlined"
            sx={{
              borderRadius: '6px',
              overflow: 'hidden',
              bgcolor: 'background.paper'
            }}
          >
            <Box
              sx={{
                px: { xs: 2, md: 2.5 },
                py: 1.8,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={900}>
                  Fayl #{index + 1}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {item.name || 'Fayl nomi kiritilmagan'}
                </Typography>
              </Box>

              <IconButton color="error" onClick={() => handleRemove(item.id)}>
                <DeleteOutlined />
              </IconButton>
            </Box>

            <Box sx={{ p: { xs: 2, md: 2.5 } }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Fayl linki"
                    value={item.href}
                    onChange={(event) => handleBaseChange(item.id, 'href', event.target.value)}
                    placeholder="data:... yoki https://..."
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Stack direction="row" spacing={1}>
                    <TextField
                      fullWidth
                      label="Fayl nomi"
                      value={item.name}
                      onChange={(event) => handleBaseChange(item.id, 'name', event.target.value)}
                    />

                    <Button
                      variant="outlined"
                      startIcon={<UploadOutlined />}
                      onClick={() => handleReplaceFile(item.id)}
                      sx={{ minWidth: 132 }}
                    >
                      Almashtirish
                    </Button>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Tartib"
                    value={item.order}
                    onChange={(event) => handleBaseChange(item.id, 'order', event.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    label="MIME turi"
                    value={item.mimeType}
                    onChange={(event) => handleBaseChange(item.id, 'mimeType', event.target.value)}
                    placeholder="application/pdf"
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Hajmi (bayt)"
                    value={item.size}
                    onChange={(event) => handleBaseChange(item.id, 'size', event.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <Stack spacing={0.5} sx={{ height: '100%', justifyContent: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={800}>
                      Holati
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Switch
                        checked={item.active}
                        onChange={(event) => handleBaseChange(item.id, 'active', event.target.checked)}
                      />

                      <Typography variant="body2">
                        {item.active ? 'Faol' : 'Nofaol'}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>

                {langList.map((lang) => (
                  <Grid item xs={12} md={6} key={`${item.id}-${lang.key}`}>
                    <TextField
                      fullWidth
                      label={`${lang.label} title`}
                      value={item[lang.key]?.title || ''}
                      onChange={(event) => handleLangChange(item.id, lang.key, event.target.value)}
                      required={lang.key === 'uz'}
                      InputProps={{
                        startAdornment: <LinkOutlined style={{ marginRight: 8, color: '#94a3b8' }} />
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}
