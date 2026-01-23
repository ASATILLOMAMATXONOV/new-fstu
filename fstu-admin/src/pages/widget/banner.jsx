import React, { useEffect, useMemo, useState } from "react";

// material-ui
import {
  Grid, Card, CardContent, CardActions, CardMedia, Typography, Button,
  IconButton, Stack, Box, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Switch, FormControlLabel, Tooltip, Alert,
  Chip, MenuItem, Paper, useTheme
} from "@mui/material";

// icons (ant)
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
import PictureOutlined from "@ant-design/icons/PictureOutlined";
import DeleteFilled from "@ant-design/icons/DeleteFilled";

const LS_KEY = "app_hero_banners_v3"; // storage key

// --- Helpers ---
const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

// ✅ LocalStorage safe write (quota bo‘lsa yiqilmaydi)
function safeSetLS(key, value) {
  try {
    localStorage.setItem(key, value);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e };
  }
}

// ✅ base64 juda katta bo‘lsa yoki quota bo‘lsa: rasmni saqlamaslik uchun
const isDataUrl = (s) => typeof s === "string" && s.startsWith("data:image/");

// ✅ canvas bilan rasmni kichraytirib + siqib base64 qilish (quota muammosini hal qiladi)
async function fileToCompressedDataUrl(file, opts = {}) {
  const {
    maxW = 1400, // banner uchun yetarli
    quality = 0.75, // 0..1 (jpeg)
    mime = "image/jpeg"
  } = opts;

  const img = await new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const im = new Image();
    im.onload = () => {
      URL.revokeObjectURL(url);
      resolve(im);
    };
    im.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    im.src = url;
  });

  const ratio = img.width / img.height;
  let w = img.width;
  let h = img.height;

  if (w > maxW) {
    w = maxW;
    h = Math.round(w / ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);

  // JPEG siqadi (png bo‘lsa ham jpegga aylantiradi)
  return canvas.toDataURL(mime, quality);
}

// ✅ Icon options
const ICON_OPTIONS = [
  { value: "cap", label: "🎓 Talaba qalpoqchasi" },
  { value: "globe", label: "🌐 Dunyo/Xalqaro" },
  { value: "lab", label: "🧪 Laboratoriya" },
  { value: "gear", label: "⚙️ Texnologiya" },
  { value: "building", label: "🏛️ Universitet" },
  { value: "book", label: "📚 Kutubxona" },
  { value: "rocket", label: "🚀 Innovatsiya" },
  { value: "shield", label: "🛡️ Xavfsizlik" },
  { value: "people", label: "👥 Hamjamiyat" },
  { value: "briefcase", label: "💼 Karyera" },
  { value: "medal", label: "🏅 Yutuqlar" },
  { value: "star", label: "⭐ Sifat" }
];

const DEMO_BANNERS = [
  {
    id: "demo-1",
    active: true,
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=60",
    kicker: "KELAJAK SHU YERDAN BOSHLANADI",
    title: "Farg‘ona davlat texnika universiteti",
    description: "Zamonaviy texnologiyalar va xalqaro standartlar asosida ta’lim oling.",
    link: "/admission",
    stats: [
      { active: true, icon: "cap", title: "50+ Yo‘nalishlar", subtitle: "Bakalavr & Magistratura" },
      { active: true, icon: "globe", title: "Xalqaro Diplom", subtitle: "" },
      { active: false, icon: "rocket", title: "Innovatsiya markazi", subtitle: "Startap & grantlar" }
    ]
  }
];

// ✅ normalize (old data ham ishlaydi)
const normalizeBanner = (b) => {
  const s0 = b?.stats?.[0] || {};
  const s1 = b?.stats?.[1] || {};
  const s2 = b?.stats?.[2] || {};

  return {
    id: b?.id || uid(),
    active: b?.active ?? false,
    image: b?.image || "",
    kicker: b?.kicker || "",
    title: b?.title || "",
    description: b?.description || "",
    link: b?.link || "",
    stats: [
      { active: s0?.active ?? true, icon: s0?.icon || "cap", title: s0?.title || "", subtitle: s0?.subtitle || "" },
      { active: s1?.active ?? true, icon: s1?.icon || "globe", title: s1?.title || "", subtitle: s1?.subtitle || "" },
      { active: s2?.active ?? false, icon: s2?.icon || "star", title: s2?.title || "", subtitle: s2?.subtitle || "" }
    ]
  };
};

