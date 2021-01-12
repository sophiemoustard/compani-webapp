import escapeRegExp from 'lodash/escapeRegExp';
import { removeDiacritics } from '@helpers/utils';
import moment from '@helpers/moment';

export const eLearningCourseDirectoryMixin = {
  data () {
    return {
      courses: [],
      tableLoading: false,
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'name',
          align: 'left',
          sortable: true,
          style: 'min-width: 200px; width: 70%',
        },
        {
          name: 'createdAt',
          label: 'Créée le...',
          field: 'createdAt',
          align: 'left',
          sortable: true,
          format: value => moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => new Date(b) - new Date(a),
          style: 'min-width: 110px; width: 10%',
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
