import { useMemo, useState } from 'react';
import styles from '@/styles/Calculator.module.css';

const BUTTONS = [
  { label: 'AC', type: 'action', action: 'clear' },
  { label: '⌫', type: 'action', action: 'backspace' },
  { label: '%', type: 'action', action: 'percent' },
  { label: '÷', type: 'operator', value: '/' },
  { label: '7', type: 'number', value: '7' },
  { label: '8', type: 'number', value: '8' },
  { label: '9', type: 'number', value: '9' },
  { label: '×', type: 'operator', value: '*' },
  { label: '4', type: 'number', value: '4' },
  { label: '5', type: 'number', value: '5' },
  { label: '6', type: 'number', value: '6' },
  { label: '−', type: 'operator', value: '-' },
  { label: '1', type: 'number', value: '1' },
  { label: '2', type: 'number', value: '2' },
  { label: '3', type: 'number', value: '3' },
  { label: '+', type: 'operator', value: '+' },
  { label: '0', type: 'number', value: '0', span: 2 },
  { label: '.', type: 'decimal', value: '.' },
  { label: '=', type: 'action', action: 'equals', accent: true }
];

const HISTORY_LIMIT = 10;

const formatNumber = (value) => {
  if (value === 'Error' || value === 'NaN' || value === '-NaN') {
    return value;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return String(value);
  }

  const [intPart = '0', decimalPart] = value.split('.');
  const formattedInt = Number(intPart).toLocaleString('en-US');

  if (value.endsWith('.')) {
    return `${formattedInt}.`;
  }

  if (!decimalPart) {
    return formattedInt;
  }

  return `${formattedInt}.${decimalPart}`;
};

const performCalculation = (previous, current, operator) => {
  const a = Number(previous);
  const b = Number(current);

  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    return 'Error';
  }

  switch (operator) {
    case '+':
      return String(a + b);
    case '-':
      return String(a - b);
    case '*':
      return String(a * b);
    case '/':
      if (b === 0) {
        return 'Error';
      }
      return String(a / b);
    default:
      return current;
  }
};

const Calculator = () => {
  const [currentValue, setCurrentValue] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [overwrite, setOverwrite] = useState(false);
  const [history, setHistory] = useState([]);

  const displayValue = useMemo(() => formatNumber(currentValue), [currentValue]);
  const previousDisplay = useMemo(() => {
    if (!previousValue || !operator) {
      return '';
    }
    const symbol = operator === '/' ? '÷' : operator === '*' ? '×' : operator === '-' ? '−' : operator;
    return `${formatNumber(previousValue)} ${symbol}`;
  }, [previousValue, operator]);

  const pushHistory = (entry) => {
    setHistory((prev) => [entry, ...prev.slice(0, HISTORY_LIMIT - 1)]);
  };

  const clearAll = () => {
    setCurrentValue('0');
    setPreviousValue(null);
    setOperator(null);
    setOverwrite(false);
  };

  const handleNumber = (digit) => {
    if (currentValue === 'Error' || overwrite) {
      setCurrentValue(digit);
      setOverwrite(false);
      return;
    }

    if (currentValue === '0') {
      setCurrentValue(digit);
    } else {
      setCurrentValue((prev) => `${prev}${digit}`);
    }
  };

  const handleDecimal = () => {
    if (currentValue === 'Error' || overwrite) {
      setCurrentValue('0.');
      setOverwrite(false);
      return;
    }

    if (!currentValue.includes('.')) {
      setCurrentValue((prev) => `${prev}.`);
    }
  };

  const handleOperator = (nextOperator) => {
    if (currentValue === 'Error') {
      return;
    }

    if (previousValue && operator && !overwrite) {
      const result = performCalculation(previousValue, currentValue, operator);
      setCurrentValue(result);
      setPreviousValue(result === 'Error' ? null : result);
      setOperator(result === 'Error' ? null : nextOperator);
      setOverwrite(true);
      return;
    }

    setPreviousValue(currentValue);
    setOperator(nextOperator);
    setOverwrite(true);
  };

  const handleEquals = () => {
    if (!operator || !previousValue || overwrite) {
      return;
    }

    const result = performCalculation(previousValue, currentValue, operator);
    const historyEntry = `${formatNumber(previousValue)} ${operator === '/' ? '÷' : operator === '*' ? '×' : operator === '-' ? '−' : operator} ${formatNumber(currentValue)} = ${formatNumber(result)}`;
    pushHistory(historyEntry);
    setCurrentValue(result);
    setPreviousValue(null);
    setOperator(null);
    setOverwrite(true);
  };

  const handlePercent = () => {
    if (currentValue === 'Error') {
      return;
    }

    const value = String(Number(currentValue) / 100);
    setCurrentValue(value);
  };

  const handleBackspace = () => {
    if (currentValue === 'Error' || overwrite) {
      setCurrentValue('0');
      setOverwrite(false);
      return;
    }

    setCurrentValue((prev) => {
      if (prev.length <= 1) {
        return '0';
      }
      return prev.slice(0, -1);
    });
  };

  const handleButtonPress = (button) => {
    switch (button.type) {
      case 'number':
        handleNumber(button.value);
        break;
      case 'decimal':
        handleDecimal();
        break;
      case 'operator':
        handleOperator(button.value);
        break;
      case 'action':
        if (button.action === 'clear') {
          clearAll();
        } else if (button.action === 'backspace') {
          handleBackspace();
        } else if (button.action === 'percent') {
          handlePercent();
        } else if (button.action === 'equals') {
          handleEquals();
        }
        break;
      default:
        break;
    }
  };

  const isOperatorActive = (value) => operator === value && overwrite;

  return (
    <div className={styles.shell}>
      <div className={styles.calculator}>
        <div className={styles.glow} aria-hidden />
        <div className={styles.display}>
          <div className={styles.previousValue}>{previousDisplay}</div>
          <div className={styles.currentValue}>{displayValue}</div>
        </div>
        <div className={styles.keypad}>
          {BUTTONS.map((button) => (
            <button
              key={button.label}
              type="button"
              className={[
                styles.key,
                button.type === 'operator' ? styles.operatorKey : '',
                button.accent ? styles.accentKey : '',
                button.span === 2 ? styles.doubleWide : '',
                isOperatorActive(button.value) ? styles.activeOperator : ''
              ].join(' ')}
              onClick={() => handleButtonPress(button)}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>
      <aside className={styles.historyPanel}>
        <h2 className={styles.historyTitle}>History</h2>
        {history.length === 0 ? (
          <p className={styles.emptyHistory}>No calculations yet.</p>
        ) : (
          <ul className={styles.historyList}>
            {history.map((item, index) => (
              <li key={`${item}-${index}`} className={styles.historyItem}>
                {item}
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
};

export default Calculator;
