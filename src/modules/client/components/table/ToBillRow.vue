<template>
  <q-tr :props="props" :class="{'border-top': index === 0 }">
    <q-td v-for="col in props.cols" :key="col.name" :props="props" :data-cy="`col-${col.name}`"
      :style="{width: col.name === 'externalBilling' ? '100px' : '200px'}">
      <template v-if="index === 0 && col.name === 'externalBilling' && bill.thirdPartyPayer">
        <q-checkbox :model-value="bill.externalBilling" color="copper-grey-400" dense
          @update:model-value="update($event, 'externalBilling')" />
      </template>
      <template v-if="index === 0 && col.name === 'customer'">
        <span class="uppercase text-weight-bold">
          {{ col.value }}
        </span>
      </template>
      <template v-else-if="index === 0 && col.name === 'client'">
        <span class="uppercase text-weight-bold">
          {{ getClientName(props.row.customer, bill) }}
        </span>
      </template>
      <template v-else-if="index === 0 && col.name === 'startDate'">
        <div class="cursor-pointer text-primary">
          {{ formatDate(bill.startDate) }}
          <q-menu>
            <q-date :model-value="bill.startDate" :options="startDateOptions" mask="YYYY-MM-DD" minimal
              @update:model-value="updateDate($event, 'startDate')" no-unset />
          </q-menu>
        </div>
      </template>
      <template v-else-if="col.name === 'endDate'">{{ formatDate(bill.endDate) }}</template>
      <template v-else-if="col.name === 'service'">
        <template v-if="!bill.subscription">{{ bill.billingItem.name }}</template>
        <template v-else>{{ getLastVersion(bill.subscription.service.versions, 'createdAt').name }}</template>
      </template>
      <template v-else-if="col.name === 'hours'">
        <template v-if="!bill.subscription">{{ bill.eventsList.length }}</template>
        <template v-else>{{ formatHours(bill) }}</template>
      </template>
      <template v-else-if="col.name === 'unitExclTaxes'">{{ formatStringToPrice(bill.unitExclTaxes) }}</template>
      <template v-else-if="col.name === 'discount'">
        <ni-editable-td :props="bill" edited-field="discount" edition-boolean-name="discountEdition"
          :value="formatPrice(bill.discount)" @disable="disableDiscountEditing(bill)" :ref-name="bill._id"
          @click="$emit('discount-click', $event)" @change="setDiscount" suffix="€"
          :error="v$.discount.$error" error-message="Nombre invalide" />
          {{ v$.discount.$error }}
      </template>
      <template v-else-if="col.name === 'exclTaxes'">{{ formatPrice(getNetExclTaxes(bill)) }}</template>
      <template v-else-if="col.name === 'inclTaxes'">{{ formatPrice(getNetInclTaxes(bill)) }}</template>
      <template v-else-if="index === 0">{{ col.value }}</template>
    </q-td>
    <q-td data-cy="col-selected-bill">
      <q-checkbox v-if="index === 0 && displayCheckbox" :model-value="selected" dense
        @update:model-value="$emit('update:selected', $event)" />
    </q-td>
  </q-tr>
</template>

<script>
import EditableTd from '@components/table/EditableTd';
import {
  formatPrice,
  getLastVersion,
  formatIdentity,
  truncate,
  formatStringToPrice,
  toCents,
  toEuros,
} from '@helpers/utils';
import { divide, add } from '@helpers/numbers';
import { formatDate, isSameOrBefore } from '@helpers/date';
import { FIXED } from '@data/constants';
import { useMeta } from 'quasar';
import { ref, computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { positiveNumber, fractionDigits } from '@helpers/vuelidateCustomVal';

export default {
  name: 'ToBillRow',
  components: {
    'ni-editable-td': EditableTd,
  },
  props: {
    props: { type: Object, default: () => ({}) },
    selected: { type: Boolean, default: false },
    bill: { type: Object, default: () => ({}) },
    index: { type: Number, default: () => 0 },
    displayCheckbox: { type: Boolean, default: () => false },
  },
  emits: ['discount-click', 'update:selected', 'discount-input', 'update:bill', 'datetime-input'],
  setup (props, { emit }) {
    const MetaInfo = { title: 'A facturer' };
    useMeta(MetaInfo);

    const discount = ref(0);

    const formatHours = (bill) => {
      if (bill.subscription.service && bill.subscription.service.nature === FIXED) return bill.eventsList.length;

      return bill.hours ? `${parseFloat(bill.hours).toFixed(2)}h` : '';
    };

    const getClientName = (customer, bill) => {
      if (!bill.thirdPartyPayer) return formatIdentity(customer.identity, 'Lf');
      return truncate(bill.thirdPartyPayer.name, 35);
    };

    const getExclTaxesDiscount = (bill) => {
      const vat = divide(bill.vat, 100);

      return divide(bill.discount, add(1, vat));
    };

    const getNetExclTaxes = (bill) => {
      const exclTaxesCents = toCents(bill.exclTaxes);
      const exclTaxesDiscountCents = toCents(getExclTaxesDiscount(bill));

      return toEuros(exclTaxesCents - exclTaxesDiscountCents);
    };

    const getNetInclTaxes = (bill) => {
      const inclTaxesCents = toCents(bill.inclTaxes);
      const discountCents = toCents(bill.discount);

      return toEuros(inclTaxesCents - discountCents);
    };

    const setDiscount = ({ value, obj, path }) => {
      obj[path] = !value || isNaN(value) ? 0 : value;
      emit('discount-input');
    };

    const disableDiscountEditing = bill => (bill.discountEdition = false);

    const update = async (event, prop) => {
      await emit('update:bill', { ...props.bill, [prop]: event });
    };

    const updateDate = async (event, prop) => {
      await update(event, prop);
      await emit('datetime-input');
    };

    const startDateOptions = date => isSameOrBefore(date, props.bill.endDate);

    const rules = computed(() => ({ discount: { positiveNumber, fractionDigits: fractionDigits(2) } }));
    const validations = useVuelidate(rules, { discount });

    return {
      // Validations
      v$: validations,
      // Methods
      formatPrice,
      formatDate,
      formatStringToPrice,
      getLastVersion,
      formatHours,
      getClientName,
      getExclTaxesDiscount,
      getNetExclTaxes,
      getNetInclTaxes,
      setDiscount,
      disableDiscountEditing,
      update,
      updateDate,
      startDateOptions,
    };
  },
};
</script>

<style lang="sass" scoped>
.border-top td
  border-width: 1px 0 0 0
</style>
