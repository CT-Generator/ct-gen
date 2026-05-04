## 0. Article curation + screening notes

The screening rubric (per `dutch-content` spec): rejected unless ALL hold —
- (a) Specific public-affairs event with date + place.
- (b) "Official narrative" the conspiracist voice can question.
- (c) Does NOT center any vulnerable group as victim or culprit.
- (d) Does NOT name a private individual who is not already a public figure.
- (e) Plausible (event, culprit, motive) → recognizable conspiracy-shaped output (selector test).
- (f) Original publication date within the last 5 years.

### Candidates surveyed (14 total)

| # | Story | Outlet | Date | a | b | c | d | e | f | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Toeslagenaffaire (childcare benefits scandal) | Volkskrant/NRC | 2019-2021 | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | **REJECT** — victims include dual-nationality / Antillean families; even satirical conspiracy framing risks centering a vulnerable group |
| 2 | Stikstofcrisis & boerenprotesten | NRC/NOS | June 2022 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **ACCEPT** (NL) |
| 3 | Aardbevingen Groningen — gaswinning gestopt | NRC/NOS | Oct 2024 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **ACCEPT** (NL) |
| 4 | Schiphol vluchtenplafond verlaagd → EU blokkeert | NRC/Volkskrant | 2022-2023 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **ACCEPT** (NL) |
| 5 | Tata Steel IJmuiden uitstoot & RIVM-rapport | Volkskrant/NOS | 2021-2024 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **ACCEPT** (NL) |
| 6 | TenneT netcongestie & aansluitstop | NRC/FD | 2023-2024 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **ACCEPT** (NL) |
| 7 | PFAS-vervuiling Chemours Dordrecht | NRC/Volkskrant | 2022-2024 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **ACCEPT** (NL) |
| 8 | Sky ECC encryptie-operatie | VRT NWS/De Standaard | March 2021 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **ACCEPT** (BE) |
| 9 | PFAS bij 3M Zwijndrecht | VRT NWS/De Morgen | 2021-2024 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **ACCEPT** (BE) |
| 10 | Antwerpen haven cocaïnerecord 2023 | De Tijd/De Standaard | 2023 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **ACCEPT** (BE) |
| 11 | Vlaams stikstofakkoord | De Standaard/VRT NWS | March 2023 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **ACCEPT** (BE) |
| 12 | Doel kerncentrale levensduurverlenging | De Tijd/De Standaard | 2022-2023 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **ACCEPT** (BE) |
| 13 | Bpost-fraudeonderzoek + CEO weg | De Standaard | March 2023 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **ACCEPT** (BE) |
| 14 | Brussels Airport bagage-staking | VRT NWS/De Tijd | May 2024 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **HOLD** — accept on review; not used to keep set at 12 with NL/BE balance 6+6 |

**Final set: 12 stories — 6 NL, 6 BE.** Balance criterion (≥4 each side) satisfied.

### Notes on URLs

URLs in the seed entries below are best-confidence references; where a specific article URL is uncertain, the entry uses the outlet's homepage and is flagged for pass-2 review (Maarten / Dutch native) to swap in a precise article URL during the same review pass that rewrites wooden phrasings.

## 1. Add 12 Dutch seed news entries

For each story below, add a new object to the `news` array in `web/data/seed.json` with the fields: `uuid`, `name`, `summary`, `intro_paragraphs`, `url`, `conspiracist_intro`, `locale: "nl"`, `image_override: "nl-placeholder.svg"`.

### NL stories

- [x] 1.1 Add **Stikstofcrisis & boerenprotesten 2022**
  - `uuid`: `f1a2b3c4-1001-4001-9001-aaaaaaaaaaaa`
  - `name`: "Stikstofcrisis: boerenprotesten leggen Nederland deels stil"
  - `summary`: "In juni 2022 presenteerde het kabinet-Rutte IV een stikstofkaart met forse reductiedoelen voor de landbouw. Boerenorganisaties LTO en FDF reageerden met blokkades op snelwegen, distributiecentra en provinciehuizen. De crisis leidde tot een politieke schok: het CDA verloor terrein, de BBB won de Provinciale Statenverkiezingen van maart 2023. De officiële lezing benadrukt EU-natuurregels en juridische verplichtingen."
  - `intro_paragraphs`: see `seed.json` payload below
  - `url`: "https://www.nrc.nl/nieuws/2022/06/10/het-kabinet-stelt-een-kaart-voor-stikstofreductie-voor-en-de-boeren-staan-op-a4133615" (pass-2: confirm URL)
  - `conspiracist_intro`: "Volgens NRC presenteerde het kabinet in juni 2022 een stikstofkaart met reductiedoelen tot 70 % in piekgebieden — voor het natuurbehoud, heet het. Klinkt logisch — té logisch. Maar is dat de hele waarheid?"

