/**
 * Convert a number to Arabic words
 * Implementation of the num2words function for Arabic language
 */
const arabicNumerals = {
    // Singles
    0: '',
    1: 'واحد',
    2: 'اثنان',
    3: 'ثلاثة',
    4: 'أربعة',
    5: 'خمسة',
    6: 'ستة',
    7: 'سبعة',
    8: 'ثمانية',
    9: 'تسعة',
    10: 'عشرة',
    11: 'أحد عشر',
    12: 'اثنا عشر',
    
    // Tens
    20: 'عشرون',
    30: 'ثلاثون',
    40: 'أربعون',
    50: 'خمسون',
    60: 'ستون',
    70: 'سبعون',
    80: 'ثمانون',
    90: 'تسعون',
    
    // Hundreds
    100: 'مائة',
    200: 'مائتان',
    300: 'ثلاثمائة',
    400: 'أربعمائة',
    500: 'خمسمائة',
    600: 'ستمائة',
    700: 'سبعمائة',
    800: 'ثمانمائة',
    900: 'تسعمائة',
    
    // Thousands
    1000: 'ألف',
    2000: 'ألفان',
    
    // Millions
    1000000: 'مليون',
    2000000: 'مليونان',
    
    // Billions
    1000000000: 'مليار',
    2000000000: 'ملياران',
};

const scales = [
    '',
    'ألف',
    'مليون',
    'مليار',
    'تريليون'
];

// Special plurals for Arabic numbers
const arabicPluralRules = {
    // 3-10 get special plural forms
    'ألف': 'آلاف',
    'مليون': 'ملايين',
    'مليار': 'مليارات',
};

// English number to words conversion
const englishNumerals = {
    // Singles
    0: '',
    1: 'one',
    2: 'two',
    3: 'three',
    4: 'four',
    5: 'five',
    6: 'six',
    7: 'seven',
    8: 'eight',
    9: 'nine',
    10: 'ten',
    11: 'eleven',
    12: 'twelve',
    13: 'thirteen',
    14: 'fourteen',
    15: 'fifteen',
    16: 'sixteen',
    17: 'seventeen',
    18: 'eighteen',
    19: 'nineteen',
    
    // Tens
    20: 'twenty',
    30: 'thirty',
    40: 'forty',
    50: 'fifty',
    60: 'sixty',
    70: 'seventy',
    80: 'eighty',
    90: 'ninety',
    
    // Hundreds
    100: 'hundred',
    
    // Thousands
    1000: 'thousand',
    
    // Millions
    1000000: 'million',
    
    // Billions
    1000000000: 'billion'
};

/**
 * Convert a number to Arabic words
 * @param {number} num - The number to convert
 * @returns {string} The number in Arabic words
 */
function num2words(num) {
    // Handle 0
    if (num === 0) {
        return 'صفر';
    }
    
    let result = '';
    
    // Handle negative numbers
    if (num < 0) {
        result = 'سالب ';
        num = Math.abs(num);
    }
    
    // Handle decimals
    let decimalPart = '';
    if (num % 1 !== 0) {
        const parts = num.toString().split('.');
        num = parseInt(parts[0]);
        decimalPart = parts[1];
    }
    
    // Convert whole number
    const integerPart = convertWholeNumber(num);
    result += integerPart;
    
    // Add decimal part if exists
    if (decimalPart) {
        result += ' فاصلة ';
        for (const digit of decimalPart) {
            result += arabicNumerals[parseInt(digit)] + ' ';
        }
    }
    
    return result.trim();
}

/**
 * Convert a whole number to Arabic words
 * @param {number} num - The whole number to convert
 * @returns {string} The number in Arabic words
 */
