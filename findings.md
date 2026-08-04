# Funnet ved sammenligning: matvarelister_mai-25.pdf mot appens lister

Dato: 2026-08-01
Kilde: `matvarelister_mai-25.pdf` (9 sider, 7 kategorier)
Sammenliknet mot: `src/index.html` (11 seksjoner)
Kartlegging: LAV → SPIS, MODERAT → BEGRENSE, HØY → UNNGÅ

> Merk: PDF-en er en kondensert liste (~200 varer) mot appens ~484 varer. Appen
> har mye mer detalj (mengdeangivelser, merker, undergrupper) som ikke står i
> PDF-en og som ikke er behandlet her. Dette dokumentet viser bare konflikter:
> matvarer som mangler, og matvarer som har byttet kolonne.

---

## 0. Spørsmål som må avklares før endring

1. **Rømme** (sour cream) står i **både SPIS- og UNNGÅ-kolonnen** i data vi har
   fra et annet sted. Hvordan skal vi håndtere dette? Sannsynlig forklaring er
   at laktosefri rømme = SPIS, mens vanlig rømme = UNNGÅ. Må avklares før
   kolonne plasseres.
2. **Drue = UNNGÅ** i PDF-en. Avviker fra Monash-data og fra appen (SPIS).
   Verifiser mot kilden før endring.
3. **Blåbær «store, hvite inni» = fri SPIS** i PDF-en. Appen har dem i
   BEGRENSE med 40 g-grense. Verifiser mot kilden før endring.

---

## 1. Grønnsaker og belgfrukter

### Matvarer som mangler i appen

| PDF (kolonne)                            | Foreslått plassering |
| ---------------------------------------- | -------------------- |
| Edamame/soyabønner                       | SPIS (LAV)           |
| Butternuttgresskar/flaskegresskar (63 g) | BEGRENSE (MODERAT)   |
| Kidneybønner, hermetisk (86 g)           | BEGRENSE (MODERAT)   |
| Brokkolini (stilker)                     | SPIS (LAV)           |
| Brokkolini (topper)                      | UNNGÅ (HØY)          |
| Cherrytomat                              | UNNGÅ (HØY)          |

### Matvarer som har byttet kolonne i PDF-en

| Matvare                               | Nå i appen                 | PDF sier                             | Endring                  |
| ------------------------------------- | -------------------------- | ------------------------------------ | ------------------------ |
| Paprika, rød                          | SPIS                       | UNNGÅ                                | SPIS → UNNGÅ             |
| Paprika, grønn (1 dl)                 | BEGRENSE                   | SPIS, ingen mengde                   | BEGRENSE → SPIS          |
| Rosenkål (2 stk)                      | BEGRENSE                   | SPIS, ingen mengde                   | BEGRENSE → SPIS          |
| Squash                                | SPIS (og BEGRENSE 0,75 dl) | MODERAT (67 g)                       | SPIS/BEGRENSE → BEGRENSE |
| Søtpotet (75 g, og UNNGÅ)             | BEGRENSE + UNNGÅ           | SPIS, ingen mengde                   | begge → SPIS             |
| Maiskorn, hermetisk (2 ts)            | BEGRENSE                   | SPIS, ingen mengde                   | BEGRENSE → SPIS          |
| Sukkererter (4 stk)                   | BEGRENSE                   | SPIS, ingen mengde                   | BEGRENSE → SPIS          |
| Tomat, vanlig                         | SPIS                       | MODERAT (65 g)                       | SPIS → BEGRENSE          |
| Rødbeter (20 g)                       | BEGRENSE                   | SPIS (fersk/hermetisert uten mengde) | BEGRENSE → SPIS          |
| Stangselleri (mindre enn 7 cm)        | BEGRENSE                   | UNNGÅ                                | BEGRENSE → UNNGÅ         |
| Kikerter, hermetisk (4 ss)            | BEGRENSE                   | UNNGÅ                                | BEGRENSE → UNNGÅ         |
| Bønner, svarte (3 ss)                 | BEGRENSE                   | UNNGÅ                                | BEGRENSE → UNNGÅ         |
| Store hvite bønner, hermetiske (3 ss) | BEGRENSE                   | UNNGÅ                                | BEGRENSE → UNNGÅ         |
| Røde linser, hermetisk                | SPIS                       | MODERAT (23 g, tørre kokte)          | noter                    |