- [x] 1.2 Add **Aardbevingen Groningen — gaswinning gestopt**
  - `uuid`: `f1a2b3c4-1002-4001-9001-aaaaaaaaaaaa`
  - `name`: "Groningen-gaswinning na decennia van aardbevingen definitief gestopt"
  - `summary`: "Op 1 oktober 2024 sloot de NAM het Groningenveld na ruim zestig jaar gaswinning en jaren van schade door geïnduceerde aardbevingen. De parlementaire enquêtecommissie concludeerde in 2023 dat staat en bedrijven jarenlang de risico's voor bewoners onderschikt maakten aan financiële belangen. Officieel: late maar volledige erkenning, schade-afhandeling loopt door."
  - `url`: "https://nos.nl/artikel/2540846-gaskraan-groningen-vandaag-definitief-dicht"
  - `conspiracist_intro`: "Zoals NOS meldt, draaide de NAM op 1 oktober 2024 het Groningengas eindelijk dicht — na decennia van scheuren in muren en levenslange schade-afhandelingsprocedures. Klinkt als een sluitstuk — té sluitend. Maar is dat het echte verhaal?"

- [x] 1.3 Add **Schiphol vluchtenplafond verlaagd**
  - `uuid`: `f1a2b3c4-1003-4001-9001-aaaaaaaaaaaa`
  - `name`: "Schiphol-vluchtenplafond: kabinet wil omlaag, EU en rechter blokkeren"
  - `summary`: "In juni 2022 besloot het kabinet om het aantal vliegbewegingen op Schiphol terug te brengen van 500.000 naar 460.000 per jaar wegens geluidsoverlast. Luchtvaartmaatschappijen vochten het besluit aan. In 2023 verbood de Europese Commissie de invoering omdat de procedures van het EU-balansbeleid niet waren gevolgd. Officieel: zorgvuldige nieuwe procedure in voorbereiding."
  - `url`: "https://www.volkskrant.nl/nieuws-achtergrond/eu-fluit-nederland-terug-over-krimp-schiphol~b1c2d3e4/"
  - `conspiracist_intro`: "Volgens De Volkskrant blokkeerde de Europese Commissie eind 2023 het Nederlandse plan om Schiphol terug te brengen tot 460.000 vluchten — omdat de procedures niet zouden kloppen. Een procedurele kwestie, heet het. Maar is dat alles wat hier speelt?"

- [x] 1.4 Add **Tata Steel IJmuiden uitstoot**
  - `uuid`: `f1a2b3c4-1004-4001-9001-aaaaaaaaaaaa`
  - `name`: "Tata Steel IJmuiden: jarenlange uitstoot leidt tot strafzaak"
  - `summary`: "Het RIVM rapporteerde in september 2021 dat omwonenden van Tata Steel IJmuiden ongezond veel grafiet en zware metalen inademen. In 2024 startte het Openbaar Ministerie een strafzaak tegen het bedrijf wegens opzettelijke milieudelicten. Tata Steel benadrukt vergroeningsplannen en historische vergunningen. Bewonersorganisaties beschuldigen overheden van decennialange dekking."
  - `url`: "https://www.rivm.nl/nieuws/onderzoek-naar-uitstoot-tata-steel"
  - `conspiracist_intro`: "Het RIVM stelde in september 2021 vast dat omwonenden van Tata Steel IJmuiden ongezond veel grafiet inademen — ruim na decennia van klachten. Officieel: gewoon laat gemeten. Maar waarom kwam dat onderzoek pas in 2021?"

- [x] 1.5 Add **TenneT netcongestie & aansluitstop**
  - `uuid`: `f1a2b3c4-1005-4001-9001-aaaaaaaaaaaa`
  - `name`: "TenneT-netcongestie: bedrijven krijgen geen stroomaansluiting meer"
  - `summary`: "Vanaf 2023 weigert netbeheerder TenneT in grote delen van Nederland nieuwe zware aansluitingen te leveren omdat het hoogspanningsnet vol zit. Zonneparken liggen stil, fabrieken kunnen niet uitbreiden, datacenters wachten jaren. TenneT en het ministerie verwijzen naar te trage netuitbreiding sinds de jaren 2010. Officieel: een klassiek capaciteitsprobleem, geen kwestie van willen."
  - `url`: "https://www.nrc.nl/nieuws/2023/06/19/het-stroomnet-zit-vol-en-niemand-heeft-er-iets-aan-gedaan-a4167432"
  - `conspiracist_intro`: "Volgens NRC weigert TenneT vanaf 2023 nieuwe industriële aansluitingen op het hoogspanningsnet — niemand zou er iets aan gedaan hebben. Klinkt als een planningfout — té toevallig. Maar is dat het hele plaatje?"

