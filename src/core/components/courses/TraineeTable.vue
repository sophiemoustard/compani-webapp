<template>
  <div>
    <div class="q-mb-xl">
      <div class="row">
        <p class="text-weight-bold table-title">{{ tableTitle }}</p>
        <ni-button class="q-mb-md" icon="content_copy" label="Copier les adresses e-mail" @click="copy" />
      </div>
      <q-card>
        <ni-responsive-table :data="course.trainees" :columns="traineesColumns" v-model:pagination="traineesPagination"
          :visible-columns="traineesVisibleColumns" :loading="tableLoading">
          <template #body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <ni-button icon="edit" @click="openTraineeEditionModal(props.row)"
                      :disable="!!course.archivedAt" />
                    <ni-button icon="close" @click="validateTraineeDeletion(col.value)"
                      :disable="!!course.archivedAt" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right" v-if="canEdit">
          <ni-button color="primary" icon="add" label="Ajouter une personne" :disable="loading"
            @click="openTraineeCreationModal" />
        </q-card-actions>
      </q-card>
    </div>

    <trainee-addition-modal v-model="traineeAdditionModal" v-model:new-trainee="newTrainee" @submit="addTrainee"
      :validations="traineeValidation.newTrainee" :loading="traineeModalLoading" @hide="resetTraineeAdditionForm"
      :trainees-options="traineesOptions" @open-learner-creation-modal="openLearnerCreationModal" />

    <trainee-edition-modal v-model="traineeEditionModal" v-model:edited-trainee="editedTrainee" @submit="updateTrainee"
      @hide="resetTraineeEditionForm" :loading="traineeModalLoading" :validations="traineeValidation.editedTrainee" />

    <learner-creation-modal v-model="learnerCreationModal" v-model:new-user="newLearner" display-company
      @hide="resetLearnerCreationModal" :first-step="firstStep" @next-step="nextStepLearnerCreationModal"
      :company-options="companyOptions" :disable-company="disableCompany" :learner-edition="learnerAlreadyExists"
      :validations="learnerValidation.newLearner" :loading="learnerCreationModalLoading"
      @submit="submitLearnerCreationModal" />
  </div>
</template>

<script>
import { copyToClipboard } from 'quasar';
import { onMounted, computed, ref } from 'vue';
import { useStore, mapState, mapGetters } from 'vuex';
import { useRouter } from 'vue-router';
import get from 'lodash/get';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import Users from '@api/Users';
import Companies from '@api/Companies';
import Courses from '@api/Courses';
import { INTER_B2B, TRAINER, INTRA, DEFAULT_AVATAR } from '@data/constants';
import {
  formatPhone,
  formatPhoneForPayload,
  formatIdentity,
  formatAndSortOptions,
} from '@helpers/utils';
import Button from '@components/Button';
import ResponsiveTable from '@components/table/ResponsiveTable';
import TraineeEditionModal from '@components/courses/TraineeEditionModal';
import TraineeAdditionModal from '@components/courses/TraineeAdditionModal';
import LearnerCreationModal from '@components/courses/LearnerCreationModal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { userMixin } from '@mixins/userMixin';
import { courseMixin } from '@mixins/courseMixin';
import { useLearners } from '@composables/learners';

