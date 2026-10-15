const Store = (function () {
  const KEY = "mengjiao.letter.v1";
  let state = null;

  function defaultGroups() {
    return [
      { id: "none", name: "未分组" },
      { id: "g_say", name: "日常碎碎念" },
      { id: "g_night", name: "晚安系列" },
      { id: "g_miss", name: "想你系列" }
    ];
  }

  function toCard(text, group) {
    return { text: String(text), group: group || "none" };
  }

  function defaults() {
    return {
      version: 2,
      user: { name: "我", avatar: "", emoji: "🌸" },
      peer: { name: "梦角", avatar: "", emoji: "🌙" },
      groups: defaultGroups(),
      cards: DATA.DEFAULT_CARDS.map(t => toCard(t, "none")),
      atmo: { opening: DATA.DEFAULT_ATMOSPHERE.slice(), pat: DATA.DEFAULT_PAT.slice() },
      patDecor: { mine: "◆", peer: "★", mineAct: "拍了拍", peerAct: "拍了拍" },
      emojis: cloneEmojis(DATA.EMOJI_GROUPS),
      customStickers: [],
      images: [],
      messages: [],
      letters: [],
      mood: { emoji: "🌙", status: ["在发呆，等你"], ts: Date.now() },
      moodLog: [],
      dayFlags: {},
      timers: {},
      callPos: null,
      settings: {
        replyMin: 3,
        replyMax: 300,
        replyChance: 0.75,
        combine: false,
        combineMin: 1,
        combineMax: 3,
        combinePerMax: 2,
        patChance: 0.12,
        patReplyChance: 0.7,
        patMinePhrase: false,
        stickerChance: 0.14,
        quoteChance: 0.25,
        proactiveOn: true,
        proactiveMin: 1,
        proactiveMax: 15,
        proactiveChance: 0.6,
        callOn: true,
        callMin: 3,
        callMax: 20,
        callChance: 0.45,
        aiAnswerChance: 0.7,
        peerHangupChance: 0.05,
        callType: "voice",
        letterReplyMin: 1,
        letterReplyMax: 720,
        letterOn: true,
        letterMin: 60,
        letterMax: 1440,
        letterChance: 0.6,
        letterSentMin: 1,
        letterSentMax: 30,
        letterBreakChance: 0.6,
        letterParaMax: 2,
        moodHours: 1,
        moodChange: 0.7,
        opening: true,
        openingStyle: "orb",
        openingGlow: "#e79bb4",
        openingBg: "#241a26",
        openingText: "#f6e9ee",
        openingStar: "#ffffff",
        openingDot: "#f0a6c0",
        openingStars: 46,
        openingSky: true,
        theme: "sky",
        primary: "#3f8cff",
        myBubble: "#3f8cff",
        aiBubble: "#ffffff",
        bubbleStyle: "round",
        chatColor: "#f2f5fa",
        chatImage: "",
        fontSize: 16,
        font: "system",
        timeStyle: "time",
        showUserAvatar: true,
        favicon: "moon"
      }
    };
  }

  function cloneEmojis(src) {
    const out = {};
    Object.keys(src).forEach(function (k) {
      out[k] = src[k].slice();
    });
    return out;
  }

  function normalizeCards(cards) {
    if (!Array.isArray(cards) || !cards.length) return DATA.DEFAULT_CARDS.map(t => toCard(t, "none"));
    return cards
      .map(c => {
        if (typeof c === "string") return toCard(c, "none");
        if (c && typeof c.text === "string" && c.text.trim()) return { text: c.text.trim(), group: c.group || "none" };
        return null;
      })
      .filter(Boolean);
  }

  const EMOJI_KEEP = ["常用", "笑脸", "手势", "符号", "天气", "文字", "颜表情"];
  function pruneEmojis(saved) {
    const out = {};
    EMOJI_KEEP.forEach(function (g) {
      out[g] = (saved && Array.isArray(saved[g]) && saved[g].length ? saved[g].slice() : DATA.EMOJI_GROUPS[g].slice());
    });
    if (saved) {
      Object.keys(saved).forEach(function (g) {
        if (EMOJI_KEEP.indexOf(g) < 0 && Array.isArray(saved[g]) && saved[g].length) out[g] = saved[g].slice();
      });
    }
    return out;
  }

  function load() {
    let saved = null;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) saved = JSON.parse(raw);
    } catch (e) {
      saved = null;
    }
    const base = defaults();
    if (!saved || typeof saved !== "object") return base;
    const merged = Object.assign({}, base, saved);
    merged.user = Object.assign({}, base.user, saved.user || {});
    merged.peer = Object.assign({}, base.peer, saved.peer || {});
    merged.user.emoji = merged.user.emoji || base.user.emoji;
    merged.peer.emoji = merged.peer.emoji || base.peer.emoji;
    merged.settings = Object.assign({}, base.settings, saved.settings || {});
    merged.timers = saved.timers && typeof saved.timers === "object" ? saved.timers : {};
    merged.cards = normalizeCards(saved.cards);
    if (!merged.atmo || typeof merged.atmo !== "object") {
      const legacy = Array.isArray(saved.atmosphere) ? saved.atmosphere : DATA.DEFAULT_ATMOSPHERE.slice();
      merged.atmo = { opening: legacy.slice(), pat: (DATA.DEFAULT_PAT || legacy).slice() };
    }
    if (!Array.isArray(merged.atmo.opening) || !merged.atmo.opening.length) merged.atmo.opening = DATA.DEFAULT_ATMOSPHERE.slice();
    if (!Array.isArray(merged.atmo.pat) || !merged.atmo.pat.length) merged.atmo.pat = (DATA.DEFAULT_PAT || DATA.DEFAULT_ATMOSPHERE).slice();
    if (!merged.patDecor || typeof merged.patDecor !== "object") merged.patDecor = { mine: "◆", peer: "★", mineAct: "拍了拍", peerAct: "拍了拍" };
    if (!merged.patDecor.mine) merged.patDecor.mine = "◆";
    if (!merged.patDecor.peer) merged.patDecor.peer = "★";
    if (!merged.patDecor.mineAct) merged.patDecor.mineAct = "拍了拍";
    if (!merged.patDecor.peerAct) merged.patDecor.peerAct = "拍了拍";
    if (!Array.isArray(merged.groups) || !merged.groups.length) merged.groups = base.groups;
    if (!merged.groups.some(g => g.id === "none")) merged.groups.unshift({ id: "none", name: "未分组" });
    if (!Array.isArray(merged.messages)) merged.messages = [];
    if (!Array.isArray(merged.letters)) merged.letters = [];
    if (!Array.isArray(merged.moodLog)) merged.moodLog = [];
    if (!Array.isArray(merged.customStickers)) merged.customStickers = [];
    if (!Array.isArray(merged.images)) merged.images = [];
    if (!merged.emojis || typeof merged.emojis !== "object" || !Object.keys(merged.emojis).length) {
      merged.emojis = cloneEmojis(DATA.EMOJI_GROUPS);
    }
    merged.emojis = pruneEmojis(merged.emojis);
    if (!merged.emojis["颜表情"]) merged.emojis["颜表情"] = DATA.EMOJI_GROUPS["颜表情"].slice();
    if (!merged.mood || typeof merged.mood !== "object") merged.mood = base.mood;
    if (!merged.dayFlags || typeof merged.dayFlags !== "object") merged.dayFlags = {};
    if (Array.isArray(merged.messages)) {
      let touched = false;
      merged.messages.forEach(m => {
        if (m && m.kind === "note" && typeof m.text === "string" && m.text.indexOf("拍了拍") >= 0) {
          m.kind = "pat";
          m.mine = m.text.indexOf("你 拍了拍") === 0 || m.text.indexOf("你拍了拍") === 0;
          if (!m.text || !m.text.trim()) m.text = "";
          touched = true;
        }
      });
      if (touched) {
        try {
          localStorage.setItem(KEY, JSON.stringify(merged));
        } catch (e) {}
      }
    }
    return merged;
  }

  function save() {
    try {
      if (state.messages.length > 800) state.messages = state.messages.slice(-800);
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn("保存失败", e);
      return false;
    }
  }

  state = load();

  return {
    get: function () {
      return state;
    },
    save: save,
    clear: function () {
      localStorage.removeItem(KEY);
    },
    reload: function () {
      state = load();
      return state;
    },
    resetAll: function () {
      localStorage.removeItem(KEY);
      state = defaults();
      return state;
    },
    resetSettingDefaults: function (keep) {
      const base = defaults();
      if (keep) {
        const patch = {};
        Object.keys(keep).forEach(function (k) {
          patch[k] = keep[k];
        });
        return Object.assign(base.settings, patch);
      }
      return base.settings;
    },
    defaultState: defaults,
    defaultCards: function () {
      return DATA.DEFAULT_CARDS.map(t => toCard(t, "none"));
    },
    defaultAtmosphere: function () {
      return DATA.DEFAULT_ATMOSPHERE.slice();
    },
    defaultEmojis: function () {
      return cloneEmojis(DATA.EMOJI_GROUPS);
    },
    cardText: function (c) {
      return typeof c === "string" ? c : c.text;
    }
  };
})();