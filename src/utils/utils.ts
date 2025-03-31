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
    let keyArray = [
      '9Y2',
      'xzL',
      '4zZZwK',
      'B3Yt3',
      'Z35YU9jLlf',
      'FyKw3pA',
      '5',
      '1aD8',
      'Jl',
      'xGr',
      '42ER1',
      'jczYB',
      '9hZ7dK9b',
      'Rqor4wJOP',
      'sL',
      'frTaH42KRz',
      '7iud',
      'sM',
      'YE7rmwUNfo',
      'uvCRS5',
      'g',
      'Dpymw189',
      '78Z1U2f',
      'edPXPbD',
      'wpTZ3',
      'DqPZ',
      '3BR',
      'vt',
      'Z4l2j',
      'nAp1Tv',
      'Z2',
      'BPNbeQoy',
      'ut7KZeQXn',
      '7QvWEHrUq',
      'EoVt',
      'xKGWHoH',
      'M0VnD',
      'uKZz',
      'CT5Sr4Qt',
      'c',
      'A6P8',
      'y2QPgB',
      'VJ',
      'c2k',
      '6pH1ABUJat',
      '5',
      'o',
      'PpjP',
      'jb2tLf29',
      'yr1zHg8Lz',
      '7opBBY',
      'EQOwB',
      'YSTIaExVc',
      'tbrfwW',
      'mV9kT14Yn',
      'ctkGj',
      'iuaMBA',
      'RFYsuG6j3r',
      'AYJ3bJv',
      'wM6OsyrU8',
    ];
  
    // Handle undefined/null input
    if (void 0 === id||typeof id === "undefined" || id === null) {
      return "rive";
    }
  
    try {
      let t, n;
      // Convert input to string
      let r = String(id);
      // Double base64 encode the input
      let i = btoa(btoa(r));
  
      // Different handling for non-numeric vs numeric inputs
      if (isNaN(Number(id))) {
        // For non-numeric inputs, sum the character codes
        let e = r.split('').reduce((e, t) => e + t.charCodeAt(0), 0);
        // Select array element or fallback to base64 encoded input
        t = keyArray[e % keyArray.length] || btoa(r);
        // Calculate insertion position
        n = Math.floor((e % i.length) / 2);
      } else {
        // For numeric inputs, use the number directly
        t = keyArray[Number(id) % keyArray.length] || btoa(r);
        // Calculate insertion position
        n = Math.floor((Number(id) % i.length) / 2);
      }
  
      // Construct the final key by inserting the selected value into the base64 string
      return i.slice(0, n) + t + i.slice(n);
    } catch (e) {
      // Return fallback value if any errors occur
      return 'topSecret';
    }
  }