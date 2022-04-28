const { BigNumber } = require('bignumber.js');

exports.divide = (a, b) => BigNumber(a).dividedBy(b).toString();

exports.add = (...nums) => nums.reduce((acc, n) => BigNumber(acc).plus(n).toString(), 0);
