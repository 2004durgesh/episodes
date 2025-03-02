export const compareTwoStrings = (first: string, second: string): number => {
    first = first.replace(/\s+/g, '');
    second = second.replace(/\s+/g, '');
  
    if (first === second) return 1; // identical or empty
    if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string
  
    const firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
      const bigram = first.substring(i, i + 2);
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;
  
      firstBigrams.set(bigram, count);
    }
  
    let intersectionSize = 0;
    for (let i = 0; i < second.length - 1; i++) {
      const bigram = second.substring(i, i + 2);
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;
  
      if (count > 0) {
        firstBigrams.set(bigram, count - 1);
        intersectionSize++;
      }
    }
  
    return (2.0 * intersectionSize) / (first.length + second.length - 2);
  };

  export function generateSecretKey(id: number | string) {
    const keyArray = [
      "I",
      "3LZu",
      "M2V3",
      "4EXX",
      "s4",
      "yRy",
      "oqMz",
      "ysE",
      "RT",
      "iSI",
      "zlc",
      "H",
      "YNp",
      "5vR6",
      "h9S",
      "R",
      "jo",
      "F",
      "h2",
      "W8",
      "i",
      "sz09",
      "Xom",
      "gpU",
      "q",
      "6Qvg",
      "Cu",
      "5Zaz",
      "VK",
      "od",
      "FGY4",
      "eu",
      "D5Q",
      "smH",
      "11eq",
      "QrXs",
      "3",
      "L3",
      "YhlP",
      "c",
      "Z",
      "YT",
      "bnsy",
      "5",
      "fcL",
      "L22G",
      "r8",
      "J",
      "4",
      "gnK",
    ];
  
    // Handle undefined/null input
    if (typeof id === "undefined" || id === null) {
      return "rive";
    }
  
    // Convert to number and calculate array index
    const numericId = typeof id === "string" ? parseInt(id, 10) : Number(id);
    const index = numericId % keyArray.length;
  
    // Handle NaN cases (invalid number conversion)
    if (isNaN(index)) {
      return "rive";
    }
  
    return keyArray[index];
  }