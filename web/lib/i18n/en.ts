// English dictionary. Single source of truth for the typed key shape.
// Spec: openspec/changes/multilingual-german/specs/internationalization/spec.md
//
// Keep keys grouped by surface (page, component) to keep merges clean.
// Note: explicit Dictionary type below — we widen string values from literal
// types to plain `string` so locale dictionaries (de, future nl) can carry
// any string content while still being structurally-checked against this shape.

export type Dictionary = {
  masthead: {
    nav_recipe: string;
    nav_teach: string;
    nav_about: string;
    nav_build: string;
    open_nav: string;
    locale_toggle_aria: string;
  };
  footer: {
    link_recipe: string;
    link_teach: string;
    link_about: string;
    link_imprint: string;
    link_privacy: string;
  };
  home: {
    hero_h1_a: string;
    hero_h1_b: string;
    hero_h1_period: string;
    hero_subheading: string;
    hero_description: string;
    four_moves_aria: string;
    move_label: string;
    step_1_picker: string;
    refresh: string;
    choose_this_story: string;
  };
  recipe: {
    eyebrow: string;
    h1: string;
    lede_a: string;
    lede_link: string;
    lede_period: string;
    aside_p: string;
    aside_form: string;
    aside_p_2: string;
    aside_substance: string;
    aside_p_3: string;
    move_label: string;
    tell_strong: string;
  };
  recipe_long: {
    anomaly_short: string;
    anomaly_body: string;
    anomaly_tell: string;
    connection_short: string;
    connection_body: string;
    connection_tell: string;
    dismiss_short: string;
    dismiss_body: string;
    dismiss_tell: string;
    discredit_short: string;
    discredit_body: string;
    discredit_tell: string;
  };
  about: {
    eyebrow: string;
    h1: string;
    p1: string;
    p2: string;
    p3_a: string;
    p3_recipe_link: string;
    p3_b: string;
    p3_teach_link: string;
    p3_c: string;
    feedback_h: string;
    feedback_p_a: string;
    feedback_p_period: string;
    credits_h: string;
    credits_p_a: string;
    credits_p_and: string;
    credits_p_inspired: string;
    credits_blog_link: string;
    credits_p_thanks: string;
  };
  teach: {
    title_meta: string;
    eyebrow: string;
    h1: string;
    intro: string;
    why_h: string;
    why_p1: string;
    why_p2_a: string;
    why_p2_link: string;
    why_p2_b: string;
    plan_h: string;
    step1_minutes: string;
    step1_title: string;
    step1_body: string;
    step2_minutes: string;
    step2_title: string;
    step2_body: string;
    step3_minutes: string;
    step3_title: string;
    step3_body: string;
    step4_minutes: string;
    step4_title: string;
    step4_body: string;
    minutes_suffix: string;
    prompts_h: string;
    prompts_intro: string;
    prompt_1: string;
    prompt_2: string;
    prompt_3: string;
    prompt_4: string;
    prompt_5: string;
    prompt_6: string;
    outcomes_h: string;
    outcome_1: string;
    outcome_2: string;
    outcome_3: string;
    outcome_4: string;
    teach_footer_a: string;
    teach_footer_link: string;
    teach_footer_period: string;
    print_button: string;
    pdf_de_warning: string;
  };
  print: {
    button: string;
  };
  story: {
    eyebrow: string;
    pick_different: string;
    source_label: string;
    pick_conspirators_meta: string;
    pick_conspirators_explainer: string;
    culprit: string;
    motive: string;
    refresh_choices: string;
    walkthrough_caption: string;
    cta_start: string;
    cta_starting: string;
    cta_starting_dots: string;
    /** Secondary one-shot CTA — random ideas, full theory, no walkthrough. */
    cta_yolo: string;
    cta_yolo_starting: string;
    cta_yolo_starting_dots: string;
    err_too_long: string;
    err_couldnt_start: string;
    err_yolo_failed: string;
  };
  wizard: {
    pick_idea: string;
    cooking: string;
    conspiracist_writes: string;
    debunk_label: string;
    next_move: string;
    see_full_theory: string;
    or_regenerate: string;
    writing: string;
    /** Shown on the final (discredit) step where the response also stitches the
     *  three-paragraph narrative finale — slightly longer wait. */
    writing_finale: string;
    writing_too_long: string;
    section_failed: string;
    back: string;
    step_n_of: string;
    skip_to_result: string;
    /** Loading state shown while the wizard's skip-to-result button POSTs to /api/build/[id]/yolo. */
    skip_to_result_loading_h: string;
    skip_to_result_loading_dots: string;
    skip_to_result_failed: string;
    progress_done: string;
    /** Singular noun used in the wizard progress bar and per-move screen header
     *  (e.g. "Move 01" / "Schritt 01" / "Stap 01"). */
    move_label: string;
    done_eyebrow: string;
    done_h1: string;
    done_p_a: string;
    done_p_orchestrating: string;
    done_p_in_service_of: string;
    done_p_period: string;
    done_p_missing: string;
    done_cta_read: string;
  };
  wizard_blurb: {
    anomaly_explainer: string;
    anomaly_tell: string;
    connection_explainer: string;
    connection_tell: string;
    dismiss_explainer: string;
    dismiss_tell: string;
    discredit_explainer: string;
    discredit_tell: string;
  };
  generation: {
    eyebrow_imported: string;
    eyebrow_fake: string;
    h1_how: string;
    h1_orchestrated: string;
    h1_in_service_of: string;
    h1_period: string;
    original_story: string;
    legacy_note: string;
    rate_question: string;
    share_meta: string;
    build_another: string;
    move_label: string;
    idea_label: string;
    debunk_label: string;
    /** Eyebrow above the narrative finale block. */
    narrative_eyebrow: string;
    /** Eyebrow above the per-move stamped section, shown only when narrative is present. */
    breakdown_eyebrow: string;
    /** Crop-resistant stamp inside the narrative section (parallel to per-move tell stamps). */
    narrative_stamp: string;
    /** Prefix for the moves legend rendered below the narrative paragraphs. */
    moves_legend_prefix: string;
    /** Anchor CTA at end of narrative section that scrolls to the breakdown. */
    see_breakdown_cta: string;
    /** One-sentence explainer below the breakdown eyebrow when narrative is present. */
    breakdown_explainer: string;
  };
  share: {
    teaser: string;
    email_subject: string;
    email_body_a: string;
    email_body_b: string;
    copy_link: string;
    copied: string;
    via_x: string;
    via_bluesky: string;
    via_email: string;
    via_system: string;
    site_title: string;
  };
  errors: {
    not_found_h1: string;
    not_found_body: string;
    not_found_back_home: string;
    client_error_h1: string;
    client_error_body: string;
    client_error_try_again: string;
  };
  meta: {
    home_title_default: string;
    home_title_template: string;
    home_description: string;
    og_title: string;
    og_description: string;
    twitter_description: string;
    recipe_title: string;
    about_title: string;
    teach_title: string;
    visitors_title: string;
    stats_title: string;
    /** Share-preview description rendered as og:description + twitter:description on /g/[id]. */
    og_description_generation: string;
  };
  /** Notices shown on legally-significant pages (imprint, privacy) when no
   *  jurisdictional original exists yet for the active locale. EN values are
   *  empty strings — the English page never renders the notice (English is the
   *  source) but the keys exist for type completeness. */
  legal: {
    translation_pending_h: string;
    translation_pending_body: string;
  };
};

