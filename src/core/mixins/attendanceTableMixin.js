import uniqBy from 'lodash/uniqBy';
import { INTRA } from '@data/constants';
import Users from '@api/Users';
import { formatIdentity } from '@helpers/utils';

export const attendanceTableMixin = {
  data () {
    return {
      trainees: [],
      selectedCompany: this.course.company ? this.course.company._id : '',
    };
  },
  computed: {

    traineeFilterOptions () {
      if (this.course.type === INTRA && !!this.selectedCompany) {
        const selectedCompanyTrainees = this.trainees
          .filter(trainee => trainee.company._id === this.selectedCompany)
          .map(trainee => ({
            label: formatIdentity(trainee.identity, 'FL'),
            value: { identity: trainee.identity, _id: trainee._id, external: true },
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        return [
          ...uniqBy(selectedCompanyTrainees, 'value'),
        ].filter(learner => !this.learners.map(l => l._id).includes(learner.value._id));
      }
      const allTrainees = this.trainees
        .map(trainee => ({
          label: formatIdentity(trainee.identity, 'FL'),
          value: { identity: trainee.identity, _id: trainee._id, external: true },
        }))
        .sort((a, b) => a.label.localeCompare(b.label));

      return [
        ...uniqBy(allTrainees, 'value'),
      ].filter(learner => !this.learners.map(l => l._id).includes(learner.value._id));
    },
  },
  async created () {
    if (!this.trainees.length) await this.getTrainees();
  },
  methods: {
    async getTrainees () {
      try {
        if (this.course.type === INTRA && !!this.selectedCompany) {
          const companyTrainees = await Users.learnerList({ company: this.selectedCompany });
          this.trainees = companyTrainees;
        } else {
          const trainees = await Users.learnerList({ hasCompany: true });
          this.trainees = trainees;
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
};
