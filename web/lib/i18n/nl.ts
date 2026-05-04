// Dutch dictionary — PASS 1 (literal draft).
// Spec: openspec/changes/multilingual-dutch/specs/dutch-content/spec.md
//
// Status: pass-1 literal draft. ALLOWED TO BE WOODEN per the design doc.
// The masthead toggle does NOT yet expose `NL` to visitors — see
// `DUTCH_LAUNCHED` / `VISIBLE_LOCALES` in `web/lib/i18n/types.ts`. The
// `/nl/` URL still renders for review and development.
//
// Required before launch:
//   - Pass 2 (idiomatic rewrite) — owner: Maarten (or named Dutch-native contributor).
//     Workshop the four-move taxonomy, replace cognate-cluster anglicisms,
//     strip every `// FIXME: pass 2` marker after addressing it.
//   - Pass 3 (native-ear) — at least one NL native AND one BE native review
//     the dictionary and a sample of fresh generations end-to-end without
//     seeing the English source. Strings flagged by either side as
//     foreign-sounding get rewritten to a neutral alternative.
//
// Voice target: neutral Standaardnederlands that reads naturally to both
// NL and BE audiences. No Belgicisms, no Hollandisms unique to one side.
// Default second-person to `je`/`jij` (avoid `ge`/`u` which flag region).
//
// Imprint and privacy strings are NOT translated here — those pages need
// legally-original NL/BE content authored against current jurisdictional
// law, not a pass-1 draft from the model.

import type { Dictionary } from "./en";

