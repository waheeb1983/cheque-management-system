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
 * Format the amount in words for a cheque
 * @param {number} dinars - The dinars amount
 * @param {number} piasters - The piasters amount
 * @param {string} currency - The currency code (default: 'JOD')
 * @returns {string} The formatted amount in words
 */
function convertAmountToWords(dinars, piasters, currency = 'JOD') {
    // Convert dinars to words
    const dinarsWords = num2words(dinars);
    
    // Define currency words and their plural forms
    const currencyWords = {
        // Dinars
        'JOD': { singular: 'دينار', plural: 'دنانير', subunit: 'فلس', subunitPlural: 'فلسات' },
        'DZD': { singular: 'دينار', plural: 'دنانير', subunit: 'سنتيم', subunitPlural: 'سنتيمات' },
        'BHD': { singular: 'دينار', plural: 'دنانير', subunit: 'فلس', subunitPlural: 'فلسات' },
        'IQD': { singular: 'دينار', plural: 'دنانير', subunit: 'فلس', subunitPlural: 'فلسات' },
        'KWD': { singular: 'دينار', plural: 'دنانير', subunit: 'فلس', subunitPlural: 'فلسات' },
        'LYD': { singular: 'دينار', plural: 'دنانير', subunit: 'درهم', subunitPlural: 'دراهم' },
        'TND': { singular: 'دينار', plural: 'دنانير', subunit: 'مليم', subunitPlural: 'مليمات' },
        
        // Pounds
        'EGP': { singular: 'جنيه', plural: 'جنيهات', subunit: 'قرش', subunitPlural: 'قروش' },
        'LBP': { singular: 'ليرة', plural: 'ليرات', subunit: 'قرش', subunitPlural: 'قروش' },
        'SYP': { singular: 'ليرة', plural: 'ليرات', subunit: 'قرش', subunitPlural: 'قروش' },
        
        // Rials
        'OMR': { singular: 'ريال', plural: 'ريالات', subunit: 'بيسة', subunitPlural: 'بيسات' },
        'QAR': { singular: 'ريال', plural: 'ريالات', subunit: 'درهم', subunitPlural: 'دراهم' },
        'SAR': { singular: 'ريال', plural: 'ريالات', subunit: 'هللة', subunitPlural: 'هللات' },
        'YER': { singular: 'ريال', plural: 'ريالات', subunit: 'فلس', subunitPlural: 'فلسات' },
        
        // Dirhams
        'MAD': { singular: 'درهم', plural: 'دراهم', subunit: 'سنتيم', subunitPlural: 'سنتيمات' },
        'AED': { singular: 'درهم', plural: 'دراهم', subunit: 'فلس', subunitPlural: 'فلسات' },
        
        // Others
        'MRU': { singular: 'أوقية', plural: 'أوقيات', subunit: 'خمس', subunitPlural: 'أخماس' }
    };
    
    // Get currency info
    const currencyInfo = currencyWords[currency] || currencyWords['JOD'];
    
    // Determine the appropriate currency word form
    let currencyWord = dinars >= 3 && dinars <= 10 ? currencyInfo.plural : currencyInfo.singular;
    
    // Format full text
    if (piasters) {
        const subunitWord = piasters >= 3 && piasters <= 10 ? currencyInfo.subunitPlural : currencyInfo.subunit;
        return `${dinarsWords} ${currencyWord} و ${piasters} ${subunitWord} فقط لا غير`;
    } else {
        return `${dinarsWords} ${currencyWord} فقط لا غير`;
    }
} 