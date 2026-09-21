// ————— ARTICLE FACTORY —————
// Generates 100 rankable city articles from the hand-written CITIES_100 facts.
// Every article is unique per city (facts + angle + industries + currency all
// rotate), shares only validated scaffolding (pricing tables, red flags,
// CTA), and follows one of 7 patterns so the blog never looks machine-made.

import { CITIES_100 } from './focus-data.js'
import { CITIES } from './city-data.js'

const YEAR = '2026'
const BASE_DATE = '2026-09-17' // first article publish date

// Target hubs that already exist in city-data.js — the article CTA must point
// at an existing hub or the CTA block renders nothing.
const EXISTING_HUBS = CITIES.map((c) => c.slug)
// Fallback hub per country/region when the city's own hub isn't live yet.
const FALLBACK_HUB = (c) =>
  c.cc === 'OM' ? 'web-design-muscat' : 'web-design-dubai'

function ctaSlug(c) {
  // Explicit override wins (e.g. Sohar-inner → the live Sohar hub).
  if (c.ctaTo) return c.ctaTo
  return EXISTING_HUBS.includes(c.slug) ? c.slug : FALLBACK_HUB(c)
}

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const name = (c) => c.slugCity || c.city

// Genuinely different intro per city — grows from the hand-written facts.
function sentence(s) {
  return s.trim().replace(/[.\s]+$/, '') + '.'
}
function intro(c) {
  return [
    'p',
    `${sentence(c.facts[0])} ${sentence(c.facts[1])} And the detail most web-design teams miss: ${sentence(c.facts[2])}`,
  ]
}

const SHORT_ANSWER = (c) => ['h2', `What a website costs in ${name(c)} (${YEAR})`]
const PRICE_ROW = (c) => {
  const [basic, elevated, custom] = c.price.split(';')
  return ['table',
    ['What you need', `Typical price (${c.cur})`, 'What it takes'],
    ['Professional company website (bilingual AR/EN)', basic || 'from ' + c.price, '2–4 weeks'],
    ['E-commerce / booking site', elevated || 'custom', '4–8 weeks'],
    ['Custom web application or portal', custom || 'custom', '8+ weeks'],
  ]
}

const CHECKLIST = (c) => [
  'ol',
  [
    `Ask to see two live websites built for ${name(c)} or Gulf clients in the last year — not screenshots.`,
    'Ask who owns the domain, hosting and code at launch: the only correct answer is you.',
    'Test the site on a phone on 4G: under two seconds, or "speed" is an extra.',
    "Ask what's included — pages, languages, features — and what isn't.",
    'Ask what happens after launch: response time, monthly cost, what\'s covered.',
  ],
]

const RED_FLAGS = [
  'p',
  `If a supplier refuses live examples, quotes a number with no scope, registers the domain "for convenience", or guarantees "#1 on Google" — end the interview. In ${YEAR}, every serious buyer asks these questions and every serious builder answers them.`,
]

const SOCIAL = (c) => c.cur === 'OMR' || c.cur === 'AED' || c.cur === 'SAR' || c.cur === 'BHD' || c.cur === 'KWD' || c.cur === 'QAR'

