import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

// Safe hook: returns a fallback instead of crashing the app if provider is missing
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    return { 
      currency: 'USD', 
      changeCurrency: () => {}, 
      formatPrice: (p) => `$${p}`, 
      rates: {} 
    };
  }
  return context;
};

const EXCHANGE_RATES = {
  USD: { rate: 1, symbol: '$', locale: 'en-US' },
  GBP: { rate: 0.79, symbol: '£', locale: 'en-GB' },
  EUR: { rate: 0.92, symbol: '€', locale: 'de-DE' },
  AED: { rate: 3.67, symbol: 'AED ', locale: 'en-AE' },
  ZAR: { rate: 19.00, symbol: 'R', locale: 'en-ZA' },
  TRY: { rate: 32.50, symbol: '₺', locale: 'tr-TR' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('yalamlam_currency');
    // Only set currency if it's a valid option in our rates list
    if (savedCurrency && EXCHANGE_RATES[savedCurrency]) {
      setCurrency(savedCurrency);
    }
  }, []);

  const changeCurrency = (newCurrency) => {
    if (EXCHANGE_RATES[newCurrency]) {
      setCurrency(newCurrency);
      localStorage.setItem('yalamlam_currency', newCurrency);
    }
  };

  const formatPrice = (usdPrice) => {
    const price = Number(usdPrice);
    if (isNaN(price)) return 'N/A';

    const rateData = EXCHANGE_RATES[currency] || EXCHANGE_RATES['USD'];
    const convertedPrice = price * rateData.rate;

    try {
      return new Intl.NumberFormat(rateData.locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(convertedPrice);
    } catch (e) {
      // Fallback formatting if Intl fails
      return `${rateData.symbol}${convertedPrice.toLocaleString()}`;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, rates: EXCHANGE_RATES }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;