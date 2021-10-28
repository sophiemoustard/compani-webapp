<template>
    <q-dialog :value="value" @hide="hide">
      <div class="modal-container-md modal-padding modal">
        <div class="title q-mb-md">Confirmation</div>
        <div class="banner row q-pa-sm q-mb-md">
          <q-icon size="sm" name="info_outline" color="orange-700" class="q-mr-sm" />
          <div>{{ start ? 'Début d\'intervention horodaté' : 'Fin d\'intervention horodatée' }}</div>
        </div>
        <div class="q-mb-md">
          Êtes-vous sûr(e) de vouloir annuler l'horodatage ? Vous pourrez ensuite modifier l'évènement.
        </div>
        <ni-input :value="reason" @input="update" caption="Motif" type="textarea" last class="q-mb-md"
          :error="validations.$error" required-field />
        <div class="row justify-end q-mb-md">
          <ni-button label="RETOUR" @click.native="hide" />
          <ni-button label="ANNULER L'HORODATAGE" @click.native="cancelTimeStamping" />
        </div>
      </div>
    </q-dialog>
</template>

<script>
import Button from '@components/Button';
import Input from '@components/form/Input';

export default {
  name: 'HistoryCancellationModal',
  components: {
    'ni-button': Button,
    'ni-input': Input,
  },
  props: {
    value: { type: Boolean, default: false },
    start: { type: Boolean, default: true },
    reason: { type: String, default: '' },
    validations: { type: Object, default: () => ({}) },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    update (event) {
      this.$emit('update:reason', event);
    },
    cancelTimeStamping () {
      this.$emit('cancelTimeStamping');
    },
  },
};
</script>

<style lang="stylus" scoped>
.modal
  @media screen and (min-width: 768px)
    width: 40vw
    max-width: 510px
  @media screen and (max-width: 768px)
    width: 80vw
    max-width: 510px
.title
  font-size: 20px
.banner
  background-color: $orange-50
  color: $orange-900
</style>
