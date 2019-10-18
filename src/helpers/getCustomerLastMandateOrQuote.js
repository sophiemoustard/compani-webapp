export const getCustomerLastMandateOrQuote = (docs) => {
  if (!docs || !Array.isArray(docs) || docs.length === 0) return [];
  const sortedDocs = docs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return [sortedDocs[0]];
};
