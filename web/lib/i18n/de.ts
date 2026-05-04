// German dictionary — PASS 1 (literal draft).
// Spec: openspec/changes/multilingual-german/specs/internationalization/spec.md
//
// Status: pass-1 literal draft. ALLOWED TO BE WOODEN per the design doc.
// Pass 2 (Marco, idiomatic rewrite) and pass 3 (native-ear) MUST happen
// before this dictionary is considered shippable. Workshop the four-move
// taxonomy + replace cognate-cluster anglicisms during pass 2.
//
// Imprint and privacy strings are NOT translated here — those pages need
// legally-original German content authored against current DACH law, not a
// pass-1 draft from the model. They live in a separate Marco-authored file
// (see web/app/imprint/page.de.tsx — TODO when imprint is migrated).

import type { Dictionary } from "./en";

export const de: Dictionary = {
  masthead: {
    nav_recipe: "Die vier Schritte",
    nav_teach: "Für Lehrkräfte",
    nav_about: "Über uns",
    nav_build: "Bauen",
    open_nav: "Navigation öffnen",
    locale_toggle_aria: "Sprache wechseln",
  },
  footer: {
    link_recipe: "Die vier Schritte",
    link_teach: "Für Lehrkräfte",
    link_about: "Über uns & Mitwirkende",
    link_imprint: "Impressum",
    link_privacy: "Datenschutz",
  },
  home: {
    hero_h1_a: "Bau Dir eine Verschwörungstheorie",
    hero_h1_b: "von Grund auf",
    hero_h1_period: ".",
    hero_subheading:
      "Eine Verschwörungstheorie erkennt man am besten, wenn man selbst eine baut.",
    hero_description:
      "Suche Dir ein echtes Ereignis aus. Im nächsten Schritt wählst Du, wer dahintersteckt und warum. Dann gehst Du durch die vier Schritte, die echte Verschwörungstheoretiker:innen nutzen — mit einer Auflösung neben jedem Schritt.",
    four_moves_aria: "Die vier Schritte",
    move_label: "Schritt",
    step_1_picker: "Schritt 1 — Suche Dir ein echtes Ereignis aus",
    refresh: "↻ Neu mischen",
    choose_this_story: "Diese Geschichte wählen →",
  },
  recipe: {
    eyebrow: "Die vier Schritte",
    h1: "Verschwörungstheorien folgen vier Schritten.",
    lede_a:
      "Die Schritte sind voneinander unabhängig. Man kann sie auf jedes Ereignis anwenden — auf echte Verschwörungen ebenso wie auf ausgedachte. Wer die Schritte benennen kann, erkennt sie wieder. Ausführlich beschrieben sind sie in",
    lede_link: "diesem Blogpost",
    lede_period: ".",
    aside_p:
      "Echte Kritiker:innen echter Institutionen nutzen diese Schritte mitunter mit Substanz dahinter — eine Journalistin, die eine offizielle Vertuschung in Frage stellt, oder ein Forscher, der schwache Gegenbeweise zurückweist. Die vier Schritte schulen das Auge für die",
    aside_form: "Form",
    aside_p_2: "des verschwörerischen Argumentierens. Ob die",
    aside_substance: "Substanz",
    aside_p_3:
      "der Behauptung ebenfalls falsch ist, ist eine eigene, langsamere Frage.",
    move_label: "Schritt",
    tell_strong: "Das verräterische Muster.",
  },
  recipe_long: {
    anomaly_short: "Aus Zufall wird Beweis für einen geheimen Plan.",
    anomaly_body:
      "Suche rätselhafte Details oder Widersprüche in der offiziellen Erzählung. Behaupte, sie würden die offizielle Version widerlegen. Du „stellst nur Fragen“ — und weil keine Erklärung eines Ereignisses jemals lückenlos ist, geht das leicht.",
    anomaly_tell:
      "Echte Ermittler:innen prüfen die Ausgangswahrscheinlichkeit: Wie oft tritt ein solcher Zufall einfach so auf? Verschwörungstheoretiker:innen sammeln Auffälligkeiten und überspringen diese Frage.",
    connection_short:
      "Ziehe Linien zwischen unzusammenhängenden Punkten, bis sie bedeutsam wirken.",
    connection_body:
      "Erfinde „Beweise“, die deine Schuldigen belasten. Konstruiere verdächtige Verbindungen zwischen der offiziellen Geschichte und deinen Schuldigen — je dichter das Netz wirkt, desto besser.",
    connection_tell:
      "Über sechs Ecken ist auf der Welt jeder mit jedem verbunden. Eine Sechs-Glieder-Kette als Beweis zu behandeln, ist ein Kategorienfehler: Die Verbindung existiert in jede Richtung, nicht nur in der hervorgehobenen.",
    dismiss_short:
      "Wenn ein Fakt widerspricht, mach den Fakt zum Teil der Vertuschung.",
    dismiss_body:
      "Behaupte, jeder entlastende Befund fehle, weil die Verschwörer:innen ihre Spuren verwischt hätten — und jeder scheinbare Gegenbeweis sei untergeschoben, um Wahrheitssucher:innen in die Irre zu führen.",
    dismiss_tell:
      "Wenn Gegenbeweise zu weiteren Beweisen für die Verschwörung umgedeutet werden, ist die Theorie unfalsifizierbar geworden. Jede Widerlegung erweitert nur den Kreis der Verschwörer:innen.",
    discredit_short: "Weise Menschen ab, die Schwächen deiner Theorie zeigen.",
    discredit_body:
      "Kritiker:innen kann man auf verschiedene Weisen abtun: als leichtgläubige Mitläufer:innen, als manipulierte Werkzeuge oder als bezahlte Handlanger:innen der Verschwörer:innen selbst.",
    discredit_tell:
      "Die Verschiebung der Kritik von der Sachebene auf die Person lenkt die Frage von „stimmt das?“ auf „wer fragt da?“ um. Echte Ermittler:innen begrüßen Kritik; Verschwörungstheoretiker:innen behandeln sie als weiteren Beweis der Verschwörung.",
  },
  about: {
    eyebrow: "Über uns",
    h1: "Eine Verschwörungstheorie erkennt man am besten, wenn man selbst eine baut.",
    p1:
      "Das ist die Idee hinter diesem Werkzeug. Du wählst ein echtes Ereignis, eine:n Schuldige:n und ein Motiv — und baust dann Schritt für Schritt eine erfundene Verschwörungstheorie. Jeder Schritt entspricht einem der vier Schritte, auf die echte Verschwörungstheoretiker:innen setzen; daneben läuft eine Auflösung mit.",
    p2:
      "Wer es einmal gemacht hat, sieht es nicht mehr weg. Du merkst, wie leicht eine plausibel klingende Verschwörungstheorie zu basteln ist — und dass sich für ein einzelnes Ereignis viele unterschiedliche Theorien bauen lassen, die einander widersprechen. Mögliche Verschwörungen gibt es unbegrenzt; deshalb sind so wenige davon real.",
    p3_a: "Die vier Schritte sind",
    p3_recipe_link: "auf der Schritte-Seite erklärt",
    p3_b: ". Wer unterrichtet, findet außerdem einen",
    p3_teach_link: "Unterrichtsentwurf",
    p3_c: ", den man im Klassenzimmer nutzen kann.",
    feedback_h: "Feedback",
    feedback_p_a:
      "Wir hören gern, was funktioniert und was nicht — Fehler, Geschichten aus dem Klassenzimmer, Ideen für neue Schritte. Schreib uns an",
    feedback_p_period: ".",
    credits_h: "Mitwirkende",
    credits_p_a: "Den Conspiracy Generator haben",
    credits_p_and: "und",
    credits_p_inspired: " gebaut, inspiriert von",
    credits_blog_link: "einem Blogpost von Maarten",
    credits_p_thanks:
      ". Mit Dank an Natasha Newbold, Mohammed Darras und Peter Keroti für ihre Arbeit an einer früheren Version sowie an den Etienne-Vermeersch-Lehrstuhl für kritisches Denken an der Universität Gent für die Förderung.",
  },
  teach: {
    title_meta: "Für Lehrkräfte — eine 15-Minuten-Stunde",
    eyebrow: "Für Lehrkräfte",
    h1: "Eine 15-Minuten-Stunde zum Erkennen von Verschwörungstheorien.",
    intro:
      "Der Conspiracy Generator ist für den Unterricht gemacht. Die Übung ist kurz, praktisch und passt in das Aufmerksamkeitsfenster, das Schüler:innen einer einzelnen Schlagzeile schenken. Diese Seite ist der Unterrichtsentwurf — am Bildschirm lesen, oder über die Schaltfläche oben als PDF drucken.",
    why_h: "Warum das funktioniert",
    why_p1:
      "Die wirksamste Abwehr gegen verschwörungstheoretisches Denken ist, selbst eine Verschwörungstheorie zu bauen. Wenn Schüler:innen die vier Schritte einmal selbst angewendet haben, erkennen sie sie beim nächsten Mal wieder. Ein Vortrag darüber, warum Verschwörungstheorien falsch sind, erreicht wenige; die Erfahrung, eine zu bauen, erreicht fast alle.",
    why_p2_a:
      "Die vier Schritte — Auffälligkeiten suchen, Verbindungen erfinden, Gegenbeweise abwehren, Kritiker:innen diskreditieren — sind auf",
    why_p2_link: "der Schritte-Seite",
    why_p2_b: "mit Beispielen und dem verräterischen Muster jedes Schritts beschrieben. Vor der Stunde einmal lesen.",
    plan_h: "Der 15-Minuten-Plan",
    step1_minutes: "0–3",
    step1_title: "Aufbauen",
    step1_body:
      "Den Conspiracy Generator auf dem Beamer öffnen. Den Schüler:innen die Startseite zeigen und kurz erklären, was sie gleich sehen. Die Schritte-Seite noch nicht laut vorlesen — die Schritte lernen sie, indem sie sie passieren sehen.",
    step2_minutes: "3–6",
    step2_title: "Gemeinsam die Zutaten wählen",
    step2_body:
      "Die Klasse stimmt über ein Ereignis, eine:n Schuldige:n und ein Motiv ab. Etwas wählen, das die Klasse breit kennt — eine aktuelle lokale Geschichte, eine wissenschaftliche Entdeckung, ein Sportmoment. Die drei Zutaten passen absichtlich nicht zueinander; genau dieser Bruch ist Teil der Pointe.",
    step3_minutes: "6–13",
    step3_title: "Durch die vier Schritte gehen",
    step3_body:
      "Das Werkzeug führt Schritt für Schritt durch je einen Schritt pro Bildschirm. Für jeden: kurze Einführung lesen, eine Idee anklicken, den erzeugten Absatz lesen, dann die Auflösung. Nach jedem Schritt halten und die Diskussionsfrage unten zu diesem Schritt stellen (eine Minute, nicht länger).",
    step4_minutes: "13–15",
    step4_title: "Die Schlussfrage",
    step4_body:
      "Sobald die zusammengebaute Theorie da ist, fragen: Auf welchen der vier Schritte wärst Du am ehesten reingefallen? Die meisten Schüler:innen nennen denselben Schritt. Auf den ist im Alltag zu achten.",
    minutes_suffix: "Min.",
    prompts_h: "Diskussionsfragen",
    prompts_intro:
      "Eine oder zwei auswählen — sie passen zwischen den Schritten oder nach der zusammengebauten Theorie.",
    prompt_1: "Welcher der vier Schritte wirkte am überzeugendsten? Warum?",
    prompt_2:
      "Welche echten Belege würden Deine Meinung zu der Theorie ändern, die Du gerade gebaut hast?",
    prompt_3:
      "Was unterscheidet Schritt 02 (Verbindungen erfinden) davon, wie eine echte Journalistin oder ein Historiker Belege verknüpft?",
    prompt_4:
      "Wo hast Du Schritt 04 (Kritiker:innen diskreditieren) in echten Auseinandersetzungen gesehen?",
    prompt_5:
      "Wähle ein Ereignis, das Du gut kennst. Probier die vier Schritte selbst aus, bevor Du die erzeugte Theorie liest. Vergleiche dann.",
    prompt_6:
      "Was sind die legitimen Kritiken an öffentlichen Institutionen? Wie unterscheiden sie sich von den Vorwürfen einer Verschwörungstheorie?",
    outcomes_h: "Was Schüler:innen mitnehmen",
    outcome_1: "Die vier Schritte, mit Namen.",
    outcome_2: "Das verräterische Muster jedes Schritts — warum es bei flüchtigen Leser:innen wirkt.",
    outcome_3:
      "Eine Intuition dafür, dass sich für ein Ereignis viele unterschiedliche Verschwörungstheorien bauen lassen — die meisten nach demselben Rezept.",
    outcome_4:
      "Einen schärferen Reflex, „stimmt das?“ statt „wer ist dagegen?“ zu fragen.",
    teach_footer_a:
      "Im Unterricht ausprobiert? Wir hören gern, wie es lief —",
    teach_footer_link: "schreib uns",
    teach_footer_period: ".",
    print_button: "Als PDF speichern",
    pdf_de_warning:
      "Hinweis: Der druckbare Stundenentwurf liegt zurzeit nur auf Englisch vor.",
  },
  print: {
    button: "Als PDF speichern",
  },
  story: {
    eyebrow: "Schritt 2 — Die offizielle Geschichte",
    pick_different: "← Eine andere Geschichte wählen",
    source_label: "Quelle:",
    pick_conspirators_meta: "Jetzt die Verschwörer:innen wählen",
    pick_conspirators_explainer:
      "Jede Verschwörungstheorie heftet eine:n Schuldige:n und ein Motiv an dasselbe Ereignis. Aus demselben Ereignis lassen sich beliebig viele Theorien bauen — andere Schuldige, andere Motive. Genau daran erkennt man Verschwörungstheorien: Dasselbe Ereignis lässt sich auf beliebig viele Arten „erklären“.",
    culprit: "Schuldige:r",
    motive: "Motiv",
    refresh_choices: "↻ Auswahl neu mischen",
    walkthrough_caption:
      "Du gehst durch die vier Schritte auf je einem Bildschirm — mit einer Auflösung neben jedem Schritt.",
    cta_start: "Loslegen",
    cta_starting: "Wird vorbereitet…",
    cta_starting_dots: "Ideen werden gesammelt",
    cta_yolo: "Den geführten Weg überspringen — nur die Theorie zeigen →",
    cta_yolo_starting: "Volle Yolo-Fahrt…",
    cta_yolo_starting_dots:
      "Ideen werden gewählt, alle vier Schritte geschrieben, die Theorie zusammengewebt",
    err_too_long: "Das hat zu lange gedauert — bitte erneut versuchen.",
    err_couldnt_start: "Bauen konnte nicht gestartet werden.",
    err_yolo_failed:
      "Yolo-Lauf fehlgeschlagen — erneut versuchen oder den geführten Weg oben nehmen.",
  },
  wizard: {
    pick_idea: "Wähle eine Idee, die Du anwenden willst",
    cooking: "wird gekocht…",
    conspiracist_writes: "Die Verschwörungstheoretikerin schreibt",
    debunk_label: "Auflösung · warum das wirkt",
    next_move: "Nächster Schritt →",
    see_full_theory: "Ganze Theorie ansehen →",
    or_regenerate: "Oder klicke oben eine andere Idee, um neu zu generieren.",
    writing: "Der Verschwörungsabsatz und die Auflösung werden geschrieben…",
    writing_finale:
      "Der letzte Schritt wird geschrieben und die ganze Theorie zusammengewebt…",
    writing_too_long:
      "Das hat zu lange gedauert — erneut versuchen oder eine andere Idee wählen.",
    section_failed: "Generierung fehlgeschlagen.",
    back: "← Zurück",
    step_n_of: "Schritt {{n}} von {{total}}",
    skip_to_result: "Direkt zum Ergebnis →",
    skip_to_result_loading_h: "Der Rest wird gefüllt…",
    skip_to_result_loading_dots:
      "Ideen werden gewählt, fehlende Schritte geschrieben, die Theorie zusammengewebt",
    skip_to_result_failed: "Der Rest konnte nicht ergänzt werden — bitte erneut versuchen.",
    progress_done: "Fertig",
    move_label: "Schritt",
    done_eyebrow: "Fertig",
    done_h1: "Deine Verschwörungstheorie ist gebaut.",
    done_p_a: "Du hast eine erfundene Vier-Schritte-Verschwörungstheorie, die",
    done_p_orchestrating: "beschuldigt,",
    done_p_in_service_of: "im Dienste von",
    done_p_period:
      " inszeniert zu haben. Lies als Nächstes die zusammengebaute Theorie mit allen vier Auflösungen daneben.",
    done_p_missing:
      "Einige Schritte fehlen noch. Du kannst zurückgehen und sie ergänzen — oder direkt zum Ergebnis springen.",
    done_cta_read: "Ganze Theorie lesen →",
  },
  wizard_blurb: {
    anomaly_explainer:
      "Such Dir ein gewöhnliches Detail im Ereignis und rahme es als verdächtig. Der Trick: Zufall als Signal behandeln — der:die Leser:in soll das Gefühl bekommen, dass etwas nicht stimmt.",
    anomaly_tell:
      "Echte Ermittler:innen prüfen die Ausgangswahrscheinlichkeit. Verschwörungstheoretiker:innen sammeln Auffälligkeiten und überspringen sie.",
    connection_explainer:
      "Verknüpfe die:den Schuldige:n über eine Kette schwach verwandter Fakten mit dem Ereignis. Die Kette selbst wird zum Beweis — nicht die Frage, ob jedes Glied bedeutsam ist.",
    connection_tell:
      "Über sechs Ecken ist jeder mit jedem verbunden. Eine Kette von Verbindungen ist kein Beweis für Absicht.",
    dismiss_explainer:
      "Nimm eine offensichtliche, etablierte Widerlegung und rahme sie als weiteren Beweis der Vertuschung. Die Theorie wird damit gegen Widerlegung immun.",
    dismiss_tell:
      "Wenn Gegenbeweise zu weiteren Beweisen der Verschwörung werden, ist die Theorie unfalsifizierbar. Das ist ein verräterisches Muster, keine Stärke.",
    discredit_explainer:
      "Lenke die Frage von „stimmt das?“ auf „wer fragt da?“ um. Wer der Theorie widerspricht, ist leichtgläubig, manipuliert oder bezahlt.",
    discredit_tell:
      "Echte Ermittler:innen begrüßen Kritik. Verschwörungstheoretiker:innen behandeln Kritik als die Verschwörung.",
  },
  generation: {
    eyebrow_imported: "Aus früherer Version importiert",
    eyebrow_fake: "Eine erfundene Verschwörungstheorie",
    h1_how: "Wie",
    h1_orchestrated: "orchestriert hat —",
    h1_in_service_of: ", im Dienste von",
    h1_period: ".",
    original_story: "(Originalgeschichte)",
    legacy_note: "Aus früherer Version importiert · keine Schritt-Annotation verfügbar",
    rate_question: "Wurde das Rezept überzeugend angewendet?",
    share_meta: "Teilen — verlinkt zurück, keine Bilder der Theorie",
    build_another: "↻ Eine weitere bauen",
    move_label: "Schritt",
    idea_label: "Idee:",
    debunk_label: "Auflösung",
    narrative_eyebrow: "Die Theorie",
    breakdown_eyebrow: "Wie der Trick gebaut ist",
    narrative_stamp: "ERFUNDENE THEORIE · NACH REZEPT GEBAUT",
    moves_legend_prefix: "Gebaut aus:", // FIXME: unused, remove in next change
    see_breakdown_cta: "↓ So ist der Trick gebaut",
    breakdown_explainer:
      "Jeder Absatz oben nutzt einen der vier Schritte. Hier ist jeder Schritt einzeln — mit Auflösung.",
  },
  share: {
    teaser:
      "Eine erfundene Verschwörungstheorie nach dem Vier-Schritte-Rezept gebaut bei",
    email_subject: "Eine erfundene Verschwörungstheorie, mit dem Rezept dazu",
    email_body_a: "Ich habe eine erfundene Verschwörungstheorie über „",
    email_body_b:
      "“ nach dem Vier-Schritte-Rezept gebaut. Die Schritte-Seite erklärt, wie sie aufgebaut ist und warum jeder Schritt wirkt:",
    copy_link: "Link kopieren",
    copied: "Kopiert",
    via_x: "X",
    via_bluesky: "Bluesky",
    via_email: "E-Mail",
    via_system: "Über System teilen",
    site_title: "Conspiracy Generator",
  },
  errors: {
    not_found_h1: "Nicht gefunden.",
    not_found_body:
      "Diese Seite existiert nicht — oder die Theorie wurde entfernt.",
    not_found_back_home: "← Zurück zur Startseite",
    client_error_h1: "Etwas ist schiefgelaufen.",
    client_error_body:
      "Ein unerwarteter Fehler hat diese Seite unterbrochen. Du kannst es erneut versuchen oder zur Startseite zurückkehren.",
    client_error_try_again: "↻ Erneut versuchen",
  },
  meta: {
    home_title_default: "Conspiracy Generator — das Rezept, ausgeschrieben",
    home_title_template: "%s · Conspiracy Generator",
    home_description:
      "Ein Lehrwerkzeug, das vor Deinen Augen eine erfundene Verschwörungstheorie baut, jeden der vier Schritte beim Namen nennt und daneben eine Auflösung mitlaufen lässt. Sieh dem Rezept zu, damit Du es im Alltag wiedererkennst.",
    og_title: "Conspiracy Generator — das Rezept, ausgeschrieben",
    og_description:
      "Verschwörungstheorien folgen vier Schritten. Wer sie benennt, erkennt sie wieder. Bau selbst eine, um das Rezept zu sehen.",
    twitter_description:
      "Verschwörungstheorien folgen vier Schritten. Bau selbst eine, um das Rezept zu sehen.",
    recipe_title: "Die vier Schritte",
    about_title: "Über uns",
    teach_title: "Für Lehrkräfte — eine 15-Minuten-Stunde",
    visitors_title: "Visitors",
    stats_title: "Stats",
    og_description_generation:
      "Gebaut mit dem Vier-Schritte-Rezept. Wähle ein Ereignis, eine schuldige Partei, ein Motiv — und sieh zu, wie die Theorie sich selbst zusammenbaut.",
  },
  legal: {
    translation_pending_h: "Übersetzung in Arbeit",
    translation_pending_body:
      "Diese Seite enthält rechtlich relevante Inhalte, die noch nicht in deutscher Originalfassung vorliegen. Es folgt der englische Quelltext.",
  },
};
