import get from 'lodash/get';
import { clear, removeEmptyProps, formatPhoneForPayload } from '@helpers/utils';
import Users from '@api/Users';
import Email from '@api/Email';
import { TRAINEE, INTRA } from '@data/constants';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
import { required, email, requiredIf } from 'vuelidate/lib/validators';

export const learnerCreationMixin = {
  data () {
    const isClientInterface = !/\/ad\//.test(this.$router.currentRoute.path);
    const isBlendedCourseProfile = !/\/learners/.test(this.$router.currentRoute.path);

    return {
      isClientInterface,
      firstStep: true,
      learnerCreationModal: false,
      learnerCreationModalLoading: false,
      newLearner: {
        identity: { firstname: '', lastname: '' },
        contact: { phone: '' },
        local: { email: '' },
        company: '',
      },
      learnerList: [],
      isBlendedCourseProfile,
      learnerAlreadyExists: false,
    };
  },
  validations () {
    return {
      newLearner: {
        identity: { lastname: { required } },
        local: { email: { required, email } },
        contact: { phone: { required, frPhoneNumber } },
        company: { required: requiredIf(() => !this.isClientInterface) },
      },
      newTrainee: { required },
      editedTrainee: {
        identity: { lastname: { required } },
        contact: { phone: { required, frPhoneNumber } },
      },
    };
  },
  methods: {
    resetLearnerCreationModal () {
      this.firstStep = true;
      this.newLearner = { ...clear(this.newLearner) };
      this.$v.newLearner.$reset();
      this.userAlreadyHasCompany = false;
    },
    formatUserPayload () {
      const payload = removeEmptyProps(this.newLearner);
      if (get(payload, 'contact.phone')) payload.contact.phone = formatPhoneForPayload(this.newLearner.contact.phone);

      return this.isClientInterface ? { ...payload, company: this.company._id } : payload;
    },
    setNewLearner (user) {
      this.newLearner._id = user._id;
      this.newLearner.identity = {
        firstname: get(user, 'identity.firstname'),
        lastname: get(user, 'identity.lastname'),
      };
      this.newLearner.contact = { phone: get(user, 'contact.phone') };
    },
    async nextStepLearnerCreationModal () {
      try {
        this.$v.newLearner.$touch();
        if (this.$v.newLearner.local.email.$error) return NotifyWarning('Champ invalide.');

        this.learnerCreationModalLoading = true;
        const userInfo = await Users.exists({ email: this.newLearner.local.email });
        this.learnerAlreadyExists = userInfo.exists;
        if (!userInfo.exists) {
          if (this.isBlendedCourseProfile) {
            if (this.course.type === INTRA) this.newLearner.company = this.course.company._id;
          }

          return this.goToCreationStep();
        }

        if (this.isBlendedCourseProfile) {
          const user = await Users.getById(userInfo.user._id);
          if (['helper', 'auxiliary_without_company'].includes(get(user, 'role.client.name')) &&
            this.course.type === INTRA) {
            return NotifyNegative('Cette personne ne peut pas être ajoutée à la formation.');
          }
          if (get(user, 'company._id')) this.newLearner.company = get(user, 'company._id');
          if (this.course.type === INTRA && !this.newLearner.company) this.newLearner.company = this.course.company._id;
          if (this.course.type === INTRA && this.newLearner.company !== this.course.company._id) {
            return NotifyNegative('L\'apprenant(e) existe déjà et n\'est pas relié(e) à la bonne structure.');
          }

          this.setNewLearner(user);
          this.userAlreadyHasCompany = !!get(user, 'company._id');

          return this.goToCreationStep();
        }

        if (this.isClientInterface) {
          if (!get(userInfo, 'user.company') && userInfo.user._id) return this.updateLearner(userInfo.user._id);
          if (get(userInfo, 'user.company') !== this.company._id) {
            return NotifyNegative('L\'apprenant(e) n\'est pas relié(e) à cette structure.');
          }
        }

        NotifyWarning('L\'apprenant(e) est déjà ajouté(e).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout de l\'apprenant(e).');
      } finally {
        this.learnerCreationModalLoading = false;
      }
    },
    goToCreationStep () {
      this.firstStep = false;
      this.$v.newLearner.$reset();
    },
    async createLearner () {
      try {
        this.$v.newLearner.$touch();
        if (this.$v.newLearner.$error) return NotifyWarning('Champ(s) invalide(s).');

        const payload = await this.formatUserPayload();
        await Users.create(payload);
        NotifyPositive('Apprenant(e) ajouté(e) avec succès.');

        await this.sendWelcome();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout de l\' apprenant(e).');
      }
    },
    async sendWelcome () {
      try {
        await Email.sendWelcome({ email: this.newLearner.local.email, type: TRAINEE });
        NotifyPositive('Email envoyé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'envoi du mail.');
      }
    },
  },
};
