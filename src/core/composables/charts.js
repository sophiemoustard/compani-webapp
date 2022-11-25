import { ref } from 'vue';
import groupBy from 'lodash/groupBy';
import get from 'lodash/get';

export const useCharts = () => {
  const traineesByMonth = ref([]);
  const activitiesByMonth = ref([]);
  const months = ref([]);

  const formatMonthAndYear = (date) => {
    const month = new Date(date).getMonth() < 10 ? `0${new Date(date).getMonth()}` : new Date(date).getMonth();

    return `${new Date(date).getFullYear()}${month}`;
  };

  const getDataByMonth = (histories, groupByKey) => {
    const historiesByMonth = groupBy(histories, h => formatMonthAndYear(h.date));
    const monthNames = ['janv', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
    const monthlyData = [];
    months.value = [];

    for (let i = 6; i > 0; i -= 1) {
      const date = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      months.value.push(`${month} ${year}`);

      const monthKey = formatMonthAndYear(date);
      if (!historiesByMonth[monthKey]) monthlyData.push(0);
      else if (!groupByKey) monthlyData.push(historiesByMonth[monthKey].length);
      else {
        const monthlyHistoriesGroupedByKey = groupBy(historiesByMonth[monthKey], g => get(g, groupByKey) || null);
        monthlyData.push(Object.keys(monthlyHistoriesGroupedByKey).length);
      }
    }

    return monthlyData;
  };

  return {
    // Data
    traineesByMonth,
    activitiesByMonth,
    months,
    // Methods
    getDataByMonth,
  };
};
