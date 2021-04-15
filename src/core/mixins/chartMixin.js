import { colors } from 'quasar';
import groupBy from 'lodash/groupBy';
import get from 'lodash/get';

export const chartMixin = {
  data () {
    return {
      months: [],
      traineesByMonth: [],
      activitiesByMonth: [],
    };
  },
  methods: {
    chartData (data) {
      return {
        labels: this.months,
        datasets: [{
          data,
          borderColor: colors.getBrand('primary'),
          backgroundColor: 'transparent',
        }],
      };
    },
    formatMonthAndYear (date) {
      const month = new Date(date).getMonth() < 10 ? `0${new Date(date).getMonth()}` : new Date(date).getMonth();

      return `${new Date(date).getFullYear()}${month}`;
    },
    getDataByMonth (activityHistories, groupByKey) {
      const historiesByMonth = groupBy(activityHistories, ah => this.formatMonthAndYear(ah.date));
      const monthNames = ['janv', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
      const monthlyData = [];
      this.months = [];

      for (let i = 6; i > 0; i -= 1) {
        const date = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        this.months.push(`${month} ${year}`);

        const key = this.formatMonthAndYear(date);
        if (!historiesByMonth[key]) monthlyData.push(0);
        else if (!groupByKey) monthlyData.push(historiesByMonth[key].length);
        else {
          monthlyData.push(Object.values(groupBy(historiesByMonth[key], group => get(group, groupByKey, null))).length);
        }
      }

      return monthlyData;
    },
  },
};
