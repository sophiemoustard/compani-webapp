import { ref, computed } from 'vue';
import {
  CREDIT_NOTE,
  BILL,
  DIRECT_DEBIT,
  BANK_TRANSFER,
  CHECK,
  CESU,
  CASH,
  REFUND,
  CUSTOMER,
  THIRD_PARTY_PAYER,
} from '@data/constants';
import Balances from '@api/Balances';
import moment from '@helpers/moment';

export const useBalanceMixin = (customer) => {
  const customerDocuments = ref([]);
  const tppDocuments = ref([]);
  const balances = ref([]);
  const payments = ref([]);
  const bills = ref([]);
  const creditNotes = ref([]);
  const balancesForCustomer = ref([]);
  const billingDates = ref({ startDate: moment().toISOString(), endDate: moment().toISOString() });
  const documentQuery = computed(() => ({
    customer: customer.value._id,
    startDate: billingDates.value.startDate,
    endDate: billingDates.value.endDate,
  }));

  const setBillingDates = () => {
    billingDates.value.endDate = moment().endOf('d').toISOString();
    billingDates.value.startDate = moment().subtract(2, 'M').startOf('M').toISOString();
  };

  const getStartBalance = (tpp = null) => {
    const balance = !tpp
      ? balances.value.find(bal => bal.customer._id === customer._id && !bal.thirdPartyPayer)
      : balances.value.find(bal => bal.thirdPartyPayer && bal.thirdPartyPayer._id === tpp._id);

    return balance ? balance.balance : 0;
  };

  const getEndBalance = (documents, tpp) => {
    if (!documents || documents.length === 0) return getStartBalance(tpp);
    return documents[documents.length - 1].balance;
  };

  const getInclTaxes = (doc, type) => {
    switch (doc.type) {
      case BILL:
        return -doc.netInclTaxes;
      case CREDIT_NOTE:
        return type === CUSTOMER ? doc.inclTaxesCustomer : doc.inclTaxesTpp;
      case BANK_TRANSFER:
      case DIRECT_DEBIT:
      case CHECK:
      case CASH:
      case CESU:
        if (doc.nature === REFUND) return -doc.netInclTaxes;
        return doc.netInclTaxes;
    }
  };

  const computeIntermediateBalances = (docs, startBalance, type) => {
    docs.sort((a, b) => new Date(a.date) - new Date(b.date));
    for (let i = 0, l = docs.length; i < l; i++) {
      if (i === 0) docs[i].balance = startBalance + getInclTaxes(docs[i], type);
      else docs[i].balance = docs[i - 1].balance + getInclTaxes(docs[i], type);
    }
  };

  const computeCustomerBalance = () => {
    const customerStartBalance = getStartBalance();
    computeIntermediateBalances(customerDocuments.value, customerStartBalance, CUSTOMER);
  };

  const computeTppBalances = () => {
    for (const tpp of tppDocuments.value) {
      const tppStartBalance = getStartBalance(tpp);
      computeIntermediateBalances(tpp.documents, tppStartBalance, THIRD_PARTY_PAYER);
    }
  };

  const newDocumentList = doc => ({ documents: [doc], name: doc.thirdPartyPayer.name, _id: doc.thirdPartyPayer._id });

  const getCustomerBalanceWithDetails = async () => {
    try {
      const balancesWithDetails = await Balances.listWithDetails(documentQuery.value);
      balances.value = balancesWithDetails.balances;
      payments.value = balancesWithDetails.payments;
      bills.value = balancesWithDetails.bills;
      creditNotes.value = balancesWithDetails.creditNotes;
    } catch (e) {
      balancesForCustomer.value = [];
      console.error(e);
    }
  };

  const formatDocumentList = () => {
    customerDocuments.value = [];
    const tppDocs = {};

    for (const bill of bills.value) {
      bill.billType = bill.type;
      bill.type = BILL;
      if (!bill.thirdPartyPayer) customerDocuments.value.push(bill);
      else if (bill.thirdPartyPayer._id && !tppDocs[bill.thirdPartyPayer._id]) {
        tppDocs[bill.thirdPartyPayer._id] = newDocumentList(bill);
      } else tppDocs[bill.thirdPartyPayer._id].documents.push(bill);
    }

    for (const cd of creditNotes.value) {
      cd.type = CREDIT_NOTE;
      if (cd.inclTaxesCustomer) customerDocuments.value.push(cd);
      else if (cd.inclTaxesTpp && !tppDocs[cd.thirdPartyPayer._id]) {
        tppDocs[cd.thirdPartyPayer._id] = newDocumentList(cd);
      } else if (cd.inclTaxesTpp && tppDocs[cd.thirdPartyPayer._id]) {
        tppDocs[cd.thirdPartyPayer._id].documents.push(cd);
      }
    }

    for (const payment of payments.value) {
      if (!payment.thirdPartyPayer) customerDocuments.value.push(payment);
      else if (payment.thirdPartyPayer._id && !tppDocs[payment.thirdPartyPayer._id]) {
        tppDocs[payment.thirdPartyPayer._id] = newDocumentList(payment);
      } else tppDocs[payment.thirdPartyPayer._id].documents.push(payment);
    }

    tppDocuments.value = Object.values(tppDocs);
  };

  return {
    billingDates,
    customerDocuments,
    tppDocuments,
    setBillingDates,
    getStartBalance,
    getEndBalance,
    getCustomerBalanceWithDetails,
    formatDocumentList,
    computeCustomerBalance,
    computeTppBalances,
  };
};
