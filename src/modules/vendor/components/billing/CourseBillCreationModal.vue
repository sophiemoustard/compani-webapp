<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Nouvelle <span class="text-weight-bold">facture</span>
    </template>
    <div>{{ getCourseName }} </div>
    <div class="trainees">{{ getTraineesQuantity }} </div>
    <ni-select in-modal caption="Payeur" :options="payerOptions" :model-value="newBill.payer" required-field
      @update:model-value="update($event, 'payer')" />
    <ni-input in-modal :caption="course.type === INTRA ? 'Prix du programme' : 'Prix par stagiaire'"
      :error="validations.mainFee.price.$error" type="number" :model-value="newBill.mainFee.price"
      @blur="validations.mainFee.price.$touch" suffix="€" required-field :error-message="errorMessages.price"
      @update:model-value="update($event, 'mainFee.price')" />
    <ni-input in-modal caption="Quantité" :error="validations.mainFee.count.$error" type="number"
      :model-value="newBill.mainFee.count" @blur="validations.mainFee.count.$touch" required-field
      :error-message="errorMessages.count" @update:model-value="update($event, 'mainFee.count')" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Créer la facture" icon-right="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Button from '@components/Button';
import Select from '@components/form/Select';
import get from 'lodash/get';
import set from 'lodash/set';
import { INTRA } from '@data/constants';
import { formatQuantity } from '@helpers/utils';

export default {
  name: 'CourseBillCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newBill: { type: Object, default: () => ({}) },
    payerOptions: { type: Array, default: () => [] },
    errorMessages: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    course: { type: Object, default: () => ({}) },
    company: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-button': Button,
    'ni-select': Select,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-bill'],
  data () {
    return { INTRA };
  },
  computed: {
    getCourseName () {
      return `${get(this.company, 'name')} - ${get(this.course, 'subProgram.program.name')}
          ${get(this.course, 'misc') ? ` - ${get(this.course, 'misc')}` : ''}`;
    },
    getTraineesQuantity () {
      const traineesQuantity = get(this.course, 'trainees')
        .filter(trainee => trainee.company._id === this.company._id).length;

      return `${formatQuantity('stagiaire', traineesQuantity)} de ${get(this.company, 'name')}
        sont inscrits à cette formation`;
    },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (event, path) {
      this.$emit('update:new-bill', set({ ...this.newBill }, path, event));
    },
  },
};
</script>

<style lang="sass" scoped>
.trainees
  color: $copper-grey-500
  font-size: 14px
  margin-bottom: 16px
</style>
