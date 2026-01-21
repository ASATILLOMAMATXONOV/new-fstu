import React, { useEffect, useMemo, useState } from "react";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
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
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import InputBase from "@mui/material/InputBase";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Alert from "@mui/material/Alert";

// Icons
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import ArrowUpOutlined from "@ant-design/icons/ArrowUpOutlined";
import ArrowDownOutlined from "@ant-design/icons/ArrowDownOutlined";
import LinkOutlined from "@ant-design/icons/LinkOutlined";
import DownOutlined from "@ant-design/icons/DownOutlined";
import SearchOutlined from "@ant-design/icons/SearchOutlined";

// ------- storage -------
const LS_KEY = "app_header_menu_v1";

const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

const DEFAULT_STATE = {
  brand: {
    title: "FARG‘ONA DAVLAT TEXNIKA UNIVERSITETI",
    logoUrl: "", // xohlasangiz keyin berasiz (rasm url)
    homeUrl: "/",
  },
  topBar: {
    phone: "+998 (73) 241-12-06",
    socials: [
      { id: "s1", label: "Facebook", href: "https://facebook.com", icon: "fb", active: true },
      { id: "s2", label: "Instagram", href: "https://instagram.com", icon: "ig", active: true },
      { id: "s3", label: "Telegram", href: "https://t.me", icon: "tg", active: true },
      { id: "s4", label: "YouTube", href: "https://youtube.com", icon: "yt", active: true },
    ],
    quickLinks: [
      { id: "q1", label: "SDGS", href: "/sdgs", active: true },
      { id: "q2", label: "Hujjat almashinuv", href: "/docs", active: true },
      { id: "q3", label: "HEMIS", href: "https://hemis.example", active: true },
    ],
    languages: [
      { id: "l1", label: "UZ", href: "#", active: true },
      { id: "l2", label: "RU", href: "#", active: true },
      { id: "l3", label: "EN", href: "#", active: true },
    ],
  },
  main: {
    searchPlaceholder: "Qidiruv...",
    loginText: "LOGIN",
    loginHref: "/login",
    menu: [
      {
        id: "m1",
        label: "UNIVERSITET",
        href: "/universitet",
        type: "dropdown",
        active: true,
        children: [
          { id: "m1c1", label: "Rektorat", href: "/universitet/rektorat", active: true },
          { id: "m1c2", label: "Tuzilma", href: "/universitet/tuzilma", active: true },
        ],
      },
      {
        id: "m2",
        label: "FAOLIYAT",
        href: "/faoliyat",
        type: "dropdown",
        active: true,
        children: [
          { id: "m2c1", label: "Ilmiy", href: "/faoliyat/ilmiy", active: true },
          { id: "m2c2", label: "Xalqaro", href: "/faoliyat/xalqaro", active: true },
        ],
      },
      { id: "m3", label: "TALABALAR", href: "/talabalar", type: "link", active: true },
      { id: "m4", label: "ABITURIYENT", href: "/abituriyent", type: "link", active: true },
      { id: "m5", label: "YANGILIKLAR", href: "/yangiliklar", type: "link", active: true },
    ],
  },
};

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

// ------- tiny icon map (topbar) -------
function SocialIcon({ type }) {
  const common = { width: 18, height: 18, display: "inline-block" };
  // soddalashtirilgan SVG-ish “icon” ko’rinish (real iconlar qo‘ymoqchi bo‘lsangiz MUI icons bilan almashtiramiz)
  const txt =
    type === "fb" ? "f" : type === "ig" ? "i" : type === "tg" ? "t" : type === "yt" ? "▶" : "?";
  return (
    <Box
      sx={{
        ...common,
        border: "1px solid rgba(255,255,255,0.6)",
        borderRadius: "4px",
        fontSize: 12,
        lineHeight: "18px",
        textAlign: "center",
        color: "white",
        userSelect: "none",
      }}
    >
      {txt}
    </Box>
  );
}

