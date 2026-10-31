// Personalize your invitation here. All details below are FICTIONAL DEMO content.
// Keep JavaScript quotes, commas, and brackets. See README.md for editing help.
window.WEDDING_CONFIG = {
  demoMode: false, // Set false only after replacing ALL demo details.
  siteName: "ATHIRAwedsYASH",
  pageTitle: "Yash & Athira · A wedding celebration",
  description: "Two hearts, two traditions, and one beautiful beginning.",
  locale: "en-IN",
  couple: {
    groom: {
      firstName: "Yash",
      fullName: "Yash Bansal",
      roots: "Hapur, with love",
      bio: "The calm to her whirlwind. A lover of mountain mornings, old Hindi songs, and a perfectly made cup of chai. He knew it was forever when home stopped being a place and started being a person.",
      image: "", // Optional local path ("./assets/groom.jpg") or HTTPS image URL.
      imageAlt: "Portrait of the groom"
    },
    bride: {
      firstName: "Athira",
      fullName: "Athira Nair",
      roots: "Kerala, at heart",
      bio: "The sunshine in every room. Happiest with a book, the sea nearby, and one more story to tell. She brings the laughter, the little adventures, and a love as warm as her favourite filter coffee.",
      image: "",
      imageAlt: "Portrait of the bride"
    }
  },
  heroImage: {
    src: "./assets/wedding-garden.svg",
    alt: "Original illustration of a bride in an ivory and gold Kerala-inspired sari and a groom in a coral sherwani beneath a flower-draped wedding pavilion with palms, brass lamps, and marigolds."
  },
  wedding: {
    date: "2027-12-03", // YYYY-MM-DD. Times below are displayed exactly as written.
    locationLabel: "Guruvyaur, Kerala · India",
    tagline: "A little North. A little South.\nA whole lot of love.",
    welcome: "From the warmth of Kerala to the vibrant heart of North India, our worlds are coming together. Join us as we weave our traditions, our families, and our stories into a celebration that is entirely our own.",
    eventFootnote: "All times are in Indian Standard Time (IST).",
    closing: "Bring your blessings, your biggest smiles, and your dancing shoes. We can't wait to celebrate this new chapter with you.",
    contactEmail: "yashb319@gmail.com" // Optional. Your wedding contact email enables a contact button.
  },
  story: {
    intro: "Not quite a movie meet-cute. Something better: a small moment that turned into our favourite story. Here's a little glimpse of our journey.",
    chapters: [
      { label: "The first hello", date: "March 2023", title: "One coffee. A thousand conversations.", text: "A mutual friend's gathering, an unexpectedly long conversation, and a coffee neither of us wanted to finish. That's where our sample story begins." },
      { label: "The little things", date: "August 2024", title: "Somewhere along the way, it was us.", text: "Weekend walks became traditions. Playlists became shared. Between learning a little Malayalam and debating the best street food, we found our favourite person." },
      { label: "The easiest yes", date: "February 2027", title: "And then, a beautiful new beginning.", text: "With our families beside us and a lifetime ahead, we said yes to the adventure of being us. Now, we get to celebrate it with you." }
    ]
  },
  // Give venues unique ids; each event's venueId must match one.
  venues: [
    { id: "raja-ki-haveli", name: "Raja ki haveli", address: "Hapur, Uttar Pradesh, India", mapQuery: "Raja ki haveli, Hapur, Uttar Pradesh", note: "" },
    { id: "shri-krishan-temple", name: "Shri Krishan Temple", address: "Guruvyaur, Kerala, India", mapQuery: "Shri Krishan Temple, Guruvyaur, Kerala", note: "" },
    { id: "mana", name: "Mana", address: "Guruvyaur, Kerala, India", mapQuery: "Mana, Guruvyaur, Kerala", note: "" },
    { id: "puttom-royal", name: "Puttom Royal", address: "Trivandrum, Kerala, India", mapQuery: "Puttom Royal, Trivandrum, Kerala", note: "" },
    { id: "tonight", name: "Tonight", address: "Hapur, Uttar Pradesh, India", mapQuery: "Tonight, Hapur, Uttar Pradesh", note: "" },
    { id: "manohar-regency", name: "Manohar Regency", address: "Hapur, Uttar Pradesh, India", mapQuery: "Manohar Regency, Hapur, Uttar Pradesh", note: "" }
  ],
  events: [
    { name: "Roka", date: "2026-11-11", time: "5:00 PM to 9:00 PM", venueId: "raja-ki-haveli", icon: "flower", tone: "rose", subtitle: "Hapur, Uttar Pradesh", description: "", dressCode: "" },
    { name: "Kerala Marriage", date: "2026-12-03", time: "11:00 AM to 12:00 PM", venueId: "shri-krishan-temple", icon: "lamp", tone: "peach", subtitle: "Guruvyaur, Kerala", description: "", dressCode: "" },
    { name: "Kerala Wedding rest Rituals", date: "2026-12-03", time: "1:00 PM to 4:00 PM", venueId: "mana", icon: "flower", tone: "sand", subtitle: "Guruvyaur, Kerala", description: "", dressCode: "" },
    { name: "Kerala Reception", date: "2026-12-06", time: "5:00 PM to 9:00 PM", venueId: "puttom-royal", icon: "flower", tone: "sage", subtitle: "Trivandrum, Kerala", description: "", dressCode: "" },
    { name: "God bharai & Sagai", date: "2027-02-13", time: "1:00 PM to 10:00 PM", venueId: "tonight", icon: "rings", tone: "sand", subtitle: "Hapur, Uttar Pradesh", description: "", dressCode: "" },
    { name: "Haldi & Mahendi", date: "2027-02-14", time: "11:00 AM to 2:00 PM", venueId: "manohar-regency", icon: "sun", tone: "yellow", subtitle: "Hapur, Uttar Pradesh", description: "", dressCode: "" },
    { name: "Sangeet", date: "2027-02-14", time: "7:00 PM to 11:00 PM", venueId: "manohar-regency", icon: "music", tone: "lavender", subtitle: "Hapur, Uttar Pradesh", description: "", dressCode: "" },
    { name: "Hapur Marriage", date: "2027-02-15", time: "8:00 PM to 4:00 AM on 16 February 2027", venueId: "manohar-regency", icon: "lamp", tone: "peach", subtitle: "Hapur, Uttar Pradesh", description: "", dressCode: "" }
  ],
  travel: {
    intro: "We're gathering in beautiful Kochi, where swaying palms meet quiet backwaters. Here's where the memories will be made.",
    note: "Planning your journey? Cochin International Airport (COK) is the nearest major airport. These are sample locations; please confirm actual venues and travel arrangements before booking."
  }
};
