(() => {
  "use strict";
  const config = window.WEDDING_CONFIG;
  const byId = id => document.getElementById(id);
  const audio = new Audio();
  audio.preload = "auto";
  audio.loop = true;
  const musicAllowed = config?.music?.enabled !== false;
  let audioValid = false;
  let playPending = false;
  const playbackError = message => {
    byId("music-status").textContent = message;
    byId("music-status").hidden = false;
  };
  try {
    if (config?.music?.src) {
      const url = new URL(config.music.src, document.baseURI);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("Music must be a local path or HTTPS URL.");
      audio.src = url.href;
      audio.volume = Number.isFinite(config.music.volume) ? Math.min(1, Math.max(0, config.music.volume)) : 0.35;
      audioValid = true;
    }
  } catch (error) {
    console.error("Wedding music configuration:", error);
    playbackError(error.message);
  }
  audio.addEventListener("error", () => {
    console.warn("Wedding music asset failed:", audio.error?.code);
    playbackError("Music could not load. We will retry on your next tap. You can keep exploring.");
  });
  audio.addEventListener("playing", () => { byId("music-status").hidden = true; });
  function playMusic() {
    if (!audioValid || !musicAllowed || audio.volume === 0 || (!audio.paused && !playPending && !audio.error)) return;
    if (audio.error) audio.load();
    // Register before showing the gates; never await Three.js or media loading in a gesture.
    const pending = audio.play();
    playPending = true;
    pending.catch(error => {
      if (error.name === "AbortError") return;
      if (error.name === "NotAllowedError") {
        playbackError("Tap anywhere to start the wedding music.");
        return;
      }
      console.warn("Wedding music playback:", error);
      playbackError("Music could not start. We will retry on your next tap. You can keep exploring.");
    }).finally(() => { playPending = false; });
  }
  for (const type of ["pointerdown", "touchstart", "click", "keydown"]) {
    document.addEventListener(type, playMusic, { capture: true, passive: true });
  }
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !playPending) playMusic();
  });
  window.addEventListener("pageshow", playMusic);
  window.WEDDING_MUSIC = {
    getState: () => ({ paused: audio.paused, time: audio.currentTime, volume: audio.volume, error: audio.error?.code || null })
  };
  playMusic();
  const setText = (id, value) => { byId(id).textContent = value; };
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const parseDate = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`Use YYYY-MM-DD for date: ${value}`);
    const date = new Date(`${value}T12:00:00Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) throw new Error(`Invalid wedding date: ${value}`);
    return date;
  };
  const formatDate = (value, options) => new Intl.DateTimeFormat(config.locale, { ...options, timeZone: "UTC" }).format(parseDate(value));
  const mapUrl = venue => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.mapQuery || venue.address)}`;
  const externalLink = (text, href) => {
    const link = element("a", "", text);
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  };
  const safeImage = value => {
    const url = new URL(value, document.baseURI);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("Images must use local paths or HTTPS/HTTP URLs.");
    return url.href;
  };
  const icons = {
    flower: '<path d="M16 17C3 15 9 2 16 11C23 2 29 15 16 17C29 20 20 30 16 21C12 30 3 20 16 17Z"/><circle cx="16" cy="17" r="3"/>',
    rings: '<circle cx="12" cy="19" r="8"/><circle cx="21" cy="19" r="8"/><path d="M16 4L12 8L16 11L20 8Z"/>',
    leaf: '<path d="M7 27C5 11 14 5 27 5C29 18 21 26 7 27ZM7 27L23 10M13 21L12 13M18 16L25 16"/>',
    sun: '<circle cx="16" cy="16" r="7"/><path d="M16 2V5M16 27V30M2 16H5M27 16H30M6 6L8 8M24 24L26 26M6 26L8 24M24 8L26 6"/>',
    music: '<path d="M12 23V7L26 4V20M12 11L26 8"/><ellipse cx="8" cy="25" rx="4" ry="3"/><ellipse cx="22" cy="22" rx="4" ry="3"/>',
    lamp: '<path d="M5 18Q16 30 27 18ZM16 23V29M10 29H22M16 15C9 9 17 8 16 2C24 10 20 13 16 15Z"/>'
  };
  const svgNode = (markup, viewBox = "0 0 32 32") => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("aria-hidden", "true");
    // Only the original artwork below enters innerHTML; configuration is always text.
    svg.innerHTML = markup;
    return svg;
  };
  const portraits = {
    groom: '<path fill="#dce1ce" d="M0 0H190V230H0Z"/><path d="M0 196Q40 154 86 190T190 170V230H0" fill="#c4cfb0"/><path d="M30 230L37 152Q91 123 149 155L164 230" fill="#b8624a"/><path d="M79 144L91 162L107 143L116 230H76" fill="#edd3a0"/><path d="M53 230L60 157M138 230L128 153" stroke="#d09265" stroke-width="3"/><path d="M80 120H108V151Q94 162 80 150" fill="#b77c55"/><ellipse cx="94" cy="93" rx="35" ry="42" fill="#c58b63"/><path d="M58 93Q48 44 89 43Q136 40 130 94L121 76Q93 78 74 64L66 91" fill="#33362c"/><path d="M65 109Q93 144 123 109Q123 140 94 143Q68 139 65 109" fill="#454031"/><path d="M85 114Q94 119 103 113" stroke="#f4d0ab" stroke-width="2" fill="none"/><path d="M74 92H84M105 92H115" stroke="#493a2e" stroke-width="3"/><circle cx="91" cy="172" r="2" fill="#a17c41"/><circle cx="92" cy="192" r="2" fill="#a17c41"/><path d="M15 61Q41 55 42 21M164 109Q143 71 171 38" stroke="#92a17d" fill="none" stroke-width="3"/>',
    bride: '<path fill="#f0e2d4" d="M0 0H190V230H0Z"/><path d="M0 210Q53 157 100 190T190 175V230H0" fill="#e5cdbb"/><path d="M54 111Q39 35 94 36Q147 34 137 124L142 193H46" fill="#30342b"/><path d="M23 230L35 158Q93 128 151 158L171 230" fill="#f8efda"/><path d="M44 153L145 230M28 211L62 230" stroke="#c5a15e" stroke-width="17"/><path d="M47 151L149 230M26 203L69 230" stroke="#e4c57e" stroke-width="3"/><path d="M81 120H108V148Q95 162 81 147" fill="#ac714e"/><ellipse cx="95" cy="92" rx="31" ry="40" fill="#bd835d"/><path d="M62 87Q59 45 95 43Q131 44 127 85Q101 76 95 53Q86 75 62 87" fill="#30342b"/><path d="M76 91H84M106 91H114" stroke="#44392b" stroke-width="3"/><path d="M85 112Q94 120 104 111" fill="none" stroke="#7f4234" stroke-width="2"/><circle cx="95" cy="82" r="2.5" fill="#a54b37"/><circle cx="63" cy="108" r="5" fill="#d2a24d"/><circle cx="127" cy="108" r="5" fill="#d2a24d"/><path d="M73 144Q95 178 117 144" fill="none" stroke="#c99d46" stroke-width="5"/><path d="M57 59Q42 80 51 115" stroke="#f8f2d8" stroke-width="8" stroke-dasharray="2 7" fill="none"/><path d="M155 51L165 61M160 46L160 66M15 110L25 120M20 105L20 125" stroke="#bd9b64" stroke-width="2"/>'
  };
  try {
    if (!config) throw new Error("wedding.config.js did not load.");
    parseDate(config.wedding.date);
    const venueIds = new Set(config.venues.map(venue => venue.id));
    if (venueIds.size !== config.venues.length) throw new Error("Venue ids must be unique.");
    config.events.forEach(event => {
      parseDate(event.date);
      if (!venueIds.has(event.venueId)) throw new Error(`Unknown venueId for ${event.name}: ${event.venueId}`);
    });
    document.title = config.pageTitle;
    document.querySelector('meta[name="description"]').content = config.description;
    document.documentElement.lang = config.locale.split("-")[0];
    const { groom, bride } = config.couple;
    setText("brand-name", config.siteName);
    setText("groom-first", groom.firstName);
    setText("bride-first", bride.firstName);
    setText("hero-tagline", config.wedding.tagline);
    setText("wedding-date", formatDate(config.wedding.date, { day: "numeric", month: "long", year: "numeric" }));
    byId("wedding-date").dateTime = config.wedding.date;
    setText("hero-place", config.wedding.locationLabel);
    byId("hero-image").src = safeImage(config.heroImage.src);
    byId("hero-image").alt = config.heroImage.alt;
    setText("welcome-copy", config.wedding.welcome);
    setText("story-intro", config.story.intro);
    setText("event-footnote", config.wedding.eventFootnote);
    setText("travel-intro", config.travel.intro);
    setText("travel-note", config.travel.note);
    setText("closing-copy", config.wedding.closing);
    setText("footer-names", `${groom.firstName} & ${bride.firstName}`);
    byId("demo-banner").hidden = !config.demoMode;
    byId("footer-demo").hidden = !config.demoMode;
    config.story.chapters.forEach((chapter, index) => {
      const article = element("article", "chapter");
      const meta = element("p", "chapter-meta", chapter.label);
      meta.prepend(element("span", "chapter-index", String(index + 1).padStart(2, "0")));
      meta.append(element("span", "", chapter.date));
      article.append(meta, element("h3", "", chapter.title), element("p", "", chapter.text));
      byId("story-timeline").append(article);
    });
    const tones = new Set(["rose", "sand", "sage", "yellow", "lavender", "peach"]);
    config.events.forEach((event, index) => {
      const venue = config.venues.find(item => item.id === event.venueId);
      const article = element("article", `event-card tone-${tones.has(event.tone) ? event.tone : "rose"}`);
      const icon = element("div", "event-icon");
      icon.append(svgNode(icons[event.icon] || icons.flower));
      const details = element("div", "event-details");
      const date = element("time", "", `${formatDate(event.date, { day: "numeric", month: "short", year: "numeric" })} · ${event.time}`);
      date.dateTime = event.date;
      details.append(date, externalLink(`${venue.name} ↗`, mapUrl(venue)));
      const dressCode = element("p", "dress-code");
      dressCode.append(element("span", "", "Attire"), element("span", "", event.dressCode || "Dress code not yet provided"));
      article.append(icon, element("span", "event-number", String(index + 1).padStart(2, "0")), element("h3", "", event.name), element("p", "event-subtitle", event.subtitle), element("p", "event-description", event.description), details, dressCode);
      const directions = element("p", "event-directions", event.directions || venue.directions || "Directions not yet provided. Use the venue's Maps link to plan your journey.");
      const explore = element("button", "explore-event", "Enter this celebration ↗");
      explore.addEventListener("click", () => window.dispatchEvent(new CustomEvent("wedding:explore", { detail: { index, trigger: explore } })));
      article.append(directions, explore);
      byId("event-grid").append(article);
    });
    ["groom", "bride"].forEach(role => {
      const person = config.couple[role];
      const article = element("article", "person-card");
      const portrait = element("div", "portrait");
      if (person.image) {
        const image = element("img");
        image.src = safeImage(person.image);
        image.alt = person.imageAlt;
        image.loading = "lazy";
        portrait.append(image);
      } else {
        portrait.setAttribute("role", "img");
        portrait.setAttribute("aria-label", `Decorative illustrated ${role}; not a photograph`);
        portrait.append(svgNode(portraits[role], "0 0 190 230"));
      }
      article.append(portrait, element("p", "person-label", `Meet the ${role}`), element("h3", "", person.fullName), element("p", "person-roots", person.roots), element("p", "person-bio", person.bio));
      byId("couple-grid").append(article);
    });
    ["groom", "bride"].forEach(role => {
      const section = element("section", "family-group");
      section.append(element("h3", "", `${config.couple[role].firstName}'s family`));
      const members = config.family?.[role] || [];
      if (!members.length) section.append(element("p", "family-empty", "Family introductions are coming soon. Add names, relationships, and optional photos in wedding.config.js."));
      members.forEach(member => {
        const article = element("article", "family-member");
        if (member.image) {
          const image = element("img");
          image.src = safeImage(member.image);
          image.alt = member.imageAlt || `Portrait of ${member.name}`;
          image.loading = "lazy";
          article.append(image);
        }
        article.append(element("h4", "", member.name), element("p", "relationship", member.relationship || ""), element("p", "", member.bio || ""));
        section.append(article);
      });
      byId("family-groups").append(section);
    });
    config.venues.forEach(venue => {
      const article = element("article", "venue");
      article.append(element("h3", "", venue.name), element("p", "", venue.address), element("p", "", venue.note), externalLink(`View ${venue.name} on maps ↗`, mapUrl(venue)));
      byId("venue-list").append(article);
    });
    if (config.wedding.contactEmail) {
      const email = config.wedding.contactEmail;
      if (!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email)) throw new Error("Enter a valid contactEmail or leave it empty.");
      byId("contact-link").href = `mailto:${email}`;
      byId("contact-link").hidden = false;
    }
    document.querySelectorAll("img").forEach(image => {
      const reportError = () => {
        console.error(`Could not load wedding image: ${image.src}`);
        const notice = element("p", "image-error", "Image unavailable. Check its path in wedding.config.js.");
        notice.setAttribute("role", "status");
        image.replaceWith(notice);
      };
      image.addEventListener("error", reportError, { once: true });
      if (image.complete && !image.naturalWidth) reportError();
    });
  } catch (error) {
    console.error("Wedding configuration error:", error);
    const notice = element("div", "error-note", `Wedding details could not load. Please check wedding.config.js: ${error.message}`);
    notice.setAttribute("role", "alert");
    document.body.prepend(notice);
    byId("replay-entrance").hidden = true;
    return;
  }
  const entrance = byId("entrance");
  const site = byId("site");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let exitTimer;
  let focusAfterClose = byId("replay-entrance");
  let opening = false;
  const showEntrance = () => {
    clearTimeout(exitTimer);
    opening = false;
    entrance.classList.remove("is-opening", "is-fading");
    window.WEDDING_EXPERIENCE?.reset();
    entrance.hidden = false;
    site.inert = true;
    document.querySelector(".skip-link").inert = true;
    document.body.classList.add("entrance-active");
    byId("open-gates").focus();
  };
  const closeEntrance = (animate = false) => {
    if (animate && window.WEDDING_EXPERIENCE) {
      window.WEDDING_EXPERIENCE.enter();
      return;
    }
    if (opening && animate) return;
    clearTimeout(exitTimer);
    const finish = () => {
      entrance.hidden = true;
      site.inert = false;
      document.querySelector(".skip-link").inert = false;
      document.body.classList.remove("entrance-active");
      opening = false;
      focusAfterClose.focus({ preventScroll: true });
    };
    if (animate && !reducedMotion.matches) {
      opening = true;
      entrance.classList.add("is-opening");
      exitTimer = setTimeout(() => {
        entrance.classList.add("is-fading");
        exitTimer = setTimeout(finish, 700);
      }, 1600);
    } else finish();
  };
  byId("open-gates").addEventListener("click", () => closeEntrance(true));
  byId("skip-entrance").addEventListener("click", () => closeEntrance());
  byId("replay-entrance").addEventListener("click", () => {
    focusAfterClose = byId("replay-entrance");
    showEntrance();
  });
  byId("explore-fort").addEventListener("click", () => window.dispatchEvent(new CustomEvent("wedding:explore", { detail: { trigger: byId("explore-fort") } })));
  window.addEventListener("wedding:explore", event => {
    focusAfterClose = event.detail.trigger || byId("explore-fort");
    showEntrance();
    if (window.WEDDING_EXPERIENCE) window.WEDDING_EXPERIENCE.enter(event.detail.index);
    else window.addEventListener("wedding:experience-ready", () => window.WEDDING_EXPERIENCE.enter(event.detail.index), { once: true });
  });
  entrance.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      if (window.WEDDING_EXPERIENCE?.isInsideEvent()) window.WEDDING_EXPERIENCE.back();
      else closeEntrance();
    }
    if (event.key === "Tab") {
      const focusable = Array.from(entrance.querySelectorAll('button:not(:disabled),a[href]')).filter(node => node.getClientRects().length && getComputedStyle(node).visibility !== "hidden");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === byId("fort-title"))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  reducedMotion.addEventListener("change", () => { if (reducedMotion.matches && !entrance.hidden && !entrance.classList.contains("is-exploring")) closeEntrance(); });
  if (!location.hash && !reducedMotion.matches) {
    focusAfterClose = document.querySelector(".header-cta");
    showEntrance();
  }
})();
