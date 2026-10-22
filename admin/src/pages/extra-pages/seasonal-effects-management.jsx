import React, { useEffect, useMemo, useState } from 'react';

import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SaveOutlined,
  UploadOutlined
} from '@ant-design/icons';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

import AdminTablePagination from 'components/AdminTablePagination';
import MainCard from 'components/MainCard';
import { useTablePagination } from 'hooks/useTablePagination';
import { deleteSetting, fetchSetting, saveSetting } from 'api/cms';
import { fileToDataUrl } from 'utils/file';

const SEASONS = [
  {
    key: 'spring',
    label: 'Bahor',
    description: 'Gul yoki yaproqcha kabi yengil elementlar yog‘adi.',
    defaultPreset: 'flower',
    defaults: { count: 14, size: 28, speed: 18 }
  },
  {
    key: 'summer',
    label: 'Yoz',
    description: 'Yomg‘ir tomchisi yoki boshqa yozgi ikonka ishlatiladi.',
    defaultPreset: 'raindrop',
    defaults: { count: 12, size: 24, speed: 16 }
  },
  {
    key: 'autumn',
    label: 'Kuz',
    description: 'Barg effekti bilan butun ekran bo‘ylab animatsiya chiqadi.',
    defaultPreset: 'leaf',
    defaults: { count: 16, size: 30, speed: 20 }
  },
  {
    key: 'winter',
    label: 'Qish',
    description: 'Qor parchasi yoki custom SVG bilan yog‘ib turadi.',
    defaultPreset: 'snow',
    defaults: { count: 20, size: 22, speed: 22 }
  }
];

const PRESET_OPTIONS = [
  { key: 'flower', label: 'Gul yaprog‘i' },
  { key: 'spark', label: 'Yorug‘ uchqun' },
  { key: 'leaf', label: 'Barg' },
  { key: 'snow', label: 'Qor parchasi' },
  { key: 'raindrop', label: 'Yomg‘ir tomchisi' }
];

function FlowerPreviewIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 7.1C12.8 4.9 15.2 3.8 17 5.1C18.7 6.3 18.9 8.9 17.4 10.2C19.7 10.1 21.4 12.2 20.7 14.4C20.1 16.4 17.8 17.3 16 16.4C16.3 18.8 14.3 20.7 12 20.2C9.8 19.7 8.7 17.2 9.4 15.3C7.4 16.6 4.8 15.9 3.9 13.8C3 11.7 4.3 9.4 6.6 9.1C4.8 7.8 4.7 5.2 6.4 4.1C8.2 2.8 10.6 3.9 11.4 6.1Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

function SparkPreviewIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2L13.8 8.2L20 10L13.8 11.8L12 18L10.2 11.8L4 10L10.2 8.2L12 2Z" />
      <path d="M18 15L18.8 17.2L21 18L18.8 18.8L18 21L17.2 18.8L15 18L17.2 17.2L18 15Z" />
    </svg>
  );
}

function LeafPreviewIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19.2 4.3C14.2 4.4 9.8 6.8 7.2 10.4C5.2 13.2 4.8 16.1 5.4 18.8C8.1 19.4 11 19 13.8 17C17.4 14.4 19.8 10 19.9 5C19.9 4.6 19.6 4.3 19.2 4.3Z" />
      <path d="M7 17C9.6 14.9 12 12.5 14.2 9.6" />
    </svg>
  );
}

function SnowPreviewIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2V22" />
      <path d="M4 7L20 17" />
      <path d="M4 17L20 7" />
      <path d="M12 2L14.4 4.4" />
      <path d="M12 2L9.6 4.4" />
      <path d="M12 22L14.4 19.6" />
      <path d="M12 22L9.6 19.6" />
    </svg>
  );
}

function RainPreviewIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C12 2 7 9 7 12.4C7 15.2 9.2 17.5 12 17.5C14.8 17.5 17 15.2 17 12.4C17 9 12 2 12 2Z" />
      <path d="M12 18.7V22" />
    </svg>
  );
}

function renderPresetPreviewIcon(presetKey) {
  if (presetKey === 'flower') {
    return <FlowerPreviewIcon />;
  }

  if (presetKey === 'leaf') {
    return <LeafPreviewIcon />;
  }

  if (presetKey === 'snow') {
    return <SnowPreviewIcon />;
  }

  if (presetKey === 'raindrop') {
    return <RainPreviewIcon />;
  }

  return <SparkPreviewIcon />;
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}

