import moment from 'moment';
import get from 'lodash/get';
import { formatPrice, formatIdentity, formatHours } from '../helpers/utils';
import { END_CONTRACT_REASONS, SURCHARGES } from '../data/constants';
import { downloadCsv } from '../helpers/downloadFile';

export const payMixin = {
  data () {
    return {
      columns: [
        {
          name: 'auxiliary',
          label: 'Auxiliaire',
          align: 'left',
          field: 'auxiliary',
          format: value => value ? formatIdentity(value.identity, 'LF') : '',
          sort: (a, b) => formatIdentity(a.identity, 'LF').localeCompare(formatIdentity(b.identity, 'LF')),
        },
        {
          name: 'sector',
          label: 'Équipe',
          align: 'left',
          field: 'auxiliary',
          format: value => value && value.sector ? value.sector.name : '',
          sort: (a, b) => get(a, 'sector.name', '').localeCompare(get(b, 'sector.name', '')),
        },
        {
          name: 'startDate',
          label: 'Début',
          align: 'left',
          field: 'startDate',
          format: value => value ? this.$moment(value).format('DD/MM/YYYY') : '',
          sort: (a, b) => new Date(a) - new Date(b),
        },
        {
          name: 'endNotificationDate',
          label: 'Date de notif',
          align: 'left',
          field: 'endNotificationDate',
          format: value => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'endReason',
          label: 'Motif',
          align: 'left',
          field: 'endReason',
          format: (value) => {
            const reason = END_CONTRACT_REASONS.find(r => r.value === value);
            return reason ? reason.label : '';
          },
        },
        {
          name: 'endDate',
          label: 'Fin',
          align: 'left',
          field: 'endDate',
          format: value => value ? this.$moment(value).format('DD/MM/YYYY') : '',
        },
        {
          name: 'contractHours',
          label: 'Heures contrat',
          align: 'center',
          field: 'contractHours',
          format: formatHours,
        },
        {
          name: 'workedHours',
          label: 'Heures travaillées',
          align: 'center',
          field: 'workedHours',
          format: formatHours,
        },
        {
          name: 'notSurchargedAndExempt',
          label: 'Dont exo non majo',
          align: 'center',
          field: 'notSurchargedAndExempt',
          format: formatHours,
        },
        {
          name: 'surchargedAndExempt',
          label: 'Dont exo et majo',
          align: 'center',
          field: 'surchargedAndExempt',
          format: formatHours,
        },
        {
          name: 'notSurchargedAndNotExempt',
          label: 'Dont non exo et non majo ',
          align: 'center',
          field: 'notSurchargedAndNotExempt',
          format: formatHours,
        },
        {
          name: 'surchargedAndNotExempt',
          label: 'Dont non exo et majo',
          align: 'center',
          field: 'surchargedAndNotExempt',
          format: formatHours,
        },
        {
          name: 'hoursBalance',
          label: 'Solde heures',
          align: 'center',
          field: 'hoursBalance',
          format: formatHours,
        },
        {
          name: 'hoursCounter',
          label: 'Compteur',
          align: 'center',
          field: row => row.hoursCounter - row.additionalHours - row.overtimeHours,
          format: formatHours,
        },
        {
          name: 'overtimeHours',
          label: 'Heures sup à payer',
          align: 'center',
          field: 'overtimeHours',
          format: formatHours,
        },
        {
          name: 'additionalHours',
          label: 'Heures comp à payer',
          align: 'center',
          field: 'additionalHours',
          format: formatHours,
        },
        {
          name: 'mutual',
          label: 'Mutuelle',
          align: 'center',
          field: 'mutual',
          format: value => value ? 'Oui' : 'Non',
          sort: (a, b) => a === b ? 0 : a ? -1 : 1,
        },
        {
          name: 'transport',
          label: 'Transport',
          align: 'center',
          field: 'transport',
          format: formatPrice,
        },
        {
          name: 'otherFees',
          label: 'Autres frais',
          align: 'center',
          field: 'otherFees',
          format: formatPrice,
        },
        {
          name: 'bonus',
          label: 'Prime',
          align: 'center',
          field: 'bonus',
          format: formatPrice,
        },
        {
          name: 'compensation',
          label: 'Indémnité',
          align: 'center',
          field: 'compensation',
          format: formatPrice,
        },
      ],
    }
  },
  methods: {
    formatPayload (payload) {
      return {
        ...this.$_.omit(payload, ['auxiliaryId', 'additionalHoursEdition', 'overtimeHoursEdition', 'bonusEdition', 'hoursCounterEdition', 'compensationEdition', 'paidKm', '__index']),
        hoursCounter: payload.hoursCounter - payload.overtimeHours - payload.additionalHours,
        auxiliary: payload.auxiliary._id,
      };
    },
    formatSurchargeDetails (details) {
      if (!details) return '';

      const formattedPlans = [];
      for (const plan of Object.keys(details)) {
        const surchages = Object.entries(this.$_.omit(details[plan], 'planName'));
        if (surchages.length === 0) continue;

        const lines = [details[plan].planName];
        for (const [surchageKey, surcharge] of surchages) {
          lines.push(`${SURCHARGES[surchageKey]}, ${surcharge.percentage}%, ${formatHours(surcharge.hours)}`);
        }
        formattedPlans.push(lines.join('\r\n'));
      }

      return formattedPlans.join('\r\n');
    },
    async exportToCSV () {
      const csvData = [[
        'Auxiliaire',
        'Équipe',
        'Début',
        'Fin',
        'Heures contrat',
        'Heures travaillées',
        'Dont exo non majo',
        'Dont exo et majo',
        'Details exo et majo',
        'Dont non exo et non majo ',
        'Dont non exo et majo',
        'Details non exo et majo',
        'Solde heures',
        'Compteur',
        'Heures sup à payer',
        'Heures comp à payer',
        'Mutuelle',
        'Transport',
        'Autres frais',
        'Prime',
      ]];

      for (const draftPay of this.displayedDraftPay) {
        const { auxiliary, startDate, endDate } = draftPay;
        csvData.push([
          formatIdentity(auxiliary.identity, 'FL') || '',
          auxiliary.sector ? auxiliary.sector.name : '',
          startDate ? this.$moment(startDate).format('DD/MM/YYYY') : '',
          endDate ? this.$moment(endDate).format('DD/MM/YYYY') : '',
          parseFloat(draftPay.contractHours).toFixed(2),
          parseFloat(draftPay.workedHours).toFixed(2),
          parseFloat(draftPay.notSurchargedAndExempt).toFixed(2),
          parseFloat(draftPay.surchargedAndExempt).toFixed(2),
          `"${this.formatSurchargeDetails(draftPay.surchargedAndExemptDetails)}"` || '',
          parseFloat(draftPay.notSurchargedAndNotExempt).toFixed(2),
          parseFloat(draftPay.surchargedAndNotExempt).toFixed(2),
          `"${this.formatSurchargeDetails(draftPay.surchargedAndNotExemptDetails)}"` || '',
          parseFloat(draftPay.hoursBalance).toFixed(2),
          parseFloat(draftPay.hoursCounter).toFixed(2),
          parseFloat(draftPay.additionalHours).toFixed(2),
          parseFloat(draftPay.overtimeHours).toFixed(2),
          draftPay.mutual ? 'Oui' : 'Non',
          parseFloat(draftPay.transport).toFixed(2),
          parseFloat(draftPay.otherFees).toFixed(2),
          parseFloat(draftPay.bonus).toFixed(2),
        ]);
      }

      return downloadCsv(csvData, `Paie_${moment().format('MM_YYYY')}.csv`)
    },
  },
};
