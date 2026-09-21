// Local SEO city landing pages, the hub of the hub-and-spoke local strategy.
// Each page targets "<service> in <city>" keywords with genuinely local proof:
// case studies, currency, contacts and market knowledge. Never find-replace
// a city name into the same paragraph, Google flags thin doorway pages.

export const CITIES = [
  {
    slug: 'web-design-muscat',
    city: 'Muscat',
    country: 'Oman',
    flag: '🇴🇲',
    currency: 'OMR',
    dial: '+968',
    // Money keyword this page exists to rank for.
    keyword: 'web design Muscat',
    title: 'Web Design in Muscat, Oman, Websites That Win Clients | BrightSkyIT',
    description:
      'Muscat web design agency delivering fast, beautiful websites and web apps for Omani businesses. Real local work, Quick Solution Oman. OMR pricing, Arabic + English. Get a free quote.',
    h1: 'Web Design in Muscat, Oman',
    tagline: 'The remote agency Muscat businesses already trust, with the local work to prove it.',
    neighborhoods: ['Al Khuwair', 'Ruwi', 'Seeb', 'Qurum', 'Azaiba', 'Al Ghubrah', 'Bawshar', 'Al Mouj'],
    // Genuinely different market paragraph per city, this is what separates
    // a real city page from a doorway page.
    market: {
      heading: 'Built for how Muscat does business',
      paragraphs: [
        'Muscat is digitizing fast. Oman Vision 2040 is pushing every sector, facility management, retail, logistics, professional services, toward online booking, e-invoicing and customer portals. Businesses that still run on WhatsApp photos and paper quotes are losing contracts to competitors whose clients can order, approve and pay online.',
        'A Muscat business website has two jobs an ordinary website doesn\'t: it must work in **Arabic and English:** not machine-translated, but designed for both reading directions, and it must load well on the mobile networks everyone actually uses. We build both in from the first sketch: bilingual layouts, WhatsApp-first contact flows, and pages that load in under two seconds on 4G.',
      ],
    },
    // Local proof, never invent. Only list work that really exists.
    proof: {
      heading: 'Real work for a real Muscat company',
      body:
        'We built and maintain the public website and the five-role client portal for Quick Solution Oman, one of Muscat\'s leading facility-management companies, serving clients across all of Oman. Complaints, approvals, technician dispatch and billing all run through the portal we engineered, alongside their React Native app.',
      caseUrl: 'https://www.quicksolutionoman.com/',
      caseLabel: 'See the live Quick Solution Oman platform ↗',
    },
    // Advisor on the ground in this city.
    localContact: {
      name: 'Reazul Hasan',
      role: 'Regional Head, Oman',
      blurb:
        'Reazul Hasan is BrightSkyIT\'s Regional Head based in Muscat, and the founder of Quick Solution Oman, a top facility-management company serving all of Oman. He knows the Omani market from the inside, what clients expect, how deals are done, and what "good service" means locally.',
      photo: '/team/reazul-hasan.jpg',
      profile: '/team/reazul-hasan/',
    },
    faqs: [
      {
        q: 'How much does a website cost in Muscat, Oman?',
        a: 'Most business websites we build for Omani clients range from 250 to 1,500 OMR depending on the scope: a professional company website with Arabic + English lands around 300–700 OMR, while a booking or client-portal system runs 800–1,500 OMR. We quote fixed prices in OMR up front, no hourly surprises.',
      },
      {
        q: 'Do you build Arabic websites?',
        a: 'Yes, every site we build can be fully bilingual Arabic/English with proper RTL layout, Arabic typography and separate SEO for each language. Most of our Gulf clients run both languages side by side.',
      },
      {
        q: 'Can we meet in person in Muscat?',
        a: 'Yes. Our Regional Head for Oman, Reazul Hasan, is based in Muscat and meets clients in person. Design and development happen remotely (which keeps our prices sharp), and you always have a local contact for meetings, support and accountability.',
      },
      {
        q: 'How long does a website take to build?',
        a: 'A company website typically takes 2–3 weeks from kickoff to launch. Larger portals and web apps run 4–8 weeks. You get a clear milestone plan before we start, and we hit it.',
      },
      {
        q: 'Do you offer support after launch?',
        a: 'Yes, every project includes post-launch support, and we offer monthly care plans covering updates, backups, security and small changes. We build long-term; most of our clients are still with us years later.',
      },
    ],
    areas: 'Muscat, Seeb, Sohar, Salalah, Nizwa, Ruwi, Qurum, Al Khuwair and everywhere in Oman, remote-friendly, local support.',
  },
  {
    slug: 'web-design-sohar',
    city: 'Sohar',
    country: 'Oman',
    flag: '🇴🇲',
    currency: 'OMR',
    dial: '+968',
    keyword: 'web design Sohar',
    title: 'Web Design in Sohar, Oman, Port, Industry & Retail Websites | BrightSkyIT',
    description:
      'Web design for Sohar businesses, port & logistics, industrial services, retail and trade. Fast bilingual websites with OMR pricing and a local Oman contact. Free quote.',
    h1: 'Web Design in Sohar, Oman',
    tagline: 'Websites for the industrial and trading heart of Oman.',
    neighborhoods: ['Sohar Port', 'Al Wadi Al Kabir', 'Industrial City', 'Falaj Al Qabail', 'Al Batinah'],
    market: {
      heading: 'Built for Sohar\'s industrial economy',
      paragraphs: [
        'Sohar runs on the port. Logistics, warehousing, manufacturing and the trading companies around them make up one of Oman\'s most important industrial zones, and their buyers search online before they call. A supplier with a clear bilingual website, visible certifications and a one-tap quotation form wins the inquiry before the phone even rings.',
        'We build industrial-grade websites for Sohar companies: product and service catalogs, RFQ forms, Arabic/English content and fast pages that work on site-office connections. If your current site is a PDF brochure from 2019, that\'s the gap your competitors are using against you.',
      ],
    },
    proof: {
      heading: 'Omani facility-management expertise behind every build',
      body:
        'Our Oman practice is anchored by Quick Solution Oman, a leading facility-management company serving clients across the country, including the Al Batinah region. We build and maintain their website, client portal and mobile app, so we understand how Omani service companies actually win and serve customers.',
      caseUrl: 'https://www.quicksolutionoman.com/',
      caseLabel: 'See the live Quick Solution Oman platform ↗',
    },
    localContact: {
      name: 'Reazul Hasan',
      role: 'Regional Head, Oman',
      blurb:
        'Reazul Hasan, BrightSkyIT\'s Regional Head for Oman, is based in Muscat and serves clients across the country including Sohar and Al Batinah. As founder of Quick Solution Oman, he brings real Omani market experience to every project.',
      photo: '/team/reazul-hasan.jpg',
      profile: '/team/reazul-hasan/',
    },
    faqs: [
      {
        q: 'Do you work with companies in Sohar?',
        a: 'Yes, we serve clients across Al Batinah including Sohar Port, the Industrial City and trading companies citywide. Meetings can happen in person through our Oman Regional Head, and everything else runs smoothly remote.',
      },
      {
        q: 'What does a website cost for a Sohar business?',
        a: 'Company websites typically run 300–700 OMR; industrial portals with catalogs and RFQ systems run 800–1,500 OMR. We quote fixed prices in OMR before work starts.',
      },
      {
        q: 'Can you integrate with our existing systems?',
        a: 'Yes, we regularly connect websites to inventory, billing and HR systems, whether that\'s a modern API or a legacy desktop tool. Tell us what you run and we\'ll scope it honestly.',
      },
    ],
    areas: 'Sohar, Sohar Port, Liwa, Shinas, Al Batinah region, and all of Oman.',
  },
  {
    slug: 'web-design-salalah',
    city: 'Salalah',
    country: 'Oman',
    flag: '🇴🇲',
    currency: 'OMR',
    dial: '+968',
    keyword: 'web design Salalah',
    title: 'Web Design in Salalah, Oman, Tourism, Trade & Service Websites | BrightSkyIT',
    description:
      'Web design for Salalah businesses, hotels, tourism, retail and services. Bilingual Arabic/English websites that load fast in Khareef season and beyond. Free quote in OMR.',
    h1: 'Web Design in Salalah, Oman',
    tagline: 'Websites that shine in Khareef season and sell all year.',
    neighborhoods: ['Salalah Port', 'Al Haffa', 'Sultan Qaboos Street', 'Taqa', 'Mirbat', 'Dhofar region'],
    market: {
      heading: 'Built for Dhofar\'s tourism-and-trade economy',
      paragraphs: [
        'Salalah\'s economy has two gears: Khareef season, when the region fills with visitors from the Gulf, and the rest of the year, when trade, logistics and services carry the city. Both depend on being found online, a hotel, tour operator or retail shop that ranks for "Salalah" searches books the customer before the one that doesn\'t.',
        'We build bilingual websites tuned for exactly this: Arabic-first layouts for local and Gulf visitors, English pages that rank for international searches, fast loading even on congested seasonal networks, and booking or inquiry flows that turn Khareef traffic into confirmed customers.',
      ],
    },
    proof: {
      heading: 'Omani service-company experience you can check',
      body:
        'Behind our Oman work sits Quick Solution Oman, a top facility-management company serving clients across Oman, whose website, client portal and app we built and maintain. We know how Omani companies win customers online because we do it for our own clients.',
      caseUrl: 'https://www.quicksolutionoman.com/',
      caseLabel: 'See the live Quick Solution Oman platform ↗',
    },
    localContact: {
      name: 'Reazul Hasan',
      role: 'Regional Head, Oman',
      blurb:
        'Reazul Hasan, BrightSkyIT\'s Regional Head for Oman, is based in Muscat and serves Dhofar and Salalah clients alongside the rest of the country. He\'s the founder of Quick Solution Oman and understands the Omani market end to end.',
      photo: '/team/reazul-hasan.jpg',
      profile: '/team/reazul-hasan/',
    },
    faqs: [
      {
        q: 'Can you build hotel and tourism websites for Salalah?',
        a: 'Yes, booking-ready hotel and tour sites are a core service: bilingual pages, photo galleries, room or package booking flows and Google Maps integration. We design for Khareef-season traffic spikes.',
      },
      {
        q: 'What does a website cost in Salalah?',
        a: 'Most projects run 300–700 OMR for a professional bilingual website, and 800–1,500 OMR for booking systems or portals. Fixed quotes in OMR, agreed before we start.',
      },
      {
        q: 'Will our website work during Khareef traffic spikes?',
        a: 'Yes, we build on fast global infrastructure (Cloudflare) that scales automatically with seasonal traffic, so your site stays quick in peak season.',
      },
    ],
    areas: 'Salalah, Taqa, Mirbat, Thumrait, the whole Dhofar governorate, and all of Oman.',
  },
  {
    slug: 'web-design-dubai',
    city: 'Dubai',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    dial: '+971',
    keyword: 'web design Dubai',
    title: 'Web Design in Dubai, UAE, Bilingual Websites That Convert | BrightSkyIT',
    description:
      'Dubai web design agency for startups, retail and service companies. Bilingual Arabic/English sites, e-commerce and booking systems. Fixed AED pricing, senior team. Free quote.',
    h1: 'Web Design in Dubai, UAE',
    tagline: 'Dubai-fast websites for Dubai-fast businesses.',
    neighborhoods: ['Business Bay', 'Deira', 'JLT', 'Al Quoz', 'Dubai Silicon Oasis', 'DIFC', 'Dubai Marina'],
    market: {
      heading: 'Built for the fastest market in the Gulf',
      paragraphs: [
        'Dubai customers decide in seconds. Between a click on your Instagram ad and a filled contact form, your website has to load instantly, look premium, and answer the three questions every Dubai buyer asks: what do you offer, what does it cost, and how do I reach you now. Anything slower or vaguer loses to the competitor one swipe away.',
        'We build for that reality: bilingual Arabic/English sites for a market that lives in both languages, WhatsApp-first contact flows, e-commerce and booking systems, and pages engineered to pass Core Web Vitals, the speed signals Google uses to rank Dubai\'s hyper-competitive results.',
      ],
    },
    proof: {
      heading: 'Gulf market experience, proven publicly',
      body:
        'We built and maintain the full digital platform of Quick Solution Oman, a leading facility-management company serving the entire country: public website, five-role client portal (complaints, approvals, dispatch, billing) and a React Native app. That portal-grade engineering is what we bring to Dubai projects.',
      caseUrl: 'https://www.quicksolutionoman.com/',
      caseLabel: 'See the live Quick Solution Oman platform ↗',
    },
    localContact: {
      name: 'Mohammad Sohag',
      role: 'Co-Founder & CEO',
      blurb:
        'Dubai projects are led directly by BrightSkyIT\'s co-founder and CEO. Senior people do the work, no hand-offs to juniors, no account-manager telephone game. You talk to the person building your product.',
      photo: '/team/mohammad-sohag.jpg',
      profile: '/team/mohammad-sohag/',
    },
    faqs: [
      {
        q: 'How much does web design cost in Dubai?',
        a: 'Professional company websites typically run 3,500–8,000 AED, and e-commerce or booking platforms run 8,000–25,000 AED depending on scope. We quote fixed prices in AED up front, the senior-team quality of a big Dubai agency without the big-agency invoice.',
      },
      {
        q: 'Do you build Arabic websites?',
        a: 'Yes, fully bilingual Arabic/English with proper RTL design, not machine translation. Both languages get their own SEO so you rank in both markets.',
      },
      {
        q: 'We\'re remote, how do meetings work?',
        a: 'Better than you\'d expect: scheduled video calls with screen sharing, a shared client portal where you approve designs and track progress, and same-day replies in Gulf working hours. You get senior attention at a sharper price.',
      },
      {
        q: 'Can you take over our existing website?',
        a: 'Often, yes. We audit what you have, tell you honestly whether to improve or rebuild, and handle the migration without downtime.',
      },
    ],
    areas: 'Dubai, Abu Dhabi, Sharjah and the UAE, remote-friendly, Gulf-hours support.',
  },
  {
    slug: 'web-design-sur',
    city: 'Sur',
    country: 'Oman',
    flag: '🇴🇲',
    currency: 'OMR',
    dial: '+968',
    keyword: 'web design Sur',
    title: 'Web Design in Sur, Oman, Tourism, Marine & Trade Websites | BrightSkyIT',
    description:
      'Web design for Sur businesses, tour operators, hotels, seafood exporters and traders. Bilingual Arabic/English websites with OMR pricing and a local Oman contact. Free quote.',
    h1: 'Web Design in Sur, Oman',
    tagline: 'Websites for Oman\'s city of sailors, found by every visitor before they arrive.',
    neighborhoods: ['Al Ayjah', 'Dhow Yards', 'Ras Al Jinz', 'Sur Port', 'Wahiba Sands gateway'],
    market: {
      heading: 'Built for Sur\'s sea-and-visitors economy',
      paragraphs: [
        'Sur lives from the sea and from the people who come to see it. The dhow-building yards, the fishing and seafood trade, and a tourism season that brings the world to Ras Al Jinz\'s turtle beach and the Wahiba Sands camps, every one of those businesses is chosen online, in a search, weeks before the customer ever reaches Ash Sharqiyah. A tour operator or guesthouse whose site loads fast, shows real photos and takes bookings in Arabic or English captures that traveler; the one still relying on Instagram DMs loses them.',
        'We build for that journey: bilingual websites that rank for "Sur" and "Ras Al Jinz" searches, mobile-first pages that survive the road-trip signal, booking and WhatsApp inquiry flows that turn interest into confirmed reservations, and seafood or trading-company sites with proper product catalogs and export-grade credibility.',
      ],
    },
    proof: {
      heading: 'Omani service-company experience you can check',
      body:
        'Behind our Oman work sits Quick Solution Oman, a top facility-management company serving clients across Oman, whose website, client portal and app we built and maintain. We know how Omani companies win customers online because we do it for our own clients.',
      caseUrl: 'https://www.quicksolutionoman.com/',
      caseLabel: 'See the live Quick Solution Oman platform ↗',
    },
    localContact: {
      name: 'Reazul Hasan',
      role: 'Regional Head, Oman',
      blurb:
        'Reazul Hasan, BrightSkyIT\'s Regional Head for Oman, is based in Muscat and serves clients across the country including Sur and Ash Sharqiyah. He\'s the founder of Quick Solution Oman and understands the Omani market end to end.',
      photo: '/team/reazul-hasan.jpg',
      profile: '/team/reazul-hasan/',
    },
    faqs: [
      {
        q: 'Can you build booking websites for tours and camps near Sur?',
        a: 'Yes, booking-ready sites for tour operators, desert camps and guesthouses are a core service: bilingual pages, photo galleries, reservation or inquiry flows and Google Maps integration. Ras Al Jinz and Wahiba Sands searches are exactly what we design the pages to win.',
      },
      {
        q: 'What does a website cost for a Sur business?',
        a: 'Most projects run 300–700 OMR for a professional bilingual website, and 800–1,500 OMR for booking systems or portals. Fixed quotes in OMR, agreed before we start.',
      },
      {
        q: 'We are in Sur, how do meetings work?',
        a: 'Our Oman Regional Head, Reazul Hasan, can meet you in person, and everything else runs smoothly remote, design approvals, progress tracking and support all happen in your client portal. Distance has never slowed a project down.',
      },
    ],
    areas: 'Sur, Al Ayjah, Ras Al Jinz, Tiwi, Bilad Sur, Wahiba Sands and all of Ash Sharqiyah, plus everywhere in Oman.',
  },
  {
    slug: 'web-design-nizwa',
    city: 'Nizwa',
    country: 'Oman',
    flag: '🇴🇲',
    currency: 'OMR',
    dial: '+968',
    keyword: 'web design Nizwa',
    title: 'Web Design in Nizwa, Oman, Heritage, Trade & Industry Websites | BrightSkyIT',
    description:
      'Web design for Nizwa businesses, date farms, crafts, industry and Jebel Akhdar tourism. Bilingual Arabic/English websites, fixed OMR pricing, local Oman contact. Free quote.',
    h1: 'Web Design in Nizwa, Oman',
    tagline: 'Websites for Oman\'s inland capital, as solid as its fort.',
    neighborhoods: ['Nizwa Fort', 'Friday Souq', 'Nizwa Industrial Estate', 'Jebel Akhdar gateway', 'Ad Dakhiliyah'],
    market: {
      heading: 'Built for Nizwa\'s trade-and-heritage economy',
      paragraphs: [
        'Nizwa is Oman\'s ancient capital and still its inland marketplace: the date trade, the famous Friday souq with its silverwork and khanjars, copper and pottery crafts, the Industrial Estate\'s factories, and the stream of visitors heading for Nizwa Fort and the mountain villages of Jebel Akhdar. Nearly all of that trade now starts with a search, a date exporter with a proper catalog site sells to Gulf buyers a WhatsApp-photo trader never hears from.',
        'We build Nizwa businesses the same standard of website the big Muscat companies get: bilingual Arabic/English pages designed for both reading directions, product and export catalogs, fast loading on the region\'s mobile networks, and inquiry flows that turn souq browsers and Fort visitors into direct customers.',
      ],
    },
    proof: {
      heading: 'Omani service-company experience you can check',
      body:
        'Behind our Oman work sits Quick Solution Oman, a top facility-management company serving clients across Oman, whose website, client portal and app we built and maintain. We know how Omani companies win customers online because we do it for our own clients.',
      caseUrl: 'https://www.quicksolutionoman.com/',
      caseLabel: 'See the live Quick Solution Oman platform ↗',
    },
    localContact: {
      name: 'Reazul Hasan',
      role: 'Regional Head, Oman',
      blurb:
        'Reazul Hasan, BrightSkyIT\'s Regional Head for Oman, is based in Muscat and serves Ad Dakhiliyah and Nizwa clients alongside the rest of the country. He\'s the founder of Quick Solution Oman and understands the Omani market end to end.',
      photo: '/team/reazul-hasan.jpg',
      profile: '/team/reazul-hasan/',
    },
    faqs: [
      {
        q: 'Do you work with companies in Nizwa and Ad Dakhiliyah?',
        a: 'Yes, we serve the whole interior region: date farms and exporters, souq traders and crafts businesses, factories in the Industrial Estate, and tourism operators around Nizwa Fort and Jebel Akhdar. Meetings can happen in person through our Oman Regional Head.',
      },
      {
        q: 'What does a website cost in Nizwa?',
        a: 'Most projects run 300–700 OMR for a professional bilingual website, and 800–1,500 OMR for catalogs, portals or booking systems. Fixed quotes in OMR, agreed before we start.',
      },
      {
        q: 'Can you build an export catalog for our dates or crafts?',
        a: 'Yes, bilingual product catalogs with photos, specifications, certifications and a proper quotation form are one of our specialties. Export buyers judge a supplier by their website before they ever reply to an email.',
      },
    ],
    areas: 'Nizwa, Izki, Adam, Bahla, Jabrin, the whole Ad Dakhiliyah governorate, and all of Oman.',
  },
  {
    slug: 'web-design-ras-al-khaimah',
    city: 'Ras Al Khaimah',
    country: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    dial: '+971',
    keyword: 'web design Ras Al Khaimah',
    title: 'Web Design in Ras Al Khaimah, UAE, RAKEZ & SME Websites | BrightSkyIT',
    description:
      'Web design for Ras Al Khaimah businesses, RAKEZ companies, industry, hospitality and SMEs. Bilingual Arabic/English sites, fixed AED pricing, senior team. Free quote.',
    h1: 'Web Design in Ras Al Khaimah, UAE',
    tagline: 'Big-agency websites for the UAE\'s fastest-growing emirate, without the Dubai invoice.',
    neighborhoods: ['Al Nakheel', 'Al Hamra', 'Al Marjan Island', 'RAKEZ zones', 'Jebel Jais'],
    market: {
      heading: 'Built for RAK\'s boom decade',
      paragraphs: [
        'Ras Al Khaimah is in the middle of its biggest run ever. RAKEZ keeps adding thousands of SMEs and freelancers who all need a credible web presence; Wynn Al Marjan Island\'s resort opens in 2027 and hospitality, real estate and services around it are already racing to be findable; and manufacturers like RAK Ceramics and Julphar show what a global digital face does for an industrial company. Most RAK businesses today are choosing between DIY builders and Dubai agencies that bill Dubai prices.',
        'We give RAK companies the third option: a senior team that builds bilingual Arabic/English sites, e-commerce and booking systems at fixed AED prices, with the speed and polish Dubai competitors pay double for. Every project ships with the Core Web Vitals and local-search groundwork that decide who ranks when a customer searches "your service + Ras Al Khaimah".',
      ],
    },
    proof: {
      heading: 'Gulf market experience, proven publicly',
      body:
        'We built and maintain the full digital platform of Quick Solution Oman, a leading facility-management company serving the entire country: public website, five-role client portal (complaints, approvals, dispatch, billing) and a React Native app. That portal-grade engineering is what we bring to UAE projects.',
      caseUrl: 'https://www.quicksolutionoman.com/',
      caseLabel: 'See the live Quick Solution Oman platform ↗',
    },
    localContact: {
      name: 'Mohammad Sohag',
      role: 'Co-Founder & CEO',
      blurb:
        'UAE projects are led directly by BrightSkyIT\'s co-founder and CEO. Senior people do the work, no hand-offs to juniors, no account-manager telephone game. You talk to the person building your product.',
      photo: '/team/mohammad-sohag.jpg',
      profile: '/team/mohammad-sohag/',
    },
    faqs: [
      {
        q: 'How much does web design cost in Ras Al Khaimah?',
        a: 'Professional company websites typically run 3,000–7,000 AED, and e-commerce or booking platforms run 8,000–20,000 AED depending on scope. We quote fixed prices in AED up front, Dubai-agency quality at RAK-friendly prices.',
      },
      {
        q: 'Do you work with RAKEZ-registered companies?',
        a: 'Yes, many of our Gulf clients are free-zone businesses. We build the credible bilingual website, service or product pages and contact flows a RAKEZ license holder needs to win clients, and we can align the site with your trade-license activity.',
      },
      {
        q: 'We\'re remote, how do meetings work?',
        a: 'Scheduled video calls with screen sharing, a shared client portal where you approve designs and track progress, and same-day replies in Gulf working hours. You get senior attention at a sharper price.',
      },
    ],
    areas: 'Ras Al Khaimah, Al Hamra, Al Marjan Island, the RAKEZ zones and the whole UAE, remote-friendly, Gulf-hours support.',
  },
]

export const byCitySlug = (slug) => CITIES.find((c) => c.slug === slug)
