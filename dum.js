const translationText =
      req.getLocale() == "en"
        ? error.message
        : (await translate(error.message, { to: req.getLocale() })).text;



const translate = require("@vitalets/google-translate-api")