function getDefaultSeasonConfig(season) {
  return {
    enabled: true,
    preset: season.defaultPreset,
    assetUrl: '',
    count: season.defaults.count,
    size: season.defaults.size,
    speed: season.defaults.speed
  };
}

function getEmptyForm() {
  return {
    active: true,
    seasonMode: 'auto',
    manualSeason: 'spring',
    seasons: SEASONS.reduce((accumulator, season) => {
      accumulator[season.key] = getDefaultSeasonConfig(season);
      return accumulator;
    }, {})
  };
}

function normalizeSeasonConfig(season, value = {}) {
  const fallback = getDefaultSeasonConfig(season);
  const presetExists = PRESET_OPTIONS.some((item) => item.key === value.preset);

  return {
    enabled: value.enabled ?? fallback.enabled,
    preset: presetExists ? value.preset : fallback.preset,
    assetUrl: String(value.assetUrl || '').trim(),
    count: clampNumber(value.count, 4, 40, fallback.count),
    size: clampNumber(value.size, 10, 64, fallback.size),
    speed: clampNumber(value.speed, 8, 40, fallback.speed)
  };
}

function normalizeSeasonalEffectsSetting(data = {}) {
  const nextForm = getEmptyForm();
  const nextSeasons = { ...nextForm.seasons };

  SEASONS.forEach((season) => {
    nextSeasons[season.key] = normalizeSeasonConfig(
      season,
      data?.seasons?.[season.key]
    );
  });

  return {
    ...data,
    active: data.active ?? true,
    seasonMode: data.seasonMode === 'manual' ? 'manual' : 'auto',
    manualSeason: SEASONS.some((season) => season.key === data.manualSeason)
      ? data.manualSeason
      : nextForm.manualSeason,
    seasons: nextSeasons
  };
}

