import { CompaniDateFactory, formatMiscToCompaniDate } from './companiDateFactory';

export default (...args) => CompaniDateFactory(formatMiscToCompaniDate(...args));