export default {
  name: 'TraineeTable',
  mixins: [userMixin, courseMixin],
  props: {
    canEdit: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-button': Button,
    'ni-responsive-table': ResponsiveTable,
    'trainee-edition-modal': TraineeEditionModal,
    'trainee-addition-modal': TraineeAdditionModal,
    'learner-creation-modal': LearnerCreationModal,
  },
  emits: ['refresh'],
  setup () {
    const $store = useStore();
    const $router = useRouter();
    const potentialTrainees = ref([]);
    const company = computed(() => $store.getters['main/getCompany']);
    const course = computed(() => $store.state.course.course);
    const loggedUser = computed(() => $store.state.main.loggedUser);

    const isClientInterface = !/\/ad\//.test($router.currentRoute.value.path);

    const getPotentialTrainees = async () => {
      try {
        let query;

        if (course.value.type === INTRA) query = { company: get(course.value, 'company._id') };
        if (course.value.type === INTER_B2B) {
          query = isClientInterface ? { company: get(loggedUser.value, 'company._id') } : { hasCompany: true };
        }

        potentialTrainees.value = Object.freeze(await Users.learnerList(query));
      } catch (error) {
        potentialTrainees.value = [];
        console.error(error);
      }
    };

    const refresh = async () => getPotentialTrainees();
    const {
      searchStr,
      newLearner,
      newTrainee,
      traineeAdditionModal,
      editedTrainee,
      learnerCreationModal,
      learnerCreationModalLoading,
      firstStep,
      userAlreadyHasCompany,
      learnerAlreadyExists,
      tableLoading,
      learnerValidation,
      traineeValidation,
      goToNextStep,
      getLearnerList,
      submitLearnerCreationModal,
      resetLearnerCreationModal,
    } = useLearners(refresh, false, company);

    onMounted(async () => {
      await getLearnerList(company.value._id);
      await getPotentialTrainees();
    });

    const setNewLearner = (user) => {
      newLearner.value._id = user._id;
      newLearner.value.identity = {
        firstname: get(user, 'identity.firstname'),
        lastname: get(user, 'identity.lastname'),
      };
      newLearner.value.contact = { phone: get(user, 'contact.phone') };

      if (get(user, 'company._id')) newLearner.value.company = get(user, 'company._id');
      else if (course.value.type === INTRA) newLearner.value.company = course.value.company._id;
    };

    const nextStepLearnerCreationModal = async () => {
      try {
        learnerValidation.value.newLearner.$touch();
        if (learnerValidation.value.newLearner.local.email.$error) return NotifyWarning('Champ invalide.');

        learnerCreationModalLoading.value = true;
        const userInfo = await Users.exists({ email: newLearner.value.local.email });

        if (!userInfo.exists) {
          if (course.value.type === INTRA) newLearner.value.company = course.value.company._id;

          return goToNextStep();
        }

        const user = await Users.getById(userInfo.user._id);

        const isHelperOrAuxiliaryWithoutCompany = ['helper', 'auxiliary_without_company']
          .includes(get(user, 'role.client.name'));
        if (isHelperOrAuxiliaryWithoutCompany && course.value.type === INTRA) {
          return NotifyNegative('Cette personne ne peut pas être ajoutée à la formation.');
        }
        if (course.value.type === INTRA && get(user, 'company._id') && user.company._id !== course.value.company._id) {
          return NotifyNegative('L\'apprenant(e) existe déjà et n\'est pas relié(e) à la bonne structure.');
        }

        setNewLearner(user);
        userAlreadyHasCompany.value = !!get(user, 'company._id');
        learnerAlreadyExists.value = true;

        return goToNextStep();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout de l\'apprenant(e).');
      } finally {
        learnerCreationModalLoading.value = false;
      }
    };

    return {
      // Data
      searchStr,
      newLearner,
      firstStep,
      userAlreadyHasCompany,
      tableLoading,
      learnerCreationModalLoading,
      learnerCreationModal,
      learnerAlreadyExists,
      potentialTrainees,
      traineeAdditionModal,
      newTrainee,
      editedTrainee,
      // Validations
      learnerValidation,
      traineeValidation,
      // Methods
      nextStepLearnerCreationModal,
      submitLearnerCreationModal,
      resetLearnerCreationModal,
    };
  },
  data () {
    return {
      traineesColumns: [
        {
          name: 'company',
          label: 'Structure',
          align: 'left',
          field: row => get(row, 'company.name') || '',
          classes: 'text-capitalize',
        },
        {
          name: 'firstname',
          label: 'Prénom',
          align: 'left',
          field: row => get(row, 'identity.firstname') || '',
          classes: 'text-capitalize',
        },
        {
          name: 'lastname',
          label: 'Nom',
          align: 'left',
          field: row => get(row, 'identity.lastname') || '',
          classes: 'text-capitalize',
        },
        { name: 'email', label: 'Email', align: 'left', field: row => get(row, 'local.email') || '' },
        {
          name: 'phone',
          label: 'Téléphone',
          align: 'left',
          field: row => get(row, 'contact.phone') || '',
          format: formatPhone,
        },
        { name: 'actions', label: '', align: 'left', field: '_id' },
      ],
      traineesPagination: { rowsPerPage: 0, sortBy: 'lastname' },
      traineeEditionModal: false,
      traineeModalLoading: false,
      companyOptions: [],
    };
  },
  computed: {
    ...mapState('course', ['course']),
    ...mapGetters({ vendorRole: 'main/getVendorRole', company: 'main/getCompany' }),
    isTrainer () {
      return this.vendorRole === TRAINER;
    },
    traineesNumber () {
      return this.course.trainees ? this.course.trainees.length : 0;
    },
    tableTitle () {
      return this.canEdit || this.isTrainer
        ? `Stagiaires (${this.traineesNumber})`
        : `Stagiaires de votre structure (${this.traineesNumber})`;
    },
    traineesVisibleColumns () {
      const visibleColumns = ['firstname', 'lastname', 'email', 'phone'];
      if (this.canEdit) visibleColumns.push('actions');

      return this.isIntraCourse ? visibleColumns : ['company', ...visibleColumns];
    },
    traineesEmails () {
      if (!this.course.trainees) return '';

      return this.course.trainees.map(trainee => trainee.local.email).reduce((acc, value) => `${acc},${value}`, '');
    },
    traineesOptions () {
      return this.potentialTrainees
        .map(pt => ({
          value: pt._id,
          label: formatIdentity(pt.identity, 'FL'),
          email: pt.local.email || '',
          picture: get(pt, 'picture.link') || DEFAULT_AVATAR,
          ...(!this.isIntraCourse && { company: get(pt, 'company.name') || '' }),
          additionalFilters: [pt.local.email],
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    disableCompany () {
      return this.course.type === INTRA || this.userAlreadyHasCompany;
    },
  },
  methods: {
    resetTraineeAdditionForm () {
      this.newTrainee = '';
      this.traineeValidation.newTrainee.$reset();
    },
    async addTrainee () {
      try {
        this.traineeModalLoading = true;
        this.traineeValidation.newTrainee.$touch();
        if (this.traineeValidation.newTrainee.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Courses.addTrainee(this.course._id, { trainee: this.newTrainee });
        this.traineeAdditionModal = false;
        this.$emit('refresh');
        NotifyPositive('Stagiaire ajouté(e).');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du/de la stagiaire.');
      } finally {
        this.traineeModalLoading = false;
      }
    },
    async openTraineeEditionModal (trainee) {
      this.editedTrainee = {
        ...this.editedTrainee,
        ...pick(trainee, ['_id', 'identity.firstname', 'identity.lastname', 'local.email', 'contact.phone']),
      };
      this.traineeEditionModal = true;
    },
    resetTraineeEditionForm () {
      this.traineeValidation.editedTrainee.$reset();
      this.editedTrainee = { identity: {}, local: {}, contact: {} };
    },
    async updateTrainee () {
      try {
        this.traineeModalLoading = true;
        this.traineeValidation.editedTrainee.$touch();
        if (this.traineeValidation.editedTrainee.$error) return NotifyWarning('Champ(s) invalide(s)');
        if (get(this.editedTrainee, 'contact.phone')) {
          this.editedTrainee.contact.phone = formatPhoneForPayload(this.editedTrainee.contact.phone);
        }

        await Users.updateById(this.editedTrainee._id, omit(this.editedTrainee, ['_id', 'local']));
        this.traineeEditionModal = false;
        this.$emit('refresh');
        NotifyPositive('Stagiaire modifié(e).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification du/de la stagiaire.');
      } finally {
        this.traineeModalLoading = false;
      }
    },
    validateTraineeDeletion (traineeId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir retirer le/la stagiaire de la formation ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteTrainee(traineeId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteTrainee (traineeId) {
      try {
        await Courses.deleteTrainee(this.course._id, traineeId);
        this.$emit('refresh');
        NotifyPositive('Stagiaire supprimé(e).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du/de la stagiaire.');
      }
    },
    copy () {
      copyToClipboard(this.traineesEmails)
        .then(() => NotifyPositive('Adresses mail copiées !'))
        .catch(() => NotifyNegative('Erreur lors de la copie des emails.'));
    },
    openTraineeCreationModal () {
      if (this.course.archivedAt) {
        return NotifyWarning('Vous ne pouvez pas ajouter de stagiaire à une formation archivée.');
      }

      this.traineeAdditionModal = true;
    },
    async openLearnerCreationModal () {
      this.traineeAdditionModal = false;
      this.learnerCreationModal = true;
      await this.refreshCompanies();
    },
    async refreshCompanies () {
      try {
        const companies = await Companies.list();
        this.companyOptions = formatAndSortOptions(companies, 'name');
      } catch (e) {
        console.error(e);
        this.companyOptions = [];
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.table-title
  flex: 1
</style>
