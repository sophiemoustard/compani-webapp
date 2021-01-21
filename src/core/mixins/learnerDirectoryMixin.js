import { formatIdentity, sortStrings, removeDiacritics } from '@helpers/utils';
import Users from '@api/Users';
import { formatQuantity } from '../helpers/utils';
import { dateDiff } from '../helpers/date';

export const learnerDirectoryMixin = {
  data () {
    return {
      tableLoading: false,
      learnerList: [],
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
          format: value => (value !== null ? formatQuantity('jour', value) : '-'),
          sort: (a, b) => b - a,
        },
      ],
    };
  },
  methods: {
    getDaysSinceLastActivityHistory (lastActivityHistory) {
      if (!lastActivityHistory) return null;

      return dateDiff(Date.now(), lastActivityHistory.updatedAt);
    },
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
        activityHistoryCount: user.activityHistoryCount,
        daysSinceLastActivityHistory: this.getDaysSinceLastActivityHistory(user.lastActivityHistory),
      };
    },
    async getLearnerList (companyId = null) {
      try {
        this.tableLoading = true;
        const learners = await Users.learnerList(companyId ? { company: companyId } : {});
        this.learnerList = Object.freeze(learners.map(this.formatRow));
      } catch (e) {
        console.error(e);
        this.learnerList = [];
      } finally {
        this.tableLoading = false;
      }
    },
  },
};
