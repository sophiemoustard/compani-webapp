import { sortStrings } from '@helpers/utils';
import { formatDateDiff } from '@helpers/date';
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
          name: 'daysSinceLastActivityHistory',
          label: 'Dernière activité il y a...',
          field: 'daysSinceLastActivityHistory',
          align: 'center',
          sortable: true,
          format: value => (value !== null ? formatDateDiff(value) : '-'),
          sort: (a, b) => b - a,
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
