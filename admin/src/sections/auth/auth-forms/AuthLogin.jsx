import React, { useState } from 'react';
import { Alert, Box, Button, Checkbox, Chip, FormControlLabel, Grid, InputAdornment,
  IconButton, Stack, TextField, Typography } from '@mui/material';
import { EyeInvisibleOutlined, EyeOutlined, SafetyCertificateOutlined, DownloadOutlined } from '@ant-design/icons';
import useAuth from 'hooks/useAuth';

export default function AuthLogin() {
  const { login, advanceLogin } = useAuth();
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [code, setCode] = useState('');
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [regenerate, setRegenerate] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const stage = challenge?.stage || 'password';

  function restart() {
    setChallenge(null); setPassword(''); setCode(''); setNewPassword(''); setConfirmation('');
    setSaved(false); setError(''); setUseRecoveryCode(false); setRegenerate(false);
  }
  function downloadRecovery() {
    const content = 'FSTU Admin — bir martalik tiklash kodlari\nHar bir kod faqat bir marta ishlaydi. Parolingiz bilan birga saqlamang.\n\n' + challenge.recoveryCodes.join('\n');
    const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'fstu-tiklash-kodlari.txt';
    document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      let result;
      if (stage === 'password') {
        result = await login(identity.trim(), password); setPassword('');
      } else if (stage === 'password_change') {
        if (newPassword !== confirmation) throw new Error('Yangi parollar bir xil bo‘lishi kerak.');
        result = await advanceLogin('password', { challengeToken: challenge.challengeToken, newPassword });
        setNewPassword(''); setConfirmation('');
      } else if (stage === 'recovery_codes') {
        if (!saved) throw new Error('Avval tiklash kodlarini xavfsiz joyga saqlang.');
        result = await advanceLogin('confirm', { challengeToken: challenge.challengeToken, acknowledged: true });
      } else {
        result = await advanceLogin('verify', { challengeToken: challenge.challengeToken, code: code.trim(),
          useRecoveryCode: stage === 'verify' && useRecoveryCode, regenerateRecoveryCodes: regenerate });
      }
      setCode(''); setSaved(false); setUseRecoveryCode(false); setRegenerate(false);
      if (result?.user) setChallenge(null);
      else if (result?.stage && result?.challengeToken) setChallenge(result);
      else throw new Error('Tasdiqlash javobi olinmadi. Kirishni qaytadan boshlang.');
    } catch (failure) { setError(failure.message || 'Kirish amalga oshmadi.'); }
    finally { setBusy(false); }
  }

  return <Box component="form" noValidate onSubmit={submit}>
    <Stack spacing={2.5}>
      <Chip icon={<SafetyCertificateOutlined />} color="primary" variant="outlined" sx={{ alignSelf: 'flex-start' }}
        label={stage === 'password' ? '1. Login va parol' : stage === 'password_change' ? 'Parolni kuchaytirish' : stage === 'recovery_codes' ? 'Tiklash kodlarini saqlash' : '2. Autentifikator kodi'} />
      {error && <Alert severity="error" role="alert">{error}</Alert>}
      {stage === 'password' && <>
        <Alert severity="info">Admin panelga kirish uchun parol va telefoningizdagi autentifikator kodi talab qilinadi.</Alert>
        <TextField label="Login yoki email" value={identity} onChange={(event) => setIdentity(event.target.value)}
          autoComplete="username" inputProps={{ maxLength: 254 }} required fullWidth disabled={busy} />
        <TextField label="Parol" value={password} onChange={(event) => setPassword(event.target.value)}
          type={showPassword ? 'text' : 'password'} autoComplete="current-password" required fullWidth disabled={busy}
          InputProps={{ endAdornment: <InputAdornment position="end"><IconButton aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'}
            onClick={() => setShowPassword(!showPassword)} onMouseDown={(event) => event.preventDefault()} edge="end">
            {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}</IconButton></InputAdornment> }} />
      </>}
      {stage === 'password_change' && <>
        <Alert severity="warning">Parolingizni yangilash talab qilinadi. Kamida 12 belgi, katta va kichik harf, raqam hamda maxsus belgi ishlating. Oson so‘zlar yoki loginni parolga qo‘shmang.</Alert>
        <TextField label="Yangi parol" type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required disabled={busy} />
        <TextField label="Yangi parolni tasdiqlang" type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required disabled={busy} />
      </>}
      {stage === 'enroll' && <>
        <Alert severity="info">Google Authenticator, Microsoft Authenticator yoki boshqa TOTP ilovasida QR kodni skanerlang. Keyin ilovadagi 6 xonali kodni kiriting.</Alert>
        <Box sx={{ textAlign: 'center', bgcolor: '#fff', borderRadius: 1, py: 1 }}>
          <img src={challenge.qrCode} width="240" height="240" alt="Autentifikatorni ulash uchun QR kod" style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: 'auto' }} />
        </Box>
        <TextField label="QR ishlamasa, ushbu kalitni ilovaga kiriting" value={challenge.secret} InputProps={{ readOnly: true }}
          inputProps={{ style: { fontFamily: 'monospace', fontSize: 13 }, 'aria-label': 'Autentifikatorni qo‘lda ulash kaliti' }} />
        <Typography variant="caption" color="text.secondary">QR va ulash kalitini boshqalarga bermang. Bu kodlar faqat shu bosqichda ko‘rsatiladi.</Typography>
      </>}
      {(stage === 'verify' || stage === 'enroll') && <>
        {stage === 'verify' && <Typography color="text.secondary">{useRecoveryCode ? 'Saqlagan bir martalik tiklash kodingizni kiriting. So‘ng yangi autentifikator ulanadi.' : 'Autentifikator ilovangizdagi hozirgi 6 xonali kodni kiriting.'}</Typography>}
        <TextField label={useRecoveryCode ? 'Bir martalik tiklash kodi' : '6 xonali kod'} value={code} onChange={(event) => setCode(event.target.value)}
          autoComplete="one-time-code" inputProps={{ inputMode: useRecoveryCode ? 'text' : 'numeric', maxLength: useRecoveryCode ? 32 : 6 }} required disabled={busy} />
        {stage === 'verify' && <>
          {!useRecoveryCode && <FormControlLabel control={<Checkbox checked={regenerate} onChange={(event) => setRegenerate(event.target.checked)} disabled={busy} />} label="Yangi tiklash kodlarini olish" />}
          <Button size="small" onClick={() => { setUseRecoveryCode(!useRecoveryCode); setCode(''); setRegenerate(false); setError(''); }} disabled={busy}>
            {useRecoveryCode ? 'Autentifikator kodi bilan kirish' : 'Telefon yo‘qolganmi? Tiklash kodidan foydalanish'}
          </Button>
        </>}
      </>}
      {stage === 'recovery_codes' && <>
        <Alert severity="warning">Har bir kod faqat bir marta ishlaydi. Telefon yo‘qolsa, hisobingizni shu kodlar orqali tiklaysiz. Ularni paroldan alohida, xavfsiz joyda saqlang.</Alert>
        <Grid container spacing={1}>{challenge.recoveryCodes.map((value) => <Grid item xs={12} key={value}><Box sx={{ p: 0.75, bgcolor: 'action.hover', borderRadius: 1, fontFamily: 'monospace', textAlign: 'center', userSelect: 'all' }}>{value}</Box></Grid>)}</Grid>
        <Button startIcon={<DownloadOutlined />} variant="outlined" onClick={downloadRecovery}>Tiklash kodlarini yuklab olish</Button>
        <FormControlLabel control={<Checkbox checked={saved} onChange={(event) => setSaved(event.target.checked)} />} label="Tiklash kodlarini xavfsiz joyga saqladim" />
      </>}
      {challenge && <Typography variant="caption" color="text.secondary">Tasdiqlash 5 daqiqa amal qiladi. Ketma-ket 5 ta noto‘g‘ri kod hisobni vaqtincha bloklaydi.</Typography>}
      <Button disableElevation fullWidth size="large" type="submit" variant="contained" disabled={busy || (stage === 'recovery_codes' && !saved)}>
        {busy ? 'Tekshirilmoqda…' : stage === 'password' ? 'Davom etish' : stage === 'password_change' ? 'Parolni yangilash' : stage === 'recovery_codes' ? 'Saqladim, tizimga kirish' : 'Kodni tasdiqlash'}
      </Button>
      {challenge ? <Button onClick={restart} disabled={busy}>Kirishni qaytadan boshlash</Button> :
        <Typography variant="caption" color="text.secondary">Hisobni faqat super admin yaratadi. Parol unutilsa, super adminga murojaat qiling.</Typography>}
    </Stack>
  </Box>;
}
