import React, { useEffect, useMemo, useState } from "react";

// material-ui
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip from "@mui/material/Tooltip";
import Alert from "@mui/material/Alert";

// icons (ant)
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import UploadOutlined from "@ant-design/icons/UploadOutlined";

const LS_KEY = "app_banners_v1";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

const DEMO_BANNERS = [
  {
    id: "demo-1",
    title: "Qabul 2026",
    subtitle: "Ariza topshirish boshlandi",
    link: "/admission",
    active: true,
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=60",
  },
  {
    id: "demo-2",
    title: "Online kurslar",
    subtitle: "Yangi dasturlar ochildi",
    link: "/courses",
    active: true,
    image:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=60",
  },
];

function loadBanners() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEMO_BANNERS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEMO_BANNERS;
  } catch {
    return DEMO_BANNERS;
  }
}

function saveBanners(banners) {
  localStorage.setItem(LS_KEY, JSON.stringify(banners));
}

export default function WidgetStatistics() {
  const [banners, setBanners] = useState(() => loadBanners());

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    link: "",
    image: "", // base64 yoki url
  });

  const [fileError, setFileError] = useState("");

  useEffect(() => {
    saveBanners(banners);
  }, [banners]);

  const sortedBanners = useMemo(() => {
    // active birinchi chiqsin, keyin title bo'yicha
    return [...banners].sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1;
      return (a.title || "").localeCompare(b.title || "");
    });
  }, [banners]);

  const openCreate = () => {
    setMode("create");
    setEditingId(null);
    setFileError("");
    setForm({ title: "", subtitle: "", link: "", image: "" });
    setOpen(true);
  };

  const openEdit = (banner) => {
    setMode("edit");
    setEditingId(banner.id);
    setFileError("");
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      link: banner.link || "",
      image: banner.image || "",
    });
    setOpen(true);
  };

  const onDelete = (id) => {
    const ok = window.confirm("Banner o‘chirilsinmi?");
    if (!ok) return;
    setBanners((prev) => prev.filter((b) => b.id !== id));
  };

  // ✅ MB cheklovi yo'q: faqat image/* tekshiramiz
  const onPickFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImg = file.type.startsWith("image/");
    if (!isImg) {
      setFileError("Faqat rasm (image/*) yuklang.");
      return;
    }

    setFileError("");
    const base64 = await fileToBase64(file);
    setForm((p) => ({ ...p, image: base64 }));
  };

  const onSave = () => {
    if (!form.title.trim()) {
      setFileError("Sarlavha (title) majburiy.");
      return;
    }
    if (!form.image) {
      setFileError("Rasm tanlang (yoki image url kiriting).");
      return;
    }
    setFileError("");

    if (mode === "create") {
      // ✅ create paytida default OFF bo'lsin (keyin kartadan active qilasiz)
      const newBanner = { ...form, id: uid(), active: false };
      setBanners((prev) => [newBanner, ...prev]);
    } else {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === editingId
            ? { ...b, title: form.title, subtitle: form.subtitle, link: form.link, image: form.image }
            : b
        )
      );
    }

    setOpen(false);
  };

  // ✅ Active/Off faqat saqlangan bannerni kartasida toggleda o'zgaradi
  const toggleActive = (id) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b))
    );
  };

  return (
    <Grid container spacing={3}>
      {/* Header */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Bannerlar
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Banner qo‘shish / tahrirlash / o‘chirish (rasm yuklash bilan).
                </Typography>
              </Box>

              <Button variant="contained" startIcon={<PlusOutlined />} onClick={openCreate}>
                New Banners
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* List */}
      {sortedBanners.map((b) => (
        <Grid key={b.id} item xs={12} sm={6} md={4} lg={3}>
          <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <CardMedia
              component="img"
              height="160"
              image={b.image}
              alt={b.title}
              sx={{ objectFit: "cover" }}
            />
            <CardContent sx={{ flexGrow: 1 }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                  <Typography variant="subtitle1" fontWeight={700} noWrap>
                    {b.title}
                  </Typography>

                  {/* ✅ Saqlangandan keyin active/off shu yerda */}
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Switch
                        size="small"
                        checked={!!b.active}
                        onChange={() => toggleActive(b.id)}
                      />
                    }
                    label={
                      <Typography variant="caption" fontWeight={700}>
                        {b.active ? "ACTIVE" : "OFF"}
                      </Typography>
                    }
                  />
                </Stack>

                {!!b.subtitle && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {b.subtitle}
                  </Typography>
                )}

                {!!b.link && (
                  <Typography variant="caption" color="text.secondary" noWrap>
                    Link: {b.link}
                  </Typography>
                )}
              </Stack>
            </CardContent>

            <Divider />

            <CardActions sx={{ justifyContent: "flex-end" }}>
              <Tooltip title="Tahrirlash">
                <IconButton onClick={() => openEdit(b)}>
                  <EditOutlined />
                </IconButton>
              </Tooltip>
              <Tooltip title="O‘chirish">
                <IconButton onClick={() => onDelete(b.id)}>
                  <DeleteOutlined />
                </IconButton>
              </Tooltip>
            </CardActions>
          </Card>
        </Grid>
      ))}

      {/* Dialog: create/edit */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          {mode === "create" ? "Yangi banner qo‘shish" : "Banner tahrirlash"}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {fileError ? <Alert severity="warning">{fileError}</Alert> : null}

            <TextField
              label="Sarlavha (title)"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              fullWidth
            />

            <TextField
              label="Subtitle (ixtiyoriy)"
              value={form.subtitle}
              onChange={(e) => setForm((p) => ({ ...p, subtitle: e.target.value }))}
              fullWidth
            />

            <TextField
              label="Link (ixtiyoriy) - masalan: /admission"
              value={form.link}
              onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
              fullWidth
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadOutlined />}
                sx={{ whiteSpace: "nowrap" }}
              >
                Rasm tanlash
                <input hidden type="file" accept="image/*" onChange={onPickFile} />
              </Button>

              <TextField
                label="yoki image URL kiriting"
                value={form.image?.startsWith("data:") ? "" : form.image}
                onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                fullWidth
                helperText="Agar file tanlasangiz, bu joy bo‘sh qolishi mumkin."
              />
            </Stack>

            {form.image ? (
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box sx={{ p: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Preview
                  </Typography>
                </Box>
                <Box
                  component="img"
                  src={form.image}
                  alt="preview"
                  sx={{ width: "100%", height: 220, objectFit: "cover", display: "block" }}
                />
              </Box>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)} color="inherit">
            Bekor qilish
          </Button>
          <Button onClick={onSave} variant="contained">
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
