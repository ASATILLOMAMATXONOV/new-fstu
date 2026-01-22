import React, { useCallback, useMemo, useState, useEffect } from "react";

// ===================== MUI =====================
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";

// ===================== Icons (ant-design) =====================
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import ArrowUpOutlined from "@ant-design/icons/ArrowUpOutlined";
import ArrowDownOutlined from "@ant-design/icons/ArrowDownOutlined";
import LinkOutlined from "@ant-design/icons/LinkOutlined";

// ===================== LocalStorage =====================
const LS_KEY = "app_header_menu_v2";
const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

// ===================== helper: file -> base64 =====================
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ===================== DEFAULT STATE =====================
// Brand: logo (3 tilda) + homeUrl
// TopBar: phone object + socials(iconData+href) + quickLinks
// Main Menu: faqat title/link (3 tilda) + active
const DEFAULT_STATE = {
  brand: {
    homeUrl: "/",
    logoDataUz: "",
    logoDataRu: "",
    logoDataEn: ""
  },
  topBar: {
    phone: { id: "p1", value: "+998 (73) 241-12-06", active: true },
    socials: [
      { id: "s1", href: "https://facebook.com", iconData: "", active: true },
      { id: "s2", href: "https://instagram.com", iconData: "", active: true },
      { id: "s3", href: "https://t.me", iconData: "", active: true },
      { id: "s4", href: "https://youtube.com", iconData: "", active: true }
    ],
    quickLinks: [
      { id: "q1", label: "SDGS", href: "/sdgs", active: true },
      { id: "q2", label: "Hujjat almashinuv", href: "/docs", active: true },
      { id: "q3", label: "HEMIS", href: "https://hemis.example", active: true }
    ]
  },
  main: {
    menu: [
      {
        id: "m1",
        active: true,
        titleUz: "UNIVERSITET",
        titleRu: "УНИВЕРСИТЕТ",
        titleEn: "UNIVERSITY",
        linkUz: "/universitet",
        linkRu: "/ru/universitet",
        linkEn: "/en/universitet"
      },
      {
        id: "m2",
        active: true,
        titleUz: "FAOLIYAT",
        titleRu: "ДЕЯТЕЛЬНОСТЬ",
        titleEn: "ACTIVITIES",
        linkUz: "/faoliyat",
        linkRu: "/ru/faoliyat",
        linkEn: "/en/faoliyat"
      }
    ]
  }
};

// ===================== loadState() + MIGRATION =====================
// 1) old phone string -> phone object
// 2) old main.menu label/href/info -> title/link
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw);

    // --- migration: phone string -> object
    if (parsed?.topBar?.phone && typeof parsed.topBar.phone === "string") {
      parsed.topBar.phone = { id: "p1", value: parsed.topBar.phone, active: true };
    }
    if (!parsed?.topBar?.phone) {
      parsed.topBar = parsed.topBar || {};
      parsed.topBar.phone = { id: "p1", value: "+998 (73) 241-12-06", active: true };
    }

    // --- migration: main.menu label*/href*/info* -> title*/link*
    if (Array.isArray(parsed?.main?.menu)) {
      parsed.main.menu = parsed.main.menu.map((m) => {
        // yangi format bo‘lsa tegmaymiz
        if ("titleUz" in m || "linkUz" in m) return m;

        // eski formatdan yangi formatga
        return {
          id: m.id || uid(),
          active: m.active ?? true,
          titleUz: m.labelUz ?? "",
          titleRu: m.labelRu ?? "",
          titleEn: m.labelEn ?? "",
          linkUz: m.hrefUz ?? "",
          linkRu: m.hrefRu ?? "",
          linkEn: m.hrefEn ?? ""
        };
      });
    }

    return parsed && typeof parsed === "object" ? parsed : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