function convertWholeNumber(num) {
    if (num === 0) return '';
    
    // Direct lookup for numbers in the dictionary
    if (arabicNumerals[num]) {
        return arabicNumerals[num];
    }
    
    // Handle numbers between 1000 and 9999 specially to ensure proper "و" placement
    if (num >= 1000 && num < 10000) {
        const thousands = Math.floor(num / 1000);
        const remainder = num % 1000;
        
        let result = '';
        
        // Handle the thousands part
        if (thousands === 1) {
            result = 'ألف';
        } else if (thousands === 2) {
            result = 'ألفان';
        } else if (thousands >= 3 && thousands <= 10) {
            result = arabicNumerals[thousands] + ' ' + arabicPluralRules['ألف'];
        } else {
            result = convertLessThanThousand(thousands) + ' ' + 'ألف';
        }
        
        // Add remainder with "و" connector if needed
        if (remainder > 0) {
            result += ' و ' + convertLessThanThousand(remainder);
        }
        
        return result;
    }
    
    // For other numbers, use the standard processing
    let result = '';
    let groups = [];
    let remaining = num;
    let scaleIndex = 0;
    
    // Break the number into groups of 3 digits
    while (remaining > 0) {
        const group = remaining % 1000;
        if (group > 0) {
            groups.push({ value: group, scale: scaleIndex });
        }
        
        remaining = Math.floor(remaining / 1000);
        scaleIndex++;
    }
    
    // Process each group and combine with appropriate connectors
    for (let i = groups.length - 1; i >= 0; i--) {
        const group = groups[i];
        const groupText = convertLessThanThousand(group.value);
        
        // Add scale (thousand, million, etc.)
        if (group.scale > 0) {
            const scale = scales[group.scale];
            
            if (group.value === 1) {
                result += (result ? ' و ' : '') + scale;
            } else if (group.value === 2) {
                result += (result ? ' و ' : '') + scale + 'ان';
            } else if (group.value >= 3 && group.value <= 10) {
                result += (result ? ' و ' : '') + groupText + ' ' + arabicPluralRules[scale];
            } else {
                result += (result ? ' و ' : '') + groupText + ' ' + scale;
            }
        } else {
            // For the ones, tens, and hundreds
            result += (result ? ' و ' : '') + groupText;
        }
    }
    
    // Remove "واحد" prefix for thousands (1000-1999)
    result = result.replace("واحد ألف", "ألف");
    
    return result.trim();
}

/**
 * Convert a number less than 1000 to Arabic words
 * @param {number} num - The number to convert (must be less than 1000)
 * @returns {string} The number in Arabic words
 */
function convertLessThanThousand(num) {
    if (num === 0) return '';
    
    // Direct lookup for numbers in the dictionary
    if (arabicNumerals[num]) {
        return arabicNumerals[num];
    }
    
    let result = '';
    
    // Handle hundreds
    const hundreds = Math.floor(num / 100) * 100;
    if (hundreds > 0) {
        result += arabicNumerals[hundreds] + ' و ';
        num %= 100;
    }
    
    // Handle tens and units
    if (num > 0) {
        // Direct lookup for 1-12
        if (arabicNumerals[num]) {
            result += arabicNumerals[num];
        } else {
            // Handle 13-19
            if (num < 20) {
                result += arabicNumerals[num % 10] + ' عشر';
            } else {
                // Handle 21-99
                const units = num % 10;
                const tens = Math.floor(num / 10) * 10;
                
                if (units > 0) {
                    result += arabicNumerals[units] + ' و ';
                }
                
                result += arabicNumerals[tens];
            }
        }
    }
    
    return result.trim();
}

/**
 * Convert a number to English words
 * @param {number} num - The number to convert
 * @returns {string} The number in English words
 */
function num2wordsEnglish(num) {
    if (num === 0) return 'zero';
    
    let result = '';
    
    // Handle negative numbers
    if (num < 0) {
        result = 'negative ';
        num = Math.abs(num);
    }
    
    // Handle decimals
    let decimalPart = '';
    if (num % 1 !== 0) {
        const parts = num.toString().split('.');
        num = parseInt(parts[0]);
        decimalPart = parts[1];
    }
    
    // Convert whole number
    const integerPart = convertWholeNumberEnglish(num);
    result += integerPart;
    
    // Add decimal part if exists
    if (decimalPart) {
        result += ' point ';
        for (const digit of decimalPart) {
            result += englishNumerals[parseInt(digit)] + ' ';
        }
    }
    
    return result.trim();
}

/**
 * Convert a whole number to English words
 * @param {number} num - The whole number to convert
 * @returns {string} The number in English words
 */
function convertWholeNumberEnglish(num) {
    if (num === 0) return '';
    
    // Direct lookup for numbers in the dictionary
    if (num < 20) {
        return englishNumerals[num];
    }
    
    let result = '';
    
    // Handle billions
    if (num >= 1000000000) {
        const billions = Math.floor(num / 1000000000);
        result += convertWholeNumberEnglish(billions) + ' billion ';
        num %= 1000000000;
    }
    
    // Handle millions
    if (num >= 1000000) {
        const millions = Math.floor(num / 1000000);
        result += convertWholeNumberEnglish(millions) + ' million ';
        num %= 1000000;
    }
    
    // Handle thousands
    if (num >= 1000) {
        const thousands = Math.floor(num / 1000);
        result += convertWholeNumberEnglish(thousands) + ' thousand ';
        num %= 1000;
    }
    
    // Handle hundreds
    if (num >= 100) {
        const hundreds = Math.floor(num / 100);
        result += englishNumerals[hundreds] + ' hundred ';
        num %= 100;
    }
    
    // Handle tens and units
    if (num > 0) {
        if (result !== '') {
            result += 'and ';
        }
        
        if (num < 20) {
            result += englishNumerals[num];
        } else {
            const tens = Math.floor(num / 10) * 10;
            const units = num % 10;
            result += englishNumerals[tens];
            if (units > 0) {
                result += '-' + englishNumerals[units];
            }
        }
    }
    
    return result.trim();
}

