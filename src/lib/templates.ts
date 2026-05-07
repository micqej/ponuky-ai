export interface TemplateField {
  key: string
  label: string
  placeholder: string
  type: 'text' | 'textarea' | 'select'
  options?: string[]
  required: boolean
}

export interface Template {
  id: string
  name: string
  description: string
  category: string
  icon: string
  color: string
  outputFormat: 'text' | 'html' | 'pdf'
  systemPrompt: string
  userPromptTemplate: string
  fields: TemplateField[]
  example?: string
}

export const CATEGORIES = [
  'Predaj',
  'Email',
  'Sociálne siete',
  'Marketing',
  'Firma',
  'Vlastný',
]

export const TEMPLATES: Template[] = [
  // ── PREDAJ ─────────────────────────────────────────────────────────────────
  {
    id: 'cenova-ponuka',
    name: 'Cenová ponuka',
    description: 'Profesionálna cenová ponuka / oferta pre zákazníka vo formáte PDF',
    category: 'Predaj',
    icon: '📄',
    color: 'blue',
    outputFormat: 'pdf',
    systemPrompt: `Si profesionálny obchodný asistent. Píšeš formálne cenové ponuky v slovenčine.
Výstup musí byť prehľadný, profesionálny a presvedčivý. Používaj štruktúrované sekcie.
Výstup formátuj ako HTML s internými štýlmi vhodný na tlač/PDF.`,
    userPromptTemplate: `Vytvor cenovú ponuku pre:
Firma ponúkajúca: {{moja_firma}}
Zákazník: {{zakaznik}}
Produkt/Služba: {{produkt}}
Cena: {{cena}}
Platnosť ponuky: {{platnost}}
Doplňujúce info: {{info}}`,
    fields: [
      { key: 'moja_firma', label: 'Moja firma / meno', placeholder: 'napr. Databazuj s.r.o.', type: 'text', required: true },
      { key: 'zakaznik', label: 'Zákazník (firma/meno)', placeholder: 'napr. ABC s.r.o., Bratislava', type: 'text', required: true },
      { key: 'produkt', label: 'Produkt alebo služba', placeholder: 'napr. Databáza 4 200 firiem — Stavebníctvo SR', type: 'textarea', required: true },
      { key: 'cena', label: 'Cena', placeholder: 'napr. 79,99 € s DPH', type: 'text', required: true },
      { key: 'platnost', label: 'Platnosť ponuky', placeholder: 'napr. 14 dní', type: 'text', required: false },
      { key: 'info', label: 'Doplňujúce info (nepovinné)', placeholder: 'zľava, bonus, dodacie podmienky...', type: 'textarea', required: false },
    ],
  },
  {
    id: 'partnerska-ponuka',
    name: 'Partnerská ponuka',
    description: 'Návrh na spoluprácu alebo partnerstvo s inou firmou',
    category: 'Predaj',
    icon: '🤝',
    color: 'purple',
    outputFormat: 'pdf',
    systemPrompt: `Si obchodný stratég. Píšeš presvedčivé partnerské ponuky v slovenčine.
Zdôrazňuj vzájomný benefit (win-win). Buď konkrétny a profesionálny.
Formátuj výstup ako HTML vhodný na tlač.`,
    userPromptTemplate: `Vytvor partnerskú ponuku:
Moja firma: {{moja_firma}}
Potenciálny partner: {{partner}}
Čo ponúkam: {{ponukam}}
Čo očakávam: {{ocakavam}}
Dôvod spolupráce: {{dovod}}`,
    fields: [
      { key: 'moja_firma', label: 'Moja firma', placeholder: 'napr. Databazuj s.r.o.', type: 'text', required: true },
      { key: 'partner', label: 'Partner (firma)', placeholder: 'napr. Marketing Agency XY', type: 'text', required: true },
      { key: 'ponukam', label: 'Čo ponúkam partnerovi', placeholder: 'napr. Exkluzívny prístup k databáze, provízia 20%', type: 'textarea', required: true },
      { key: 'ocakavam', label: 'Čo očakávam od partnera', placeholder: 'napr. Distribúcia medzi ich klientov', type: 'textarea', required: true },
      { key: 'dovod', label: 'Prečo práve oni', placeholder: 'napr. Zdieľaná cieľová skupina', type: 'textarea', required: false },
    ],
  },
  {
    id: 'produktovy-popis',
    name: 'Produktový popis',
    description: 'Predajný popis produktu alebo databázy pre web / e-shop',
    category: 'Predaj',
    icon: '🛒',
    color: 'green',
    outputFormat: 'html',
    systemPrompt: `Si copywriter špecializovaný na predajné texty v slovenčine.
Píšeš presvedčivé popisy produktov, ktoré zdôrazňujú benefity, riešia potreby zákazníka a motivujú ku kúpe.
Používaj bullet pointy, silné nadpisy a CTA.`,
    userPromptTemplate: `Napíš produktový popis pre:
Produkt: {{produkt}}
Cieľová skupina: {{cielova_skupina}}
Hlavné benefity: {{benefity}}
Cena: {{cena}}
Tón: {{ton}}`,
    fields: [
      { key: 'produkt', label: 'Produkt / databáza', placeholder: 'napr. Databáza 6 540 reštaurácií SR', type: 'text', required: true },
      { key: 'cielova_skupina', label: 'Cieľová skupina', placeholder: 'napr. Obchodní zástupcovia, marketéri', type: 'text', required: true },
      { key: 'benefity', label: 'Hlavné benefity', placeholder: 'napr. Ušetrí 20 hodín prieskumu, aktuálne dáta 2026', type: 'textarea', required: true },
      { key: 'cena', label: 'Cena', placeholder: 'napr. 79,99 €', type: 'text', required: false },
      { key: 'ton', label: 'Tón textu', placeholder: 'profesionálny / priateľský / urgent', type: 'select', options: ['profesionálny', 'priateľský', 'energický', 'luxusný', 'urgent'], required: false },
    ],
  },

  // ── EMAIL ──────────────────────────────────────────────────────────────────
  {
    id: 'cold-email',
    name: 'Cold email — 1. kontakt',
    description: 'Prvý predajný email pre osloveného zákazníka',
    category: 'Email',
    icon: '📧',
    color: 'sky',
    outputFormat: 'text',
    systemPrompt: `Si expert na cold email marketing v slovenčine.
Píšeš krátke (max 150 slov), osobné, presvedčivé cold emaily s jasným CTA.
Vyhýbaj sa spamovým frázam. Email musí pôsobiť ľudsky, nie roboticky.`,
    userPromptTemplate: `Napíš cold email:
Meno odosielateľa: {{odosielatel}}
Firma odosielateľa: {{moja_firma}}
Príjemca (firma/rola): {{prijemca}}
Produkt/ponuka: {{produkt}}
Hlavný benefit pre príjemcu: {{benefit}}
CTA (čo má urobiť): {{cta}}`,
    fields: [
      { key: 'odosielatel', label: 'Tvoje meno', placeholder: 'napr. Peter Novák', type: 'text', required: true },
      { key: 'moja_firma', label: 'Tvoja firma', placeholder: 'napr. Databazuj s.r.o.', type: 'text', required: true },
      { key: 'prijemca', label: 'Komu píšeš', placeholder: 'napr. majiteľ stavebnej firmy', type: 'text', required: true },
      { key: 'produkt', label: 'Produkt / ponuka', placeholder: 'napr. Databáza 4 218 stavebných firiem SR', type: 'textarea', required: true },
      { key: 'benefit', label: 'Hlavný benefit', placeholder: 'napr. Okamžite získa kontakty na 4200+ potenciálnych zákazníkov', type: 'textarea', required: true },
      { key: 'cta', label: 'CTA (výzva k akcii)', placeholder: 'napr. Odpovedzte a pošlem ukážku zdarma', type: 'text', required: true },
    ],
  },
  {
    id: 'followup-email',
    name: 'Follow-up email',
    description: 'Nadväzujúci email po ponuke, stretnutí alebo bez odpovede',
    category: 'Email',
    icon: '🔄',
    color: 'orange',
    outputFormat: 'text',
    systemPrompt: `Si expert na predajné follow-up emaily v slovenčine.
Píšeš stručné, nenasilné follow-up emaily, ktoré obnovia záujem bez toho, aby pôsobili otravne.
Vždy pridaj hodnotu (info, ukážka, bonus).`,
    userPromptTemplate: `Napíš follow-up email:
Situácia: {{situacia}}
Predchádzajúci kontakt: {{predch_kontakt}}
Produkt/ponuka: {{produkt}}
Nová hodnota / dôvod kontaktu: {{nova_hodnota}}
CTA: {{cta}}`,
    fields: [
      { key: 'situacia', label: 'Situácia', placeholder: 'napr. Zákazník nereagoval 1 týždeň', type: 'select', options: ['Zákazník nereagoval na cold email', 'Po odoslaní ponuky bez odpovede', 'Po telefonáte / stretnutí', 'Po demo ukážke'], required: true },
      { key: 'predch_kontakt', label: 'Čo bolo posledné', placeholder: 'napr. Poslal som ponuku na databázu reštaurácií', type: 'text', required: true },
      { key: 'produkt', label: 'Produkt', placeholder: 'napr. Databáza 6 540 reštaurácií SR', type: 'text', required: true },
      { key: 'nova_hodnota', label: 'Nová hodnota / dôvod', placeholder: 'napr. Mám pre nich ukážku 50 záznamov zdarma', type: 'textarea', required: false },
      { key: 'cta', label: 'CTA', placeholder: 'napr. Môžeme sa stretnúť 15 minút online?', type: 'text', required: true },
    ],
  },
  {
    id: 'newsletter',
    name: 'Newsletter / email kampaň',
    description: 'Email pre existujúcich zákazníkov alebo subscriber list',
    category: 'Email',
    icon: '📰',
    color: 'teal',
    outputFormat: 'html',
    systemPrompt: `Si email marketing špecialista v slovenčine.
Píšeš pútavé newslettery s vysokou mierou otvorenia. Používaj osobný tón, príbehy a jasné CTA.
Formátuj ako čistý HTML email.`,
    userPromptTemplate: `Napíš newsletter:
Téma: {{tema}}
Cieľová skupina: {{cielova_skupina}}
Hlavná správa: {{hlavna_sprava}}
Akcia / ponuka: {{akcia}}
Tón: {{ton}}`,
    fields: [
      { key: 'tema', label: 'Téma newslettera', placeholder: 'napr. Nová databáza gastro prevádzok 2026', type: 'text', required: true },
      { key: 'cielova_skupina', label: 'Cieľová skupina', placeholder: 'napr. Obchodní manažéri v FMCG', type: 'text', required: true },
      { key: 'hlavna_sprava', label: 'Hlavná správa', placeholder: 'napr. Máme najaktuálnejšie dáta na trhu, aktualizácia 02/2026', type: 'textarea', required: true },
      { key: 'akcia', label: 'Akcia / ponuka', placeholder: 'napr. Zľava 20% do konca mesiaca', type: 'text', required: false },
      { key: 'ton', label: 'Tón', placeholder: 'profesionálny / priateľský', type: 'select', options: ['profesionálny', 'priateľský', 'informačný', 'urgent'], required: false },
    ],
  },

  // ── SOCIÁLNE SIETE ─────────────────────────────────────────────────────────
  {
    id: 'linkedin-post',
    name: 'LinkedIn post',
    description: 'Profesionálny post pre LinkedIn — buduje autoritu a predáva',
    category: 'Sociálne siete',
    icon: '💼',
    color: 'blue',
    outputFormat: 'text',
    systemPrompt: `Si LinkedIn content creator v slovenčine.
Píšeš posty, ktoré dosahujú vysoký engagement. Začni silným hookom (prvá veta musí zaujať).
Štruktúra: Hook → Príbeh/hodnota → Záver → CTA. Max 1300 znakov. Používaj emojis s mierou.`,
    userPromptTemplate: `Napíš LinkedIn post:
Téma: {{tema}}
Hlavná myšlienka: {{myslienka}}
Cieľová skupina: {{cielova_skupina}}
Čo chcem dosiahnuť: {{ciel}}
Moje meno/firma: {{meno}}`,
    fields: [
      { key: 'tema', label: 'Téma postu', placeholder: 'napr. Prečo majú obchodníci problém s cold outreach', type: 'text', required: true },
      { key: 'myslienka', label: 'Hlavná myšlienka / tip', placeholder: 'napr. Bez aktuálnych kontaktov je každý email do prázdna', type: 'textarea', required: true },
      { key: 'cielova_skupina', label: 'Cieľová skupina', placeholder: 'napr. Obchodní riaditelia, B2B sales tímy', type: 'text', required: true },
      { key: 'ciel', label: 'Cieľ postu', placeholder: 'napr. Zvýšiť povedomie o databazuj.sk', type: 'text', required: false },
      { key: 'meno', label: 'Tvoje meno / firma', placeholder: 'napr. Michal / Databazuj', type: 'text', required: false },
    ],
  },
  {
    id: 'facebook-post',
    name: 'Facebook post',
    description: 'Post pre Facebook stránku firmy alebo skupinu',
    category: 'Sociálne siete',
    icon: '📘',
    color: 'indigo',
    outputFormat: 'text',
    systemPrompt: `Si social media manažér v slovenčine.
Píšeš pútavé Facebook posty, ktoré generujú likes, komentáre a zdieľania.
Buď konverzačný, priamy a zahrň CTA. Používaj emojis.`,
    userPromptTemplate: `Napíš Facebook post:
Téma: {{tema}}
Obsah / správa: {{obsah}}
Produkt alebo služba: {{produkt}}
CTA: {{cta}}`,
    fields: [
      { key: 'tema', label: 'Téma', placeholder: 'napr. Novinka — gastro databáza 2026', type: 'text', required: true },
      { key: 'obsah', label: 'Obsah / správa', placeholder: 'napr. Práve sme aktualizovali databázu reštaurácií...', type: 'textarea', required: true },
      { key: 'produkt', label: 'Produkt / link', placeholder: 'napr. databazuj.sk', type: 'text', required: false },
      { key: 'cta', label: 'CTA', placeholder: 'napr. Klikni na link v profile!', type: 'text', required: false },
    ],
  },
  {
    id: 'twitter-thread',
    name: 'Twitter / X thread',
    description: '5–8 tweetový thread na tému, ktorá buduje autoritu',
    category: 'Sociálne siete',
    icon: '🐦',
    color: 'sky',
    outputFormat: 'text',
    systemPrompt: `Si Twitter/X content creator v slovenčine.
Píšeš virálne thready. Každý tweet max 280 znakov. Začni silným hookom v tweete 1.
Štruktúra: Claim → Dôkazy/tipy → Záver → CTA. Číslo každý tweet (1/, 2/, ...).`,
    userPromptTemplate: `Napíš Twitter thread:
Téma: {{tema}}
Hlavná téza: {{teza}}
Počet tweetov: {{pocet}}
Cieľová skupina: {{cielova_skupina}}`,
    fields: [
      { key: 'tema', label: 'Téma', placeholder: 'napr. 7 chýb pri B2B cold outreach', type: 'text', required: true },
      { key: 'teza', label: 'Hlavná téza / pointa', placeholder: 'napr. Väčšina obchodníkov oslovuje nesprávnych ľudí', type: 'textarea', required: true },
      { key: 'pocet', label: 'Počet tweetov', placeholder: '6', type: 'select', options: ['5', '6', '7', '8', '10'], required: false },
      { key: 'cielova_skupina', label: 'Cieľová skupina', placeholder: 'napr. B2B obchodníci', type: 'text', required: false },
    ],
  },
  {
    id: 'whatsapp-sms',
    name: 'WhatsApp / SMS správa',
    description: 'Krátka predajná alebo informačná správa pre WA/SMS',
    category: 'Sociálne siete',
    icon: '💬',
    color: 'green',
    outputFormat: 'text',
    systemPrompt: `Si copywriter pre mobilné správy v slovenčine.
Píšeš krátke, osobné a presvedčivé WhatsApp/SMS správy (max 160 znakov pre SMS, max 300 pre WA).
Buď priamy, priateľský, bez spamových výrazov.`,
    userPromptTemplate: `Napíš {{kanal}} správu:
Príjemca: {{prijemca}}
Správa / ponuka: {{sprava}}
CTA: {{cta}}`,
    fields: [
      { key: 'kanal', label: 'Kanál', placeholder: 'WhatsApp', type: 'select', options: ['WhatsApp', 'SMS'], required: true },
      { key: 'prijemca', label: 'Komu', placeholder: 'napr. potenciálny zákazník z databázy', type: 'text', required: true },
      { key: 'sprava', label: 'Správa / ponuka', placeholder: 'napr. Mám pre teba aktuálnu databázu firiem vo vašom odbore', type: 'textarea', required: true },
      { key: 'cta', label: 'CTA', placeholder: 'napr. Môžem zavolať zajtra?', type: 'text', required: false },
    ],
  },

  // ── MARKETING ──────────────────────────────────────────────────────────────
  {
    id: 'landing-page',
    name: 'Landing page — texty',
    description: 'Hero headline, podtitulok, benefity a CTA pre landing page',
    category: 'Marketing',
    icon: '🚀',
    color: 'violet',
    outputFormat: 'html',
    systemPrompt: `Si expert na konverzné texty (conversion copywriting) v slovenčine.
Píšeš landing page texty, ktoré konvertujú. Štruktúra: Hero → Problém → Riešenie → Benefity → CTA.
Formátuj ako HTML sekcie s triedami pre ľahkú implementáciu.`,
    userPromptTemplate: `Napíš landing page texty pre:
Produkt: {{produkt}}
Cieľová skupina: {{cielova_skupina}}
Hlavný problém, ktorý riešime: {{problem}}
Kľúčové benefity: {{benefity}}
CTA button text: {{cta}}
Cena: {{cena}}`,
    fields: [
      { key: 'produkt', label: 'Produkt / služba', placeholder: 'napr. Databáza kontaktov slovenských firiem', type: 'text', required: true },
      { key: 'cielova_skupina', label: 'Cieľová skupina', placeholder: 'napr. B2B obchodníci, marketéri', type: 'text', required: true },
      { key: 'problem', label: 'Problém zákazníka', placeholder: 'napr. Stráca hodiny hľadaním kontaktov na firmy', type: 'textarea', required: true },
      { key: 'benefity', label: 'Top 3 benefity', placeholder: 'napr. Okamžitý download, aktuálne dáta 2026, 6000+ záznamov', type: 'textarea', required: true },
      { key: 'cta', label: 'Text CTA tlačidla', placeholder: 'napr. Kúpiť databázu teraz', type: 'text', required: false },
      { key: 'cena', label: 'Cena', placeholder: 'napr. od 49,99 €', type: 'text', required: false },
    ],
  },
  {
    id: 'blog-post',
    name: 'Blog post / článok',
    description: 'SEO priateľský blog článok pre web alebo LinkedIn',
    category: 'Marketing',
    icon: '✍️',
    color: 'amber',
    outputFormat: 'html',
    systemPrompt: `Si SEO copywriter a content stratég v slovenčine.
Píšeš informatívne a hodnotné blog články, ktoré rankujú na Google a budujú autoritu.
Štruktúra: Intro → H2 sekcie s hodnotiou → Záver s CTA. Min 500 slov.`,
    userPromptTemplate: `Napíš blog článok:
Téma: {{tema}}
Kľúčové slovo: {{keyword}}
Cieľová skupina: {{cielova_skupina}}
Dĺžka: {{dlzka}}
Tón: {{ton}}`,
    fields: [
      { key: 'tema', label: 'Téma článku', placeholder: 'napr. Ako nájsť nových zákazníkov v B2B', type: 'text', required: true },
      { key: 'keyword', label: 'Kľúčové slovo (SEO)', placeholder: 'napr. B2B databáza firiem Slovensko', type: 'text', required: false },
      { key: 'cielova_skupina', label: 'Cieľová skupina', placeholder: 'napr. Obchodní manažéri malých firiem', type: 'text', required: true },
      { key: 'dlzka', label: 'Dĺžka článku', placeholder: '600 slov', type: 'select', options: ['400 slov', '600 slov', '800 slov', '1000+ slov'], required: false },
      { key: 'ton', label: 'Tón', placeholder: 'odborný', type: 'select', options: ['odborný', 'priateľský', 'motivačný', 'analytický'], required: false },
    ],
  },
  {
    id: 'press-release',
    name: 'Tlačová správa (PR)',
    description: 'Formálna tlačová správa pre médiá alebo webové portály',
    category: 'Marketing',
    icon: '📢',
    color: 'rose',
    outputFormat: 'html',
    systemPrompt: `Si PR špecialista v slovenčine.
Píšeš formálne tlačové správy v štandardnom formáte. Buď objektívny, faktický a newsworthy.
Štruktúra: Headline → Datum/Miesto → Lead paragraph → Body → Quote → Boilerplate → Kontakt.`,
    userPromptTemplate: `Napíš tlačovú správu:
Firma: {{firma}}
Téma správy: {{tema}}
Dátum: {{datum}}
Kľúčové fakty: {{fakty}}
Citát (kto): {{citat_kto}}
Kontakt: {{kontakt}}`,
    fields: [
      { key: 'firma', label: 'Firma', placeholder: 'napr. Databazuj s.r.o.', type: 'text', required: true },
      { key: 'tema', label: 'Téma správy', placeholder: 'napr. Spustenie novej databázy 6 540 gastronomických prevádzok', type: 'text', required: true },
      { key: 'datum', label: 'Dátum vydania', placeholder: 'napr. 7. mája 2026', type: 'text', required: false },
      { key: 'fakty', label: 'Kľúčové fakty', placeholder: 'napr. Obsahuje 6540 záznamov, aktualizácia 02/2026, dostupná online', type: 'textarea', required: true },
      { key: 'citat_kto', label: 'Citát (meno a pozícia)', placeholder: 'napr. Michal Mikula, CEO Databazuj', type: 'text', required: false },
      { key: 'kontakt', label: 'Kontakt', placeholder: 'napr. info@databazuj.sk, +421 900 000 000', type: 'text', required: false },
    ],
  },

  // ── FIRMA ──────────────────────────────────────────────────────────────────
  {
    id: 'o-nas',
    name: 'O nás — firemný text',
    description: 'Profesionálny text sekcie "O nás" pre web alebo prezentáciu',
    category: 'Firma',
    icon: '🏢',
    color: 'slate',
    outputFormat: 'html',
    systemPrompt: `Si copywriter pre firemné texty v slovenčine.
Píšeš autentické, presvedčivé texty "O nás", ktoré budujú dôveru a ľudsky predstavujú firmu.
Max 300 slov. Formátuj ako HTML.`,
    userPromptTemplate: `Napíš text "O nás":
Firma: {{firma}}
Čo robíme: {{co_robime}}
Prečo sme vznikli / misia: {{misia}}
Naše hodnoty: {{hodnoty}}
Tím / zakladatelia: {{tim}}`,
    fields: [
      { key: 'firma', label: 'Firma', placeholder: 'napr. Databazuj s.r.o.', type: 'text', required: true },
      { key: 'co_robime', label: 'Čo robíme', placeholder: 'napr. Predávame aktuálne B2B databázy slovenských firiem', type: 'textarea', required: true },
      { key: 'misia', label: 'Misia / prečo existujeme', placeholder: 'napr. Chceme pomôcť obchodníkom nájsť zákazníkov rýchlejšie', type: 'textarea', required: true },
      { key: 'hodnoty', label: 'Hodnoty', placeholder: 'napr. Presnosť, aktuálnosť, dostupnosť', type: 'text', required: false },
      { key: 'tim', label: 'Tím / zakladatelia', placeholder: 'napr. Michal Mikula, podnikateľ s 10-ročnou praxou', type: 'text', required: false },
    ],
  },
  {
    id: 'recenzia-request',
    name: 'Žiadosť o recenziu',
    description: 'Email alebo správa prosba zákazníkovi o zanechanie recenzie',
    category: 'Firma',
    icon: '⭐',
    color: 'yellow',
    outputFormat: 'text',
    systemPrompt: `Si zákaznícky servis špecialista v slovenčine.
Píšeš priateľské, nenasilné žiadosti o recenziu. Buď vďačný, jasný a uľahči zákazníkovi cestu.
Max 100 slov.`,
    userPromptTemplate: `Napíš žiadosť o recenziu:
Firma: {{firma}}
Zákazník: {{zakaznik}}
Produkt, ktorý kúpil: {{produkt}}
Kde má zanechať recenziu: {{kde}}`,
    fields: [
      { key: 'firma', label: 'Firma', placeholder: 'napr. Databazuj s.r.o.', type: 'text', required: true },
      { key: 'zakaznik', label: 'Meno zákazníka', placeholder: 'napr. Peter', type: 'text', required: false },
      { key: 'produkt', label: 'Produkt', placeholder: 'napr. Databáza gastro prevádzok SR', type: 'text', required: true },
      { key: 'kde', label: 'Kde zanechať recenziu', placeholder: 'napr. Google Mapy, Trustpilot, Facebook', type: 'text', required: true },
    ],
  },
  {
    id: 'faq',
    name: 'FAQ — Často kladené otázky',
    description: '8–10 otázok a odpovedí pre web, produkt alebo službu',
    category: 'Firma',
    icon: '❓',
    color: 'cyan',
    outputFormat: 'html',
    systemPrompt: `Si expert na zákaznícke texty v slovenčine.
Vytváraš realistické FAQ sekcie, ktoré odpovedajú na skutočné obavy zákazníkov a eliminujú nákupné bariéry.
Formátuj ako HTML accordion-ready zoznam.`,
    userPromptTemplate: `Vytvor FAQ pre:
Produkt/Firma: {{produkt}}
Cieľová skupina: {{cielova_skupina}}
Hlavné obavy zákazníkov: {{obavy}}
Počet otázok: {{pocet}}`,
    fields: [
      { key: 'produkt', label: 'Produkt / firma', placeholder: 'napr. Databazuj — predaj B2B databáz', type: 'text', required: true },
      { key: 'cielova_skupina', label: 'Cieľová skupina', placeholder: 'napr. Obchodníci, marketéri', type: 'text', required: true },
      { key: 'obavy', label: 'Typické obavy zákazníkov', placeholder: 'napr. Sú dáta aktuálne? Ako dostanem súbor? Legálnosť?', type: 'textarea', required: false },
      { key: 'pocet', label: 'Počet otázok', placeholder: '8', type: 'select', options: ['5', '8', '10', '12'], required: false },
    ],
  },
]
