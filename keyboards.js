function phoneKeyboard() {
    return {
        keyboard: [[{ text: "📲 Raqam yuborish", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true
    };
}

function locationKeyboard() {
    return {
        keyboard: [[{ text: "📍 Lokatsiya yuborish", request_location: true }]],
        resize_keyboard: true,
        one_time_keyboard: true
    };
}

module.exports = { phoneKeyboard, locationKeyboard };