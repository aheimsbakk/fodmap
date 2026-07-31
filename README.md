# FODMAP — matvareoversikt

En statisk, frittstående nettside med én side som viser lav-FODMAP-matvarer på norsk. Siden er en gjenimplementering av `origin/fodmap.html` uten rammeverk, byggetrinn eller kjøretidsavhengigheter.

## Hva siden gjør

- Viser 484 matvarer i 11 kategorier (SPIS, BEGRENSE, UNNGÅ).
- Har søk med direkte filtrering: treff i varer og kategorier blir stående, og treffene utheves.
- Er responsiv: én kolonne på mobil, tre kolonner på større skjermer.
- Består bare av HTML, CSS og én JavaScript-modul.

## Hurtigstart

Start en statisk filserver:

```bash
python3 -m http.server 8000 --directory src
# Åpne http://localhost:8000 i nettleseren
```

Du kan også åpne `src/index.html` direkte i nettleseren.

## Bruk

### Søk

Skriv i søkefeltet øverst på siden. Bare varer og kategorier som matcher søket, blir stående, og treffene utheves. Bruk ×-knappen, eller tøm feltet, for å vise hele listen igjen. Siden viser alt innhold også uten skript — bare søket blir borte.

### Tester og formatering

```bash
npm test          # kjør testsuiten (Nodes innebygde testkjører)
npm run format    # formater kildefilene med Prettier
```

### Skript

`scripts/verify_codebase_sync.sh` sjekker at alle fysiske stier som er oppført i `CODEBASE.md`, finnes. Kjør skriptet etter strukturendringer:

```bash
./scripts/verify_codebase_sync.sh
```

Tilstandskode 0 betyr at alle stier finnes. Ved en annen tilstandskode viser skriptet hvilke stier som mangler.

`scripts/bump-version.sh` øker versjonen i `VERSION` og oppdaterer versjonsmerket i footeren på siden (`FODMAP vX.Y.Z // Kilder:` i `src/index.html`). Standard trinn er patch. Skriptet feiler hvis markøren i footeren mangler, så versjonen aldri endres uten at footeren oppdateres:

```bash
./scripts/bump-version.sh        # patch: 0.3.0 → 0.3.1
./scripts/bump-version.sh minor  # minor: 0.3.0 → 0.4.0
./scripts/bump-version.sh major  # major: 0.3.0 → 1.0.0
```

Skriptet skriver den nye versjonen til `VERSION` og skriver den ut på slutten.

## Konfigurasjon

- Utviklingsavhengigheter (eksakte versjoner i `package.json`): `jsdom` for DOM-emulering i tester, `prettier` for formatering.
- Ingen eksterne fonter: siden bruker plattformens innebygde systemfont (system-ui), så typografien er avhengig av skrifttypene som allerede finnes på enheten. Siden laster ingen eksterne ressurser og fungerer helt uten nett. Ikoner er emoji-tegn; tegn med dobbel fremstilling (⚖️ ℹ️ ⚠️ ☕ 🌶️) har variasjonsvelger.
- Innholdet følger `BLUEPRINT.md` §12.1: ordrett fra originalen, med unntak av de godkjente rettelsene som er listet der.

## Kilde og oppdateringer

Matvarelisten kommer fra `origin/fodmap.html`. Når listen skal sjekkes for oppdateringer, er kilden Nasjonal kompetansetjeneste for funksjonelle mage-tarmsykdommer (NKFM) ved Helse Bergen:

[NKFM – Lav FODMAP-mat ved IBS](https://www.helse-bergen.no/nasjonal-kompetansetjeneste-for-funksjonelle-mage-tarmsykdommer-nkfm/lav-fodmap-mat-ved-ibs)
