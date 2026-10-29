import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
    }
  return context;
};

// Approximate exchange rates relative to 1 USD (Update these as needed)
const EXCHANGE_RATES = {
  USD: { rate: 1, symbol: '$', },
  GBP: { rate: 0.79, symbol: '£', },
  EUR: { rate: 0.92, symbol: '€', },
  AED: { rate: 3.67, symbol: 'AED ', },
  ZAR: { rate: 19.00, symbol: 'R', },
  TRY: { rate: 32.50, symbol: '₺', },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    const savedCurrency = localStorage.getItem('yalamlam_currency') || 'USD';
    setCurrency(savedCurrency);
  }, []);

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('yalamlam_currency', newCurrency);
  };

  const formatPrice = (usdPrice) => {
    const price = Number(usdPrice);
    if (isNaN(price)) return 'N/A';
    
    const { rate, symbol, locale } = EXCHANGE_RATES[currency];
    const convertedPrice = price * rate;
    
    // Format with proper commas and decimals
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(convertedPrice).replace(currency === 'AED' ? 'AED' : '', '').trim() + (currency === 'AED' ? '' : '');
    // Note: Intl handles the symbol placement automatically for most, but we ensure clean output.
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, rates: EXCHANGE_RATES }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;