Mønster: PDF-en flytter de fleste **belgfruktene** (kikerter, sorte bønner,
hvite bønner, erter, linser) fra BEGRENSE → UNNGÅ, samtidig som enkelte
grønnsaker åpnes opp til fri SPIS (paprika grønn, rosenkål, maiskorn,
sukkererter, søtpotet, rødbeter).

---

## 2. Frukt, tørket frukt og bær

### Matvarer som mangler

| Matvare          | PDF-kolonne | Foreslått |
| ---------------- | ----------- | --------- |
| Grapefrukt       | HØY         | UNNGÅ     |
| Persimon         | HØY         | UNNGÅ     |
| Gojibær (tørket) | HØY         | UNNGÅ     |

### Kolonnebytte

| Matvare                                   | I appen            | PDF sier                                                         |
| ----------------------------------------- | ------------------ | ---------------------------------------------------------------- |
| Blåbær «amerikanske og hvite inni» (40 g) | BEGRENSE           | SPIS, ingen mengde (LAV)                                         |
| Tranebær (1 ss)                           | BEGRENSE           | SPIS (ferske, LAV); tørket tranebær = UNNGÅ                      |
| Cantaloupemelon                           | SPIS, ingen mengde | MODERAT (121 g)                                                  |
| Jordbær                                   | SPIS, ingen mengde | MODERAT (65 g)                                                   |
| Aprikos                                   | UNNGÅ              | MODERAT (67 g)                                                   |
| Eple (1 båt)                              | BEGRENSE           | UNNGÅ                                                            |
| Drue                                      | SPIS               | UNNGÅ (se spørsmål §0.2)                                         |
| Granateple (0,5 dl)                       | BEGRENSE           | UNNGÅ                                                            |
| Mango (0,5 dl)                            | BEGRENSE           | UNNGÅ                                                            |
| Papaya, fersk                             | SPIS               | SPIS (samsvar) — «Papaya mer enn 1 bit» under UNNGÅ bør vurderes |

Tørket frukt (PDF s. 5, HØY): ananas, aprikos, eple, fiken, mango, papaya,
pære, rosiner, solbær, svisker, tranebær, gojibær. Appen mangler **gojibær**,
og **tranebær** må skilles (fersk = SPIS, tørket = UNNGÅ). Tørket **banan** =
LAV (appen har «Banan i biter (15 stk)» i SPIS — samsvar).

---

## 3. Nøtter og frø (+ tørket frukt)

### Matvarer som mangler

| Matvare    | PDF-kolonne | Foreslått |
| ---------- | ----------- | --------- |
| Paranøtter | LAV         | SPIS      |
| Hampfrø    | LAV         | SPIS      |

### Kolonnebytte

| Matvare                                            | I appen  | PDF sier           |
| -------------------------------------------------- | -------- | ------------------ |
| Pinjekjerne                                        | SPIS     | UNNGÅ              |
| Hasselnøtter (10 stk)                              | BEGRENSE | UNNGÅ              |
| Mandler (10 stk)                                   | BEGRENSE | UNNGÅ              |
| Kokossukker (dekkes av «Sukker, kokosblomst 1 ts») | BEGRENSE | SPIS, ingen mengde |

---

## 4. Melk, meieriprodukter & alternativer

### Matvarer som mangler

| Matvare         | PDF-kolonne | Foreslått |
| --------------- | ----------- | --------- |
| Crème fraiche   | LAV         | SPIS      |
| Kondensert melk | HØY         | UNNGÅ     |
| Fløtemysost     | HØY         | UNNGÅ     |