const PATTERNS = [
  // 1. Cost guide — the highest-converting intent
  (c) => ({
    tag: 'Pricing',
    title: `How Much Does a Website Cost in ${name(c)}? ${YEAR} Price Guide`,
    description: `Real ${YEAR} prices for websites in ${name(c)}: company sites, e-commerce and booking systems — in ${c.cur}, for ${c.vertical}. What changes the price and where to save.`,
    body: [
      intro(c),
      SHORT_ANSWER(c),
      PRICE_ROW(c),
      ['p', `If a quote lands far below these ranges, something is missing: design, mobile speed, ${SOCIAL(c) ? 'Arabic support' : 'bilingual support'} or post-launch help. In ${name(c)}, the cheap quote is usually the one that disappears with your domain.`],
      ['h2', `Why ${name(c)} prices vary more than they should`],
      ['p', c.facts[2]],
      ['ul', [
        '**Template vs original design** — a template costs a fraction, but in competitive verticals customers recognize it instantly',
        `${SOCIAL(c) ? '**Arabic + English** — a serious site is bilingual; proper RTL design adds ~30–40% over single-language' : '**Multi-language** — one site, two or three languages, each ranking separately; this is the standard a serious build meets'}`,
        `**What the site has to do** — brochure vs booking vs client portal is the single biggest price driver`,
        '**Who builds it** — a freelancer can be great or vanish; agency-grade engineering without agency overhead is the sweet spot',
      ]],
      ['h2', 'The hidden costs nobody quotes you'],
      ['ul', [
        `**Domain and hosting:** a small yearly cost — register the domain in your name, not the developer's`,
        `**Email:** professional inboxes on your domain, a few ${c.cur} per month`,
        `**Maintenance:** updates, backups, security — a care plan of ${SOCIAL(c) ? 'roughly 1–2% of the build per month' : 'a tenth of the build per year'} beats hourly`,
        '**Content:** ten real photos of your shop, team or work win more customers than stock photography ever will',
      ]],
      ['h2', 'How to get a fair price (5-point checklist)'],
      CHECKLIST(c),
      RED_FLAGS,
      ['h2', 'What we charge (transparently)'],
      ['p', `BrightSkyIT builds for ${name(c)} businesses at the market rates above — fixed quotes in ${c.cur}, scope written out, a milestone plan we stick to. Our proof is public: the website, client portal and app of Quick Solution Oman.`],
      ['cta', ctaSlug(c)],
    ],
  }),
  // 2. Buyer's guide
  (c) => ({
    tag: 'Buyer\'s guide',
    title: `Choosing a Web Design Company in ${name(c)}: 12 Questions That Save You Money`,
    description: `The 12 questions that separate the real web design companies in ${name(c)} from cheap freelancers — scope, ownership, ${SOCIAL(c) ? 'Arabic support' : 'multi-language support'} and the red flags to check before you pay.`,
    body: [
      intro(c),
      ['h2', 'Start with proof, not promises'],
      ['p', `Ask any agency for two live websites they built for ${name(c)} or ${SOCIAL(c) ? 'Gulf' : 'regional'} clients in the last twelve months — live URLs, not screenshots. Then test them on your phone: under two seconds on 4G? ${SOCIAL(c) ? 'Works in Arabic?' : 'Reads naturally in your language?'} Would you trust the business behind it?`],
      ['h2', 'Ownership: the question that saves you the most'],
      ['p', `When the project ends, who owns the domain, hosting account and code — and where are they registered? The only acceptable answer is you, in your name. In ${name(c)}, cheaper developers often keep the domain "for convenience", and the client loses the site and its search rankings when the relationship ends.`],
      ['h2', 'The language test'],
      ['p', `${SOCIAL(c) ? 'Ask to see the Arabic version of a site they built. Many "bilingual" websites are an English site with a translate button — machine-flipped text and broken right-to-left layouts that read as unprofessional to exactly the customers who search in Arabic.' : 'Ask how a second language would be handled. Many sites bolt on a machine-translated page that Google never ranks and buyers never trust; a real multi-language build is designed per language from the start.'}`],
      ['h2', 'Twelve questions that separate real companies from cheap ones'],
      ['ol', [
        `Can you show two live sites built in the last year for ${name(c)} or the region?`,
        'Who owns the domain, hosting and code when the project ends?',
        `${SOCIAL(c) ? 'Is the site designed for Arabic and English from the start, with pages Google can rank in both?' : 'Is the site built so each language has its own rankable pages?'}`,
        'What will the site load like on a phone on 4G — under two seconds, or is speed an extra?',
        `What exactly is included for ${c.cur} — and what isn't?`,
        'Templates or original design — which is this quote for?',
        'Who writes the text? Who takes or sources the photos?',
        'Can you connect the site to our billing, inventory or booking systems?',
        'What happens after launch — response time, what\'s covered, monthly cost?',
        'Can we meet the people actually building the site?',
        'What do you need from us, and when, to hit the deadline?',
        'May we speak to one previous client?',
      ]],
      ['p', 'A serious company loves these questions — they\'re how serious clients identify themselves.'],
      ['h2', 'Red flags: end the interview if you hear these'],
      ['ul', [
        '"We\'ll build it first, pay later" — companies that work on spec fold mid-project',
        'Guaranteed #1 on Google — nobody controls Google',
        'No live examples, only "concepts" or screenshots',
        'Price with no scope — a number without scope is a number you can\'t compare',
        'The domain registered in their name "for convenience"',
      ]],
      ['h2', 'What a good quote looks like'],
      ['p', `A professional quote is readable in two minutes and contains: fixed price in ${c.cur}, what's included, the timeline with milestones, who owns what at launch, and what happens after launch. Compare on that basis and the "expensive" option is often the only real one.`],
      ['h2', 'How we answer these questions'],
      ['p', `BrightSkyIT builds for ${name(c)} businesses at fixed ${c.cur} prices with the scope written out, and hands over every credential at launch. Our work is public: the website, client portal and app of Quick Solution Oman — live, real names, checkable.`],
      ['cta', ctaSlug(c)],
    ],
  }),
  // 3. Arabic / multi-language guide
  (c) => ({
    tag: 'Strategy',
    title: SOCIAL(c)
      ? `Arabic + English or Just English? The Real Cost of an Arabic Website in ${name(c)}`
      : `Internet in ${name(c)}: Rank Where Your Customers Actually Search`,
    description: SOCIAL(c)
      ? `How bilingual Arabic/English websites win in ${name(c)}: why most of your customers search in Arabic, why "Google Translate" isn't a website, and what the RTL build really costs.`
      : `How websites win in ${name(c)}: which searches your customers really make, why machine translation fails you, and the two-language build that ranks in both.`,
    body: [
      intro(c),
      ['h2', 'The ninety-second experiment that shows the gap'],
      ['p', SOCIAL(c)
        ? `Search Google in Arabic for any service in ${name(c)}: "${c.cur === 'OMR' ? 'شركة تصميم مواقع في مسقط' : 'شركة تصميم مواقع'}" Now search the same thing in English. The results are almost completely different websites. An English-only ${name(c)} business is invisible to the customers actively searching in Arabic.`
        : `Search Google for your service in ${name(c)} in each language your customers speak. For most cities on this list, the two result pages are almost completely different — different companies, different winners. Rank one language only and you are invisible to the other half of the market.`],
      ['h2', '"Google Translate" is not a website'],
      ['p', 'The translate-button workaround fails in ways customers feel immediately:'],
      ['ul', [
        'Machine translation reads stiff and unprofessional — the opposite of trust',
        'Layouts break: RTL for Arabic, accents and widths for other scripts',
        'Google indexes the source page; the overlay rarely ranks, so you still don\'t appear in the other language\'s results',
      ]],
      ['h2', 'The business case, in one paragraph'],
      ['p', SOCIAL(c)
        ? `A bilingual site doubles the searches you can appear in — Arabic and English — while every single-language competitor in ${name(c)} fights over half the market. For most ${name(c)} service businesses, Arabic-first design is the cheapest competitive advantage available.`
        : `A multilingual site doubles or triples the searches you can appear in, while competitors who never bothered stay invisible in the other language's results. For most ${name(c)} businesses, this is the cheapest competitive advantage available.`],
      ['h2', 'What "done right" includes'],
      ['ul', [
        'A layout designed for each language from the start — direction, typography, forms, numbers',
        'Typography chosen for screens, readable on phones',
        'Human-written copy per language — a professional translation of the ~1,500 words a site needs is a one-time cost',
        'Separate URLs per language so each ranks on its own',
        'Staff who can update content in both languages — or a care plan where we do it',
      ]],
      ['h2', 'What it costs to do it properly'],
      PRICE_ROW(c),
      ['p', `The multi-language premium is usually 30–40% over a single-language build. Skipping it costs more: you stay invisible in ${SOCIAL(c) ? 'Arabic' : 'the other'} search while competitors who built it properly take the calls.`],
      ['h2', `Do you need it in ${name(c)}?`],
      ['p', `If your customers in ${name(c)} live, shop and search in the local language — yes. If you sell exclusively to expatriate or English-first companies — maybe. Most businesses here need both. We build bilingual sites as standard, because that's how the ${name(c)} market works.`],
      ['cta', ctaSlug(c)],
    ],
  }),
  // 4. Freelancer vs agency
  (c) => ({
    tag: 'Buyer\'s guide',
    title: `Freelancer vs Web Design Agency in ${name(c)}: An Honest Comparison for ${YEAR}`,
    description: `Freelancer or web design agency in ${name(c)}? The honest trade-offs on price, reliability, ${SOCIAL(c) ? 'bilingual support' : 'multi-language support'} and ownership — and the questions that reveal the difference before you pay.`,
    body: [
      intro(c),
      ['h2', 'The honest trade-offs'],
      ['table',
        ['Factor', 'Freelancer', 'Agency / senior team'],
        ['Price', 'Lowest — ideal for a very simple site', `Moderate-to-premium — you pay for process and accountability`],
        ['Reliability', 'Wide variance — if they vanish, your domain may go with them', 'Contract, milestones, a company that still exists in year two'],
        ['Language', SOCIAL(c) ? 'Rarely done properly' : 'Rarely done properly', 'Built per language from the start, each ranking separately'],
        ['After launch', 'Usually hourly, if reachable', 'Care plans, response times, something you can hold to account'],
      ],
      ['h2', 'When a freelancer is the right call'],
      ['p', `A freelancer is right when you need a simple site quickly, your budget is tiny, and you can handle updates yourself. Plenty of ${name(c)} businesses run perfectly well on one. If you find a good one — keep credentials in your name, keep backups — it can be a great deal.`],
      ['h2', 'When an agency is the right call'],
      ['p', `Choose an agency or senior team when the website has to actually work: bookings, payments, client accounts, ${SOCIAL(c) ? 'bilingual Arabic/English' : 'multiple languages'}, speed at the level Google ranks. That's when the freelancer's discount is the most expensive thing you can buy — because you pay twice when they disappear.`],
      ['h2', 'The questions that reveal the difference'],
      CHECKLIST(c),
      ['h2', 'The ownership trap, again'],
      ['p', `Whichever you choose, the domain, hosting and code must be yours. It's the one question that saves the most money in ${name(c)} — because rebuilds cost more than the original build.`],
      ['h2', 'Where we sit'],
      ['p', `BrightSkyIT is a senior remote team: agency-grade engineering at sharper prices, fixed ${c.cur} quotes, a real company with public work (the Quick Solution Oman site, portal and app). We're happy to be compared against whoever you're deciding between.`],
      ['cta', ctaSlug(c)],
    ],
  }),
  // 5. Best ideas for the city's industries (listicle — of ideas, never agencies)
  (c) => ({
    tag: 'Ideas',
    title: `${c.industries.length} Web Design Ideas That Win Customers in ${name(c)}`,
    description: `Web design ideas that actually work for ${c.industries.slice(0, 2).join(' and ')} in ${name(c)} — what to build, what to skip, and the pages that turn visitors into customers.`,
    body: [
      intro(c),
      ['h2', `The highest-intent pages for ${name(c)} businesses`],
      ...c.industries.slice(0, 3).map((ind) => [
        ['h3', `For ${ind}`],
        ['p', `The website for ${ind} in ${name(c)} wins when it answers the buyer's real question on the first screen, shows genuine local proof (photos, projects, a named customer), and makes the next step obvious — ${SOCIAL(c) ? 'WhatsApp, booking' : 'booking, quote'} or contact form. Skip the generic "we do everything" home page; build the page ${ind} buyers actually search for.`],
      ]).flat(),
      ['h2', 'The 30-second credibility audit'],
      ['ul', [
        'Loads in under 2 seconds on a phone on 4G',
        'Real photos — of your team, your work, your city — not stock',
        `${SOCIAL(c) ? 'Arabic and English that both read naturally' : 'Each language reading naturally, not machine-translated'}`,
        'A clear next step above the fold: WhatsApp, call, quote',
        'Your real address and phone — businesses without one are filtered out',
      ]],
      ['h2', `What ${name(c)} buyers are really searching`],
      ['p', `${c.facts[0]} ${c.facts[1]}`],
      ['h2', 'Build for the search, not just the look'],
      ['p', `Every page should target one search a ${name(c)} buyer makes: "your service + ${name(c)}". The city is the keyword — so the page that mentions it naturally, in real context, wins. That's the difference between a website and a page that gets found.`],
      ['h2', `Who builds working sites in ${name(c)}`],
      ['p', `We build the pages above for ${name(c)} businesses at fixed ${c.cur} prices — original design, ${SOCIAL(c) ? 'bilingual by default' : 'multi-language by default'}, speed and local-search groundwork included. Public proof: the website, portal and app of Quick Solution Oman.`],
      ['cta', ctaSlug(c)],
    ],
  }),
  // 6. The ROI pitch per city's dominant vertical
  (c) => ({
    tag: 'Strategy',
    title: `Why Businesses in ${name(c)} Need a Website That Does More Than Look Nice`,
    description: `A website that only looks nice loses to one that works. What ${name(c)}'s ${c.vertical} companies need their site to actually do — and what it costs.`,
    body: [
      intro(c),
      ['h2', 'The 3 features that pay for the website'],
      ['ol', c.industries.slice(0, 3).map((ind, i) => `For ${ind} in ${name(c)}: ${c.facts[i % c.facts.length]}`)],
      ['p', `Each of those is a search someone makes in ${name(c)} every week. A site that answers it, proves it and converts it is the difference between being found and being invisible.`],
      ['h2', 'What "more than look nice" means, concretely'],
      ['ul', [
        'A homepage that names the customer\'s problem in their language',
        'A booking, quote or WhatsApp flow that turns visitors into leads — not a contact page that dead-ends',
        'Speed and mobile layouts that pass the tests Google uses to rank',
        `${SOCIAL(c) ? 'Bilingual Arabic/English for the two searches your customers actually make' : 'The second language handled properly for the searches you lose today'}`,
      ]],
      ['h2', `What it costs in ${name(c)}`],
      PRICE_ROW(c),
      ['h2', 'The hidden cost of a "nice" website'],
      ['p', `A site that looks nice but doesn't convert is still costing you: every visitor who can't book, can't reach you, or can't trust you. For ${name(c)}'s ${c.vertical}, that quiet leak is larger than the build price.`],
      ['h2', `Who builds working sites in ${name(c)}`],
      ['p', `BrightSkyIT builds for ${name(c)} businesses at fixed ${c.cur} prices, and our own work is public — the website, client portal and app of Quick Solution Oman prove we build for real use, not portfolios.`],
      ['cta', ctaSlug(c)],
    ],
  }),
  // 7. Local SEO playbook
  (c) => ({
    tag: 'Strategy',
    title: `How to Rank on Google in ${name(c)}: A Practical Local SEO Guide`,
    description: `How small businesses in ${name(c)} rank on Google in ${YEAR}: the local keywords that actually convert, the pages to build, and the free groundwork (Google Business Profile, reviews, ${SOCIAL(c) ? 'Arabic search' : 'the local language'}) most competitors skip.`,
    body: [
      intro(c),
      ['h2', 'The two result sets fighting for your customers'],
      ['p', SOCIAL(c)
        ? `In ${name(c)}, the Arabic results and the English results are almost completely different websites — so ranking in just one language leaves half the market to competitors you never see.`
        : `In ${name(c)}, your customers search in more than one language — and the result sets barely overlap. Ranking in one leaves the other to competitors you never see.`],
      ['h2', 'The free groundwork most businesses skip'],
      ['ul', [
        `**Google Business Profile** — set as a service-area business serving ${name(c)}; this is the single fastest local-ranking win`,
        '**Reviews** — ten good reviews outrank a prettier website with none',
        `**Consistent name/address/phone** across Google, your site and directories — inconsistency kills local rank`,
        '**Request indexing** on new pages via Google Search Console',
      ]],
      ['h2', 'The pages to build'],
      ['ul', [
        `A home/service page that targets one real search: "the service + ${name(c)}"`,
        'A local page per neighbourhood or suburb',
        'A "how much" or "how to choose" page that captures buying questions',
        `Separate-language URLs so the ${SOCIAL(c) ? 'Arabic' : 'local-language'} searches rank too`,
      ]],
      ['h2', 'What actually moves local rankings'],
      ['ol', [
        'A fast, mobile, secure website (Core Web Vitals)',
        'Real local content — city names, neighbourhoods, projects, a named client',
        'Local reviews and a verified Business Profile',
        'Links from genuinely local places you already serve',
      ]],
      ['h2', `How long it takes in ${name(c)}`],
      ['p', `Honestly: weeks for a new page in low-competition categories, months for competitive ones. The shortcut isn't tricks — it's building the right pages early and consistently, which is exactly the hub-and-spoke pattern we use for our own clients.`],
      ['h2', 'Where we fit'],
      ['p', `BrightSkyIT builds ${SOCIAL(c) ? 'bilingual' : 'multi-language'} websites engineered for local rank at fixed ${c.cur} prices, and every build ships with the search groundwork above. Public proof: the website, portal and app of Quick Solution Oman.`],
      ['cta', ctaSlug(c)],
    ],
  }),
]

// Deterministic pattern per city (stable across builds, varied across cities).
function pick(c) {
  let seed = 0
  for (const ch of c.slug) seed = (seed * 31 + ch.charCodeAt(0)) % 997
  return seed % PATTERNS.length
}

// PUBLIC API — used by blog-data.js through serial-block.js for paging.
export function buildCityArticles(limit = CITIES_100.length) {
  return CITIES_100.slice(0, limit).map((c, i) => {
    const fn = PATTERNS[pick(c)]
    const art = fn(c)
    const d = new Date(BASE_DATE)
    d.setUTCDate(d.getUTCDate() + i)
    const pname = pick(c)
    return {
      slug: `${slugify(c.slug)}-${['cost', 'choose', 'language', 'freelancer', 'ideas', 'roi', 'seo'][pname]}`,
      tag: art.tag,
      date: d.toISOString().slice(0, 10),
      readMins: 7,
      title: art.title,
      description: art.description,
      city: name(c),
      body: art.body,
    }
  })
}