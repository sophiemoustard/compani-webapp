<template>
  <q-dialog :value="value" @input="cancel" @hide="hide">
    <div class="modal-container-md">
      <div class="modal-padding">
        <div class="modal-title">Confirmation</div>
        <br>
        <div>Êtes-vous sûr(e) de vouloir déverrouiller cette étape ?</div>
        <br>
        <template v-if="isStepPublished">
          <div>Cette étape est publiée, vous ne pourrez pas ajouter, supprimer ou changer l'ordre des cartes.</div>
          <br>
        </template>
        <template v-if="subProgramsGroupedByProgram.length">
          <div>Elle est utilisée dans les sous-programmes suivants :</div>
          <div>{{ subProgramsGroupedByProgram }}</div>
          <br>
        </template>
        <div>Si vous la modifiez, les changements impacteront tous les sous-programmes où elle est utilisée.</div>
      </div>
      <div class="footer">
        <q-btn no-caps flat class="modal-btn" label="ANNULER" @click="cancel" color="primary" />
        <q-btn no-caps flat class="modal-btn" label="OK" @click="confirm" color="primary" />
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { PUBLISHED } from '@data/constants';

export default {
  name: 'ValidateUnlockEditionModal',
  props: {
    value: { type: Boolean, default: false },
    subProgramsGroupedByProgram: { type: Array, default: () => [] },
    stepStatus: { type: String, default: '' },
  },
  data () {
    return {
    };
  },
  computed: {
    isStepPublished () {
      return this.stepStatus === PUBLISHED;
    },
  },
  methods: {
    cancel () {
      this.$emit('cancel');
    },
    confirm () {
      this.$emit('confirm');
    },
    hide () {
      this.$emit('hide');
    },
  },
};
</script>

<style lang="stylus" scoped>
  .footer
    display: flex
    justify-content: flex-end
    padding: 4px
</style>
