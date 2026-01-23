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
import MenuItem from "@mui/material/MenuItem";

// ===================== Icons (ant-design) =====================
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import ArrowUpOutlined from "@ant-design/icons/ArrowUpOutlined";
import ArrowDownOutlined from "@ant-design/icons/ArrowDownOutlined";
import LinkOutlined from "@ant-design/icons/LinkOutlined";

// ===================== MUI Icons (tanlanadiganlar) =====================
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import GppGoodOutlinedIcon from "@mui/icons-material/GppGoodOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// ===================== LocalStorage =====================
const LS_KEY = "app_header_menu_v4";
const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

// ===================== helper: file -> base64 =====================
const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

// ===================== MUI ICON PICKER MAP =====================
const ICONS_MAP = {
  campaign: CampaignOutlinedIcon,
  accountBalance: AccountBalanceOutlinedIcon,
  menuBook: MenuBookOutlinedIcon,
  apartment: ApartmentOutlinedIcon,
  school: SchoolOutlinedIcon,
  business: BusinessOutlinedIcon,
  hub: HubOutlinedIcon,
  groups: GroupsOutlinedIcon,
  manageAccounts: ManageAccountsOutlinedIcon,
  factCheck: FactCheckOutlinedIcon,
  gppGood: GppGoodOutlinedIcon,
  reportProblem: ReportProblemOutlinedIcon,
  supportAgent: SupportAgentOutlinedIcon,
  phone: PhoneInTalkOutlinedIcon,
  mail: MailOutlineOutlinedIcon,
  public: PublicOutlinedIcon,
  info: InfoOutlinedIcon
};

const ICON_OPTIONS = [
  { key: "campaign", label: "Campaign" },
  { key: "accountBalance", label: "Account Balance" },
  { key: "menuBook", label: "Menu Book" },
  { key: "apartment", label: "Apartment" },
  { key: "school", label: "School" },
  { key: "business", label: "Business" },
  { key: "hub", label: "Hub" },
  { key: "groups", label: "Groups" },
  { key: "manageAccounts", label: "Manage Accounts" },
  { key: "factCheck", label: "Fact Check" },
  { key: "gppGood", label: "Gpp Good" },
  { key: "reportProblem", label: "Report Problem" },
  { key: "supportAgent", label: "Support Agent" },
  { key: "phone", label: "Phone" },
  { key: "mail", label: "Mail" },
  { key: "public", label: "Public" },
  { key: "info", label: "Info" }
];

const IconPreview = ({ iconKey }) => {
  const Cmp = ICONS_MAP[iconKey] || InfoOutlinedIcon;
  return <Cmp fontSize="small" />;
};

// ===================== DEFAULT GROUPS =====================
const DEFAULT_GROUP_TEMPLATES = [
  { slug: "umumiy", titleUz: "UMUMIY", titleRu: "ОБЩЕЕ", titleEn: "GENERAL" },
  { slug: "tuzilma", titleUz: "TUZILMA", titleRu: "СТРУКТУРА", titleEn: "STRUCTURE" },
  { slug: "nazorat", titleUz: "NAZORAT", titleRu: "КОНТРОЛЬ", titleEn: "CONTROL" },
  { slug: "aloqa", titleUz: "ALOQA", titleRu: "СВЯЗЬ", titleEn: "CONTACT" }
];

// ===================== DEFAULT STATE =====================
const DEFAULT_STATE = {
  brand: { homeUrl: "/", logoDataUz: "", logoDataRu: "", logoDataEn: "" },
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
      { id: "m1", active: true, titleUz: "UNIVERSITET", titleRu: "УНИВЕРСИТЕТ", titleEn: "UNIVERSITY", link: "/universitet" },
      { id: "m2", active: true, titleUz: "FAOLIYAT", titleRu: "ДЕЯТЕЛЬНОСТЬ", titleEn: "ACTIVITIES", link: "/faoliyat" }
    ],
    megaGroups: [
      { id: "g1", parentId: "m1", slug: "umumiy", active: true, titleUz: "UMUMIY", titleRu: "ОБЩЕЕ", titleEn: "GENERAL" },
      { id: "g2", parentId: "m1", slug: "tuzilma", active: true, titleUz: "TUZILMA", titleRu: "СТРУКТУРА", titleEn: "STRUCTURE" },
      { id: "g3", parentId: "m1", slug: "nazorat", active: true, titleUz: "NAZORAT", titleRu: "КОНТРОЛЬ", titleEn: "CONTROL" },
      { id: "g4", parentId: "m1", slug: "aloqa", active: true, titleUz: "ALOQA", titleRu: "СВЯЗЬ", titleEn: "CONTACT" }
    ],
    megaItems: [
      { id: "i1", parentId: "m1", groupId: "g1", active: true, iconKey: "campaign", titleUz: "REKTOR MUROJAATI", titleRu: "ОБРАЩЕНИЕ РЕКТОРА", titleEn: "RECTOR'S ADDRESS", link: "/universitet/rektor-murojaati" },
      { id: "i2", parentId: "m1", groupId: "g1", active: true, iconKey: "accountBalance", titleUz: "UNIVERSITET HAQIDA", titleRu: "ОБ УНИВЕРСИТЕТЕ", titleEn: "ABOUT UNIVERSITY", link: "/universitet/haqida" },
      { id: "i3", parentId: "m1", groupId: "g1", active: true, iconKey: "menuBook", titleUz: "USTAV", titleRu: "УСТАВ", titleEn: "CHARTER", link: "/universitet/ustav" }
    ]
  }
};

