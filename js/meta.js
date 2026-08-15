export const WORLD = { w: 2800, h: 1800 };

export const ART = {
  naimisha: "art/scenes/naimisha.jpg",
  vyasa: "art/scenes/vyasa.jpg",
  wager: "art/scenes/wager.jpg",
  garuda: "art/scenes/garuda.jpg",
  elapatra: "art/scenes/elapatra.jpg",
  astikaBorn: "art/scenes/astika-born.jpg",
  parikshit: "art/scenes/parikshit.jpg",
  takshaka: "art/scenes/takshaka.jpg",
  satra: "art/scenes/satra.jpg",
  stops: "art/scenes/astika-stops.jpg"
};

export const EVENT_ART = {
  "naimisha-satra": {
    scene: ART.naimisha,
    primary: "ugrashravas",
    hookNextHi: "रुको — ये कथा किसी और के कान में चल रही है।"
  },
  "vyasa-vaishampayana": {
    scene: ART.vyasa,
    primary: "vyasa",
    hookNextHi: "महाभारत की शुरुआत: एक बच्चा, एक राजा, एक यज्ञ जो रुक गया। युद्ध अभी बाकी है।"
  },
  "kadru-vinata-wager": {
    scene: ART.wager,
    primary: "kadru",
    hookNextHi: "माँ ने अपने बच्चों को उसी आग में डाल दिया।"
  },
  "garuda-amrita": {
    scene: ART.garuda,
    primary: "garuda",
    hookNextHi: "अमर नहीं हुए। अब एक बच्चा चाहिए।"
  },
  "elapatra-prophecy": {
    scene: ART.elapatra,
    primary: "elapatra",
    hookNextHi: "नाम आस्तीक है। शरीर अभी नहीं।"
  },
  "astika-born": {
    scene: ART.astikaBorn,
    primary: "astika",
    hookNextHi: "द्वार पर बालक। कुण्ड अभी जल रहा है।"
  },
  "parikshit-shamika": {
    scene: ART.parikshit,
    primary: "parikshit",
    hookNextHi: "सात दिन। राजा छिपेगा। साँप आएगा ही।"
  },
  "takshaka-kills-parikshit": {
    scene: ART.takshaka,
    primary: "takshaka",
    hookNextHi: "बच्चा गद्दी पर है। वह एक नाग नहीं — जाति जलाएगा।"
  },
  "janamejaya-sarpa-satra": {
    scene: ART.satra,
    primary: "janamejaya",
    hookNextHi: "यह आग नई नहीं। बहुत पहले एक माँ ने बोई थी।"
  },
  "astika-stops-satra": {
    scene: ART.stops,
    primary: "astika",
    hookNextHi: "यह कथा जंगल में सुनी जा रही है — युद्ध के बहुत बाद।"
  }
};

export const CHAR_ART = {
  ugrashravas: {
    portrait: "art/characters/ugrashravas.jpg",
    hookHi: "कथा का गायक। युद्ध पहले ही हो चुका है।"
  },
  janamejaya: {
    portrait: "art/characters/janamejaya.jpg",
    hookHi: "पिता का बदला — एक यज्ञ, सारे नाग।"
  },
  kadru: {
    portrait: "art/characters/kadru.jpg",
    hookHi: "नागों की माता। बाज़ी, छल, और शाप।"
  },
  garuda: {
    portrait: "art/characters/garuda.jpg",
    hookHi: "अमृत लाए। शाप फिर भी नहीं मिटा।"
  },
  takshaka: {
    portrait: "art/characters/takshaka.jpg",
    hookHi: "शाप का दाँत। एक डस, एक राज्य-यज्ञ।"
  },
  astika: {
    portrait: "art/characters/astika.jpg",
    hookHi: "बालक जिसने आग थामी।"
  },
  vyasa: {
    portrait: "art/characters/vyasa.jpg",
    hookHi: "रचयिता — और वंश के भीतर भी बँधे।"
  },
  parikshit: {
    portrait: "art/characters/parikshit.jpg",
    hookHi: "एक मरा सर्प। एक राज्य का बीज।"
  },
  elapatra: {
    portrait: "art/characters/elapatra.jpg",
    hookHi: "सत्र होगा। आस्तीक उसे रोकेगा।"
  },
  vinata: {
    portrait: "art/characters/vinata.jpg",
    hookHi: "बाज़ी हारी। गरुड़ की माँ दासी हुई।"
  }
};

export function nodePos(event) {
  const bandY = { 0: 0.22, 1: 0.52, 2: 0.78 };
  return {
    x: (0.13 + event.t * 0.74) * WORLD.w,
    y: bandY[event.band] * WORLD.h
  };
}

export function edgeColor(type) {
  if (type === "curse") return "#7a1810";
  if (type === "vow/revenge") return "#1c2748";
  return "#9a7428";
}

export function typeHi(type) {
  if (type === "curse") return "शाप";
  if (type === "vow/revenge") return "बदला";
  return "जन्म";
}
