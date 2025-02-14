import fetch from 'node-fetch';

const SUPPORTED_COUNTRIES = ['AL', 'DZ', 'AD', 'AO', 'AG', 'AR', 'AM', 'AU', 'AT', 'AZ', 'BS', 'BD', 'BB', 'BE', 'BZ', 'BJ', 'BT', 'BO', 'BA', 'BW', 'BR', 'BN', 'BG', 'BF', 'CV', 'CA', 'CL', 'CO', 'KM', 'CG', 'CR', 'CI', 'HR', 'CY', 'CZ', 'DK', 'DJ', 'DM', 'DO', 'EC', 'SV', 'EE', 'FJ', 'FI', 'FR', 'GA', 'GM', 'GE', 'DE', 'GH', 'GR', 'GD', 'GT', 'GN', 'GW', 'GY', 'HT', 'VA', 'HN', 'HU', 'IS', 'IN', 'ID', 'IQ', 'IE', 'IL', 'IT', 'JM', 'JP', 'JO', 'KZ', 'KE', 'KI', 'KW', 'KG', 'LV', 'LB', 'LS', 'LR', 'LI', 'LT', 'LU', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MR', 'MU', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NZ', 'NI', 'NE', 'NG', 'MK', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PL', 'PT', 'QA', 'RO', 'RW', 'KN', 'LC', 'VC', 'WS', 'SM', 'ST', 'SN', 'RS', 'SC', 'SL', 'SG', 'SK', 'SI', 'SB', 'ZA', 'KR', 'ES', 'LK', 'SR', 'SE', 'CH', 'TW', 'TZ', 'TH', 'TL', 'TG', 'TO', 'TT', 'TN', 'TR', 'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UY', 'VU', 'ZM'];

let isOpenAISupported: boolean | null = null;

export async function checkOpenAISupport(): Promise<boolean> {
  if (isOpenAISupported !== null) {
    return isOpenAISupported;
  }

  try {
    const response = await fetch('https://chat.openai.com/cdn-cgi/trace');
    const text = await response.text();
    const lines = text.split('\n');
    const location = lines.find(line => line.startsWith('loc='))?.split('=')[1];

    isOpenAISupported = SUPPORTED_COUNTRIES.includes(location || '');
    return isOpenAISupported;
  } catch (error) {
    console.error('Error checking OpenAI support:', error);
    isOpenAISupported = false;
    return false;
  }
}