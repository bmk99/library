const messages = {
  en: {
    serverError: "Server error",
    notFound: "Resource not found",
    invalidData: "Invalid data provided",
    unauthorized: "Unauthorized access",
    bookCreated: "Book created successfully",
    libraryCreated: "Library created successfully",
    libraryDeleted: "Library deleted successfully",
    bookDeleted: "Book deleted successfully",
    invalidToken: "Invalid token",
  },
  hi: {
    serverError: "सर्वर त्रुटि",
    notFound: "संसाधन नहीं मिला",
    invalidData: "अमान्य डेटा प्रदान किया गया",
    unauthorized: "अनधिकृत पहुँच",
    bookCreated: "किताब सफलतापूर्वक बनाई गई",
    libraryCreated: "पुस्तकालय सफलतापूर्वक बनाया गया",
    libraryDeleted: "पुस्तकालय सफलतापूर्वक हटाया गया",
    bookDeleted: "किताब सफलतापूर्वक हटाई गई",
    invalidToken: "अमान्य टोकन",
  },
};

function getMessage(req, key) {
  const language = "en"; // Default to English
  return messages[language][key];
}