// ------- Editor dialog (universal) -------
function ItemDialog({ open, title, initial, fields, onClose, onSave }) {
  const [data, setData] = useState(initial || {});
  const [err, setErr] = useState("");

  useEffect(() => {
    setData(initial || {});
    setErr("");
  }, [initial, open]);

  const handleSave = () => {
    // minimal validation: label + href bor bo‘lsa
    if (fields.some((f) => f.name === "label") && !String(data.label || "").trim()) {
      setErr("Label majburiy.");
      return;
    }
    if (fields.some((f) => f.name === "href") && !String(data.href || "").trim()) {
      setErr("Href (link) majburiy.");
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

// ------- Preview Header -------
function HeaderPreview({ state }) {
  const topBg = "#0b3b5a"; // rasmga yaqin ko‘k
  const mainBg = "#ffffff";

  // dropdown menu anchors
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeDrop, setActiveDrop] = useState(null);

  const openDrop = (e, item) => {
    setAnchorEl(e.currentTarget);
    setActiveDrop(item);
  };
  const closeDrop = () => {
    setAnchorEl(null);
    setActiveDrop(null);
  };

  const menu = state.main.menu.filter((m) => m.active);

  return (
    <Card>
      <CardHeader title="Live Preview" subheader="Rasmga o‘xshash header ko‘rinishi" />
      <Divider />
      <Box>
        {/* TOP BAR */}
        <Box
          sx={{
            bgcolor: topBg,
            color: "white",
            px: 2,
            py: 0.6,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {state.topBar.socials
              .filter((s) => s.active)
              .map((s) => (
                <Tooltip key={s.id} title={s.label}>
                  <Box
                    component="a"
                    href={s.href}
                    provenancetag="preview"
                    sx={{ color: "inherit", textDecoration: "none" }}
                  >
                    <SocialIcon type={s.icon} />
                  </Box>
                </Tooltip>
              ))}
            <Box sx={{ opacity: 0.7, mx: 1 }}>|</Box>
            <Typography variant="caption" sx={{ opacity: 0.95 }}>
              {state.topBar.phone}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: "wrap" }}>
            {state.topBar.quickLinks
              .filter((q) => q.active)
              .map((q) => (
                <Typography
                  key={q.id}
                  component="a"
                  href={q.href}
                  provenancetag="preview"
                  variant="caption"
                  sx={{ color: "white", textDecoration: "none", fontWeight: 700, opacity: 0.95 }}
                >
                  {q.label}
                </Typography>
              ))}

            <Stack direction="row" spacing={1} alignItems="center">
              {state.topBar.languages
                .filter((l) => l.active)
                .map((l) => (
                  <Chip
                    key={l.id}
                    label={l.label}
                    size="small"
                    component="a"
                    href={l.href}
                    clickable
                    provenancetag="preview"
                    sx={{
                      bgcolor: "rgba(255,255,255,0.12)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.25)",
                      height: 22,
                    }}
                  />
                ))}
            </Stack>
          </Stack>
        </Box>

        {/* MAIN BAR */}
        <Box
          sx={{
            bgcolor: mainBg,
            px: 2,
            py: 1.3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 280 }}>
            {/* Logo placeholder */}
            <Box
              component="a"
              href={state.brand.homeUrl}
              provenancetag="preview"
              sx={{ display: "flex", alignItems: "center", gap: 1, textDecoration: "none" }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  border: "2px solid #0b3b5a",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  color: "#0b3b5a",
                  userSelect: "none",
                }}
              >
                FTU
              </Box>
              <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#0b3b5a" }}>
                {state.brand.title}
              </Typography>
            </Box>
          </Stack>

          {/* Menu */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: "wrap" }}>
            {menu.map((m) => {
              const isDrop = m.type === "dropdown" && (m.children || []).some((c) => c.active);
              if (isDrop) {
                return (
                  <Button
                    key={m.id}
                    onClick={(e) => openDrop(e, m)}
                    endIcon={<DownOutlined />}
                    sx={{ fontWeight: 800 }}
                  >
                    {m.label}
                  </Button>
                );
              }
              return (
                <Button key={m.id} href={m.href} provenancetag="preview" sx={{ fontWeight: 800 }}>
                  {m.label}
                </Button>
              );
            })}
          </Stack>

          {/* Search + login */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #e5e7eb",
                borderRadius: 2,
                px: 1,
                height: 38,
                minWidth: 220,
                bgcolor: "#f7fafc",
              }}
            >
              <SearchOutlined />
              <InputBase
                placeholder={state.main.searchPlaceholder}
                sx={{ ml: 1, flex: 1, fontSize: 14 }}
              />
            </Box>
            <Button
              variant="outlined"
              href={state.main.loginHref}
              provenancetag="preview"
              sx={{ fontWeight: 900, px: 3, borderRadius: 2 }}
            >
              {state.main.loginText}
            </Button>
          </Stack>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={closeDrop}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        {(activeDrop?.children || [])
          .filter((c) => c.active)
          .map((c) => (
            <MenuItem key={c.id} component="a" href={c.href} onClick={closeDrop} provenancetag="preview">
              {c.label}
            </MenuItem>
          ))}
      </Menu>
    </Card>
  );
}

