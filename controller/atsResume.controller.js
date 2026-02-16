const pdfParse = require("pdf-parse");
const SpellChecker = require("simple-spellchecker");

exports.calculateAtsScore = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const file = req.file;

    if (!jobDescription || !file) {
      return res.status(400).json({
        success: false,
        message: "Job description and resume file required",
      });
    }

    // ---------------- EXTRACT PDF TEXT ----------------
    const pdfData = await pdfParse(file.buffer);
    const resumeText = pdfData.text.toLowerCase();
    const jd = jobDescription.toLowerCase();

    // ---------------- ATS KEYWORD SCORE ----------------
    const jdWords = jd
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3);

    const uniqueKeywords = [...new Set(jdWords)];

    let matchCount = 0;

    uniqueKeywords.forEach((word) => {
      if (resumeText.includes(word)) {
        matchCount++;
      }
    });

    let atsScore = 0;
    if (uniqueKeywords.length > 0) {
      atsScore = Math.round((matchCount / uniqueKeywords.length) * 100);
    }

    atsScore = Math.min(atsScore, 100);

    // ---------------- SPELLING CHECK WITH SUGGESTIONS ----------------
    const dictionary = await new Promise((resolve, reject) => {
      SpellChecker.getDictionary("en-US", (err, dict) => {
        if (err) reject(err);
        else resolve(dict);
      });
    });

    const resumeWords = resumeText
      .replace(/[^\w\s@.]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3);

    const ignoreWords = [
      "react",
      "node",
      "javascript",
      "html",
      "css",
      "mongodb",
      "express",
      "redux",
      "api",
      "linkedin",
      "github",
      "vite",
      "next",
      "typescript",
    ];

    let spellingMistakes = [];

    resumeWords.forEach((word) => {
      const isNumber = /^\d+$/.test(word);
      const isEmail = word.includes("@");
      const isURL = word.includes("www") || word.includes("http");

      if (
        !isNumber &&
        !isEmail &&
        !isURL &&
        !ignoreWords.includes(word) &&
        !dictionary.spellCheck(word)
      ) {
        const suggestions = dictionary.getSuggestions(word, 1);

        spellingMistakes.push({
          wrongWord: word,
          suggestion: suggestions.length > 0 ? suggestions[0] : "No suggestion",
        });
      }
    });

    // Remove duplicate spelling mistakes
    const uniqueMistakes = {};
    spellingMistakes.forEach((item) => {
      uniqueMistakes[item.wrongWord] = item;
    });

    spellingMistakes = Object.values(uniqueMistakes);

    // ---------------- REPEATED WORD COUNT ----------------
    const wordFrequency = {};

    resumeWords.forEach((word) => {
      if (!ignoreWords.includes(word)) {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      }
    });

    const repeatedWords = Object.entries(wordFrequency)
      .filter(([word, count]) => count > 5)
      .map(([word, count]) => ({ word, count }));

    // ---------------- OPTIONAL: QUALITY SCORE ADJUSTMENT ----------------
    // Penalize ATS score slightly for spelling mistakes
    let finalScore = atsScore - spellingMistakes.length * 1;
    finalScore = finalScore < 0 ? 0 : finalScore;

    return res.status(200).json({
      success: true,
      atsScore,
      finalScore,
      matchedKeywords: matchCount,
      totalKeywords: uniqueKeywords.length,
      spellingMistakeCount: spellingMistakes.length,
      spellingMistakes: spellingMistakes.slice(0, 10),
      repeatedWords,
    });
  } catch (error) {
    console.log("ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