### Kolonnebytte

| Matvare             | I appen  | PDF sier                                                                         |
| ------------------- | -------- | -------------------------------------------------------------------------------- |
| Rømme               | UNNGÅ    | SPIS (LAV) — strid mot kanoniske stavemåter (§4 UNNGÅ «Rømme»); se spørsmål §0.1 |
| Kesam               | UNNGÅ    | SPIS (LAV)                                                                       |
| Haloumi (2 skiver)  | BEGRENSE | SPIS                                                                             |
| Mandelmelk (2,5 dl) | BEGRENSE | SPIS                                                                             |
| Rismelk (2 dl)      | BEGRENSE | SPIS                                                                             |
| Havremelk (1,25 dl) | BEGRENSE | UNNGÅ                                                                            |

Ellers fullt samsvar: oster i SPIS (blåmuggost, brie, cheddar, camembert,
chevre, feta, mozzarella, parmesan, ricotta, hvitost, manchego); fløte, iskrem,
kefir, vaniljesaus, yoghurt, melk, vanlig Biola i UNNGÅ. «Kokosmelk» (0,6 dl,
BEGRENSE i appen) står ikke i PDF-en — behold som er.

---

## 5. Brød, ris og pasta

### Matvarer som mangler

| Matvare                         | PDF-kolonne | Foreslått                                   |
| ------------------------------- | ----------- | ------------------------------------------- |
| Panko                           | LAV         | SPIS                                        |
| Popcorn (uten krydder)          | LAV         | SPIS                                        |
| Sorghum                         | LAV         | SPIS                                        |
| Teff                            | LAV         | SPIS                                        |
| Næringsgjær (nutritional yeast) | LAV         | SPIS                                        |
| Glutenfritt mel (eget punkt)    | LAV         | SPIS / dekkes delvis av «Brød, glutenfritt» |
| Durumhvete                      | HØY         | UNNGÅ                                       |
| Kokosmel                        | HØY         | UNNGÅ                                       |
| Soyamel                         | HØY         | UNNGÅ                                       |
| Spelt (korn, ikke surdeig)      | HØY         | UNNGÅ                                       |

### Kolonnebytte

| Matvare                             | I appen  | PDF sier                                |
| ----------------------------------- | -------- | --------------------------------------- |
| Pasta/spagetti av hvete (75 g kokt) | BEGRENSE | UNNGÅ (pasta av hvete)                  |
| Speltpasta (75 g kokt)              | BEGRENSE | UNNGÅ (spelt)                           |
| Eggnudler                           | BEGRENSE | ikke i PDF — behold                     |
| Kikertpasta (100 g kokt)            | BEGRENSE | ikke i PDF — vurder (kikertmel = UNNGÅ) |

Ellers fullt samsvar: ris, quinoa, glutenfri pasta, risnudler, hirse, maismel,
potetmel, maisstivelse i SPIS; bokhvetekjerner (27 g) og puffet ris (15 g) i
BEGRENSE; bulgur, bygg, couscous, emmer, hvete, kikertmel, mandelmel, rug,
semulegryn, hvetenudler/pasta/gnocchi i UNNGÅ.

---

## 6. Sukker, søtning og annet + basisvarer

### Matvarer som mangler

| Matvare                         | PDF-kolonne      | Foreslått |
| ------------------------------- | ---------------- | --------- |
| Gjær                            | LAV (basisvarer) | SPIS      |
| High-fructose corn syrup (HFCS) | HØY (ingrediens) | UNNGÅ     |
| Sikorirot                       | HØY (ingrediens) | UNNGÅ     |
| Hvitløk/hvitløksekstrakt        | HØY (ingrediens) | UNNGÅ     |
| Løk/løkekstrakt                 | HØY (ingrediens) | UNNGÅ     |

### Kolonnebytte

