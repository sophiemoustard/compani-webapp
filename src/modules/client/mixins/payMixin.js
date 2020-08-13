import moment from 'moment';
import get from 'lodash/get';
import omit from 'lodash/omit';
import { formatPrice, formatIdentity, formatHours } from '@helpers/utils';
import { downloadCsv } from '@helpers/file';
import { END_CONTRACT_REASONS, SURCHARGES } from '@data/constants';

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
          format: value => value ? this.$moment(value).format('DD/MM') : '',
          sort: (a, b) => new Date(a) - new Date(b),
        },
        {
          name: 'endNotificationDate',
          label: 'Date de notif',
          align: 'left',
          field: 'endNotificationDate',
          format: value => value ? this.$moment(value).format('DD/MM') : '',
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
          format: value => value ? this.$moment(value).format('DD/MM') : '',
        },
        {
          name: 'contractHours',
          label: 'Heures contrat',
          align: 'center',
          field: 'contractHours',
          format: value => formatHours(value),
        },
        {
          name: 'hoursToWork',
          label: 'Heures à travailler',
          align: 'center',
          field: row => row.hoursToWork + row.diff.absencesHours,
          format: value => formatHours(value),
        },
        {
          name: 'workedHours',
          label: 'Heures travaillées',
          align: 'center',
          field: row => row.workedHours + row.diff.workedHours,
          format: value => formatHours(value),
        },
        {
          name: 'notSurchargedAndExempt',
          label: 'Dont exo non majo',
          align: 'center',
          field: row => row.notSurchargedAndExempt + row.diff.notSurchargedAndExempt,
          format: value => formatHours(value),
        },
        {
          name: 'surchargedAndExempt',
          label: 'Dont exo et majo',
          align: 'center',
          field: row => row.surchargedAndExempt + row.diff.surchargedAndExempt,
          format: value => formatHours(value),
        },
        {
          name: 'notSurchargedAndNotExempt',
          label: 'Dont non exo et non majo ',
          align: 'center',
          field: row => row.notSurchargedAndNotExempt + row.diff.notSurchargedAndNotExempt,
          format: value => formatHours(value),
        },
        {
          name: 'surchargedAndNotExempt',
          label: 'Dont non exo et majo',
          align: 'center',
          field: row => row.surchargedAndNotExempt + row.diff.surchargedAndNotExempt,
          format: value => formatHours(value),
        },
        {
          name: 'hoursBalance',
          label: 'Solde heures',
          align: 'center',
          field: row => row.hoursBalance + row.diff.hoursBalance,
          format: value => formatHours(value),
        },
        {
          name: 'diff',
          label: 'Dont rattrapage',
          align: 'center',
          field: row => row.diff.hoursBalance,
          format: value => formatHours(value),
        },
        {
          name: 'previousMonthHoursCounter',
          label: 'Compteur M-1',
          align: 'center',
          field: row => row.previousMonthHoursCounter,
          format: value => formatHours(value),
        },
        {
          name: 'hoursCounter',
          label: 'Compteur',
          align: 'center',
          field: row => row.hoursCounter - row.additionalHours - row.overtimeHours,
          format: value => formatHours(value),
        },
        {
          name: 'overtimeHours',
          label: 'Heures sup',
          align: 'center',
          field: 'overtimeHours',
          format: value => formatHours(value),
        },
        {
          name: 'additionalHours',
          label: 'Heures comp',
          align: 'center',
          field: 'additionalHours',
          format: value => formatHours(value),
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
      period: 0,
      periodOptions: [
        { label: 'Mois en cours', value: 0 },
        { label: 'Mois précédent', value: 1 },
      ],
      dates: {
        startDate: this.$moment().startOf('M').toISOString(),
        endDate: this.$moment().endOf('M').toISOString(),
      },
    };
  },
  methods: {
    formatPayload (payload) {
      return {
        ...omit(
          payload,
          ['auxiliaryId', 'additionalHoursEdition', 'overtimeHoursEdition', 'bonusEdition', 'hoursCounterEdition',
            'compensationEdition', 'paidKm']
        ),
        hoursCounter: payload.hoursCounter - payload.overtimeHours - payload.additionalHours,
        auxiliary: payload.auxiliary._id,
      };
    },
    formatSurchargeDetails (details) {
      if (!details) return '';

      const formattedPlans = [];
      for (const plan of Object.keys(details)) {
        const surchages = Object.entries(omit(details[plan], 'planName'));
        if (surchages.length === 0) continue;

        const lines = [details[plan].planName];
        for (const [surchageKey, surcharge] of surchages) {
          lines.push(`${SURCHARGES[surchageKey]}, ${surcharge.percentage}%, ${formatHours(surcharge.hours)}`);
        }
        formattedPlans.push(lines.join(' / '));
      }

      return formattedPlans.join('\r\n');
    },
    formatHoursWithDiff (pay, key) {
      let hours = pay[key];
      if (pay.diff[key]) hours += pay.diff[key];

      return this.formatNumberForCSV(hours);
    },
    setSelectedPeriod (offset) {
      this.dates = {
        startDate: this.$moment().subtract(offset, 'M').startOf('M').toISOString(),
        endDate: this.$moment().subtract(offset, 'M').endOf('M').toISOString(),
      };
    },
    formatNumberForCSV (number) {
      return parseFloat(number).toFixed(2).replace('.', ',');
    },
    async exportToCSV () {
      const csvData = [[
        'Auxiliaire - Nom',
        'Auxiliaire - Prénom',
        'Équipe',
        'Début',
        'Fin',
        'Heures contrat',
        'Heures à travailler',
        'Heures travaillées',
        'Dont exo non majo',
        'Dont exo et majo',
        'Details exo et majo',
        'Dont non exo et non majo ',
        'Dont non exo et majo',
        'Details non exo et majo',
        'Solde heures',
        'Dont rattrapage',
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
          get(auxiliary, 'identity.lastname') || '',
          get(auxiliary, 'identity.firstname') || '',
          get(auxiliary, 'sector.name') || '',
          startDate ? this.$moment(startDate).format('DD/MM/YYYY') : '',
          endDate ? this.$moment(endDate).format('DD/MM/YYYY') : '',
          this.formatNumberForCSV(draftPay.contractHours),
          this.formatHoursWithDiff(draftPay, 'hoursToWork'),
          this.formatHoursWithDiff(draftPay, 'workedHours'),
          this.formatHoursWithDiff(draftPay, 'notSurchargedAndExempt'),
          this.formatHoursWithDiff(draftPay, 'surchargedAndExempt'),
          `"${this.formatSurchargeDetails(draftPay.surchargedAndExemptDetails)}"` || '',
          this.formatHoursWithDiff(draftPay, 'notSurchargedAndNotExempt'),
          this.formatHoursWithDiff(draftPay, 'surchargedAndNotExempt'),
          `"${this.formatSurchargeDetails(draftPay.surchargedAndNotExemptDetails)}"` || '',
          this.formatHoursWithDiff(draftPay, 'hoursBalance'),
          get(draftPay, 'diff.hoursBalance') ? this.formatNumberForCSV(draftPay.diff.hoursBalance) : '0,00',
          this.formatNumberForCSV(draftPay.hoursCounter),
          this.formatNumberForCSV(draftPay.overtimeHours),
          this.formatNumberForCSV(draftPay.additionalHours),
          draftPay.mutual ? 'Oui' : 'Non',
          this.formatNumberForCSV(draftPay.transport),
          this.formatNumberForCSV(draftPay.otherFees),
          this.formatNumberForCSV(draftPay.bonus),
        ]);
      }

      return downloadCsv(csvData, `Paie_${moment().format('MM_YYYY')}.csv`);
    },
  },
};
