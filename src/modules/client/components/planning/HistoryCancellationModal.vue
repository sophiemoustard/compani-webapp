<template>
    <q-dialog :model-value="modelValue" @hide="hide" @update:model-value="$emit('update:model-value')">
      <div class="modal-container-md modal-padding">
        <div class="title q-mb-md">Confirmation</div>
        <ni-banner icon="info_outline" class="bg-orange-50 text-orange-900" icon-color="orange-700">
          <template #message>{{ start ? 'Début d\'intervention horodaté' : 'Fin d\'intervention horodatée' }}</template>
        </ni-banner>
        <div class="q-mb-md">
          Êtes-vous sûr(e) de vouloir annuler l'horodatage ? Vous pourrez ensuite modifier l'évènement.
        </div>
        <ni-input :model-value="reason" @update:model-value="update" caption="Motif" type="textarea" class="q-mb-md"
          :error="validations.$error" required-field last />
        <div class="row justify-end q-mb-md">
          <ni-button label="RETOUR" @click="hide" />
          <ni-button label="ANNULER L'HORODATAGE" @click="cancelTimeStamping" />
        </div>
      </div>
    </q-dialog>
</template>

<script>
import Banner from '@components/Banner';
import Button from '@components/Button';
import Input from '@components/form/Input';

export default {
  name: 'HistoryCancellationModal',
  components: {
    'ni-button': Button,
    'ni-input': Input,
    'ni-banner': Banner,
  },
  props: {
    modelValue: { type: Boolean, default: false },
    start: { type: Boolean, default: true },
    reason: { type: String, default: '' },
    validations: { type: Object, default: () => ({}) },
  },
  emits: ['hide', 'update:reason', 'cancel-time-stamping', 'update:model-value'],
  methods: {
    hide () {
      this.$emit('hide');
    },
    update (event) {
      this.$emit('update:reason', event);
    },
    cancelTimeStamping () {
      this.$emit('cancel-time-stamping');
    },
  },
};
</script>

<style lang="sass" scoped>
.title
  font-size: 20px
</style>
