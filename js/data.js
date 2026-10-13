const DATA = (function () {
  const DEFAULT_CARDS = [
    "今天有没有想我",
    "刚刚发了会儿呆，因为想到你",
    "你猜我现在在做什么",
    "窗外在下雨，你在做什么",
    "我今天有点困，但看到你就醒了",
    "想把今天所有的琐碎都讲给你听",
    "你那边现在是什么天气",
    "我刚刚偷偷点开了你的头像",
    "晚安，做个好梦",
    "早安，今天也要开心",
    "我有点想你了",
    "你现在方便说话吗",
    "刚才走神了，因为想起你",
    "今天的月亮很好看，和你一样",
    "我不太会说好听的话，但我都记着",
    "你吃饭了吗",
    "我把今天的风都留给你了",
    "别熬太晚",
    "你要是累了就靠一会儿",
    "我在呢",
    "你不用急着回复我",
    "我刚刚在听一首很安静的歌",
    "想和你一起发呆",
    "今天的风有点甜，大概因为你",
    "我把想说的话折起来放进口袋了",
    "你今天开心吗",
    "如果你今天过得很糟，那也没关系",
    "我希望我能在你身边",
    "我记得你说过的那句话",
    "有点冷了，记得加衣服",
    "我刚刚数了数，有七十三个瞬间想到你",
    "你什么时候有空",
    "我想听你说话，随便什么都行",
    "你别一个人待太久",
    "我偷偷给你留了个位置",
    "今天也喜欢你，比昨天多一点",
    "我在学着更靠近你",
    "你说句话吧，我想你了",
    "我这边一切都好，只是缺你",
    "想牵你的手过这条街",
    "你困了就睡，我不吵你",
    "我想变成你杯里的温水",
    "你要好好吃饭",
    "我刚刚把手机充好电了，这样能多陪你一会儿",
    "今天遇到的小事，都想讲给你",
    "你不用解释，我都懂",
    "我喜欢你认真的样子",
    "我在这儿，什么时候都可以找我",
    "我把今天的夕阳存起来了",
    "你怕黑吗，我可以陪你",
    "我有点想听你的声音",
    "晚安，明天也要想起我",
    "你今天辛苦了",
    "我觉得你笑起来很好看",
    "我在练习想你这件事",
    "你别总是逞强",
    "我这里有糖，要不要",
    "想和你一起虚度时光",
    "我刚刚走神了，梦到你",
    "你喜欢的样子，我都记得",
    "我等你的消息，不着急",
    "今天想离你近一点",
    "你是不是也还没睡",
    "我把烦心事放在门外了，只带好心情来见你",
    "想听你讲今天发生的事",
    "你是我今天最想见到的人",
    "我记得你喜欢的那首歌",
    "你别担心，一切都会好的",
    "我在呢，一直都在",
    "想抱抱你",
    "你今天有没有好好休息",
    "我给你留了灯",
    "我想和你一起变老",
    "我刚刚偷偷许了个愿",
    "有点想你想到心口发闷",
    "你说的话我都在听",
    "今天的星星有一颗像你",
    "我偷偷把你放在心尖上",
    "你吃饭的时候要专心",
    "我想看你笑",
    "我知道你已经很努力了",
    "我把想给你说的话都攒着",
    "你冷的话，把手揣好",
    "我这边有点热闹，但还是想你",
    "晚安，我替你关灯",
    "你要是累了，就靠着我",
    "我今天学会了一道新菜，下次做给你",
    "你快回我一下嘛",
    "我把你排在今天最想见的人第一位",
    "别错过今天的晚霞",
    "我有点紧张，因为要跟你说话",
    "我喜欢你说话的声音",
    "你不用回复得很及时",
    "我刚刚在想，如果你在就好了",
    "你今天要开心，不开心就来找我",
    "我偷偷存了一点勇气想告诉你",
    "我喜欢你叫我的名字",
    "我会一直在的，别怕",
    "我把明天也留了一点给你",
    "你早点休息，我舍不得你熬夜",
    "你想说话的时候，我在听",
    "我把喜欢折成纸鹤，放在窗台上",
    "你路过花店的时候，替我看一眼",
    "我很想你，比昨天更想一点",
    "我在这里，一直在这里",
    "你是我今天的小小运气"
  ];

  const DEFAULT_ATMOSPHERE = [
    "风把云推到了你那边",
    "今天的风比昨天软一点",
    "你经过的地方，光都亮了一下",
    "我把晚霞分了一半给你",
    "灯亮着，就不算太晚",
    "你落地的时候，记得看看星星",
    "我在云层里给你留了位置",
    "这一秒，时间走得慢一点",
    "愿你今晚好梦，梦里也有我",
    "你像夏天的风，吹得我心里发烫",
    "窗外有月亮，桌上有热茶，你还在",
    "慢一点，别急着把今天过完",
    "你来的时候，我正在想你",
    "有你的日子，连风都写诗",
    "你不用急着长大，也不用急着懂",
    "这条路我一直走在你旁边",
    "你被温柔对待过，所以你也值得",
    "你今天已经很好了，剩下的交给明天",
    "你不是一个人，这里有一盏灯",
    "收好这份安静，它会陪你很久",
    "月亮替你先说晚安",
    "把今天的疲惫放在门口吧",
    "我很安静，因为想听你的呼吸",
    "星星稀了一点，但想你的密度没变",
    "愿你今晚梦里都是甜的"
  ];

  const EMOJI_GROUPS = {
    "常用": "😀 😃 😄 😁 😅 🤣 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😗 😚 😋 😛 😜 🤪 🤗 🤭 🤔 😐 😴 🤤 😎 🥳 😢 😭 😱 🥺 😤 😡 💀 💩 🤡 👻 👽 🤖 ✨ 🎉 🎊 💕 💖 💗 💞 💓 ❤️ 🧡 💛 💚 💙 💜 🖤 🤍 💔 ✨ ⭐ 🌙 ☀️ 🌈 🌸 🌺 🍀 🌿".split(" "),
    "笑脸": "😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😗 😚 😙 🥲 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🤫 🤔 🤐 🤨 😐 😑 😶 😏 😒 🙄 😬 🤥 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🤧 🥵 🥶 🥴 😵 🤯 🤠 🥳 🥸 😎 🤓 🧐 😕 😟 🙁 ☹️ 😮 😯 😲 😳 🥺 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 💩 🤡".split(" "),
    "爱心": "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 💖 💗 ❤️‍🔥 🤍 🩷 🫶 🫀 💘".split(" "),
    "手势": "👋 🤚 🖐 ✋ 🖖 👌 🤌 🤏 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👍 👎 ✊ 👊 🤛 🤜 👏 🙌 👐 🤲 🤝 🙏 💅 🤳 💪 🦾 🦵 🦶 👂 👃 🧠 🫁 🦷 👀 👁 👅 👄 💋 🫶 👐 🖐".split(" "),
    "肤色": "👍🏻 👍🏼 👍🏽 👍🏾 👍🏿 👎🏻 👎🏼 👎🏽 👎🏾 👎🏿 👌🏻 👌🏼 👌🏽 👌🏾 👌🏿 ✌🏻 ✌🏼 ✌🏽 ✌🏾 ✌🏿 👏🏻 👏🏼 👏🏽 👏🏾 👏🏿 🙏🏻 🙏🏼 🙏🏽 🙏🏾 🙏🏿 🤝🏻 🤝🏼 🤝🏽 🤝🏾 🤝🏿 ❤️ 💙 💚 💜 🧡 💛 🤎 🖤".split(" "),
    "动物": "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🪱 🐛 🦋 🐌 🐞 🐜 🪰 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦀 🐡 🐠 🐟 🐬 🐳 🦈 🐧 🦩 🕊 🐕 🐈 🦴 🦶".split(" "),
    "食物": "🍏 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🍈 🍒 🍑 🥭 🍍 🥥 🥝 🍅 🍆 🥑 🥦 🥬 🥒 🌶 🌽 🥕 🧄 🧅 🥔 🍠 🥐 🥯 🍞 🥖 🥨 🧀 🥚 🍳 🧈 🥞 🧇 🥓 🍔 🍟 🍕 🌭 🥪 🌮 🌯 🥗 🍣 🍱 🍙 🍚 🍘 🍥 🥠 🍢 🍡 🍧 🍨 🍦 🥧 🧁 🍰 🎂 🍮 🍭 🍬 🍫 🍿 🍩 🍪 🌰 🥜 🍯 🥛 🍼 ☕ 🍵 🧃 🥤 🧋 🍶 🍺 🍻 🥂 🍷 🥃 🍸 🍹 🧉 🍾 🧊".split(" "),
    "活动": "⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🥏 🎱 🏓 🏸 🏒 🏑 🥍 🏏 🥅 ⛳ 🪁 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛼 🛷 ⛸ 🥌 🎿 ⛷ 🏂 🪂 🏋️ 🤼 🤸 ⛹️ 🤺 🤾 🏌️ 🏇 🧘 🏄 🏊 🤽 🚣 🧗 🚵 🚴 🏆 🥇 🥈 🥉 🏅 🎖 🎗 🎫 🎟 🎪 🤹 🎭 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🎷 🎺 🎸 🎻 🎲 ♟ 🎯 🎳 🎮 🎰 🧩 🎵 🎶".split(" "),
    "交通": "🚗 🚕 🚙 🚌 🚎 🏎 🚓 🚑 🚒 🚐 🛻 🚚 🚛 🚜 🚲 🛵 🏍 🛺 🚨 🚔 🚍 🚘 🚖 🚡 🚠 🚟 🚃 🚋 🚞 🚝 🚄 🚅 🚈 🚂 🚆 🚇 🚊 🚉 ✈️ 🛫 🛬 🛩 💺 🛰 🚀 🛸 🚁 🛶 ⛵ 🚤 🛥 🛳 ⛴ 🚢 ⚓ ⛽ 🚧 🚦 🚥 🗺 🏰 ⛲ ⛱ 🏖 🏝 🏜 ⛺ 🏠 🏡 🏘 🏗 🏭 🏢 🏬 🏥 🏦 🏨 🏪 🏫 🏛 ⛪ 🕌 🕍".split(" "),
    "符号": "✅ ❌ ❎ ✔️ ☑️ 🔘 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤 🔺 🔻 🔸 🔹 🔶 🔷 🔳 🔲 ▪️ ▫️ ◾ ◽ ◼️ ◻️ ⬛ ⬜ 🟥 🟧 🟨 🟩 🟦 🟪 ⬆️ ↗️ ➡️ ↘️ ↙️ ⬇️ ↖️ ⬅️ ↔️ ↕️ 🔃 🔄 🔙 🔚 🔛 🔜 🔝 🔀 🔁 ▶️ ⏩ ⏭ ⏯ ⏹ ⏸ ⏺ ⏏ ⏫ ⏬ ⏮ 🎵 ✒ ✍ 📝 💭 💬 🗯 ♻ 🔔 🕐".split(" "),
    "天气": "☀️ 🌤 ⛅ 🌥 ☁️ 🌦 🌧 ⛈ 🌩 🌨 ❄️ ☃️ ⛄ 🌬 💨 🌪 🌫 🌊 💧 💦 ☔ ☂️ 🌈 🌊 🌅 🌄 🌇 🌆 🌌 🌠 🌕 🌖 🌗 🌘 🌑 🌒 🌓".split(" "),
    "物品": "⌚ 📱 💻 ⌨️ 🖥 🖨 🖱 💽 💾 💿 📀 📷 📸 📹 🎥 📽 📞 ☎️ 📟 📠 📺 📻 🎙 🎚 🎛 🧭 ⏱ ⏲ ⏰ 🕰 ⌛ ⏳ 📡 🔋 🔌 💡 🔦 🕯 🪔 🧯 💸 💵 💴 💶 💷 🪙 💰 💳 💎 ⚖️ 🧰 🔧 🔨 ⚒ 🛠 ⛏ 🔩 ⚙️ 🧱 ⛓ 🧲 💊 💉 🩸 🩹 🩺 🌡 🧹 🧺 🧻 🚿 🛁 🧼 🪥 🧽 🧴 🛎 🔑 🗝 🚪 🛋 🛏 🖼 🛍 🎁 🎈 🎏 🎀 🪄 🪅 📔 🕯 🧸 🎐 🧿 🛍 🗝 🧷 🧵 🪡 🧶".split(" "),
    "文字": "💌 💐 🌹 🌷 🌻 🌸 💍 💎 🎀 🕯 📖 📒 📝 📌 📎 🖇 🗳 🏷 💰 🧧 🎏 🎑 🇨🇳 🌏 🌎 🌍 💫 ⭐ 🌟 ✨ ⚡ 🔥 🌪 💥 ❄️ 🌈 ☄️ 💤 🕰 ⏳ 🫧 🧊 🍃 🍂 🌿 ☘ 🍀 🎍 🎋 🍃 🪴 🌱 🌲 🌳 🌴 🌵".split(" ")
  };

  const KAOMOJI = [
    "( ´ ▽ ` )", "( ･ㅂ･ )", "( ˘ω˘ )", "( ╹◡╹ )", "(・∀・)", "( ͡° ͜ʖ ͡°)", "(≧▽≦)", "(⌒▽⌒)",
    "(・_・)ゞ", "(´・ω・`)", "( ͡°▏ ͡°)", "(๑•̀ㅂ•́)و✧", "(づ｡◕‿‿◕｡)づ", "(◕‿◕✿)", "(*≧ω≦*)",
    "( ˶‾᷄ ⁻ ‾᷅˶ )", "(◍•ᴗ•◍)", "(⌒‿⌒)", "(・ω・)ノ", "(๑˃ᴗ˂)", "(•́ᴗ•̀)", "(◔ω◔)",
    "(＾▽＾)", "( ˘ ³˘)", "(っ˘̩╭╮˘̩)っ", "(ノ´▽`)ノ♪", "(≧◡≦)ノ", "( ˘•ᯠ˘ )", "(๑•́ ₃ •̀๑)",
    "(ᐢ. ̫.ᐢ)", "( ˊ˘ˋ )", "٩(◕‿◕)۶", "(◠‿◠)", "(¬‿¬)", "(◐ε◐)", "( ͡° ͜ʖ ͡°)✧",
    "(*/ω＼*)", "(＾o＾)", "(•ᴗ•)", "(◍•ᴗ•◍)❤", "(๑>◡<๑)", "(ᗒᗣᗕ)՞", "(⁎˃ᆺ˂)",
    "( ˘ω˘ )♡", "(◞‿◜)", "(･ω･)", "(๑•̀ㅂ•́)و", "( ͡° ͜ʖ ͡°)", "(・∀・)ﾉ", "(๑╹◡╹๑)"
  ];
  EMOJI_GROUPS["颜表情"] = KAOMOJI;

  const MOOD_EMOJI = "😀 😄 🥰 😍 🤩 😌 😔 😢 😭 😤 😴 🤔 😐 🙂 🥺 😳 🤒 🥳 🤯 😶 🫠 🥹 😇 🤗 😜 😝 😋 🤤 🥶 🥵 😵‍💫 🫡 😶‍🌫️ 🫧 🐟 🌙 🌟 ☁️ 🌧 ☀️ 🌸 🍀 🫧 ☕ 🍰".split(" ");

  const THEMES = [
    { id: "sky", name: "晴空", primary: "#3f8cff", primarySoft: "#dbe8ff", bg: "#f7f9fc", panel: "#ffffff", chat: "#f2f5fa", text: "#23262b", sub: "#8b93a1", border: "#e6ebf2", myBubble: "#3f8cff", aiBubble: "#ffffff" },
    { id: "sakura", name: "樱粉", primary: "#e79bb4", primarySoft: "#f7d3de", bg: "#fdf6f8", panel: "#ffffff", chat: "#f6eef1", text: "#2f2a2c", sub: "#9a8f94", border: "#efe3e7", myBubble: "#e79bb4", aiBubble: "#ffffff" },
    { id: "moon", name: "月白", primary: "#8ea6d6", primarySoft: "#d8e2f5", bg: "#f6f8fc", panel: "#ffffff", chat: "#eef2f9", text: "#2b3040", sub: "#8b93a8", border: "#e2e8f4", myBubble: "#8ea6d6", aiBubble: "#ffffff" },
    { id: "amber", name: "暖阳", primary: "#e0a06a", primarySoft: "#f7e2cc", bg: "#fdf9f4", panel: "#ffffff", chat: "#f6efe6", text: "#33302c", sub: "#9a9188", border: "#ece3d8", myBubble: "#e0a06a", aiBubble: "#ffffff" },
    { id: "matcha", name: "抹茶", primary: "#8fbf9f", primarySoft: "#dceee2", bg: "#f6faf6", panel: "#ffffff", chat: "#ecf4ee", text: "#2b342c", sub: "#8b9a8e", border: "#dfeae1", myBubble: "#8fbf9f", aiBubble: "#ffffff" },
    { id: "dusk", name: "暮色", primary: "#9b8cd8", primarySoft: "#e0daf6", bg: "#f7f5fd", panel: "#ffffff", chat: "#f0ecf9", text: "#2e2a3a", sub: "#918aa8", border: "#e6e0f4", myBubble: "#9b8cd8", aiBubble: "#ffffff" },
    { id: "ocean", name: "深海", primary: "#5fa8b8", primarySoft: "#d5eaee", bg: "#f4fafb", panel: "#ffffff", chat: "#e8f3f5", text: "#26333a", sub: "#84969c", border: "#dbeaec", myBubble: "#5fa8b8", aiBubble: "#ffffff" },
    { id: "night", name: "夜幕", primary: "#7b6b8f", primarySoft: "#ded6e6", bg: "#f5f3f7", panel: "#ffffff", chat: "#ebe8f0", text: "#2a2530", sub: "#8d8695", border: "#e2dee8", myBubble: "#6d5c85", aiBubble: "#ffffff" }
  ];
  THEMES.forEach(function (t) {
    if (!t.primarySoft) t.primarySoft = t.primary + "33";
    if (!t.bg) t.bg = "#fdf9f4";
    if (!t.panel) t.panel = "#ffffff";
    if (!t.chat) t.chat = t.bg;
    if (!t.text) t.text = "#33302c";
    if (!t.sub) t.sub = "#9a9188";
    if (!t.border) t.border = "#ece3d8";
    if (!t.myBubble) t.myBubble = t.primary;
    if (!t.aiBubble) t.aiBubble = "#ffffff";
  });

  const BUBBLE_STYLES = [
    { id: "round", name: "圆润（默认）" },
    { id: "card", name: "字卡（描边）" },
    { id: "sharp", name: "方正" },
    { id: "outline", name: "描边" }
  ];

  const FONTS = [
    { id: "system", name: "跟随系统", css: 'system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif' },
    { id: "round", name: "圆体", css: '"Yuanti SC","YouYuan","幼圆","Hiragino Maru Gothic ProN","Microsoft JhengHei",system-ui,sans-serif' },
    { id: "song", name: "宋体", css: '"Songti SC","SimSun","宋体","Noto Serif SC",serif' },
    { id: "kai", name: "楷体", css: '"Kaiti SC","KaiTi","楷体","STKaiti",serif' },
    { id: "hei", name: "黑体", css: '"PingFang SC","Microsoft YaHei","Heiti SC","SimHei",sans-serif' },
    { id: "mono", name: "等宽", css: '"JetBrains Mono","SFMono-Regular",Consolas,"Courier New",monospace' }
  ];

  const LETTER_TITLES = [
    "今天想对你说", "夜里的悄悄话", "写给此刻的你", "一点想念", "很久没写了", "关于你和我",
    "今天的碎碎念", "如果可以见面", "写给很久以后", "写给今天的你", "有些话想慢慢说", "小小的心事"
  ];

  const DECLINE_LINES = [
    "现在有点不方便，晚点给你打好不好",
    "手边有点事，等一下回你",
    "我在忙，稍后再联系你",
    "现在不方便说话，等会儿找你"
  ];

  const FAVICON_LIST = [
    { id: "moon", name: "月亮", bg: "#2b2030", fg: "🌙" },
    { id: "sakura", name: "樱花", bg: "#e79bb4", fg: "🌸" },
    { id: "star", name: "星星", bg: "#3b3a52", fg: "⭐" },
    { id: "heart", name: "爱心", bg: "#f6d7de", fg: "💗" },
    { id: "cloud", name: "云朵", bg: "#cfe3f2", fg: "☁️" },
    { id: "cat", name: "猫猫", bg: "#f6e7c9", fg: "🐱" },
    { id: "rabbit", name: "兔子", bg: "#f7dfe8", fg: "🐰" },
    { id: "panda", name: "熊猫", bg: "#e7e7e7", fg: "🐼" },
    { id: "letter", name: "信封", bg: "#d8e6f5", fg: "💌" },
    { id: "moonface", name: "月亮脸", bg: "#2f2a3d", fg: "🌜" },
    { id: "tea", name: "热茶", bg: "#e7dcc9", fg: "🍵" },
    { id: "firefly", name: "萤火", bg: "#243b33", fg: "✨" }
  ];
  function faviconURL(item) {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" rx="16" fill="' + item.bg + '"/>' +
      '<text x="32" y="44" font-size="34" text-anchor="middle">' + item.fg + "</text></svg>";
    return "data:image/svg+xml," + encodeURIComponent(svg);
  }
  FAVICON_LIST.forEach(f => (f.url = faviconURL(f)));

  const DEFAULT_PAT = [
    "歪头对着屏幕轻轻眨眼",
    "戳了戳你的脸颊",
    "在你耳边小声说想你",
    "把额头轻轻靠过来",
    "晃了晃手里的星星",
    "偷偷拽了拽你的衣角",
    "捧着一颗糖递过来",
    "在你名字后面画了颗心",
    "隔着屏幕亲了一下",
    "把灯留了一盏给你",
    "伸手揉了揉你的头发",
    "笑了一下又假装没笑",
    "把你的名字念得很轻",
    "在你身边坐下不走了",
    "发来一个抱抱的姿势",
    "把今天最好的事讲给你"
  ];

  return {
    DEFAULT_CARDS: DEFAULT_CARDS,
    DEFAULT_ATMOSPHERE: DEFAULT_ATMOSPHERE,
    DEFAULT_PAT: DEFAULT_PAT,
    EMOJI_GROUPS: EMOJI_GROUPS,
    MOOD_EMOJI: MOOD_EMOJI,
    THEMES: THEMES,
    BUBBLE_STYLES: BUBBLE_STYLES,
    FONTS: FONTS,
    LETTER_TITLES: LETTER_TITLES,
    DECLINE_LINES: DECLINE_LINES,
    FAVICONS: FAVICON_LIST,
    KAOMOJI: KAOMOJI
  };
})();