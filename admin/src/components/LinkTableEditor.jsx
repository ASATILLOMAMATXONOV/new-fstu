import React from 'react';

import { Box, Button, Grid, IconButton, Paper, Stack, Switch, TextField, Typography } from '@mui/material';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const langList = [
  { key: 'uz', label: 'O‘zbekcha' },
  { key: 'ru', label: 'Русский' },
  { key: 'en', label: 'English' }
];

const emptyLang = {
  title: ''
};

function createRowId() {
  return `link-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeLinkTableItems(items = []) {
  return (items || []).map((item, index) => ({
    id: item?.id || createRowId(),
    href: String(item?.href || item?.link || '').trim(),
    order: item?.order ?? index + 1,
    active: item?.active ?? true,
    uz: {
      ...emptyLang,
      ...(item?.uz || item?.translations?.uz || {}),
      title: item?.uz?.title || item?.translations?.uz?.title || item?.title || ''
    },
    ru: {
      ...emptyLang,
      ...(item?.ru || item?.translations?.ru || {})
    },
    en: {
      ...emptyLang,
      ...(item?.en || item?.translations?.en || {})
    }
  }));
}

export function createEmptyLinkTableItem(order = 1) {
  return {
    id: createRowId(),
    href: '',
    order,
    active: true,
    uz: { ...emptyLang },
    ru: { ...emptyLang },
    en: { ...emptyLang }
  };
}

export default function LinkTableEditor({
  items = [],
  onChange,
  title = 'Linkli jadval',
  description = 'Frontendda content ustida chiqadigan bosiladigan satrlarni kiriting.'
}) {
  const rows = normalizeLinkTableItems(items);

  const updateRows = (nextRows) => {
    onChange?.(normalizeLinkTableItems(nextRows));
  };

  const handleAdd = () => {
    updateRows([...rows, createEmptyLinkTableItem(rows.length + 1)]);
  };

  const handleRemove = (rowId) => {
    updateRows(rows.filter((item) => item.id !== rowId));
  };

  const handleBaseChange = (rowId, field, value) => {
    updateRows(
      rows.map((item) => (item.id === rowId ? { ...item, [field]: value } : item))
    );
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
      <Stack spacing={0.5} sx={{ mb: 2.5 }}>
        <Typography variant="h5" fontWeight={800}>
          {title}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
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
                  Jadval satri #{index + 1}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Link va titlelarni to‘ldiring
                </Typography>
              </Box>

              <IconButton color="error" onClick={() => handleRemove(item.id)}>
                <DeleteOutlined />
              </IconButton>
            </Box>

            <Box sx={{ p: { xs: 2, md: 2.5 } }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                  <TextField
                    fullWidth
                    label="Link"
                    value={item.href}
                    onChange={(e) => handleBaseChange(item.id, 'href', e.target.value)}
                    placeholder="/pages/12 yoki /faculties/1 yoki https://..."
                  />
                </Grid>

                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Tartib"
                    value={item.order}
                    onChange={(e) => handleBaseChange(item.id, 'order', e.target.value)}
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
                        onChange={(e) => handleBaseChange(item.id, 'active', e.target.checked)}
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
                      onChange={(e) => handleLangChange(item.id, lang.key, e.target.value)}
                      required={lang.key === 'uz'}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        ))}
      </Stack>

      <Button
        variant="outlined"
        startIcon={<PlusOutlined />}
        onClick={handleAdd}
        sx={{ mt: 2.5 }}
      >
        Satr qo‘shish
      </Button>
    </Paper>
  );
}
