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
    hookNextHi: "ऋषि-सभा में गूँजती कृष्ण द्वैपायन व्यास की अमर वाणी।"
  },
  "vyasa-vaishampayana": {
    scene: ART.vyasa,
    primary: "vyasa",
    hookNextHi: "इतिहास की परम्परा: एक रचना, दो सभाएँ, और सनातन ज्ञान।"
  },
  "kadru-vinata-wager": {
    scene: ART.wager,
    primary: "kadru",
    hookNextHi: "उच्चैःश्रवा पर छल की बाज़ी और नागों पर महा-अग्नि का शाप।"
  },
  "garuda-amrita": {
    scene: ART.garuda,
    primary: "garuda",
    hookNextHi: "अमृत भी शाप न काट सका; अब एक तपोनिष्ठ बालक की आवश्यकता है।"
  },
  "elapatra-prophecy": {
    scene: ART.elapatra,
    primary: "elapatra",
    hookNextHi: "ब्रह्माजी का अमर वचन: आस्तीक ही सर्पसत्र का निवारण करेगा।"
  },
  "astika-born": {
    scene: ART.astikaBorn,
    primary: "astika",
    hookNextHi: "यज्ञशाला के द्वार पर वह बालक, जो प्रज्वलित अग्नि को थामेगा।"
  },
  "parikshit-shamika": {
    scene: ART.parikshit,
    primary: "parikshit",
    hookNextHi: "सात दिन की अवधि: तक्षक का विष और कुरु-सिंहासन का संकट।"
  },
  "takshaka-kills-parikshit": {
    scene: ART.takshaka,
    primary: "takshaka",
    hookNextHi: "पिता का वध: बालक जनमेजय का प्रतिशोध सम्पूर्ण नाग-जाति पर उतरेगा।"
  },
  "janamejaya-sarpa-satra": {
    scene: ART.satra,
    primary: "janamejaya",
    hookNextHi: "यह महा-अग्नि नई नहीं; युगों पूर्व नागमाता कद्रू ने इसे बोया था।"
  },
  "astika-stops-satra": {
    scene: ART.stops,
    primary: "astika",
    hookNextHi: "नैमिषारण्य के तपोवन में इस अमर इतिहास का श्रवण।"
  }
};

export const CHAR_ART = {
  ugrashravas: {
    portrait: "art/characters/ugrashravas.jpg",
    hookHi: "पौराणिक सूत-पुत्र — प्राचीन इतिहास और गाथाओं के मर्मज्ञ वक्ता।"
  },
  janamejaya: {
    portrait: "art/characters/janamejaya.jpg",
    hookHi: "परीक्षित-पुत्र चक्रवर्ती राजा — पिता के वध का प्रतिशोध लेने वाले।"
  },
  kadru: {
    portrait: "art/characters/kadru.jpg",
    hookHi: "नागों की आदि-माता — छल की बाज़ी और कठोर शाप की दात्री।"
  },
  garuda: {
    portrait: "art/characters/garuda.jpg",
    hookHi: "पक्षीराज गरुड़ — स्वर्ग से अमृत छीनकर माता को मुक्त कराने वाले।"
  },
  takshaka: {
    portrait: "art/characters/takshaka.jpg",
    hookHi: "नागराज तक्षक — शृङ्गी के शाप को सिद्ध करने वाले महाविषधर।"
  },
  astika: {
    portrait: "art/characters/astika.jpg",
    hookHi: "जरत्कारु-पुत्र मुनि आस्तीक — वेद-स्तुति से सर्पसत्र को थामने वाले।"
  },
  vyasa: {
    portrait: "art/characters/vyasa.jpg",
    hookHi: "भगवान कृष्ण द्वैपायन व्यास — महाभारत-इतिहास के दिव्य रचयिता।"
  },
  parikshit: {
    portrait: "art/characters/parikshit.jpg",
    hookHi: "अभिमन्यु-पुत्र सम्राट परीक्षित — जिनके प्रमाद से इतिहास ने मोड़ लिया।"
  },
  elapatra: {
    portrait: "art/characters/elapatra.jpg",
    hookHi: "ज्ञानी नाग ऐलापत्र — ब्रह्माजी के अभय-वचन को उद्घाटित करने वाले।"
  },
  vinata: {
    portrait: "art/characters/vinata.jpg",
    hookHi: "गरुड़ की माता — छल की बाज़ी में दासी बनीं प्रजापति-कन्या।"
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