// ===================== loadState() + MIGRATION =====================
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_STATE;

    const parsed = JSON.parse(raw);

    // phone migration
    if (parsed?.topBar?.phone && typeof parsed.topBar.phone === "string") {
      parsed.topBar.phone = { id: "p1", value: parsed.topBar.phone, active: true };
    }
    if (!parsed?.topBar?.phone) {
      parsed.topBar = parsed.topBar || {};
      parsed.topBar.phone = { id: "p1", value: "+998 (73) 241-12-06", active: true };
    }

    // main menu normalize
    if (!parsed?.main) parsed.main = {};
    if (!Array.isArray(parsed.main.menu)) parsed.main.menu = DEFAULT_STATE.main.menu;

    parsed.main.menu = parsed.main.menu.map((m) => {
      if ("titleUz" in m && "link" in m) return m;
      if ("titleUz" in m && ("linkUz" in m || "linkRu" in m || "linkEn" in m)) {
        return { ...m, link: m.link || m.linkUz || m.linkRu || m.linkEn || "" };
      }
      if ("labelUz" in m || "hrefUz" in m || "href" in m) {
        return {
          id: m.id || uid(),
          active: m.active ?? true,
          titleUz: m.labelUz ?? "",
          titleRu: m.labelRu ?? "",
          titleEn: m.labelEn ?? "",
          link: m.hrefUz || m.hrefRu || m.hrefEn || m.href || ""
        };
      }
      return {
        id: m.id || uid(),
        active: m.active ?? true,
        titleUz: m.titleUz ?? "",
        titleRu: m.titleRu ?? "",
        titleEn: m.titleEn ?? "",
        link: m.link ?? ""
      };
    });

    if (!Array.isArray(parsed.main.megaGroups)) parsed.main.megaGroups = [];
    if (!Array.isArray(parsed.main.megaItems)) parsed.main.megaItems = [];

    // Old submenu migration if exists
    if (Array.isArray(parsed.main.submenu) && parsed.main.submenu.length) {
      const ensureDefaultGroups = (parentId) => {
        DEFAULT_GROUP_TEMPLATES.forEach((t) => {
          const exists = parsed.main.megaGroups.some((g) => g.parentId === parentId && g.slug === t.slug);
          if (!exists) {
            parsed.main.megaGroups.push({
              id: uid(),
              parentId,
              slug: t.slug,
              active: true,
              titleUz: t.titleUz,
              titleRu: t.titleRu,
              titleEn: t.titleEn
            });
          }
        });
      };

      parsed.main.submenu.forEach((sm) => {
        const parentId = sm.parentId || "";
        if (!parentId) return;

        ensureDefaultGroups(parentId);
        const groupSlug = sm.group || "umumiy";
        const group = parsed.main.megaGroups.find((g) => g.parentId === parentId && g.slug === groupSlug) || parsed.main.megaGroups[0];

        parsed.main.megaItems.push({
          id: sm.id || uid(),
          parentId,
          groupId: group?.id || "",
          active: sm.active ?? true,
          iconKey: sm.iconKey || "info",
          titleUz: sm.titleUz || "",
          titleRu: sm.titleRu || "",
          titleEn: sm.titleEn || "",
          link: sm.link || sm.linkUz || sm.linkRu || sm.linkEn || ""
        });
      });

      delete parsed.main.submenu;
    }

    // ensure each parent has default 4 groups (if none exist)
    const parentIds = parsed.main.menu.map((m) => m.id);
    parentIds.forEach((pid) => {
      DEFAULT_GROUP_TEMPLATES.forEach((t) => {
        const exists = parsed.main.megaGroups.some((g) => g.parentId === pid && g.slug === t.slug);
        if (!exists) {
          parsed.main.megaGroups.push({
            id: uid(),
            parentId: pid,
            slug: t.slug,
            active: true,
            titleUz: t.titleUz,
            titleRu: t.titleRu,
            titleEn: t.titleEn
          });
        }
      });
    });

    // normalize items
    parsed.main.megaItems = parsed.main.megaItems.map((it) => ({
      id: it.id || uid(),
      parentId: it.parentId || "",
      groupId: it.groupId || "",
      active: it.active ?? true,
      iconKey: it.iconKey || "info",
      titleUz: it.titleUz || "",
      titleRu: it.titleRu || "",
      titleEn: it.titleEn || "",
      link: it.link || it.linkUz || it.linkRu || it.linkEn || ""
    }));

    return parsed && typeof parsed === "object" ? parsed : DEFAULT_STATE;
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

