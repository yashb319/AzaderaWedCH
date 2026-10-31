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
    { id: "Guruvyaur", name: "Guruvyaur Temple", address: "Guruvyaur, Kerala, India", mapQuery: "Guruvyaur Temple", note: "Temple Marriage Venue" },
    { id: "garden", name: "The Backwater Garden (Demo)", address: "Sample wedding venue · Kochi, Kerala, India", mapQuery: "Kochi, Kerala, India", note: "A sample garden setting for the wedding ceremony." }
  ],
  events: [
    { name: "Roka", date: "2027-12-09", time: "11:00 AM", venueId: "courtyard", icon: "flower", tone: "rose", subtitle: "Where our families become one", description: "Blessings, happy tears, and the beginning of a beautiful bond.", dressCode: "Festive Indian" },
    { name: "Ring ceremony", date: "2027-12-09", time: "6:00 PM", venueId: "courtyard1", icon: "rings", tone: "sand", subtitle: "A little sparkle. A big promise.", description: "An evening to exchange rings and celebrate our forever.", dressCode: "Elegant evening wear" },
    { name: "Mehendi", date: "2027-12-10", time: "3:00 PM", venueId: "courtyard2", icon: "leaf", tone: "sage", subtitle: "Love, written in henna", description: "Intricate patterns, favourite songs, and stories over chai.", dressCode: "Shades of green" },
    { name: "Haldi", date: "2027-12-11", time: "10:00 AM", venueId: "courtyard3", icon: "sun", tone: "yellow", subtitle: "A little sunshine, a lot of laughter", description: "A joyful morning of turmeric, flowers, and playful blessings.", dressCode: "A splash of yellow" },
    { name: "Sangeet", date: "2027-12-11", time: "7:00 PM", venueId: "courtyard4", icon: "music", tone: "lavender", subtitle: "Two families. One dance floor.", description: "Bring your best moves. We'll bring the music and the memories.", dressCode: "Ready to sparkle" },
    { name: "The wedding", date: "2027-12-12", time: "10:30 AM", venueId: "garden", icon: "lamp", tone: "peach", subtitle: "Two traditions, one sacred promise", description: "Kerala grace meets North Indian warmth as we begin our next chapter.", dressCode: "Traditional Indian · ivory & gold welcome" }
  ],
  travel: {
    intro: "We're gathering in beautiful Kochi, where swaying palms meet quiet backwaters. Here's where the memories will be made.",
    note: "Planning your journey? Cochin International Airport (COK) is the nearest major airport. These are sample locations; please confirm actual venues and travel arrangements before booking."
  }
};