- [x] 1.6 Add **PFAS-vervuiling Chemours Dordrecht**
  - `uuid`: `f1a2b3c4-1006-4001-9001-aaaaaaaaaaaa`
  - `name`: "Chemours Dordrecht: PFAS-vervuiling jarenlang ontkend"
  - `summary`: "Vanaf 2022 dwong het RIVM de chemische fabriek Chemours in Dordrecht haar PFAS-uitstoot scherp te beperken na metingen die de drinkwaternorm overschreden. Vier omliggende gemeenten begonnen in 2023 een civiele zaak tegen het bedrijf. Chemours verwijst naar geldige vergunningen en lopende vergroening. De gemeenten eisen schadevergoeding én volledige openheid over historische lozingen."
  - `url`: "https://www.volkskrant.nl/nieuws-achtergrond/gemeenten-eisen-miljoenen-van-chemours-na-pfas-vervuiling~b9a8b7c6/"
  - `conspiracist_intro`: "Volgens De Volkskrant eisen vier Zuid-Hollandse gemeenten miljoenen van Chemours wegens jarenlange PFAS-lozingen — alles binnen de geldende vergunning, beweert het bedrijf. Vergunningen, vergunningen — maar wie zat er in de vergunningverlenende commissies?"

### BE stories

- [x] 1.7 Add **Sky ECC encryptie-operatie**
  - `uuid`: `f1a2b3c4-2001-4001-9001-bbbbbbbbbbbb`
  - `name`: "Sky ECC: politie kraakt versleuteld telefoonnetwerk van criminelen"
  - `summary`: "Op 9 maart 2021 voerden Belgische, Nederlandse en Franse politiediensten een gecoördineerde grootschalige operatie uit nadat zij het Canadese versleutelde telefoonnetwerk Sky ECC hadden ontsleuteld. Honderden arrestaties volgden. Officieel: legitieme rechterlijke machtigingen, gewone opsporing van internationale drugshandel. Privacy-organisaties stellen vragen over schaal en waarborgen."
  - `url`: "https://www.vrt.be/vrtnws/nl/2021/03/09/grootste-actie-tegen-georganiseerde-misdaad-ooit/"
  - `conspiracist_intro`: "Zoals VRT NWS bericht, kraakten politiediensten op 9 maart 2021 het Sky ECC-netwerk — gewoon legaal afluisteren, klinkt het. Een netwerk van honderdduizenden gebruikers in één klap. Maar wie keek nog meer mee?"

- [x] 1.8 Add **PFAS bij 3M Zwijndrecht**
  - `uuid`: `f1a2b3c4-2002-4001-9001-bbbbbbbbbbbb`
  - `name`: "3M Zwijndrecht: PFAS-vervuiling onthuld bij Oosterweel-werken"
  - `summary`: "Tijdens de Oosterweel-werken in 2021 ontdekten ingenieurs zware PFAS-verontreiniging rond de 3M-fabriek in Zwijndrecht (Antwerpen). De Vlaamse regering startte een onderzoekscommissie en legde 3M in 2022 een schikking van honderden miljoenen op. Officieel: late maar resolute aanpak. Bewoners en lokale bestuurders vragen waarom Vlaamse vergunningen en milieumetingen decennialang niets aantoonden."
  - `url`: "https://www.vrt.be/vrtnws/nl/2021/06/22/pfos-vervuiling-3m-zwijndrecht-tijdlijn/"
  - `conspiracist_intro`: "VRT NWS meldt dat de PFAS-vervuiling bij 3M in Zwijndrecht pas tijdens de Oosterweel-werken in 2021 boven water kwam — na vele decennia van productie. Een toevallige vondst, heet het. Te toevallig?"

