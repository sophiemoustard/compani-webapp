import Courses from '@api/Courses';
import { sortStrings, formatIdentity } from '@helpers/utils';
import { E_LEARNING } from '@data/constants.js';
import { NotifyNegative } from '@components/popup/notify';

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
    async getLearnersList () {
      try {
        this.tableLoading = true;
        const course = await Courses.getFollowUp(this.profileId);

        if (course) this.learners = Object.freeze(course.trainees.map(this.formatRow));
        return course;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des formations');
        this.learners = [];
      } finally {
        this.tableLoading = false;
      }
    },
  },
};
