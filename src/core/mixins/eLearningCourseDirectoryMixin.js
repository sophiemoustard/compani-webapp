import escapeRegExp from 'lodash/escapeRegExp';
import Courses from '@api/Courses';
import { NotifyNegative } from '@components/popup/notify';
import { DD_MM_YYYY } from '@data/constants';
import { removeDiacritics } from '@helpers/utils';
import { formatDurationFromFloat } from '@helpers/date';
import CompaniDate from '@helpers/dates/companiDates';
import { ascendingSort } from '@helpers/dates/utils';

export const eLearningCourseDirectoryMixin = {
  data () {
    return {
      courses: [],
      tableLoading: false,
      columns: [
        { name: 'name', label: 'Nom', field: 'name', align: 'left', sortable: true, style: 'width: 60%' },
        {
          name: 'totalTheoreticalHours',
          label: 'Durée',
          field: 'totalTheoreticalHours',
          format: formatDurationFromFloat,
          align: 'center',
          sortable: true,
          style: 'width: 10%',
        },
        {
          name: 'traineesCount',
          label: 'Nombre d\'apprenants',
          field: 'traineesCount',
          align: 'center',
          sortable: true,
          style: 'width: 20%',
        },
        {
          name: 'createdAt',
          label: 'Créée le...',
          field: 'createdAt',
          align: 'left',
          sortable: true,
          format: value => CompaniDate(value).format(DD_MM_YYYY),
          sort: ascendingSort,
          style: 'width: 10%',
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
    async refreshCourseList (query) {
      try {
        this.tableLoading = true;
        const courseList = await Courses.list(query);

        this.courses = courseList.map(c => ({
          name: c.subProgram.program.name,
          noDiacriticsName: removeDiacritics(c.subProgram.program.name),
          createdAt: c.createdAt,
          _id: c._id,
          traineesCount: c.trainees.length || '0',
          totalTheoreticalHours: c.totalTheoreticalHours,
        }));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des formations.');
      } finally {
        this.tableLoading = false;
      }
    },
  },
};
