# `fstu.uz/tt` Kubernetes proxy

`tt-path-proxy.yaml` `https://fstu.uz/tt` so‘rovlarini boshqa serverda
ishlayotgan `tt` ilovasiga uzatadi. Tashqi foydalanuvchi uchun alohida
`tt.fstu.uz` subdomeni kerak bo‘lmaydi.

Deploydan oldin:

1. `TT_UPSTREAM_IP` — `tt` serverining Kubernetes node’laridan ochiladigan IP manzili.
2. `TT_UPSTREAM_PORT` — `tt` ilovasi tinglaydigan port.
3. Klasterda `ingress-nginx` controller va `fstu.uz` DNS yozuvi uning tashqi IP manziliga yo‘naltirilgan bo‘lishi kerak.
4. `tt` ilovasi statik fayllarini `/tt/` base path orqali bera olishi kerak. Agar u `/assets/...` kabi mutlaq yo‘llardan foydalansa, ilovaning base URL qiymati `/tt/` qilinadi.

Tekshiruv:

```bash
kubectl apply --dry-run=server -f k8s/tt-path-proxy.yaml
kubectl apply -f k8s/tt-path-proxy.yaml
kubectl -n fstu-web get ingress,service,endpointslice
curl -I https://fstu.uz/tt/
```
