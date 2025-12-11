# Test Loading Sequence

Per testare il componente LoadingSequence:

1. **Rimuovi il cookie** (se esiste):
   - Apri la console del browser (F12)
   - Esegui: `document.cookie = "d3mo_has_seen_loading=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"`
   - Ricarica la pagina

2. **Oppure usa il parametro URL**:
   - Vai su: `http://localhost:3000/?showLoading=true`
   - Questo forzerà la visualizzazione del loading

3. **Verifica che il componente sia montato**:
   - Controlla la console per eventuali errori
   - Verifica che il componente LoadingSequence sia presente nel DOM
