<template>
  <q-page padding class="vendor-background" v-if="activity">
    <ni-profile-header :title="activity.name">
      <template v-slot:body>
        <div class="row profile-info q-pl-lg">
          <q-item v-for="info of headerInfo" class="col-md-6 col-xs-12" :key="info.icon">
            <q-item-section side><q-icon size="xs" :name="info.icon"/></q-item-section>
            <q-item-section>{{ info.label }}</q-item-section>
          </q-item>
        </div>
      </template>
    </ni-profile-header>
    <div class="row body">
      <ni-card-container ref="cardContainer" class="col-md-3 col-sm-4 col-xs-6" :cards="activity.cards"
        @add="openCardCreationModal" />
      <ni-card-edition class="col-md-9 col-sm-8 col-xs-6" />
    </div>

    <!-- Card creation modal -->
    <ni-modal v-model="cardCreationModal" @hide="resetCardCreationModal">
      <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">carte</span>
      </template>
      <h6 class="text-weight-bold">Cours</h6>
      <div class="row q-mb-xl">
        <div v-for="template in templateTypes" :key="template.value" @click="selectTemplateInModal(template.value)"
          :class="getClassForTemplateInModal(template.value)">
          <div class="text-weight-bold card-button-content">{{ template.label }}</div>
        </div>
      </div>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer la carte" color="primary" :loading="modalLoading"
          icon-right="add" @click="createCard" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import { required } from 'vuelidate/lib/validators';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import CardContainer from 'src/modules/vendor/components/programs/CardContainer';
import CardEdition from 'src/modules/vendor/components/programs/CardEdition';
import Modal from '@components/modal/Modal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import Activities from '@api/Activities';
import Programs from '@api/Programs';
import { TEMPLATE_TYPES } from '@data/constants';
export default {
  name: 'ActivityProfile',
  metadata: { title: 'Fiche activité' },
  props: {
    activityId: { type: String },
    programId: { type: String },
    stepId: { type: String },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'ni-card-container': CardContainer,
    'ni-card-edition': CardEdition,
    'ni-modal': Modal,
  },
  data () {
    return {
      programName: '',
      stepName: '',
      modalLoading: false,
      cardCreationModal: false,
      templateTypes: TEMPLATE_TYPES,
      newCard: { template: '' },
    };
  },
  validations () {
    return {
      newCard: { template: { required } },
    };
  },
  computed: {
    ...mapState('program', ['activity']),
    headerInfo () {
      const infos = [
        { icon: 'library_books', label: this.programName },
        { icon: 'book', label: this.stepName },
      ]

      return infos;
    },
  },
  async created () {
    try {
      await this.refreshActivity();

      const program = await Programs.getById(this.programId);
      this.programName = get(program, 'name') || '';

      const step = program.steps.find(s => s._id === this.stepId);
      this.stepName = get(step, 'name') || '';
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async refreshActivity () {
      try {
        await this.$store.dispatch('program/fetchActivity', { activityId: this.activityId });
      } catch (e) {
        console.error(e);
      }
    },
    openCardCreationModal (stepId) {
      this.cardCreationModal = true;
    },
    getClassForTemplateInModal (template) {
      return ['card-button', 'cursor-pointer', { 'card-button-selected': this.newCard.template === template }]
    },
    selectTemplateInModal (template) {
      this.newCard.template = template;
    },
    async createCard () {
      try {
        this.modalLoading = true;
        this.$v.newCard.$touch();
        if (this.$v.newCard.$error) return NotifyWarning('Champ(s) invalide(s)');
        await Activities.addCard(this.activityId, this.newCard);
        NotifyPositive('Carte créée.');
        this.$refs.cardContainer.scrollDown();

        this.refreshActivity();
        this.cardCreationModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de la carte.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetCardCreationModal () {
      this.newCard = { template: '' };
      this.$v.newCard.$reset();
    },
  },
}
</script>

<style lang="stylus" scoped>
.q-page
  display: flex
  flex-direction: column

.body
  flex: 1

.q-item
  padding: 0
  min-height: 0

h6
  margin-bottom: 3px

.q-page
  display: flex
  flex-direction: column

.cards-container
  flex: 1

.card-button
  background-color: $light-grey
  color: $dark-grey
  border-radius: 10px
  height: 130px
  width: 100px
  display: flex
  align-items: center
  justify-content: center
  margin: 3px 7px
  &-selected
    background-color: $dark-grey
    color: $light-grey
  &-content
    text-align: center
    flex-wrap: wrap
</style>
