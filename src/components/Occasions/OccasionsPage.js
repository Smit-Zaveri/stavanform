import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import { firestore } from "../../firebase";
import { DEFAULT_OCCASIONS } from "../../utils/defaultOccasions";

/*
 * Jain Dhun "occasions" collection (app FR-23). Each document:
 *   name, about: [Gujarati, Hindi, English]
 *   month: Chaitra … Fagan (Gujarati amanta), paksha: "Sud" | "Vad", tithi: 1–15, days: 1–60
 *   keywords: words matched (phonetically, any script) against song titles and tags
 *   dates: optional exact start dates "YYYY-MM-DD" that replace the tithi rule in their year
 * The app picks up changes at its next sync; an empty collection means the app's built-in list.
 */
const COLLECTION = "occasions";
const MONTHS = ["Chaitra", "Vaishakh", "Jeth", "Ashadh", "Shravan", "Bhadarvo", "Aso", "Kartak", "Magshar", "Posh", "Maha", "Fagan"];
const LANGS = ["Gujarati", "Hindi", "English"];
const ID_PATTERN = /^[a-z0-9_-]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const emptyForm = {
  id: "",
  name: ["", "", ""],
  about: ["", "", ""],
  month: "Chaitra",
  paksha: "Sud",
  tithi: 1,
  days: 1,
  keywords: "",
  dates: "",
};

const splitList = (text) => text.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
const slug = (text) => text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const when = (o) => `${o.month} ${o.paksha} ${o.tithi}${o.days > 1 ? ` · ${o.days} days` : ""}`;
const sortKey = (o) => MONTHS.indexOf(o.month) * 100 + (o.paksha === "Vad" ? 50 : 0) + Number(o.tithi);

const validDate = (text) => DATE_PATTERN.test(text) && !Number.isNaN(Date.parse(`${text}T00:00:00Z`));

