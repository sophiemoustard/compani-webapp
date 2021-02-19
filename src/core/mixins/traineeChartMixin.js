import { colors } from 'quasar';
import groupBy from 'lodash/groupBy';
import get from 'lodash/get';

export const traineeChartMixin = {
  data () {
    return {
      months: [],
      traineesByMonth: [],
    };
  },
  computed: {
    chartData () {
      return {
        labels: this.months,
        datasets: [{
          data: this.traineesByMonth,
          borderColor: colors.getBrand('primary'),
          backgroundColor: 'transparent',
        }],
      };
    },
  },
  methods: {
    formatMonthAndYear (date) {
      return `${new Date(date).getFullYear()}${new Date(date).getMonth() < 10
        ? `0${new Date(date).getMonth()}`
        : `${new Date(date).getMonth()}`
      }`;
    },
    getTraineeByMonth (activityHistoriesByMonth) {
      const monthNames = ['janv', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
      const monthlyTrainees = [];
      this.months = [];
      for (let i = 6; i > 0; i -= 1) {
        const date = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        this.months.push(`${month} ${year}`);

        const field = this.formatMonthAndYear(date);

        if (!activityHistoriesByMonth[field]) monthlyTrainees.push(0);
        else {
          monthlyTrainees.push(
            Object.values(
              groupBy(
                activityHistoriesByMonth[field],
                group => get(group, 'user._id', null) || group.user
              )
            ).length
          );
        }
      }

      return monthlyTrainees;
    },
  },
};
