# FODMAP — matvareoversikt

En nettside som viser hvilke matvarer du kan spise, bør begrense eller unngå
når du følger lav-FODMAP-kost. Siden er én enkelt nettside. Du trenger ingen
app og ingen innlogging.

## Hva siden gjør

- Viser 484 matvarer i 11 kategorier, merket SPIS, BEGRENSE eller UNNGÅ.
- Lar deg søke: matvarer og kategorier uten treff skjules, og treffene utheves.
- Lar deg øke tekststørrelsen.
- Tilpasser seg skjermen: én kolonne på mobil, tre kolonner på større skjermer.

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

## Bruke siden

### Søke

1. Skriv et søkeord i feltet øverst på siden.
2. Les resultatet: matvarer og kategorier uten treff skjules, og treffene
   utheves med en ramme.
3. Tøm søket med ×-knappen eller Esc-tasten for å se hele listen igjen.

På mobil skjules tomme kolonner under søk. De kommer tilbake så snart noe i
dem treffer igjen.

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

## Innhold og kilde

Innholdet tar utgangspunkt i de to kildene som også står i footeren på
siden:

- [Norsk Helseinformatikk (NHI.no) – Dette er FODMAP-reduserte matvarer](https://nhi.no/kosthold/forebyggende-kost-og-sykdom/dette-er-fodmap-reduserte-matvarer)
- [NKFM – Lav FODMAP-mat ved IBS](https://www.helse-bergen.no/nasjonal-kompetansetjeneste-for-funksjonelle-mage-tarmsykdommer-nkfm/lav-fodmap-mat-ved-ibs)

Sjekk disse nettstedene hvis du vil sammenligne innholdet med oppdateringer.

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

`scripts/bump-version.sh` øker versjonen i `VERSION` og oppdaterer
versjonstallet i footeren på siden. Standard steg er patch, men du kan velge
steg med et argument:

```bash
./scripts/bump-version.sh        # patch: 0.10.3 → 0.10.4
./scripts/bump-version.sh minor  # minor: 0.10.3 → 0.11.0
./scripts/bump-version.sh major  # major: 0.10.3 → 1.0.0
```

Skriptet stopper hvis versjonsmerket i footeren mangler, så versjonen aldri
endres uten at footeren oppdateres samtidig.

`scripts/validate-changelog.sh` kontrollerer at den øverste overskriften i
`CHANGELOG.md` (format `## [x.y.z] - YYYY-MM-DD`) stemmer med `VERSION` og
dagens dato:

```bash
./scripts/validate-changelog.sh
```

### Tekniske valg

- Ren HTML, CSS og JavaScript med tre moduler (`search.js`,
  `text-scale.js` og `note-popover.js`). Ingen rammeverk og ingen
  kjøretidsavhengigheter i nettleseren.
- Innholdet ligger som data i `data/`, og et byggetrinn genererer siden:
  `node scripts/build/build.mjs src`. Den ferdige siden i `src/` er
  vanlige statiske filer og trenger ikke byggetrinn når den vises.
- Ingen eksterne fonter eller tredjepartsressurser.
- Innholdet er fastsatt i `BLUEPRINT.md` §12.1 og verifisert av testsuiten.
- Utviklingsavhengighetene (eksakte versjoner i `package.json`) er `jsdom`
  for DOM-emulering i tester og `prettier` for formatering.

### Lisens og kildekode

- Lisens: MIT (se `LICENSE`).
- Kildekode: [github.com/aheimsbakk/fodmap](https://github.com/aheimsbakk/fodmap/).
- Feil eller ønsker? Opprett en sak i GitHub-repoet.
