/**
 * ToneShift — Local Rule-Based Copy Transformation Engine & UI Controller
 * 100% Client-side. Zero external API calls.
 */

(() => {
  'use strict';

  // Sample Presets Database
  const SAMPLE_PRESETS = {
    launch: "Hey team, we just finished building the new export feature for user dashboards. It lets users download reports as CSV or PDF in one click. We think this will help reduce customer support tickets about data sharing.",
    delay: "Unfortunately we are running into some unexpected technical blockers with the authentication service, so the Q3 release will be delayed by about two weeks. We are working hard to resolve this as fast as possible.",
    feedback: "I've been testing the new checkout flow and it feels a bit clunky and confusing around the shipping address step. Users might get frustrated and drop off before paying.",
    followup: "Just checking in to see if you had a chance to review the proposal I sent over last Tuesday. Let me know if you have any questions or want to set up a quick 15-minute call."
  };

  const FILLER_PHRASES = [
    /\b(just wanted to|i just wanted to|i am just writing to|just checking in to see if)\b/gi,
    /\b(hope this email finds you well|hope you are doing well|i hope you're having a good week)\b/gi,
    /\b(in my humble opinion|in my opinion|to be completely honest|as a matter of fact)\b/gi,
    /\b(basically|literally|actually|kind of|sort of|at the end of the day)\b/gi,
    /\b(we were thinking that maybe|i think that maybe|perhaps we could possibly)\b/gi,
    /\b(sorry to bother you|excuse the intrusion|apologies for reaching out)\b/gi
  ];

  const EXECUTIVE_REPLACEMENTS = [
    { from: /\b(we built|we made|we finished building|we created)\b/gi, to: "we have successfully deployed" },
    { from: /\b(download reports|get data|export data)\b/gi, to: "execute seamless automated reporting workflows" },
    { from: /\b(reduce support tickets|less tickets|fewer tickets)\b/gi, to: "optimize operational overhead and enhance self-service efficiency" },
    { from: /\b(delayed by about two weeks|delayed by two weeks|late by two weeks)\b/gi, to: "rescheduled with a +14 day delivery horizon to ensure zero-defect quality" },
    { from: /\b(delayed|running late|pushed back)\b/gi, to: "realigned on an updated delivery milestone" },
    { from: /\b(blockers|problems|bugs|issues|technical blockers)\b/gi, to: "critical architectural dependencies" },
    { from: /\b(working hard|trying hard)\b/gi, to: "actively mitigating risks and mobilizing remediation streams" },
    { from: /\b(clunky and confusing|hard to use|confusing)\b/gi, to: "exhibiting elevated conversion friction and UX bottlenecks" },
    { from: /\b(drop off before paying|abandon cart|leave)\b/gi, to: "sub-optimizing bottom-funnel checkout conversion" },
    { from: /\b(proposal|deck|document)\b/gi, to: "strategic alignment document & engagement proposal" },
    { from: /\b(quick 15-minute call|quick call|chat)\b/gi, to: "brief strategic synchronization session" },
    { from: /\b(we think this will|i think this will)\b/gi, to: "projected data indicates this will" },
    { from: /\b(help|helps)\b/gi, to: "directly accelerates" },
    { from: /\b(fix|fixing)\b/gi, to: "remediate" },
    { from: /\b(good|nice|great)\b/gi, to: "high-impact" }
  ];

  const CONCISE_REPLACEMENTS = [
    { from: /\b(we just finished building|we have successfully built|we built)\b/gi, to: "Built:" },
    { from: /\b(unfortunately we are running into|we are facing)\b/gi, to: "Blocker:" },
    { from: /\b(so the release will be delayed by about two weeks|delayed by two weeks)\b/gi, to: "Release timeline: +2 weeks." },
    { from: /\b(we are working hard to resolve this as fast as possible)\b/gi, to: "Resolution in progress." },
    { from: /\b(i've been testing the new checkout flow and it feels a bit clunky and confusing around the shipping address step)\b/gi, to: "Checkout audit: Shipping step UX introduces drop-off friction." },
    { from: /\b(users might get frustrated and drop off before paying)\b/gi, to: "Risk: Checkout abandonment." },
    { from: /\b(just checking in to see if you had a chance to review the proposal I sent over last Tuesday)\b/gi, to: "Status check: Tuesday's proposal review." },
    { from: /\b(let me know if you have any questions or want to set up a quick 15-minute call)\b/gi, to: "Action: Confirm review or sync 15m." },
    { from: /\b(in order to|with the aim of)\b/gi, to: "to" },
    { from: /\b(at this point in time|currently at present)\b/gi, to: "now" },
    { from: /\b(utilize|make use of)\b/gi, to: "use" },
    { from: /\b(as soon as possible)\b/gi, to: "ASAP" }
  ];

  const FRIENDLY_REPLACEMENTS = [
    { from: /\b(we just finished building|we built|we made)\b/gi, to: "Exciting news! We just launched" },
    { from: /\b(it lets users download reports as CSV or PDF in one click)\b/gi, to: "You can now export your reports in CSV or PDF with a single, easy click!" },
    { from: /\b(reduce customer support tickets)\b/gi, to: "make managing your data totally effortless" },
    { from: /\b(unfortunately we are running into some unexpected technical blockers with the authentication service, so the Q3 release will be delayed by about two weeks)\b/gi, to: "Quick heads up: We're polishing up our authentication experience to make it super secure, so our release date will be moving back by just two weeks." },
    { from: /\b(we are working hard to resolve this as fast as possible)\b/gi, to: "Thanks a ton for your patience while we make this rock-solid for you!" },
    { from: /\b(i've been testing the new checkout flow and it feels a bit clunky and confusing around the shipping address step)\b/gi, to: "I walked through the checkout experience today and noticed a few spots in the shipping address step where we can make things much clearer and delightful for our shoppers." },
    { from: /\b(just checking in to see if you had a chance to review the proposal I sent over last Tuesday)\b/gi, to: "Hope you're having a wonderful week! Whenever you have a spare moment, I'd love to hear your thoughts on the proposal from last Tuesday." },
    { from: /\b(let me know if you have any questions or want to set up a quick 15-minute call)\b/gi, to: "Happy to answer any questions or hop on a quick 15-min chat if that's easier for you!" }
  ];

  const SOCIAL_REPLACEMENTS = [
    { from: /\b(we just finished building the new export feature for user dashboards. It lets users download reports as CSV or PDF in one click)\b/gi, to: "Just dropped: 1-click CSV & PDF dashboard exports 🚀 \n\nNo more manual copy-pasting." },
    { from: /\b(we think this will help reduce customer support tickets about data sharing)\b/gi, to: "Clean data, zero headaches. Built for builders who move fast." },
    { from: /\b(unfortunately we are running into some unexpected technical blockers with the authentication service, so the Q3 release will be delayed by about two weeks)\b/gi, to: "Transparency check 🛠️ We hit a snag with our auth service and are pushing launch by 2 weeks. We’d rather ship something bulletproof than rush a buggy release." },
    { from: /\b(we are working hard to resolve this as fast as possible)\b/gi, to: "Appreciate everyone riding with us. Back to building!" },
    { from: /\b(i've been testing the new checkout flow and it feels a bit clunky and confusing around the shipping address step. Users might get frustrated and drop off before paying)\b/gi, to: "Hot take on checkout UX: every extra click at checkout costs you real customers. 💳 Address input needs to be frictionless." },
    { from: /\b(just checking in to see if you had a chance to review the proposal I sent over last Tuesday. Let me know if you have any questions or want to set up a quick 15-minute call)\b/gi, to: "Quick nudge! 👀 Sent over that proposal last Tuesday. Open for a 15-min brainstorm whenever your schedule opens up." }
  ];

  function sanitizeInput(text) {
    if (!text) return '';
    let cleaned = text.trim();
    FILLER_PHRASES.forEach(regex => {
      cleaned = cleaned.replace(regex, '');
    });
    return cleaned.replace(/\s{2,}/g, ' ').replace(/^[,\s.-]+/, '');
  }

  function splitIntoSentences(text) {
    if (!text) return [];
    return text
      .split(/(?<=[.?!])\s+|\n+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  function applyReplacements(text, dictionary) {
    let result = text;
    dictionary.forEach(({ from, to }) => {
      result = result.replace(from, to);
    });
    return result;
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function stripTrailingPunctuation(str) {
    return str.replace(/[.,;?!]+$/, '');
  }

  const TRANSFORMERS = {
    executive: {
      subtitle: "Showing 3 distinct styles for Executive Pitch",
      v1: {
        label: "Strategic Impact",
        note: "High-level outcome & ROI focused",
        transform: (raw) => {
          const sanitized = sanitizeInput(raw);
          const replaced = applyReplacements(sanitized, EXECUTIVE_REPLACEMENTS);
          return `Strategic Value Summary:\n${capitalize(replaced)}\n\nBusiness Outcome: Direct enhancement of core operating metrics, reduced operational drag, and strengthened stakeholder alignment.`;
        }
      },
      v2: {
        label: "Leadership Brief",
        note: "Bottom-line up front with action items",
        transform: (raw) => {
          const sentences = splitIntoSentences(raw);
          let mainPoint = sentences[0] ? applyReplacements(sentences[0], EXECUTIVE_REPLACEMENTS) : "Key initiative on track.";
          let secondary = sentences.length > 1 ? applyReplacements(sentences.slice(1).join(' '), EXECUTIVE_REPLACEMENTS) : "Execution plan underway.";
          return `• Executive Summary: ${capitalize(stripTrailingPunctuation(mainPoint))}.\n• Core Impact: ${capitalize(stripTrailingPunctuation(secondary))}.\n• Action Required: Governance review and milestone sign-off.`;
        }
      },
      v3: {
        label: "Visionary Narrative",
        note: "Macro perspective & strategic momentum",
        transform: (raw) => {
          const sanitized = sanitizeInput(raw);
          const replaced = applyReplacements(sanitized, EXECUTIVE_REPLACEMENTS);
          return `As we accelerate our roadmap milestones, ${replaced.toLowerCase().replace(/^hey team,?\s*/i, '').replace(/^unfortunately,?\s*/i, '')} This reinforces our ongoing commitment to industry-leading execution, scalable architecture, and sustainable enterprise velocity.`;
        }
      }
    },
    concise: {
      subtitle: "Showing 3 distinct styles for Ruthlessly Concise",
      v1: {
        label: "One-Breath Punch",
        note: "Maximum brevity, zero filler words",
        transform: (raw) => {
          const replaced = applyReplacements(raw, CONCISE_REPLACEMENTS);
          const sentences = splitIntoSentences(replaced);
          const firstCore = sentences[0] || raw;
          let punchy = firstCore
            .replace(/\b(hey team|hello|hi|dear all|thanks|best regards|sincerely)\b/gi, '')
            .replace(/\b(we think this will help|in order to help)\b/gi, 'to')
            .replace(/\s{2,}/g, ' ')
            .trim();
          return capitalize(stripTrailingPunctuation(punchy)) + '.';
        }
      },
      v2: {
        label: "BLUF Breakdown",
        note: "Bottom Line Up Front structured bullet points",
        transform: (raw) => {
          const sentences = splitIntoSentences(raw);
          let bluf = sentences[0] ? applyReplacements(sentences[0], CONCISE_REPLACEMENTS) : "Update logged.";
          let driver = sentences[1] ? applyReplacements(sentences[1], CONCISE_REPLACEMENTS) : "Details documented.";
          let next = sentences.length > 2 ? applyReplacements(sentences.slice(2).join(' '), CONCISE_REPLACEMENTS) : "Action: Review & proceed.";
          return `• BLUF: ${capitalize(stripTrailingPunctuation(bluf))}\n• Context: ${capitalize(stripTrailingPunctuation(driver))}\n• Next Step: ${capitalize(stripTrailingPunctuation(next))}`;
        }
      },
      v3: {
        label: "Micro-Telegram",
        note: "High signal-to-noise telegraphic syntax",
        transform: (raw) => {
          let words = raw
            .replace(/[^\w\s-]/g, '')
            .split(/\s+/)
            .filter(w => !['the', 'a', 'an', 'and', 'in', 'that', 'this', 'we', 'i', 'just', 'some', 'about', 'very', 'really', 'our', 'to', 'for'].includes(w.toLowerCase()))
            .slice(0, 12);
          if (words.length === 0) words = raw.split(/\s+/).slice(0, 8);
          return words.join(' ').toUpperCase() + ' — ACKNOWLEDGE.';
        }
      }
    },
    friendly: {
      subtitle: "Showing 3 distinct styles for Friendly UX",
      v1: {
        label: "Warm & Delightful",
        note: "Welcoming, appreciative, and clear",
        transform: (raw) => {
          const replaced = applyReplacements(raw, FRIENDLY_REPLACEMENTS);
          let cleaned = sanitizeInput(replaced)
            .replace(/^hey team,?\s*/i, '')
            .replace(/^unfortunately,?\s*/i, '');
          return `Hi there! 👋\n\n${capitalize(cleaned)}\n\nWe're always here if you need a hand with anything!`;
        }
      },
      v2: {
        label: "Guided Steps",
        note: "Clear, encouraging microcopy guidance",
        transform: (raw) => {
          const replaced = applyReplacements(raw, FRIENDLY_REPLACEMENTS);
          return `Here’s what’s happening:\n✨ ${capitalize(stripTrailingPunctuation(replaced))}.\n\nFeel free to explore or reach out anytime if you have questions! 😊`;
        }
      },
      v3: {
        label: "Empathetic Support",
        note: "Reassuring, thoughtful, and collaborative",
        transform: (raw) => {
          const replaced = applyReplacements(raw, FRIENDLY_REPLACEMENTS);
          return `We appreciate you taking the time with us. Just to keep you in the loop:\n\n${capitalize(replaced)}\n\nThank you so much for your partnership and support! 💛`;
        }
      }
    },
    social: {
      subtitle: "Showing 3 distinct styles for Casual Social",
      v1: {
        label: "High-Engagement Hook",
        note: "Attention-grabbing hook + call to action",
        transform: (raw) => {
          const replaced = applyReplacements(raw, SOCIAL_REPLACEMENTS);
          return `🔥 Quick update you don't want to miss:\n\n${capitalize(replaced)}\n\nDrop your thoughts below 👇 What do you think?`;
        }
      },
      v2: {
        label: "Casual Story / Thread",
        note: "Relatable, conversational stream-of-consciousness",
        transform: (raw) => {
          const replaced = applyReplacements(raw, SOCIAL_REPLACEMENTS);
          return `Real talk for a second...\n\n${capitalize(replaced)}\n\nBuilding in public means keeping it 100% transparent. More soon! 🚀`;
        }
      },
      v3: {
        label: "Snappy Post / Tweet",
        note: "Punchy, punchline-driven short form",
        transform: (raw) => {
          const replaced = applyReplacements(raw, SOCIAL_REPLACEMENTS);
          const firstSentence = splitIntoSentences(replaced)[0] || replaced;
          return `${capitalize(stripTrailingPunctuation(firstSentence))} ✨\n\nRT if you agree or bookmark this for later! 📌`;
        }
      }
    }
  };

  const state = {
    activeTone: 'executive',
    inputText: ''
  };

  const elements = {
    sourceText: document.getElementById('source-text'),
    inputWords: document.getElementById('input-words'),
    inputChars: document.getElementById('input-chars'),
    pasteBtn: document.getElementById('paste-btn'),
    clearBtn: document.getElementById('clear-btn'),
    transformBtn: document.getElementById('transform-btn'),
    tonePills: document.querySelectorAll('.tone-pill'),
    activeToneSubtitle: document.getElementById('active-tone-subtitle'),
    sampleChips: document.querySelectorAll('.sample-chip'),
    
    labelV1: document.getElementById('label-v1'),
    noteV1: document.getElementById('note-v1'),
    textV1: document.getElementById('text-v1'),
    wordsV1: document.getElementById('words-v1'),
    charsV1: document.getElementById('chars-v1'),
    deltaV1: document.getElementById('delta-v1'),

    labelV2: document.getElementById('label-v2'),
    noteV2: document.getElementById('note-v2'),
    textV2: document.getElementById('text-v2'),
    wordsV2: document.getElementById('words-v2'),
    charsV2: document.getElementById('chars-v2'),
    deltaV2: document.getElementById('delta-v2'),

    labelV3: document.getElementById('label-v3'),
    noteV3: document.getElementById('note-v3'),
    textV3: document.getElementById('text-v3'),
    wordsV3: document.getElementById('words-v3'),
    charsV3: document.getElementById('chars-v3'),
    deltaV3: document.getElementById('delta-v3')
  };

  function countWords(str) {
    if (!str) return 0;
    const matches = str.trim().match(/[\w'-]+/g);
    return matches ? matches.length : 0;
  }

  function countChars(str) {
    if (!str) return 0;
    return str.length;
  }

  function calculateDelta(originalCount, newCount) {
    if (!originalCount) return '0%';
    const delta = Math.round(((newCount - originalCount) / originalCount) * 100);
    return delta > 0 ? `+${delta}%` : `${delta}%`;
  }

  function render() {
    const rawText = elements.sourceText.value || '';
    state.inputText = rawText;

    const inWords = countWords(rawText);
    const inChars = countChars(rawText);
    elements.inputWords.textContent = inWords;
    elements.inputChars.textContent = inChars;

    const toneConfig = TRANSFORMERS[state.activeTone];
    if (!toneConfig) return;

    elements.activeToneSubtitle.textContent = toneConfig.subtitle;

    elements.labelV1.textContent = toneConfig.v1.label;
    elements.noteV1.innerHTML = toneConfig.v1.note;
    elements.labelV2.textContent = toneConfig.v2.label;
    elements.noteV2.innerHTML = toneConfig.v2.note;
    elements.labelV3.textContent = toneConfig.v3.label;
    elements.noteV3.innerHTML = toneConfig.v3.note;

    if (!rawText.trim()) {
      elements.textV1.textContent = '';
      elements.textV2.textContent = '';
      elements.textV3.textContent = '';
      elements.wordsV1.textContent = '0 words';
      elements.charsV1.textContent = '0 chars';
      elements.deltaV1.textContent = '0%';
      elements.wordsV2.textContent = '0 words';
      elements.charsV2.textContent = '0 chars';
      elements.deltaV2.textContent = '0%';
      elements.wordsV3.textContent = '0 words';
      elements.charsV3.textContent = '0 chars';
      elements.deltaV3.textContent = '0%';
      return;
    }

    const out1 = toneConfig.v1.transform(rawText);
    const out2 = toneConfig.v2.transform(rawText);
    const out3 = toneConfig.v3.transform(rawText);

    elements.textV1.textContent = out1;
    elements.textV2.textContent = out2;
    elements.textV3.textContent = out3;

    const w1 = countWords(out1);
    const c1 = countChars(out1);
    elements.wordsV1.textContent = `${w1} words`;
    elements.charsV1.textContent = `${c1} chars`;
    elements.deltaV1.textContent = calculateDelta(inWords, w1);

    const w2 = countWords(out2);
    const c2 = countChars(out2);
    elements.wordsV2.textContent = `${w2} words`;
    elements.charsV2.textContent = `${c2} chars`;
    elements.deltaV2.textContent = calculateDelta(inWords, w2);

    const w3 = countWords(out3);
    const c3 = countChars(out3);
    elements.wordsV3.textContent = `${w3} words`;
    elements.charsV3.textContent = `${c3} chars`;
    elements.deltaV3.textContent = calculateDelta(inWords, w3);
  }

  function setupEventListeners() {
    let debounceTimer;
    elements.sourceText.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(render, 150);
    });

    elements.sourceText.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        render();
      }
    });

    elements.transformBtn.addEventListener('click', render);

    elements.clearBtn.addEventListener('click', () => {
      elements.sourceText.value = '';
      render();
      elements.sourceText.focus();
    });

    elements.tonePills.forEach(pill => {
      pill.addEventListener('click', () => {
        elements.tonePills.forEach(p => {
          p.classList.remove('active');
          p.setAttribute('aria-checked', 'false');
        });
        pill.classList.add('active');
        pill.setAttribute('aria-checked', 'true');
        state.activeTone = pill.getAttribute('data-tone');
        render();
      });
    });

    elements.sampleChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const sampleKey = chip.getAttribute('data-sample');
        if (SAMPLE_PRESETS[sampleKey]) {
          elements.sourceText.value = SAMPLE_PRESETS[sampleKey];
          render();
        }
      });
    });
  }

  function init() {
    setupEventListeners();
    elements.sourceText.value = SAMPLE_PRESETS.launch;
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
