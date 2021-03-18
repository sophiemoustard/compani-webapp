<template>
  <div>
    <div class="q-mb-xl">
      <div class="row">
        <p class="text-weight-bold table-title">Testeurs</p>
      </div>
      <q-card>
        <ni-responsive-table :data="testers" :columns="testersColumns" :pagination.sync="testersPagination" />
        <q-card-actions align="right">
          <ni-button color="primary" icon="add" label="Ajouter un testeur" :disable="loading"
            @click="testerCreationModal = true" />
        </q-card-actions>
      </q-card>
    </div>

    <tester-creation-modal v-model="testerCreationModal" :new-tester.sync="newTester" :validations="$v.newTester"
      :first-step="firstStep" :loading="testerCreationModalLoading" @next-step="nextStepTesterCreationModal"
      :identity-step="addnewTesterIdentityStep" @hide="resetTesterCreationModal" @submit="addTester" />
  </div>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators';
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
  name: 'TraineeTable',
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
  data () {
    return {
      testersColumns: [
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
          format: value => formatPhone(value),
        },
      ],
      loading: false,
      testersPagination: { rowsPerPage: 0, sortBy: 'lastname' },
      testerCreationModal: false,
      newTester: {
        local: { email: '' },
        identity: { firstname: '', lastname: '' },
        contact: { phone: '' },
      },
      firstStep: true,
      testerCreationModalLoading: false,
      addnewTesterIdentityStep: false,

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
        this.$v.newTester.$touch();
        if (this.$v.newTester.local.email.$error) return NotifyWarning('Champ(s) invalide(s).');

        this.testerCreationModalLoading = true;
        const userInfo = await Users.exists({ email: this.newTester.local.email });

        if (userInfo.exists) {
          await Programs.addTester(this.programId, { local: { email: this.newTester.local.email } });

          NotifyPositive('Testeur ajouté avec succès');
          this.resetTesterCreationModal();
          this.$emit('refresh');
        } else {
          this.firstStep = false;
          this.addnewTesterIdentityStep = true;
        }
      } catch (e) {
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du stagiaire.');
      } finally {
        this.testerCreationModalLoading = false;
      }
    },
    async addTester () {
      try {
        this.$v.newTester.$touch();
        if (this.$v.newTester.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.testerCreationModalLoading = true;
        await Programs.addTester(this.programId, this.newTester);
        NotifyPositive('Testeur ajouté avec succès');

        await this.sendWelcome();
        this.resetTesterCreationModal();
        this.$emit('refresh');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du testeur.');
      } finally {
        this.testerCreationModalLoading = false;
      }
    },
    async sendWelcome () {
      try {
        await Email.sendWelcome({ email: this.newTester.local.email, type: TRAINEE });
        NotifyPositive('Email envoyé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'envoi de l\' email.');
      }
    },
    resetTesterCreationModal () {
      this.testerCreationModal = false;
      this.firstStep = true;
      this.addnewTesterIdentityStep = false;
      this.newTester = {
        local: { email: '' },
        identity: { firstname: '', lastname: '' },
        contact: { phone: '' },
      };
      this.$v.newTester.$reset();
    },
  },
};
</script>

<style lang="stylus" scoped>
  .table-title
    flex: 1

</style>
