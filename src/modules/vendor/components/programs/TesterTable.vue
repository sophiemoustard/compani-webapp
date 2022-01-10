<template>
  <div>
    <div class="q-mb-xl">
      <div class="row">
        <p class="text-weight-bold table-title">Testeurs</p>
      </div>
      <q-card>
        <ni-responsive-table :data="testers" :columns="columns" v-model:pagination="pagination">
          <template #body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <ni-button class="table-actions" icon="close" @click="validateTesterDeletion(col.value)" />
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <ni-button color="primary" icon="add" label="Ajouter une personne" :disable="loading"
            @click="testerCreationModal = true" />
        </q-card-actions>
      </q-card>
    </div>

    <tester-creation-modal v-model="testerCreationModal" v-model:new-tester="newTester" :validations="v$.newTester"
      :first-step="firstStep" :loading="modalLoading" @next-step="nextStepTesterCreationModal"
      @hide="resetTesterCreationModal" @submit="addTester" />
  </div>
</template>

<script>
import useVuelidate from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import get from 'lodash/get';
import { TRAINEE } from '@data/constants';
import { formatPhone } from '@helpers/utils';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
import Button from '@components/Button';
import TesterCreationModal from 'src/modules/vendor/components/programs/TesterCreationModal';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { userMixin } from '@mixins/userMixin';
import { courseMixin } from '@mixins/courseMixin';
import Email from '@api/Email';
import Programs from '@api/Programs';
import Users from '@api/Users';

export default {
  name: 'TesterTable',
  mixins: [userMixin, courseMixin],
  props: {
    programId: { type: String, required: true },
    testers: { type: Array, default: () => [] },
  },
  components: {
    'ni-button': Button,
    'tester-creation-modal': TesterCreationModal,
    'ni-responsive-table': ResponsiveTable,
  },
  emits: ['refresh'],
  setup () {
    return { v$: useVuelidate() };
  },
  data () {
    return {
      columns: [
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
        { name: 'actions', label: '', field: '_id', align: 'right' },
      ],
      loading: false,
      pagination: { rowsPerPage: 0, sortBy: 'lastname' },
      testerCreationModal: false,
      newTester: {
        local: { email: '' },
        identity: { firstname: '', lastname: '' },
        contact: { phone: '' },
      },
      firstStep: true,
      modalLoading: false,
    };
  },
  validations () {
    return {
      newTester: {
        local: { email: { required, email } },
        identity: { lastname: { required } },
        contact: { phone: { required, frPhoneNumber } },
      },
    };
  },
  methods: {
    async nextStepTesterCreationModal () {
      try {
        this.v$.newTester.local.email.$touch();
        if (this.v$.newTester.local.email.$error) return NotifyWarning('Champ(s) invalide(s).');

        this.modalLoading = true;
        const userInfo = await Users.exists({ email: this.newTester.local.email });

        if (userInfo.exists) {
          await Programs.addTester(this.programId, { local: { email: this.newTester.local.email } });

          NotifyPositive('Testeur(euse) ajouté(e) avec succès.');
          this.resetTesterCreationModal();
          this.$emit('refresh');
        } else {
          this.firstStep = false;
        }
      } catch (e) {
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du/de la testeur(euse).');
      } finally {
        this.modalLoading = false;
      }
    },
    async addTester () {
      try {
        this.v$.newTester.$touch();
        if (this.v$.newTester.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.modalLoading = true;
        await Programs.addTester(this.programId, this.newTester);
        NotifyPositive('Testeu(euse) ajouté(e) avec succès.');

        await this.sendWelcome();
        this.resetTesterCreationModal();
        this.$emit('refresh');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du/de la testeur(euse).');
      } finally {
        this.modalLoading = false;
      }
    },
    async sendWelcome () {
      try {
        await Email.sendWelcome({ email: this.newTester.local.email, type: TRAINEE });
        NotifyPositive('Email envoyé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'envoi de l\' email.');
      }
    },
    resetTesterCreationModal () {
      this.testerCreationModal = false;
      this.firstStep = true;
      this.newTester = {
        local: { email: '' },
        identity: { firstname: '', lastname: '' },
        contact: { phone: '' },
      };
      this.v$.newTester.$reset();
    },
    validateTesterDeletion (testerId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir retirer le/la testeur(euse) du programme ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteTester(testerId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteTester (testerId) {
      try {
        await Programs.removeTester(this.programId, testerId);
        this.$emit('refresh');
        NotifyPositive('Testeur(euse) supprimé(e).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du/de la testeur(euse).');
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.table-title
  flex: 1
</style>
