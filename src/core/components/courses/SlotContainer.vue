<template>
  <div>
    <div class="q-mb-xl">
      <q-item class="slot-section-title">
        <q-item-section side>
          <q-icon color="black" size="xl" :name="formatSlotTitle.icon" flat dense/>
        </q-item-section>
        <q-item-section>
          <div class="text-weight-bold">{{ formatSlotTitle.title }}</div>
          <div class="slot-section-title-subtitle">{{ formatSlotTitle.subtitle }}</div>
        </q-item-section>
      </q-item>
      <div class="slots-cards-container row">
        <q-card class="slots-cards" v-for="(value, key, index) in courseSlots" :key="index" flat>
          <div class="slots-cards-title">
            <div class="slots-cards-number">{{ index + 1 }}</div>
            <div class="slots-cards-date text-weight-bold">{{ key }}</div>
          </div>
          <div class="slots-cards-content" v-for="slot in value" :key="slot._id">
            <div>
              <q-item>
                <q-item-section side><q-icon name="access_time" flat dense size="xs" /></q-item-section>
                <q-item-section>{{ formatSlotHour(slot) }} ({{getSlotDuration(slot)}})</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side><q-icon name="location_on" flat dense size="xs" /></q-item-section>
                <q-item-section>{{ getSlotAddress(slot) }}</q-item-section>
              </q-item>
            </div>
            <div class="row no-wrap" v-if="canEdit">
              <q-icon color="grey" size="sm" name="edit" @click="openEditionModal(slot)" />
              <q-icon color="grey" size="sm" name="delete" @click="validateDeletion(slot._id)" />
            </div>
          </div>
        </q-card>
      </div>
      <div class="q-mt-md" v-if="canEdit" align="right">
        <q-btn class="add-slot" label="Ajouter un créneau" no-caps flat color="white" icon="add"
          :disable="loading" @click="creationModal = true" />
      </div>
    </div>

    <!-- Course slot creation modal -->
    <ni-modal v-model="creationModal" @hide="resetCreationModal"
      container-class="modal-container-md">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">créneau</span>
      </template>
      <ni-datetime-range caption="Dates et heures" v-model="newCourseSlot.dates" required-field disable-end-date
        :error="$v.newCourseSlot.dates.$error" @blur="$v.newCourseSlot.dates.$touch" />
      <ni-search-address v-model="newCourseSlot.address" :error-message="addressError"
        @blur="$v.newCourseSlot.address.$touch" :error="$v.newCourseSlot.address.$error" inModal last />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter un créneau" icon-right="add" color="primary"
          :loading="modalLoading" @click="addCourseSlot" />
      </template>
    </ni-modal>

    <!-- Course slot edition modal -->
    <ni-modal v-model="editionModal" @hide="resetEditionModal" container-class="modal-container-md">
      <template slot="title">
        Editer un <span class="text-weight-bold">créneau</span>
      </template>
      <ni-datetime-range caption="Dates et heures" v-model="editedCourseSlot.dates" required-field disable-end-date
        :error="$v.editedCourseSlot.dates.$error" @blur="$v.editedCourseSlot.dates.$touch" />
      <ni-search-address v-model="editedCourseSlot.address" :error-message="addressError"
        @blur="$v.editedCourseSlot.address.$touch" :error="$v.editedCourseSlot.address.$error" inModal last />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer un créneau" icon-right="add" color="primary"
          :loading="modalLoading" @click="updateCourseSlot" />
      </template>
    </ni-modal>

  </div>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import pick from 'lodash/pick';
import { required, requiredIf } from 'vuelidate/lib/validators';
import CourseSlots from '@api/CourseSlots';
import { REQUIRED_LABEL } from '@data/constants';
import { frAddress } from '@helpers/vuelidateCustomVal.js';
import SearchAddress from '@components/form/SearchAddress';
import DateTimeRange from '@components/form/DatetimeRange';
import Modal from '@components/modal/Modal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { courseMixin } from '@mixins/courseMixin';

