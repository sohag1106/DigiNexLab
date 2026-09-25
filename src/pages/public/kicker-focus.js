// ----- ARTICLE FACTORY -----
// Generates 100 rankable city articles from the hand-written CITIES_100 facts.
// Every article is unique per city (facts + angle + industries + currency all
// rotate), shares only validated scaffolding (pricing tables, red flags,
// CTA), and follows one of 7 patterns so the blog never looks machine-made.

import { CITIES_100 } from './focus-data.js'
import { CITIES } from './city-data.js'
import { waGo } from '../../lib/wa.js'

const YEAR = '2026'
const BASE_DATE = '2026-09-17' // first article publish date

// Target hubs that already exist in city-data.js, the article CTA must point
// at an existing hub or the CTA block renders nothing.
const EXISTING_HUBS = CITIES.map((c) => c.slug)
// Fallback hub per country/region when the city's own hub isn't live yet.
const FALLBACK_HUB = (c) =>
  c.cc === 'OM' ? 'web-design-muscat' : 'web-design-dubai'

function ctaSlug(c) {
  // Explicit override wins (e.g. Sohar-inner to the live Sohar hub).
  if (c.ctaTo) return c.ctaTo
  return EXISTING_HUBS.includes(c.slug) ? c.slug : FALLBACK_HUB(c)
}

