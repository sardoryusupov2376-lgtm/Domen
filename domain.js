const whois = require('whois-json');

async function checkDomain(domain) {
    try {
        const data = await whois(domain);
        return data.domainName ? "taken" : "free";
    } catch {
        return "free";
    }
}

module.exports = { checkDomain };