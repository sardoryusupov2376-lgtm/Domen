const TelegramBot = require('node-telegram-bot-api');
const { TOKEN, ADMIN_ID, CARD, PRICE } = require('./config');
const { setUser, getUser } = require('./db');
const { checkDomain } = require('./domain');
const { phoneKeyboard, locationKeyboard } = require('./keyboards');

const bot = new TelegramBot(TOKEN, { polling: true });

// /start
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `
Assalomu alaykum!
Domen UZ xizmatiga xush kelibsiz 🇺🇿

📲 Telefon raqamingizni yuboring:
    `, {
        reply_markup: phoneKeyboard()
    });
});

// PHONE
bot.on('contact', (msg) => {
    setUser(msg.chat.id, { phone: msg.contact.phone_number });

    bot.sendMessage(msg.chat.id, "📍 Lokatsiyangizni yuboring:", {
        reply_markup: locationKeyboard()
    });
});

// LOCATION
bot.on('location', (msg) => {
    setUser(msg.chat.id, {
        location: `${msg.location.latitude}, ${msg.location.longitude}`
    });

    bot.sendMessage(msg.chat.id, "🌐 Domen yozing:", {
        reply_markup: { remove_keyboard: true }
    });
});

// DOMAIN + CHECK + CHEK + CARD
bot.on('message', async (msg) => {
    const user = getUser(msg.chat.id);
    if (!user?.phone || !user?.location) return;

    // DOMAIN
    if (msg.text && msg.text.includes(".uz")) {
        bot.sendMessage(msg.chat.id, "🔍 Tekshirilmoqda...");
        const status = await checkDomain(msg.text);

        if (status === "free") {
            setUser(msg.chat.id, { domain: msg.text });

            bot.sendMessage(msg.chat.id, `
✅ Domen bo‘sh

💰 Narx: ${PRICE} so'm
💳 Karta: ${CARD}

📸 Chek yuboring
            `);
        } else {
            bot.sendMessage(msg.chat.id, "❌ Domen band, boshqa yozing");
        }
    }

    // CHEK
    if (msg.photo) {
        setUser(msg.chat.id, { chek: msg.photo.pop().file_id });
        bot.sendMessage(msg.chat.id, "💳 Karta raqamingizni yozing:");
    }

    // CARD
    if (user?.chek && msg.text && msg.text.length > 8) {
        setUser(msg.chat.id, { card: msg.text });

        bot.sendPhoto(ADMIN_ID, user.chek, {
            caption: `
🆕 BUYURTMA

📞 ${user.phone}
📍 ${user.location}
🌐 ${user.domain}
💳 ${msg.text}
            `
        });

        bot.sendMessage(msg.chat.id, `
✅ Arizangiz qabul qilindi
⏳ Admin 24 soat ichida bog‘lanadi
        `);
    }
});
bot.on('photo', (msg) => {
    const chatId = msg.chat.id;

    // User objectni olish yoki yaratish
    let user = getUser(chatId);  // getUser – sen yozgan funksiya bo‘lishi kerak
    if (!user) user = {};        // agar mavjud bo‘lmasa, yangi object

    // Chek rasm file_id ni saqlash
    user.chek = msg.photo.pop().file_id;
    saveUser(chatId, user);      // saveUser – sen yozgan funksiya bo‘lishi kerak

    // Adminga yuborish
    bot.sendPhoto(ADMIN_ID, user.chek, {
        caption: `
🆕 BUYURTMA

📞 ${user.phone}
📍 ${user.location}
🌐 ${user.domain}
💳 ${user.card || "Yo'q"}
        `,
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "✅ Tasdiqlash", callback_data: `accept_${chatId}` },
                    { text: "❌ Rad qilish", callback_data: `reject_${chatId}` }
                ]
            ]
        }
    });

    bot.sendMessage(chatId, "💳 Karta raqamingizni yozing:");
});
bot.on('callback_query', (callbackQuery) => {
    const data = callbackQuery.data;
    const fromId = callbackQuery.from.id;

    if (fromId !== ADMIN_ID) return; // faqat admin

    const chatId = parseInt(data.split('_')[1]);

    if (data.startsWith("accept_")) {
        bot.sendMessage(chatId, "✅ Buyurtmangiz qabul qilindi");
        bot.answerCallbackQuery(callbackQuery.id, { text: "Qabul qilindi" });
    }

    if (data.startsWith("reject_")) {
        bot.sendMessage(chatId, "❌ Buyurtmangiz rad qilindi");
        bot.answerCallbackQuery(callbackQuery.id, { text: "Rad qilindi" });
    }
});
console.log("Bot ishlayapti 🚀");