function slugify(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const name = (c) => c.slugCity || c.city

// Per-city WhatsApp prefill: the message the customer sees when they tap any
// WhatsApp CTA on this city's content. City + a starter question that reads
// like a real enquiry. This is what turns "found us in search" into a message.
export function waMessage(c, context = 'website') {
  const n = name(c)
  const vertical = c.vertical.split(',')[0].trim()
  return `Hi BrightSkyIT! I'm in ${n} and I need a ${context} for our ${vertical} business. Can you send me a fixed quote in ${c.cur}?`
}
export const waText = (c, context = 'website') => encodeURIComponent(waMessage(c, context))

// Clicks go through the /go/wa tracker (Pages Function) which logs city +
// page + placement, then 302s to the same wa.me chat with this prefill.
// `page` is the article's own path, baked in at build time so the prerendered
// HTML attributes the tap correctly even before React runs.
export const waLink = (c, context, page) =>
  waGo({ city: c.slug, page, placement: 'article-strip', text: waMessage(c, context) })

// WhatsApp strip block rendered right under the intro: one tappable line that
// sends a city-specific enquiry. This is what turns "found us in search" into
// a message that already contains city + vertical + currency.
export function waBlock(c, context = 'website', page) {
  return ['wa', { url: waLink(c, context, page), label: `Get a ${name(c)} price on WhatsApp` }]
}

const COUNTRY = {
  OM: 'Oman', AE: 'UAE', SA: 'Saudi Arabia', BH: 'Bahrain', QA: 'Qatar', KW: 'Kuwait',
  PK: 'Pakistan', BD: 'Bangladesh', NP: 'Nepal', LK: 'Sri Lanka', IN: 'India',
  EG: 'Egypt', JO: 'Jordan', LB: 'Lebanon', MA: 'Morocco', TN: 'Tunisia', KE: 'Kenya',
  GH: 'Ghana', TR: 'Turkey', MV: 'Maldives', GB: 'UK', US: 'USA', CA: 'Canada',
  AU: 'Australia', NZ: 'New Zealand', SG: 'Singapore', MY: 'Malaysia', VN: 'Vietnam',
  PH: 'Philippines', ZA: 'South Africa', IE: 'Ireland',
}

// Deterministic three related cities: same country first, then anywhere.
function relatedCities(c, all) {
  let seed = 0
  for (const ch of c.slug) seed = (seed * 31 + ch.charCodeAt(0)) % 997
  const same = all.filter((x) => x.cc === c.cc && x.slug !== c.slug)
  const rest = all.filter((x) => x.cc !== c.cc && x.slug !== c.slug)
  const out = []
  let k = 0
  while (out.length < 3 && k < 80) {
    const pool = out.length < 3 && same.length ? same : rest
    if (!pool.length) break
    const cand = pool[(seed + k * 11) % pool.length]
    if (!out.includes(cand)) out.push(cand)
    k++
  }
  return out
}

// Genuinely different intro per city, grows from the hand-written facts.
// Written like a person who knows the place, not a template.
function sentence(s) {
  return s.trim().replace(/[.\s]+$/, '') + '.'
}
function intro(c) {
  return [
    'p',
    `${sentence(c.facts[0])} ${sentence(c.facts[1])} Most teams miss this part about ${name(c)} though: ${sentence(c.facts[2].charAt(0).toLowerCase() + c.facts[2].slice(1))}`,
  ]
}

const SHORT_ANSWER = (c) => ['h2', `What you will actually pay in ${name(c)} (${YEAR})`]
const PRICE_ROW = (c) => {
  const [basic, elevated, custom] = c.price.split(';')
  return ['table',
    ['What you need', `Typical price (${c.cur})`, 'How long it takes'],
    ['Professional company website (bilingual AR/EN)', basic || 'from ' + c.price, '2 to 4 weeks'],
    ['E-commerce or booking site', elevated || 'custom', '4 to 8 weeks'],
    ['Custom web app or portal', custom || 'custom', '8 weeks plus'],
  ]
}

const CHECKLIST = (c) => [
  'ol',
  [
    `Ask to see two live sites they built for ${name(c)} or nearby Gulf clients in the last year. Not screenshots, real links you can open on your phone.`,
    'Ask who will own the domain, hosting and code on day one. The right answer is always you, in your name.',
    'Open their example site on your phone on 4G. If it does not load in under two seconds, speed is an extra they did not include.',
    "Ask what is actually included. Pages, languages, features, and what costs extra later.",
    'Ask what happens after launch. How fast do they reply, what is covered each month, and what is not.',
  ],
]

const RED_FLAGS = [
  'p',
  `If they cannot show you a live site, give you a price with no scope, want the domain in their name for convenience, or promise you number one on Google, just walk away. In ${YEAR} every serious buyer asks harder questions, and every good builder is happy to answer them.`,
]

const SOCIAL = (c) => c.cur === 'OMR' || c.cur === 'AED' || c.cur === 'SAR' || c.cur === 'BHD' || c.cur === 'KWD' || c.cur === 'QAR'

const PATTERNS = [
  // 1. Cost guide, the highest-converting intent
  (c) => ({
    tag: 'Pricing',
    title: `How Much Does a Website Cost in ${name(c)}? ${YEAR} Price Guide`,
    description: `Real ${YEAR} prices for websites in ${name(c)}: what a company site, online store or booking system costs in ${c.cur}, what pushes the price up, and where you can save without getting burned.`,
    body: [
      intro(c),
      SHORT_ANSWER(c),
      PRICE_ROW(c),
      ['p', `Seen a 150 ${c.cur} offer and a 1,200 ${c.cur} offer for what sounds like the same website? Neither is lying. They are just selling different things. The cheap one usually skipped original design, mobile speed, ${SOCIAL(c) ? 'proper Arabic support' : 'proper multi language work'} or any help after launch. In ${name(c)} that cheap quote is often the one that disappears with your domain a year later.`],
      ['h2', `Why everyone in ${name(c)} quotes you a different number`],
      ['p', `${sentence(c.facts[2])} That is why the same brief can come back at three different prices. Here is what usually moves it:`],
      ['ul', [
        '**Template or original design:** a template is cheaper, but customers in competitive markets spot it in seconds. Original design costs more because someone plans your customer journey from scratch.',
        `${SOCIAL(c) ? '**Arabic and English:** a real bilingual site is not a translate button. Proper RTL layout and Arabic type adds about 30 to 40 percent, and it is why you show up in Arabic searches at all.' : '**Two or three languages done right:** one site that ranks separately in each language. That takes real layout and translation work, not a plugin.'}`,
        `**What the site actually has to do:** a brochure site just shows. A booking site or portal has to work, payments, accounts, approvals, and every working part adds time and testing.`,
        '**Who builds it:** a good freelancer can be great value and can also vanish. A senior team costs more than the cheapest freelancer but less than a big agency, and you get a contract and people who are still there next year.',
      ]],
      ['h2', 'The costs nobody puts in the first quote'],
      ['ul', [
        `**Domain and hosting:** not much per year, but make sure the domain is registered in your name, not your developers.`,
        `**Email on your domain:** a few ${c.cur} per inbox per month. Small, but ask so it is not a surprise.`,
        `**Care and updates:** backups, security patches, small changes. A simple care plan, about one or two percent of the build per month, is cheaper than paying by the hour later.`,
        '**Photos and words that are yours:** ten honest photos of your team, shop or job site beat any stock photos. Customers trust what they can verify.',
      ]],
      ['h2', 'A quick checklist to get a fair price'],
      CHECKLIST(c),
      RED_FLAGS,
      ['h2', 'What we would charge you in ' + name(c)],
      ['p', `We build for ${name(c)} at the prices in the table above. Fixed quote in ${c.cur}, clear scope, milestones you can hold us to. No surprises. We have done this before, our public work is the website, client portal and app for Quick Solution Oman, so you can see how we build before you ask us for a quote.`],
      ['cta', ctaSlug(c)],
    ],
  }),
  // 2. Buyer's guide
  (c) => ({
    tag: "Buyer's guide",
    title: `Choosing a Web Design Company in ${name(c)}: 12 Questions That Save You Money`,
    description: `How to tell a solid web design company in ${name(c)} from a cheap freelancer. What to ask about scope, ownership, ${SOCIAL(c) ? 'Arabic support' : 'language support'} and the warning signs to walk away from.`,
    body: [
      intro(c),
      ['h2', 'Start with proof, not promises'],
      ['p', `Ask them for two live websites they built for ${name(c)} or nearby Gulf clients in the last twelve months. You want links you can tap right now, not screenshots. Then open them on your phone. Do they load in under two seconds on 4G? ${SOCIAL(c) ? 'Can you switch to clean Arabic that actually reads right?' : 'Does the other language read like a real person wrote it?'} Would you trust that business if it was yours? Past work is the best predictor of your site.`],
      ['h2', 'The ownership question that saves you the most money'],
      ['p', `When the site is done, who owns the domain, the hosting account and the code, and whose name are they in? The only good answer is you, in your name, with logins handed over on launch day. In ${name(c)} we still see businesses lose their site and their Google rankings because a cheaper developer kept the domain for convenience and then stopped replying.`],
      ['h2', 'Try the language test'],
      ['p', `${SOCIAL(c) ? 'Ask to see the Arabic version of a site they actually built. A lot of so called bilingual sites are just an English site with a translate button. The text flips badly, forms break, and it reads like a machine wrote it. Customers who search in Arabic notice immediately. A proper bilingual build is laid out for both directions from the first sketch, with separate pages Google can rank in each language.' : 'Ask how they would handle a second language. If the plan is to machine translate the English page, you will not rank in that other language and readers will not trust it. A proper build designs and writes each language on its own.'}`],
      ['h2', 'Twelve questions worth asking before you pay anyone'],
      ['ol', [
        `Can you show me two live sites you launched in the last year for ${name(c)} or this region?`,
        'Who will own the domain, hosting and code when we are done?',
        `${SOCIAL(c) ? 'Is the site designed for Arabic and English from the start, so each can rank on Google on its own?' : 'Will each language have its own pages that can rank separately?'}`,
        'How fast will it load on a phone on 4G? Is speed included or is that an extra?',
        `What is included in this price in ${c.cur}, and what is not?`,
        'Is this a template or original design, and which one is in this quote?',
        'Who writes the words and where do the photos come from?',
        'Can you connect the site to our billing, stock or booking system if we need it?',
        'What happens after we launch? How fast do you reply, what is covered, what is the monthly cost?',
        'Can I meet the people who will actually build it?',
        'What do you need from us to hit the deadline, and when?',
        'Can I speak to one past client?',
      ]],
      ['p', 'Good companies like these questions. They show you are serious. If someone gets defensive, that tells you a lot too.'],
      ['h2', 'Five things that should make you end the meeting'],
      ['ul', [
        '"Pay us after we build it." Teams that work on spec often stop halfway.',
        '"We guarantee you number one on Google." No one can promise that. No one owns Google.',
        'No live links, only mockups or screenshots anyone could have made.',
        'A price with no scope. If you cannot see what is included, you cannot compare two quotes.',
        'They want the domain in their name. That is how people lose their website.',
      ]],
      ['h2', 'What a proper quote looks like'],
      ['p', `You should be able to read it in two minutes and know: the fixed price in ${c.cur}, what is included, the timeline with milestones, who owns what on launch day, and what support after launch actually covers. When you compare two quotes that way, the expensive one often turns out to be the only real one. The cheaper one was a template with no support and a domain in someone elses name.`],
      ['h2', 'How we would answer all twelve'],
      ['p', `We build for ${name(c)} at fixed ${c.cur} prices with the scope written down, and we hand over everything on launch. Our work is public so you can check it yourself. The website, portal and app for Quick Solution Oman are live, with real names and real users.`],
      ['cta', ctaSlug(c)],
    ],
  }),
  // 3. Arabic / multi-language guide
  (c) => ({
    tag: 'Strategy',
    title: SOCIAL(c)
      ? `Arabic and English or Just English? What an Arabic Website Really Costs in ${name(c)}`
      : `How Customers in ${name(c)} Actually Search, and How to Show Up`,
    description: SOCIAL(c)
      ? `Why bilingual Arabic and English sites win more work in ${name(c)}, why a translate button does not count as Arabic, and what a proper RTL build costs.`
      : `Why you might be invisible to half your customers in ${name(c)}, how machine translation hurts you, and what a real two language site looks like.`,
    body: [
      intro(c),
      ['h2', 'Try this for ninety seconds'],
      ['p', SOCIAL(c)
        ? `Open Google and search in Arabic for any service in ${name(c)}. Try "${c.cur === 'OMR' ? 'شركة تصميم مواقع في مسقط' : 'شركة تصميم مواقع'}" Then search the same thing in English. You will get two almost completely different sets of results. If your business in ${name(c)} is English only, you are invisible to everyone searching in Arabic, and that is a lot of people actively trying to buy.`
        : `Search for your service in ${name(c)} in each language your customers use. In most cities on this list the two result pages barely overlap. Different companies, different winners. If you only rank in one language, the other half of the market never sees you.`],
      ['h2', 'Why Google Translate is not a website'],
      ['p', 'That little translate button feels like a fix. Customers feel the difference in seconds:'],
      ['ul', [
        'The translation reads stiff and a bit off, which makes you look less trustworthy, not more.',
        'Layouts break. Arabic needs to read right to left, other scripts need their own spacing and fonts.',
        'Google mostly indexes the original English page. The translated overlay rarely ranks, so you still do not show up when people search in that other language.',
      ]],
      ['h2', 'Why bother doing it properly then'],
      ['p', SOCIAL(c)
        ? `A proper bilingual site can show up in both Arabic and English searches. Your competitors in ${name(c)} who stayed English only are fighting over half the market. For most service businesses here, adding real Arabic is the cheapest way to get ahead, because most competitors still have not done it.`
        : `A proper site in two or three languages can show up in two or three times as many searches. While competitors stay invisible in the other language, you pick up the calls they never get. For most businesses in ${name(c)} that is the easiest win available.`],
      ['h2', 'What good looks like'],
      ['ul', [
        'A layout planned for each language from day one. Direction, fonts, forms, numbers, all of it.',
        'Type that is picked for screens, not print, so it stays readable on a phone.',
        'Words a person actually wrote in that language. Translating the roughly fifteen hundred words a small site needs is a one time cost.',
        'Separate links for each language, so Google can rank each one on its own.',
        'A way for your team to update both languages, or a care plan where we do it for you.',
      ]],
      ['h2', 'What it usually costs'],
      PRICE_ROW(c),
      ['p', `Going bilingual usually adds about 30 to 40 percent to a single language build. Skipping it costs more in the long run. You stay invisible in ${SOCIAL(c) ? 'Arabic' : 'the other language'} while the competitor who did it right keeps getting the enquiries.`],
      ['h2', `Do you actually need it in ${name(c)}?`],
      ['p', `If your customers in ${name(c)} live and search in the local language, yes. If you only sell to English speaking companies or expats, maybe not. Most businesses here need both. We build bilingual as standard because that is how people in ${name(c)} actually use the web.`],
      ['cta', ctaSlug(c)],
    ],
  }),
  // 4. Freelancer vs agency
  (c) => ({
    tag: "Buyer's guide",
    title: `Freelancer or Agency in ${name(c)}? An Honest Comparison for ${YEAR}`,
    description: `Should you hire a freelancer or an agency in ${name(c)}? Here is how they really compare on price, reliability, ${SOCIAL(c) ? 'Arabic and English support' : 'language support'} and who owns what after launch.`,
    body: [
      intro(c),
      ['h2', 'How they actually compare'],
      ['table',
        ['What matters', 'Freelancer', 'Agency or senior team'],
        ['Price', 'Cheapest. Great if the site is very simple.', 'More than a freelancer, less than a big agency. You are paying for process and someone to call.'],
        ['Reliability', 'It varies a lot. If they disappear, your domain can go with them.', 'Contract, milestones, and a company that will still be there next year.'],
        ['Language', SOCIAL(c) ? 'Rarely done well' : 'Rarely done well', 'Planned per language from the start, so each version can rank.'],
        ['After launch', 'Hourly if you can reach them.', 'Care plans, response times, and accountability you can hold them to.'],
      ],
      ['h2', 'When a freelancer makes perfect sense'],
      ['p', `If you need something simple and fast, your budget is tight, and you are happy to update the site yourself, a good freelancer in ${name(c)} can be excellent value. Plenty of businesses here run happily like that. Just keep the domain and hosting in your name, and keep backups. If you find a good one, hold on to them.`],
      ['h2', 'When you want an agency or senior team'],
      ['p', `When the site has to do real work, bookings, payments, client logins, ${SOCIAL(c) ? 'clean Arabic and English' : 'two or three clean languages'}, and speed that Google rewards, is when the cheapest option gets expensive. We have seen people pay twice, once for the cheap site that was abandoned, and again for the rebuild. That is when the freelancer discount costs you the most.`],
      ['h2', 'Questions that make the difference obvious'],
      CHECKLIST(c),
      ['h2', 'And again, who owns it at the end'],
      ['p', `Freelancer or agency, it does not matter. The domain, hosting and code should be yours on day one. In ${name(c)} that one question has saved people more money than any discount.`],
      ['h2', 'Where we fit'],
      ['p', `We are a senior remote team, agency level work without the agency overhead. Fixed quotes in ${c.cur}, real company, public work you can open right now. That is the website, portal and app for Quick Solution Oman. Compare us to whoever else you are talking to, we are happy with that.`],
      ['cta', ctaSlug(c)],
    ],
  }),
  // 5. Best ideas for the city's industries (listicle, of ideas, never agencies)
  (c) => ({
    tag: 'Ideas',
    title: `${c.industries.length} Website Ideas That Actually Win Work in ${name(c)}`,
    description: `Ideas that work for ${c.industries.slice(0, 2).join(' and ')} in ${name(c)}. What to put on the page, what to leave out, and which pages turn visitors into customers.`,
    body: [
      intro(c),
      ['h2', `Pages that actually bring enquiries in ${name(c)}`],
      ...c.industries.slice(0, 3).map((ind) => [
        ['h3', `If you are a ${ind}`],
        ['p', `Your site for ${ind} in ${name(c)} wins when it answers the buyers question at the top, shows something real from this city, photos, a project, a named customer, and makes the next step obvious. ${SOCIAL(c) ? 'WhatsApp, book, or call' : 'Book, get a quote, or call'} right there. Skip the generic we do everything homepage. Build the page people in ${name(c)} actually search for when they need a ${ind}.`],
      ]).flat(),
      ['h2', 'A 30 second trust check anyone can do'],
      ['ul', [
        'Does it load in under two seconds on a phone on 4G?',
        'Are the photos real, your team, your work, your street in the city, not stock?',
        `${SOCIAL(c) ? 'Do both Arabic and English read like a person wrote them?' : 'Does each language read like a person wrote it, not a machine?'}`,
        'Is the next step clear at the top: WhatsApp, call, get a quote?',
        'Can I see your real address and phone? Businesses without one get skipped.',
      ]],
      ['h2', `What people in ${name(c)} are actually typing into Google`],
      ['p', `${sentence(c.facts[0])} ${sentence(c.facts[1])}`],
      ['h2', 'Build for what they search, not just what looks nice'],
      ['p', `Every page should answer one search someone in ${name(c)} makes. Something like your service plus ${name(c)}. When the page talks about the city in a natural way, with real context, it has a chance to be found. A pretty site that never gets found does not help you.`],
      ['h2', `Who builds this kind of site in ${name(c)}`],
      ['p', `We build these pages for ${name(c)} at fixed ${c.cur} prices. Original design, ${SOCIAL(c) ? 'bilingual by default' : 'multi language by default'}, fast on mobile, and set up for local search from the start. Same proof as before: the website, portal and app for Quick Solution Oman.`],
      ['cta', ctaSlug(c)],
    ],
  }),
  // 6. The ROI pitch per city's dominant vertical
  (c) => ({
    tag: 'Strategy',
    title: `Why Businesses in ${name(c)} Need More Than a Pretty Website`,
    description: `A nice looking site is not enough in ${name(c)}. Here is what companies in ${c.vertical} need their website to actually do for them, and what that costs.`,
    body: [
      intro(c),
      ['h2', 'Three things that pay the site back'],
      ['ol', c.industries.slice(0, 3).map((ind, i) => `For ${ind} in ${name(c)}: ${sentence(c.facts[i % c.facts.length].charAt(0).toLowerCase() + c.facts[i % c.facts.length].slice(1))}`)],
      ['p', `Each of those is something people in ${name(c)} search for every week. A site that answers it, proves it, and lets them act on it is the difference between being found and being invisible.`],
      ['h2', 'What more than pretty actually means'],
      ['ul', [
        'A homepage that says the customers problem in their own words.',
        'A way to act right away, book, get a quote, or message on WhatsApp, not a dead end contact page.',
        'Speed and mobile layout that pass the checks Google uses to decide who ranks.',
        `${SOCIAL(c) ? 'Proper Arabic and English for the two searches your customers actually make.' : 'A second language handled properly, so you stop losing those searches.'}`,
      ]],
      ['h2', `What that costs in ${name(c)}`],
      PRICE_ROW(c),
      ['h2', 'What a pretty but useless site is really costing you'],
      ['p', `It still costs you every time someone visits, cannot book, cannot reach you, or does not trust what they see and leaves. For ${name(c)} and ${c.vertical}, that quiet loss month after month is usually bigger than the price of rebuilding it properly.`],
      ['h2', `Who builds sites that actually work in ${name(c)}`],
      ['p', `We do, at fixed ${c.cur} prices. Our work is not a portfolio of mockups, it is a live system people use every day, the website, portal and app for Quick Solution Oman.`],
      ['cta', ctaSlug(c)],
    ],
  }),
  // 7. Local SEO playbook
  (c) => ({
    tag: 'Strategy',
    title: `How to Rank on Google in ${name(c)}: A Simple Local SEO Guide`,
    description: `How small businesses in ${name(c)} get found on Google in ${YEAR}. Which local keywords bring real customers, which pages to build, and the free steps, Google Business Profile, reviews, ${SOCIAL(c) ? 'Arabic search' : 'local language search'}, most competitors skip.`,
    body: [
      intro(c),
      ['h2', 'You are fighting for two sets of results'],
      ['p', SOCIAL(c)
        ? `In ${name(c)} the Arabic results and the English results look like two different Googles. Different winners, different sites. If you only rank in one language, half your market is going to a competitor you have never even seen.`
        : `In ${name(c)} your customers search in more than one language and those result pages barely overlap. Rank in only one and the other half goes to someone else.`],
      ['h2', 'The free work most businesses never do'],
      ['ul', [
        `**Google Business Profile:** set it up as a service area business that serves ${name(c)}. It is the fastest local win most people ignore.`,
        '**Reviews:** ten honest reviews will beat a prettier website with none, every time.',
        `**Same name, address and phone everywhere,** on Google, on your site, in directories. When they do not match, your local ranking suffers.`,
        '**Ask Google to index new pages** in Search Console after you publish them.',
      ]],
      ['h2', 'Which pages to build first'],
      ['ul', [
        `A homepage or service page that answers one real search, your service plus ${name(c)}.`,
        'A local page for each neighbourhood or area you serve.',
        'A how much or how to choose page that answers buying questions. Those pages rank and they convert.',
        `Separate links per language so ${SOCIAL(c) ? 'Arabic searches' : 'searches in the other language'} can find you too.`,
      ]],
      ['h2', 'What actually moves you up'],
      ['ol', [
        'A site that is fast, works well on phones, and is secure. Google checks this.',
        'Real local content, city names, areas, projects, a named client, not filler.',
        'Local reviews and a verified Business Profile.',
        'Links and mentions from genuinely local places you work with.',
      ]],
      ['h2', `How long will it take in ${name(c)}?`],
      ['p', `Honestly, a few weeks for a new page in a quiet category, a few months where it is competitive. There is no trick that skips the work. The businesses that publish the right pages early and keep going are the ones that end up on top. That is the hub and spoke approach we use with our own clients.`],
      ['h2', 'Where we come in'],
      ['p', `We build ${SOCIAL(c) ? 'bilingual' : 'multi language'} sites that are set up to rank locally from day one, at fixed ${c.cur} prices. Every build includes the groundwork above, not as an extra. Same proof again: the website, portal and app for Quick Solution Oman.`],
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

// PUBLIC API, used by blog-data.js through serial-block.js for paging.
export function buildCityArticles(limit = CITIES_100.length) {
  const slice = CITIES_100.slice(0, limit)
  return slice.map((c, i) => {
    const fn = PATTERNS[pick(c)]
    const art = fn(c)
    const d = new Date(BASE_DATE)
    d.setUTCDate(d.getUTCDate() + i)
    const pname = pick(c)
    // Hoisted so the WhatsApp strip can carry this article's own path — the
    // /go/wa tracker then reports exactly which article produced the tap.
    const slug = `${slugify(c.slug)}-${['cost', 'choose', 'language', 'freelancer', 'ideas', 'roi', 'seo'][pname]}`
    // voice-assemble the body: human intro, WhatsApp strip, then the pattern
    const body = [
      intro(c),
      waBlock(c, 'website', `/blog/${slug}/`), // "Get a Sur price on WhatsApp" — turns a visitor into a message
      ...art.body.slice(1), // pattern body as-is (intro already used)
    ]
    const related = relatedCities(c, slice)
    return {
      slug,
      tag: art.tag,
      date: d.toISOString().slice(0, 10),
      readMins: 7,
      title: art.title,
      description: art.description,
      city: name(c),
      citySlug: c.slug, // the city page slug this article belongs to
      cityCountry: COUNTRY[c.cc] || c.cc,
      related: related.map((r) => r.slug), // city slugs (not article slugs) → hub links
      vertical: c.vertical,
      body,
    }
  })
}
