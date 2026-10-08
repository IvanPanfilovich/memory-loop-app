export interface CountryDetectionResult {
  success: boolean;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  timezone?: string;
  error?: string;
}

export const detectUserCountry = async (): Promise<CountryDetectionResult> => {
  try {
    const services = [detectCountryFromIpapi, detectCountryFromIpapiCo, detectCountryFromIpInfo];

    for (const service of services) {
      try {
        const result = await service();
        if (result.success && result.country) {
          return result;
        }
      } catch (error) {
        console.warn('Country detection service failed:', error);
        continue;
      }
    }

    console.warn('All country detection services failed, using "undefined"');
    return {
      success: false,
      country: 'undefined',
      countryCode: 'undefined',
      error: 'All detection services failed',
    };
  } catch (error) {
    console.error('Country detection error:', error);
    return {
      success: false,
      country: 'undefined',
      countryCode: 'undefined',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Detect country using ipapi.co service
 */
const detectCountryFromIpapi = async (): Promise<CountryDetectionResult> => {
  const response = await fetch('https://ipapi.co/json/', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.reason || 'API returned error');
  }

  return {
    success: true,
    country: data.country_name || 'undefined',
    countryCode: data.country_code || 'undefined',
    region: data.region,
    city: data.city,
    timezone: data.timezone,
  };
};

/**
 * Detect country using ip-api.com service (free tier)
 */
const detectCountryFromIpapiCo = async (): Promise<CountryDetectionResult> => {
  const response = await fetch('http://ip-api.com/json/', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.status === 'fail') {
    throw new Error(data.message || 'API returned fail status');
  }

  return {
    success: true,
    country: data.country || 'undefined',
    countryCode: data.countryCode || 'undefined',
    region: data.regionName,
    city: data.city,
    timezone: data.timezone,
  };
};

/**
 * Detect country using ipinfo.io service
 */
const detectCountryFromIpInfo = async (): Promise<CountryDetectionResult> => {
  const response = await fetch('https://ipinfo.io/json', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || 'API returned error');
  }

  return {
    success: true,
    country: data.country || 'undefined',
    countryCode: data.country || 'undefined', // ipinfo returns country code in 'country' field
    region: data.region,
    city: data.city,
    timezone: data.timezone,
  };
};
