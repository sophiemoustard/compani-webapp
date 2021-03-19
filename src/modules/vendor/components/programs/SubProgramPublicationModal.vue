<template>
  <ni-modal :value="value" @hide="hide" @input="input" container-class="modal-container-md">
    <template slot="title">
      Définir une <span class="text-weight-bold">règle d'accès</span>
    </template>
    <ni-option-group v-model="access" :options="ACCESS_OPTIONS" inline type="radio" @input="resetAccess" />
    <template v-if="access === RESTRICTED_ACCESS">
      <span class="text-italic">
        Seuls les apprenants de la structure choisie auront accès à la formation.
        Tu pourras modifier et rajouter des règles d’accès par la suite.
      </span>
      <ni-select class="select" in-modal v-model="accessCompany" required-field caption="Structure"
        :options="companyOptions" />
    </template>
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Publier avec cette règle d'accès" color="primary"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import OptionGroup from '@components/form/OptionGroup';
import Select from '@components/form/Select';
import { FREE_ACCESS, RESTRICTED_ACCESS, ACCESS_OPTIONS } from '@data/constants';

export default {
  name: 'SubProgramPublicationModal',
  props: {
    value: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    companyOptions: { type: Array, default: () => [] },
  },
  components: {
    'ni-modal': Modal,
    'ni-option-group': OptionGroup,
    'ni-select': Select,
  },
  data () {
    return {
      access: FREE_ACCESS,
      RESTRICTED_ACCESS,
      ACCESS_OPTIONS,
      accessCompany: '',
    };
  },
  methods: {
    hide () {
      this.access = FREE_ACCESS;
      this.accessCompany = '';
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit', this.accessCompany);
    },
    resetAccess () {
      this.accessCompany = '';
    },
  },
};
</script>

<style lang="stylus" scoped>
  .select
    margin-top: 32px
</style>