export const nl: Dictionary = {
  masthead: {
    nav_recipe: "Het recept",
    nav_teach: "Voor docenten",
    nav_about: "Over ons",
    nav_build: "Bouwen",
    open_nav: "Navigatie openen",
    locale_toggle_aria: "Taal wisselen",
  },
  footer: {
    link_recipe: "Het recept",
    link_teach: "Voor docenten",
    link_about: "Over ons & medewerkers",
    link_imprint: "Colofon",
    link_privacy: "Privacy",
  },
  home: {
    hero_h1_a: "Bouw een complottheorie",
    hero_h1_b: "vanaf nul",
    hero_h1_period: ".",
    hero_subheading:
      "De beste manier om een complottheorie te leren herkennen is er zelf een te maken.",
    hero_description:
      "Kies een echt nieuwsbericht. In de volgende stap kies je wie erachter zit en waarom. Daarna loop je door de vier stappen die echte complotdenkers gebruiken — met bij elke stap een ontmaskering ernaast.", // FIXME: pass 2 — "ontmaskering" or "ontkrachting" or "weerlegging"?
    four_moves_aria: "De vier stappen van het recept",
    move_label: "Stap",
    step_1_picker: "Stap 1 — Kies een echt nieuwsbericht",
    refresh: "↻ Vernieuwen",
    choose_this_story: "Kies dit verhaal →",
  },
  recipe: {
    eyebrow: "Het recept",
    h1: "Complottheorieën volgen vier stappen.",
    lede_a:
      "De stappen staan los van elkaar. Je kunt ze toepassen op elk nieuwsbericht, op echte samenzweringen of op verzonnen gebeurtenissen. Wie de stappen kan benoemen, herkent ze. Het recept wordt uitgebreid uitgelegd in",
    lede_link: "deze blogpost",
    lede_period: ".",
    aside_p:
      "Echte critici van echte instituties gebruiken deze stappen soms met substantie erachter — een journalist die een officiële doofpot bevraagt, een onderzoeker die zwakke tegenbewijzen verwerpt. Het vier-stappen-recept traint je oog voor de", // FIXME: pass 2 — "doofpot" reads NL; check BE alternative
    aside_form: "vorm",
    aside_p_2: "van complotdenken. Of de",
    aside_substance: "inhoud",
    aside_p_3: "van de bewering óók onjuist is, is een aparte, tragere vraag.",
    move_label: "Stap",
    tell_strong: "Het verklikkende patroon.", // FIXME: pass 2 — workshop this
  },
  recipe_long: {
    anomaly_short: "Maak van toeval bewijs voor een geheim plan.",
    anomaly_body:
      "Zoek raadselachtige details of tegenstrijdigheden in het officiële verhaal. Beweer dat ze het officiële verhaal weerleggen. Je „stelt alleen maar vragen“ — en omdat geen enkele verklaring van een gebeurtenis ooit volledig is, gaat dat makkelijk.",
    anomaly_tell:
      "Echte onderzoekers controleren de basiskans: hoe vaak komt zo'n toeval gewoon voor? Complotdenkers verzamelen anomalieën en slaan die vraag over.", // FIXME: pass 2 — "anomalieën" cognate, consider "afwijkingen"
    connection_short:
      "Trek lijnen tussen onsamenhangende punten tot ze betekenisvol lijken.",
    connection_body:
      "Verzin „bewijs“ dat je schuldigen belast. Construeer verdachte verbanden tussen het officiële verhaal en je schuldigen — hoe dichter het netwerk lijkt, hoe beter.",
    connection_tell:
      "Via zes schakels is iedereen op de wereld met iedereen verbonden. Een keten van zes als bewijs behandelen is een categoriefout: de verbinding bestaat in elke richting, niet alleen in de uitgelichte.",
    dismiss_short:
      "Als een feit tegenspreekt, maak het feit deel van de doofpot.",
    dismiss_body:
      "Beweer dat elk ontlastend bewijs ontbreekt omdat de samenzweerders hun sporen hebben uitgewist — en elk schijnbaar tegenbewijs erin gelegd is om waarheidszoekers op het verkeerde been te zetten.",
    dismiss_tell:
      "Wanneer tegenbewijzen tot extra bewijs voor de samenzwering worden, is de theorie onfalsifieerbaar geworden. Elke weerlegging vergroot alleen de kring van samenzweerders.",
    discredit_short: "Schuif mensen opzij die zwaktes in je theorie tonen.",
    discredit_body:
      "Critici kun je op verschillende manieren afdoen: als goedgelovige meelopers, als gemanipuleerde werktuigen of als betaalde handlangers van de samenzweerders zelf.",
    discredit_tell:
      "Het verschuiven van de kritiek van de zaak naar de persoon stuurt de vraag van „klopt dit?“ naar „wie vraagt dat eigenlijk?“. Echte onderzoekers verwelkomen kritiek; complotdenkers behandelen kritiek als verder bewijs voor de samenzwering.",
  },
  about: {
    eyebrow: "Over ons",
    h1: "De beste manier om een complottheorie te leren herkennen is er zelf een te maken.",
    p1:
      "Dat is het idee achter dit instrument. Je kiest een echt voorval, een schuldige en een motief — en bouwt dan stap voor stap een verzonnen complottheorie. Elke stap komt overeen met een van de vier stappen waarop echte complotdenkers leunen, met daarnaast een ontmaskering.", // FIXME: pass 2
    p2:
      "Wie het één keer heeft gedaan, kan het niet meer ontzien. Je merkt hoe makkelijk een geloofwaardig klinkende complottheorie te knutselen is — en dat je voor één gebeurtenis veel uiteenlopende theorieën kunt bouwen die elkaar tegenspreken. Mogelijke samenzweringen zijn onbeperkt in aantal; dat is mede de reden waarom er zo weinig echt zijn.", // FIXME: pass 2 — "ontzien" might read odd
    p3_a: "De vier stappen worden",
    p3_recipe_link: "op de receptpagina uitgelegd",
    p3_b: ". Wie lesgeeft, vindt bovendien een",
    p3_teach_link: "lesplan",
    p3_c: "om in de klas te gebruiken.",
    feedback_h: "Feedback",
    feedback_p_a:
      "We horen graag wat werkt en wat niet — bug reports, verhalen uit de klas, ideeën voor nieuwe stappen. Schrijf ons op", // FIXME: pass 2 — "bug reports" anglicism
    feedback_p_period: ".",
    credits_h: "Medewerkers",
    credits_p_a: "De Conspiracy Generator is gebouwd door",
    credits_p_and: "en",
    credits_p_inspired: ", geïnspireerd door",
    credits_blog_link: "een blogpost van Maarten",
    credits_p_thanks:
      ". Met dank aan Natasha Newbold, Mohammed Darras en Peter Keroti voor hun werk aan een eerdere versie, en aan de Etienne Vermeersch-leerstoel Kritisch Denken aan de Universiteit Gent voor de financiering.",
  },
  teach: {
    title_meta: "Voor docenten — een les van 15 minuten",
    eyebrow: "Voor docenten",
    h1: "Een les van 15 minuten in het herkennen van complottheorieën.",
    intro:
      "De Conspiracy Generator is gemaakt voor in de klas. De oefening is kort, praktisch, en past in het aandachtsvenster dat leerlingen aan één nieuwskop schenken. Deze pagina is het lesplan — lees het op het scherm, of druk het via de knop hierboven af als pdf.",
    why_h: "Waarom dit werkt",
    why_p1:
      "De krachtigste verdediging tegen complotdenken is er zelf een complottheorie van maken. Wanneer leerlingen de vier stappen één keer zelf hebben toegepast, herkennen ze die de volgende keer. Een college over waarom complottheorieën onjuist zijn bereikt er weinig; de ervaring er één te bouwen bereikt er bijna allemaal.",
    why_p2_a:
      "De vier stappen — afwijkingen najagen, verbanden verzinnen, tegenbewijzen wegredeneren, critici diskwalificeren — staan op",
    why_p2_link: "de receptpagina",
    why_p2_b: "met voorbeelden en het verklikkende patroon van elke stap. Lees deze één keer voor de les.",
    plan_h: "Het plan voor 15 minuten",
    step1_minutes: "0–3",
    step1_title: "Opzetten",
    step1_body:
      "Open de Conspiracy Generator op de beamer. Toon de leerlingen de startpagina en leg kort uit wat ze gaan zien. Lees de receptpagina nog niet hardop voor — de stappen leren ze door ze te zien gebeuren.",
    step2_minutes: "3–6",
    step2_title: "Kies samen de ingrediënten",
    step2_body:
      "Laat de klas stemmen over een gebeurtenis, een schuldige en een motief. Kies iets dat de klas breed kent — een recent lokaal verhaal, een wetenschappelijke ontdekking, een sportmoment. De drie ingrediënten passen met opzet niet bij elkaar; juist die wrijving is deel van de pointe.", // FIXME: pass 2 — "pointe" anglicism
    step3_minutes: "6–13",
    step3_title: "Door de vier stappen lopen",
    step3_body:
      "Het instrument leidt je per scherm door één stap. Voor elke stap: lees de korte inleiding, klik een idee aan, lees de gegenereerde alinea en daarna de ontmaskering. Pauzeer na elke stap en stel de bijbehorende discussievraag hieronder (één minuut, niet meer).",
    step4_minutes: "13–15",
    step4_title: "De slotvraag",
    step4_body:
      "Zodra de samengestelde theorie er staat, vraag: op welke van de vier stappen zou jij het eerst zijn ingetrapt? De meeste leerlingen noemen dezelfde stap. Op die stap moet je in het dagelijks leven letten.",
    minutes_suffix: "min",
    prompts_h: "Discussievragen",
    prompts_intro:
      "Kies er één of twee — ze passen tussen de stappen of na de samengestelde theorie.",
    prompt_1: "Welke van de vier stappen werkte het overtuigendst? Waarom?",
    prompt_2:
      "Welk echt bewijs zou je mening over de zojuist gebouwde theorie veranderen?",
    prompt_3:
      "Wat is het verschil tussen Stap 02 (Verbanden verzinnen) en hoe een echte journalist of historicus bewijs verbindt?",
    prompt_4:
      "Waar heb je Stap 04 (Critici diskwalificeren) in echte discussies gezien?",
    prompt_5:
      "Kies een nieuwsgebeurtenis die je goed kent. Probeer de vier stappen er zelf op toe te passen voordat je de gegenereerde theorie leest. Vergelijk daarna.",
    prompt_6:
      "Wat zijn de legitieme kritieken op publieke instituties? Hoe verschillen die van de verwijten van een complottheorie?",
    outcomes_h: "Wat leerlingen meenemen",
    outcome_1: "De vier stappen, met naam.",
    outcome_2:
      "Het verklikkende patroon van elke stap — waarom het werkt op een vluchtige lezer.", // FIXME: pass 2
    outcome_3:
      "Een intuïtie dat je voor één gebeurtenis veel uiteenlopende complottheorieën kunt bouwen — meestal volgens hetzelfde recept.",
    outcome_4:
      "Een scherper instinct om „klopt dit?“ te vragen in plaats van „wie is hiertegen?“.",
    teach_footer_a:
      "In de klas geprobeerd? We horen graag hoe het ging —",
    teach_footer_link: "stuur ons een bericht",
    teach_footer_period: ".",
    print_button: "Opslaan als pdf",
    pdf_de_warning:
      "Let op: het printbare lesplan is op dit moment alleen in het Engels beschikbaar.",
  },
  print: {
    button: "Opslaan als pdf",
  },
  story: {
    eyebrow: "Stap 2 — Het officiële verhaal",
    pick_different: "← Kies een ander verhaal",
    source_label: "Bron:",
    pick_conspirators_meta: "Kies nu de samenzweerders",
    pick_conspirators_explainer:
      "Elke complottheorie hangt één schuldige en één motief aan dezelfde gebeurtenis. Uit dezelfde gebeurtenis kun je willekeurig veel theorieën bouwen — andere schuldigen, andere motieven. Daaraan herken je een complottheorie: dezelfde gebeurtenis kun je op willekeurig veel manieren „verklaren“.",
    culprit: "Schuldige",
    motive: "Motief",
    refresh_choices: "↻ Keuzes vernieuwen",
    walkthrough_caption:
      "Je loopt door de vier stappen op aparte schermen — met een ontmaskering naast elke stap.", // FIXME: pass 2
    cta_start: "Beginnen met bouwen",
    cta_starting: "Wordt voorbereid…",
    cta_starting_dots: "Ideeën worden verzameld",
    cta_yolo: "Sla de uitleg over — toon me de theorie →", // FIXME: pass 2 — yolo branding decision
    cta_yolo_starting: "Volledig yolo…", // FIXME: pass 2
    cta_yolo_starting_dots:
      "Ideeën kiezen, alle vier stappen schrijven, theorie aaneenvoegen",
    err_too_long: "Dit duurde te lang — probeer het opnieuw.",
    err_couldnt_start: "Bouwen kon niet worden gestart.",
    err_yolo_failed:
      "Yolo-run mislukt — probeer opnieuw, of gebruik de stap-voor-stap hierboven.", // FIXME: pass 2
  },
  wizard: {
    pick_idea: "Kies een idee om toe te passen",
    cooking: "wordt gekookt…",
    conspiracist_writes: "De complotdenker schrijft",
    debunk_label: "Ontmaskering · waarom dit werkt", // FIXME: pass 2
    next_move: "Volgende stap →",
    see_full_theory: "Hele theorie bekijken →",
    or_regenerate: "Of klik hierboven een ander idee om opnieuw te genereren.",
    writing: "De complot-alinea en de ontmaskering worden geschreven…",
    writing_finale:
      "De laatste stap wordt geschreven en de hele theorie wordt aaneengevoegd…",
    writing_too_long:
      "Dit duurde te lang — probeer opnieuw, of kies een ander idee.",
    section_failed: "Generatie mislukt.",
    back: "← Terug",
    step_n_of: "Stap {{n}} van {{total}}",
    skip_to_result: "Direct naar het resultaat →",
    skip_to_result_loading_h: "De rest wordt gevuld…", // FIXME: pass 2
    skip_to_result_loading_dots:
      "Ideeën kiezen, ontbrekende stappen schrijven, theorie aaneenvoegen", // FIXME: pass 2
    skip_to_result_failed: "Kon de rest niet aanvullen — probeer het opnieuw.", // FIXME: pass 2
    progress_done: "Klaar",
    move_label: "Stap", // FIXME: pass 2
    done_eyebrow: "Klaar",
    done_h1: "Je complottheorie is gebouwd.",
    done_p_a: "Je hebt een verzonnen complottheorie in vier stappen die",
    done_p_orchestrating: "ervan beschuldigt",
    done_p_in_service_of: "in dienst van",
    done_p_period:
      " in scène te hebben gezet. Lees hierna de samengestelde theorie met alle vier ontmaskeringen ernaast.",
    done_p_missing:
      "Sommige stappen ontbreken nog. Je kunt teruggaan om ze in te vullen — of meteen naar het resultaat springen.",
    done_cta_read: "Hele theorie lezen →",
  },
  wizard_blurb: {
    anomaly_explainer:
      "Pak iets gewoons in de gebeurtenis en presenteer het als verdacht. De truc: behandel toeval als signaal — laat de lezer voelen dat er iets niet klopt.",
    anomaly_tell:
      "Echte onderzoekers controleren de basiskans. Complotdenkers verzamelen afwijkingen en slaan die vraag over.",
    connection_explainer:
      "Verbind de schuldige via een keten zwak verwante feiten met de gebeurtenis. De keten zelf wordt het bewijs — niet of elke schakel betekenisvol is.",
    connection_tell:
      "Via zes schakels is iedereen met iedereen verbonden. Een keten van verbindingen is geen bewijs van opzet.",
    dismiss_explainer:
      "Neem een voor de hand liggende, gangbare weerlegging en herkader die als verder bewijs voor de doofpot. De theorie wordt zo immuun voor weerlegging.",
    dismiss_tell:
      "Wanneer tegenbewijzen tot extra bewijs voor de samenzwering worden, is de theorie onfalsifieerbaar. Dat is een verklikker, geen kracht.", // FIXME: pass 2 — "verklikker" workshop
    discredit_explainer:
      "Stuur de vraag van „klopt dit?“ naar „wie vraagt dat eigenlijk?“. Wie de theorie tegenspreekt, is goedgelovig, gemanipuleerd of betaald.",
    discredit_tell:
      "Echte onderzoekers verwelkomen kritiek. Complotdenkers behandelen kritiek als de samenzwering.",
  },
  generation: {
    eyebrow_imported: "Geïmporteerd uit eerdere versie",
    eyebrow_fake: "Een verzonnen complottheorie",
    h1_how: "Hoe",
    h1_orchestrated: "in scène heeft gezet —",
    h1_in_service_of: ", in dienst van",
    h1_period: ".",
    original_story: "(oorspronkelijk verhaal)",
    legacy_note:
      "Geïmporteerd uit eerdere versie · stap-annotatie niet beschikbaar",
    rate_question: "Werd het recept overtuigend toegepast?",
    share_meta: "Delen — verwijst terug, geen afbeeldingen van de theorie",
    build_another: "↻ Een nieuwe bouwen",
    move_label: "Stap",
    idea_label: "Idee:",
    debunk_label: "Ontmaskering", // FIXME: pass 2
    narrative_eyebrow: "De theorie",
    breakdown_eyebrow: "Hoe de truc is opgebouwd",
    narrative_stamp: "VERZONNEN THEORIE · GEBOUWD VOLGENS EEN RECEPT",
    moves_legend_prefix: "Gebouwd uit:", // FIXME: unused, remove in next change
    see_breakdown_cta: "↓ Zie hoe de truc is opgebouwd",
    breakdown_explainer:
      "Elke alinea hierboven gebruikte een van vier stappen. Hier staat elke stap apart, met de ontmaskering.",
  },
  share: {
    teaser:
      "Een verzonnen complottheorie gebouwd volgens het vier-stappen-recept op",
    email_subject:
      "Een verzonnen complottheorie, met het recept erbij",
    email_body_a:
      "Ik heb een verzonnen complottheorie over „",
    email_body_b:
      "“ gemaakt volgens het vier-stappen-recept. De receptpagina legt uit hoe hij is opgebouwd en waarom elke stap werkt:",
    copy_link: "Link kopiëren",
    copied: "Gekopieerd",
    via_x: "X",
    via_bluesky: "Bluesky",
    via_email: "E-mail",
    via_system: "Via systeem delen",
    site_title: "Conspiracy Generator",
  },
  errors: {
    not_found_h1: "Niet gevonden.",
    not_found_body:
      "Deze pagina bestaat niet — of de theorie is verwijderd.",
    not_found_back_home: "← Terug naar de startpagina",
    client_error_h1: "Er ging iets mis.",
    client_error_body:
      "Een onverwachte fout heeft deze pagina onderbroken. Je kunt het opnieuw proberen, of teruggaan naar de startpagina.",
    client_error_try_again: "↻ Opnieuw proberen",
  },
  meta: {
    home_title_default: "Conspiracy Generator — het recept, uitgeschreven",
    home_title_template: "%s · Conspiracy Generator",
    home_description:
      "Een leerinstrument dat voor je ogen een verzonnen complottheorie bouwt, elk van de vier stappen bij naam noemt en er een ontmaskering naast laat meelopen. Kijk hoe het recept werkt, zodat je het in het wild herkent.",
    og_title: "Conspiracy Generator — het recept, uitgeschreven",
    og_description:
      "Complottheorieën volgen vier stappen. Wie ze kan benoemen, herkent ze. Bouw er zelf één om het recept te zien.",
    twitter_description:
      "Complottheorieën volgen vier stappen. Bouw er zelf één om het recept te zien.",
    recipe_title: "Het recept",
    about_title: "Over ons",
    teach_title: "Voor docenten — een les van 15 minuten",
    visitors_title: "Visitors",
    stats_title: "Stats",
    og_description_generation:
      "Gebouwd met het vier-stappen-recept. Kies een gebeurtenis, een schuldige, een motief — en zie de theorie zichzelf opbouwen.", // FIXME: pass 2
  },
  legal: {
    translation_pending_h: "Vertaling in voorbereiding", // FIXME: pass 2
    translation_pending_body:
      "Deze pagina bevat juridisch relevante inhoud die nog niet in Nederlandse originele versie beschikbaar is. Hieronder volgt de Engelse brontekst.", // FIXME: pass 2
  },
};
