import { ref } from 'vue';
import groupBy from 'lodash/groupBy';
import uniqBy from 'lodash/uniqBy';
import CompaniDate from '@helpers/dates/companiDates';
import CompaniInterval from '@helpers/dates/companiIntervals';
import { MONTH, MONTH_SHORT_YYYY, MM_YYYY } from '@data/constants';

export const useCharts = () => {
  const lastMonthsStartDates = CompaniInterval(
    CompaniDate().startOf(MONTH).subtract('P6M').toISO(),
    CompaniDate().startOf(MONTH).subtract('P1M').toISO()
  ).rangeBy('P1M');

  const monthAxisLabels = ref(lastMonthsStartDates.map(date => CompaniDate(date).format(MONTH_SHORT_YYYY)));

  const getCountsByMonth = (histories, uniqByKey) => {
    const activityHistoriesByMonth = groupBy(
      histories,
      ah => CompaniDate(ah.date).format(MM_YYYY)
    );

    return lastMonthsStartDates
      .map((date) => {
        const monthKey = CompaniDate(date).format(MM_YYYY);

        const monthActivityHistories = uniqByKey
          ? uniqBy(activityHistoriesByMonth[monthKey], uniqByKey)
          : activityHistoriesByMonth[monthKey];

        return monthActivityHistories.length;
      });
  };

  return {
    // Data
    monthAxisLabels,
    // Methods
    getCountsByMonth,
  };
};
