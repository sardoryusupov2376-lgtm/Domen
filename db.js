let users = {};

function setUser(id, data) {
    users[id] = { ...users[id], ...data };
}

function getUser(id) {
    return users[id];
}

module.exports = { setUser, getUser };