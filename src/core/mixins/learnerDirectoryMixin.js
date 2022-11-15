import { sortStrings } from '@helpers/utils';
import { formatISODurationWithBestUnit } from '@helpers/dates/utils';
import CompaniDuration from '@helpers/dates/companiDurations';
import { DEFAULT_AVATAR } from '@data/constants';

export const learnerDirectoryMixin = {
  data () {
    return {
      pagination: { sortBy: 'name', descending: false, page: 1, rowsPerPage: 15 },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: row => row.learner,
          align: 'left',
          sortable: true,
          sort: (a, b) => sortStrings(a.lastname, b.lastname),
          style: 'width: 50%',
        },
        {
          name: 'blendedCoursesCount',
          label: 'Formations mixtes',
          field: 'blendedCoursesCount',
          align: 'center',
          sortable: true,
        },
        {
          name: 'eLearningCoursesCount',
          label: 'Formations eLearning',
          field: 'eLearningCoursesCount',
          align: 'center',
          sortable: true,
        },
        {
          name: 'activityHistoryCount',
          label: 'Nombre d\'activités réalisées',
          field: 'activityHistoryCount',
          align: 'center',
          sortable: true,
        },
        {
          name: 'isoDurationSinceLastActivityHistory',
          label: 'Dernière activité il y a...',
          field: 'isoDurationSinceLastActivityHistory',
          align: 'center',
          sortable: true,
          format: value => (value !== null ? formatISODurationWithBestUnit(value) : '-'),
          sort: (a, b) => (CompaniDuration(b).isLongerThan(a) ? 1 : -1),
        },
      ],
    };
  },
  methods: {
    getAvatar (link) {
      return link || DEFAULT_AVATAR;
    },
  },
};
