# FODMAP — matvareoversikt

En nettside som viser hvilke matvarer du kan spise, bør begrense eller unngå
når du følger lav-FODMAP-kost. Siden er én enkelt nettside. Du trenger ingen
app og ingen innlogging.

## Hva siden gjør

- Viser 510 matvarer i 11 kategorier, merket SPIS, BEGRENSE eller UNNGÅ.
- Merker matvarer som er nye, flyttet eller oppdatert i siste oppdatering.
- Lar deg søke: matvarer og kategorier uten treff skjules, og treffene utheves.
- Lar deg øke tekststørrelsen.
- Viser forklaringstekster bak ℹ️-knapper på enkelte matvarer.
- Viser når en matvare ble endret når du holder musepekeren over merket.
- Tilpasser seg skjermen: én kolonne på mobil, tre kolonner på større skjermer.
- Kan installeres som app på mobil og datamaskin, med 🥗 som app-ikon.

## Åpne siden

**På nettet**

Den publiserte siden ligger på
[fodmap.sanntid.org](https://fodmap.sanntid.org).

**Lokalt på egen maskin**

1. Åpne en terminal i prosjektmappen.
2. Start en lokal tjener:

   ```bash
   python3 -m http.server 8000 --directory src
   ```

3. Åpne `http://localhost:8000` i nettleseren.

Du kan også åpne `src/index.html` direkte i nettleseren. Innholdet vises
alltid. I noen nettlesere starter søket bare når siden serveres, for
eksempel fra en lokal tjener eller fra den publiserte siden.

## Installere siden som app

Siden kan installeres på startskjermen eller i app-listen, akkurat som en
vanlig app. App-ikonet er 🥗.

- **På mobil (Android):** åpne siden i Chrome, trykk på menyen (⋮) og
  velg «Legg til på startskjermen» eller «Installer app».
- **På iPhone/iPad:** åpne siden i Safari, trykk på Del-knappen og velg
  «Legg til på startskjermen».
- **På datamaskin:** åpne siden i Chrome eller Edge og velg «Installer
  FODMAP» i adressefeltet eller i menyen.

Appen mellomlagrer ikke innhold. Hver gang du åpner siden, lastes den
ferskt fra nettet. Du får derfor alltid den nyeste utgaven av innholdet.

## Bruke siden

### Søke

1. Skriv et søkeord i feltet øverst på siden.
2. Les resultatet: matvarer og kategorier uten treff skjules, og treffene
   utheves med en ramme.
3. Tøm søket med ×-knappen eller Esc-tasten for å se hele listen igjen.

På mobil skjules tomme kolonner under søk. De kommer tilbake så snart noe i
dem treffer igjen.

Søket finner også forklaringstekstene bak ℹ️-knappene. Hvis en matvare
kommer opp fordi forklaringsteksten treffer, skifter knappen merke til ☑️.

Uten skript viser siden hele innholdet, men søket og tekststørrelse-knappen
er av.

### Endre tekststørrelse

Bruk Aa-knappen i søkefeltet. Knappen bytter tekststørrelse mellom 100, 125
og 150 prosent. Valget ditt huskes neste gang du åpner siden.

### Forstå fargene

- **SPIS**, grønn farge: du kan spise matvaren.
- **BEGRENSE**, gul farge: du bør begrense mengden.
- **UNNGÅ**, rød farge: du bør unngå matvaren.

På store skjermer vises tegnforklaringen øverst på siden. På mobil vises
merkelappen over innholdet i hver kolonne.

Øverst på siden står også en nærmere forklaring av BEGRENSE-kolonnen.

### Forstå oppdateringsmerkene

Etter en oppdatering bærer de endrede matvarene en egen merkeplass foran
navnet:

- 🆕 – matvaren er ny i oppdateringen.
- 🔄 – matvaren har flyttet til en annen kolonne (for eksempel fra
  BEGRENSE til SPIS).
- 🆙 – innholdet i matvaren er oppdatert, for eksempel mengden.

Matvarer som ikke er endret, har den vanlige merkeplassen.

Hold musepekeren over merket foran en matvare for å se når den ble endret.
For flyttede matvarer vises også kolonnen den kom fra, for eksempel
«Flyttet fra BEGRENSE til SPIS, dato 2025-05».

### Se forklaringstekster

Noen matvarer har en liten ℹ️-knapp etter navnet. Hold musepekeren over
knappen for å se forklaringsteksten. Klikk på knappen for å feste teksten
åpen, og klikk et annet sted på siden for å lukke den.

### Forstå fotnotene

Noen kategorier avsluttes med en fotnote som gjelder hele kategorien.
Fotnotene er merket VIKTIG (⚠️) eller TIPS (ℹ️), for eksempel om
glutenfrie produkter eller blandingskrydder.

## Innhold og kilde

Innholdet tar utgangspunkt i de to kildene som også står i footeren på
siden:

- [Norsk Helseinformatikk (NHI.no) – Dette er FODMAP-reduserte matvarer](https://nhi.no/kosthold/forebyggende-kost-og-sykdom/dette-er-fodmap-reduserte-matvarer)
- [NKFM – Lav FODMAP-mat ved IBS](https://www.helse-bergen.no/nasjonal-kompetansetjeneste-for-funksjonelle-mage-tarmsykdommer-nkfm/lav-fodmap-mat-ved-ibs)

Sjekk disse nettstedene hvis du vil sammenligne innholdet med oppdateringer.

## Endre innholdet

Matvarelisten ligger som datafiler under `data/`. Byggetrinnene
genererer nettsiden fra disse filene. Du trenger ikke kjenne til koden
for å endre innholdet, men du bør kjøre `./scripts/build.sh` etter
endringene for å se resultatet.

Innholdet ligger i datamapper som heter datoer (for eksempel
`data/2025-05/`). Den eldste mappen inneholder hele listen. Nyere
mapper inneholder bare de matvarene som er endra (delta). Du endrar
alltid i den nyeste mappen, og aldri i eldre mapper.

### Legge til en matvare

1. Finn riktig kategori i den nyeste datamappen (for eksempel
   `data/2025-05/frukt/`).
2. Lag en ny fil med navn på matvaren, for eksempel
   `data/2025-05/frukt/fiken.md`. Navnet må være på norsk, med
   bindestreker i stedet for mellomrom. UTF-8-bokstaver som æ, ø, å
   er tillatt.
3. Skriv frontmatter med gruppe og eventuelt mengd:

   ```yaml
   ---
   name: Fiken
   group: spis
   amount: 50 gram
   attribution:
     - https://eksempel.no/kilde
   ---
   ```

   - `name`: matvarens navn, slik det skal vises.
   - `group`: kolonnen matvaren skal i — `spis`, `begrens` eller
     `unngå`.
   - `amount`: mengd som gjelder (valgfritt). Tomt verdi (`amount:`)
     fjerner mengda.
   - `attribution`: lenke til kilden (valgfritt).

4. Kjør `./scripts/build.sh`.
5. Sjekk `src/index.html` i nettleseren.
6. Opprett en pull request med den nye fila.

### Endre en matvare

1. Finn matvaren i rett fil under den nyeste datamappen.
2. Endre feltet i frontmatter. Et endra felt er nok — resten arves:

   ```yaml
   ---
   group: begrens
   ---
   ```

   Dette flytter matvaren til BEGRENSE-kolonnen.

3. Kjør `./scripts/build.sh`.
4. Sjekk resultatet i `src/index.html`.
5. Opprett en pull request med endringen.

### Fjerne en matvare

Du fjerner en matvare ved å sette `visible: false`. Matvaren forsvinner
fra søk og tabeller, men historikken blir værende:

```yaml
---
visible: false
---
```

Kopier fila til den nyeste datamappen, sett `visible: false`, og
opprett en pull request. For å ta inn ei matvare igjen, sett
`visible: true` i ei nyere mappe.

### Foreslå en ny kategori

Du kan også foreslå nye kategorier (kolonner på sida). Da må du endre
to steder:

1. Legg til en ny mappe under `data/2025-05/` med navn på kategorien.
2. Legg til kategorien i `data/config.json` under `sections`. Du må
   oppgi `id`, `title` og `emoji`.

Eksempel på ny kategori i `config.json`:

```json
{
  "id": "te",
  "title": "Te og drikke",
  "emoji": "🍵",
  "background-color": "#c8b88a"
}
```

Deretter legger du til matvarer i den nye mappen som beskrevet over.
Opprett pull requesten med begge endringene.

### Retningslinjer

- Bruk eksisterende språk og struktur. Hold filene på samme format som
  de andre matvarene.
- Begrunn endringen i pull requesten. For nye matvarer eller bytt av
  merke (for eksempel fra BEGRENSE til SPIS) bør du gi en kilde.

## Vedlikehold og utvikling

### Tester og formatering

```bash
npm test          # kjører testsuiten
npm run format    # formaterer kildefilene med Prettier
```

### Verktøyskript

`scripts/verify_codebase_sync.sh` sjekker at alle filene og mappene som er
oppført i `CODEBASE.md`, finnes. Kjør skriptet etter strukturendringer:

```bash
./scripts/verify_codebase_sync.sh
```

Tilstandskode 0 betyr at alle stier finnes. Ellers skriver skriptet hvilke
stier som mangler.

`scripts/bump-version.sh` øker versjonen i `VERSION`. Standard steg er
patch, men du kan velge steg med et argument:

```bash
./scripts/bump-version.sh        # patch: 0.10.5 → 0.10.6
./scripts/bump-version.sh minor  # minor: 0.10.5 → 0.11.0
./scripts/bump-version.sh major  # major: 0.10.5 → 1.0.0
```

Versjonstallet i footeren på siden trenger ikke oppdateres: siden er
generert, og byggeskriptet (`./scripts/build.sh`) leser versjonen fra
`VERSION` og skriver den inn i footeren.

`scripts/validate-changelog.sh` kontrollerer at den øverste overskriften i
`CHANGELOG.md` (format `## [x.y.z] - YYYY-MM-DD`) stemmer med `VERSION` og
dagens dato:

```bash
./scripts/validate-changelog.sh
```

`scripts/build.sh` bygger siden: den genererer `index.html`,
`css/tokens.css` og `css/roles.css` fra innholdet i `data/`. Kjør
skriptet etter du har endret innholdet:

```bash
./scripts/build.sh
```

Skriptet skriver til `src/` som standard. Du kan velge en annen mappe
med et argument (`./scripts/build.sh min-mappe`). Etter byggingen
skriver skriptet en oppsummering: versjon, antall kategorier og
matvarer, antall endringsmerker, og hvilke filer som ble skrevet. Du kan
også kjøre det via npm:

```bash
npm run build
```

Kjør `./scripts/build.sh --help` for full bruksanvisning.

### Publisering

GitHub Actions publiserer siden til GitHub Pages hver gang du pusher til
`main`. Byggetrinnet genererer `index.html`, `css/tokens.css` og
`css/roles.css` fra innholdet i `data/` før publisering. Den publiserte
siden er derfor alltid bygget fra siste innhold, selv om de genererte
filene i `src/` er utdaterte. Arbeidsflyten ligger i
`.github/workflows/deploy-pages.yml`.

### Tekniske valg

- Ren HTML, CSS og JavaScript med fire moduler (`search.js`,
  `text-scale.js`, `note-popover.js` og `pwa.js`). Ingen rammeverk og
  ingen kjøretidsavhengigheter i nettleseren.
- Siden kan installeres som app (PWA) gjennom et manifest
  (`manifest.webmanifest`) og en tjenestearbeider (`sw.js`).
  Tjenestearbeideren mellomlagrer ingenting: alle forespørsler går rett
  til nettet, så innholdet er alltid ferskt.
- Innholdet ligger som data i `data/`, og et byggetrinn genererer siden:
  `./scripts/build.sh`. Den ferdige siden i `src/` er vanlige statiske
  filer og trenger ikke byggetrinn når den vises.
- Ingen eksterne fonter eller tredjepartsressurser.
- Innholdet er fastsatt i `BLUEPRINT.md` §12.1 og verifisert av testsuiten.
- Utviklingsavhengighetene (eksakte versjoner i `package.json`) er `jsdom`
  for DOM-emulering i tester og `prettier` for formatering.

### Lisens og kildekode

- Lisens: MIT (se `LICENSE`).
- Kildekode: [github.com/aheimsbakk/fodmap](https://github.com/aheimsbakk/fodmap/).
- Feil eller ønsker? Opprett en sak i GitHub-repoet.