export default function WidgetStatistics() {
  const theme = useTheme();

  const [banners, setBanners] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw).map(normalizeBanner) : DEMO_BANNERS.map(normalizeBanner);
    } catch {
      return DEMO_BANNERS.map(normalizeBanner);
    }
  });

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => normalizeBanner({}));
  const [error, setError] = useState("");
  const [lsWarn, setLsWarn] = useState(""); // ✅ quota warning

  // ✅ LocalStorage save (quota bo‘lsa yiqilmaydi + userga xabar)
  useEffect(() => {
    const payload = JSON.stringify(banners);
    const res = safeSetLS(LS_KEY, payload);

    if (!res.ok) {
      // fallback: dataURL rasmlarni saqlamasdan urinib ko‘ramiz
      const lite = banners.map((b) => ({
        ...b,
        image: isDataUrl(b.image) ? "" : b.image // dataURL bo‘lsa olib tashlaymiz
      }));

      const payloadLite = JSON.stringify(lite);
      const res2 = safeSetLS(LS_KEY, payloadLite);

      if (!res2.ok) {
        setLsWarn("⚠️ Storage to‘lib qolgan (Quota). Bannerlar saqlanmadi. Eski bannerlarni o‘chiring yoki rasmni kichraytiring.");
      } else {
        setLsWarn("⚠️ Storage to‘lib qolgan. Rasm(base64) saqlanmadi, faqat matn/sozlamalar saqlandi. Rasm uchun URL ishlating yoki rasmni kichraytiring.");
      }
    } else {
      setLsWarn("");
    }
  }, [banners]);

  const sortedBanners = useMemo(
    () => [...banners].sort((a, b) => (b.active ? 1 : 0) - (a.active ? 1 : 0)),
    [banners]
  );

  const setFormField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const setStatField = (idx, key, value) =>
    setForm((p) => {
      const next = [...p.stats];
      next[idx] = { ...next[idx], [key]: value };
      return { ...p, stats: next };
    });

  const openModal = (banner = null) => {
    if (banner) {
      setMode("edit");
      setEditingId(banner.id);
      setForm(normalizeBanner(banner));
    } else {
      setMode("create");
      setForm(normalizeBanner({}));
    }
    setError("");
    setOpen(true);
  };

 const onSave = () => {
  // ✅ Sarlavha majburiy EMAS
  // if (!form.title.trim()) return setError("Sarlavha kiritish shart!");

  // ✅ Rasm majburiy bo‘lib qolsin (xohlasangiz buni ham olib tashlayman)
  if (!form.image.trim()) return setError("Rasm yuklash yoki URL kiritish shart!");

  if (mode === "create") {
    setBanners((prev) => [normalizeBanner({ ...form, active: false }), ...prev]);
  } else {
    setBanners((prev) => prev.map((b) => (b.id === editingId ? { ...form, active: b.active } : b)));
  }
  setOpen(false);
};


  const clearStorage = () => {
    if (!window.confirm("LocalStorage tozalanadi. Davom etamizmi?")) return;
    try {
      localStorage.removeItem(LS_KEY);
      setBanners(DEMO_BANNERS.map(normalizeBanner));
      setLsWarn("");
    } catch {
      setLsWarn("Storage tozalashda xatolik bo‘ldi.");
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* --- HEADER --- */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="primary.main">
              Hero Bannerlar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Asosiy sahifa bannerlarini boshqarish paneli
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteFilled />}
              onClick={clearStorage}
              sx={{ borderRadius: 2 }}
            >
              Storage tozalash
            </Button>

            <Button
              variant="contained"
              size="large"
              startIcon={<PlusOutlined />}
              onClick={() => openModal()}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Yangi Banner
            </Button>
          </Stack>
        </Stack>

        {lsWarn ? (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {lsWarn}
          </Alert>
        ) : null}
      </Paper>

      {/* --- LIST --- */}
      <Grid container spacing={3}>
        {sortedBanners.map((b) => (
          <Grid key={b.id} item xs={12} sm={6} lg={4}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": { boxShadow: theme.shadows[10] },
                position: "relative"
              }}
            >
              <Box sx={{ position: "relative" }}>
                <CardMedia component="img" height="200" image={b.image || "https://via.placeholder.com/1200x600?text=No+Image"} alt={b.title} />
                <Chip
                  label={b.active ? "FAOL" : "O'CHIK"}
                  color={b.active ? "success" : "default"}
                  size="small"
                  sx={{ position: "absolute", top: 12, right: 12, fontWeight: 700 }}
                />
              </Box>

              <CardContent sx={{ pb: 1 }}>
                <Typography variant="overline" color="primary" fontWeight={700}>
                  {b.kicker || "Bnanner nomi"}
                </Typography>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 1, height: 60, overflow: "hidden" }}>
                  {b.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {b.description}
                </Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip size="small" variant="outlined" label={`Info card: ${b.stats.filter((s) => s.active).length} ta`} />
                  {isDataUrl(b.image) ? <Chip size="small" color="warning" label="base64" /> : <Chip size="small" color="info" label="url" />}
                </Stack>
              </CardContent>

              <Divider />

              <CardActions sx={{ justifyContent: "space-between", px: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={b.active}
                      onChange={() => setBanners((prev) => prev.map((x) => (x.id === b.id ? { ...x, active: !x.active } : x)))}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="caption" fontWeight={600}>
                      Holat
                    </Typography>
                  }
                />
                <Stack direction="row" spacing={1}>
                  <IconButton color="primary" onClick={() => openModal(b)} size="small" sx={{ bgcolor: "primary.lighter" }}>
                    <EditOutlined />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => window.confirm("O'chirilsinmi?") && setBanners((p) => p.filter((x) => x.id !== b.id))}
                    size="small"
                    sx={{ bgcolor: "error.lighter" }}
                  >
                    <DeleteOutlined />
                  </IconButton>
                </Stack>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* --- DIALOG --- */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md" scroll="body">
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.5rem" }}>
          {mode === "create" ? "Yangi Banner Yaratish" : "Bannerni Tahrirlash"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {error && (
              <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                1. Asosiy ma'lumotlar
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Kicker (Short Text)" value={form.kicker} onChange={(e) => setFormField("kicker", e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
  fullWidth
  label="Asosiy Sarlavha"
  value={form.title}
  onChange={(e) => setFormField("title", e.target.value)}
/>

                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={2} label="Tavsif" value={form.description} onChange={(e) => setFormField("description", e.target.value)} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Tugma uchun Link" value={form.link} onChange={(e) => setFormField("link", e.target.value)} placeholder="/services" />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                2. Media (Rasm) — ✅ siqib saqlaydi (quota kamayadi)
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadOutlined />}
                  onClick={() => setError("")}
                >
                  Rasm Yuklash (compress)
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      try {
                        // ✅ compress
                        const dataUrl = await fileToCompressedDataUrl(file, { maxW: 1400, quality: 0.75, mime: "image/jpeg" });
                        setFormField("image", dataUrl);
                      } catch {
                        setError("Rasmni o‘qishda xatolik.");
                      } finally {
                        e.target.value = "";
                      }
                    }}
                  />
                </Button>

                <TextField
                  fullWidth
                  size="small"
                  label="Yoki Rasm URL manzili (tavsiya)"
                  value={isDataUrl(form.image) ? "" : form.image}
                  onChange={(e) => setFormField("image", e.target.value)}
                  placeholder="https://..."
                />
              </Stack>

              {form.image ? (
                <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", border: "1px solid #ddd" }}>
                  <img src={form.image} alt="preview" style={{ width: "100%", height: 200, objectFit: "cover" }} />
                  <Chip
                    icon={<PictureOutlined />}
                    label={isDataUrl(form.image) ? "Ko'rinish (base64-compressed)" : "Ko'rinish (url)"}
                    size="small"
                    sx={{ position: "absolute", top: 10, left: 10, bgcolor: "white" }}
                  />
                </Box>
              ) : null}

              <Alert severity="info" sx={{ mt: 2 }}>
                ✅ Eng yaxshi yo‘l: rasmni serverga yuklab URL saqlash. LocalStorage faqat kichik data uchun.
              </Alert>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                3. Info Cardlar — 3 tagacha (yoqish/o‘chirish + icon tanlash)
              </Typography>

              <Grid container spacing={2}>
                {[0, 1, 2].map((idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                      <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="caption" fontWeight={900} color="text.secondary">
                            KARTA {idx + 1}
                          </Typography>

                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Switch
                                size="small"
                                checked={!!form.stats[idx].active}
                                onChange={(e) => setStatField(idx, "active", e.target.checked)}
                              />
                            }
                            label={<Typography variant="caption" fontWeight={700}>ON</Typography>}
                          />
                        </Stack>

                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Belgi (Icon)"
                          value={form.stats[idx].icon}
                          onChange={(e) => setStatField(idx, "icon", e.target.value)}
                          disabled={!form.stats[idx].active}
                        >
                          {ICON_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </TextField>

                        <TextField
                          fullWidth
                          size="small"
                          label="Sarlavha"
                          value={form.stats[idx].title}
                          onChange={(e) => setStatField(idx, "title", e.target.value)}
                          disabled={!form.stats[idx].active}
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Kichik matn"
                          value={form.stats[idx].subtitle}
                          onChange={(e) => setStatField(idx, "subtitle", e.target.value)}
                          disabled={!form.stats[idx].active}
                        />

                        {!form.stats[idx].active ? (
                          <Alert severity="info" sx={{ py: 0.5 }}>
                            Bu karta o‘chiq (saytda ko‘rinmaydi).
                          </Alert>
                        ) : null}
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Bekor qilish
          </Button>
          <Button onClick={onSave} variant="contained" size="large" sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}>
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