export default {
  name: 'SlotContainer',
  mixins: [courseMixin],
  metadata: { title: 'Fiche formation' },
  props: {
    canEdit: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-search-address': SearchAddress,
    'ni-datetime-range': DateTimeRange,
    'ni-modal': Modal,
  },
  data () {
    return {
      courseSlots: {},
      modalLoading: false,
      creationModal: false,
      newCourseSlot: {
        dates: {
          startDate: this.$moment().startOf('d').hours(9).toISOString(),
          endDate: this.$moment().startOf('d').hours(12).toISOString(),
        },
        address: {},
      },
      editedCourseSlot: {},
      editionModal: false,
      courseSlotsColumns: [
        { name: 'date', align: 'left', label: 'Dates' },
        { name: 'hours', align: 'center', label: 'Créneaux' },
        { name: 'duration', align: 'center', label: 'Durée' },
        { name: 'address', label: 'Lieu', align: 'left' },
        { name: 'actions', label: '', align: 'center' },
      ],
      courseSlotValidation: {
        dates: {
          startDate: { required },
          endDate: { required },
        },
        address: {
          zipCode: { required: requiredIf(item => item && !!item.fullAddress) },
          street: { required: requiredIf(item => item && !!item.fullAddress) },
          city: { required: requiredIf(item => item && !!item.fullAddress) },
          fullAddress: { frAddress },
        },
      },
    }
  },
  validations () {
    return {
      newCourseSlot: { ...this.courseSlotValidation },
      editedCourseSlot: { ...this.courseSlotValidation },
    }
  },
  computed: {
    ...mapState('course', ['course']),
    addressError () {
      if (!this.$v.newCourseSlot.address.fullAddress.required) {
        return REQUIRED_LABEL;
      }
      return 'Adresse non valide';
    },
    slotsDurationTitle () {
      if (!this.course || !this.course.slots) return '0h';

      const total = this.course.slots.reduce(
        (acc, slot) => acc.add(this.$moment.duration(this.$moment(slot.endDate).diff(slot.startDate))),
        this.$moment.duration()
      );

      const paddedMinutes = this.padMinutes(total.minutes());
      const hours = total.days() * 24 + total.hours();

      return paddedMinutes ? `${hours}h${paddedMinutes}` : `${hours}h`;
    },
    formatSlotTitle () {
      const slotList = Object.values(this.courseSlots);

      if (!slotList.length) {
        return { title: 'Pas de date prévue', subtitle: '', icon: 'mdi-calendar-remove' };
      }

      const firstSlot = this.$moment(slotList[0][0].startDate).format('LL');

      if (slotList.length === 1) {
        return {
          title: `1 date, ${this.slotsDurationTitle}`,
          subtitle: `le ${firstSlot}`,
          icon: 'mdi-calendar-range',
        };
      }

      const lastSlot = this.$moment(slotList[slotList.length - 1][0].startDate).format('LL');
      return {
        title: `${slotList.length} dates, ${this.slotsDurationTitle}`,
        subtitle: `du ${firstSlot} au ${lastSlot}`,
        icon: 'mdi-calendar-range',
      };
    },
  },
  watch: {
    course () {
      this.courseSlots = groupBy(this.course.slots, s => this.$moment(s.startDate).format('DD/MM/YYYY'));
    },
  },
  async created () {
    if (!this.course) this.$emit('refresh');
    else this.courseSlots = groupBy(this.course.slots, s => this.$moment(s.startDate).format('DD/MM/YYYY'));
  },
  methods: {
    getSlotDuration (slot) {
      const duration = this.$moment.duration(this.$moment(slot.endDate).diff(slot.startDate));

      const paddedMinutes = this.padMinutes(duration.minutes());

      return paddedMinutes ? `${duration.hours()}h${paddedMinutes}` : `${duration.hours()}h`;
    },
    formatSlotHour (slot) {
      return `${this.$moment(slot.startDate).format('HH:mm')} - ${this.$moment(slot.endDate).format('HH:mm')}`;
    },
    getSlotAddress (slot) {
      return get(slot, 'address.fullAddress') || 'Adresse non renseignée';
    },
    resetCreationModal () {
      this.newCourseSlot = {
        dates: {
          startDate: this.$moment().startOf('d').hours(9).toISOString(),
          endDate: this.$moment().startOf('d').hours(12).toISOString(),
        },
        address: {},
      };
      this.$v.newCourseSlot.$reset();
    },
    formatCreationPayload (courseSlot) {
      const payload = { ...courseSlot.dates, courseId: this.course._id };
      if (courseSlot.address && courseSlot.address.fullAddress) payload.address = { ...courseSlot.address };

      return payload;
    },
    openEditionModal (slot) {
      this.editedCourseSlot = {
        _id: slot._id,
        dates: pick(slot, ['startDate', 'endDate']),
        address: {},
      }
      if (slot.address) this.editedCourseSlot.address = { ...slot.address };
      this.editionModal = true;
    },
    resetEditionModal () {
      this.editedCourseSlot = {};
      this.$v.editedCourseSlot.$reset();
    },
    formatEditionPayload (courseSlot) {
      const payload = { ...courseSlot.dates, address: {} };
      if (courseSlot.address && courseSlot.address.fullAddress) payload.address = { ...courseSlot.address };

      return payload;
    },
    async addCourseSlot () {
      try {
        this.$v.newCourseSlot.$touch();
        if (this.$v.newCourseSlot.$error) return NotifyWarning('Champ(s) invalide(s).');

        this.modalLoading = true;
        await CourseSlots.create(this.formatCreationPayload(this.newCourseSlot));
        NotifyPositive('Créneau ajouté.');

        this.creationModal = false;
        this.$emit('refresh');
      } catch (e) {
        console.error(e)
        if (e.data.statusCode === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du créneau.');
      } finally {
        this.modalLoading = false;
      }
    },
    async updateCourseSlot () {
      try {
        this.$v.editedCourseSlot.$touch();
        if (this.$v.editedCourseSlot.$error) return NotifyWarning('Champ(s) invalide(s).');

        this.modalLoading = true;
        const payload = this.formatEditionPayload(this.editedCourseSlot);
        await CourseSlots.update(this.editedCourseSlot._id, payload);
        NotifyPositive('Créneau modifié.');

        this.editionModal = false;
        this.$emit('refresh');
      } catch (e) {
        console.error(e)
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la modification du créneau.');
      } finally {
        this.modalLoading = false;
      }
    },
    validateDeletion (slotId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer ce créneau ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteCourseSlot(slotId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteCourseSlot (slotId) {
      try {
        await CourseSlots.delete(slotId);
        this.$emit('refresh');
        NotifyPositive('Créneau supprimé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du créneau.')
      }
    },
  },

}
</script>

<style lang="stylus" scoped>
.slots-cards
  padding: 10px
  &-container
    grid-auto-rows: 1fr
    grid-auto-flow: row
    display: grid
    grid-gap: 20px 10px
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))
  &-number
    font-size: 12px
    border: solid 1px
    display: flex
    height: 20px
    width: 20px
    border-radius: 50%
    align-content: center
    justify-content: center
  &-title
    display: flex
    justify-content: space-between
    align-items: center
    margin: 0 10px 10px 10px
  &-date
    color: $primary
    font-size: 16px
  &-content
    margin: 5px 10px
    display: flex
    justify-content: space-between
  &-content > div > .q-item
    font-size: 14px
    padding: 0px
    min-height: auto
  &-content > div > .q-icon
    cursor: pointer

.add-slot
  background: $primary
.slot-section-title
  padding: 0;
  margin: 10px 0px
  &-subtitle
     font-style: italic
     font-size: 16px
     @media (max-width: 767px)
      font-size: 13px
</style>
