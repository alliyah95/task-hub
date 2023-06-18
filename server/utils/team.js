const shortid = require("shortid");

const generateShortId = () => {
    return shortid.generate(10);
};

module.exports = { generateShortId };
