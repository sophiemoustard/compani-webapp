<template>
  <ni-modal :value="customerAbsenceEditionModal" title="Editer l'absence du bénéficiaire" />
</template>

<script>
import Modal from '@components/modal/Modal';

export default {
  name: 'CustomerAbsenceEditionModal',
  components: {
    'ni-modal': Modal,
  },
  props: {
    editedCustomerAbsence: { type: Object, default: () => ({}) },
    customerAbsenceEditionModal: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
  },
  methods: {
  },
};

</script>

<style lang="stylus" scoped>
/deep/ .q-option-group--inline
    .q-radio
      padding-bottom: 0px !important
</style>
