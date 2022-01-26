import { mapGetters } from 'vuex';
import Courses from '@api/Courses';
import { NotifyNegative } from '@components/popup/notify';
import { formatIdentity } from '@helpers/utils';

export const traineeFollowUpTableMixin = {
  data () {
    const isClientInterface = !/\/ad\//.test(this.$route.path);

    return {
      learners: [],
      loading: false,
      isClientInterface,
    };
  },
  computed: {
    ...mapGetters({ company: 'main/getCompany' }),
  },
  methods: {
    formatRow (trainee) {
      const formattedName = formatIdentity(trainee.identity, 'FL');

      return {
        _id: trainee._id,
        identity: { ...trainee.identity, fullName: formattedName },
        progress: trainee.progress,
        steps: trainee.steps,
        firstMobileConnection: trainee.firstMobileConnection,
      };
    },
    async getLearnersList () {
      try {
        this.tableLoading = true;
        const course = await Courses.getFollowUp(
          this.profileId,
          this.isClientInterface ? { company: this.company._id } : null
        );

        if (course) this.learners = Object.freeze(course.trainees.map(this.formatRow));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des apprenants');
        this.learners = [];
      } finally {
        this.tableLoading = false;
      }
    },
  },
};
