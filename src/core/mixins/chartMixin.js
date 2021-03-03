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
      return `${new Date(date).getFullYear()}${new Date(date).getMonth() < 10
        ? `0${new Date(date).getMonth()}`
        : `${new Date(date).getMonth()}`
      }`;
    },
    getDataByMonth (activityHistories, groupByParam) {
      const historiesByMonth = groupBy(activityHistories, ah => this.formatMonthAndYear(ah.date));
      const monthNames = ['janv', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
      const monthlyData = [];
      this.months = [];
      for (let i = 6; i > 0; i -= 1) {
        const date = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        this.months.push(`${month} ${year}`);

        const field = this.formatMonthAndYear(date);
        if (!historiesByMonth[field]) monthlyData.push(0);
        else if (groupByParam) {
          monthlyData.push(
            Object.values(groupBy(historiesByMonth[field], group => get(group, groupByParam, null))).length
          );
        } else monthlyData.push(historiesByMonth[field].length);
      }

      return monthlyData;
    },
  },
};