const OccasionsPage = () => {
  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null); // null = dialog closed
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const notify = (message, severity = "success") => setSnackbar({ open: true, message, severity });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await firestore.collection(COLLECTION).get();
      setOccasions(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).sort((a, b) => sortKey(a) - sortKey(b)));
    } catch (e) {
      console.error("Error loading occasions:", e);
      notify("Couldn't load occasions. Check your connection and permissions.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const existingIds = useMemo(() => new Set(occasions.map((o) => o.id)), [occasions]);

  const openNew = () => {
    setEditing(false);
    setError("");
    setForm(emptyForm);
  };

  const openEdit = (o) => {
    setEditing(true);
    setError("");
    setForm({
      id: o.id,
      name: Array.isArray(o.name) ? [...o.name, "", "", ""].slice(0, 3) : ["", "", ""],
      about: Array.isArray(o.about) ? [...o.about, "", "", ""].slice(0, 3) : ["", "", ""],
      month: MONTHS.includes(o.month) ? o.month : "Chaitra",
      paksha: o.paksha === "Vad" ? "Vad" : "Sud",
      tithi: Number(o.tithi) || 1,
      days: Number(o.days) || 1,
      keywords: (o.keywords || []).join(", "),
      dates: (o.dates || []).join(", "),
    });
  };

  const setLang = (field, index, value) =>
    setForm((f) => ({ ...f, [field]: f[field].map((v, i) => (i === index ? value : v)) }));

  const save = async () => {
    const id = editing ? form.id : form.id.trim() || slug(form.name[2]);
    const dates = splitList(form.dates);
    const days = Number(form.days);
    if (!form.name.some((n) => n.trim())) return setError("Give the occasion a name in at least one language.");
    if (!ID_PATTERN.test(id)) return setError("ID may use only lowercase letters, numbers, - and _ (for example gyan_panchami).");
    if (!editing && existingIds.has(id)) return setError(`An occasion with ID "${id}" already exists.`);
    if (!Number.isInteger(days) || days < 1 || days > 60) return setError("Days must be a whole number from 1 to 60.");
    const badDate = dates.find((d) => !validDate(d));
    if (badDate) return setError(`"${badDate}" isn't a date in YYYY-MM-DD form.`);
    if (!splitList(form.keywords).length) return setError("Add at least one keyword so the app can find songs for this occasion.");

    setSaving(true);
    try {
      await firestore.collection(COLLECTION).doc(id).set({
        name: form.name.map((n) => n.trim()),
        about: form.about.map((a) => a.trim()),
        month: form.month,
        paksha: form.paksha,
        tithi: Number(form.tithi),
        days,
        keywords: splitList(form.keywords),
        dates,
      });
      setForm(null);
      notify(editing ? "Occasion updated." : "Occasion added.");
      load();
    } catch (e) {
      console.error("Error saving occasion:", e);
      setError("Couldn't save. Check your connection and permissions, then try again.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    const o = toDelete;
    setToDelete(null);
    try {
      await firestore.collection(COLLECTION).doc(o.id).delete();
      notify("Occasion deleted.");
      load();
    } catch (e) {
      console.error("Error deleting occasion:", e);
      notify("Couldn't delete the occasion.", "error");
    }
  };

  const loadDefaults = async () => {
    setLoading(true);
    try {
      const batch = firestore.batch();
      DEFAULT_OCCASIONS.forEach(({ id, ...data }) => batch.set(firestore.collection(COLLECTION).doc(id), data));
      await batch.commit();
      notify(`Added ${DEFAULT_OCCASIONS.length} occasions.`);
    } catch (e) {
      console.error("Error adding default occasions:", e);
      notify("Couldn't add the built-in occasions.", "error");
    }
    load();
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto" }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ sm: "center" }} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Occasions</Typography>
          <Typography variant="body2" color="text.secondary">
            Jain calendar occasions shown in the app. Phones pick up changes at their next sync.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew} sx={{ bgcolor: "#673BB7", color: "#fff", "&:hover": { bgcolor: "#5a32a3" } }}>
          Add occasion
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
      ) : occasions.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <EventOutlinedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
          <Typography variant="h6">No occasions yet</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            The app uses its built-in list until this collection has entries. Load that list here to start editing it.
          </Typography>
          <Button variant="outlined" onClick={loadDefaults}>Load the {DEFAULT_OCCASIONS.length} built-in occasions</Button>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {occasions.map((o) => (
            <Paper key={o.id} variant="outlined" sx={{ p: 2, display: "flex", gap: 2, alignItems: "flex-start" }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {(o.name || [])[2] || (o.name || [])[0] || o.id}
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>{(o.name || [])[0]}</Typography>
                </Typography>
                <Typography variant="body2" sx={{ color: "#b39ddb", mb: 0.5 }}>{when(o)}</Typography>
                {(o.about || [])[2] && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{o.about[2]}</Typography>}
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {(o.keywords || []).map((k) => <Chip key={k} label={k} size="small" />)}
                  {(o.dates || []).map((d) => <Chip key={d} label={`Fixed: ${d}`} size="small" color="warning" variant="outlined" />)}
                </Box>
              </Box>
              <Tooltip title="Edit"><IconButton onClick={() => openEdit(o)}><EditOutlinedIcon /></IconButton></Tooltip>
              <Tooltip title="Delete"><IconButton onClick={() => setToDelete(o)}><DeleteOutlineIcon /></IconButton></Tooltip>
            </Paper>
          ))}
        </Stack>
      )}

      <Dialog open={form !== null} onClose={() => !saving && setForm(null)} fullWidth maxWidth="md">
        {form && (
          <>
            <DialogTitle>{editing ? "Edit occasion" : "Add occasion"}</DialogTitle>
            <DialogContent dividers>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Grid container spacing={2}>
                {LANGS.map((lang, i) => (
                  <Grid item xs={12} md={4} key={`name-${lang}`}>
                    <TextField label={`Name (${lang})`} value={form.name[i]} onChange={(e) => setLang("name", i, e.target.value)} fullWidth />
                  </Grid>
                ))}
                {LANGS.map((lang, i) => (
                  <Grid item xs={12} md={4} key={`about-${lang}`}>
                    <TextField label={`Meaning (${lang})`} value={form.about[i]} onChange={(e) => setLang("about", i, e.target.value)} fullWidth multiline minRows={3} />
                  </Grid>
                ))}
                <Grid item xs={12} sm={4}>
                  <TextField select label="Month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} fullWidth>
                    {MONTHS.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <ToggleButtonGroup exclusive fullWidth value={form.paksha} onChange={(_, v) => v && setForm({ ...form, paksha: v })} sx={{ height: 56 }}>
                    <ToggleButton value="Sud">Sud</ToggleButton>
                    <ToggleButton value="Vad">Vad</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField select label="Tithi" value={form.tithi} onChange={(e) => setForm({ ...form, tithi: e.target.value })} fullWidth>
                    {Array.from({ length: 15 }, (_, i) => i + 1).map((t) => (
                      <MenuItem key={t} value={t}>{t === 15 ? (form.paksha === "Sud" ? "15 (Punam)" : "15 (Amas)") : t}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField label="Days" type="number" value={form.days} onChange={(e) => setForm({ ...form, days: e.target.value })} inputProps={{ min: 1, max: 60 }} fullWidth />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Keywords"
                    value={form.keywords}
                    onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                    helperText="Comma separated, in any script. Songs whose title or tags contain one of these words are shown for this occasion (e.g. mahavir, paryushan)."
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Fixed start dates (optional)"
                    value={form.dates}
                    onChange={(e) => setForm({ ...form, dates: e.target.value })}
                    placeholder="2026-09-15"
                    helperText="YYYY-MM-DD, comma separated. In a year listed here the occasion starts on that date instead of the tithi, for when your sangh observes a different day."
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="ID"
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    placeholder={slug(form.name[2]) || "gyan_panchami"}
                    helperText={editing ? "The ID can't be changed." : "Leave empty to use the English name. Used in app links; can't be changed later."}
                    disabled={editing}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setForm(null)} disabled={saving}>Cancel</Button>
              <Button variant="contained" onClick={save} disabled={saving} sx={{ bgcolor: "#673BB7", color: "#fff", "&:hover": { bgcolor: "#5a32a3" } }}>
                {saving ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Save"}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={toDelete !== null} onClose={() => setToDelete(null)}>
        <DialogTitle>Delete {toDelete && ((toDelete.name || [])[2] || toDelete.id)}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            It disappears from the app's calendar at the next sync. If you delete every occasion, the app goes back to its built-in list.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setToDelete(null)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OccasionsPage;
