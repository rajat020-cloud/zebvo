export interface GibberishCheckResult {
  isGibberish: boolean;
  reason: string;
}

export class GibberishService {
  /**
   * Evaluates if a given text is spam, bot activity, or keyboard gibberish
   */
  public evaluateText(text: string): GibberishCheckResult {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 10) {
      return { isGibberish: true, reason: 'Text too short (less than 10 characters)' };
    }

    // 1. Repetitive character strings (e.g., "aaaaa", "helloooooooo")
    const charRepetitionRegex = /(.)\1{4,}/i;
    if (charRepetitionRegex.test(trimmed)) {
      return { isGibberish: true, reason: 'Excessive character repetition (spam pattern)' };
    }

    // 2. High ratio of special symbols to letters (e.g., "!!!$$$###@@@")
    const symbolCount = (trimmed.match(/[^a-zA-Z0-9\s]/g) || []).length;
    const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
    if (symbolCount > 15 && symbolCount > letterCount) {
      return { isGibberish: true, reason: 'Unusually high density of symbols compared to text' };
    }

    // 3. Vowel-to-consonant ratio check (for English/alphabetic strings)
    // Keyboard smashes like "hgfdsazxcv" have extremely low vowel ratios, while "aeiouaeiou" has extremely high ratios
    const words = trimmed.split(/\s+/).filter(w => w.length > 3 && /^[a-zA-Z]+$/.test(w));
    if (words.length >= 3) {
      let abnormalWords = 0;
      words.forEach(word => {
        const vowels = (word.match(/[aeiouyAEIOUY]/g) || []).length;
        const ratio = vowels / word.length;
        if (ratio < 0.1 || ratio > 0.8) {
          abnormalWords++;
        }
      });

      // If more than 50% of the normal words have abnormal vowel/consonant distribution, flag as gibberish
      if (abnormalWords / words.length > 0.6) {
        return { isGibberish: true, reason: 'Irregular vowel-to-consonant ratio (keyboard smash pattern)' };
      }
    }

    // 4. Repeated word spamming (e.g., "cheap passports cheap passports cheap passports")
    const wordList = trimmed.toLowerCase().split(/\s+/);
    if (wordList.length >= 8) {
      const uniqueWords = new Set(wordList);
      const ratio = uniqueWords.size / wordList.length;
      if (ratio < 0.35) {
        return { isGibberish: true, reason: 'Excessive word repetition (spam template)' };
      }
    }

    // 5. Bot spam templates (e.g. money laundering, fake documents, excessive links)
    const spamKeywords = [
      'fake documents', 'buy fake passport', 'novelty passports', 'cloned cards', 
      'whatsapp\\s*\\+\\d+', 'telegram\\s*:\\s*@\\w+', 'click link to buy'
    ];
    for (const keyword of spamKeywords) {
      const regex = new RegExp(keyword, 'i');
      if (regex.test(trimmed)) {
        return { isGibberish: true, reason: 'Matches blacklisted bot spam template' };
      }
    }

    return { isGibberish: false, reason: '' };
  }
}

export default new GibberishService();
