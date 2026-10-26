(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pickOne = arr => arr[randInt(0, arr.length - 1)];
  const pickN = (arr, n) => {
    const copy = arr.slice();
    const out = [];
    for (let i = 0; i < n && copy.length; i++) out.push(copy.splice(randInt(0, copy.length - 1), 1)[0]);
    return out;
  };
  const esc = s =>
    String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = n => String(n).padStart(2, "0");
  const fmtTime = ts => {
    const d = new Date(ts);
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  };
  const dateKey = ts => {
    const d = new Date(ts);
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  };
  const fmtDate = ts => {
    const d = new Date(ts);
    return d.getFullYear() + "年" + (d.getMonth() + 1) + "月" + d.getDate() + "日";
  };
  const sameDay = (a, b) => dateKey(a) === dateKey(b);
  const fmtDur = ms => {
    const s = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h ? h + ":" + pad(m) + ":" + pad(sec) : pad(m) + ":" + pad(sec);
  };
  const weekName = ts => "周" + "日一二三四五六"[new Date(ts).getDay()];

  let state = Store.get();
  const S = () => state.settings;
  const persist = () => Store.save();

  const handles = {};
  let typingOn = false;
  let quoteRef = null;
  let attachRef = null;
  let attachKind = "image";
  let call = null;
  let toastTimer = null;
  let patTimer = null;
  let setTab = "reply";
  let diaryDay = Date.now();
  let letterView = null;
  let dateForm = null;
  let dateType = "anniv";
  let quizForm = null;
  let quizDraft = null;
  let emojiFilter = "";
  let cardSearch = "";
  let cardGroup = "all";
  let cardBatch = false;
  let cardPick = {};
let editingCard = null;
  let addGroup = "none";
  let emojiBatch = false;
  let emojiPick = {};
  let stickerBatch = false;
  let stickerPick = {};
  let faviconPick = null;
let decorDraft = null;
let emojiAddGroup = null;

  const PAIR_KEYS = [
    ["replyMin", "replyMax"],
    ["combineMin", "combineMax"],
    ["proactiveMin", "proactiveMax"],
    ["callMin", "callMax"],
    ["letterReplyMin", "letterReplyMax"],
    ["letterSentMin", "letterSentMax"],
    ["letterMin", "letterMax"],
    ["quizReplyMin", "quizReplyMax"]
  ];

  const APPEARANCE_KEYS = ["theme", "primary", "myBubble", "aiBubble", "bubbleStyle", "chatColor", "chatImage", "fontSize", "font", "timeStyle", "favicon", "openingStyle", "openingGlow", "openingBg", "openingText", "openingStar", "openingDot", "openingStars", "openingSky"];
const RERENDER_KEYS = ["bubbleStyle", "font", "timeStyle", "showUserAvatar", "theme", "primary", "myBubble", "aiBubble", "favicon"];

  const el = {
    app: $("#app"),
    opening: $("#opening"),
    openingText: $("#openingText"),
    openingSub: $("#openingSub"),
    openingEnter: $("#openingEnter"),
    sky: $("#openingSky"),
    peerAvatar: $("#peerAvatar"),
    peerLabel: $("#peerLabel"),
    peerStatus: $("#peerStatus"),
    peerBox: $("#peerBox"),
    myAvatarBtn: $("#myAvatarBtn"),
    myAvatarBox: $("#myAvatarBox"),
    myLabel: $("#myLabel"),
    quickBar: $("#quickBar"),
    favBadge: $("#favBadge"),
    letterBadge: $("#letterBadge"),
    quizBadge: $("#quizBadge"),
    chat: $("#chatList"),
    input: $("#input"),
    send: $("#btnSend"),
    imageBtn: $("#btnImage"),
    stickerBtn: $("#btnSticker"),
    moreBtn: $("#btnMore"),
    cardsBtn: $("#btnCards"),
    stickerPanel: $("#stickerPanel"),
    emojiPane: $("#emojiPane"),
    customPane: $("#customPane"),
    imagePane: $("#imagePane"),
    emojiGrid: $("#emojiGrid"),
    customGrid: $("#customGrid"),
    imageGrid: $("#imageGrid"),
    emojiSearch: $("#emojiSearch"),
    quoteBar: $("#quoteBar"),
    quoteText: $("#quoteText"),
    attachBar: $("#attachBar"),
    attachImg: $("#attachImg"),
    attachTxt: $("#attachTxt"),
    modal: $("#modal"),
    modalTitle: $("#modalTitle"),
    modalBody: $("#modalBody"),
    toast: $("#toast"),
    patHint: $("#patHint"),
    callOverlay: $("#callOverlay"),
    callName: $("#callName"),
    callSub: $("#callSub"),
    callTimer: $("#callTimer"),
    callAvaWrap: $("#callAvaWrap"),
    callAvatar: $("#callAvatar"),
    callZoom: $("#callZoom"),
    selfPreview: $("#selfPreview"),
    selfPreviewImg: $("#selfPreviewImg"),
    btnAnswer: $("#btnAnswer"),
    hangupLabel: $("#hangupLabel"),
    btnMute: $("#btnMute"),
    btnSpeaker: $("#btnSpeaker"),
    btnVideo: $("#btnVideo"),
    callBubble: $("#callBubble"),
    cropper: $("#cropper"),
    cropStage: $("#cropStage"),
    cropRect: $("#cropRect"),
    cropImg: $("#cropImg"),
    cropOk: $("#cropOk"),
    cropCancel: $("#cropCancel"),
    bubbleAvatar: $("#bubbleAvatar"),
    bubbleName: $("#bubbleName"),
    bubbleTimer: $("#bubbleTimer"),
    todayPopup: $("#todayPopup"),
    todayDate: $("#todayDate"),
    todayEmo: $("#todayEmo"),
    todaySt: $("#todaySt"),
    faviconLink: $("#faviconLink")
  };

  function toast(text) {
    el.toast.textContent = text;
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.toast.hidden = true;
    }, 2200);
  }

  function patHint(text) {
    el.patHint.innerHTML = text;
    el.patHint.hidden = false;
    clearTimeout(patTimer);
    patTimer = setTimeout(() => {
      el.patHint.hidden = true;
    }, 2600);
  }

  function openingLine() {
    const list = state.atmo.opening.length ? state.atmo.opening : Store.defaultAtmosphere();
    return pickOne(list);
  }

  function patLine() {
    const clean = arr =>
      (arr || []).filter(t => t && String(t).replace(/[\s\u200b-\u200d\ufeff]/g, "").length > 0).map(t => String(t).replace(/[\u200b-\u200d\ufeff]/g, "").trim());
    const list = clean(state.atmo.pat);
    const pool = list.length ? list : clean(DATA.DEFAULT_PAT);
    const line = pool.length ? pickOne(pool) : "";
    return line || clean(DATA.DEFAULT_PAT)[0] || "歪头对着屏幕轻轻眨眼";
  }

  function patText(m) {
    const t = m && m.text != null ? String(m.text).replace(/[\u200b-\u200d\ufeff]/g, "").trim() : "";
    return t || patLine();
  }

  function cardText(c) {
    return typeof c === "string" ? c : c.text;
  }

  function pickCards(n) {
    const pool = state.cards.length ? state.cards.map(cardText) : Store.defaultCards().map(cardText);
    const got = pickN(pool, n);
    return got.length ? got : ["……"];
  }

  function timeLabel(ts) {
    const style = S().timeStyle || "time";
    if (style === "none") return "";
    if (style === "time") return fmtTime(ts);
    if (style === "date") return fmtDate(ts);
    if (style === "datetime") return fmtDate(ts) + " " + fmtTime(ts);
    if (style === "relative") {
      const d = Date.now() - ts;
      if (d < 60000) return "刚刚";
      if (d < 3600000) return Math.floor(d / 60000) + " 分钟前";
      if (sameDay(ts, Date.now())) return fmtTime(ts);
      if (d < 172800000) return "昨天 " + fmtTime(ts);
      return fmtDate(ts);
    }
    return fmtTime(ts);
  }

  /* ===================== 消息 ===================== */

  function pushMsg(msg) {
    msg.id = msg.id || uid();
    msg.ts = msg.ts || Date.now();
    if (msg.fav === undefined) msg.fav = false;
    if (msg.recalled === undefined) msg.recalled = false;
    state.messages.push(msg);
    if (state.messages.length > 800) state.messages.splice(0, state.messages.length - 800);
    persist();
    return msg;
  }

  function findMsg(id) {
    return state.messages.filter(m => m.id === id)[0];
  }

  function avatarHTML(person, cls, fallback) {
    if (person.avatar) return '<img class="avatar ' + cls + '" src="' + esc(person.avatar) + '" alt="" />';
    return (
      '<span class="avatar txt ' + cls + '">' + esc(person.emoji || fallback || "🌙") + "</span>"
    );
  }

  function msgHTML(m) {
if (m.kind === "pat") {
      const decor = state.patDecor;
      const d = m.mine ? decor.mine : decor.peer;
      const act = (m.mine ? decor.mineAct : decor.peerAct) || "拍了拍";
      const showPhrase = m.mine ? S().patMinePhrase === true : true;
      const who = m.mine ? state.user.name : state.peer.name;
      const to = m.mine ? state.peer.name : state.user.name;
      const deco = d ? '<span class="pd">' + esc(d) + "</span> " : "";
      const decoEnd = d ? ' <span class="pd">' + esc(d) + "</span>" : "";
      const phrase = showPhrase && m.text ? " 【" + esc(m.text) + "】" : "";
      return (
        '<div class="sys-pat" data-id="' + m.id + '"><i class="pl"></i>' +
        '<span class="ptxt">' + deco + esc(who) + " " + esc(act) + " " + esc(to) + phrase + decoEnd + "</span>" +
        '<i class="pr"></i></div>'
      );
    }
    if (m.kind === "note") {
      return '<div class="sys-msg" data-id="' + m.id + '"><span>' + esc(m.text) + "</span></div>";
    }
    if (m.kind === "letter") {
      const l = state.letters.filter(x => x.id === m.letterId)[0];
      if (!l) return "";
      const who = m.role === "me" ? "我写给" + state.peer.name : state.peer.name + "的回信";
      const preview = (l.content || "").split("\n").filter(Boolean).slice(0, 2).join(" ");
      return (
        '<div class="msg ' + m.role + '" data-id="' + m.id + '">' +
        (showAva(m.role) ? avatarHTML(m.role === "me" ? state.user : state.peer, "sm") : "") +
        '<div class="letter-card" data-letter="' + l.id + '">' +
        "<h4>✉️ " + esc(l.title) + "</h4>" +
        "<div class='meta-line' style='font-size:.72em;color:var(--sub)'>" + esc(who) + "</div>" +
        "<p>" + esc(preview) + "</p>" +
        '<div class="lfoot"><span>' + fmtDate(l.ts) + " " + fmtTime(l.ts) + "</span><span>点开阅读 ›</span></div>" +
        "</div></div>"
      );
    }

    const person = m.role === "me" ? state.user : state.peer;
    const styleCls =
      S().bubbleStyle === "card" ? " card" : S().bubbleStyle === "sharp" ? " sharp" : S().bubbleStyle === "outline" ? " outline" : "";
    let body = "";
    let timeText = timeLabel(m.ts);
    if (m.recalled) {
      body = '<div class="recalled">' + (m.role === "me" ? "你" : esc(state.peer.name)) + " 撤回了一条消息</div>";
    } else {
      let inner = "";
      if (m.quote) {
        inner +=
          '<div class="quote-box"><span class="qn">' + esc(m.quote.name || "") + '</span><span class="qt">' +
          esc(m.quote.text || "（内容已删除）") + "</span></div>";
      }
      if (m.kind === "sticker" || m.kind === "image") inner += '<img src="' + esc(m.img) + '" alt="" />';
      else if (m.kind === "emoji") inner += '<span style="font-size:2.3em;line-height:1.2">' + esc(m.text) + "</span>";
      else inner += renderText(m.text);
      body = "<div>" + inner + "</div>";
    }
    const bubbleCls = "bubble" + styleCls + (m.kind === "sticker" || m.kind === "image" ? " sticker" : "");
    const parts = [];
    if (timeText) parts.push("<span>" + esc(timeText) + "</span>");
    if (m.role === "me" && !m.recalled) parts.push('<span class="tick">' + (isRead(m) ? "✓✓" : "✓") + "</span>");
    if (m.fav) parts.push('<span class="fav-star">★</span>');
    const meta = parts.length ? '<div class="meta">' + parts.join("") + "</div>" : "";
    const hideAva = !showAva(m.role);
    return (
      '<div class="msg ' + m.role + (hideAva ? " hide-ava" : "") + '" data-id="' + m.id + '" data-role="' + m.role + '">' +
      (hideAva ? "" : avatarHTML(person, "sm")) +
      '<div class="msg-col">' +
      '<div class="' + bubbleCls + '" data-menu="' + m.id + '">' + body + "</div>" +
      meta +
      "</div></div>"
    );
  }

  function showAva(role) {
    if (role === "me") return S().showUserAvatar !== false;
    return true;
  }

  function isRead(m) {
    const list = state.messages;
    const i = list.indexOf(m);
    if (i < 0) return true;
    for (let k = i + 1; k < list.length; k++) {
      const r = list[k];
      if (r.role === "ai" || r.role === "sys") return true;
    }
    return false;
  }

  function renderChat(force) {
    const scroller = el.chat;
    const nearBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 120;
    const oldTop = scroller.scrollTop;
    const list = state.messages.slice(-400);
    let html = "";
    let last = null;
    list.forEach(m => {
      if (!sameDay(last, m.ts)) {
        html += '<div class="day-sep"><span>' + fmtDate(m.ts) + " " + weekName(m.ts) + "</span></div>";
        last = m.ts;
      }
      html += msgHTML(m);
    });
    if (typingOn) {
      html +=
        '<div class="typing">' +
        avatarHTML(state.peer, "sm") +
        '<span class="tn">' + esc(state.peer.name) + " 正在输入</span>" +
        '<span class="dots"><i></i><i></i><i></i></span>' +
        "</div>";
    }
    scroller.innerHTML = html;
    const follow = S().autoScroll !== false;
    if (follow && (force || nearBottom)) jumpChatToEnd(scroller);
    else jumpScroll(scroller, oldTop);
  }

  function jumpScroll(scroller, top) {
    const prev = scroller.style.scrollBehavior;
    scroller.style.scrollBehavior = "auto";
    scroller.scrollTop = top;
    scroller.style.scrollBehavior = prev;
  }

  function jumpChatToEnd(scroller) {
    jumpScroll(scroller, scroller.scrollHeight);
  }

  function scrollChatToEnd(force) {
    if (S().autoScroll === false) return;
    const scroller = el.chat;
    if (!scroller) return;
    if (!force && scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight > 160) return;
    jumpChatToEnd(scroller);
  }

  function renderBadges() {
    const favs = state.messages.filter(m => m.fav).length;
    el.favBadge.hidden = favs === 0;
    el.favBadge.textContent = favs;
    const unread = state.letters.filter(l => l.dir === "in" && !l.read).length;
    el.letterBadge.hidden = unread === 0;
    el.letterBadge.textContent = unread;
    const qUnread = (state.quizzes || []).filter(q => !q.read && q.status !== "pending").length;
    if (el.quizBadge) {
      el.quizBadge.hidden = qUnread === 0;
      el.quizBadge.textContent = qUnread;
    }
  }

  function renderTop() {
    const p = state.peer;
    el.peerAvatar.outerHTML = p.avatar
      ? '<img id="peerAvatar" class="avatar ava-lg" src="' + esc(p.avatar) + '" alt="梦角头像" />'
      : '<span id="peerAvatar" class="avatar txt ava-lg">' + esc(p.emoji) + "</span>";
    el.peerAvatar = $("#peerAvatar");
    el.peerLabel.textContent = "在线";
    el.peerStatus.textContent = p.name + " · " + (state.mood.status || []).join(" · ");
    const u = state.user;
    el.myAvatarBox.outerHTML = u.avatar
      ? '<img id="myAvatarBox" class="avatar ava-lg" src="' + esc(u.avatar) + '" alt="我的头像" />'
      : '<span id="myAvatarBox" class="avatar txt ava-lg">' + esc(u.emoji) + "</span>";
    el.myAvatarBox = $("#myAvatarBox");
    el.myLabel.textContent = u.name;
    el.myAvatarBtn.classList.toggle("off", S().showUserAvatar === false);
    applyFavicon();
  }

  function applyFavicon() {
    const v = S().favicon;
    if (!v) return;
    if (typeof v === "string" && v.indexOf("data:") === 0) {
      el.faviconLink.href = v;
      return;
    }
    const item = DATA.FAVICONS.filter(f => f.id === v)[0];
    if (item) el.faviconLink.href = item.url;
  }

  function openMyInfo() {
    const u = state.user;
    const html =
      '<div class="card-box"><div class="avatar-edit">' + avatarHTML(u, "edit", "🌸") +
      '<div style="flex:1;min-width:0">' +
      '<button class="btn tiny" data-act="userAvatarUpload">上传头像</button> ' +
      '<button class="btn tiny ghost" data-act="userAvatarReset">恢复默认</button>' +
      '<div class="field" style="margin:10px 0 0"><input type="text" data-profile="user.name" value="' + esc(u.name) + '" placeholder="我的昵称"></div>' +
      '<div class="field" style="margin:8px 0 0"><input type="text" data-profile="user.emoji" maxlength="4" value="' + esc(u.emoji) + '" placeholder="默认头像 Emoji"></div>' +
      "</div></div>" +
      '<div class="row"><label>聊天页显示头像</label><span class="switch"><input type="checkbox" data-set="showUserAvatar"' + (S().showUserAvatar !== false ? " checked" : "") + "><i></i></span></div>" +
      '<div class="note">关闭后，聊天页面里的自己的消息不再显示头像；顶栏的小头像仍会保留。</div>' +
      '<div class="row"><label>时间戳样式</label><div class="grow">' + timeStyleSelect() + "</div></div>" +
      '<div class="note">时间戳显示在气泡下方。</div>' +
      "</div>";
    openModal("我的信息", html);
  }

  function timeStyleSelect() {
    const opts = [
      ["none", "不显示"],
      ["time", "只显示时间"],
      ["date", "只显示日期"],
      ["datetime", "日期 + 时间"],
      ["relative", "相对时间"]
    ];
    const cur = S().timeStyle || "time";
    return (
      '<select data-set="timeStyle">' +
      opts.map(o => '<option value="' + o[0] + '"' + (o[0] === cur ? " selected" : "") + ">" + o[1] + "</option>").join("") +
      "</select>"
    );
  }

  function renderAll(force) {
    renderTop();
    renderBadges();
    renderChat(force);
  }

  /* ===================== 定时调度 ===================== */

  /* ===================== 定时调度 ===================== */

  /* ===================== 重要日 ===================== */

  function dayStamp(ts) {
    const d = new Date(ts);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  function parseDay(s) {
    const p = String(s || "")
      .split("-")
      .map(v => Number(v));
    if (p.length < 3 || !p[0] || !p[1] || !p[2]) return NaN;
    return new Date(p[0], p[1] - 1, p[2]).getTime();
  }

  function daysToDay(s) {
    const t = parseDay(s);
    if (isNaN(t)) return null;
    return Math.round((dayStamp(t) - dayStamp(Date.now())) / 86400000);
  }

  function dateStat(d) {
    const diff = daysToDay(d.date);
    if (diff === null) return { n: 0, text: "日期无效", today: false, past: true };
    if (d.type === "countdown") {
      if (diff >= 0) return { n: diff, text: diff === 0 ? "就是今天" : "还剩 " + diff + " 天", today: diff === 0, past: false };
      return { n: -diff, text: "已经过去 " + -diff + " 天", today: false, past: true };
    }
    const passed = -diff;
    if (passed >= 0) return { n: passed, text: passed === 0 ? "就是今天" : "已经 " + passed + " 天", today: passed === 0, past: true };
    return { n: -passed, text: "还有 " + -passed + " 天", today: false, past: false };
  }

  function importantOn(ts) {
    return (state.dates || []).filter(d => {
      const t = parseDay(d.date);
      if (isNaN(t)) return false;
      if (d.type === "countdown") return dayStamp(t) === dayStamp(ts);
      const src = new Date(t);
      const now = new Date(ts);
      return src.getMonth() === now.getMonth() && src.getDate() === now.getDate();
    });
  }

  function openDates() {
    dateForm = null;
    openModal("重要日", datesHTML());
  }

  function datesHTML() {
    if (dateForm) return dateFormHTML();
    const list = (state.dates || []).slice().sort((a, b) => (parseDay(a.date) || 0) - (parseDay(b.date) || 0));
    const items = list
      .map(d => {
        const st = dateStat(d);
        const big = st.today ? "今天" : st.n + " 天";
        return (
          '<div class="imp-day ' + d.type + (st.today ? " hit" : "") + '">' +
          '<div class="id-top"><span class="id-tag">' + (d.type === "countdown" ? "⏳ 倒数日" : "❤ 纪念日") + "</span>" +
          '<button class="id-del" data-act="dateDel" data-date-del="' + esc(d.id) + '" title="删除">✕</button></div>' +
          '<div class="id-title">' + esc(d.title) + "</div>" +
          '<div class="id-num">' + esc(big) + "</div>" +
          '<div class="id-sub">' + esc(st.text) + " · " + esc(d.date) + "</div>" +
          "</div>"
        );
      })
      .join("");
    const empty =
      '<div class="imp-empty"><div class="ie-emo">💝</div><b>还没有纪念日</b><span>去添加一个属于你们的日子吧~</span></div>';
    return (
      '<div class="imp-list">' + (items || empty) + "</div>" +
      '<div class="imp-bar">' +
      '<button class="btn ghost" data-act="datesClose" style="flex:0 0 96px">关闭</button>' +
      '<button class="btn primary" data-act="dateAdd" style="flex:1">＋ 新增纪念日</button>' +
      "</div>"
    );
  }

  function dateFormHTML() {
    const d = dateForm || {};
    const t = dateType;
    return (
      '<div class="row" style="margin-bottom:10px">' +
      '<button class="btn tiny ghost" data-act="dateBack">← 返回</button>' +
      '<b style="font-size:16px">＋ 添加纪念日</b>' +
      "</div>" +
      '<div class="card-box">' +
      '<div class="field"><label>🏷 标题名称</label>' +
      '<input type="text" id="dateTitleInput" maxlength="24" value="' + esc(d.title || "") + '" placeholder="例如：恋爱纪念日、梦角生日"></div>' +
      '<div class="field"><label>📅 选择日期</label>' +
      '<input type="date" id="dateDateInput" value="' + esc(d.date || "") + '"></div>' +
      '<div class="field"><label>▦ 类型</label><div class="type-pick">' +
      '<button class="tp ' + (t === "anniv" ? "on" : "") + '" data-act="dateType" data-date-type="anniv"><b>❤</b><span>纪念日</span><em>过去 → 今天</em></button>' +
      '<button class="tp ' + (t === "countdown" ? "on" : "") + '" data-act="dateType" data-date-type="countdown"><b>⏳</b><span>倒数日</span><em>今天 → 未来</em></button>' +
      "</div></div>" +
      '<div class="note">' + (t === "anniv" ? "计算从过去某一天到现在已经过了多少天（例如：恋爱纪念日）" : "计算从现在到未来某一天还剩下多少天（例如：生日、跨年）") + "</div>" +
      "</div>" +
      '<button class="btn primary block" data-act="dateSave">✔ 保存</button>'
    );
  }

  function renderDates() {
    openModal("重要日", datesHTML());
  }

  function saveDate() {
    const ti = $("#dateTitleInput");
    const di = $("#dateDateInput");
    const title = ti ? ti.value.trim() : "";
    const date = di ? di.value : "";
    if (!title) {
      toast("写个标题吧~");
      return;
    }
    if (!date || isNaN(parseDay(date))) {
      toast("选一个日期吧~");
      return;
    }
    const cur = dateForm && dateForm.id ? state.dates.filter(d => d.id === dateForm.id)[0] : null;
    if (cur) {
      cur.title = title;
      cur.date = date;
      cur.type = dateType;
    } else {
      state.dates.push({ id: uid(), title: title, date: date, type: dateType });
    }
    persist();
    dateForm = null;
    renderDates();
    toast(cur ? "已更新" : "已添加");
  }

  function checkImportantToday(silent) {
    const today = importantOn(Date.now());
    if (!today.length) return;
    const flags = state.dayFlags || (state.dayFlags = {});
    const k = "imp:" + dateKey(Date.now());
    if (flags[k]) return;
    flags[k] = true;
    persist();
    if (silent) return;
    const names = today.map(d => d.title + "（" + (d.type === "countdown" ? "倒数日" : "纪念日") + "）").join("、");
    showNotice("重要日提醒", "今天是 " + names + "，别忘了这一刻~", false);
  }

  /* ===================== 问卷 ===================== */

  function openQuiz() {
    quizForm = null;
    quizDraft = null;
    markQuizRead();
    openModal("问卷", quizHTML());
  }

  function numField(key, label, min, max, val) {
    return (
      '<div style="flex:1;min-width:110px"><div class="note" style="margin:0 0 4px">' + label + "</div>" +
      '<input type="number" step="0.1" data-set="' + key + '" min="' + min + '" max="' + max + '" value="' + val + '"></div>'
    );
  }

  function quizWaitText() {
    const mx = Math.round(S().quizReplyMax || 720);
    return mx >= 60 ? Math.round(mx / 60) + " 小时" : mx + " 分钟";
  }

  function quizHTML() {
    if (quizForm) return quizFormHTML();
    const s = S();
    const list = (state.quizzes || []).slice().reverse();
    const items = list
      .map(q => {
        let res = "";
        if (q.status === "answered") {
          const picked = q.options[q.answer] || "";
          res =
            '<div class="qr-res ok">梦角选了「' + esc(picked) + "」" + (q.comment ? "<span>" + esc(q.comment) + "</span>" : "") + "</div>";
        } else if (q.status === "skipped") {
          res = '<div class="qr-res bad">梦角弃答了 · ' + esc(q.comment || "这个问题我不回答") + "</div>";
        } else {
          res = '<div class="qr-res wait">等待梦角选择…最长 ' + quizWaitText() + "</div>";
        }
        const opts = q.options
          .map((o, i) => '<li class="' + (q.status === "answered" && i === q.answer ? "picked" : "") + '">' + esc(o) + "</li>")
          .join("");
        return (
          '<div class="quiz-item ' + q.status + '">' +
          '<div class="qi-top"><span>问卷 · ' + fmtDate(q.createdAt) + "</span>" +
          (q.status === "pending" ? "" : '<span class="qi-time">' + fmtDate(q.ts) + " " + fmtTime(q.ts) + "</span>") +
          (q.status === "pending" ? "" : '<button class="id-del" data-act="quizDel" data-quiz-del="' + esc(q.id) + '">✕</button>') +
          "</div>" +
          '<div class="qi-q">' + esc(q.question) + "</div>" +
          '<ol class="qi-opts">' + opts + "</ol>" +
          res +
          "</div>"
        );
      })
      .join("");
    const empty =
      '<div class="imp-empty"><div class="ie-emo">📋</div><b>还没有问卷</b><span>问梦角一个问题吧，它会随机选一个答案~</span></div>';
    return (
      '<div class="card-box"><b>问卷设置</b>' +
      '<div class="field"><label>作答等待时间（分钟，最长 720 分钟 = 12 小时，可填小数）</label><div class="pair">' +
      numField("quizReplyMin", "最短", 0.1, 720, s.quizReplyMin) +
      numField("quizReplyMax", "最长", 0.1, 720, s.quizReplyMax) +
      "</div></div>" +
      '<div class="field"><label>梦角弃答概率 <span class="val" data-for="quizSkipChance"></span></label>' +
      '<div class="stepper"><button class="stp" data-stepkey="quizSkipChance" data-delta="-5">－</button>' +
      '<input type="range" data-set="quizSkipChance" data-unit="pct" min="0" max="100" step="1" value="' + Math.round((s.quizSkipChance || 0) * 100) + '">' +
      '<button class="stp" data-stepkey="quizSkipChance" data-delta="5">＋</button></div>' +
      '<div class="note">命中时梦角会「弃答」，提醒会显示为红色。</div></div></div>' +
      '<div class="quiz-list">' + (items || empty) + "</div>" +
      '<div class="imp-bar">' +
      '<button class="btn ghost" data-act="quizClose" style="flex:0 0 96px">关闭</button>' +
      '<button class="btn primary" data-act="quizAdd" style="flex:1">＋ 新建问卷</button>' +
      "</div>"
    );
  }

  function quizFormHTML() {
    const d = quizDraft;
    const opts = d.options
      .map(
        (o, i) =>
          '<div class="qopt"><span class="qo-idx">' + "ABCDEF"[i] + '</span><input type="text" maxlength="24" data-qopt="' + i + '" value="' + esc(o) + '">' +
          '<button class="qopt-del" data-act="quizOptDel" data-opt="' + i + '">✕</button></div>'
      )
      .join("");
    return (
      '<div class="row" style="margin-bottom:10px">' +
      '<button class="btn tiny ghost" data-act="quizBack">← 返回</button>' +
      '<b style="font-size:16px">＋ 新建问卷</b></div>' +
      '<div class="card-box">' +
      '<div class="field"><label>❓ 你的问题</label>' +
      '<input type="text" id="quizQ" maxlength="60" value="' + esc(d.question) + '" placeholder="例如：今天想吃什么？"></div>' +
      '<div class="field"><label>▦ 选项（2 ~ 8 个，数量由你决定）</label><div class="qopts">' + opts + "</div>" +
      '<button class="btn ghost block" data-act="quizOptAdd" style="margin-top:8px">＋ 添加选项</button></div>' +
      "</div>" +
      '<button class="btn primary block" data-act="quizSave">✓ 提交问卷</button>' +
      '<div class="note" style="margin-top:8px">提交后梦角会在设定时间内随机选一个选项，也有概率弃答。</div>'
    );
  }

  function renderQuiz() {
    openModal("问卷", quizHTML());
    syncSettingUI();
    bindSteppers();
  }

  function saveQuiz() {
    const qi = $("#quizQ");
    const q = qi ? qi.value.trim() : "";
    if (!q) {
      toast("写个问题吧~");
      return;
    }
    const opts = $$("#modalBody [data-qopt]")
      .map(i => i.value.trim())
      .filter(Boolean);
    if (opts.length < 2) {
      toast("至少要有 2 个选项");
      return;
    }
    const quiz = {
      id: uid(),
      question: q,
      options: opts,
      createdAt: Date.now(),
      status: "pending",
      answer: -1,
      comment: "",
      ts: 0,
      read: true
    };
    state.quizzes.push(quiz);
    scheduleQuizAnswer(quiz);
    persist();
    quizForm = null;
    quizDraft = null;
    renderQuiz();
    toast("问卷已送出，梦角会在 " + quizWaitText() + " 内选择");
  }

  function scheduleQuizAnswer(q) {
    const s = S();
    const mn = Math.max(0.1, s.quizReplyMin || 5);
    const mx = Math.max(mn, s.quizReplyMax || 720);
    const wait = randInt(Math.round(mn * 60), Math.round(mx * 60)) * 1000;
    state.timers.quizReplies = state.timers.quizReplies || {};
    state.timers.quizReplies[q.id] = Date.now() + wait;
    armQuizReplies();
  }

  function armQuizReplies() {
    clearTimeout(handles.quizReply);
    const map = state.timers.quizReplies || {};
    const ids = Object.keys(map).filter(id => (state.quizzes || []).some(q => q.id === id && q.status === "pending"));
    if (!ids.length) return;
    ids.sort((a, b) => map[a] - map[b]);
    handles.quizReply = setTimeout(() => fireQuizAnswer(ids[0]), clamp(map[ids[0]] - Date.now(), 300, 2147483000));
  }

  function fireQuizAnswer(id) {
    const map = state.timers.quizReplies || {};
    delete map[id];
    persist();
    armQuizReplies();
    const q = (state.quizzes || []).filter(x => x.id === id)[0];
    if (!q || q.status !== "pending") return;
    const s = S();
    const skip = Math.random() < (s.quizSkipChance != null ? s.quizSkipChance : 0.12);
    q.ts = Date.now();
    q.read = false;
    if (skip) {
      q.status = "skipped";
      q.answer = -1;
      q.comment = pickOne(DATA.QUIZ_SKIP_LINES);
    } else {
      q.status = "answered";
      q.answer = randInt(0, q.options.length - 1);
      q.comment = Math.random() < 0.6 ? pickOne(DATA.QUIZ_COMMENTS) : "";
    }
    persist();
    renderBadges();
    if (!el.modal.hidden && el.modalTitle.textContent === "问卷") renderQuiz();
    showNotice(
      skip ? "梦角弃答了" : "梦角回答了你的问卷",
      skip ? "「" + q.question + "」" + q.comment : "「" + q.question + "」→ " + q.options[q.answer],
      skip
    );
  }

  function markQuizRead() {
    let touched = false;
    (state.quizzes || []).forEach(q => {
      if (!q.read && q.status !== "pending") {
        q.read = true;
        touched = true;
      }
    });
    if (touched) {
      persist();
      renderBadges();
    }
  }

  function showNotice(title, body, danger) {
    const box = $("#miniNotice");
    if (!box) return;
    const ico = $("#mnIco");
    if (ico) ico.textContent = danger ? "💢" : "📋";
    $("#mnTitle").textContent = title;
    $("#mnBody").textContent = body;
    box.classList.toggle("bad", !!danger);
    box.hidden = false;
    clearTimeout(box._t);
    box._t = setTimeout(() => (box.hidden = true), 6000);
  }

  function setTimer(kind, delay) {
    state.timers[kind] = Date.now() + Math.max(0, delay);
    persist();
    armTimer(kind);
  }

  function armTimer(kind) {
    clearTimeout(handles[kind]);
    const due = state.timers[kind];
    if (!due) return;
    const wait = clamp(due - Date.now(), 200, 2147483000);
    handles[kind] = setTimeout(() => {
      const fn = {
        reply: fireReply,
        proactive: fireProactive,
        call: fireProactiveCall,
        letter: fireProactiveLetter,
        mood: fireMood
      }[kind];
      if (fn) fn();
    }, wait);
  }

  function armAll() {
    ["reply", "proactive", "call", "letter", "mood"].forEach(armTimer);
    armLetterReplies();
  }

  function armLetterReplies() {
    clearTimeout(handles.letterReply);
    const map = state.timers.letterReplies || {};
    const ids = Object.keys(map).filter(id => state.letters.filter(l => l.id === id && l.dir === "out").length);
    if (!ids.length) return;
    ids.sort((a, b) => map[a] - map[b]);
    const due = map[ids[0]];
    const wait = clamp(due - Date.now(), 300, 2147483000);
    handles.letterReply = setTimeout(() => fireLetterReply(ids[0]), wait);
  }

  function scheduleReply() {
    const s = S();
    const max = Math.max(s.replyMin, s.replyMax);
    setTimer("reply", randInt(s.replyMin, max) * 1000);
    typingOn = true;
    renderChat();
  }

  function fireReply() {
    state.timers.reply = null;
    typingOn = true;
    renderChat();
    setTimeout(() => {
      typingOn = false;
      if (Math.random() < S().replyChance) aiReply();
      else {
        renderChat();
        if (Math.random() < 0.35) setTimeout(() => aiPat(false), randInt(30000, 90000));
      }
    }, randInt(600, 1600));
  }

  function scheduleNext(key, minUnit, maxUnit, unitMs) {
    const s = S();
    const min = Math.max(0, Number(s[minUnit]));
    const max = Math.max(min, Number(s[maxUnit]));
    setTimer(key, randInt(min, max) * unitMs);
  }

  function fireProactive() {
    state.timers.proactive = null;
    const s = S();
    if (s.proactiveOn && Math.random() < s.proactiveChance) {
      aiSend(buildAiText(), Math.random() < s.stickerChance ? "sticker" : "text");
      if (Math.random() < s.patChance) setTimeout(() => aiPat(false), randInt(1200, 5000));
    }
    scheduleNext("proactive", "proactiveMin", "proactiveMax", 60000);
  }

  function fireProactiveCall() {
    state.timers.call = null;
    const s = S();
    if (s.callOn && !call && document.hidden === false && Math.random() < s.callChance) {
      startCall("in", Math.random() < 0.4 ? "video" : "voice");
    }
    scheduleNext("call", "callMin", "callMax", 60000);
  }

  function fireProactiveLetter() {
    state.timers.letter = null;
    const s = S();
    if (s.letterOn && Math.random() < s.letterChance) aiWriteLetter();
    scheduleNext("letter", "letterMin", "letterMax", 60000);
  }

  function fireMood() {
    state.timers.mood = null;
    refreshMood();
    setTimer("mood", Math.max(1, S().moodHours) * 3600000);
  }

  function fireLetterReply(id) {
    const map = state.timers.letterReplies || {};
    delete map[id];
    persist();
    armLetterReplies();
    const l = state.letters.filter(x => x.id === id)[0];
    if (!l) return;
    const letter = {
      id: uid(),
      dir: "in",
      title: "一条来自" + state.peer.name + "的讯息请查收",
      content: buildLetterText(),
      ts: Date.now(),
      read: false
    };
    state.letters.push(letter);
    l.replied = true;
    l.replyId = letter.id;
    pushMsg({ role: "ai", kind: "letter", text: "", letterId: letter.id });
    pushMsg({ role: "ai", kind: "note", text: state.peer.name + " 回信了，去「写信」里看看吧" });
    renderAll(true);
    toast(state.peer.name + " 回信了 ✉️");
  }

  function ensureSeedTimers() {
    const t = state.timers;
    if (!t.proactive) scheduleNext("proactive", "proactiveMin", "proactiveMax", 60000);
    if (!t.call) scheduleNext("call", "callMin", "callMax", 60000);
    if (!t.letter) scheduleNext("letter", "letterMin", "letterMax", 60000);
    if (!t.mood) setTimer("mood", Math.max(1, S().moodHours) * 3600000);
    armQuizReplies();
    if (!state.moodLog.length) {
      state.moodLog.unshift({ ts: Date.now(), emoji: state.mood.emoji, status: state.mood.status.slice() });
      persist();
    }
  }

  function rescheduleAll() {
    scheduleNext("proactive", "proactiveMin", "proactiveMax", 60000);
    scheduleNext("call", "callMin", "callMax", 60000);
    scheduleNext("letter", "letterMin", "letterMax", 60000);
    setTimer("mood", Math.max(1, S().moodHours) * 3600000);
    typingOn = false;
    renderChat();
  }

  /* ===================== 心情手账 ===================== */

  function refreshMood() {
    const s = S();
    if (Math.random() > s.moodChange) {
      renderTop();
      return;
    }
    const oldEmoji = state.mood.emoji;
    let emoji = pickOne(DATA.MOOD_EMOJI);
    let guard = 0;
    while (emoji === oldEmoji && guard++ < 6) emoji = pickOne(DATA.MOOD_EMOJI);
    const status = pickCards(randInt(1, 3));
    state.mood = { emoji: emoji, status: status, ts: Date.now() };
    state.moodLog.unshift({ ts: Date.now(), emoji: emoji, status: status.slice() });
    if (state.moodLog.length > 500) state.moodLog.length = 500;
    persist();
    renderTop();
  }

  /* ===================== 梦角行为 ===================== */

  function buildAiText() {
    const s = S();
    if (s.combine) {
      const n = randInt(s.combineMin, Math.max(s.combineMin, s.combineMax));
      return pickCards(n).join(" ");
    }
    const n = Math.random() < 0.22 ? 2 : 1;
    return pickCards(n).join("");
  }

  function joinLetterParts(list) {
    const END = /[。！？…~，、,!?]$/;
    let t = "";
    list.forEach((raw, i) => {
      const card = String(raw == null ? "" : raw).trim();
      if (!card) return;
      if (!t) {
        t = card;
        return;
      }
      t += END.test(t) ? card : (Math.random() < 0.35 ? "。" : "，") + card;
    });
    t = t.trim();
    if (!t) return "……";
    if (!/[。！？…~]$/.test(t)) t += "。";
    return t;
  }

  function buildLetterText() {
    const s = S();
    const mn = clamp(Math.round(s.letterSentMin || 1), 1, 30);
    const mx = clamp(Math.round(s.letterSentMax || mn), mn, 30);
    const n = randInt(mn, mx);
    const parts = [];
    for (let i = 0; i < n; i++) parts.push(pickCards(1)[0]);
    const brk = Math.random() < (s.letterBreakChance != null ? s.letterBreakChance : 0.6);
    if (!brk) return joinLetterParts(parts);
    const per = randInt(1, Math.max(1, s.letterParaMax != null ? s.letterParaMax : 2));
    const paras = [];
    for (let i = 0; i < parts.length; i += per) paras.push(joinLetterParts(parts.slice(i, i + per)));
    return paras.join("\n\n");
  }

  function renderText(t) {
    return esc(t).replace(/[ \t]{3,}/g, "  ");
  }

  function randomEmoji() {
    const common = state.emojis["常用"] || Object.keys(state.emojis).map(k => state.emojis[k]).flat();
    return common.length ? pickOne(common) : pickOne(DATA.MOOD_EMOJI);
  }

  function aiSend(text, kind, stickerSrc) {
    if (kind === "sticker") {
      const src = stickerSrc || (state.customStickers.length && Math.random() < 0.35 ? pickOne(state.customStickers).src : null);
      if (src) pushMsg({ role: "ai", kind: "sticker", img: src, text: "" });
      else pushMsg({ role: "ai", kind: "emoji", text: randomEmoji() });
    } else {
      pushMsg({ role: "ai", kind: "text", text: text });
    }
    renderAll(true);
  }

  function aiSendMsg(msg) {
    pushMsg(msg);
    renderAll(true);
  }

  function aiReply() {
    const s = S();
    const quote = lastUserText();
    const msg = { role: "ai", kind: "text", text: buildAiText() };
    if (quote && Math.random() < s.quoteChance) msg.quote = { role: "me", name: state.user.name, text: quote };
    aiSendMsg(msg);
    if (Math.random() < s.stickerChance) {
      setTimeout(() => {
        if (state.customStickers.length && Math.random() < 0.3) aiSend("", "sticker");
        else aiSend(randomEmoji(), "emoji");
      }, randInt(600, 1800));
    }
    if (Math.random() < s.patChance) setTimeout(() => aiPat(false), randInt(1500, 6000));
  }

  function lastUserText() {
    let seen = 0;
    for (let i = state.messages.length - 1; i >= 0 && seen < 12; i--) {
      const m = state.messages[i];
      seen++;
      if (m.role === "me" && m.kind === "text" && !m.recalled && m.text) return m.text.slice(0, 40);
    }
    return null;
  }

  function shakePeer() {
    const ava = el.peerBox.querySelector(".avatar");
    if (!ava) return;
    ava.classList.remove("pat-anim");
    void ava.offsetWidth;
    ava.classList.add("pat-anim");
  }

  function aiPat(fromUser) {
    pushMsg({ role: "sys", kind: "pat", mine: !!fromUser, text: patLine() });
    if (fromUser) {
      shakePeer();
      renderAll(true);
      return;
    }
    shakePeer();
    renderAll(true);
    if (Math.random() < 0.35) {
      setTimeout(() => aiSend(buildAiText()), randInt(800, 2000));
    }
  }

  function doUserPat() {
    aiPat(true);
    shakePeer();
    const s = S();
    if (Math.random() < (s.patReplyChance != null ? s.patReplyChance : 0.7)) {
      setTimeout(() => {
        pushMsg({ role: "sys", kind: "pat", mine: false, text: patLine() });
        if (Math.random() < 0.55) setTimeout(() => aiSend(buildAiText()), randInt(700, 1800));
      }, randInt(700, 2400));
    } else if (Math.random() < 0.5) {
      setTimeout(() => aiSend(buildAiText()), randInt(900, 2500));
    }
  }

  /* ===================== 写信 ===================== */

  function aiWriteLetter() {
    const title = "一条来自" + state.peer.name + "的讯息请查收";
    const letter = {
      id: uid(),
      dir: "in",
      title: title,
      content: buildLetterText(),
      ts: Date.now(),
      read: false
    };
    state.letters.push(letter);
    pushMsg({ role: "ai", kind: "letter", text: "", letterId: letter.id });
    renderAll(true);
    toast(state.peer.name + " 给你写了信 ✉️");
  }

  function sendLetter(title, content) {
    const letter = { id: uid(), dir: "out", title: title, content: content, ts: Date.now(), read: true, replied: false };
    state.letters.push(letter);
    pushMsg({ role: "me", kind: "letter", text: "", letterId: letter.id });
    const s = S();
    if (!state.timers.letterReplies) state.timers.letterReplies = {};
    const delay = randInt(s.letterReplyMin, Math.max(s.letterReplyMin, s.letterReplyMax)) * 60000;
    state.timers.letterReplies[letter.id] = Date.now() + delay;
    persist();
    armLetterReplies();
    renderAll(true);
    const mins = Math.round(delay / 60000);
    toast("信已寄出，" + state.peer.name + " 会在 " + (mins >= 60 ? Math.round(mins / 60) + " 小时左右" : mins + " 分钟左右") + "回信");
  }

  /* ===================== 字卡导入 ===================== */

  function importCards(text, mode, groupId) {
    const raw = String(text)
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean);
    const seen = new Set();
    const lines = [];
    raw.forEach(l => {
      if (seen.has(l)) return;
      seen.add(l);
      lines.push(l);
    });
    const dupInText = raw.length - lines.length;
    const gid = groupId || "none";
    let added = 0;
    let dup = dupInText;
    if (mode === "replace") {
      const have = new Set(state.cards.map(cardText));
      dup = 0;
      state.cards = lines.map(l => ({ text: l, group: have.has(l) ? "none" : gid }));
      added = state.cards.length;
    } else {
      const have = new Set(state.cards.map(cardText));
      const fresh = lines.filter(l => !have.has(l));
      dup = dupInText + (lines.length - fresh.length);
      added = fresh.length;
      state.cards = state.cards.concat(fresh.map(l => ({ text: l, group: gid })));
    }
    persist();
    return { added: added, dup: dup };
  }

  function groupName(id) {
    const g = state.groups.filter(x => x.id === id)[0];
    return g ? g.name : "未分组";
  }

  function groupCount(id) {
    return state.cards.filter(c => (c.group || "none") === id).length;
  }

  function groupBarHTML() {
    const bar = [{ id: "all", name: "全部" }].concat(state.groups);
    return (
      '<div class="grp-bar">' +
      bar
        .map(
          g =>
            '<button class="grp-chip' + (cardGroup === g.id ? " active" : "") + '" data-grp="' + esc(g.id) + '">' +
            esc(g.name) + '<span class="n">' + (g.id === "all" ? state.cards.length : groupCount(g.id)) + "</span></button>"
        )
        .join("") +
      "</div>"
    );
  }

  function filteredCards() {
    const q = cardSearch.trim().toLowerCase();
    return state.cards
      .map((c, i) => ({ c: c, i: i }))
      .filter(o => cardGroup === "all" || (o.c.group || "none") === cardGroup)
      .filter(o => !q || o.c.text.toLowerCase().indexOf(q) >= 0);
  }

  function renderCardList() {
    const box = $("#cardList");
    if (!box) return;
    const picked = Object.keys(cardPick).filter(k => cardPick[k]).length;
    const list = filteredCards();
    box.innerHTML =
      '<div class="list-tools">' +
      '<button class="btn tiny ' + (cardBatch ? "" : "ghost") + '" data-act="cardBatch">' + (cardBatch ? "退出批量管理" : "批量管理") + "</button>" +
      '<button class="btn tiny ghost" data-act="cardPickAll">全选当前（' + list.length + "）</button>" +
      '<button class="btn tiny ghost" data-act="cardMoveGroup">批量移动分组</button>' +
      '<button class="btn tiny danger" data-act="cardBatchDel">批量删除</button>' +
      '<span class="hint" id="cardPicked">已选 ' + picked + " 条</span>" +
      "</div>" +
      (list.length
        ? list
            .map(o => {
              if (editingCard === o.i) {
                return (
                  '<div class="card-row sel" data-card-row="' + o.i + '">' +
                  '<div class="card-edit"><input type="text" id="cardEditInput" value="' + esc(o.c.text) + '" maxlength="120">' +
                  '<button class="btn tiny" data-card-save="' + o.i + '">保存</button>' +
                  '<button class="btn tiny ghost" data-card-cancel="1">取消</button></div></div>'
                );
              }
              return (
                '<div class="card-row' + (cardPick[o.i] ? " sel" : "") + '" data-card-row="' + o.i + '">' +
                (cardBatch ? '<button class="pick-box' + (cardPick[o.i] ? " on" : "") + '" data-card-pick="' + o.i + '">' + (cardPick[o.i] ? "✓" : "") + "</button>" : "") +
                '<span class="ct">' + esc(o.c.text) + "</span>" +
                '<span class="cg">' + esc(groupName(o.c.group || "none")) + "</span>" +
                '<button class="btn tiny ghost" data-card-edit="' + o.i + '">编辑</button>' +
                '<button class="btn tiny ghost" data-card-del="' + o.i + '">删</button>' +
                "</div>"
              );
            })
            .join("")
        : '<div class="empty">没有匹配的字卡</div>');
  }

  function startCardEdit(i) {
    editingCard = i;
    renderCardList();
    const inp = $("#cardEditInput");
    if (inp) {
      inp.focus();
      const v = inp.value.length;
      inp.setSelectionRange(v, v);
      inp.onkeydown = ev => {
        if (ev.key === "Enter") saveCardEdit(i);
        if (ev.key === "Escape") {
          editingCard = null;
          renderCardList();
        }
      };
    }
  }

  function saveCardEdit(i) {
    const inp = $("#cardEditInput");
    const val = inp ? inp.value.trim() : "";
    editingCard = null;
    if (!val) {
      renderCardList();
      toast("字卡内容不能为空");
      return;
    }
    if (state.cards[i]) {
      const dup = state.cards.filter((c, k) => k !== i && c.text === val).length;
      if (dup > 0 && !confirm("已存在相同字卡，仍要保存吗？")) {
        renderCardList();
        return;
      }
      state.cards[i].text = val;
      persist();
      toast("已保存修改");
    }
    renderCardList();
  }

  function exportCards() {
    const blob = new Blob([state.cards.join("\n")], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "字卡库.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 3000);
  }

  /* ===================== 字卡文件导入 ===================== */

  function readFileTextSmart(file) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = () => reject(new Error("文件读取失败"));
      fr.onload = () => {
        const buf = fr.result;
        let text = new TextDecoder("utf-8").decode(buf);
        if (text.indexOf("\uFFFD") >= 0) {
          try {
            text = new TextDecoder("gbk").decode(buf);
          } catch (e) {}
        }
        resolve(text.replace(/^\uFEFF/, ""));
      };
      fr.readAsArrayBuffer(file);
    });
  }

  function parseTextEntries(text) {
    const out = [];
    let cur = "";
    String(text)
      .replace(/^\uFEFF/, "")
      .split(/\r?\n/)
      .forEach(line => {
        const t = line.trim();
        if (!t) return;
        const m = t.match(/^[\[【](.{1,20})[\]】]$/);
        if (m) {
          cur = m[1].trim();
          return;
        }
        out.push({ text: t, groupName: cur });
      });
    return out;
  }

  function parseJsonCards(data) {
    const out = [];
    const pushCard = (item, groupName) => {
      if (item == null) return;
      if (typeof item === "string" || typeof item === "number") {
        out.push({ text: String(item), groupName: groupName || "" });
        return;
      }
      if (typeof item === "object") {
        const text = item.text != null ? item.text : item.card != null ? item.card : item.content != null ? item.content : item.value;
        if (text == null) return;
        const g = item.groupName || item.group || item.g || groupName || "";
        out.push({ text: String(text), groupName: typeof g === "string" ? g : "" });
      }
    };
    const pushGroup = g => {
      if (!g || typeof g !== "object") return;
      const name = g.name || g.groupName || g.title || g.group || "";
      const list = g.cards || g.list || g.items || g.data || g.children || [];
      if (Array.isArray(list)) list.forEach(c => pushCard(c, name));
    };
    if (Array.isArray(data)) {
      const looksGrouped = data.some(
        x => x && typeof x === "object" && !Array.isArray(x) && (Array.isArray(x.cards) || Array.isArray(x.list) || Array.isArray(x.items) || Array.isArray(x.data))
      );
      if (looksGrouped) data.forEach(pushGroup);
      else data.forEach(c => pushCard(c, ""));
      return out;
    }
    if (data && typeof data === "object") {
      if (Array.isArray(data.groups)) {
        data.groups.forEach(pushGroup);
        return out;
      }
      if (Array.isArray(data.cards)) {
        data.cards.forEach(c => pushCard(c, ""));
        return out;
      }
      Object.keys(data).forEach(k => {
        const v = data[k];
        if (Array.isArray(v)) v.forEach(c => pushCard(c, k));
        else if (typeof v === "string") pushCard(v, k);
      });
    }
    return out;
  }

  function findZipEntry(buf, name) {
    const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    let eocd = -1;
    for (let i = buf.length - 22; i >= Math.max(0, buf.length - 66000); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) {
        eocd = i;
        break;
      }
    }
    if (eocd < 0) return null;
    const count = dv.getUint16(eocd + 10, true);
    let off = dv.getUint32(eocd + 16, true);
    for (let i = 0; i < count; i++) {
      if (off + 46 > buf.length || dv.getUint32(off, true) !== 0x02014b50) return null;
      const method = dv.getUint16(off + 10, true);
      const compSize = dv.getUint32(off + 20, true);
      const nameLen = dv.getUint16(off + 28, true);
      const extraLen = dv.getUint16(off + 30, true);
      const commentLen = dv.getUint16(off + 32, true);
      const localOff = dv.getUint32(off + 42, true);
      const nm = new TextDecoder("utf-8").decode(buf.subarray(off + 46, off + 46 + nameLen));
      if (nm === name) {
        if (localOff + 30 > buf.length || dv.getUint32(localOff, true) !== 0x04034b50) return null;
        const lNameLen = dv.getUint16(localOff + 26, true);
        const lExtraLen = dv.getUint16(localOff + 28, true);
        const start = localOff + 30 + lNameLen + lExtraLen;
        return { method: method, data: buf.subarray(start, start + compSize) };
      }
      off += 46 + nameLen + extraLen + commentLen;
    }
    return null;
  }

  async function inflateRaw(bytes) {
    if (typeof DecompressionStream === "undefined") throw new Error("当前浏览器不支持解析 docx，请改用 txt 或 json");
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  function xmlUnescape(s) {
    return String(s)
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (m, d) => String.fromCharCode(Number(d)))
      .replace(/&#x([0-9a-fA-F]+);/g, (m, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/&amp;/g, "&");
  }

  async function readDocxLines(file) {
    const buf = new Uint8Array(await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onerror = () => rej(new Error("文件读取失败"));
      fr.onload = () => res(new Uint8Array(fr.result));
      fr.readAsArrayBuffer(file);
    }));
    const entry = findZipEntry(buf, "word/document.xml");
    if (!entry) throw new Error("这不是有效的 docx 文件（或已损坏）");
    let bytes = entry.data;
    if (entry.method === 8) bytes = await inflateRaw(bytes);
    else if (entry.method !== 0) throw new Error("暂不支持这种 docx 压缩方式");
    const xml = new TextDecoder("utf-8").decode(bytes);
    const lines = [];
    xml.split(/<\/w:p>/).forEach(chunk => {
      const part = chunk
        .replace(/<w:br\b[^>]*\/?>/g, "\n")
        .replace(/<w:tab\b[^>]*\/?>/g, " ");
      let line = "";
      const re = /<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g;
      let m;
      while ((m = re.exec(part))) line += xmlUnescape(m[1]);
      line
        .split(/\r?\n/)
        .map(t => t.trim())
        .filter(Boolean)
        .forEach(t => lines.push(t));
    });
    return lines;
  }

  function addCardEntries(entries) {
    const have = new Set(state.cards.map(cardText));
    let added = 0;
    let dup = 0;
    let groupsMade = 0;
    const resolve = raw => {
      const key = String(raw == null ? "" : raw).trim();
      if (!key) return addGroup || "none";
      const byName = state.groups.filter(g => g.name === key)[0];
      if (byName) return byName.id;
      const byId = state.groups.filter(g => g.id === key)[0];
      if (byId) return byId.id;
      const id = "g_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
      state.groups.push({ id: id, name: key.slice(0, 20) });
      groupsMade++;
      return id;
    };
    (entries || []).forEach(e => {
      const text = String(e && e.text != null ? e.text : "").trim();
      if (!text) return;
      if (have.has(text)) {
        dup++;
        return;
      }
      have.add(text);
      state.cards.push({ text: text.slice(0, 120), group: resolve(e.groupName) });
      added++;
    });
    persist();
    return { added: added, dup: dup, groups: groupsMade };
  }

  async function importCardFile() {
    const file = await pickFile(".txt,.docx,.json,.md,text/plain,application/json");
    if (!file) return;
    const st = $("#addStatus");
    if (st) {
      st.classList.remove("done");
      st.textContent = "正在读取 " + file.name + "…";
    }
    try {
      const name = String(file.name || "").toLowerCase();
      let entries = [];
      if (/\.docx$/.test(name)) {
        const lines = await readDocxLines(file);
        entries = lines.map(t => ({ text: t, groupName: "" }));
      } else if (/\.json$/.test(name)) {
        entries = parseJsonCards(JSON.parse(await readFileTextSmart(file)));
      } else if (/\.doc$/.test(name)) {
        throw new Error("暂不支持 .doc，请用 Word 另存为 .docx");
      } else {
        entries = parseTextEntries(await readFileTextSmart(file));
      }
      if (!entries.length) throw new Error("没有读到可用的内容");
      const res = addCardEntries(entries);
      renderCardList();
      syncSettingUI();
      const msg =
        "导入 " + file.name + "：新增 " + res.added + " 条" +
        (res.dup ? "，跳过重复 " + res.dup + " 条" : "") +
        (res.groups ? "，新建分组 " + res.groups + " 个" : "");
      if (st) {
        st.classList.add("done");
        st.textContent = msg;
      }
      toast("导入完成，新增 " + res.added + " 条");
    } catch (err) {
      const msg = "导入失败：" + (err && err.message ? err.message : "无法解析该文件");
      if (st) st.textContent = msg;
      toast(msg);
    }
  }

  /* ===================== 图片处理 ===================== */

  function readImage(file, maxSize, quality) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onerror = reject;
      fr.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          const ratio = Math.min(1, maxSize / Math.max(w, h));
          w = Math.max(1, Math.round(w * ratio));
          h = Math.max(1, Math.round(h * ratio));
          const c = document.createElement("canvas");
          c.width = w;
          c.height = h;
          const ctx = c.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          resolve(c.toDataURL("image/jpeg", quality));
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  function pickFile(accept) {
    return new Promise(resolve => {
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = accept || "image/*";
      inp.onchange = () => resolve(inp.files && inp.files[0] ? inp.files[0] : null);
      inp.click();
    });
  }

  function pickFiles(accept) {
    return new Promise(resolve => {
      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = accept || "image/*";
      inp.multiple = true;
      inp.onchange = () => resolve(inp.files ? Array.prototype.slice.call(inp.files) : []);
      inp.click();
    });
  }

  /* ===================== 外观 ===================== */

  function themeById(id) {
    return DATA.THEMES.filter(t => t.id === id)[0] || DATA.THEMES[0];
  }

  function applyAppearance() {
    const s = S();
    const theme = themeById(s.theme);
    const root = document.documentElement.style;
    root.setProperty("--primary", s.primary || theme.primary);
    root.setProperty("--primary-soft", hexA(s.primary || theme.primary, .18));
    root.setProperty("--bg", theme.bg);
    root.setProperty("--panel", theme.panel);
    root.setProperty("--text", theme.text);
    root.setProperty("--sub", theme.sub);
    root.setProperty("--border", theme.border);
    root.setProperty("--my-bubble", s.myBubble || theme.myBubble);
    root.setProperty("--ai-bubble", s.aiBubble || theme.aiBubble);
    root.setProperty("--my-text", readable(s.myBubble || theme.myBubble));
    root.setProperty("--ai-text", readable(s.aiBubble || theme.aiBubble));
    root.setProperty("--font", (DATA.FONTS.filter(f => f.id === s.font)[0] || DATA.FONTS[0]).css);
    root.setProperty("--fs", s.fontSize + "px");
    el.chat.style.background = s.chatImage ? 'url("' + s.chatImage + '") center/cover' : (s.chatColor || theme.chat);
    const meta = document.querySelector('meta[name=theme-color]');
    if (meta) meta.setAttribute("content", s.primary || theme.primary);
  }

  function hexA(hex, a) {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map(x => x + x).join("") : h;
    const n = parseInt(full, 16);
    return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
  }

  function readable(hex) {
    const h = String(hex).replace("#", "");
    const full = h.length === 3 ? h.split("").map(x => x + x).join("") : h;
    const n = parseInt(full, 16);
    const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return lum > 0.62 ? "#2f2a2c" : "#ffffff";
  }

  /* ===================== 弹窗 ===================== */

  function openModal(title, html) {
    el.modalTitle.textContent = title;
    el.modalBody.innerHTML = html;
    el.modal.hidden = false;
    el.modalBody.scrollTop = 0;
  }

  function closeModal() {
    el.modal.hidden = true;
    el.modalBody.innerHTML = "";
    letterView = null;
    if (typeof scrollChatToEnd === "function") scrollChatToEnd(false);
  }

  /* ===================== 设置面板 ===================== */

  function settingsHTML() {
    const s = S();
    const themeOpts = DATA.THEMES.map(t => '<option value="' + t.id + '"' + (t.id === s.theme ? " selected" : "") + ">" + t.name + "</option>").join("");
    const bubbleOpts = DATA.BUBBLE_STYLES.map(b => '<option value="' + b.id + '"' + (b.id === s.bubbleStyle ? " selected" : "") + ">" + b.name + "</option>").join("");
    const fontOpts = DATA.FONTS.map(f => '<option value="' + f.id + '"' + (f.id === s.font ? " selected" : "") + ">" + f.name + "</option>").join("");
    const sw = (key, label) =>
      '<div class="row"><label>' + label + '</label><span class="switch"><input type="checkbox" data-set="' + key + '"' + (s[key] ? " checked" : "") + '><i></i></span></div>';
    function stepper(key, label, min, max, unit, step, extra) {
      const cur = unit === "pct" ? Math.round(S()[key] * 100) : Number(S()[key]);
      return (
        '<div class="field"><label>' + label + ' <span class="val" data-for="' + key + '"></span></label>' +
        '<div class="stepper">' +
        '<button class="stp" data-stepkey="' + key + '" data-delta="-' + (step || 5) + '" aria-label="减少">−</button>' +
        '<input type="range" data-set="' + key + '" data-unit="' + (unit || "") + '" min="' + min + '" max="' + max + '" step="1" value="' + cur + '">' +
        '<button class="stp" data-stepkey="' + key + '" data-delta="' + (step || 5) + '" aria-label="增加">＋</button>' +
        "</div>" + (extra || "") + "</div>"
      );
    }
    const rng = (key, label, min, max, unit, extra) => stepper(key, label, min, max, unit, 5, extra);
    const num = (key, label, min, max) =>
      '<div style="flex:1;min-width:110px"><div class="note" style="margin:0 0 4px">' + label + "</div>" +
      '<input type="number" step="0.1" data-set="' + key + '" min="' + min + '" max="' + max + '" value="' + s[key] + '"></div>';

    const tabs = [
      ["reply", "回复设置"],
      ["call", "通话"],
      ["letter", "写信"],
      ["cards", "字卡库"],
      ["mood", "氛围感"],
      ["emoji", "表情包"],
      ["look", "外观"],
      ["me", "资料"]
    ];

    const openingStyles = [
      ["orb", "光球（默认）"],
      ["breath", "呼吸"],
      ["halo", "光圈扩散"],
      ["sparkle", "星光闪烁"],
      ["pulse", "脉冲"],
      ["heart", "心跳"],
      ["none", "静止光点"]
    ];
    const reply =
      '<div class="card-box">' +
      '<div class="field"><label>回复间隔（秒，3 秒 ~ 5 分钟）</label><div class="pair">' +
      num("replyMin", "最短", 3, 300) +
      num("replyMax", "最长", 3, 300) +
      "</div><div class='note'>梦角会在这个区间内回复你，超出最长等待就不再回复。</div></div>" +
      rng("replyChance", "回复概率", 0, 100, "pct") +
      '<div class="note">不是每条消息都会回复，75% 的概率触发。</div>' +
      sw("autoScroll", "新消息自动定位到最新") +
      '<div class="note">关掉后聊天不会自动下滑；你翻上去看历史时也不会被拉回底部。</div>' +
      sw("combine", "拼字卡（把多张字卡合成一条消息）") +
      '<div class="field"><label>每次回复的字卡数量（1 ~ 10 张，卡片之间用空格隔开）</label><div class="pair">' +
      num("combineMin", "最少", 1, 10) +
      num("combineMax", "最多", 1, 10) +
      "</div></div>" +
      rng("patChance", "梦角主动拍一拍概率", 0, 100, "pct") +
      rng("patReplyChance", "我拍一拍后梦角用拍一拍语回应", 0, 100, "pct") +
      rng("quoteChance", "回复时引用你消息的概率", 0, 100, "pct") +
      rng("stickerChance", "回复附带表情概率", 0, 100, "pct") +
      "</div>" +
      '<div class="card-box" style="margin-top:14px">' +
      sw("proactiveOn", "梦角主动发消息") +
      '<div class="field"><label>主动消息间隔（分钟）</label><div class="pair">' +
      num("proactiveMin", "最短", 0, 1440) +
      num("proactiveMax", "最长", 0, 1440) +
      "</div></div>" +
      rng("proactiveChance", "触发概率", 0, 100, "pct") +
      '<div class="field"><label>心情 / 状态刷新（小时）</label><input type="number" data-set="moodHours" min="1" max="24" value="' + s.moodHours + '"></div>' +
      rng("moodChange", "每次刷新发生变化的概率", 0, 100, "pct") +
      sw("opening", "开启开场动画") +
      sw("openingSky", "背景星空（星星一闪一闪）") +
      '<div class="field"><label>开场动画样式</label><div class="pair">' +
      '<select class="grow" data-set="openingStyle">' +
      openingStyles.map(o => '<option value="' + o[0] + '"' + (o[0] === (s.openingStyle || "orb") ? " selected" : "") + ">" + o[1] + "</option>").join("") +
      "</select></div></div>" +
      '<div class="field"><label>星星数量 <span class="val" data-for="openingStars"></span></label>' +
      '<div class="stepper">' +
      '<button class="stp" data-stepkey="openingStars" data-delta="-5">−</button>' +
      '<input type="range" data-set="openingStars" min="0" max="120" step="1" value="' + (s.openingStars != null ? s.openingStars : 46) + '">' +
      '<button class="stp" data-stepkey="openingStars" data-delta="5">＋</button>' +
      "</div></div>" +
      '<div class="field"><label>颜色</label><div class="pair">' +
      '<span class="note" style="margin:0">光晕</span><input type="color" data-set="openingGlow" value="' + s.openingGlow + '">' +
      '<span class="note" style="margin:0">背景</span><input type="color" data-set="openingBg" value="' + s.openingBg + '">' +
      '<span class="note" style="margin:0">文字</span><input type="color" data-set="openingText" value="' + s.openingText + '">' +
      '<span class="note" style="margin:0">星光</span><input type="color" data-set="openingStar" value="' + (s.openingStar || "#ffffff") + '">' +
      '<span class="note" style="margin:0">光点</span><input type="color" data-set="openingDot" value="' + (s.openingDot || "#f0a6c0") + '">' +
      "</div>" +
      '<div class="note">改动会立刻应用，点下方按钮可当场预览。</div></div>' +
      '<div class="list-tools" style="margin-top:14px"><button class="btn ghost tiny" data-act="previewOpening">预览开场动画</button></div>' +
      '<div class="list-tools" style="margin-top:10px"><button class="btn ghost tiny" data-act="resetSettings">恢复默认设置</button></div>' +
      "</div>";

    const callPanel =
      '<div class="card-box">' +
      '<div class="field"><label>通话外观</label><select data-set="callType">' +
      '<option value="voice"' + (s.callType === "voice" ? " selected" : "") + ">语音通话（黑底头像）</option>" +
      '<option value="video"' + (s.callType === "video" ? " selected" : "") + ">视频通话（黑底头像 + 自拍小窗）</option>" +
      "</select></div>" +
      rng("aiAnswerChance", "梦角接听率", 0, 100, "pct") +
      rng("peerHangupChance", "梦角中途挂断概率", 0, 100, "pct") +
      '<div class="note">未接听的概率会自动分配为「拒接」与「未接听」。</div>' +
      '<div class="note">「中途挂断」命中后，梦角会在通话进行中随机某个时刻先挂断，并留下一条系统提示。</div>' +
      '<div class="note">视频/语音通话只是模拟画面，不会录音或录像。</div>' +
      "</div>" +
      '<div class="card-box" style="margin-top:14px">' +
      sw("callOn", "梦角主动来电") +
      '<div class="field"><label>来电间隔（分钟）</label><div class="pair">' +
      num("callMin", "最短", 1, 1440) +
      num("callMax", "最长", 1, 1440) +
      "</div></div>" +
      rng("callChance", "来电触发概率", 0, 100, "pct") +
      "</div>";

    const letterPanel =
      '<div class="card-box">' +
      '<div class="field"><label>回信等待时间（分钟，最长 720 分钟 = 12 小时；可填小数，0.1 ≈ 6 秒）</label><div class="pair">' +
      num("letterReplyMin", "最短", 0.1, 720) +
      num("letterReplyMax", "最长", 0.1, 720) +
      "</div></div>" +
      '<div class="field"><label>每封信的总句数（1 ~ 30 句，字卡逐张抽取，每张之间用「，」「。」隔开）</label><div class="pair">' +
      num("letterSentMin", "最少", 1, 30) +
      num("letterSentMax", "最多", 1, 30) +
      "</div></div>" +
      stepper("letterBreakChance", "分段换行概率", 0, 100, "pct", 5, '<div class="note">命中时信件会随机分成几段（段间空一行）；不命中就是一整段连续文字。</div>') +
      '<div class="field"><label>每段最多句数（1 ~ 6）</label><div class="pair">' +
      num("letterParaMax", "最多", 1, 6) +
      "</div></div>" +
      "</div>" +
      '<div class="card-box" style="margin-top:14px">' +
      sw("letterOn", "梦角主动写信") +
      '<div class="field"><label>主动写信间隔（分钟，60 ~ 1440，即 1 ~ 24 小时）</label><div class="pair">' +
      num("letterMin", "最短", 60, 1440) +
      num("letterMax", "最长", 60, 1440) +
      "</div></div>" +
      rng("letterChance", "触发概率", 0, 100, "pct") +
      "</div>";

    const cardsPanel =
      '<div class="card-box">' +
      '<div class="row"><span class="count-pill">共 ' + state.cards.length + " 条字卡</span>" +
      '<span class="count-pill">分组 ' + state.groups.length + " 个</span></div>" +
      groupBarHTML() +
      '<input type="search" id="cardSearch" placeholder="搜索字卡内容" value="' + esc(cardSearch) + '">' +
      '<div class="grp-pick" id="grpPick" style="margin-top:10px">' +
      '<span class="note" style="margin:0 6px 0 0;align-self:center">添加到分组：</span>' +
      state.groups.map(g => '<button class="' + (addGroup === g.id ? "on" : "") + '" data-addgrp="' + esc(g.id) + '">' + esc(g.name) + "</button>").join("") +
      '<button data-act="addGroupNew">+ 新建分组</button>' +
      "</div>" +
      '<textarea id="cardInput" placeholder="在这里粘贴字卡，一行一条，重复的会自动跳过"></textarea>' +
      '<div class="list-tools" style="margin-top:10px">' +
      '<button class="btn tiny" data-act="importFile">导入文件</button>' +
      '<button class="btn tiny" data-act="importAdd">导入添加（去重）</button>' +
      '<button class="btn tiny ghost" data-act="importReplace">覆盖导入</button>' +
      '<button class="btn tiny ghost" data-act="exportCards">导出为 txt</button>' +
      '<button class="btn tiny ghost" data-act="clearCards">清空</button>' +
      '<button class="btn tiny ghost" data-act="resetCards">恢复默认</button>' +
      "</div>" +
      '<div class="status-line" id="addStatus"></div>' +
      '<div class="note">批量导入自动按行分条、去重后加入所选分组；不选分组时默认进入「未分组」。</div>' +
      '<div class="note">「导入文件」支持 txt / docx / json：txt 一行一张卡（行首 [分组名] 可切换分组）；docx 按段落取文字；json 支持 {"groups":[{"name":"分组","cards":["卡"]}]}、[{"name":"分组","cards":[...]}]、{"分组":["卡"]} 等写法，新分组自动创建，同名分组直接并入原分组。</div>' +
      '<div class="grp-bar" style="margin-top:6px">' +
      state.groups
        .filter(g => g.id !== "none")
        .map(g => '<button class="grp-chip" data-act="renameGroup" data-gid="' + esc(g.id) + '">✎ ' + esc(g.name) + "</button>")
        .join("") +
      "</div>" +
      '<div id="cardList" style="margin-top:6px"></div>' +
      "</div>";

    const moodPanel =
      '<div class="card-box">' +
      '<div class="row"><span class="count-pill">开场动画文案 ' + state.atmo.opening.length + " 条</span>" +
      '<span class="count-pill">拍一拍文案 ' + state.atmo.pat.length + " 条</span></div>" +
      '<div class="field"><label>开场动画内容（每行一条，随机显示）</label>' +
      '<textarea id="atmOpening">' + esc(state.atmo.opening.join("\n")) + "</textarea>" +
      '<div class="list-tools" style="margin-top:8px">' +
      '<button class="btn tiny" data-act="saveAtmoOpening">保存开场文案</button>' +
      '<button class="btn tiny ghost" data-act="resetAtmoOpening">恢复默认</button>' +
      '<button class="btn tiny ghost" data-act="previewOpening">预览</button>' +
      "</div></div>" +
      '<div class="field"><label>拍一拍内容（每行一条，随机显示在【】里）</label>' +
      '<textarea id="atmPat">' + esc(state.atmo.pat.join("\n")) + "</textarea>" +
      '<div class="list-tools" style="margin-top:8px">' +
      '<button class="btn tiny" data-act="saveAtmoPat">保存拍一拍文案</button>' +
      '<button class="btn tiny ghost" data-act="resetAtmoPat">恢复默认</button>' +
      '<button class="btn tiny ghost" data-act="previewPat">预览</button>' +
      "</div></div>" +
      '<div class="list-tools"><button class="btn ghost tiny" data-act="openDecor">拍一拍样式（符号 / 动作）</button>' +
      '<button class="btn ghost tiny" data-act="previewOpening">预览开场动画</button></div>' +
      '<div class="note">拍一拍会显示为：—— 符号 昵称 【文案】 符号 ——</div>' +
      "</div>";

    const emojiPanel = emojiManageHTML();

    const faviconHTML =
      '<div class="field"><label>网站图标（显示在浏览器标签 / 手机桌面）</label>' +
      '<div class="icon-pick" id="iconPick">' +
      DATA.FAVICONS.map(
        f => '<button class="' + (S().favicon === f.id ? "on" : "") + '" data-icon="' + f.id + '"><span class="em">' + f.fg + "</span>" + esc(f.name) + "</button>"
      ).join("") +
      (typeof S().favicon === "string" && S().favicon.indexOf("data:") === 0
        ? '<button class="on" data-icon="custom"><img src="' + esc(S().favicon) + '">自定义</button>'
        : "") +
      '<button data-act="faviconUpload">＋ 自定义图片</button>' +
      '<button data-act="faviconReset">恢复默认</button>' +
      "</div></div>";

    const lookPanel =
      '<div class="card-box">' +
      '<div class="field"><label>主题配色</label><div class="pair"><select class="grow" data-set="theme">' + themeOpts + "</select>" +
      '<input type="color" data-set="primary" value="' + s.primary + '"></div></div>' +
      '<div class="field"><label>气泡样式</label><select data-set="bubbleStyle">' + bubbleOpts + "</select></div>" +
      '<div class="field"><label>气泡配色</label><div class="pair">' +
      '<span class="note" style="margin:0">我</span><input type="color" data-set="myBubble" value="' + s.myBubble + '">' +
      '<span class="note" style="margin:0">梦角</span><input type="color" data-set="aiBubble" value="' + s.aiBubble + '">' +
      "</div></div>" +
      '<div class="field"><label>聊天背景</label><div class="pair">' +
      '<span class="note" style="margin:0">底色</span><input type="color" data-set="chatColor" value="' + s.chatColor + '">' +
      '<button class="btn tiny ghost" data-act="bgUpload">上传背景图</button>' +
      '<button class="btn tiny ghost" data-act="bgClear">清除图片</button>' +
      "</div>" +
      '<input type="text" data-set="chatImage" value="' + esc(s.chatImage) + '" placeholder="或粘贴图片 URL">' +
      "</div>" +
      '<div class="field"><label>字体大小 <span class="val" data-for="fontSize"></span></label>' +
      '<div class="stepper">' +
      '<button class="stp" data-stepkey="fontSize" data-delta="-1">−</button>' +
      '<input type="range" data-set="fontSize" min="12" max="24" step="1" value="' + s.fontSize + '">' +
      '<button class="stp" data-stepkey="fontSize" data-delta="1">＋</button>' +
      "</div></div>" +
      '<div class="field"><label>字体</label><select data-set="font">' + fontOpts + "</select></div>" +
      '<div class="field"><label>时间戳样式</label><div class="grow">' + timeStyleSelect() + "</div>" +
      '<div class="note">时间戳显示在气泡下方。</div></div>' +
      "</div>" +
      '<div class="card-box" style="margin-top:14px">' + faviconHTML + "</div>";

    const mePanel =
      '<div class="card-box"><div class="note" style="margin-bottom:10px">' + esc(state.peer.name) + "</div>" +
      '<div class="avatar-edit">' + avatarHTML(state.peer, "edit", "🌙") +
      '<div style="flex:1;min-width:0">' +
      '<button class="btn tiny" data-act="peerAvatarUpload">上传头像</button> ' +
      '<button class="btn tiny ghost" data-act="peerAvatarReset">默认</button>' +
      '<div class="field" style="margin:10px 0 0"><input type="text" data-profile="peer.name" value="' + esc(state.peer.name) + '" placeholder="梦角的昵称"></div>' +
      '<div class="field" style="margin:8px 0 0"><input type="text" data-profile="peer.emoji" maxlength="4" value="' + esc(state.peer.emoji) + '" placeholder="默认头像 Emoji"></div>' +
      "</div></div>" +
      '<div class="row"><label>聊天页显示我头像</label><span class="switch"><input type="checkbox" data-set="showUserAvatar"' + (s.showUserAvatar !== false ? " checked" : "") + "><i></i></span></div>" +
      "</div>" +
      '<div class="card-box" style="margin-top:14px"><div class="note" style="margin-bottom:10px">' + esc(state.user.name) + "</div>" +
      '<div class="avatar-edit">' + avatarHTML(state.user, "edit", "🌸") +
      '<div style="flex:1;min-width:0">' +
      '<button class="btn tiny" data-act="userAvatarUpload">上传头像</button> ' +
      '<button class="btn tiny ghost" data-act="userAvatarReset">默认</button>' +
      '<div class="field" style="margin:10px 0 0"><input type="text" data-profile="user.name" value="' + esc(state.user.name) + '" placeholder="我的昵称"></div>' +
      '<div class="field" style="margin:8px 0 0"><input type="text" data-profile="user.emoji" maxlength="4" value="' + esc(state.user.emoji) + '" placeholder="默认头像 Emoji"></div>' +
      "</div></div></div>" +
      '<div class="list-tools" style="margin-top:16px">' +
      '<button class="btn tiny ghost" data-act="exportAll">导出备份</button>' +
      '<button class="btn tiny ghost" data-act="importAll">导入备份</button>' +
      '<button class="btn tiny danger" data-act="wipe">清空全部数据</button>' +
      "</div>";

    const bodies = { reply: reply, call: callPanel, letter: letterPanel, cards: cardsPanel, mood: moodPanel, emoji: emojiPanel, look: lookPanel, me: mePanel };

    return (
      '<div class="tabs">' + tabs.map(t => '<button class="stab' + (t[0] === setTab ? " active" : "") + '" data-tab="' + t[0] + '">' + t[1] + "</button>").join("") + "</div>" +
      '<div id="setPanel">' + bodies[setTab] + "</div>"
    );
  }

  function emojiManageHTML() {
    return (
      '<div class="card-box"><div class="row"><span class="count-pill">Emoji 库共 ' + totalEmoji() + " 个 · " + Object.keys(state.emojis).length + " 组</span>" +
      '<button class="btn tiny" data-act="addEmoji">+ 添加 Emoji</button>' +
      '<button class="btn tiny ghost" data-act="emojiGroupNew">+ 新建分组</button>' +
      '<button class="btn tiny ghost" data-act="resetEmoji">恢复默认</button></div>' +
      emojiGroupRowHTML() +
      '<input type="search" id="emojiMgrSearch" placeholder="搜索后点击即可删除" style="margin:8px 0 10px">' +
      '<div id="emojiMgrGrid" style="max-height:300px;overflow:auto"></div>' +
      '<div class="note">分组可新增 / 重命名 / 删除；添加 Emoji 时可选择分组。长按表情或点击可删除。</div></div>' +
      '<div class="card-box" style="margin-top:14px"><div class="row">' +
      '<span class="count-pill">自定义表情 ' + state.customStickers.length + " 张</span>" +
      '<button class="btn tiny" data-act="addSticker">＋ 批量添加图片</button>' +
      '<button class="btn tiny ghost" data-act="clearStickers">清空</button></div>' +
      '<div id="stickerMgr" style="margin-top:8px"></div>' +
      '<div class="status-line" id="stickerStatus"></div></div>'
    );
  }

  function totalEmoji() {
    return Object.keys(state.emojis).reduce((n, k) => n + state.emojis[k].length, 0);
  }

  function renderEmojiMgr() {
    const box = $("#emojiMgrGrid");
    if (!box) return;
    const f = (emojiFilter || ($("#emojiMgrSearch") ? $("#emojiMgrSearch").value : "") || "").trim();
    const picked = Object.keys(emojiPick).filter(k => emojiPick[k]).length;
    let html =
      '<div class="list-tools">' +
      '<button class="btn tiny ' + (emojiBatch ? "" : "ghost") + '" data-act="emojiBatch">' + (emojiBatch ? "退出批量管理" : "批量管理") + "</button>" +
      '<button class="btn tiny ghost" data-act="emojiPickAll">全选当前</button>' +
      '<button class="btn tiny danger" data-act="emojiBatchDel">批量删除</button>' +
      '<span class="hint">已选 ' + picked + " 个</span></div>";
    Object.keys(state.emojis).forEach(g => {
      const list = f ? state.emojis[g].filter(e => e.indexOf(f) === -1) : state.emojis[g];
      if (!list.length) return;
      html += '<div class="emoji-group-title">' + esc(g) + "</div><div class='emoji-grid'>";
      list.forEach(e => {
        html +=
          '<button data-emo="' + esc(e) + '" class="' + (emojiPick[e] ? "sel" : "") + '" style="' + (emojiBatch ? "" : "") + '">' + e + "</button>";
      });
      html += "</div>";
    });
    box.innerHTML = html || '<div class="empty">没有匹配的表情</div>';
  }

  function renderStickerMgr() {
    const box = $("#stickerMgr");
    if (!box) return;
    const picked = Object.keys(stickerPick).filter(k => stickerPick[k]).length;
    const head =
      '<div class="list-tools">' +
      '<button class="btn tiny ' + (stickerBatch ? "" : "ghost") + '" data-act="stickerBatch">' + (stickerBatch ? "退出批量管理" : "批量管理") + "</button>" +
      '<button class="btn tiny ghost" data-act="stickerPickAll">全选</button>' +
      '<button class="btn tiny danger" data-act="stickerBatchDel">批量删除</button>' +
      '<span class="hint">已选 ' + picked + " 张</span></div>";
    if (!state.customStickers.length) {
      box.innerHTML = head + '<div class="empty">还没有自定义表情，添加一张试试</div>';
      return;
    }
    box.innerHTML =
      head +
      '<div class="custom-grid">' +
      state.customStickers
        .map(
          (s, i) =>
            '<div class="ci' + (stickerPick[i] ? " sel" : "") + '">' +
            (stickerBatch ? '<button class="pick-box' + (stickerPick[i] ? " on" : "") + '" data-sticker-pick="' + i + '">' + (stickerPick[i] ? "✓" : "") + "</button>" : "") +
            '<img src="' + esc(s.src) + '" data-stk-attach="' + i + '"><button class="del" data-stk-del="' + i + '">✕</button></div>'
        )
        .join("") +
      "</div>";
  }

  function openSettings(tab) {
    if (tab) setTab = tab;
    openModal("设置", settingsHTML());
    syncSettingUI();
    if (setTab === "cards") renderCardList();
    if (setTab === "emoji") {
      renderEmojiMgr();
      renderStickerMgr();
    }
    bindSteppers();
  }

  let stepTimer = null;
  let stepDelay = null;

  function stepOnce(btn) {
    const key = btn.dataset.stepkey;
    const input = $('#modalBody [data-set="' + key + '"]');
    if (!input) return;
    const delta = Number(btn.dataset.delta);
    let v = Number(input.value) + delta;
    const min = input.min === "" ? -Infinity : Number(input.min);
    const max = input.max === "" ? Infinity : Number(input.max);
    v = clamp(Math.round(v), Math.min(min, max), Math.max(min, max));
    input.value = v;
    onSettingInput(input);
  }

  function bindSteppers() {
    $$("#modalBody [data-stepkey]").forEach(btn => {
      let hold = null;
      const stop = () => {
        clearTimeout(hold);
        clearInterval(stepTimer);
        hold = null;
        stepTimer = null;
      };
      btn.addEventListener("pointerdown", ev => {
        ev.preventDefault();
        ev.stopPropagation();
        stepOnce(btn);
        hold = setTimeout(() => {
          stepTimer = setInterval(() => stepOnce(btn), 110);
        }, 420);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach(t => btn.addEventListener(t, stop));
    });
  }

  function syncSettingUI() {
    const s = S();
    $$("#modalBody [data-set]").forEach(input => {
      const key = input.dataset.set;
      if (input.type === "checkbox") input.checked = !!s[key];
      else if (input.dataset.unit === "pct") input.value = Math.round(s[key] * 100);
      else input.value = s[key];
    });
    $$("#modalBody .val[data-for]").forEach(v => {
      const key = v.dataset.for;
      const input = $('#modalBody [data-set="' + key + '"]');
      if (!input) return;
      const unit = input.dataset.unit;
      v.textContent = unit === "pct" ? Math.round(s[key] * 100) + "%" : key === "fontSize" ? s[key] + " px" : key === "openingStars" ? s[key] + " 颗" : s[key];
    });
  }

  function onSettingInput(input) {
    const key = input.dataset.set;
    const s = S();
    let v;
    if (input.type === "checkbox") v = input.checked;
    else if (["text", "search", "color", "url", "password"].indexOf(input.type) >= 0 || input.tagName === "SELECT") v = input.value;
    else if (input.dataset.unit === "pct") v = clamp(Number(input.value) / 100, 0, 1);
    else v = Number(input.value);
    if (key === "theme") {
      const t = themeById(v);
      s.primary = t.primary;
      s.myBubble = t.myBubble;
      s.aiBubble = t.aiBubble;
      s.chatColor = t.chat;
    }
    if (typeof v === "number" && isNaN(v)) return;
    s[key] = v;
    PAIR_KEYS.forEach(pair => {
      const a = pair[0];
      const b = pair[1];
      if (a === key && s[a] > s[b]) s[b] = s[a];
      if (b === key && s[b] < s[a]) s[a] = s[b];
    });
    if (key === "fontSize") s.fontSize = clamp(s.fontSize, 12, 24);
    persist();
    if (APPEARANCE_KEYS.indexOf(key) >= 0) applyAppearance();
    if (["openingStyle", "openingGlow", "openingBg", "openingText", "openingStar", "openingDot", "openingStars", "openingSky", "patMinePhrase"].indexOf(key) >= 0) {
      applyOpening();
      buildStarfield();
      const pv = $("#decorPreview");
      if (pv) pv.innerHTML = decorPreviewHTML();
      renderChat();
    }
    if (RERENDER_KEYS.indexOf(key) >= 0) renderAll(true);
    const pairInputs = PAIR_KEYS.filter(p => p[0] === key || p[1] === key);
    pairInputs.forEach(p => {
      const other = $('#modalBody [data-set="' + (p[0] === key ? p[1] : p[0]) + '"]');
      if (other) other.value = s[p[0] === key ? p[1] : p[0]];
    });
    syncSettingUI();
    if (["proactiveMin", "proactiveMax", "callMin", "callMax", "letterMin", "letterMax", "moodHours", "replyMin", "replyMax"].indexOf(key) >= 0) {
      scheduleNext("proactive", "proactiveMin", "proactiveMax", 60000);
      scheduleNext("call", "callMin", "callMax", 60000);
      scheduleNext("letter", "letterMin", "letterMax", 60000);
      setTimer("mood", Math.max(1, S().moodHours) * 3600000);
    }
  }

  /* ===================== 心情手账 / 收藏 ===================== */

  function openDiary() {
    diaryDay = Date.now();
    openModal("心情手账 · " + state.peer.name, diaryHTML());
    bindDiary();
  }

  function bindDiary() {
    const prev = $("#diaryPrev");
    const next = $("#diaryNext");
    if (prev) prev.onclick = () => {
      diaryDay -= 86400000;
      openModal("心情手账 · " + state.peer.name, diaryHTML());
      bindDiary();
    };
    if (next) next.onclick = () => {
      diaryDay += 86400000;
      if (diaryDay > Date.now() + 86400000) diaryDay = Date.now() + 86400000;
      openModal("心情手账 · " + state.peer.name, diaryHTML());
      bindDiary();
    };
    const close = $("#diaryTodayBtn");
    if (close) close.onclick = () => showTodayPopup(true);
    $$("#modalBody [data-day]").forEach(b => {
      b.onclick = () => {
        diaryDay = Number(b.dataset.day);
        openModal("心情手账 · " + state.peer.name, diaryHTML());
        bindDiary();
      };
    });
    const week = $("#weekNav");
    if (week) {
      week.onclick = ev => {
        const btn = ev.target.closest("[data-week]");
        if (!btn) return;
        diaryDay = Number(btn.dataset.week);
        openModal("心情手账 · " + state.peer.name, diaryHTML());
        bindDiary();
      };
    }
  }

  function diaryRecords(ts) {
    return state.moodLog.filter(r => sameDay(r.ts, ts));
  }

  function startOfDay(ts) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  function calendarHTML() {
    const base = new Date(startOfDay(diaryDay));
    const first = new Date(base.getTime());
    first.setDate(1);
    const startPad = first.getDay();
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const weekDays = ["日", "一", "二", "三", "四", "五", "六"];
    let cells = weekDays.map(d => '<span class="lbl">' + d + "</span>").join("");
    for (let i = 0; i < startPad; i++) cells += "<span></span>";
    for (let d = 1; d <= daysInMonth; d++) {
      const ts = new Date(first.getFullYear(), first.getMonth(), d).getTime();
      const rec = diaryRecords(ts);
      const emo = rec.length ? rec[0].emoji : "";
      const cls = ["dot"];
      if (rec.length) cls.push("has");
      const imp = importantOn(ts);
      if (imp.length) cls.push("imp");
      if (sameDay(ts, Date.now())) cls.push("today");
      if (sameDay(ts, diaryDay)) cls.push("sel");
      const impTitle = imp.length ? " · " + imp.map(d => d.title).join("、") : "";
      cells += '<button class="' + cls.join(" ") + '" data-day="' + ts + '" title="' + d + "日" + impTitle + '">' + (emo || d) + "</button>";
    }
    const shown = new Date(base.getFullYear(), base.getMonth(), 1);
    return (
      '<div class="row" style="justify-content:space-between;margin-bottom:6px">' +
      '<button class="btn tiny ghost" data-act="calPrev">‹ 上月</button>' +
      "<b>" + shown.getFullYear() + " 年 " + (shown.getMonth() + 1) + " 月</b>" +
      '<button class="btn tiny ghost" data-act="calNext">下月 ›</button>' +
      "</div>" +
      '<div class="diary-dots">' + cells + "</div>"
    );
  }

  function diaryHTML() {
    const recs = diaryRecords(diaryDay).slice().sort((a, b) => b.ts - a.ts);
    const isToday = sameDay(diaryDay, Date.now());
    const head =
      '<div class="diary-head">' +
      '<button class="btn tiny ghost" id="diaryPrev">‹ 前一天</button>' +
      "<span>" + fmtDate(diaryDay) + " " + weekName(diaryDay) + (isToday ? " · 今天" : "") + "</span>" +
      '<button class="btn tiny ghost" id="diaryNext">后一天 ›</button>' +
      "</div>" +
      calendarHTML();
    const body = recs.length
      ? (function () {
          const top = recs[0];
          const mood =
            '<div class="diary-mood"><div class="diary-emo">' + esc(top.emoji) + "</div>" +
            '<div class="diary-st">' + top.status.map(s => "<b>" + esc(s) + "</b>").join("") + "</div>" +
            '<div class="note" style="margin-top:10px">状态来自字卡库随机 1~3 条，每小时刷新一次，可能变化也可能不变</div></div>';
          const tl =
            '<div class="tl">' +
            recs
              .map(
                r =>
                  '<div class="tl-item"><div class="tl-time">' + fmtDate(r.ts) + " " + fmtTime(r.ts) + "</div>" +
                  '<div class="tl-body"><span class="e">' + esc(r.emoji) + "</span>" + r.status.map(s => esc(s)).join(" · ") + "</div></div>"
              )
              .join("") +
            "</div>";
          return mood + tl;
        })()
      : '<div class="empty">' + (isToday ? "今天还没有记录" : "这一天没有记录") + "</div>";
    return (
      head + body +
      '<div class="diary-foot"><button class="btn primary block" id="diaryTodayBtn">' +
      (isToday ? "知道了，开始今天" : "知道了") + "</button></div>"
    );
  }

  function showTodayPopup(fromHistory) {
    const recs = diaryRecords(Date.now());
    const top = recs.length ? recs[0] : state.mood;
    el.todayDate.textContent = fmtDate(Date.now()) + " " + weekName(Date.now());
    el.todayEmo.textContent = top.emoji;
    el.todaySt.innerHTML = top.status.map(s => "<b>" + esc(s) + "</b>").join("");
    $("#todayClose").textContent = fromHistory ? "知道了" : "知道了，开始今天";
    el.todayPopup.hidden = false;
    if (!fromHistory) {
      state.dayFlags[dateKey(Date.now())] = true;
      persist();
    }
  }

  function checkDayRollover() {
    const k = dateKey(Date.now());
    if (state.dayFlags[k]) return;
    state.dayFlags[k] = true;
    persist();
    showTodayPopup(false);
    checkImportantToday(false);
  }

  function openFav() {
    const favs = state.messages.filter(m => m.fav && ["text", "sticker", "emoji"].indexOf(m.kind) >= 0);
    const html = favs.length
      ? favs
          .slice()
          .reverse()
          .map(m => {
            const text = m.kind === "sticker" ? "[图片表情]" : m.recalled ? "（已撤回）" : m.text;
            return (
              '<div class="fav-item" data-jump="' + m.id + '"><div class="fav-head"><span>' +
              (m.role === "me" ? esc(state.user.name) : esc(state.peer.name)) +
              " · " + fmtDate(m.ts) + " " + fmtTime(m.ts) + "</span>" +
              '<span class="fav-del" data-unfav="' + m.id + '">取消收藏</span></div>' +
              '<div class="fav-txt">' + (m.kind === "sticker" ? "<img src='" + esc(m.img) + "' style='max-width:120px;border-radius:8px'>" : esc(text)) + "</div></div>"
            );
          })
          .join("")
      : '<div class="empty">还没有收藏的消息<br><span class="hint">长按或右键消息可以收藏</span></div>';
    openModal("收藏夹 · " + state.messages.filter(m => m.fav).length + " 条", html);
  }

  /* ===================== 写信面板 ===================== */

  function openLetter() {
    letterView = null;
    renderLetterPanel();
  }

  function letterStatus(l) {
    const n = (l.replies || []).length;
    if (l.dir === "out") {
      if (!l.replied) return "等待回信";
      return "已回信" + (n ? " · 追问 " + n + " 次" : "");
    }
    if (!n) return "待回复";
    return "已回复 " + n + " 次";
  }

  function sendLetterReply(letterId) {
    const ta = $("#letterReplyInput");
    const text = ta ? ta.value.trim() : "";
    if (!text) {
      toast("写点什么再寄出吧");
      return;
    }
    const l = state.letters.filter(x => x.id === letterId)[0];
    if (!l) return;
    if (!Array.isArray(l.replies)) l.replies = [];
    l.replies.push({ role: "me", text: text, ts: Date.now() });
    persist();
    toast("回信已寄出");
    renderLetterPanel();
    if (Math.random() < 0.65) {
      setTimeout(() => {
        const cur = state.letters.filter(x => x.id === letterId)[0];
        if (!cur) return;
        if (!Array.isArray(cur.replies)) cur.replies = [];
        cur.replies.push({ role: "ai", text: buildLetterText(), ts: Date.now() });
        persist();
        toast(state.peer.name + " 回信了 ✉️");
        if (letterView && letterView.id === cur.id) renderLetterPanel();
      }, randInt(20000, 90000));
    }
  }

  function renderLetterPanel() {
    if (letterView) {
      const l = letterView;
      l.read = true;
      persist();
      renderBadges();
      const thread = (l.replies || [])
        .map(
          r =>
            '<div class="lr ' + r.role + '"><div class="lr-head">' + esc(r.role === "me" ? state.user.name : state.peer.name) + " · " + fmtDate(r.ts) + " " + fmtTime(r.ts) + "</div>" +
            '<div class="lr-body">' + esc(r.text) + "</div></div>"
        )
        .join("");
      const status = letterStatus(l);
      const html =
        '<div class="row"><button class="btn tiny ghost" data-act="letterBack">‹ 返回</button>' +
        '<span class="count-pill" style="margin-left:auto">' + esc(status) + "</span></div>" +
        '<div class="letter-item"><h4>✉️ ' + esc(l.title) + "</h4>" +
        '<div class="meta-line">' + (l.dir === "out" ? "你写给" + esc(state.peer.name) : esc(state.peer.name) + " 写给你") + " · " + fmtDate(l.ts) + " " + fmtTime(l.ts) + "</div>" +
        '<div class="letter-body">' + esc(l.content) + "</div>" +
        '<div class="letter-sign">—— ' + esc(l.dir === "out" ? state.user.name : state.peer.name) + "</div></div>" +
        (thread ? '<div class="lr-wrap">' + thread + "</div>" : "") +
        (l.dir === "in"
          ? '<div class="field" style="margin-top:14px"><label>回复这封信</label><textarea id="letterReplyInput" placeholder="写点什么回给 ' +
            esc(state.peer.name) + '…"></textarea></div>' +
            '<button class="btn block" data-act="sendLetterReply">寄出回信</button>' +
            '<div class="note">回信后 ' + esc(state.peer.name) + " 会按概率再回你一次。</div>"
          : "") +
        '<div style="height:14px"></div>';
      openModal("信件", html);
      return;
    }
    const list = state.letters.slice().sort((a, b) => b.ts - a.ts);
    const items = list.length
      ? list
          .map(
            l =>
              '<div class="letter-item" data-letter-open="' + l.id + '" style="cursor:pointer"><h4>✉️ ' + esc(l.title) +
              (l.dir === "out" ? "" : l.read ? "" : ' <span class="tag">未读</span>') +
              (l.dir === "out" ? "" : (l.replies || []).length ? ' <span class="tag done">已回复</span>' : ' <span class="tag wait">待回复</span>') +
              (l.dir === "out" && !l.replied ? ' <span class="tag wait">等待回信</span>' : "") +
              "</h4>" +
              '<div class="meta-line">' + (l.dir === "out" ? "寄给" + esc(state.peer.name) : esc(state.peer.name) + " 寄给你") + " · " + fmtDate(l.ts) + " " + fmtTime(l.ts) + "</div>" +
              "<p style='margin:0;color:var(--sub);font-size:.86em;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden'>" +
              esc((l.content || "").replace(/\n/g, " ")) + "</p></div>"
          )
          .join("")
      : '<div class="empty">还没有信件，写一封给 ' + esc(state.peer.name) + " 吧</div>";
    const html =
      '<div class="card-box"><div class="field"><label>标题</label><input type="text" id="letterTitle" placeholder="写给 ' + esc(state.peer.name) + ' 的信"></div>' +
      '<div class="field"><label>内容</label><textarea id="letterContent" placeholder="想说的话都可以写在这里…"></textarea></div>' +
      '<button class="btn block" data-act="sendLetter">寄出</button>' +
      '<div class="note">' + esc(state.peer.name) + " 会在设定的等待时间内回信（最长 12 小时），回信内容由字卡库随机抽取 " +
      S().letterSentMin + "~" + S().letterSentMax + " 句。</div></div>" +
      '<div style="height:14px"></div>' + items;
    openModal("写信 · " + state.peer.name, html);
  }

  /* ===================== 通话 ===================== */

  function startCall(dir, type) {
    if (call) return;
    call = {
      dir: dir,
      type: type || S().callType,
      state: "ringing",
      startTs: 0,
      zoom: 100,
      muted: false,
      speaker: true,
      video: (type || S().callType) === "video",
      tick: null,
      ringLeft: 0,
      minimized: false
    };
    if (el.modal.hidden === false) closeModal();
    el.stickerPanel.hidden = true;
    el.callOverlay.hidden = false;
    el.callTimer.hidden = true;
    el.callSub.textContent = dir === "in" ? "邀请你" + callTypeName(call.type) : "正在呼叫…";
    renderCall();
    if (dir === "out") {
      setTimeout(() => {
        if (!call || call.state !== "ringing") return;
        const r = Math.random();
        const ans = S().aiAnswerChance;
        if (r < ans) connectCall();
        else if (r < ans + (1 - ans) * 0.6) {
          call.state = "rejected";
          el.callSub.textContent = pickOne(DATA.DECLINE_LINES);
          pushMsg({ role: "sys", kind: "note", text: state.peer.name + " 拒绝了你的" + callTypeName(call.type) + "邀请" });
          renderChat();
          setTimeout(() => endCall(), 1800);
        } else {
          call.state = "missed";
          el.callSub.textContent = "对方无应答…";
          pushMsg({ role: "sys", kind: "note", text: "未接听 · " + state.peer.name + " 没有接你的" + callTypeName(call.type) });
          renderChat();
          setTimeout(() => endCall(), 1600);
        }
      }, 2400);
    } else {
      call.ringLeft = 16;
      call.tick = setInterval(() => {
        if (!call) return;
        if (call.state === "connected") {
          const t = fmtDur(Date.now() - call.startTs);
          if (call.minimized) el.bubbleTimer.textContent = t;
          else {
            el.callTimer.hidden = false;
            el.callTimer.textContent = t;
          }
          return;
        }
        call.ringLeft--;
        el.callSub.textContent = "邀请你" + callTypeName(call.type) + " · " + call.ringLeft + "s";
        if (call.minimized) el.bubbleTimer.textContent = "呼叫中 " + call.ringLeft + "s";
        if (call.ringLeft <= 0) {
          pushMsg({ role: "sys", kind: "note", text: "错过通话 · " + state.peer.name + " 给你拨打了" + callTypeName(call.type) });
          endCall("missed");
        }
      }, 1000);
    }
  }

  function callTypeName(t) {
    return t === "video" ? "视频通话" : "语音通话";
  }

  function connectCall() {
    if (!call) return;
    call.state = "connected";
    call.startTs = Date.now();
    el.callSub.textContent = callTypeName(call.type);
    el.callTimer.hidden = false;
    el.callTimer.textContent = "00:00";
    renderCall();
    clearInterval(call.tick);
    call.tick = null;
    call.tick = setInterval(() => {
      if (!call || call.state !== "connected") return;
      const t = fmtDur(Date.now() - call.startTs);
      if (call.minimized) el.bubbleTimer.textContent = t;
      else el.callTimer.textContent = t;
    }, 300);
    clearTimeout(call.hangTimer);
    call.hangTimer = null;
    const chance = S().peerHangupChance != null ? S().peerHangupChance : 0.05;
    if (Math.random() < chance) {
      call.hangTimer = setTimeout(() => {
        if (!call || call.state !== "connected") return;
        const dur = fmtDur(Date.now() - call.startTs);
        pushMsg({
          role: "sys",
          kind: "note",
          text: state.peer.name + " 挂断了" + callTypeName(call.type) + " · 时长 " + dur
        });
        call.state = "peer-hangup";
        endCall();
        toast(state.peer.name + " 挂断了通话");
      }, randInt(20000, 120000));
    }
  }

  function endCall(reason) {
    if (!call) return;
    clearInterval(call.tick);
    clearTimeout(call.hangTimer);
    if (call.state === "connected") {
      const dur = fmtDur(Date.now() - call.startTs);
      pushMsg({ role: "sys", kind: "note", text: "通话结束 · " + callTypeName(call.type) + " " + dur });
    } else if (call.state === "ringing" && call.dir === "in") {
      pushMsg({ role: "sys", kind: "note", text: "已挂断 · 未接听" + state.peer.name + "的" + callTypeName(call.type) });
    }
    call = null;
    el.callOverlay.hidden = true;
    el.callBubble.hidden = true;
    renderAll();
    if (reason === "missed") toast("错过了 " + state.peer.name + " 的通话");
  }

  function minimizeCall() {
    if (!call) return;
    call.minimized = true;
    el.callOverlay.hidden = true;
    el.callBubble.hidden = false;
    const other = state.peer;
    el.bubbleName.textContent = other.name;
    el.bubbleAvatar.innerHTML = other.avatar
      ? '<img src="' + esc(other.avatar) + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">'
      : esc(other.emoji || "🌙");
    el.bubbleTimer.textContent = call.state === "connected" ? fmtDur(Date.now() - call.startTs) : "呼叫中";
    positionBubble();
  }

  function restoreCall() {
    if (!call) return;
    call.minimized = false;
    el.callBubble.hidden = true;
    el.callOverlay.hidden = false;
    renderCall();
  }

  function positionBubble() {
    const b = el.callBubble;
    const w = b.offsetWidth || 170;
    const h = b.offsetHeight || 52;
    const pos = state.callPos || { x: 16, y: window.innerHeight - 140 };
    const x = clamp(pos.x, 8, Math.max(8, window.innerWidth - w - 8));
    const y = clamp(pos.y, 8, Math.max(8, window.innerHeight - h - 8));
    b.style.left = x + "px";
    b.style.top = y + "px";
    state.callPos = { x: x, y: y };
  }

  function bindCallBubble() {
    const b = el.callBubble;
    let dragging = false;
    let moved = false;
    let sx = 0;
    let sy = 0;
    let ox = 0;
    let oy = 0;
    b.addEventListener("pointerdown", ev => {
      if (ev.target.closest(".bb-hang")) return;
      dragging = true;
      moved = false;
      sx = ev.clientX;
      sy = ev.clientY;
      const rect = b.getBoundingClientRect();
      ox = rect.left;
      oy = rect.top;
      try {
        if (b.setPointerCapture) b.setPointerCapture(ev.pointerId);
      } catch (e) {
        /* ignore */
      }
    });
    b.addEventListener("pointermove", ev => {
      if (!dragging) return;
      const dx = ev.clientX - sx;
      const dy = ev.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
      b.style.left = clamp(ox + dx, 8, window.innerWidth - b.offsetWidth - 8) + "px";
      b.style.top = clamp(oy + dy, 8, window.innerHeight - b.offsetHeight - 8) + "px";
    });
    const stop = ev => {
      if (!dragging) return;
      dragging = false;
      const rect = b.getBoundingClientRect();
      state.callPos = { x: rect.left, y: rect.top };
      persist();
      if (!moved) restoreCall();
    };
    b.addEventListener("pointerup", stop);
    b.addEventListener("pointercancel", () => {
      dragging = false;
    });
    $("#bubbleHang").addEventListener("click", ev => {
      ev.stopPropagation();
      endCall();
    });
    window.addEventListener("resize", () => {
      if (call && call.minimized) positionBubble();
    });
  }

  function renderCall() {
    if (!call) return;
    const person = call.dir === "in" ? state.peer : state.user;
    el.callName.textContent = person.name;
    el.callAvatar.innerHTML = person.avatar
      ? '<img src="' + esc(person.avatar) + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">'
      : esc(person.emoji || "🌙");
    el.selfPreviewImg.innerHTML = state.user.avatar
      ? '<img src="' + esc(state.user.avatar) + '" alt="" style="width:100%;height:100%;object-fit:cover">'
      : '<span style="font-size:34px">' + esc(state.user.emoji || "🌸") + "</span>";
    el.callZoom.value = call.zoom;
    el.callAvaWrap.style.transform = "scale(" + call.zoom / 100 + ")";
    el.callAvaWrap.classList.toggle("ringing", call.state === "ringing");
    el.btnAnswer.hidden = call.state !== "ringing" || call.dir !== "in";
    el.hangupLabel.textContent = call.state === "ringing" && call.dir === "in" ? "挂断" : call.state === "connected" ? "结束" : "取消";
    el.selfPreview.hidden = !call.video;
    el.btnVideo.classList.toggle("on", call.video);
    el.btnMute.classList.toggle("on", call.muted);
    el.btnSpeaker.classList.toggle("on", call.speaker);
    if (call.state === "ringing" && call.dir === "in") el.callSub.textContent = "邀请你" + callTypeName(call.type);
  }

  /* ===================== 表情面板 ===================== */

  function renderStickerPanel() {
    const q = (el.emojiSearch.value || "").trim();
    let html = "";
    Object.keys(state.emojis).forEach(g => {
      const list = q ? state.emojis[g].filter(e => e.indexOf(q) === -1) : state.emojis[g];
      if (!list.length) return;
      html += '<div class="emoji-group-title">' + esc(g) + "</div><div class='emoji-grid'>";
      html +=
        list
          .map(
            e =>
              '<button data-emoji="' + esc(e) + '"><span class="em">' + e + '</span><i class="tile-del" data-del-emoji="' + esc(e) + '">✕</i></button>'
          )
          .join("");
      html += "</div>";
    });
    el.emojiGrid.innerHTML = html || '<div class="empty">没有匹配的表情</div>';
    el.customGrid.innerHTML = state.customStickers.length
      ? state.customStickers
          .map(
            (s, i) =>
              '<div class="ci"><img src="' + esc(s.src) + '" data-attach="' + i + '"><button class="del" data-del-sticker="' + i + '">✕</button></div>'
          )
          .join("")
      : '<div class="empty">还没有自定义表情<br><span class="hint">点「＋ 批量添加图片」</span></div>';
    el.imageGrid.innerHTML = state.images.length
      ? state.images
          .map(
            (s, i) =>
              '<div class="ci"><img src="' + esc(s.src) + '" data-img-attach="' + i + '"><button class="del" data-del-image="' + i + '">✕</button></div>'
          )
          .join("")
      : '<div class="empty">还没有聊天图片<br><span class="hint">输入框左侧 🖼️ 可以发送图片</span></div>';
  }

  function toggleStickerPanel(pane) {
    if (el.stickerPanel.hidden) {
      if (pane) $$(".ptab").forEach(t => t.classList.toggle("active", t.dataset.stk === pane));
      el.emojiPane.hidden = pane === "custom" || pane === "image";
      el.customPane.hidden = pane !== "custom";
      el.imagePane.hidden = pane !== "image";
      renderStickerPanel();
      el.stickerPanel.hidden = false;
    } else {
      el.stickerPanel.hidden = true;
    }
  }

  function attachMedia(src, kind) {
    attachRef = src;
    attachKind = kind || "sticker";
    el.attachImg.src = src;
    el.attachTxt.textContent = kind === "image" ? "图片将随消息发送" : "表情将随消息发送";
    el.attachBar.hidden = false;
    toggleStickerPanel();
    el.input.focus();
  }

  function attachSticker(src) {
    attachMedia(src, "sticker");
  }

  function insertToInput(text) {
    const inp = el.input;
    const start = inp.selectionStart == null ? inp.value.length : inp.selectionStart;
    const end = inp.selectionEnd == null ? inp.value.length : inp.selectionEnd;
    inp.value = inp.value.slice(0, start) + text + inp.value.slice(end);
    inp.focus();
    inp.selectionStart = inp.selectionEnd = start + text.length;
    autoGrow();
  }

  /* ===================== 发送 ===================== */

  function sendCurrent() {
    const text = el.input.value.trim();
    if (!text && !attachRef) {
      toast("说点什么吧");
      return;
    }
    let pushed;
    if (attachRef) {
      const kind = attachKind === "image" ? "image" : "sticker";
      pushed = pushMsg({ role: "me", kind: kind, img: attachRef, text: text });
      if (kind === "image" && state.images.filter(i => i.src === attachRef).length === 0) {
        state.images.unshift({ src: attachRef, ts: Date.now() });
        if (state.images.length > 60) state.images.length = 60;
        persist();
      }
      attachRef = null;
      el.attachBar.hidden = true;
    } else {
      pushed = pushMsg({ role: "me", kind: "text", text: text });
    }
    if (quoteRef) {
      const src = state.messages.filter(x => x.id === quoteRef.msgId)[0];
      if (src) pushed.quote = { role: src.role, text: src.kind === "sticker" || src.kind === "image" ? "[图片]" : src.text };
      quoteRef = null;
      el.quoteBar.hidden = true;
    }
    el.input.value = "";
    autoGrow();
    el.stickerPanel.hidden = true;
    renderAll(true);
    scheduleReply();
  }

  function autoGrow() {
    const max = Math.min(window.innerHeight * 0.34, 150);
    el.input.style.height = "auto";
    const h = Math.min(max, Math.max(40, el.input.scrollHeight));
    el.input.style.height = h + "px";
    el.input.style.overflowY = el.input.scrollHeight > max ? "auto" : "hidden";
  }

  function bindLongPress(root, sel, cls) {
    if (!root) return;
    let timer = null;
    let target = null;
    const start = ev => {
      const t = ev.target.closest(sel);
      if (!t) return;
      target = t;
      if (ev.cancelable) ev.preventDefault();
      clearTimeout(timer);
      timer = setTimeout(() => {
        target = null;
        t.classList.add(cls);
        if (navigator.vibrate) {
          try {
            navigator.vibrate(12);
          } catch (e) {}
        }
      }, 380);
    };
    const clear = () => {
      clearTimeout(timer);
      timer = null;
      target = null;
    };
    root.addEventListener("pointerdown", start);
    root.addEventListener("touchstart", start, { passive: false });
    ["pointerup", "pointercancel", "pointerleave", "touchend", "touchcancel", "touchmove", "scroll"].forEach(t =>
      root.addEventListener(t, clear, true)
    );
  }

  /* ---------- 裁剪 ---------- */
  let cropper = null;

  function cropImage(file, maxSize, quality) {
    return new Promise(resolve => {
      const fr = new FileReader();
      fr.onerror = () => resolve(null);
      fr.onload = () => {
        const img = new Image();
        img.onerror = () => resolve(null);
        img.onload = () => {
          openCropper(img, maxSize, quality, resolve);
        };
        img.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  function openCropper(img, maxSize, quality, done) {
    const overlay = el.cropper;
    const stage = el.cropStage;
    const rect = el.cropRect;
    const holder = el.cropImg;
    holder.src = img.src;
    overlay.hidden = false;
    const stageBox = { w: 0, h: 0 };
    setTimeout(() => {
      const maxW = stage.clientWidth;
      const maxH = stage.clientHeight;
      const r = Math.min(maxW / img.width, maxH / img.height, 1);
      const dw = Math.max(1, Math.round(img.width * r));
      const dh = Math.max(1, Math.round(img.height * r));
      holder.style.width = dw + "px";
      holder.style.height = dh + "px";
      stageBox.w = dw;
      stageBox.h = dh;
      const norm = { x: 0.08, y: 0.08, w: 0.84, h: 0.84 };
      cropper = { img: img, maxSize: maxSize, quality: quality, done: done, box: stageBox, norm: norm, ratio: "free", drag: null };
      applyRect();
      bindCropEvents();
    }, 20);

    function applyRect() {
      const n = cropper.norm;
      rect.style.left = n.x * cropper.box.w + "px";
      rect.style.top = n.y * cropper.box.h + "px";
      rect.style.width = n.w * cropper.box.w + "px";
      rect.style.height = n.h * cropper.box.h + "px";
    }

    function bindCropEvents() {
      stage.onpointerdown = ev => {
        const n = cropper.norm;
        const px = (ev.clientX - stage.getBoundingClientRect().left) / cropper.box.w;
        const py = (ev.clientY - stage.getBoundingClientRect().top) / cropper.box.h;
        const handle = ev.target.closest(".ch");
        if (handle) {
          cropper.drag = { mode: handle.dataset.h, px: px, py: py, n: Object.assign({}, n) };
        } else if (px >= n.x && px <= n.x + n.w && py >= n.y && py <= n.y + n.h) {
          cropper.drag = { mode: "move", px: px, py: py, n: Object.assign({}, n) };
        } else {
          cropper.drag = { mode: "move", px: px, py: py, n: Object.assign({}, n), recenter: true };
        }
        stage.setPointerCapture && stage.setPointerCapture(ev.pointerId);
        ev.preventDefault();
      };
      stage.onpointermove = ev => {
        if (!cropper || !cropper.drag) return;
        const box = stage.getBoundingClientRect();
        const px = (ev.clientX - box.left) / cropper.box.w;
        const py = (ev.clientY - box.top) / cropper.box.h;
        const d = cropper.drag;
        let n = Object.assign({}, d.n);
        if (d.mode === "move") {
          n.x = clamp(d.n.x + (px - d.px), 0, 1 - d.n.w);
          n.y = clamp(d.n.y + (py - d.py), 0, 1 - d.n.h);
          if (d.recenter) {
            n.x = clamp(px - d.n.w / 2, 0, 1 - d.n.w);
            n.y = clamp(py - d.n.h / 2, 0, 1 - d.n.h);
          }
        } else {
          const right = d.n.x + d.n.w;
          const bottom = d.n.y + d.n.h;
          if (d.mode.indexOf("w") >= 0) n.x = Math.min(clamp(px, 0, right - 0.06), right - 0.06);
          if (d.mode.indexOf("e") >= 0) n.w = clamp(px - d.n.x, 0.06, 1 - d.n.x);
          if (d.mode.indexOf("n") >= 0) n.y = Math.min(clamp(py, 0, bottom - 0.06), bottom - 0.06);
          if (d.mode.indexOf("s") >= 0) n.h = clamp(py - d.n.y, 0.06, 1 - d.n.y);
          const ratio = cropper.ratio === "free" ? 0 : Number(cropper.ratio);
          if (ratio) {
            const targetH = (n.w * cropper.box.w) / (ratio * cropper.box.h);
            if (d.mode.indexOf("n") >= 0) {
              n.y = clamp(bottom - targetH, 0, bottom - 0.06);
              n.h = bottom - n.y;
            } else if (d.mode.indexOf("s") >= 0) {
              n.h = clamp(targetH, 0.06, bottom - n.y);
            } else {
              n.w = clamp(n.h * ratio * cropper.box.h / cropper.box.w, 0.06, right - n.x);
            }
          }
        }
        cropper.norm = n;
        applyRect();
        ev.preventDefault();
      };
      stage.onpointerup = stage.onpointercancel = () => {
        if (cropper) cropper.drag = null;
      };
    }

    $$("#cropper .ratio").forEach(b => {
      b.onclick = () => {
        $$("#cropper .ratio").forEach(x => x.classList.remove("on"));
        b.classList.add("on");
        cropper.ratio = b.dataset.ratio;
        const ratio = cropper.ratio === "free" ? 0 : Number(cropper.ratio);
        if (ratio) {
          let w = 0.8;
          let h = (w * cropper.box.w) / (ratio * cropper.box.h);
          if (h > 0.8) {
            h = 0.8;
            w = (h * ratio * cropper.box.h) / cropper.box.w;
          }
          cropper.norm = { x: (1 - w) / 2, y: (1 - h) / 2, w: w, h: h };
          applyRect();
        }
      };
    });

    el.cropOk.onclick = () => {
      const c = cropper;
      const n = c.norm;
      const sx = Math.round(n.x * img.width);
      const sy = Math.round(n.y * img.height);
      const sw = Math.max(1, Math.round(n.w * img.width));
      const sh = Math.max(1, Math.round(n.h * img.height));
      const scale = Math.min(1, (c.maxSize || 900) / Math.max(sw, sh));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(sw * scale));
      canvas.height = Math.max(1, Math.round(sh * scale));
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
      closeCropper();
      c.done(canvas.toDataURL("image/jpeg", c.quality || 0.82));
    };
    el.cropCancel.onclick = () => {
      const c = cropper;
      closeCropper();
      if (c) c.done(null);
    };
    overlay.onclick = ev => {
      if (ev.target === overlay) el.cropCancel.click();
    };
  }

  function closeCropper() {
    el.cropper.hidden = true;
    el.cropStage.onpointerdown = el.cropStage.onpointermove = el.cropStage.onpointerup = null;
    cropper = null;
  }

  async function pickImages() {
    const files = await pickFiles("image/*");
    if (!files || !files.length) return;
    await addChatImages(files);
  }

  async function addChatImages(files) {
    const status = $("#stickerStatus");
    if (status) {
      status.classList.remove("done");
      status.textContent = "添加中…";
      toast("添加中…");
    }
    let done = 0;
    for (let i = 0; i < files.length; i++) {
      try {
        const url = await cropImage(files[i], 900, 0.82);
        if (!url) continue;
        state.images.unshift({ src: url, ts: Date.now() });
        done++;
      } catch (e) {}
    }
    if (state.images.length > 60) state.images.length = 60;
    persist();
    renderStickerPanel();
    renderStickerMgr();
    if (status) {
      status.classList.add("done");
      status.textContent = "添加完成（" + done + " 张）";
    }
    toast("添加完成，共 " + done + " 张");
  }

  /* ===================== 消息菜单 ===================== */

  let menuEl = null;
  let menuOpenedAt = 0;

  function closeMenu() {
    if (menuEl) {
      menuEl.remove();
      menuEl = null;
    }
  }

  function openMenu(msgId, x, y) {
    closeMenu();
    menuOpenedAt = Date.now();
    const m = state.messages.filter(v => v.id === msgId)[0];
    if (!m || m.kind === "note") return;
    menuEl = document.createElement("div");
    menuEl.className = "msg-menu";
    const canRecall = m.role === "me" ? Date.now() - m.ts < 120000 : true;
    menuEl.innerHTML =
      '<button data-m="quote">❝ 引用</button>' +
      '<button data-m="fav">' + (m.fav ? "★ 取消收藏" : "☆ 收藏") + "</button>" +
      '<button data-m="copy">⧉ 复制</button>' +
      '<button data-m="recall"' + (canRecall ? "" : ' style="opacity:.45"') + ">↩ 撤回</button>" +
      '<button data-m="del" class="danger">🗑 删除</button>';
    document.body.appendChild(menuEl);
    const w = menuEl.offsetWidth;
    const h = menuEl.offsetHeight;
    menuEl.style.left = clamp(x, 8, innerWidth - w - 8) + "px";
    menuEl.style.top = clamp(y, 8, innerHeight - h - 8) + "px";
    menuEl.addEventListener("click", ev => {
      const btn = ev.target.closest("button[data-m]");
      if (!btn) return;
      const act = btn.dataset.m;
      closeMenu();
      handleMsgAction(m, act);
    });
  }

  function handleMsgAction(m, act) {
    if (act === "quote") {
      quoteRef = { msgId: m.id };
      el.quoteText.textContent = (m.role === "me" ? "你：" : state.peer.name + "：") + (m.kind === "sticker" ? "[图片表情]" : m.text);
      el.quoteBar.hidden = false;
      el.input.focus();
    } else if (act === "fav") {
      m.fav = !m.fav;
      persist();
      renderBadges();
      renderChat();
      toast(m.fav ? "已收藏 ⭐" : "已取消收藏");
    } else if (act === "copy") {
      const t = m.kind === "sticker" ? m.img : m.text;
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => toast("已复制"), () => toast("复制失败"));
    } else if (act === "recall") {
      if (m.role === "me" && Date.now() - m.ts >= 120000) {
        toast("超过 2 分钟就不能撤回了");
        return;
      }
      m.recalled = true;
      m.fav = false;
      persist();
      renderAll(true);
      toast((m.role === "me" ? "你" : state.peer.name) + " 撤回了一条消息");
    } else if (act === "del") {
      const i = state.messages.indexOf(m);
      if (i >= 0) state.messages.splice(i, 1);
      persist();
      renderAll(true);
      toast("已删除");
    }
  }

  function jumpTo(id) {
    closeModal();
    setTimeout(() => {
      const node = el.chat.querySelector('[data-id="' + id + '"]');
      if (!node) return;
      node.scrollIntoView({ block: "center" });
      node.classList.add("flash");
      setTimeout(() => node.classList.remove("flash"), 1500);
    }, 80);
  }

  /* ===================== 事件绑定 ===================== */

  function bindEvents() {
    el.send.addEventListener("click", sendCurrent);
    el.input.addEventListener("input", autoGrow);
    el.input.addEventListener("keydown", ev => {
      if (ev.key === "Enter" && !ev.shiftKey && !ev.isComposing) {
        ev.preventDefault();
        sendCurrent();
      }
    });
    el.stickerBtn.addEventListener("click", () => toggleStickerPanel());
    $("#attachClose").addEventListener("click", () => {
      attachRef = null;
      el.attachBar.hidden = true;
    });
    $("#quoteClose").addEventListener("click", () => {
      quoteRef = null;
      el.quoteBar.hidden = true;
    });
    $("#emojiSearch").addEventListener("input", renderStickerPanel);
    $$(".ptab").forEach(t => t.addEventListener("click", () => toggleStickerPanel(t.dataset.stk)));
    $$("[data-close]").forEach(b => b.addEventListener("click", () => ($("#" + b.dataset.close)).hidden = true));
    $("#btnAddEmoji").addEventListener("click", addEmojiFlow);
    $("#btnUploadSticker").addEventListener("click", uploadSticker);
    $("#btnSettings").addEventListener("click", () => openSettings());
    $("#btnLetterTop").addEventListener("click", openLetter);
    $("#btnDates").addEventListener("click", openDates);
    $("#btnQuiz").addEventListener("click", openQuiz);
    $("#btnCall").addEventListener("click", () => (call ? null : startCall("out")));
    $("#btnDiary").addEventListener("click", openDiary);
    $("#btnFav").addEventListener("click", openFav);
    $("#btnMore").addEventListener("click", () => {
      el.quickBar.hidden = !el.quickBar.hidden;
      el.moreBtn.classList.toggle("on", !el.quickBar.hidden);
      autoGrow();
    });
    $("#btnCards").addEventListener("click", () => openSettings("cards"));
    $$("[data-quick]").forEach(b =>
      b.addEventListener("click", () => {
        const q = b.dataset.quick;
        if (q === "letter") openLetter();
        if (q === "pat") doUserPat();
        if (q === "call") startCall("out");
        if (q === "sticker") toggleStickerPanel("emoji");
        if (q === "diary") openDiary();
        if (q === "fav") openFav();
        el.quickBar.hidden = true;
        el.moreBtn.classList.remove("on");
      })
    );

    let lastTap = 0;
    el.peerBox.addEventListener("dblclick", doUserPat);
    el.peerBox.addEventListener("touchend", ev => {
      const now = Date.now();
      if (now - lastTap < 320) {
        doUserPat();
        lastTap = 0;
      } else lastTap = now;
      ev.preventDefault();
    });

    el.imageBtn.addEventListener("click", pickImages);
    $("#btnUploadImage").addEventListener("click", pickImages);
    el.myAvatarBtn.addEventListener("click", openMyInfo);
    $("#todayClose").addEventListener("click", () => (el.todayPopup.hidden = true));
    const mnClose = $("#mnClose");
    if (mnClose) mnClose.addEventListener("click", () => ($("#miniNotice").hidden = true));
    const mnBox = $("#miniNotice");
    if (mnBox) mnBox.addEventListener("click", ev => { if (ev.target.closest(".mn-x")) mnBox.hidden = true; });
    el.callOverlay.addEventListener("click", ev => {
      if (ev.target === el.callOverlay && call && call.state === "connected") minimizeCall();
    });
    $("#btnMinCall").addEventListener("click", minimizeCall);
    bindCallBubble();
    el.emojiGrid.addEventListener("click", ev => {
      const del = ev.target.closest("[data-del-emoji]");
      if (del) {
        ev.stopPropagation();
        const v = del.dataset.delEmoji;
        Object.keys(state.emojis).forEach(g => {
          const i = state.emojis[g].indexOf(v);
          if (i >= 0) state.emojis[g].splice(i, 1);
        });
        persist();
        renderStickerPanel();
        renderEmojiMgr();
        toast("已删除 " + v);
        return;
      }
      const b = ev.target.closest("[data-emoji]");
      if (!b) return;
      if (b.classList.contains("show-del")) {
        b.classList.remove("show-del");
        return;
      }
      insertToInput(b.querySelector(".em").textContent);
      toggleStickerPanel("emoji");
    });
    bindLongPress(el.emojiGrid, "[data-emoji]", "show-del");
    bindLongPress(el.customGrid, ".ci", "show-del");
    bindLongPress(el.imageGrid, ".ci", "show-del");
    el.emojiGrid.addEventListener("contextmenu", ev => {
      const b = ev.target.closest("[data-emoji]");
      if (!b) return;
      ev.preventDefault();
      const v = b.dataset.emoji;
      Object.keys(state.emojis).forEach(g => {
        const i = state.emojis[g].indexOf(v);
        if (i >= 0) state.emojis[g].splice(i, 1);
      });
      persist();
      renderStickerPanel();
      toast("已从表情包移除 " + v);
    });
    el.customGrid.addEventListener("click", ev => {
      const del = ev.target.closest("[data-del-sticker]");
      if (del) {
        ev.stopPropagation();
        state.customStickers.splice(Number(del.dataset.delSticker), 1);
        persist();
        renderStickerPanel();
        renderStickerMgr();
        toast("已删除");
        return;
      }
      const ci = ev.target.closest(".ci");
      if (ci && ci.classList.contains("show-del")) {
        ci.classList.remove("show-del");
        return;
      }
      const img = ev.target.closest("[data-attach]");
      if (img) attachSticker(state.customStickers[Number(img.dataset.attach)].src);
    });
    el.imageGrid.addEventListener("click", ev => {
      const del = ev.target.closest("[data-del-image]");
      if (del) {
        ev.stopPropagation();
        state.images.splice(Number(del.dataset.delImage), 1);
        persist();
        renderStickerPanel();
        toast("已删除");
        return;
      }
      const ci = ev.target.closest(".ci");
      if (ci && ci.classList.contains("show-del")) {
        ci.classList.remove("show-del");
        return;
      }
      const img = ev.target.closest("[data-img-attach]");
      if (img) attachMedia(state.images[Number(img.dataset.imgAttach)].src, "image");
    });

    let pressTimer = null;
    let suppressTapUntil = 0;
    el.chat.addEventListener("contextmenu", ev => {
      const bubble = ev.target.closest("[data-menu]");
      if (!bubble) return;
      ev.preventDefault();
      suppressTapUntil = Date.now() + 700;
      openMenu(bubble.dataset.menu, ev.clientX, ev.clientY);
    });
    el.chat.addEventListener("pointerdown", ev => {
      const bubble = ev.target.closest("[data-menu]");
      if (!bubble) return;
      const rect = bubble.getBoundingClientRect();
      const px = ev.clientX;
      const py = ev.clientY;
      pressTimer = setTimeout(() => {
        suppressTapUntil = Date.now() + 700;
        if (navigator.vibrate) navigator.vibrate(12);
        openMenu(bubble.dataset.menu, rect.left + rect.width / 2, rect.top + rect.height / 2);
      }, 480);
      const onMove = e2 => {
        if (Math.abs(e2.clientX - px) > 8 || Math.abs(e2.clientY - py) > 8) clearTimeout(pressTimer);
      };
      el.chat.addEventListener("pointermove", onMove, { once: true });
      ["pointerup", "pointercancel"].forEach(t => el.chat.addEventListener(t, () => el.chat.removeEventListener("pointermove", onMove), { once: true }));
    });
    ["pointerup", "pointermove", "pointercancel", "scroll"].forEach(t =>
      el.chat.addEventListener(t, () => clearTimeout(pressTimer), true)
    );
    el.chat.addEventListener("click", ev => {
      const letter = ev.target.closest("[data-letter]");
      if (letter) {
        letterView = state.letters.filter(l => l.id === letter.dataset.letter)[0] || null;
        if (letterView) renderLetterPanel();
        return;
      }
      const bubble = ev.target.closest("[data-menu]");
      if (!bubble) return;
      if (Date.now() < suppressTapUntil) return;
      const sel = window.getSelection ? String(window.getSelection() || "") : "";
      if (sel.trim()) return;
      const rect = bubble.getBoundingClientRect();
      openMenu(bubble.dataset.menu, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });

    $("#modalClose").addEventListener("click", closeModal);
    el.modal.addEventListener("click", ev => {
      if (ev.target === el.modal) closeModal();
    });
    if (window.ResizeObserver) {
      const chatRO = new ResizeObserver(() => scrollChatToEnd(false));
      chatRO.observe(el.chat);
    }

    el.modalBody.addEventListener("click", onModalClick);
    el.modalBody.addEventListener("input", ev => {
      const da = ev.target.closest("[data-decor-act-custom]");
      if (da) {
        decorDraft[da.dataset.decorActCustom + "Act"] = da.value;
        const prev0 = $("#decorPreview");
        if (prev0) prev0.innerHTML = decorPreviewHTML();
        return;
      }
      const dc = ev.target.closest("[data-decor-custom]");
      if (dc) {
        decorDraft[dc.dataset.decorCustom] = dc.value;
        const prev = $("#decorPreview");
        if (prev) prev.innerHTML = decorPreviewHTML();
        return;
      }
      if (ev.target.id === "emojiMgrSearch") {
        renderEmojiMgr();
        return;
      }
      if (ev.target.id === "cardSearch") {
        cardSearch = ev.target.value;
        renderCardList();
        return;
      }
      const s = ev.target.closest("[data-set]");
      if (s) {
        onSettingInput(s);
        return;
      }
      const p = ev.target.closest("[data-profile]");
      if (p) {
        const parts = p.dataset.profile.split(".");
        state[parts[0]][parts[1]] = p.value;
        persist();
        renderTop();
      }
    });
    el.modalBody.addEventListener("change", ev => {
      const da = ev.target.closest("[data-decor-act]");
      if (da) {
        const key = da.dataset.decorAct;
        decorDraft[key + "Act"] = da.value;
        const inpA = $('#modalBody [data-decor-act-custom="' + key + '"]');
        if (inpA) inpA.value = da.value;
        const prevA = $("#decorPreview");
        if (prevA) prevA.innerHTML = decorPreviewHTML();
        return;
      }
      const ds = ev.target.closest("[data-decor]");
      if (ds) {
        decorDraft[ds.dataset.decor] = ds.value;
        const inp = $('#modalBody [data-decor-custom="' + ds.dataset.decor + '"]');
        if (inp) inp.value = ds.value;
        const prev = $("#decorPreview");
        if (prev) prev.innerHTML = decorPreviewHTML();
        return;
      }
      const s = ev.target.closest("[data-set]");
      if (s) onSettingInput(s);
    });

    $("#btnAnswer").addEventListener("click", () => {
      if (!call) return;
      connectCall();
    });
    $("#btnHangup").addEventListener("click", () => endCall());
    $("#btnMute").addEventListener("click", () => {
      if (!call) return;
      call.muted = !call.muted;
      renderCall();
    });
    $("#btnSpeaker").addEventListener("click", () => {
      if (!call) return;
      call.speaker = !call.speaker;
      renderCall();
    });
    $("#btnVideo").addEventListener("click", () => {
      if (!call) return;
      call.video = !call.video;
      if (call.video) call.type = "video";
      el.callSub.textContent = call.state === "connected" ? callTypeName(call.type) : el.callSub.textContent;
      renderCall();
    });
    el.callZoom.addEventListener("input", () => {
      if (!call) return;
      call.zoom = Number(el.callZoom.value);
      el.callAvaWrap.style.transform = "scale(" + call.zoom / 100 + ")";
    });
    el.callOverlay.addEventListener(
      "wheel",
      ev => {
        if (!call) return;
        ev.preventDefault();
        call.zoom = clamp(call.zoom - Math.sign(ev.deltaY) * 8, 50, 160);
        el.callZoom.value = call.zoom;
        el.callAvaWrap.style.transform = "scale(" + call.zoom / 100 + ")";
      },
      { passive: false }
    );

    document.addEventListener("keydown", ev => {
      if (ev.key === "Escape") {
        closeMenu();
        closeModal();
        el.stickerPanel.hidden = true;
        el.todayPopup.hidden = true;
      }
    });
    document.addEventListener("click", ev => {
      if (menuEl && !menuEl.contains(ev.target) && Date.now() - menuOpenedAt > 300) closeMenu();
    });
    window.addEventListener("beforeunload", () => Store.save());
    document.addEventListener("visibilitychange", () => {
      if (call && call.state === "connected") {
        const t = fmtDur(Date.now() - call.startTs);
        if (call.minimized) el.bubbleTimer.textContent = t;
        else el.callTimer.textContent = t;
      }
    });
  }

  async function addEmojiFlow() {
    const groups = Object.keys(state.emojis);
    if (emojiAddGroup && groups.indexOf(emojiAddGroup) < 0) emojiAddGroup = groups[0];
    if (!emojiAddGroup) emojiAddGroup = groups[0];
    const html =
      '<div class="card-box">' +
      '<div class="field"><label>选择分组</label><div class="grp-pick" id="emojiAddGroups">' +
      groups.map(g => '<button class="' + (g === emojiAddGroup ? "on" : "") + '" data-addemo-grp="' + esc(g) + '">' + esc(g) + "</button>").join("") +
      '<button data-act="emojiGroupNew">+ 新建分组</button></div></div>' +
      '<div class="field"><label>Emoji（可直接粘贴，也可用系统键盘输入）</label>' +
      '<input type="text" id="emojiAddInput" maxlength="8" placeholder="例如 🥰 或 ( ˘ω˘ )"></div>' +
      '<button class="btn block" data-act="emojiAddOk">添加到「<span id="emojiAddGrpName">' + esc(emojiAddGroup) + "</span>」</button>" +
      "</div>";
    openModal("添加表情", html);
    setTimeout(() => {
      const inp = $("#emojiAddInput");
      if (inp) inp.focus();
    }, 80);
  }

  function addEmoji(v, group) {
    if (!v) return;
    const g = group && state.emojis[group] ? group : state.emojis["常用"] ? "常用" : Object.keys(state.emojis)[0];
    if (!state.emojis[g]) state.emojis[g] = [];
    if (state.emojis[g].indexOf(v) < 0) state.emojis[g].unshift(v);
    persist();
  }

  function emojiGroupRowHTML() {
    const groups = Object.keys(state.emojis);
    return (
      '<div class="grp-bar" style="padding-bottom:2px">' +
      groups
        .map(
          g =>
            '<span class="grp-chip grp-manage">' + esc(g) + '<span class="n">' + state.emojis[g].length + "</span>" +
            '<button data-emo-rename="' + esc(g) + '" title="重命名">✎</button>' +
            (groups.length > 1 ? '<button data-emo-del="' + esc(g) + '" title="删除分组">✕</button>' : "") +
            "</span>"
        )
        .join("") +
      "</div>"
    );
  }

  async function uploadSticker() {
    const files = await pickFiles("image/*");
    if (!files || !files.length) return;
    const status = $("#stickerStatus");
    if (status) {
      status.classList.remove("done");
      status.textContent = "添加中…";
    }
    toast("添加中…");
    let done = 0;
    for (let i = 0; i < files.length; i++) {
      try {
        const dataUrl = await cropImage(files[i], 240, 0.85);
        if (!dataUrl) continue;
        state.customStickers.push({ src: dataUrl, ts: Date.now() });
        done++;
      } catch (e) {}
    }
    persist();
    renderStickerPanel();
    renderStickerMgr();
    if (status) {
      status.classList.add("done");
      status.textContent = "添加完成（" + done + " 张）";
    }
    toast("添加完成，共 " + done + " 张");
  }

  const DECOR_OPTIONS = [
      ["四角星", "◆"],
      ["实心星星", "★"],
      ["空心星星", "☆"],
      ["实心圆", "●"],
      ["空心圆", "○"],
      ["爱心", "❤"],
      ["空心爱心", "♡"],
      ["月亮", "☾"],
      ["太阳", "☀"],
      ["花朵", "✿"],
      ["闪光", "✧"],
      ["菱形", "◇"],
      ["方块", "■"],
      ["三角", "▲"],
      ["水滴", "💧"],
      ["不要装饰", ""]
    ];

  const PAT_ACTIONS = [
      ["拍了拍", "拍了拍"],
      ["戳了戳", "戳了戳"],
      ["摸了摸头", "摸了摸头"],
      ["抱了抱", "抱了抱"],
      ["蹭了蹭", "蹭了蹭"],
      ["亲了一下", "亲了一下"],
      ["勾了勾手指", "勾了勾手指"],
      ["弹了一下脑门", "弹了一下脑门"],
      ["捏了捏脸", "捏了捏脸"],
      ["拽了拽衣角", "拽了拽衣角"],
      ["拍了拍肩膀", "拍了拍肩膀"]
    ];

  function openDecorEditor() {
    if (!decorDraft) decorDraft = { mine: state.patDecor.mine, peer: state.patDecor.peer, mineAct: state.patDecor.mineAct || "拍了拍", peerAct: state.patDecor.peerAct || "拍了拍" };
    const opts = (list, cur, attr, key) =>
      list.map(o => '<option value="' + esc(o[1]) + '"' + (o[1] === cur ? " selected" : "") + ">" + o[0] + "</option>").join("");
    const block = (key, label, sym, act) =>
      '<div class="field"><label>' + label + "</label>" +
      '<div class="pair"><select data-decor="' + key + '">' + opts(DECOR_OPTIONS, sym, null) + "</select>" +
      '<select data-decor-act="' + key + '">' + opts(PAT_ACTIONS, act, null) + "</select></div>" +
      '<div class="pair" style="margin-top:8px"><input type="text" data-decor-custom="' + key + '" maxlength="2" value="' + esc(sym) + '" placeholder="自定义装饰符号">' +
      '<input type="text" data-decor-act-custom="' + key + '" maxlength="8" value="' + esc(act) + '" placeholder="自定义动作，如 揪了揪"></div>' +
      "</div>";
    openModal(
      "拍一拍样式",
      '<div class="card-box">' +
        block("mine", "我发出的（拍梦角）", decorDraft.mine, decorDraft.mineAct) +
        block("peer", "对方发出的（拍你）", decorDraft.peer, decorDraft.peerAct) +
        '<div class="decor-preview" id="decorPreview">' + decorPreviewHTML() + "</div>" +
        '<div class="row"><label>我拍一拍显示词条</label><span class="switch"><input type="checkbox" data-set="patMinePhrase"' + (S().patMinePhrase === true ? " checked" : "") + "><i></i></span></div>" +
        '<div class="note">默认关闭：你拍梦角只显示「我 动作 梦角」；梦角拍你才带【词条】。装饰符号与动作都可下拉选择，也可自己输入。</div></div>' +
        '<div class="list-tools" style="margin-top:14px"><button class="btn ghost" data-act="decorCancel">取消</button>' +
        '<button class="btn" data-act="decorSave" style="flex:1">保存</button></div>'
    );
  }

  function decorPreviewHTML() {
    const d = decorDraft;
    const sym = s => (s ? '<span class="pd">' + esc(s) + "</span> " : "");
    const symEnd = s => (s ? ' <span class="pd">' + esc(s) + "</span>" : "");
    const showMine = S().patMinePhrase === true;
    return (
      "<div>我：" + sym(d.mine) + esc(state.user.name) + " " + esc(d.mineAct || "拍了拍") + " " + esc(state.peer.name) +
      (showMine ? "【…】" : "") + symEnd(d.mine) + "</div>" +
      "<div>对方：" + sym(d.peer) + esc(state.peer.name) + " " + esc(d.peerAct || "拍了拍") + " " + esc(state.user.name) + "【…】" + symEnd(d.peer) + "</div>"
    );
  }

  async function onModalClick(ev) {
    if (ev.target.closest("[data-stepkey]")) return;
    const eg = ev.target.closest("[data-addemo-grp]");
    if (eg) {
      emojiAddGroup = eg.dataset.addemoGrp;
      $$("#emojiAddGroups button").forEach(b => b.classList.toggle("on", b.dataset.addemoGrp === emojiAddGroup));
      const nm = $("#emojiAddGrpName");
      if (nm) nm.textContent = emojiAddGroup;
      return;
    }
    const ern = ev.target.closest("[data-emo-rename]");
    if (ern) {
      const old = ern.dataset.emoRename;
      const name = (prompt("重命名分组", old) || "").trim();
      if (!name || name === old) return;
      if (state.emojis[name]) {
        toast("该分组已存在");
        return;
      }
      const list = state.emojis[name] ? state.emojis[name].concat(state.emojis[old]) : state.emojis[old];
      delete state.emojis[old];
      const next = {};
      Object.keys(state.emojis).forEach(k => (next[k] = state.emojis[k]));
      next[name] = list;
      state.emojis = next;
      persist();
      openSettings(setTab);
      toast("已重命名为「" + name + "」");
      return;
    }
    const ede = ev.target.closest("[data-emo-del]");
    if (ede) {
      const g = ede.dataset.emoDel;
      if (!confirm("删除分组「" + g + "」？组内 " + state.emojis[g].length + " 个表情也会一起删除")) return;
      delete state.emojis[g];
      persist();
      openSettings(setTab);
      renderStickerPanel();
      toast("已删除分组");
      return;
    }
    const tab = ev.target.closest("[data-tab]");
    if (tab) {
      setTab = tab.dataset.tab;
      openSettings(setTab);
      return;
    }
    const grp = ev.target.closest("[data-grp]");
    if (grp) {
      cardGroup = grp.dataset.grp;
      openSettings(setTab);
      return;
    }
    const ag = ev.target.closest("[data-addgrp]");
    if (ag) {
      addGroup = ag.dataset.addgrp;
      openSettings(setTab);
      return;
    }
    const cp = ev.target.closest("[data-card-pick]");
    if (cp) {
      const i = Number(cp.dataset.cardPick);
      cardPick[i] = !cardPick[i];
      renderCardList();
      return;
    }
    const sp = ev.target.closest("[data-sticker-pick]");
    if (sp) {
      const i = Number(sp.dataset.stickerPick);
      stickerPick[i] = !stickerPick[i];
      renderStickerMgr();
      return;
    }
    const icon = ev.target.closest("[data-icon]");
    if (icon) {
      S().favicon = icon.dataset.icon;
      persist();
      applyFavicon();
      openSettings(setTab);
      return;
    }
    const jump = ev.target.closest("[data-jump]");
    if (jump && !ev.target.closest("[data-unfav]")) {
      jumpTo(jump.dataset.jump);
      return;
    }
    const unfav = ev.target.closest("[data-unfav]");
    if (unfav) {
      ev.stopPropagation();
      const m = findMsg(unfav.dataset.unfav);
      if (m) {
        m.fav = false;
        persist();
        renderBadges();
        openFav();
        renderChat();
      }
      return;
    }
    const delEmoji = ev.target.closest("#emojiMgrGrid [data-emo]");
    if (delEmoji) {
      const v = delEmoji.dataset.emo;
      if (emojiBatch) {
        emojiPick[v] = !emojiPick[v];
        renderEmojiMgr();
        return;
      }
      Object.keys(state.emojis).forEach(g => {
        const i = state.emojis[g].indexOf(v);
        if (i >= 0) state.emojis[g].splice(i, 1);
      });
      persist();
      renderEmojiMgr();
      renderStickerPanel();
      return;
    }
    const stkDel = ev.target.closest("[data-stk-del]");
    if (stkDel) {
      state.customStickers.splice(Number(stkDel.dataset.stkDel), 1);
      persist();
      renderStickerMgr();
      renderStickerPanel();
      return;
    }
    const stkAtt = ev.target.closest("[data-stk-attach]");
    if (stkAtt) {
      attachSticker(state.customStickers[Number(stkAtt.dataset.stkAttach)].src);
      return;
    }
    const cardDel = ev.target.closest("[data-card-del]");
    if (cardDel) {
      state.cards.splice(Number(cardDel.dataset.cardDel), 1);
      editingCard = null;
      persist();
      renderCardList();
      return;
    }
    const cardEdit = ev.target.closest("[data-card-edit]");
    if (cardEdit) {
      startCardEdit(Number(cardEdit.dataset.cardEdit));
      return;
    }
    const cardSave = ev.target.closest("[data-card-save]");
    if (cardSave) {
      saveCardEdit(Number(cardSave.dataset.cardSave));
      return;
    }
    if (ev.target.closest("[data-card-cancel]")) {
      editingCard = null;
      renderCardList();
      return;
    }
    const letterOpen = ev.target.closest("[data-letter-open]");
    if (letterOpen) {
      letterView = state.letters.filter(l => l.id === letterOpen.dataset.letterOpen)[0] || null;
      renderLetterPanel();
      return;
    }
    const act = ev.target.closest("[data-act]");
    if (!act) return;
    const a = act.dataset.act;

    if (a === "previewOpening") {
      el.openingText.textContent = openingLine();
      el.openingSub.textContent = "给 " + state.peer.name + " 的字卡传讯 · " + fmtDate(Date.now());
      el.opening.classList.remove("fade");
      el.opening.hidden = false;
      closeModal();
      el.openingEnter.onclick = ev => {
        ev.stopPropagation();
        el.opening.classList.add("fade");
        setTimeout(() => {
          el.opening.hidden = true;
          el.opening.classList.remove("fade");
          openSettings(setTab);
        }, 520);
      };
      el.opening.onclick = () => {
        el.opening.classList.add("fade");
        setTimeout(() => {
          el.opening.hidden = true;
          el.opening.classList.remove("fade");
          openSettings(setTab);
        }, 520);
      };
      return;
    }
    if (a === "cardBatch") {
      cardBatch = !cardBatch;
      cardPick = {};
      renderCardList();
    } else if (a === "cardPickAll") {
      filteredCards().forEach(o => (cardPick[o.i] = true));
      renderCardList();
    } else if (a === "cardMoveGroup") {
      const picked = Object.keys(cardPick).filter(k => cardPick[k]).map(Number);
      if (!picked.length) {
        toast("先在批量管理里勾选字卡");
        return;
      }
      const list = state.groups.map((g, i) => i + 1 + ". " + g.name).join("\n");
      const ans = prompt("移动到哪个分组？\n" + list, "1");
      const idx = parseInt(ans, 10) - 1;
      if (!(idx >= 0 && idx < state.groups.length)) return;
      const gid = state.groups[idx].id;
      picked.forEach(i => {
        if (state.cards[i]) state.cards[i].group = gid;
      });
      cardPick = {};
      persist();
      renderCardList();
      toast("已移动 " + picked.length + " 条到「" + groupName(gid) + "」");
    } else if (a === "cardBatchDel") {
      const picked = Object.keys(cardPick).filter(k => cardPick[k]).map(Number).sort((x, y) => y - x);
      if (!picked.length) {
        toast("先在批量管理里勾选字卡");
        return;
      }
      picked.forEach(i => state.cards.splice(i, 1));
      cardPick = {};
      persist();
      renderCardList();
      toast("已删除 " + picked.length + " 条");
    } else if (a === "addGroupNew") {
      const name = (prompt("新分组名称") || "").trim();
      if (!name) return;
      const gid = "g_" + Date.now().toString(36);
      state.groups.push({ id: gid, name: name });
      addGroup = gid;
      persist();
      openSettings(setTab);
      toast("已创建分组「" + name + "」");
    } else if (a === "renameGroup") {
      const gid = ev.target.closest("[data-gid]").dataset.gid;
      const name = (prompt("修改分组名称", groupName(gid)) || "").trim();
      if (!name) return;
      state.groups.filter(g => g.id === gid)[0].name = name;
      persist();
      openSettings(setTab);
    } else if (a === "calPrev" || a === "calNext") {
      diaryDay = a === "calNext" ? diaryDay + 31 * 86400000 : diaryDay - 31 * 86400000;
      openDiary();
    } else if (a === "faviconUpload") {
      const file = await pickFile("image/*");
      if (!file) return;
      try {
        const url = await readImage(file, 128, 0.9);
        S().favicon = url;
        persist();
        applyFavicon();
        openSettings(setTab);
        toast("图标已更换");
      } catch (e) {
        toast("图片读取失败");
      }
    } else if (a === "faviconReset") {
      S().favicon = "moon";
      persist();
      applyFavicon();
      openSettings(setTab);
    } else if (a === "emojiBatch") {
      emojiBatch = !emojiBatch;
      emojiPick = {};
      renderEmojiMgr();
    } else if (a === "emojiPickAll") {
      const f = ($("#emojiMgrSearch") ? $("#emojiMgrSearch").value : "").trim();
      Object.keys(state.emojis).forEach(g => {
        (f ? state.emojis[g].filter(e => e.indexOf(f) === -1) : state.emojis[g]).forEach(e => (emojiPick[e] = true));
      });
      renderEmojiMgr();
    } else if (a === "emojiBatchDel") {
      const keys = Object.keys(emojiPick).filter(k => emojiPick[k]);
      if (!keys.length) {
        toast("先勾选要删除的表情");
        return;
      }
      keys.forEach(v => {
        Object.keys(state.emojis).forEach(g => {
          const i = state.emojis[g].indexOf(v);
          if (i >= 0) state.emojis[g].splice(i, 1);
        });
      });
      emojiPick = {};
      persist();
      renderEmojiMgr();
      renderStickerPanel();
      toast("已删除 " + keys.length + " 个表情");
    } else if (a === "stickerBatch") {
      stickerBatch = !stickerBatch;
      stickerPick = {};
      renderStickerMgr();
    } else if (a === "stickerPickAll") {
      state.customStickers.forEach((s, i) => (stickerPick[i] = true));
      renderStickerMgr();
    } else if (a === "stickerBatchDel") {
      const keys = Object.keys(stickerPick).filter(k => stickerPick[k]).map(Number).sort((a2, b2) => b2 - a2);
      if (!keys.length) {
        toast("先勾选要删除的表情");
        return;
      }
      keys.forEach(i => state.customStickers.splice(i, 1));
      stickerPick = {};
      persist();
      renderStickerMgr();
      renderStickerPanel();
      toast("已删除 " + keys.length + " 张");
    } else if (a === "resetSettings") {
      if (!confirm("恢复默认回复设置？")) return;
      state.settings = Store.resetSettingDefaults({
        theme: S().theme,
        primary: S().primary,
        myBubble: S().myBubble,
        aiBubble: S().aiBubble,
        bubbleStyle: S().bubbleStyle,
        chatColor: S().chatColor,
        chatImage: S().chatImage,
        fontSize: S().fontSize,
        font: S().font,
        timeStyle: S().timeStyle,
        favicon: S().favicon,
        showUserAvatar: S().showUserAvatar
      });
      persist();
      applyAppearance();
      openSettings(setTab);
      rescheduleAll();
      toast("已恢复默认");
    } else if (a === "importFile") {
      importCardFile();
    } else if (a === "importAdd" || a === "importReplace") {
      const ta = $("#cardInput");
      if (!ta.value.trim()) {
        toast("先粘贴一些字卡");
        return;
      }
      const res = importCards(ta.value, a === "importReplace" ? "replace" : "add", addGroup);
      const st = $("#addStatus");
      if (st) {
        st.classList.remove("done");
        st.textContent = "添加中…";
      }
      ta.value = "";
      renderCardList();
      setTimeout(() => {
        if (st) {
          st.classList.add("done");
          st.textContent = "添加完成：新增 " + res.added + " 条" + (res.dup ? "，跳过重复 " + res.dup + " 条" : "");
        }
        toast("添加完成，新增 " + res.added + " 条");
      }, 260);
      syncSettingUI();
    } else if (a === "exportCards") {
      exportCards();
    } else if (a === "clearCards") {
      if (!confirm("清空字卡库？（会保留至少一条，否则使用默认库）")) return;
      state.cards = [];
      persist();
      renderCardList();
    } else if (a === "resetCards") {
      state.cards = Store.defaultCards();
      persist();
      renderCardList();
      syncSettingUI();
      toast("已恢复默认字卡");
    } else if (a === "saveAtmoOpening") {
      const lines = ($("#atmOpening").value || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (!lines.length) {
        toast("至少留一条开场文案");
        return;
      }
      state.atmo.opening = lines;
      persist();
      toast("开场文案已保存 " + lines.length + " 条");
    } else if (a === "resetAtmoOpening") {
      state.atmo.opening = Store.defaultAtmosphere();
      persist();
      openSettings(setTab);
      toast("已恢复默认开场文案");
    } else if (a === "saveAtmoPat") {
      const lines = ($("#atmPat").value || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (!lines.length) {
        toast("至少留一条拍一拍文案");
        return;
      }
      state.atmo.pat = lines;
      persist();
      toast("拍一拍文案已保存 " + lines.length + " 条");
    } else if (a === "resetAtmoPat") {
      state.atmo.pat = DATA.DEFAULT_PAT.slice();
      persist();
      openSettings(setTab);
      toast("已恢复默认拍一拍文案");
    } else if (a === "previewPat") {
      doUserPat();
      closeModal();
      return;
    } else if (a === "openDecor") {
      decorDraft = {
        mine: state.patDecor.mine,
        peer: state.patDecor.peer,
        mineAct: state.patDecor.mineAct || "拍了拍",
        peerAct: state.patDecor.peerAct || "拍了拍"
      };
      openDecorEditor();
      return;
    } else if (a === "decorSave") {
      state.patDecor = {
        mine: decorDraft.mine || "",
        peer: decorDraft.peer || "",
        mineAct: (decorDraft.mineAct || "拍了拍").trim() || "拍了拍",
        peerAct: (decorDraft.peerAct || "拍了拍").trim() || "拍了拍"
      };
      persist();
      openSettings(setTab);
      toast("拍一拍样式已保存");
      return;
    } else if (a === "decorCancel") {
      decorDraft = null;
      openSettings(setTab);
      return;
    } else if (a === "addEmoji") {
      addEmojiFlow();
    } else if (a === "emojiGroupNew") {
      const name = (prompt("新建表情分组名称") || "").trim();
      if (!name) return;
      if (state.emojis[name]) {
        toast("该分组已存在");
        return;
      }
      state.emojis[name] = [];
      persist();
      openSettings(setTab);
      toast("已创建分组「" + name + "」");
      return;
    } else if (a === "emojiAddOk") {
      const inp = $("#emojiAddInput");
      const v = inp ? inp.value.trim() : "";
      if (!v) {
        toast("请输入 Emoji");
        return;
      }
      addEmoji(v, emojiAddGroup);
      openSettings(setTab);
      toast("已添加到「" + emojiAddGroup + "」");
      return;
    } else if (a === "resetEmoji") {
      if (!confirm("恢复默认 Emoji 库？自定义添加的会被覆盖")) return;
      state.emojis = Store.defaultEmojis();
      persist();
      renderEmojiMgr();
      renderStickerPanel();
    } else if (a === "emojiSearchToggle") {
      const box = $("#emojiMgrSearch");
      if (box) box.focus();
    } else if (a === "addSticker") {
      uploadSticker();
    } else if (a === "clearStickers") {
      if (!confirm("清空自定义表情？")) return;
      state.customStickers = [];
      persist();
      renderStickerMgr();
      renderStickerPanel();
    } else if (a === "bgUpload") {
      const file = await pickFile("image/*");
      if (!file) return;
      try {
        const url = await readImage(file, 1280, 0.72);
        S().chatImage = url;
        persist();
        applyAppearance();
        openSettings(setTab);
        toast("背景已更换");
      } catch (e) {
        toast("图片读取失败");
      }
    } else if (a === "bgClear") {
      S().chatImage = "";
      persist();
      applyAppearance();
      openSettings(setTab);
    } else if (a === "peerAvatarUpload") {
      const file = await pickFile("image/*");
      if (!file) return;
      try {
        const url = await cropImage(file, 260, 0.88);
        if (!url) return;
        state.peer.avatar = url;
        persist();
        renderTop();
        openSettings(setTab);
        toast("头像已更换");
      } catch (e) {
        toast("图片读取失败");
      }
    } else if (a === "peerAvatarReset") {
      state.peer.avatar = "";
      persist();
      renderTop();
      openSettings(setTab);
    } else if (a === "userAvatarUpload") {
      const file = await pickFile("image/*");
      if (!file) return;
      try {
        const url = await cropImage(file, 260, 0.88);
        if (!url) return;
        state.user.avatar = url;
        persist();
        openSettings(setTab);
        toast("头像已更换");
      } catch (e) {
        toast("图片读取失败");
      }
    } else if (a === "userAvatarReset") {
      state.user.avatar = "";
      persist();
      openSettings(setTab);
    } else if (a === "exportAll") {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "字卡传讯备份.json";
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 3000);
    } else if (a === "importAll") {
      const file = await pickFile("application/json,.json");
      if (!file) return;
      const fr = new FileReader();
      fr.onload = () => {
        try {
          const data = JSON.parse(fr.result);
          if (!data || typeof data !== "object") throw new Error("bad");
          Object.assign(state, data);
          persist();
          applyAppearance();
          renderAll(true);
          openSettings(setTab);
          toast("导入成功");
        } catch (e) {
          toast("文件格式不对");
        }
      };
      fr.readAsText(file);
    } else if (a === "wipe") {
      if (!confirm("清空全部数据（含消息、信件、字卡）？此操作不可恢复")) return;
      Store.resetAll();
      location.reload();
    } else if (a === "sendLetter") {
      const t = $("#letterTitle").value.trim();
      const c = $("#letterContent").value.trim();
      if (!c) {
        toast("信的内容不能为空");
        return;
      }
      sendLetter(t || pickOne(DATA.LETTER_TITLES), c);
      renderLetterPanel();
    } else if (a === "sendLetterReply") {
      if (letterView) sendLetterReply(letterView.id);
      return;
    } else if (a === "letterBack") {
      letterView = null;
      renderLetterPanel();
    } else if (a === "datesClose") {
      closeModal();
    } else if (a === "dateAdd") {
      dateForm = { id: null, title: "", date: "" };
      dateType = "anniv";
      renderDates();
    } else if (a === "dateBack") {
      dateForm = null;
      renderDates();
    } else if (a === "dateType") {
      dateType = act.dataset.dateType === "countdown" ? "countdown" : "anniv";
      renderDates();
    } else if (a === "dateSave") {
      saveDate();
    } else if (a === "dateDel") {
      const id = act.dataset.dateDel;
      const d = (state.dates || []).filter(x => x.id === id)[0];
      if (!d) return;
      if (!confirm("删除「" + d.title + "」？")) return;
      state.dates = state.dates.filter(x => x.id !== id);
      persist();
      renderDates();
      toast("已删除");
    } else if (a === "quizClose") {
      closeModal();
    } else if (a === "quizAdd") {
      quizForm = true;
      quizDraft = { question: "", options: ["", ""] };
      renderQuiz();
    } else if (a === "quizBack") {
      quizForm = null;
      quizDraft = null;
      renderQuiz();
    } else if (a === "quizOptAdd") {
      const inputs = $$("#modalBody [data-qopt]");
      const vals = inputs.map(i => i.value);
      if (vals.length >= 8) {
        toast("最多 8 个选项");
        return;
      }
      vals.push("");
      quizDraft = { question: ($("#quizQ") ? $("#quizQ").value : "").trim(), options: vals };
      renderQuiz();
    } else if (a === "quizOptDel") {
      const idx = Number(act.dataset.opt);
      const inputs = $$("#modalBody [data-qopt]");
      const vals = inputs.map(i => i.value);
      const q = ($("#quizQ") ? $("#quizQ").value : "").trim();
      if (vals.length <= 2) {
        toast("至少保留 2 个选项");
        return;
      }
      vals.splice(idx, 1);
      quizDraft = { question: q, options: vals };
      renderQuiz();
    } else if (a === "quizSave") {
      saveQuiz();
    } else if (a === "quizDel") {
      const id = act.dataset.quizDel;
      const q = (state.quizzes || []).filter(x => x.id === id)[0];
      if (!q) return;
      if (!confirm("删除这份问卷？")) return;
      state.quizzes = state.quizzes.filter(x => x.id !== id);
      if (state.timers.quizReplies) delete state.timers.quizReplies[id];
      persist();
      renderQuiz();
      toast("已删除");
    }
  }

  /* ===================== 开场 ===================== */

  function showOpening() {
    applyOpening();
    buildStarfield();
    if (!S().opening) {
      el.opening.hidden = true;
      return;
    }
    el.openingText.textContent = openingLine();
    el.openingSub.textContent = "给 " + state.peer.name + " 的字卡传讯 · " + fmtDate(Date.now());
    el.opening.hidden = false;
    el.openingEnter.onclick = ev => {
      ev.stopPropagation();
      enterOpening();
    };
    el.opening.onclick = () => enterOpening();
  }

  function enterOpening() {
    el.opening.classList.add("fade");
    setTimeout(() => {
      el.opening.hidden = true;
      el.opening.classList.remove("fade");
    }, 520);
    el.input.focus();
    checkImportantToday(false);
  }

  function buildStarfield() {
    const sky = el.sky;
    if (!sky) return;
    let html = '<div class="neb n1"></div><div class="neb n2"></div><div class="shoot"></div>';
    const s = S();
    const density = clamp(Number(s.openingStars != null ? s.openingStars : 44), 0, 120);
    for (let i = 0; i < density; i++) {
      const size = (Math.random() * 20 + 5).toFixed(1);
      const left = (Math.random() * 100).toFixed(2);
      const top = (Math.random() * 100).toFixed(2);
      const dur = (Math.random() * 3.4 + 1.8).toFixed(2);
      const delay = (-Math.random() * 5).toFixed(2);
      const round = Math.random() < 0.22 ? " round" : "";
      html += '<i class="st' + round + '" style="--w:' + size + "px;left:" + left + "%;top:" + top + "%;--d:" + dur + "s;--t:" + delay + 's"></i>';
    }
    const dots = clamp(Math.round(density * 0.3), 0, 40);
    for (let i = 0; i < dots; i++) {
      const size = (Math.random() * 5 + 3).toFixed(1);
      html +=
        '<i class="dot" style="--w:' + size + 'px;left:' + (Math.random() * 100).toFixed(2) + "%;top:" + (Math.random() * 100).toFixed(2) +
        "%;--d:" + (Math.random() * 3.6 + 2.4).toFixed(2) + "s;--t:" + (-Math.random() * 5).toFixed(2) + 's"></i>';
    }
    const dust = clamp(Math.round(density * 0.18), 0, 24);
    for (let i = 0; i < dust; i++) {
      const size = (Math.random() * 3 + 1.5).toFixed(1);
      html +=
        '<i class="dust" style="--w:' + size + 'px;left:' + (Math.random() * 100).toFixed(2) + "%;top:" + (Math.random() * 100).toFixed(2) +
        "%;--d:" + (Math.random() * 14 + 14).toFixed(2) + "s;--t:" + (-Math.random() * 18).toFixed(2) + 's"></i>';
    }
    sky.innerHTML = html;
  }

  function applyOpening() {
    const s = S();
    const glow = s.openingGlow || "#e79bb4";
    const bg = s.openingBg || "#241a26";
    const star = s.openingStar || "#ffffff";
    const dot = s.openingDot || "#f0a6c0";
    el.opening.setAttribute("data-style", s.openingStyle || "orb");
    el.opening.setAttribute("data-sky", s.openingSky === false ? "off" : "on");
    const root = el.opening.style;
    root.setProperty("--op-glow", glow);
    root.setProperty("--op-glow-soft", hexA(glow, 0.55));
    root.setProperty("--op-glow-faint", hexA(glow, 0.18));
    root.setProperty("--op-bg", bg);
    root.setProperty("--op-bg-soft", hexA(bg, 0.92));
    root.setProperty("--op-text", s.openingText || "#f6e9ee");
    root.setProperty("--op-sub", hexA(s.openingText || "#f6e9ee", 0.62));
    root.setProperty("--op-star", star);
    root.setProperty("--op-dot", dot);
    root.setProperty("--op-dot-soft", hexA(dot, 0.5));
  }

  function init() {
    applyAppearance();
    bindEvents();
    bindAndroid();
    ensureSeedTimers();
    armAll();
    renderAll(true);
    showOpening();
    if (!S().opening) setTimeout(() => checkImportantToday(false), 900);
    setInterval(checkDayRollover, 30000);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) checkDayRollover();
    });
    if (!state.messages.length) {
      pushMsg({
        role: "ai",
        kind: "text",
        text: pickCards(randInt(1, 2)).join("")
      });
      renderAll(true);
    }
    setTimeout(checkDayRollover, 1200);
  }

  function bindAndroid() {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const off = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty("--kb", Math.min(off, Math.round(window.innerHeight * 0.5)) + "px");
      autoGrow();
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();
  }

  init();
})();
