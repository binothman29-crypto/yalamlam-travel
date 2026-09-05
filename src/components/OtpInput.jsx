import { useEffect, useRef } from 'react';

// A 6-digit (configurable) one-time-code input: one box per digit, with
// auto-advance, backspace/arrow navigation, and paste support.
export default function OtpInput({ length = 6, value, onChange, disabled = false, autoFocus = false }) {
  const inputsRef = useRef([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFocus]);

  const commit = (nextDigits) => onChange(nextDigits.join(''));

  const handleChange = (index, e) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (!raw) {
      const next = [...digits];
      next[index] = '';
      commit(next);
      return;
    }
    const chars = raw.split('');
    const next = [...digits];
    chars.forEach((c, i) => {
      if (index + i < length) next[index + i] = c;
    });
    commit(next);
    const nextIndex = Math.min(index + chars.length, length - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        commit(next);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index, e) => {
    e.preventDefault();
    const raw = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '');
    if (!raw) return;
    const chars = raw.split('');
    const next = [...digits];
    chars.forEach((c, i) => {
      if (index + i < length) next[index + i] = c;
    });
    commit(next);
    const nextIndex = Math.min(index + chars.length, length - 1);
    inputsRef.current[nextIndex]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" dir="ltr">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          className="w-11 h-13 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-safari-gold focus:border-safari-green transition disabled:opacity-50 disabled:bg-gray-100"
        />
      ))}
    </div>
  );
}
