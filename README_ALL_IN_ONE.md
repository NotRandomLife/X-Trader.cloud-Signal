# X Trader — All-in-One (Netlify + Sito)
Aggiornato: 2025-11-05T08:22:51.257093Z

- **POST /api/signal** → salva JSON istantaneo (Netlify Blobs)
- **GET /api/latest** → restituisce JSON (no-store)
- Publish directory rilevata: `.`

## Passi
1) Carica tutto questo pacchetto su Netlify (o collega il repo Git).
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
2) Aggiungi env in Netlify → Site settings → Environment variables:
   - `SIGNAL_TOKEN` = stringa lunga
3) Deploy.
4) Bot → invio:
   ```python
   import os, requests
   url = os.getenv("SIGNAL_ENDPOINT", "https://TUO-DOMINIO/api/signal")
   headers = {
     "Content-Type": "application/json",
     "Authorization": f"Bearer {os.getenv('SIGNAL_TOKEN','')}"
   }
   payload = {"pair": pair, "signal": str(decision).upper()}
   requests.post(url, json=payload, headers=headers, timeout=10)
   ```

Se serve, ho patchato (se presente) `SignalViewer.js` per puntare a `/api/latest` e `cache: 'no-store'`.