// ===================== Universal Dialog =====================
// fields: TextField / Switch
// extra: custom UI (masalan Social icon upload)
function ItemDialog({ open, title, initial, fields, extra, onClose, onSave }) {
  const [data, setData] = useState(initial || {});
  const [err, setErr] = useState("");

  useEffect(() => {
    setData(initial || {});
    setErr("");
  }, [initial, open]);

  const handleSave = () => {
    const missing = fields.some((f) => f.required && !String(data[f.name] ?? "").trim());
    if (missing) {
      setErr("Majburiy maydon(lar) bo‘sh.");
      return;
    }
    setErr("");
    onSave(data);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {err ? <Alert severity="warning">{err}</Alert> : null}

          {/* custom UI */}
          {extra ? extra({ data, setData }) : null}

          {/* fields */}
          {fields.map((f) => {
            if (f.type === "switch") {
              return (
                <FormControlLabel
                  key={f.name}
                  control={
                    <Switch
                      checked={!!data[f.name]}
                      onChange={(e) => setData((p) => ({ ...p, [f.name]: e.target.checked }))}
                    />
                  }
                  label={f.label}
                />
              );
            }

            return (
              <TextField
                key={f.name}
                label={f.label}
                value={data[f.name] ?? ""}
                onChange={(e) => setData((p) => ({ ...p, [f.name]: e.target.value }))}
                fullWidth
                multiline={!!f.multiline}
                minRows={f.multiline ? 2 : 1}
              />
            );
          })}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button color="inherit" onClick={onClose}>
          Bekor
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Saqlash
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ===================== MAIN COMPONENT =====================
export default function HeaderAdminPanel() {
  const [state, setState] = useState(() => loadState());

  // ❗️Siz “Saqlash” bosilganda saqlayman dedingiz, shu sabab AUTO SAVE yo‘q.
  // Agar auto save kerak bo‘lsa: useEffect(() => saveState(state), [state]);

  const update = useCallback((fn) => {
    setState((prev) => fn(structuredClone(prev)));
  }, []);

  // ===================== Dialog controller =====================
  const [dlg, setDlg] = useState({ open: false, kind: "", item: null });
  const openDlg = (kind, item = null) => setDlg({ open: true, kind, item });
  const closeDlg = () => setDlg({ open: false, kind: "", item: null });

  // ===================== List collapses (social/menu item details) =====================
  const [openSocial, setOpenSocial] = useState({});
  const [openMenu, setOpenMenu] = useState({});
  const toggle = (setter, id) => setter((p) => ({ ...p, [id]: !p[id] }));

  // ===================== Accordion for main 3 cards =====================
  const [activeCard, setActiveCard] = useState("brand"); // brand | topbar | mainmenu | ""
  const openOnly = (key) => setActiveCard((prev) => (prev === key ? "" : key));

  // ===================== Save feedback =====================
  const [savedMsg, setSavedMsg] = useState("");
  const saveSection = () => {
    saveState(state);
    setSavedMsg("Saqlandi ✅");
    window.setTimeout(() => setSavedMsg(""), 1500);
  };

  // ===================== Reorder helper =====================
  const move = (arr, index, dir) => {
    const next = index + dir;
    if (next < 0 || next >= arr.length) return arr;
    const copy = [...arr];
    const [it] = copy.splice(index, 1);
    copy.splice(next, 0, it);
    return copy;
  };

  // ===================== Dialog Configs =====================
  const dialogConfig = useMemo(() => {
    const item = dlg.item || {};

    // ---- PHONE edit dialog
    if (dlg.kind === "phone") {
      return {
        title: "Telefon tahrirlash",
        initial: dlg.item ? dlg.item : { id: "p1", value: "", active: true },
        fields: [
          { name: "value", label: "Telefon raqam", required: true },
          { name: "active", label: "Active", type: "switch" }
        ],
        onSave: (data) =>
          update((s) => {
            s.topBar.phone = { ...s.topBar.phone, ...data };
            return s;
          })
      };
    }

    // ---- SOCIAL dialog: icon upload + href
    if (dlg.kind === "social") {
      return {
        title: dlg.item ? "Social tahrirlash" : "Social qo‘shish",
        initial: dlg.item ? item : { id: uid(), href: "", iconData: "", active: true },
        fields: [
          { name: "href", label: "Link (href)", required: true },
          { name: "active", label: "Active", type: "switch" }
        ],
        extra: ({ data, setData }) => (
          <Card variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5} alignItems="center">
              <Typography fontWeight={800}>Icon rasm (upload)</Typography>

              <Box
                sx={{
                  width: 84,
                  height: 84,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "grid",
                  placeItems: "center",
                  overflow: "hidden",
                  bgcolor: "background.default"
                }}
              >
                {data.iconData ? (
                  <Box
                    component="img"
                    src={data.iconData}
                    alt="icon"
                    sx={{ width: "100%", height: "100%", objectFit: "contain", p: 0.5 }}
                  />
                ) : (
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    Icon yo‘q
                  </Typography>
                )}
              </Box>

              <Stack direction="row" spacing={1}>
                <Button variant="contained" component="label" size="small">
                  Yuklash
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const b64 = await fileToBase64(f);
                      setData((p) => ({ ...p, iconData: b64 }));
                      e.target.value = "";
                    }}
                  />
                </Button>

                <Button
                  color="inherit"
                  size="small"
                  disabled={!data.iconData}
                  onClick={() => setData((p) => ({ ...p, iconData: "" }))}
                >
                  O‘chirish
                </Button>
              </Stack>

              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                PNG/JPG/SVG
              </Typography>
            </Stack>
          </Card>
        ),
        onSave: (data) =>
          update((s) => {
            const idx = s.topBar.socials.findIndex((x) => x.id === data.id);
            if (idx >= 0) s.topBar.socials[idx] = { ...s.topBar.socials[idx], ...data };
            else s.topBar.socials.unshift(data);
            return s;
          })
      };
    }

    // ---- QUICK LINKS dialog
    if (dlg.kind === "quick") {
      return {
        title: dlg.item ? "Quick link tahrirlash" : "Quick link qo‘shish",
        initial: dlg.item ? item : { id: uid(), label: "", href: "", active: true },
        fields: [
          { name: "label", label: "Title", required: true },
          { name: "href", label: "Link (href)", required: true },
          { name: "active", label: "Active", type: "switch" }
        ],
        onSave: (data) =>
          update((s) => {
            const idx = s.topBar.quickLinks.findIndex((x) => x.id === data.id);
            if (idx >= 0) s.topBar.quickLinks[idx] = data;
            else s.topBar.quickLinks.unshift(data);
            return s;
          })
      };
    }

    // ---- MAIN MENU dialog (FAQAT TITLE+LINK)
    if (dlg.kind === "menu") {
      return {
        title: dlg.item ? "Main menu tahrirlash" : "Main menu qo‘shish",
        initial: dlg.item
          ? item
          : {
              id: uid(),
              active: true,
              titleUz: "",
              titleRu: "",
              titleEn: "",
              linkUz: "",
              linkRu: "",
              linkEn: ""
            },
        fields: [
          { name: "titleUz", label: "Title (UZ)", required: true },
          { name: "titleRu", label: "Title (RU)", required: true },
          { name: "titleEn", label: "Title (EN)", required: true },

          { name: "linkUz", label: "Link (UZ)", required: true },
          { name: "linkRu", label: "Link (RU)", required: true },
          { name: "linkEn", label: "Link (EN)", required: true },

          { name: "active", label: "Active", type: "switch" }
        ],
        onSave: (data) =>
          update((s) => {
            const idx = s.main.menu.findIndex((x) => x.id === data.id);
            if (idx >= 0) s.main.menu[idx] = { ...s.main.menu[idx], ...data };
            else s.main.menu.push(data);
            return s;
          })
      };
    }

    return null;
  }, [dlg, update]);

  // ===================== delete handlers =====================
  const del = (kind, id) => {
    if (!window.confirm("O‘chirilsinmi?")) return;

    update((s) => {
      if (kind === "phone") s.topBar.phone = { id: "p1", value: "", active: false };
      if (kind === "social") s.topBar.socials = s.topBar.socials.filter((x) => x.id !== id);
      if (kind === "quick") s.topBar.quickLinks = s.topBar.quickLinks.filter((x) => x.id !== id);
      if (kind === "menu") s.main.menu = s.main.menu.filter((x) => x.id !== id);
      return s;
    });
  };

  // ===================== UI =====================
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Stack spacing={3}>
          {savedMsg ? <Alert severity="success">{savedMsg}</Alert> : null}

          {/* =========================================================
              1) BRAND CARD
          ========================================================== */}
          <Card variant="outlined">
            <CardHeader
              title="Oliygoh logotipi"
              subheader="Logo rasm yuklash (UZ/RU/EN) + Home URL"
              onClick={() => openOnly("brand")}
              sx={{ cursor: "pointer" }}
            />
            <Divider />

            <Collapse in={activeCard === "brand"} timeout="auto" unmountOnExit>
              <CardContent>
                <Stack spacing={2}>
                  <Grid container spacing={2} alignItems="stretch">
                    {[
                      { key: "logoDataUz", label: "Logo (UZ)" },
                      { key: "logoDataRu", label: "Logo (RU)" },
                      { key: "logoDataEn", label: "Logo (EN)" }
                    ].map((x) => (
                      <Grid item xs={12} md={4} key={x.key} sx={{ display: "flex" }}>
                        <Card
                          variant="outlined"
                          sx={{
                            p: 2,
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5
                          }}
                        >
                          <Typography fontWeight={800} textAlign="center">
                            {x.label}
                          </Typography>

                          {/* IMG preview: objectFit contain => to‘liq ko‘rinadi */}
                          <Box
                            sx={{
                           
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: "divider",
                              bgcolor: "background.default",
                              display: "grid",
                              placeItems: "center",
                              overflow: "hidden"
                            }}
                          >
                            {state.brand[x.key] ? (
                              <Box
                                component="img"
                                src={state.brand[x.key]}
                                alt={x.label}
                                sx={{ width: "50%", height: "100%", objectFit: "contain", p: 1 }}
                              />
                            ) : (
                              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                                Logo yo‘q
                              </Typography>
                            )}
                          </Box>

                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button variant="contained" component="label" size="small">
                              Yuklash
                              <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={async (e) => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;
                                  const b64 = await fileToBase64(f);
                                  update((s) => {
                                    s.brand[x.key] = b64;
                                    return s;
                                  });
                                  e.target.value = "";
                                }}
                              />
                            </Button>

                            <Button
                              color="inherit"
                              size="small"
                              disabled={!state.brand[x.key]}
                              onClick={() =>
                                update((s) => {
                                  s.brand[x.key] = "";
                                  return s;
                                })
                              }
                            >
                              O‘chirish
                            </Button>
                          </Stack>

                          <Typography variant="caption" sx={{ opacity: 0.7, textAlign: "center" }}>
                            PNG/JPG/SVG rasm tanlang.
                          </Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <TextField
                    label="Home URL"
                    value={state.brand.homeUrl}
                    onChange={(e) =>
                      update((s) => {
                        s.brand.homeUrl = e.target.value;
                        return s;
                      })
                    }
                    fullWidth
                  />

                  <Stack direction="row" justifyContent="flex-end">
                    <Button variant="contained" onClick={saveSection}>
                      Saqlash
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Collapse>
          </Card>

          {/* =========================================================
              2) TOP BAR CARD (phone + socials + quickLinks)
          ========================================================== */}
          <Card variant="outlined">
            <CardHeader
              title="Ijtimoiy tarmoqlar, telefon raqami va axborotlar tizimlar"
              subheader="Phone (edit/delete) + Socials (icon+link) + Quick links"
              onClick={() => openOnly("topbar")}
              sx={{ cursor: "pointer" }}
            />
            <Divider />

            <Collapse in={activeCard === "topbar"} timeout="auto" unmountOnExit>
              <CardContent>
                <Stack spacing={2}>
                  {/* ===================== PHONE (edit/delete) ===================== */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography fontWeight={800}>Telefon</Typography>

                    <Stack direction="row" spacing={1}>
                      <Button size="small" startIcon={<EditOutlined />} onClick={() => openDlg("phone", state.topBar.phone)}>
                        Edit
                      </Button>
                      <Button size="small" color="error" startIcon={<DeleteOutlined />} onClick={() => del("phone", "p1")}>
                        Delete
                      </Button>
                    </Stack>
                  </Stack>

                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                      <Stack spacing={0.5}>
                        <Typography fontWeight={900}>{state.topBar.phone?.value || "-"}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {state.topBar.phone?.active ? "ACTIVE" : "OFF"}
                        </Typography>
                      </Stack>

                      {!state.topBar.phone?.active ? <Chip size="small" label="OFF" /> : null}
                    </Stack>
                  </Card>

                  {/* ===================== SOCIALS ===================== */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography fontWeight={800}>Social (icon + link)</Typography>
                    <Button size="small" startIcon={<PlusOutlined />} onClick={() => openDlg("social")}>
                      Qo‘shish
                    </Button>
                  </Stack>

                  <List dense sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    {state.topBar.socials.map((x, i) => (
                      <React.Fragment key={x.id}>
                        <ListItem
                          onClick={() => toggle(setOpenSocial, x.id)}
                          sx={{ cursor: "pointer" }}
                          secondaryAction={
                            <Stack direction="row" spacing={0.5} onClick={(e) => e.stopPropagation()}>
                              <Tooltip title="Yuqoriga">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    update((s) => {
                                      s.topBar.socials = move(s.topBar.socials, i, -1);
                                      return s;
                                    })
                                  }
                                >
                                  <ArrowUpOutlined />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Pastga">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    update((s) => {
                                      s.topBar.socials = move(s.topBar.socials, i, +1);
                                      return s;
                                    })
                                  }
                                >
                                  <ArrowDownOutlined />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => openDlg("social", x)}>
                                  <EditOutlined />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => del("social", x.id)}>
                                  <DeleteOutlined />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          }
                        >
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: 1,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    overflow: "hidden",
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: "background.default"
                                  }}
                                >
                                  {x.iconData ? (
                                    <Box
                                      component="img"
                                      src={x.iconData}
                                      alt="icon"
                                      sx={{ width: "100%", height: "100%", objectFit: "contain", p: 0.5 }}
                                    />
                                  ) : (
                                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                                      IMG
                                    </Typography>
                                  )}
                                </Box>

                                {!x.active ? <Chip size="small" label="OFF" /> : null}
                              </Stack>
                            }
                            secondary={x.href}
                          />
                        </ListItem>

                        <Collapse in={!!openSocial[x.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ px: 2, pb: 2 }}>
                            <Divider sx={{ mb: 1 }} />
                            <Stack spacing={1}>
                              <Typography variant="caption" sx={{ opacity: 0.75 }}>
                                Preview:
                              </Typography>

                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 1.5,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    overflow: "hidden",
                                    display: "grid",
                                    placeItems: "center",
                                    bgcolor: "background.default"
                                  }}
                                >
                                  {x.iconData ? (
                                    <Box
                                      component="img"
                                      src={x.iconData}
                                      alt="icon"
                                      sx={{ width: "100%", height: "100%", objectFit: "contain", p: 0.5 }}
                                    />
                                  ) : (
                                    <Typography variant="caption" sx={{ opacity: 0.6 }}>
                                      -
                                    </Typography>
                                  )}
                                </Box>

                                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                                  {x.href}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </Collapse>

                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>

                  {/* ===================== QUICK LINKS ===================== */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography fontWeight={800}>Quick links</Typography>
                    <Button size="small" startIcon={<PlusOutlined />} onClick={() => openDlg("quick")}>
                      Qo‘shish
                    </Button>
                  </Stack>

                  <List dense sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    {state.topBar.quickLinks.map((x, i) => (
                      <React.Fragment key={x.id}>
                        <ListItem
                          secondaryAction={
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Yuqoriga">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    update((s) => {
                                      s.topBar.quickLinks = move(s.topBar.quickLinks, i, -1);
                                      return s;
                                    })
                                  }
                                >
                                  <ArrowUpOutlined />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Pastga">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    update((s) => {
                                      s.topBar.quickLinks = move(s.topBar.quickLinks, i, +1);
                                      return s;
                                    })
                                  }
                                >
                                  <ArrowDownOutlined />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => openDlg("quick", x)}>
                                  <EditOutlined />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => del("quick", x.id)}>
                                  <DeleteOutlined />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          }
                        >
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography fontWeight={800}>{x.label}</Typography>
                                {!x.active ? <Chip size="small" label="OFF" /> : null}
                              </Stack>
                            }
                            secondary={x.href}
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>

                  <Stack direction="row" justifyContent="flex-end">
                    <Button variant="contained" onClick={saveSection}>
                      Saqlash
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Collapse>
          </Card>

          {/* =========================================================
              3) MAIN MENU CARD  (FAQAT TITLE + LINK)
          ========================================================== */}
          <Card variant="outlined">
            <CardHeader
              title="Asosiy menu itemlar (Navbar)"
              subheader="Title (UZ/RU/EN) + Link (UZ/RU/EN)"
              onClick={() => openOnly("mainmenu")}
              sx={{ cursor: "pointer" }}
            />
            <Divider />

            <Collapse in={activeCard === "mainmenu"} timeout="auto" unmountOnExit>
              <CardContent>
                <Stack spacing={2}>
                  {/* Header row */}
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography fontWeight={900}>Menu itemlar</Typography>
                    <Button size="small" startIcon={<PlusOutlined />} onClick={() => openDlg("menu")}>
                      Menu qo‘shish
                    </Button>
                  </Stack>

                  {/* List */}
                  <List dense sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    {state.main.menu.map((m, i) => (
                      <React.Fragment key={m.id}>
                      <ListItem
                        onClick={() => toggle(setOpenMenu, m.id)}
                        sx={{ cursor: "pointer" }}
                        secondaryAction={
                          // HAMMA ICONLAR ONGDA: Up/Down + Active + Edit + Delete
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* UP */}
                            <Tooltip title="Yuqoriga">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={i === 0}
                                  onClick={() =>
                                    update((s) => {
                                      s.main.menu = move(s.main.menu, i, -1);
                                      return s;
                                    })
                                  }
                                >
                                  <ArrowUpOutlined />
                                </IconButton>
                              </span>
                            </Tooltip>

                            {/* DOWN */}
                            <Tooltip title="Pastga">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={i === state.main.menu.length - 1}
                                  onClick={() =>
                                    update((s) => {
                                      s.main.menu = move(s.main.menu, i, +1);
                                      return s;
                                    })
                                  }
                                >
                                  <ArrowDownOutlined />
                                </IconButton>
                              </span>
                            </Tooltip>

                            {/* ACTIVE */}
                            <Tooltip title={m.active ? "Active" : "OFF"}>
                              <Switch
                                size="small"
                                checked={!!m.active}
                                onChange={(e) =>
                                  update((s) => {
                                    const idx = s.main.menu.findIndex((x) => x.id === m.id);
                                    if (idx >= 0) s.main.menu[idx].active = e.target.checked;
                                    return s;
                                  })
                                }
                              />
                            </Tooltip>

                            {/* EDIT */}
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openDlg("menu", m)}>
                                <EditOutlined />
                              </IconButton>
                            </Tooltip>

                            {/* DELETE (QIZIL) */}
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => del("menu", m.id)}>
                                <DeleteOutlined />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        }
          >
                        {/* endi chap tomonda move yo‘q */}
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography fontWeight={900}>{m.titleUz || "(UZ title yo‘q)"}</Typography>
                              {!m.active ? <Chip size="small" label="OFF" /> : null}
                            </Stack>
                          }
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <LinkOutlined />
                              <Typography variant="caption">{m.linkUz || "-"}</Typography>
                            </Stack>
                          }
                        />
                      </ListItem>


                        {/* Details (collapse) */}
                        <Collapse in={!!openMenu[m.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ px: 2, pb: 2 }}>
                            <Divider sx={{ mb: 1 }} />

                            <Stack spacing={1.2}>
                              <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 800 }}>
                                UZ
                              </Typography>
                              <Typography variant="body2">
                                <b>Title:</b> {m.titleUz || "-"} &nbsp;|&nbsp; <b>Link:</b>{" "}
                                {m.linkUz || "-"}
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.7, fontWeight: 800, mt: 1 }}
                              >
                                RU
                              </Typography>
                              <Typography variant="body2">
                                <b>Title:</b> {m.titleRu || "-"} &nbsp;|&nbsp; <b>Link:</b>{" "}
                                {m.linkRu || "-"}
                              </Typography>

                              <Typography
                                variant="caption"
                                sx={{ opacity: 0.7, fontWeight: 800, mt: 1 }}
                              >
                                EN
                              </Typography>
                              <Typography variant="body2">
                                <b>Title:</b> {m.titleEn || "-"} &nbsp;|&nbsp; <b>Link:</b>{" "}
                                {m.linkEn || "-"}
                              </Typography>
                            </Stack>
                          </Box>
                        </Collapse>

                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>

                  {/* Footer buttons */}
                  
                </Stack>
              </CardContent>
            </Collapse>
          </Card>



        </Stack>
      </Grid>

      {/* ===================== Dialog Render ===================== */}
      {dialogConfig ? (
        <ItemDialog
          open={dlg.open}
          title={dialogConfig.title}
          initial={dialogConfig.initial}
          fields={dialogConfig.fields}
          extra={dialogConfig.extra}
          onClose={closeDlg}
          onSave={(data) => {
            dialogConfig.onSave(data);
            closeDlg();
          }}
        />
      ) : null}
    </Grid>
  );
}