function formatUpdatedAt(value) {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getSeasonLabel(seasonKey) {
  return SEASONS.find((season) => season.key === seasonKey)?.label || seasonKey;
}

function getPresetLabel(presetKey) {
  return PRESET_OPTIONS.find((item) => item.key === presetKey)?.label || presetKey;
}

export default function SeasonalEffectsManagementPage() {
  const [record, setRecord] = useState(null);
  const [mode, setMode] = useState('table');
  const [form, setForm] = useState(getEmptyForm);
  const tableRecords = record ? [record] : [];
  const tablePagination = useTablePagination(tableRecords);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const item = await fetchSetting('seasonal-effects');

        if (!cancelled) {
          setRecord(item ? normalizeSeasonalEffectsSetting(item) : null);
        }
      } catch (error) {
        console.error('Failed to load seasonal effects:', error);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const preview = useMemo(() => normalizeSeasonalEffectsSetting(form), [form]);

  const openCreate = () => {
    setForm(getEmptyForm());
    setMode('form');
  };

  const openEdit = () => {
    setForm(normalizeSeasonalEffectsSetting(record || {}));
    setMode('form');
  };

  const setSeasonField = (seasonKey, field, value) => {
    setForm((prev) => ({
      ...prev,
      seasons: {
        ...prev.seasons,
        [seasonKey]: {
          ...prev.seasons[seasonKey],
          [field]: value
        }
      }
    }));
  };

  const applyPreset = (seasonKey, presetKey) => {
    setForm((prev) => ({
      ...prev,
      seasons: {
        ...prev.seasons,
        [seasonKey]: {
          ...prev.seasons[seasonKey],
          preset: presetKey,
          assetUrl: ''
        }
      }
    }));
  };

  const handleFileChange = async (seasonKey, file) => {
    if (!file) {
      return;
    }

    try {
      const assetUrl = await fileToDataUrl(file);
      setSeasonField(seasonKey, 'assetUrl', assetUrl);
    } catch (error) {
      console.error('Failed to read seasonal asset:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSetting('seasonal-effects');
      setRecord(null);
      setForm(getEmptyForm());
      setMode('table');
    } catch (error) {
      console.error('Failed to delete seasonal effects:', error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const savedItem = await saveSetting(
        'seasonal-effects',
        normalizeSeasonalEffectsSetting(form)
      );

      if (savedItem) {
        const normalized = normalizeSeasonalEffectsSetting(savedItem);
        setRecord(normalized);
        setForm(normalized);
      }

      setMode('table');
    } catch (error) {
      console.error('Failed to save seasonal effects:', error);
    }
  };

  if (mode === 'form') {
    return (
      <MainCard
        title={record ? 'Fasl effektlarini tahrirlash' : 'Fasl effektlarini qo‘shish'}
        secondary={
          <Button startIcon={<ArrowLeftOutlined />} variant="outlined" onClick={() => setMode('table')}>
            Orqaga
          </Button>
        }
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          4 fasl uchun butun ekran bo‘ylab chiqadigan animatsiyalarni shu yerda boshqaring.
          Overlay sichqonchaga halaqit bermaydi va frontendda avtomatik ishlaydi.
        </Typography>

        <Divider sx={{ mb: 2.5 }} />

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} xl={4}>
              <Stack spacing={2.5}>
                <Paper variant="outlined" sx={{ borderRadius: '6px', p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Box>
                      <Typography variant="h5" fontWeight={900}>
                        Global holat
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Frontenddagi animatsiyani yoqish yoki o‘chirish.
                      </Typography>
                    </Box>

                    <Switch
                      checked={form.active}
                      onChange={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
                    />
                  </Stack>

                  <Chip
                    sx={{ mt: 2, fontWeight: 800 }}
                    color={form.active ? 'success' : 'default'}
                    label={form.active ? 'Faol' : 'Nofaol'}
                  />
                </Paper>

                <Paper variant="outlined" sx={{ borderRadius: '6px', p: 3 }}>
                  <Typography variant="h5" fontWeight={900} sx={{ mb: 2 }}>
                    Fasl tanlash
                  </Typography>

                  <Stack spacing={2}>
                    <FormControl fullWidth>
                      <InputLabel id="season-mode-label">Ishlash rejimi</InputLabel>
                      <Select
                        labelId="season-mode-label"
                        value={form.seasonMode}
                        label="Ishlash rejimi"
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, seasonMode: event.target.value }))
                        }
                      >
                        <MenuItem value="auto">Auto - hozirgi faslga qarab</MenuItem>
                        <MenuItem value="manual">Manual - tanlangan faslni ko‘rsatish</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl fullWidth disabled={form.seasonMode !== 'manual'}>
                      <InputLabel id="manual-season-label">Manual fasl</InputLabel>
                      <Select
                        labelId="manual-season-label"
                        value={form.manualSeason}
                        label="Manual fasl"
                        onChange={(event) =>
                          setForm((prev) => ({ ...prev, manualSeason: event.target.value }))
                        }
                      >
                        {SEASONS.map((season) => (
                          <MenuItem key={season.key} value={season.key}>
                            {season.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Paper>

                <Paper variant="outlined" sx={{ borderRadius: '6px', overflow: 'hidden' }}>
                  <Box
                    sx={{
                      p: 3,
                      background: 'linear-gradient(135deg, #082e69 0%, #0f4a9d 100%)',
                      color: '#fff'
                    }}
                  >
                    <Typography variant="h5" fontWeight={900}>
                      Preview summary
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.7, opacity: 0.84 }}>
                      Hozir tanlangan rejim: {preview.seasonMode === 'manual' ? 'Manual' : 'Auto'}
                    </Typography>
                  </Box>

                  <Stack spacing={1.3} sx={{ p: 3 }}>
                    {SEASONS.map((season) => {
                      const seasonConfig = preview.seasons[season.key];
                      return (
                        <Paper
                          key={season.key}
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 1.5
                          }}
                        >
                          <Box>
                            <Typography fontWeight={800}>{season.label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getPresetLabel(seasonConfig.preset)} | {seasonConfig.count} dona | {seasonConfig.size}px
                            </Typography>
                          </Box>

                          <Chip
                            size="small"
                            color={seasonConfig.enabled ? 'success' : 'default'}
                            label={seasonConfig.enabled ? 'Yoqilgan' : 'O‘chiq'}
                          />
                        </Paper>
                      );
                    })}
                  </Stack>
                </Paper>
              </Stack>
            </Grid>

            <Grid item xs={12} xl={8}>
              <Stack spacing={2.5}>
                {SEASONS.map((season) => {
                  const seasonConfig = form.seasons[season.key];

                  return (
                    <Paper key={season.key} variant="outlined" sx={{ borderRadius: '6px', overflow: 'hidden' }}>
                      <Box
                        sx={{
                          p: 3,
                          bgcolor: '#f8fbff',
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                          <Box>
                            <Typography variant="h4" fontWeight={900} color="#082e69">
                              {season.label}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                              {season.description}
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={1.2} alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              Faolligi
                            </Typography>
                            <Switch
                              checked={seasonConfig.enabled}
                              onChange={() => setSeasonField(season.key, 'enabled', !seasonConfig.enabled)}
                            />
                          </Stack>
                        </Stack>
                      </Box>

                      <Box sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                              <InputLabel id={`${season.key}-preset-label`}>Preset icon</InputLabel>
                              <Select
                                labelId={`${season.key}-preset-label`}
                                value={seasonConfig.preset}
                                label="Preset icon"
                                onChange={(event) => applyPreset(season.key, event.target.value)}
                              >
                                {PRESET_OPTIONS.map((option) => (
                                  <MenuItem key={option.key} value={option.key}>
                                    {option.label}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Custom image / SVG URL"
                              value={seasonConfig.assetUrl}
                              onChange={(event) => setSeasonField(season.key, 'assetUrl', event.target.value)}
                              helperText="Agar berilsa, preset o‘rniga shu rasm ishlatiladi."
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.2 }}>
                              Namunalar
                            </Typography>

                            <Grid container spacing={1.2}>
                              {PRESET_OPTIONS.map((option) => {
                                const isActive = seasonConfig.preset === option.key && !seasonConfig.assetUrl;

                                return (
                                  <Grid item xs={6} sm={4} md={3} key={`${season.key}-${option.key}`}>
                                    <Paper
                                      variant="outlined"
                                      onClick={() => applyPreset(season.key, option.key)}
                                      sx={{
                                        p: 1.25,
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        height: '100%',
                                        borderColor: isActive ? '#0f4a9d' : 'divider',
                                        boxShadow: isActive ? '0 0 0 1px rgba(15,74,157,0.15)' : 'none',
                                        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                                        '&:hover': {
                                          transform: 'translateY(-1px)',
                                          boxShadow: '0 10px 24px rgba(8,46,105,0.08)'
                                        }
                                      }}
                                    >
                                      <Stack spacing={1} alignItems="center">
                                        <Box
                                          sx={{
                                            width: 52,
                                            height: 52,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: '#f8fbff',
                                            color:
                                              option.key === 'flower'
                                                ? '#f07faf'
                                                : option.key === 'leaf'
                                                  ? '#cf6b38'
                                                  : option.key === 'snow'
                                                    ? '#6b8fc7'
                                                    : option.key === 'raindrop'
                                                      ? '#2d79d6'
                                                      : '#f6b543',
                                            '& svg': {
                                              width: 30,
                                              height: 30,
                                              fill: 'currentColor',
                                              stroke: 'currentColor',
                                              strokeWidth: 1.2,
                                              strokeLinecap: 'round',
                                              strokeLinejoin: 'round'
                                            }
                                          }}
                                        >
                                          {renderPresetPreviewIcon(option.key)}
                                        </Box>

                                        <Typography
                                          variant="caption"
                                          align="center"
                                          sx={{ lineHeight: 1.35, fontWeight: isActive ? 800 : 600 }}
                                        >
                                          {option.label}
                                        </Typography>
                                      </Stack>
                                    </Paper>
                                  </Grid>
                                );
                              })}
                            </Grid>

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.2 }}>
                              Namunani bossangiz preset tanlanadi va frontendda shu ko‘rinish chiqadi.
                            </Typography>
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Elementlar soni"
                              value={seasonConfig.count}
                              onChange={(event) =>
                                setSeasonField(season.key, 'count', clampNumber(event.target.value, 4, 40, season.defaults.count))
                              }
                              inputProps={{ min: 4, max: 40 }}
                            />
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              type="number"
                              label="O‘rtacha hajm (px)"
                              value={seasonConfig.size}
                              onChange={(event) =>
                                setSeasonField(season.key, 'size', clampNumber(event.target.value, 10, 64, season.defaults.size))
                              }
                              inputProps={{ min: 10, max: 64 }}
                            />
                          </Grid>

                          <Grid item xs={12} md={4}>
                            <TextField
                              fullWidth
                              type="number"
                              label="Tezlik (sekund)"
                              value={seasonConfig.speed}
                              onChange={(event) =>
                                setSeasonField(season.key, 'speed', clampNumber(event.target.value, 8, 40, season.defaults.speed))
                              }
                              inputProps={{ min: 8, max: 40 }}
                            />
                          </Grid>

                          <Grid item xs={12}>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
                              <Button component="label" variant="outlined" startIcon={<UploadOutlined />}>
                                SVG / PNG yuklash
                                <input
                                  hidden
                                  accept="image/*,.svg"
                                  type="file"
                                  onChange={(event) => handleFileChange(season.key, event.target.files?.[0])}
                                />
                              </Button>

                              <Button
                                variant="text"
                                color="inherit"
                                onClick={() => setSeasonField(season.key, 'assetUrl', '')}
                              >
                                Custom rasmni tozalash
                              </Button>
                            </Stack>
                          </Grid>

                          {seasonConfig.assetUrl ? (
                            <Grid item xs={12}>
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 2,
                                  borderRadius: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  bgcolor: '#fbfdff'
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: '6px',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: '#fff',
                                    p: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <img
                                    src={seasonConfig.assetUrl}
                                    alt={`${season.label} preview`}
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                  />
                                </Box>

                                <Typography variant="body2" color="text.secondary">
                                  Custom asset yuklangan. Frontendda shu rasm yoki SVG ishlatiladi.
                                </Typography>
                              </Paper>
                            </Grid>
                          ) : null}
                        </Grid>
                      </Box>
                    </Paper>
                  );
                })}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
                  <Button variant="outlined" onClick={() => setMode('table')}>
                    Bekor qilish
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<SaveOutlined />}
                    sx={{
                      px: 4,
                      bgcolor: '#082e69',
                      '&:hover': { bgcolor: '#061f49' }
                    }}
                  >
                    Saqlash
                  </Button>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </MainCard>
    );
  }

  return (
    <MainCard
      title="Fasl effektlari boshqaruvi"
      secondary={
        !record ? (
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={openCreate}>
            Effekt qo‘shish
          </Button>
        ) : null
      }
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Butun sayt bo‘ylab pointer’ga halaqit bermaydigan fasliy animatsiyalar shu yerda saqlanadi.
      </Typography>

      <Divider sx={{ mb: 2.5 }} />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Holat</TableCell>
              <TableCell>Rejim</TableCell>
              <TableCell>Manual fasl</TableCell>
              <TableCell>Fasllar</TableCell>
              <TableCell>Yangilangan</TableCell>
              <TableCell align="right">Amallar</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {record ? (
              tablePagination.paginatedItems.map((item, index) => (
              <TableRow hover key={item.updatedAt || 'seasonal-effects'}>
                <TableCell>{tablePagination.getRowNumber(index)}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={item.active ? 'success' : 'default'}
                    label={item.active ? 'Faol' : 'Nofaol'}
                  />
                </TableCell>
                <TableCell>{item.seasonMode === 'manual' ? 'Manual' : 'Auto'}</TableCell>
                <TableCell>{getSeasonLabel(item.manualSeason)}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {SEASONS.map((season) => {
                      const config = item.seasons[season.key];
                      return (
                        <Chip
                          key={season.key}
                          size="small"
                          variant="outlined"
                          color={config.enabled ? 'primary' : 'default'}
                          label={`${season.label}: ${getPresetLabel(config.preset)}`}
                        />
                      );
                    })}
                  </Stack>
                </TableCell>
                <TableCell>{formatUpdatedAt(item.updatedAt)}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={openEdit}>
                    <EditOutlined />
                  </IconButton>
                  <IconButton color="error" onClick={handleDelete}>
                    <DeleteOutlined />
                  </IconButton>
                </TableCell>
              </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  Fasl effektlari hali saqlanmagan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AdminTablePagination
        count={tableRecords.length}
        page={tablePagination.page}
        rowsPerPage={tablePagination.rowsPerPage}
        onPageChange={tablePagination.handlePageChange}
        onRowsPerPageChange={tablePagination.handleRowsPerPageChange}
      />
    </MainCard>
  );
}