/**
 * Format the amount in words for a cheque
 * @param {number} dinars - The dinars amount
 * @param {number} piasters - The piasters amount
 * @param {string} currency - The currency code
 * @returns {string} The formatted amount in words
 */
function convertAmountToWords(dinars, piasters, currency = 'JOD') {
    let result = '';
    
    // Define currencies that use فلس/فلسات
    const filCurrencyCodes = ['JOD', 'BHD', 'IQD', 'KWD', 'AED', 'YER'];
    
    // Handle piasters based on currency type
    let finalPiasters = piasters || 0;
    if (filCurrencyCodes.includes(currency)) {
        // For فلس currencies, keep 3 digits
        finalPiasters = finalPiasters.toString().padStart(3, '0');
    } else {
        // For non-فلس currencies, keep 2 digits
        finalPiasters = finalPiasters.toString().padStart(2, '0');
    }
    
    if (currency === 'USD') {
        // English conversion for USD
        let amountInWords = num2wordsEnglish(dinars);
        
        // Add "and" between hundreds and tens if needed
        if (dinars >= 100 && dinars % 100 !== 0) {
            amountInWords = amountInWords.replace(/(\d+) hundred (\d+)/, '$1 hundred and $2');
        }
        
        result = amountInWords + ' dollars';
        
        // Format cents as XX/100, always two digits
        const cents = finalPiasters.toString().padStart(2, '0');
        result += ' and ' + cents + '/100';
        
        // Add "only" at the end
        result += ' only';
    } else {
        // Arabic conversion for other currencies
        result = num2words(dinars) + ' ' + getCurrencyName(currency);
        if (finalPiasters > 0) {
            // For non-USD currencies, show decimal part as numbers
            result += ' و ' + finalPiasters + ' ' + getCurrencyFractionName(currency);
        }
        // Add "فقط لا غير" at the end
        result += ' فقط لا غير';
    }
    
    return result;
}

/**
 * Get the currency name in Arabic
 * @param {string} currency - The currency code
 * @returns {string} The currency name in Arabic
 */
function getCurrencyName(currency) {
    const currencyNames = {
        'JOD': 'دينار أردني',
        'BHD': 'دينار بحريني',
        'IQD': 'دينار عراقي',
        'KWD': 'دينار كويتي',
        'AED': 'درهم إماراتي',
        'YER': 'ريال يمني',
        'SAR': 'ريال سعودي',
        'QAR': 'ريال قطري',
        'OMR': 'ريال عماني',
        'EGP': 'جنيه مصري',
        'DZD': 'دينار جزائري',
        'LBP': 'ليرة لبنانية',
        'LYD': 'دينار ليبي',
        'MRU': 'أوقية موريتانية',
        'MAD': 'درهم مغربي',
        'SYP': 'ليرة سورية',
        'TND': 'دينار تونسي',
        'USD': 'دولار أمريكي'
    };
    return currencyNames[currency] || 'دينار';
}

/**
 * Get the currency fraction name in Arabic
 * @param {string} currency - The currency code
 * @returns {string} The currency fraction name in Arabic
 */
function getCurrencyFractionName(currency) {
    const fractionNames = {
        'JOD': 'فلس',
        'BHD': 'فلس',
        'IQD': 'فلس',
        'KWD': 'فلس',
        'AED': 'فلس',
        'YER': 'فلس',
        'SAR': 'هللة',
        'QAR': 'درهم',
        'OMR': 'بيسة',
        'EGP': 'قرش',
        'DZD': 'سنتيم',
        'LBP': 'قرش',
        'LYD': 'درهم',
        'MRU': 'خمس',
        'MAD': 'سنتيم',
        'SYP': 'قرش',
        'TND': 'مليم',
        'USD': 'سنت'
    };
    return fractionNames[currency] || 'فلس';
} 