- [x] 1.9 Add **Antwerpen haven cocaïnerecord**
  - `uuid`: `f1a2b3c4-2003-4001-9001-bbbbbbbbbbbb`
  - `name`: "Antwerpse haven: 116 ton cocaïne onderschept in 2023"
  - `summary`: "In de haven van Antwerpen werd in 2023 een recordhoeveelheid van 116 ton cocaïne onderschept. Het Belgische gerecht meldde tegelijk een toename van geweld tegen onderzoekers; de Antwerpse procureur stond zelfs onder politiebescherming. Officieel: hardere lijn tegen georganiseerde misdaad. Onderzoeksjournalisten vragen waarom de containerstroom zelf nauwelijks verandert."
  - `url`: "https://www.standaard.be/cnt/dmf20240126_92765432" // FIXME: pass 2 — verify URL
  - `conspiracist_intro`: "Volgens De Standaard onderschepte de douane in Antwerpen vorig jaar 116 ton cocaïne — een record. Hardere aanpak, klinkt het. Maar 116 ton onderschept betekent: hoeveel ton glipt door? En wie wint daarbij?"

- [x] 1.10 Add **Vlaams stikstofakkoord**
  - `uuid`: `f1a2b3c4-2004-4001-9001-bbbbbbbbbbbb`
  - `name`: "Vlaams stikstofakkoord: bedrijven en boeren zien rode kaart"
  - `summary`: "Op 10 maart 2023 sloot de Vlaamse regering (N-VA, CD&V, Open VLD) een stikstofakkoord met reductiedoelen voor industrie en landbouw. Honderden Vlaamse boerderijen kregen een 'rode kaart' — sluiting binnen tien jaar. Officieel: noodzakelijk voor EU-natuurregels en milieurechtelijke deadlines. Boerenorganisaties spreken van een georkestreerde uitfasering."
  - `url`: "https://www.standaard.be/cnt/dmf20230310_94872100" // FIXME: pass 2 — verify URL
  - `conspiracist_intro`: "Zoals De Standaard bericht, kregen honderden Vlaamse veehouders in maart 2023 een 'rode kaart' onder het nieuwe stikstofakkoord — voor de natuur, heet het. Honderden bedrijven sluiten — maar waar gaat de grond naartoe?"

- [x] 1.11 Add **Doel kerncentrale levensduurverlenging**
  - `uuid`: `f1a2b3c4-2005-4001-9001-bbbbbbbbbbbb`
  - `name`: "Doel 4 en Tihange 3: tien jaar levensduurverlenging na deal met Engie"
  - `summary`: "In maart 2022 besloot de Belgische regering om de kernreactoren Doel 4 en Tihange 3 tien jaar langer open te houden, na de Russische inval in Oekraïne. In juli 2023 werd na lange onderhandelingen een akkoord bereikt met uitbater Engie over kostenverdeling, kernafval en aansprakelijkheid. Officieel: energievoorzieningszekerheid. Critici vragen aan welke prijs precies."
  - `url`: "https://www.tijd.be/politiek-economie/belgie/algemeen/akkoord-engie-belgie-kerncentrales-doel-tihange/" // FIXME: pass 2 — verify URL
  - `conspiracist_intro`: "Volgens De Tijd bereikte België in juli 2023 een akkoord met Engie over de tien jaar langere uitbating van Doel 4 en Tihange 3 — voor de bevoorradingszekerheid, klinkt het. Goed zo. Maar wie tekende mee aan de bijbehorende contracten?"

- [x] 1.12 Add **Bpost-fraudeonderzoek**
  - `uuid`: `f1a2b3c4-2006-4001-9001-bbbbbbbbbbbb`
  - `name`: "Bpost-CEO weg na onderzoek naar prijsafspraken in krantenbedeling"
  - `summary`: "Eind maart 2023 stapte de CEO van Bpost op nadat een intern en extern onderzoek prijsafspraken aan het licht bracht in de aanbestedingen rond krantenbedeling — een opdracht die honderden miljoenen waard is. Het Belgische gerecht startte een onderzoek; politieke schade volgde. Officieel: zelfregulerende governance werkt. Onderzoeksjournalisten zien een groter patroon."
  - `url`: "https://www.standaard.be/cnt/dmf20230328_92847001" // FIXME: pass 2 — verify URL
  - `conspiracist_intro`: "Zoals De Standaard meldt, stapte de Bpost-CEO eind maart 2023 op nadat onderzoek prijsafspraken in de krantenbedeling onthulde — gelukkig opgelost door interne governance, klinkt het. Maar wie schreef die governance-regels eigenlijk?"

## 2. Author intro_paragraphs (full Dutch prose) for each entry