// ------- Main Admin Panel -------
export default function WidgetData() {
  const [state, setState] = useState(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  // dialogs
  const [dlg, setDlg] = useState({ open: false, kind: "", item: null, parentId: null });

  const openDlg = (kind, item = null, parentId = null) => setDlg({ open: true, kind, item, parentId });
  const closeDlg = () => setDlg({ open: false, kind: "", item: null, parentId: null });

  const update = (fn) => setState((prev) => fn(structuredClone(prev)));

  // ---- helpers: reorder ----
  const move = (arr, index, dir) => {
    const next = index + dir;
    if (next < 0 || next >= arr.length) return arr;
    const copy = [...arr];
    const [it] = copy.splice(index, 1);
    copy.splice(next, 0, it);
    return copy;
  };

  // ---- topbar CRUD ----
  const socials = state.topBar.socials;
  const quickLinks = state.topBar.quickLinks;
  const languages = state.topBar.languages;

  // ---- main menu CRUD ----
  const mainMenu = state.main.menu;

  // dialog configs
  const dialogConfig = useMemo(() => {
    const item = dlg.item || {};
    if (dlg.kind === "social") {
      return {
        title: dlg.item ? "Social tahrirlash" : "Social qo‘shish",
        initial: dlg.item
          ? item
          : { id: uid(), label: "", href: "", icon: "fb", active: true },
        fields: [
          { name: "label", label: "Nomi (label)" },
          { name: "href", label: "Link (href)" },
          { name: "icon", label: "Icon tipi: fb | ig | tg | yt" },
          { name: "active", label: "Active", type: "switch" },
        ],
        onSave: (data) =>
          update((s) => {
            const idx = s.topBar.socials.findIndex((x) => x.id === data.id);
            if (idx >= 0) s.topBar.socials[idx] = data;
            else s.topBar.socials.unshift(data);
            return s;
          }),
      };
    }
    if (dlg.kind === "quick") {
      return {
        title: dlg.item ? "Quick link tahrirlash" : "Quick link qo‘shish",
        initial: dlg.item ? item : { id: uid(), label: "", href: "", active: true },
        fields: [
          { name: "label", label: "Nomi (label)" },
          { name: "href", label: "Link (href)" },
          { name: "active", label: "Active", type: "switch" },
        ],
        onSave: (data) =>
          update((s) => {
            const idx = s.topBar.quickLinks.findIndex((x) => x.id === data.id);
            if (idx >= 0) s.topBar.quickLinks[idx] = data;
            else s.topBar.quickLinks.unshift(data);
            return s;
          }),
      };
    }
    if (dlg.kind === "lang") {
      return {
        title: dlg.item ? "Til tahrirlash" : "Til qo‘shish",
        initial: dlg.item ? item : { id: uid(), label: "UZ", href: "#", active: true },
        fields: [
          { name: "label", label: "Kod (UZ/RU/EN)" },
          { name: "href", label: "Link (href)" },
          { name: "active", label: "Active", type: "switch" },
        ],
        onSave: (data) =>
          update((s) => {
            const idx = s.topBar.languages.findIndex((x) => x.id === data.id);
            if (idx >= 0) s.topBar.languages[idx] = data;
            else s.topBar.languages.push(data);
            return s;
          }),
      };
    }
    if (dlg.kind === "menu") {
      return {
        title: dlg.item ? "Menu tahrirlash" : "Menu qo‘shish",
        initial: dlg.item
          ? item
          : { id: uid(), label: "", href: "", type: "link", active: true, children: [] },
        fields: [
          { name: "label", label: "Menu nomi" },
          { name: "href", label: "Link (href)" },
          { name: "type", label: "Type: link | dropdown" },
          { name: "active", label: "Active", type: "switch" },
        ],
        onSave: (data) =>
          update((s) => {
            const idx = s.main.menu.findIndex((x) => x.id === data.id);
            if (idx >= 0) s.main.menu[idx] = { ...s.main.menu[idx], ...data };
            else s.main.menu.push({ ...data, children: data.children || [] });
            return s;
          }),
      };
    }
    if (dlg.kind === "child") {
      return {
        title: dlg.item ? "Dropdown item tahrirlash" : "Dropdown item qo‘shish",
        initial: dlg.item ? item : { id: uid(), label: "", href: "", active: true },
        fields: [
          { name: "label", label: "Nomi" },
          { name: "href", label: "Link (href)" },
          { name: "active", label: "Active", type: "switch" },
        ],
        onSave: (data) =>
          update((s) => {
            const p = s.main.menu.find((x) => x.id === dlg.parentId);
            if (!p) return s;
            p.children = p.children || [];
            const idx = p.children.findIndex((x) => x.id === data.id);
            if (idx >= 0) p.children[idx] = data;
            else p.children.push(data);
            return s;
          }),
      };
    }
    return null;
  }, [dlg, update]);

  // delete handlers
  const del = (kind, id, parentId = null) => {
    if (!window.confirm("O‘chirilsinmi?")) return;
    update((s) => {
      if (kind === "social") s.topBar.socials = s.topBar.socials.filter((x) => x.id !== id);
      if (kind === "quick") s.topBar.quickLinks = s.topBar.quickLinks.filter((x) => x.id !== id);
      if (kind === "lang") s.topBar.languages = s.topBar.languages.filter((x) => x.id !== id);
      if (kind === "menu") s.main.menu = s.main.menu.filter((x) => x.id !== id);
      if (kind === "child") {
        const p = s.main.menu.find((x) => x.id === parentId);
        if (p) p.children = (p.children || []).filter((x) => x.id !== id);
      }
      return s;
    });
  };

  return (
    <Grid container spacing={3}>
      {/* LEFT: controls */}
      <Grid item xs={12} lg={6}>
        <Stack spacing={3}>
          {/* Brand */}
          <Card>
            <CardHeader title="Brand / Header sozlamalari" />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="Universitet nomi (brand title)"
                  value={state.brand.title}
                  onChange={(e) =>
                    update((s) => {
                      s.brand.title = e.target.value;
                      return s;
                    })
                  }
                  fullWidth
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
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
                  <TextField
                    label="Logo URL (ixtiyoriy)"
                    value={state.brand.logoUrl}
                    onChange={(e) =>
                      update((s) => {
                        s.brand.logoUrl = e.target.value;
                        return s;
                      })
                    }
                    fullWidth
                  />
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Top bar */}
          <Card>
            <CardHeader title="Top Bar" subheader="Social / Telefon / Quick links / Tillar" />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  label="Telefon"
                  value={state.topBar.phone}
                  onChange={(e) =>
                    update((s) => {
                      s.topBar.phone = e.target.value;
                      return s;
                    })
                  }
                  fullWidth
                />

                {/* Socials */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography fontWeight={800}>Social iconlar</Typography>
                  <Button size="small" startIcon={<PlusOutlined />} onClick={() => openDlg("social")}>
                    Qo‘shish
                  </Button>
                </Stack>
                <List dense sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  {socials.map((x, i) => (
                    <ListItem
                      key={x.id}
                      secondaryAction={
                        <Stack direction="row" spacing={0.5}>
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
                            <IconButton size="small" onClick={() => del("social", x.id)}>
                              <DeleteOutlined />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      }
                    >
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip size="small" label={x.icon} />
                            <Typography fontWeight={700}>{x.label}</Typography>
                            {!x.active ? <Chip size="small" label="OFF" /> : null}
                          </Stack>
                        }
                        secondary={x.href}
                      />
                    </ListItem>
                  ))}
                </List>

                {/* Quick links */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography fontWeight={800}>Quick links</Typography>
                  <Button size="small" startIcon={<PlusOutlined />} onClick={() => openDlg("quick")}>
                    Qo‘shish
                  </Button>
                </Stack>
                <List dense sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  {quickLinks.map((x, i) => (
                    <ListItem
                      key={x.id}
                      secondaryAction={
                        <Stack direction="row" spacing={0.5}>
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
                          <IconButton size="small" onClick={() => openDlg("quick", x)}>
                            <EditOutlined />
                          </IconButton>
                          <IconButton size="small" onClick={() => del("quick", x.id)}>
                            <DeleteOutlined />
                          </IconButton>
                        </Stack>
                      }
                    >
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography fontWeight={700}>{x.label}</Typography>
                            {!x.active ? <Chip size="small" label="OFF" /> : null}
                          </Stack>
                        }
                        secondary={x.href}
                      />
                    </ListItem>
                  ))}
                </List>

                {/* Languages */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography fontWeight={800}>Tillar</Typography>
                  <Button size="small" startIcon={<PlusOutlined />} onClick={() => openDlg("lang")}>
                    Qo‘shish
                  </Button>
                </Stack>
                <List dense sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  {languages.map((x, i) => (
                    <ListItem
                      key={x.id}
                      secondaryAction={
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              update((s) => {
                                s.topBar.languages = move(s.topBar.languages, i, -1);
                                return s;
                              })
                            }
                          >
                            <ArrowUpOutlined />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              update((s) => {
                                s.topBar.languages = move(s.topBar.languages, i, +1);
                                return s;
                              })
                            }
                          >
                            <ArrowDownOutlined />
                          </IconButton>
                          <IconButton size="small" onClick={() => openDlg("lang", x)}>
                            <EditOutlined />
                          </IconButton>
                          <IconButton size="small" onClick={() => del("lang", x.id)}>
                            <DeleteOutlined />
                          </IconButton>
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
                  ))}
                </List>
              </Stack>
            </CardContent>
          </Card>

          {/* Main menu */}
          <Card>
            <CardHeader title="Main Menu" subheader="Menu itemlar + dropdown child itemlar" />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    label="Search placeholder"
                    value={state.main.searchPlaceholder}
                    onChange={(e) =>
                      update((s) => {
                        s.main.searchPlaceholder = e.target.value;
                        return s;
                      })
                    }
                    fullWidth
                  />
                  <TextField
                    label="Login text"
                    value={state.main.loginText}
                    onChange={(e) =>
                      update((s) => {
                        s.main.loginText = e.target.value;
                        return s;
                      })
                    }
                    fullWidth
                  />
                </Stack>
                <TextField
                  label="Login href"
                  value={state.main.loginHref}
                  onChange={(e) =>
                    update((s) => {
                      s.main.loginHref = e.target.value;
                      return s;
                    })
                  }
                  fullWidth
                />

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography fontWeight={900}>Menu itemlar</Typography>
                  <Button size="small" startIcon={<PlusOutlined />} onClick={() => openDlg("menu")}>
                    Menu qo‘shish
                  </Button>
                </Stack>

                <List dense sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                  {mainMenu.map((m, i) => (
                    <Box key={m.id}>
                      <ListItem
                        secondaryAction={
                          <Stack direction="row" spacing={0.5}>
                            <Tooltip title="Yuqoriga">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  update((s) => {
                                    s.main.menu = move(s.main.menu, i, -1);
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
                                    s.main.menu = move(s.main.menu, i, +1);
                                    return s;
                                  })
                                }
                              >
                                <ArrowDownOutlined />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Dropdown item qo‘shish">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={m.type !== "dropdown"}
                                  onClick={() => openDlg("child", null, m.id)}
                                >
                                  <PlusOutlined />
                                </IconButton>
                              </span>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openDlg("menu", m)}>
                                <EditOutlined />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => del("menu", m.id)}>
                                <DeleteOutlined />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        }
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography fontWeight={800}>{m.label}</Typography>
                              <Chip size="small" label={m.type} />
                              {!m.active ? <Chip size="small" label="OFF" /> : null}
                            </Stack>
                          }
                          secondary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <LinkOutlined />
                              <Typography variant="caption">{m.href}</Typography>
                            </Stack>
                          }
                        />
                      </ListItem>

                      {/* children */}
                      {m.type === "dropdown" && (m.children || []).length ? (
                        <Box sx={{ pl: 2, pb: 1 }}>
                          <Typography variant="caption" fontWeight={800} sx={{ opacity: 0.7 }}>
                            Dropdown itemlar
                          </Typography>
                          <List dense sx={{ mt: 0.5, borderLeft: "2px solid", borderColor: "divider" }}>
                            {(m.children || []).map((c) => (
                              <ListItem
                                key={c.id}
                                secondaryAction={
                                  <Stack direction="row" spacing={0.5}>
                                    <IconButton size="small" onClick={() => openDlg("child", c, m.id)}>
                                      <EditOutlined />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => del("child", c.id, m.id)}>
                                      <DeleteOutlined />
                                    </IconButton>
                                  </Stack>
                                }
                              >
                                <ListItemText
                                  primary={
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Typography fontWeight={700}>{c.label}</Typography>
                                      {!c.active ? <Chip size="small" label="OFF" /> : null}
                                    </Stack>
                                  }
                                  secondary={c.href}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      ) : null}

                      <Divider />
                    </Box>
                  ))}
                </List>

                <Button
                  color="inherit"
                  onClick={() => {
                    if (!window.confirm("Hammasini default holatga qaytaraymi?")) return;
                    setState(DEFAULT_STATE);
                  }}
                >
                  Defaultga qaytarish
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Grid>

      {/* RIGHT: preview */}
      <Grid item xs={12} lg={6}>
        <HeaderPreview state={state} />
      </Grid>

      {/* Dialog */}
      {dialogConfig ? (
        <ItemDialog
          open={dlg.open}
          title={dialogConfig.title}
          initial={dialogConfig.initial}
          fields={dialogConfig.fields}
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
