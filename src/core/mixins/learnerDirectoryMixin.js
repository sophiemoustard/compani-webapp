import { formatIdentity, sortStrings, removeDiacritics } from '@helpers/utils';
import Users from '@api/Users';
import moment from '@helpers/moment';

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
          style: 'width: 60%',
        },
        {
          name: 'blendedCoursesCount',
          label: 'Formations mixtes',
          field: 'blendedCoursesCount',
          align: 'center',
          sortable: true,
          style: 'width: 10%',
        },
        {
          name: 'eLearningCoursesCount',
          label: 'Formations eLearning',
          field: 'eLearningCoursesCount',
          align: 'center',
          sortable: true,
          style: 'width: 10%',
        },
        {
          name: 'activityHistoryCount',
          label: 'Nombre d\'activités réalisées',
          field: 'activityHistoryCount',
          align: 'center',
          sortable: true,
          style: 'width: 10%',
        },
        {
          name: 'lastActivityHistory',
          label: 'Dernière activité il y a...',
          field: 'lastActivityHistory',
          align: 'center',
          sortable: true,
          style: 'width: 10%',
        },
      ],
    };
  },
  methods: {
    formatRow (user) {
      const formattedName = formatIdentity(user.identity, 'FL');

      const formatedLastActivityHistory = user.lastActivityHistory
        ? `${moment(moment().diff(moment(user.lastActivityHistory.updatedAt))).format('d')} jour(s)`
        : 'jamais';

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
        lastActivityHistory: formatedLastActivityHistory,
      };
    },
    async getLearnerList (companyId = null) {
      try {
        this.tableLoading = true;
        const learners = await Users.learnerList(companyId ? { company: companyId } : null);
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
