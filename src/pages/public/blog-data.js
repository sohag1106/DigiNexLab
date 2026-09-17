// Blog articles — real, genuinely useful content targeting the questions
// buyers in our target cities actually search. Each post links to the city
// page it supports (the hub-and-spoke pattern: spokes feed the hub).

export const POSTS = [
  {
    slug: 'website-cost-oman',
    tag: 'Pricing',
    date: '2026-09-17',
    readMins: 7,
    title: 'How Much Does a Website Cost in Oman? (2026 Price Guide)',
    description:
      'Real 2026 prices for websites in Oman: company sites, e-commerce and booking portals — in OMR, from a team that builds for Omani companies. What changes the price and where to save.',
    // Long-form body — each block renders in CityPage/blog renderer.
    body: [
      ['p', 'Ask three agencies what a website costs in Oman and you\'ll get three wildly different numbers: 150 OMR from a freelancer, 3,000 OMR from a Muscat agency, 10,000 OMR from a Gulf branch of an international firm. All three can be "right" — because they\'re selling different things. This guide gives you real 2026 prices in OMR, from a team that builds websites for Omani companies every week, and explains exactly what moves the price up or down.'],
      ['h2', 'The short answer'],
      ['table',
        ['Website type', 'Typical price (OMR)', 'Timeline'],
        ['Professional company website (bilingual AR/EN)', '300 – 700', '2–3 weeks'],
        ['E-commerce store with online payment', '700 – 1,500', '4–6 weeks'],
        ['Booking / client portal system', '800 – 1,500', '4–8 weeks'],
        ['Custom web application', '1,500+', '8+ weeks'],
      ],
      ['p', 'If a quote lands far below these ranges, something is missing: usually original design, mobile speed, Arabic support, or post-launch help. If it lands far above, you\'re paying for an office in Al Khuwair, not a better website.'],
      ['h2', 'What actually changes the price'],
      ['h3', '1. Design: template vs. original'],
      ['p', 'A template site (pick a pre-made design, swap your logo and text) costs a fraction of an original one. It can be the right choice for a new business testing the water. But in competitive markets — hotels, clinics, real estate — customers recognize templates instantly, and the site quietly costs you trust. Original design means someone sketches *your* customer\'s journey from scratch: that\'s where most of the price difference lives.'],
      ['h3', '2. Languages: Arabic, English or both'],
      ['p', 'A serious Oman website is bilingual. Done properly, that\'s not "translate the text" — it\'s a mirrored layout (right-to-left Arabic), Arabic typography that doesn\'t look like a default font, and separate SEO so you rank in both languages. Budget for it: bilingual adds roughly 30–40% over a single-language site.'],
      ['h3', '3. What the website has to *do*'],
      ['p', 'A brochure site shows. A working site does: booking, online payment, client accounts, quotation builders, integration with your billing or inventory system. Every "does" adds design, development and testing time. The portal we built for a facility-management company in Oman — complaints, approvals, technician dispatch, billing — is a different species from a five-page company site, and it\'s priced like it.'],
      ['h3', '4. Who builds it'],
      ['p', 'A freelancer is cheapest and can be great for simple sites — if you find a good one, and if they\'re still around in year two. A local agency gives you meetings and accountability. A remote senior team (like us) gives you agency-grade engineering without agency overhead. The dangerous option is the cheapest one that disappears: every year, businesses pay twice because the first developer vanished with their domain and their passwords.'],
      ['h2', 'The hidden costs nobody quotes you'],
      ['ul', [
        '**Domain and hosting:** 15–40 OMR/year — trivial, but register the domain in *your* name, not the developer\'s.',
        '**Email:** professional email on your domain, ~1–3 OMR/month per inbox.',
        '**Maintenance:** updates, backups, security patches, small changes — expect 15–60 OMR/month on a care plan, or pay hourly when needed.',
        '**Content:** photos and real text. Stock photos scream "template"; ten good photos of your real team, shop or work cost one afternoon and win customers.',
      ]],
      ['h2', 'How to get a fair price (a 5-point checklist)'],
      ['ol', [
        'Ask what\'s *not* included. The gap between quotes is usually hiding here.',
        'Ask who owns the domain, hosting account and code when it\'s done. Answer must be: you.',
        'Ask to see two live sites they built in Oman in the last year — not screenshots.',
        'Ask how speed is handled. The site should load in under 2 seconds on a phone on 4G. This is a quote question, not a technical question.',
        'Ask what happens after launch — response time, monthly cost, what\'s covered.',
      ]],
      ['p', 'Run those five questions on any quote — including ours. Good builders love specific questions; it\'s how serious clients tell themselves apart.'],
      ['h2', 'What we charge (transparently)'],
      ['p', 'BrightSkyIT builds for Omani companies at the market rates above — fixed quotes in OMR, agreed before work starts, with a milestone plan you can hold us to. Our Oman practice is anchored in real local work: we built and run the website, client portal and app of Quick Solution Oman, a leading facility-management company serving all of Oman.'],
      ['cta', 'web-design-muscat'],
    ],
  },
  {
    slug: 'why-omani-businesses-need-bilingual-websites',
    tag: 'Strategy',
    date: '2026-09-17',
    readMins: 5,
    title: 'Why Omani Businesses Need Arabic + English Websites (Not Just English)',
    description:
      'Most Omani customers search in Arabic — and Google ranks Arabic pages differently. Why bilingual Arabic/English websites win in Oman, and how to build one properly.',
    body: [
      ['p', 'Here\'s an experiment that takes ninety seconds: search Google — in Arabic — for any service in your city: "شركة تصميم مواقع في مسقط". Look at who ranks. Now search the same thing in English. The results are almost completely different websites. That gap is the single most misunderstood opportunity in Oman\'s online market.'],
      ['h2', 'Most of your customers\' Google searches are in Arabic'],
      ['p', 'Omanis search in Arabic — for services, for prices, for "near me" — even when they read English perfectly well. English-only websites simply don\'t appear in those Arabic results. Every day an Omani business runs an English-only site, it is invisible to a large share of the customers actively looking for exactly what it sells.'],
      ['h2', '"Google Translate" is not an Arabic website'],
      ['p', 'The common workaround — a translate button bolted onto an English site — fails customers in ways they feel immediately:'],
      ['ul', [
        'Arabic renders **left-to-right**, breaking menus, forms and layouts designed for English. Text overlaps; buttons stop making sense.',
        'Machine translation produces stiff, unnatural Arabic that reads as unprofessional — the opposite of the trust a services business needs.',
        'Google indexes the raw English page; the translated overlay rarely ranks, so you still don\'t appear in Arabic searches.',
      ]],
      ['p', 'A *built* bilingual site is different from the first sketch: two designed layouts (not one mirrored by a script), real Arabic typography, and separate Arabic pages with their own titles and metadata that Google can rank.'],
      ['h2', 'The business case, in one paragraph'],
      ['p', 'A bilingual site doubles the searches you can appear in — Arabic *and* English — while every English-only competitor fights over half the market with a site that looks like everyone else\'s. For most Omani service businesses, Arabic-first design isn\'t a feature; it\'s the cheapest competitive advantage available, because most of their competitors still haven\'t done it.'],
      ['h2', 'What "bilingual done right" includes'],
      ['ul', [
        'A full Arabic layout designed RTL from the start — menu, forms, buttons, numbers.',
        'Arabic typography chosen for screens (not a print font), readable on phones.',
        'Human-written Arabic — for most business sites, a professional translator for the ~1,500 words a site needs is a small, one-time cost.',
        'Separate URLs for Arabic and English (example.com/ar/…) so each language ranks on its own.',
        'Staff who can update content in both languages — or a care plan where we do it.',
      ]],
      ['p', 'We build bilingual sites for Omani companies as standard practice — it\'s how the web should work here. If your current site is English-only with a translate button, you already know what to ask your next developer for.'],
      ['cta', 'web-design-muscat'],
    ],
  },
]

export const byPostSlug = (slug) => POSTS.find((p) => p.slug === slug)
