import escapeRegExp from 'lodash/escapeRegExp';
import { removeDiacritics } from '@helpers/utils';
import { formatDate, descendingSort } from '@helpers/date';

export const eLearningCourseDirectoryMixin = {
  data () {
    return {
      courses: [],
      tableLoading: false,
      columns: [
        { name: 'name', label: 'Nom', field: 'name', align: 'left', sortable: true },
        {
          name: 'traineesCount',
          label: 'Nombre d\'apprenants',
          field: 'traineesCount',
          align: 'center',
          sortable: true,
        },
        {
          name: 'createdAt',
          label: 'Créée le...',
          field: 'createdAt',
          align: 'left',
          sortable: true,
          format: formatDate,
          sort: descendingSort,
        },
      ],
      pagination: { sortBy: 'createdAt', descending: true, page: 1, rowsPerPage: 15 },
      searchStr: '',
    };
  },
  computed: {
    filteredCourses () {
      const formattedString = escapeRegExp(removeDiacritics(this.searchStr));
      return this.courses.filter(course => course.noDiacriticsName.match(new RegExp(formattedString, 'i')));
    },
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
  },
};
