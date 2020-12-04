import { formatIdentity, sortStrings, removeDiacritics } from '@helpers/utils';

export const learnerDirectoryMixin = {
  data () {
    return {
      tableLoading: false,
      pagination: { sortBy: 'name', descending: false, page: 1, rowsPerPage: 15 },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: row => row.learner,
          align: 'left',
          sortable: true,
          sort: (a, b) => sortStrings(a.lastname, b.lastname),
          style: 'min-width: 200px; width: 35%',
        },
        {
          name: 'blendedCoursesCount',
          label: 'Formations mixtes',
          field: 'blendedCoursesCount',
          align: 'center',
          sortable: true,
          style: 'min-width: 110px; width: 15%',
          sort: (a, b) => b - a,
        },
        {
          name: 'eLearningCoursesCount',
          label: 'Formations eLearning',
          field: 'eLearningCoursesCount',
          align: 'center',
          sortable: true,
          style: 'min-width: 110px; width: 15%',
          sort: (a, b) => b - a,
        },
      ],
    };
  },
  methods: {
    formatRow (user) {
      const formattedName = formatIdentity(user.identity, 'FL');

      return {
        learner: {
          _id: user._id,
          fullName: formattedName,
          lastname: user.identity.lastname,
          picture: user.picture ? user.picture.link : null,
          noDiacriticsName: removeDiacritics(formattedName),
        },
        company: user.company ? user.company.name : 'N/A',
        blendedCoursesCount: user.blendedCoursesCount,
        eLearningCoursesCount: user.eLearningCoursesCount,
      };
    },
  },
};