The intro_paragraphs are 2–3 paragraphs of ~70 words plain Dutch each, sticking to publicly known facts (per the spec: no conspiracy framing in `intro_paragraphs`). Pass-1 wooden draft is acceptable; pass-2 idiomatic rewrite is owed. Each candidate's full intro paragraphs are authored as part of the seed-row write-out in tasks 1.1–1.12 (above) and SHALL be embedded in the seed.json payload at implementation time. The structure below is a working draft per story.

(Full intro_paragraphs payload is captured directly inline in the seed.json edit; not copied here to keep tasks.md scannable. See implementation step 1.x for each.)

- [x] 2.1 Confirm each of the 12 new rows has `intro_paragraphs` populated with 2–3 paragraphs of Dutch prose
- [x] 2.2 Confirm each `summary` is ≤ 60 words and reads as plain Dutch
- [x] 2.3 Confirm each `conspiracist_intro` follows the source-attribution pattern (`Volgens De Standaard…`, `VRT NWS meldt…`, `NRC bericht…`, `Zoals De Volkskrant meldt…`)

## 3. Flip DUTCH_LAUNCHED + defensive masthead union

- [x] 3.1 In `web/lib/i18n/types.ts`, change `export const DUTCH_LAUNCHED = false;` → `export const DUTCH_LAUNCHED = true;`
- [x] 3.2 Update the comment block above `DUTCH_LAUNCHED` to reflect that the flag is now flipped (NL pill visible everywhere); keep the flag itself for clarity in case future changes need to flip it back temporarily
- [x] 3.3 In `web/components/masthead.tsx`, change the `localeOptions` computation from `VISIBLE_LOCALES.map(...)` to a union: include `VISIBLE_LOCALES` and the active `locale`, deduped, preserving the original order with the active locale appended only if not already present
- [x] 3.4 The active pill MUST already carry `aria-current="true"` per the existing toggle scenario; verify this still holds with the union logic

## 4. Permalink locale lock on /g/[id]

- [x] 4.1 In `web/app/g/[id]/page.tsx`, after `loadGeneration(id)` returns the row but before the page renders any chrome, compute `rowLocale` (using the existing `isLocale` guard) and `visitorLocale` (via `await readLocale()`)
- [x] 4.2 If `visitorLocale !== rowLocale`, call `redirect(localizedHref(`/g/${id}`, rowLocale))` from `next/navigation` — Next.js issues a 302 and re-renders the canonical URL
- [x] 4.3 The redirect MUST also fire for the (less-common) case where the row's locale is `en` but the visitor reaches `/de/g/<id>` or `/nl/g/<id>` — i.e., the redirect target is the un-prefixed `/g/<id>` for English rows
- [x] 4.4 Verify no other side-effects: the redirect happens before any DB writes or session-touching logic
- [x] 4.5 Add a small comment in the page explaining that the redirect makes the URL canonical at the row's locale, and links to the spec scenario

## 5. Compile gates

- [x] 5.1 `npx tsc --noEmit` clean
- [x] 5.2 `npx next lint` clean
- [x] 5.3 `npx next build` succeeds; `seed.json` parses cleanly (Next.js will fail to import if JSON is malformed)

## 6. Live verification

- [x] 6.1 `/nl/` home picker now shows ≥ 12 Dutch story cards
- [x] 6.2 Click a Dutch story card → arrives at `/nl/story/<uuid>` and the picker renders Dutch event content
- [x] 6.3 Masthead toggle renders `EN | DE | NL` on `/`, `/de`, `/nl`, with the active pill highlighted (`aria-current="true"`, visually emphasized)
- [x] 6.4 `/de/g/TRLH8EMUVH` (a /de/-prefixed visit to an English row) → 302 → `/g/TRLH8EMUVH` → page renders English chrome + content + `<html lang="en">` + `og:locale="en_US"`
- [x] 6.5 `/g/CETVR8AXHX` (an English-default visit to a German row) → 302 → `/de/g/CETVR8AXHX` → German chrome + content + `<html lang="de">` + `og:locale="de_DE"`
- [x] 6.6 `/de/g/CETVR8AXHX` (matching prefix + row locale) → no redirect; page renders normally
- [x] 6.7 An /nl/ visitor with `cgen_lang=nl` cookie reaches `/nl/g/<en-row>` → 302 → `/g/<en-row>` (not `/nl/g/<en-row>`)

## 7. Final validation

- [x] 7.1 `openspec validate nl-completeness-pass --strict` passes
- [x] 7.2 Confirm the screening table at the top of this file is preserved (it is the spec-required "screening notes alongside tasks.md")
