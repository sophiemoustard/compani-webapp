import { sortStrings, formatIdentity } from '@helpers/utils';
import { E_LEARNING } from '@data/constants.js';

export const eLearningCourseProfileMixin = {
  data () {
    return {
      tableLoading: false,
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'identity',
          format: value => (value ? value.fullName : ''),
          align: 'left',
          sortable: true,
          sort: (a, b) => sortStrings(a.lastname, b.lastname),
          style: 'width: 70%',
        },
        {
          name: 'progress',
          label: 'Progression',
          field: 'progress',
          align: 'center',
          sortable: true,
          style: 'min-width: 150px; width: 20%',
        },
        { name: 'expand', label: '', field: '' },
      ],
      learners: [],
      pagination: { sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 },
      E_LEARNING,
    };
  },
  methods: {
    formatRow (trainee) {
      const formattedName = formatIdentity(trainee.identity, 'FL');

      return {
        _id: trainee._id,
        identity: { ...trainee.identity, fullName: formattedName },
        progress: trainee.progress,
        steps: trainee.steps,
      };
    },
  },
};
