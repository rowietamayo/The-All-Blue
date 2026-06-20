const DIAL_CODE_TO_CURRENCY: Record<string, string> = {
  "+1": "USD", // US / Canada
  "+7": "RUB", // Russia
  "+20": "EGP", // Egypt
  "+27": "ZAR", // South Africa
  "+30": "EUR", // Greece
  "+31": "EUR", // Netherlands
  "+32": "EUR", // Belgium
  "+33": "EUR", // France
  "+34": "EUR", // Spain
  "+36": "HUF", // Hungary
  "+39": "EUR", // Italy
  "+40": "RON", // Romania
  "+41": "CHF", // Switzerland
  "+43": "EUR", // Austria
  "+44": "GBP", // United Kingdom
  "+45": "DKK", // Denmark
  "+46": "SEK", // Sweden
  "+47": "NOK", // Norway
  "+48": "PLN", // Poland
  "+49": "EUR", // Germany
  "+51": "PEN", // Peru
  "+52": "MXN", // Mexico
  "+53": "CUP", // Cuba
  "+54": "ARS", // Argentina
  "+55": "BRL", // Brazil
  "+56": "CLP", // Chile
  "+57": "COP", // Colombia
  "+58": "VES", // Venezuela
  "+60": "MYR", // Malaysia
  "+61": "AUD", // Australia
  "+62": "IDR", // Indonesia
  "+63": "PHP", // Philippines
  "+64": "NZD", // New Zealand
  "+65": "SGD", // Singapore
  "+66": "THB", // Thailand
  "+81": "JPY", // Japan
  "+82": "KRW", // South Korea
  "+84": "VND", // Vietnam
  "+86": "CNY", // China
  "+90": "TRY", // Turkey
  "+91": "INR", // India
  "+92": "PKR", // Pakistan
  "+93": "AFN", // Afghanistan
  "+94": "LKR", // Sri Lanka
  "+95": "MMK", // Myanmar
  "+98": "IRR", // Iran
  "+212": "MAD", // Morocco
  "+213": "DZD", // Algeria
  "+216": "TND", // Tunisia
  "+218": "LYD", // Libya
  "+220": "GMD", // Gambia
  "+221": "XOF", // Senegal
  "+223": "XOF", // Mali
  "+224": "GNF", // Guinea
  "+225": "XOF", // Ivory Coast
  "+227": "XOF", // Niger
  "+228": "XOF", // Togo
  "+229": "XOF", // Benin
  "+230": "MUR", // Mauritius
  "+231": "LRD", // Liberia
  "+232": "SLL", // Sierra Leone
  "+233": "GHS", // Ghana
  "+234": "NGN", // Nigeria
  "+235": "XAF", // Chad
  "+236": "XAF", // Central African Republic
  "+237": "XAF", // Cameroon
  "+238": "CVE", // Cape Verde
  "+240": "XAF", // Equatorial Guinea
  "+241": "XAF", // Gabon
  "+242": "XAF", // Congo
  "+243": "CDF", // DR Congo
  "+244": "AOA", // Angola
  "+249": "SDG", // Sudan
  "+250": "RWF", // Rwanda
  "+251": "ETB", // Ethiopia
  "+254": "KES", // Kenya
  "+255": "TZS", // Tanzania
  "+256": "UGX", // Uganda
  "+260": "ZMW", // Zambia
  "+261": "MGA", // Madagascar
  "+263": "ZWL", // Zimbabwe
  "+264": "NAD", // Namibia
  "+267": "BWP", // Botswana
  "+350": "GIP", // Gibraltar
  "+351": "EUR", // Portugal
  "+352": "EUR", // Luxembourg
  "+353": "EUR", // Ireland
  "+354": "ISK", // Iceland
  "+355": "ALL", // Albania
  "+356": "EUR", // Malta
  "+357": "EUR", // Cyprus
  "+358": "EUR", // Finland
  "+359": "BGN", // Bulgaria
  "+370": "EUR", // Lithuania
  "+371": "EUR", // Latvia
  "+372": "EUR", // Estonia
  "+374": "AMD", // Armenia
  "+375": "BYN", // Belarus
  "+380": "UAH", // Ukraine
  "+381": "RSD", // Serbia
  "+385": "EUR", // Croatia
  "+386": "EUR", // Slovenia
  "+387": "BAM", // Bosnia
  "+420": "CZK", // Czech Republic
  "+421": "EUR", // Slovakia
  "+501": "BZD", // Belize
  "+502": "GTQ", // Guatemala
  "+503": "SVC", // El Salvador
  "+504": "HNL", // Honduras
  "+505": "NIO", // Nicaragua
  "+506": "CRC", // Costa Rica
  "+507": "PAB", // Panama
  "+591": "BOB", // Bolivia
  "+592": "GYD", // Guyana
  "+593": "USD", // Ecuador (uses USD)
  "+595": "PYG", // Paraguay
  "+597": "SRD", // Suriname
  "+598": "UYU", // Uruguay
  "+670": "USD", // Timor-Leste (uses USD)
  "+673": "BND", // Brunei
  "+675": "PGK", // Papua New Guinea
  "+679": "FJD", // Fiji
  "+850": "KPW", // North Korea
  "+852": "HKD", // Hong Kong
  "+853": "MOP", // Macau
  "+855": "KHR", // Cambodia
  "+856": "LAK", // Laos
  "+880": "BDT", // Bangladesh
  "+886": "TWD", // Taiwan
  "+960": "MVR", // Maldives
  "+961": "LBP", // Lebanon
  "+962": "JOD", // Jordan
  "+964": "IQD", // Iraq
  "+965": "KWD", // Kuwait
  "+966": "SAR", // Saudi Arabia
  "+968": "OMR", // Oman
  "+971": "AED", // UAE
  "+972": "ILS", // Israel
  "+973": "BHD", // Bahrain
  "+974": "QAR", // Qatar
  "+977": "NPR", // Nepal
  "+992": "TJS", // Tajikistan
  "+994": "AZN", // Azerbaijan
  "+995": "GEL", // Georgia
  "+996": "KGS", // Kyrgyzstan
  "+998": "UZS", // Uzbekistan
};

export function getCurrencyFromPhone(phone: string | undefined | null): string {
  if (!phone) return "USD";
  const cleanPhone = phone.trim();

  // Sort dial codes by length descending to match longest prefix first
  const dialCodes = Object.keys(DIAL_CODE_TO_CURRENCY).sort((a, b) => b.length - a.length);

  for (const dialCode of dialCodes) {
    if (cleanPhone.startsWith(dialCode)) {
      return DIAL_CODE_TO_CURRENCY[dialCode];
    }
  }

  return "USD";
}

export function formatPrice(usdPrice: number, currencyCode: string, exchangeRate: number): string {
  const converted = usdPrice * exchangeRate;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currencyCode,
    }).format(converted);
  } catch (e) {
    return `${currencyCode} ${converted.toFixed(2)}`;
  }
}