| Matvare                                                    | I appen  | PDF sier                         |
| ---------------------------------------------------------- | -------- | -------------------------------- |
| Maltekstrakt (i «Maltodextrin/maltose/maltekstrakt», SPIS) | SPIS     | UNNGÅ (ingrediens) — viktig      |
| Sukker, kokosblomst (1 ts)                                 | BEGRENSE | SPIS (kokossukker, ingen mengde) |

Ellers fullt samsvar: sukker/brunt/melis/palmesukker/stevia i SPIS;
agavesirup, honning, fruktjuice, fruktose, E-stoff-søtningsmidler (erytritol,
isomalt, laktitol, maltitol, mannitol, sorbitol, xylitol) i UNNGÅ. Notat:
PDF-en skriver «Erythritol/Sukrin (E938)» — appen har «E 968», som er riktig
E-nummer; PDF-en har sannsynlig skrivefeil.

---

## 7. Krydder og urter / saus (overlapp i PDF «BASISVARER»)

PDF-en dekker bare et begrenset utvalg: rene krydder, vaniljeessens,
Dijon-sennep, eplecidereddik, rene oljer (SPIS); blandingskrydder,
grillkrydder, sitronpepper, tacokrydder, hvitløkspulver, løkpulver (UNNGÅ).
Appen dekker alle disse allerede (sennep + eddik ligger i saus; krydderpulver i
krydder-UNNGÅ). **Ingen mangler, ingen bytter.**

---

## 8. Pålegg

Fullt samsvar for varene PDF-en lister: egg, oster, rent kjøttpålegg (kokt
skinke, roastbiff, hamburgerrygg, spekeskinke, bacon), tunfisk, sardiner,
reker, bringebær-/jordbærsyltetøy, majones, mandelsmør, peanøttsmør, smør =
SPIS; brunost, pålegg med løk/hvitløk, sukkerfritt syltetøy, syltetøy av høy
FODMAP-frukt = UNNGÅ. **Ingen konflikter.** (PDF-en har ingen MODERAT-kolonne
for pålegg.)

---

## 9. Ikke i PDF-en

- **Drikke** (15+ varer) og **Kjøtt, egg, fisk** (9 varer) har ingen
  tilsvarende kategori i PDF-en — kan ikke sammenlignes. Unntak:
  «fruktjuice fra konsentrat» (UNNGÅ) = appens «Juice fra konsentrat uansett
  frukt» (drikke/UNNGÅ) — samsvar.

---

## 10. Oppsummering — tiltak for samsvar med PDF-en

1. **Behold som SPIS** (fjern mengde/grense): rømme, kesam, haloumi,
   mandelmelk, rismelk, paprika grønn, rosenkål, maiskorn, sukkererter,
   søtpotet, rødbeter, blåbær hvite inni (fersk), tranebær (fersk),
   kokossukker.
2. **Flytt til UNNGÅ** (fjern fra SPIS/BEGRENSE): paprika rød, stangselleri,
   kikerter hermetisk, sorte bønner, store hvite bønner, eple, granateple,
   mango, maltekstrakt, drue (?), havremelk, pasta/spelt av hvete,
   pinjekjerne, hasselnøtter, mandler, kikerter.
3. **Ny i UNNGÅ**: grapefrukt, persimon, gojibær, kondensert melk, fløtemysost,
   durumhvete, kokosmel, soyamel, spelt, HFCS, sikorirot, hvitløk/løkekstrakt,
   tørket tranebær.
4. **Ny i SPIS**: paranøtter, hampfrø, edamame, brokkolini (stilker), panko,
   popcorn, sorghum, teff, næringsgjær, gjær, crème fraiche.
5. **Ny i BEGRENSE**: butternuttgresskar, kidneybønner (hermetisk), cantaloupe
   (121 g), jordbær (65 g), aprikos (67 g).

> Punkter merket med (?) må verifiseres mot kilden før endring — se §0.
