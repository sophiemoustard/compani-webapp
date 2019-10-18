export const checkRIB = (rib) => {
  if (rib.length !== 23) return false;

  const ribArr = rib.split('');

  const extendedRibArr = ribArr.map((char) => {
    const currentCharValue = parseInt(char, 36);
    return currentCharValue < 10 ? currentCharValue : (currentCharValue + Math.pow(2, (currentCharValue - 10) / 9) % 10);
  });
  const extendedRib = extendedRibArr.join('');
  const bankCode = parseInt(extendedRib.slice(0, 5), 10);
  const counterCode = parseInt(extendedRib.slice(5, 10), 10);
  const accountNumber = parseInt(extendedRib.slice(10, 21), 10);
  const ribKey = parseInt(extendedRib.slice(-2), 10);

  return (bankCode * 89 + counterCode * 15 + accountNumber * 3 + ribKey) % 97 === 0;
};

export const getIbanFromRIB = (rib) => {
  const tmpIban = `${rib}FR00`.split('').map(char => parseInt(char, 36).toString()).join('');
  let remainder = 0;
  let start = 0;
  let end = 9;
  while (start < tmpIban.length) {
    remainder = parseInt(remainder.toString() + tmpIban.substring(start, end), 10) % 97;
    start += 9;
    end += 9;
  }
  const key = 98 - (remainder % 97);
  return `FR${key}${rib}`;
};