export const en: Dictionary = {
  masthead: {
    nav_recipe: "The recipe",
    nav_teach: "For teachers",
    nav_about: "About",
    nav_build: "Build",
    open_nav: "Open navigation",
    locale_toggle_aria: "Switch language",
  },
  footer: {
    link_recipe: "The recipe",
    link_teach: "For teachers",
    link_about: "About & credits",
    link_imprint: "Imprint",
    link_privacy: "Privacy",
  },
  home: {
    hero_h1_a: "Build a conspiracy theory",
    hero_h1_b: "from scratch",
    hero_h1_period: ".",
    hero_subheading:
      "The best way to learn to spot a conspiracy theory is to make one yourself.",
    hero_description:
      "Pick a real news story. On the next step you'll choose who's behind it and why. Then walk through the four moves real conspiracists use, with a debunk on every step.",
    four_moves_aria: "The four recipe moves",
    move_label: "Move",
    step_1_picker: "Step 1 — Pick a real news story",
    refresh: "↻ Refresh",
    choose_this_story: "Choose this story →",
  },
  recipe: {
    eyebrow: "The recipe",
    h1: "Conspiracy theories follow four moves.",
    lede_a:
      "The moves are independent. You can apply them to any news story, real conspiracy, or made-up event. Once you can name them, you can spot them. The recipe is set out at length in",
    lede_link: "this blog post",
    lede_period: ".",
    aside_p:
      "Real critics of real institutions sometimes use these moves with substance behind them — a journalist questioning an official cover-up, a researcher rejecting weak counter-evidence. The four-move recipe trains your eye for the",
    aside_form: "form",
    aside_p_2: "of conspiracy reasoning. Whether the",
    aside_substance: "substance",
    aside_p_3: "of the claim is also wrong is a separate, slower question.",
    move_label: "Move",
    tell_strong: "The tell.",
  },
  recipe_long: {
    anomaly_short: "Turn coincidence into evidence of a secret plot.",
    anomaly_body:
      "Look for puzzling details or contradictions in the official story. Insist they prove the official story is false. You're \"just asking questions\" — and since no explanation of any event is ever complete, this part is easy.",
    anomaly_tell:
      "Real investigators look for patterns that survive a base-rate check. Conspiracists collect anomalies and forget to ask how often a coincidence of that kind happens by chance.",
    connection_short: "Draw lines between unrelated dots until they look meaningful.",
    connection_body:
      "Fabricate \"evidence\" that implicates your culprit. Forge suspicious connections between the official story and your culprits — the tighter the network looks, the better.",
    connection_tell:
      "\"Six degrees of separation\" works for any two people on the planet. Treating a six-link chain as evidence is a category error: the connection exists in every direction, not only the one being highlighted.",
    dismiss_short: "If a fact disagrees, make the fact part of the cover-up.",
    dismiss_body:
      "Argue that any disconfirming evidence is missing because the conspirators covered their tracks — and any apparent counter-evidence was planted to throw truth-seekers off.",
    dismiss_tell:
      "When counter-evidence becomes further evidence of the conspiracy, the theory has become unfalsifiable. Any disconfirmation just expands the circle of conspirators.",
    discredit_short: "Dismiss people who point out flaws in your theory.",
    discredit_body:
      "Critics can be dismissed in different ways: they're gullible dupes, they've been manipulated, or they're paid stooges of the conspirators themselves.",
    discredit_tell:
      "Ad hominem framing reroutes the question from \"is this true?\" to \"who is asking?\" Real investigators welcome critique; conspiracists treat it as more evidence of the conspiracy.",
  },
  about: {
    eyebrow: "About",
    h1: "The best way to learn to spot a conspiracy theory is to make one yourself.",
    p1:
      "That's the idea behind this tool. You pick a real event, a culprit, and a motive, and then you build a fake conspiracy theory step by step. Each step uses one of the four moves real conspiracists rely on, with a debunk running alongside.",
    p2:
      "Once you've done it once, you can't un-see it. You learn that coming up with a plausible-sounding conspiracy theory is easy — and that for any one event you can generate many different theories that all contradict each other. The number of possible conspiracies is unlimited, which is part of why so few of them are real.",
    p3_a: "The four moves are",
    p3_recipe_link: "explained on the recipe page",
    p3_b: ". If you teach, there's also a",
    p3_teach_link: "lesson plan",
    p3_c: "you can use in class.",
    feedback_h: "Feedback",
    feedback_p_a:
      "We love hearing what works and what doesn't — bug reports, classroom stories, ideas for new moves. Drop a line at",
    feedback_p_period: ".",
    credits_h: "Credits",
    credits_p_a: "The Conspiracy Generator is built by",
    credits_p_and: "and",
    credits_p_inspired: ", inspired by",
    credits_blog_link: "a blog post by Maarten",
    credits_p_thanks:
      ". With thanks to Natasha Newbold, Mohammed Darras, and Peter Keroti for their work on an earlier version, and to the Etienne Vermeersch Chair of Critical Thinking at Ghent University for funding.",
  },
  teach: {
    title_meta: "For teachers — a 15-minute lesson plan",
    eyebrow: "For teachers",
    h1: "A 15-minute lesson in spotting conspiracy theories.",
    intro:
      "The Conspiracy Generator is built to be used in class. The exercise is short, hands-on, and lands the lesson in the same window of attention students give to one news headline. This page is the lesson plan — read it on screen, or print it as a PDF using the button above.",
    why_h: "Why this works",
    why_p1:
      "The strongest defence against conspiracy thinking is to make a conspiracy theory of your own. Once students have applied the four moves themselves, they can name the moves the next time they encounter them. A lecture about why conspiracy theories are wrong reaches few of them; the experience of building one reaches almost all of them.",
    why_p2_a: "The four moves — hunt anomalies, fabricate connections, dismiss counter-evidence, discredit critics — are described on",
    why_p2_link: "the recipe page",
    why_p2_b: "with examples and the \"tell\" for each. Read it once before class.",
    plan_h: "The 15-minute plan",
    step1_minutes: "0–3",
    step1_title: "Set up",
    step1_body:
      "Open the Conspiracy Generator on the projector. Show students the home page and explain what they're about to see. Don't read the recipe page out loud yet — they'll learn the moves by watching them happen.",
    step2_minutes: "3–6",
    step2_title: "Pick the ingredients together",
    step2_body:
      "Vote as a class on a news event, a culprit, and a motive. Pick something the class is broadly aware of — a recent local story, a science discovery, a sports moment. The flavours of the three are deliberately mismatched; that mismatch is part of the point.",
    step3_minutes: "6–13",
    step3_title: "Walk through the four moves",
    step3_body:
      "The tool walks you through one move per screen. For each: read the short briefing, click an idea button, read the generated paragraph, then read the debunk. Stop after each move and ask the discussion prompt below for that move (one minute, no more).",
    step4_minutes: "13–15",
    step4_title: "The closing question",
    step4_body:
      "When the assembled theory comes up, ask: which of the four moves were you most likely to fall for? Most students name the same move. That's the one to watch for in real life.",
    minutes_suffix: "min",
    prompts_h: "Discussion prompts",
    prompts_intro: "Pick one or two — these work between moves or after the assembled theory.",
    prompt_1: "Which of the four moves felt most convincing? Why?",
    prompt_2: "What real evidence would change your mind about the theory you just built?",
    prompt_3:
      "What's the difference between Move 02 (Fabricate connections) and how a real journalist or historian connects evidence?",
    prompt_4:
      "When have you seen Move 04 (Discredit critics) in real-world arguments? Where did it appear?",
    prompt_5:
      "Pick a real news event you know well. Try the four moves on it yourself, before reading the generated theory. Compare.",
    prompt_6:
      "What ARE the legitimate critiques of public institutions? How do they differ from a conspiracy theory's complaints?",
    outcomes_h: "What students leave with",
    outcome_1: "The four moves, by name.",
    outcome_2: "The \"tell\" of each move — why it works on a casual reader.",
    outcome_3:
      "An intuition that for any one event, many different conspiracy theories can be built — most of them with the same recipe.",
    outcome_4: "A sharper instinct to ask \"is this true?\" instead of \"who's against it?\"",
    teach_footer_a: "Used this in your class? We'd love to hear how it went —",
    teach_footer_link: "drop us a note",
    teach_footer_period: ".",
    print_button: "Save as PDF",
    pdf_de_warning: "", // English-only warning text shown only on /de/teach
  },
  print: {
    button: "Save as PDF",
  },
  story: {
    eyebrow: "Step 2 — The official story",
    pick_different: "← Pick a different story",
    source_label: "Source:",
    pick_conspirators_meta: "Now pick the conspirators",
    pick_conspirators_explainer:
      "Every conspiracy theory pins one culprit and one motive on the same story. The same story can spawn any number of theories — different culprits, different motives. That's part of how you spot a conspiracy theory: the same event can be \"explained\" any number of ways.",
    culprit: "Culprit",
    motive: "Motive",
    refresh_choices: "↻ Refresh choices",
    walkthrough_caption:
      "You'll walk through the four moves on separate screens, with a debunk on every step.",
    cta_start: "Start building",
    cta_starting: "Setting up…",
    cta_starting_dots: "Brainstorming ideas",
    cta_yolo: "Skip the walkthrough — show me the theory →",
    cta_yolo_starting: "Going full yolo…",
    cta_yolo_starting_dots: "Picking ideas, writing all four moves, stitching the theory",
    err_too_long: "That took too long — try again.",
    err_couldnt_start: "Couldn't start the build.",
    err_yolo_failed: "Yolo run failed — try again, or use the walkthrough above.",
  },
  wizard: {
    pick_idea: "Pick an idea to apply",
    cooking: "cooking…",
    conspiracist_writes: "The conspiracist writes",
    debunk_label: "Debunk · why this works",
    next_move: "Next move →",
    see_full_theory: "See the full theory →",
    or_regenerate: "Or click another idea above to regenerate.",
    writing: "Writing the conspiracy paragraph and the debunk…",
    writing_finale: "Writing the final move and stitching the full theory…",
    writing_too_long: "That took too long — try again, or pick a different idea.",
    section_failed: "Generation failed.",
    back: "← Back",
    step_n_of: "Step {{n}} of {{total}}",
    skip_to_result: "Skip to result →",
    skip_to_result_loading_h: "Filling in the rest…",
    skip_to_result_loading_dots: "Picking ideas, writing the missing moves, stitching the theory",
    skip_to_result_failed: "Couldn't fill in the rest — try again.",
    progress_done: "Done",
    move_label: "Move",
    done_eyebrow: "Done",
    done_h1: "Your conspiracy theory is built.",
    done_p_a: "You have a four-move fake conspiracy theory accusing",
    done_p_orchestrating: "of orchestrating",
    done_p_in_service_of: "in service of",
    done_p_period: ". Read the assembled theory next, with all four debunks alongside.",
    done_p_missing:
      "Some moves are missing. You can go back and finish them, or jump straight to the result.",
    done_cta_read: "Read the full theory →",
  },
  wizard_blurb: {
    anomaly_explainer:
      "Pick something ordinary in the news event and frame it as suspicious. The trick is to treat coincidence as signal — to make the reader feel that something is off.",
    anomaly_tell:
      "Real investigators check base rates. Conspiracists collect anomalies and skip the base rate.",
    connection_explainer:
      "Link the culprit to the event through a chain of weakly-related facts. The chain itself becomes the evidence — not whether each link is meaningful.",
    connection_tell:
      "Six-degrees of separation works for any two people on the planet. A chain of links is not evidence of intent.",
    dismiss_explainer:
      "Take an obvious mainstream rebuttal and reframe it as more proof of the cover-up. The theory becomes immune to disconfirmation.",
    dismiss_tell:
      "When counter-evidence becomes more evidence of the conspiracy, the theory has become unfalsifiable. That's a tell, not a strength.",
    discredit_explainer:
      "Reroute the question from \"is this true?\" to \"who is asking?\" Anyone disputing the theory is gullible, manipulated, or paid.",
    discredit_tell:
      "Real investigators welcome critique. Conspiracists treat critique as the conspiracy.",
  },
  generation: {
    eyebrow_imported: "Imported from earlier version",
    eyebrow_fake: "A fake conspiracy theory",
    h1_how: "How",
    h1_orchestrated: "orchestrated",
    h1_in_service_of: ", in service of",
    h1_period: ".",
    original_story: "(original story)",
    legacy_note: "Imported from earlier version · recipe tagging not available",
    rate_question: "Was the recipe convincingly applied?",
    share_meta: "Share — links back, no images of the theory",
    build_another: "↻ Build another",
    move_label: "Move",
    idea_label: "Idea:",
    debunk_label: "Debunk",
    narrative_eyebrow: "The theory",
    breakdown_eyebrow: "How the trick was built",
    narrative_stamp: "FAKE THEORY · BUILT FROM A RECIPE",
    moves_legend_prefix: "Built from:", // FIXME: unused, remove in next change
    see_breakdown_cta: "↓ See how the trick was built",
    breakdown_explainer:
      "Each paragraph above used one of four moves. Here's each move on its own, with the debunk.",
  },
  share: {
    teaser: "Built a fake conspiracy theory using the four-move recipe at",
    email_subject: "A fake conspiracy theory, with the recipe shown",
    email_body_a: "I made a fake conspiracy theory about \"",
    email_body_b: "\" using the four-move recipe. The recipe page explains how it was built and why each move works:",
    copy_link: "Copy link",
    copied: "Copied",
    via_x: "X",
    via_bluesky: "Bluesky",
    via_email: "Email",
    via_system: "Share via system",
    site_title: "Conspiracy Generator",
  },
  errors: {
    not_found_h1: "Not found.",
    not_found_body: "That page doesn't exist — or the theory has been removed.",
    not_found_back_home: "← Back to the home page",
    client_error_h1: "Something went wrong.",
    client_error_body:
      "An unexpected error broke this page. You can try again, or head back to the home page.",
    client_error_try_again: "↻ Try again",
  },
  meta: {
    home_title_default: "Conspiracy Generator — the recipe, written out",
    home_title_template: "%s · Conspiracy Generator",
    home_description:
      "An educational tool that builds a fake conspiracy theory in front of you, labeling each of the four moves as it happens, with a debunking column running alongside. Watch the recipe so you can spot it in the wild.",
    og_title: "Conspiracy Generator — the recipe, written out",
    og_description:
      "Conspiracy theories follow four moves. Once you can name them, you can spot them. Build one yourself to see the recipe.",
    twitter_description: "Conspiracy theories follow four moves. Build one to see the recipe.",
    recipe_title: "The recipe",
    about_title: "About",
    teach_title: "For teachers — a 15-minute lesson plan",
    visitors_title: "Visitors",
    stats_title: "Stats",
    og_description_generation:
      "Made with the four-move recipe. Pick an event, a culprit, a motive — watch the theory build itself.",
  },
  legal: {
    translation_pending_h: "",
    translation_pending_body: "",
  },
};