// ===================== Universal Dialog (supports dynamic select options) =====================
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
          {extra ? extra({ data, setData }) : null}

          {fields.map((f) => {
            if (f.type === "switch") {
              return (
                <FormControlLabel
                  key={f.name}
                  control={<Switch checked={!!data[f.name]} onChange={(e) => setData((p) => ({ ...p, [f.name]: e.target.checked }))} />}
                  label={f.label}
                />
              );
            }

            if (f.type === "select") {
              const options = typeof f.options === "function" ? f.options(data) : f.options || [];
              return (
                <TextField
                  key={f.name}
                  select
                  label={f.label}
                  value={data[f.name] ?? ""}
                  onChange={(e) => setData((p) => ({ ...p, [f.name]: e.target.value }))}
                  fullWidth
                >
                  {options.map((op) => (
                    <MenuItem key={op.value} value={op.value}>
                      {op.render ? op.render(op) : op.label}
                    </MenuItem>
                  ))}
                </TextField>
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

  const update = useCallback((fn) => {
    setState((prev) => fn(structuredClone(prev)));
  }, []);

  // ===================== Dialog controller =====================
  const [dlg, setDlg] = useState({ open: false, kind: "", item: null });

  // ✅ helper: parent uchun hech bo‘lmasa 1ta bo‘lim bo‘lsin (UMUMIY)
  const ensureAtLeastOneGroup = useCallback(
    (parentId) => {
      if (!parentId) return null;

      const existing = state.main.megaGroups.filter((g) => g.parentId === parentId);
      if (existing.length > 0) return existing[0].id;

      const newId = uid();
      update((s) => {
        s.main.megaGroups.push({
          id: newId,
          parentId,
          slug: "umumiy",
          active: true,
          titleUz: "UMUMIY",
          titleRu: "ОБЩЕЕ",
          titleEn: "GENERAL"
        });
        return s;
      });
      return newId;
    },
    [state.main.megaGroups, update]
  );

  // ✅ openDlg: megaItem ochilganda bo‘lim bo‘lmasa ham item qo‘shishga imkon beradi
    const openDlg = useCallback(
    (kind, item = null) => {
      if (kind === "megaItem") {
        const parentId = item?.parentId || state.main.menu?.[0]?.id || "";
        // ✅ IMPORTANT: default groupId = "" (bo‘limsiz)
        // agar item edit bo‘lsa, o'z groupId ni olib kiradi
        const groupId = item?.groupId ?? "";
        setDlg({ open: true, kind, item: { ...(item || {}), parentId, groupId } });
        return;
      }

      setDlg({ open: true, kind, item });
    },
    [state.main.menu]
  );


  const closeDlg = () => setDlg({ open: false, kind: "", item: null });

  // ===================== Collapses =====================
  const [openSocial, setOpenSocial] = useState({});
  const [openMainMenu, setOpenMainMenu] = useState({});
  const [openMegaGroup, setOpenMegaGroup] = useState({});
  const toggle = (setter, id) => setter((p) => ({ ...p, [id]: !p[id] }));

  // ===================== Accordion for cards =====================
  const [activeCard, setActiveCard] = useState("brand");
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

  const moveGroup = (parentId, groupId, dir) => {
    update((s) => {
      const groups = s.main.megaGroups.filter((g) => g.parentId === parentId);
      const ids = groups.map((g) => g.id);
      const cur = ids.indexOf(groupId);
      const next = cur + dir;
      if (cur < 0 || next < 0 || next >= ids.length) return s;

      const aId = ids[cur];
      const bId = ids[next];
      const ia = s.main.megaGroups.findIndex((g) => g.id === aId);
      const ib = s.main.megaGroups.findIndex((g) => g.id === bId);
      if (ia < 0 || ib < 0) return s;

      const tmp = s.main.megaGroups[ia];
      s.main.megaGroups[ia] = s.main.megaGroups[ib];
      s.main.megaGroups[ib] = tmp;
      return s;
    });
  };

  const moveItem = (groupId, itemId, dir) => {
    update((s) => {
      const items = s.main.megaItems.filter((it) => it.groupId === groupId);
      const ids = items.map((it) => it.id);
      const cur = ids.indexOf(itemId);
      const next = cur + dir;
      if (cur < 0 || next < 0 || next >= ids.length) return s;

      const aId = ids[cur];
      const bId = ids[next];
      const ia = s.main.megaItems.findIndex((it) => it.id === aId);
      const ib = s.main.megaItems.findIndex((it) => it.id === bId);
      if (ia < 0 || ib < 0) return s;

      const tmp = s.main.megaItems[ia];
      s.main.megaItems[ia] = s.main.megaItems[ib];
      s.main.megaItems[ib] = tmp;
      return s;
    });
  };

  // ===================== Dialog Configs =====================
  const dialogConfig = useMemo(() => {
    const item = dlg.item || {};

    // ---- PHONE
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

    // ---- SOCIAL
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
                  <Box component="img" src={data.iconData} alt="icon" sx={{ width: "100%", height: "100%", objectFit: "contain", p: 0.5 }} />
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

                <Button color="inherit" size="small" disabled={!data.iconData} onClick={() => setData((p) => ({ ...p, iconData: "" }))}>
                  O‘chirish
                </Button>
              </Stack>
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

    // ---- QUICK LINKS
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

    // ---- MAIN MENU
    if (dlg.kind === "menu") {
      return {
        title: dlg.item ? "Main menu tahrirlash" : "Main menu qo‘shish",
        initial: dlg.item
          ? { ...item, link: item.link || item.linkUz || item.linkRu || item.linkEn || "" }
          : { id: uid(), active: true, titleUz: "", titleRu: "", titleEn: "", link: "" },
        fields: [
          { name: "titleUz", label: "Title (UZ)", required: true },
          { name: "titleRu", label: "Title (RU)", required: true },
          { name: "titleEn", label: "Title (EN)", required: true },
          { name: "link", label: "Link (1 ta)", required: true },
          { name: "active", label: "Active", type: "switch" }
        ],
        onSave: (data) =>
          update((s) => {
            const cleaned = { ...data };
            delete cleaned.linkUz;
            delete cleaned.linkRu;
            delete cleaned.linkEn;

            const idx = s.main.menu.findIndex((x) => x.id === cleaned.id);
            if (idx >= 0) s.main.menu[idx] = { ...s.main.menu[idx], ...cleaned };
            else s.main.menu.push(cleaned);

            // menu qo‘shilganda default 4 group ham yaratamiz (agar yo‘q bo‘lsa)
            DEFAULT_GROUP_TEMPLATES.forEach((t) => {
              const exists = s.main.megaGroups.some((g) => g.parentId === cleaned.id && g.slug === t.slug);
              if (!exists) {
                s.main.megaGroups.push({
                  id: uid(),
                  parentId: cleaned.id,
                  slug: t.slug,
                  active: true,
                  titleUz: t.titleUz,
                  titleRu: t.titleRu,
                  titleEn: t.titleEn
                });
              }
            });

            return s;
          })
      };
    }

    // ---- MEGA GROUP (bo‘lim)
    if (dlg.kind === "megaGroup") {
      const parents = state.main.menu || [];
      const parentId = item.parentId || parents?.[0]?.id || "";

      return {
        title: dlg.item?.id ? "Bo‘lim (Submenu section) tahrirlash" : "Bo‘lim qo‘shish",
        initial: dlg.item?.id
          ? item
          : {
              id: uid(),
              parentId,
              slug: "custom",
              active: true,
              titleUz: "",
              titleRu: "",
              titleEn: ""
            },
        fields: [
          {
            name: "parentId",
            label: "Qaysi menu ostida?",
            required: true,
            type: "select",
            options: parents.map((p) => ({
              value: p.id,
              label: p.titleUz || p.titleRu || p.titleEn || p.id
            }))
          },
          { name: "titleUz", label: "Bo‘lim nomi (UZ)", required: true },
          { name: "titleRu", label: "Bo‘lim nomi (RU)", required: true },
          { name: "titleEn", label: "Bo‘lim nomi (EN)", required: true },
          { name: "active", label: "Active", type: "switch" }
        ],
        onSave: (data) =>
          update((s) => {
            const idx = s.main.megaGroups.findIndex((g) => g.id === data.id);
            if (idx >= 0) s.main.megaGroups[idx] = { ...s.main.megaGroups[idx], ...data };
            else s.main.megaGroups.push({ ...data, slug: data.slug || "custom" });
            return s;
          })
      };
    }

    // ---- MEGA ITEM (bo‘lim bo‘lmasa ham auto yaratadi)
      if (dlg.kind === "megaItem") {
      const parents = state.main.menu || [];
      const parentId = item.parentId || parents?.[0]?.id || "";

      // parentga tegishli bo‘limlar
      const groupsForParent = (state.main.megaGroups || []).filter((g) => g.parentId === parentId);

      return {
        title: dlg.item?.id ? "Submenu item tahrirlash" : "Submenu item qo‘shish",
        initial: dlg.item?.id
          ? {
              ...item,
              parentId,
              // ✅ bo‘sh bo‘lishi mumkin
              groupId: item.groupId ?? "",
              iconKey: item.iconKey || "info",
              link: item.link || item.linkUz || item.linkRu || item.linkEn || ""
            }
          : {
              id: uid(),
              parentId,
              // ✅ default bo‘limsiz
              groupId: "",
              active: true,
              iconKey: "info",
              titleUz: "",
              titleRu: "",
              titleEn: "",
              link: ""
            },
        fields: [
          {
            name: "parentId",
            label: "Qaysi menu ostida?",
            required: true,
            type: "select",
            options: parents.map((p) => ({
              value: p.id,
              label: p.titleUz || p.titleRu || p.titleEn || p.id
            }))
          },
          {
            name: "groupId",
            label: "Bo‘lim (ixtiyoriy)",
            required: false, // ✅ endi majburiy emas
            type: "select",
            // ✅ parentId o‘zgarsa option ham o‘zgaradi
            options: (data) => {
              const pid = data.parentId || parentId;
              const list = (state.main.megaGroups || []).filter((g) => g.parentId === pid);

              return [
                { value: "", label: "Bo‘limsiz (group yo‘q)" }, // ✅ mana shu
                ...list.map((g) => ({
                  value: g.id,
                  label: g.titleUz || g.slug || g.id
                }))
              ];
            }
          },
          {
            name: "iconKey",
            label: "Icon (MUI)",
            required: true,
            type: "select",
            options: ICON_OPTIONS.map((o) => ({
              value: o.key,
              label: o.label,
              render: (op) => (
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconPreview iconKey={op.value} />
                  <Typography variant="body2">{op.label}</Typography>
                </Stack>
              )
            }))
          },
          { name: "titleUz", label: "Title (UZ)", required: true },
          { name: "titleRu", label: "Title (RU)", required: true },
          { name: "titleEn", label: "Title (EN)", required: true },
          { name: "link", label: "Link (1 ta)", required: true },
          { name: "active", label: "Active", type: "switch" }
        ],
        onSave: (data) =>
          update((s) => {
            const cleaned = { ...data };
            delete cleaned.linkUz;
            delete cleaned.linkRu;
            delete cleaned.linkEn;

            // ✅ IMPORTANT: endi groupId bo‘sh bo‘lsa, bo‘lim yaratmaymiz!
            // cleaned.groupId = "" bo‘lsa bo‘limsiz saqlanadi.

            const idx = s.main.megaItems.findIndex((x) => x.id === cleaned.id);
            if (idx >= 0) s.main.megaItems[idx] = { ...s.main.megaItems[idx], ...cleaned };
            else s.main.megaItems.push(cleaned);

            return s;
          })
      };
    }


    return null;
  }, [dlg, update, state.main.menu, state.main.megaGroups, ensureAtLeastOneGroup]);

  // ===================== delete handlers =====================
  const del = (kind, id) => {
    if (!window.confirm("O‘chirilsinmi?")) return;

    update((s) => {
      if (kind === "phone") s.topBar.phone = { id: "p1", value: "", active: false };
      if (kind === "social") s.topBar.socials = s.topBar.socials.filter((x) => x.id !== id);
      if (kind === "quick") s.topBar.quickLinks = s.topBar.quickLinks.filter((x) => x.id !== id);

      if (kind === "menu") {
        s.main.menu = s.main.menu.filter((x) => x.id !== id);
        const groupIds = s.main.megaGroups.filter((g) => g.parentId === id).map((g) => g.id);
        s.main.megaGroups = s.main.megaGroups.filter((g) => g.parentId !== id);
        s.main.megaItems = s.main.megaItems.filter((it) => it.parentId !== id && !groupIds.includes(it.groupId));
      }

      if (kind === "megaGroup") {
        s.main.megaGroups = s.main.megaGroups.filter((g) => g.id !== id);
        s.main.megaItems = s.main.megaItems.filter((it) => it.groupId !== id);
      }

      if (kind === "megaItem") {
        s.main.megaItems = s.main.megaItems.filter((it) => it.id !== id);
      }

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
              1) BRAND
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
                        <Card variant="outlined" sx={{ p: 2, width: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}>
                          <Typography fontWeight={800} textAlign="center">
                            {x.label}
                          </Typography>

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
                              <Box component="img" src={state.brand[x.key]} alt={x.label} sx={{ width: "50%", height: "100%", objectFit: "contain", p: 1 }} />
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
              2) TOP BAR
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
                  {/* PHONE */}
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

                  {/* SOCIALS */}
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
                                    <Box component="img" src={x.iconData} alt="icon" sx={{ width: "100%", height: "100%", objectFit: "contain", p: 0.5 }} />
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
                            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                              {x.href}
                            </Typography>
                          </Box>
                        </Collapse>

                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>

                  {/* QUICK LINKS */}
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
              3) MAIN MENU
          ========================================================== */}
          <Card variant="outlined">
            <CardHeader
              title="Asosiy menu itemlar (Navbar)"
              subheader="Title (UZ/RU/EN) + Link (1 ta)"
              onClick={() => openOnly("mainmenu")}
              sx={{ cursor: "pointer" }}
            />
            <Divider />
            <Collapse in={activeCard === "mainmenu"} timeout="auto" unmountOnExit>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography fontWeight={900}>Menu itemlar</Typography>
                    <Button size="small" startIcon={<PlusOutlined />} onClick={() => openDlg("menu")}>
                      Menu qo‘shish
                    </Button>
                  </Stack>

                  <List dense sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    {state.main.menu.map((m, i) => (
                      <React.Fragment key={m.id}>
                        <ListItem
                          onClick={() => toggle(setOpenMainMenu, m.id)}
                          sx={{ cursor: "pointer" }}
                          secondaryAction={
                            <Stack direction="row" spacing={0.5} alignItems="center" onClick={(e) => e.stopPropagation()}>
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

                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => openDlg("menu", m)}>
                                  <EditOutlined />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => del("menu", m.id)}>
                                  <DeleteOutlined />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          }
                        >
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
                                <Typography variant="caption">{m.link || "-"}</Typography>
                              </Stack>
                            }
                          />
                        </ListItem>

                        <Collapse in={!!openMainMenu[m.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ px: 2, pb: 2 }}>
                            <Divider sx={{ mb: 1 }} />
                            <Typography variant="body2">
                              <b>UZ:</b> {m.titleUz || "-"} &nbsp;|&nbsp; <b>Link:</b> {m.link || "-"}
                            </Typography>
                            <Typography variant="body2">
                              <b>RU:</b> {m.titleRu || "-"} &nbsp;|&nbsp; <b>Link:</b> {m.link || "-"}
                            </Typography>
                            <Typography variant="body2">
                              <b>EN:</b> {m.titleEn || "-"} &nbsp;|&nbsp; <b>Link:</b> {m.link || "-"}
                            </Typography>
                          </Box>
                        </Collapse>

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
              4) MEGA SUBMENU CONTROL (bo‘limlar + ichidagi itemlar)
              ✅ Bo‘lim qo‘shish mumkin
              ✅ Bo‘lim ichiga item qo‘shish mumkin
              ✅ Bo‘lim yo‘q bo‘lsa ham "Submenu item qo‘shish" bosilsa auto-UMUMIY yaratiladi
          ========================================================== */}
          <Card variant="outlined">
            <CardHeader
              title="Mega Submenu Control"
              subheader="Bo‘limlar (UMUMIY/TUZILMA/...) + ichidagi submenu itemlar. Bo‘limni bossangiz ichidagilar ochiladi."
              onClick={() => openOnly("mega")}
              sx={{ cursor: "pointer" }}
            />
            <Divider />

            <Collapse in={activeCard === "mega"} timeout="auto" unmountOnExit>
              <CardContent>
                <Stack spacing={2}>
                 {state.main.menu.map((parent) => {
  const groups = state.main.megaGroups.filter((g) => g.parentId === parent.id);

  // ✅ bo‘limsiz itemlar: groupId yo‘q yoki bo‘sh
  const ungroupedItems = state.main.megaItems.filter(
    (it) => it.parentId === parent.id && (!it.groupId || String(it.groupId).trim() === "")
  );

  return (
    <Card key={parent.id} variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography fontWeight={900}>
            {parent.titleUz || parent.titleRu || parent.titleEn || parent.id} — Submenu
          </Typography>

          <Stack direction="row" spacing={1}>
            {/* ✅ Bo‘limsiz item qo‘shadi */}
            <Button
              size="small"
              variant="outlined"
              startIcon={<PlusOutlined />}
              onClick={() => openDlg("megaItem", { parentId: parent.id, groupId: "" })}
            >
              Submenu item qo‘shish
            </Button>

            {/* ✅ Bo‘lim qo‘shish */}
            <Button size="small" startIcon={<PlusOutlined />} onClick={() => openDlg("megaGroup", { parentId: parent.id })}>
              Bo‘lim qo‘shish
            </Button>
          </Stack>
        </Stack>

        {/* ===================== BO‘LIMSIZ ITEMLAR (BLOCK) ===================== */}
        <Card variant="outlined" sx={{ p: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography fontWeight={900}>Bo‘limsiz submenu itemlar</Typography>
            <Chip size="small" variant="outlined" label={`${ungroupedItems.length} ta`} />
          </Stack>

          <List dense sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            {ungroupedItems.length === 0 ? (
              <Box sx={{ p: 1.5 }}>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  Hozircha bo‘limsiz item yo‘q
                </Typography>
              </Box>
            ) : null}

            {ungroupedItems.map((it, ii) => (
              <React.Fragment key={it.id}>
                <ListItem
                  secondaryAction={
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Tooltip title="Yuqoriga">
                        <span>
                          <IconButton
                            size="small"
                            disabled={ii === 0}
                            onClick={() =>
                              update((s) => {
                                // bo‘limsizlar ichida reorder
                                const list = s.main.megaItems.filter(
                                  (x) => x.parentId === parent.id && (!x.groupId || String(x.groupId).trim() === "")
                                );
                                const ids = list.map((x) => x.id);
                                const cur = ids.indexOf(it.id);
                                const next = cur - 1;
                                if (next < 0) return s;

                                const aId = ids[cur];
                                const bId = ids[next];

                                const ia = s.main.megaItems.findIndex((x) => x.id === aId);
                                const ib = s.main.megaItems.findIndex((x) => x.id === bId);
                                if (ia < 0 || ib < 0) return s;

                                const tmp = s.main.megaItems[ia];
                                s.main.megaItems[ia] = s.main.megaItems[ib];
                                s.main.megaItems[ib] = tmp;
                                return s;
                              })
                            }
                          >
                            <ArrowUpOutlined />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Pastga">
                        <span>
                          <IconButton
                            size="small"
                            disabled={ii === ungroupedItems.length - 1}
                            onClick={() =>
                              update((s) => {
                                const list = s.main.megaItems.filter(
                                  (x) => x.parentId === parent.id && (!x.groupId || String(x.groupId).trim() === "")
                                );
                                const ids = list.map((x) => x.id);
                                const cur = ids.indexOf(it.id);
                                const next = cur + 1;
                                if (next >= ids.length) return s;

                                const aId = ids[cur];
                                const bId = ids[next];

                                const ia = s.main.megaItems.findIndex((x) => x.id === aId);
                                const ib = s.main.megaItems.findIndex((x) => x.id === bId);
                                if (ia < 0 || ib < 0) return s;

                                const tmp = s.main.megaItems[ia];
                                s.main.megaItems[ia] = s.main.megaItems[ib];
                                s.main.megaItems[ib] = tmp;
                                return s;
                              })
                            }
                          >
                            <ArrowDownOutlined />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title={it.active ? "Active" : "OFF"}>
                        <Switch
                          size="small"
                          checked={!!it.active}
                          onChange={(e) =>
                            update((s) => {
                              const idx = s.main.megaItems.findIndex((x) => x.id === it.id);
                              if (idx >= 0) s.main.megaItems[idx].active = e.target.checked;
                              return s;
                            })
                          }
                        />
                      </Tooltip>

                      <Tooltip title="Edit item">
                        <IconButton size="small" onClick={() => openDlg("megaItem", it)}>
                          <EditOutlined />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete item">
                        <IconButton size="small" color="error" onClick={() => del("megaItem", it.id)}>
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
                            width: 30,
                            height: 30,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "background.default"
                          }}
                        >
                          <IconPreview iconKey={it.iconKey} />
                        </Box>

                        <Typography fontWeight={900}>{it.titleUz || "(UZ yo‘q)"}</Typography>
                        {!it.active ? <Chip size="small" label="OFF" /> : null}
                        <Chip size="small" variant="outlined" label="Bo‘limsiz" />
                      </Stack>
                    }
                    secondary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LinkOutlined />
                        <Typography variant="caption">{it.link || "-"}</Typography>
                      </Stack>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Card>

        {/* ===================== BO‘LIMLAR (GROUPS) ===================== */}
        <Typography fontWeight={900} sx={{ mt: 1 }}>
          Bo‘limlar (section) va ichidagi itemlar
        </Typography>

        <List dense sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          {groups.length === 0 ? (
            <Box sx={{ p: 1.5 }}>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Hozircha bo‘lim yo‘q (xohlasangiz Bo‘lim qo‘shing)
              </Typography>
            </Box>
          ) : null}

          {groups.map((g, gi) => {
            const items = state.main.megaItems.filter((it) => it.groupId === g.id);
            const isOpen = !!openMegaGroup[g.id];

            return (
              <React.Fragment key={g.id}>
                <ListItem
                  onClick={() => toggle(setOpenMegaGroup, g.id)}
                  sx={{ cursor: "pointer" }}
                  secondaryAction={
                    <Stack direction="row" spacing={0.5} alignItems="center" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Yuqoriga">
                        <span>
                          <IconButton size="small" disabled={gi === 0} onClick={() => moveGroup(parent.id, g.id, -1)}>
                            <ArrowUpOutlined />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title="Pastga">
                        <span>
                          <IconButton size="small" disabled={gi === groups.length - 1} onClick={() => moveGroup(parent.id, g.id, +1)}>
                            <ArrowDownOutlined />
                          </IconButton>
                        </span>
                      </Tooltip>

                      <Tooltip title={g.active ? "Active" : "OFF"}>
                        <Switch
                          size="small"
                          checked={!!g.active}
                          onChange={(e) =>
                            update((s) => {
                              const idx = s.main.megaGroups.findIndex((x) => x.id === g.id);
                              if (idx >= 0) s.main.megaGroups[idx].active = e.target.checked;
                              return s;
                            })
                          }
                        />
                      </Tooltip>

                      <Tooltip title="Edit bo‘lim">
                        <IconButton size="small" onClick={() => openDlg("megaGroup", g)}>
                          <EditOutlined />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete bo‘lim">
                        <IconButton size="small" color="error" onClick={() => del("megaGroup", g.id)}>
                          <DeleteOutlined />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                >
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight={900}>{g.titleUz || "(Bo‘lim nomi yo‘q)"}</Typography>
                        {!g.active ? <Chip size="small" label="OFF" /> : null}
                        <Chip size="small" variant="outlined" label={`${items.length} ta`} />
                      </Stack>
                    }
                    secondary="Bo‘limni bossangiz ichidagi submenu itemlar ochiladi"
                  />
                </ListItem>

                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Divider sx={{ mb: 1 }} />

                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography fontWeight={800}>Ichki submenu itemlar</Typography>

                      {/* ✅ bu bo‘lim ichiga item qo‘shadi */}
                      <Button size="small" startIcon={<PlusOutlined />} onClick={() => openDlg("megaItem", { parentId: parent.id, groupId: g.id })}>
                        Item qo‘shish
                      </Button>
                    </Stack>

                    <List dense sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                      {items.length === 0 ? (
                        <Box sx={{ p: 1.5 }}>
                          <Typography variant="caption" sx={{ opacity: 0.7 }}>
                            Hozircha item yo‘q
                          </Typography>
                        </Box>
                      ) : null}

                      {items.map((it, ii) => (
                        <React.Fragment key={it.id}>
                          <ListItem
                            secondaryAction={
                              <Stack direction="row" spacing={0.5} alignItems="center">
                                <Tooltip title="Yuqoriga">
                                  <span>
                                    <IconButton size="small" disabled={ii === 0} onClick={() => moveItem(g.id, it.id, -1)}>
                                      <ArrowUpOutlined />
                                    </IconButton>
                                  </span>
                                </Tooltip>

                                <Tooltip title="Pastga">
                                  <span>
                                    <IconButton size="small" disabled={ii === items.length - 1} onClick={() => moveItem(g.id, it.id, +1)}>
                                      <ArrowDownOutlined />
                                    </IconButton>
                                  </span>
                                </Tooltip>

                                <Tooltip title={it.active ? "Active" : "OFF"}>
                                  <Switch
                                    size="small"
                                    checked={!!it.active}
                                    onChange={(e) =>
                                      update((s) => {
                                        const idx = s.main.megaItems.findIndex((x) => x.id === it.id);
                                        if (idx >= 0) s.main.megaItems[idx].active = e.target.checked;
                                        return s;
                                      })
                                    }
                                  />
                                </Tooltip>

                                <Tooltip title="Edit item">
                                  <IconButton size="small" onClick={() => openDlg("megaItem", it)}>
                                    <EditOutlined />
                                  </IconButton>
                                </Tooltip>

                                <Tooltip title="Delete item">
                                  <IconButton size="small" color="error" onClick={() => del("megaItem", it.id)}>
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
                                      width: 30,
                                      height: 30,
                                      borderRadius: 1,
                                      border: "1px solid",
                                      borderColor: "divider",
                                      display: "grid",
                                      placeItems: "center",
                                      bgcolor: "background.default"
                                    }}
                                  >
                                    <IconPreview iconKey={it.iconKey} />
                                  </Box>

                                  <Typography fontWeight={900}>{it.titleUz || "(UZ yo‘q)"}</Typography>
                                  {!it.active ? <Chip size="small" label="OFF" /> : null}
                                </Stack>
                              }
                              secondary={
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <LinkOutlined />
                                  <Typography variant="caption">{it.link || "-"}</Typography>
                                </Stack>
                              }
                            />
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                  </Box>
                </Collapse>

                <Divider />
              </React.Fragment>
            );
          })}
        </List>
      </Stack>
    </Card>
  );
})}


                  <Stack direction="row" justifyContent="flex-end">
                    <Button variant="contained" onClick={saveSection}>
                      Saqlash
                    </Button>
                  </Stack>
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
