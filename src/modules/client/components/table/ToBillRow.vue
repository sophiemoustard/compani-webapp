<template>
  <q-tr :props="props" :class="{'border-top': index === 0 }">
    <q-td v-for="col in props.cols" :key="col.name" :props="props" :data-cy="`col-${col.name}`"
      :style="{width: col.name === 'externalBilling' ? '100px' : '200px'}">
      <template v-if="index === 0 && col.name === 'externalBilling' && bill.thirdPartyPayer">
        <q-checkbox :value="bill.externalBilling" color="copper-grey-400" @input="update($event, 'externalBilling')"
          dense />
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
            <q-date :value="bill.startDate" :options="startDateOptions" mask="YYYY-MM-DD" minimal
              @input="updateDate($event, 'startDate')" no-unset />
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
      <template v-else-if="col.name === 'unitExclTaxes'">{{ formatPrice(bill.unitExclTaxes) }}</template>
      <template v-else-if="col.name === 'discount'">
        <ni-editable-td :props="bill" edited-field="discount" edition-boolean-name="discountEdition"
          :value="formatPrice(bill.discount)" @disable="disableDiscountEditing(bill)" :ref-name="bill._id"
          @click="$emit('discount-click', $event)" @change="setDiscount" suffix="€" />
      </template>
      <template v-else-if="col.name === 'exclTaxes'">{{ formatPrice(getNetExclTaxes(bill)) }}</template>
      <template v-else-if="col.name === 'inclTaxes'">{{ formatPrice(getNetInclTaxes(bill)) }}</template>
      <template v-else-if="index === 0">{{ col.value }}</template>
    </q-td>
    <q-td data-cy="col-selected-bill">
      <q-checkbox v-if="index === 0 && displayCheckbox" :value="selected" @input="$emit('update:selected', $event)"
        dense />
    </q-td>
  </q-tr>
</template>

<script>
import EditableTd from '@components/table/EditableTd';
import { formatPrice, getLastVersion, formatIdentity, truncate } from '@helpers/utils';
import { formatDate, isSameOrBefore } from '@helpers/date';
import { FIXED } from '@data/constants';

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
  methods: {
    formatPrice (value) {
      return formatPrice(value);
    },
    getLastVersion (value) {
      return getLastVersion(value, 'createdAt');
    },
    formatHours (bill) {
      if (bill.subscription.service && bill.subscription.service.nature === FIXED) return bill.eventsList.length;

      return bill.hours ? `${parseFloat(bill.hours).toFixed(2)}h` : '';
    },
    formatDate (value) {
      return formatDate(value);
    },
    getClientName (customer, bill) {
      if (!bill.thirdPartyPayer) return formatIdentity(customer.identity, 'Lf');
      return truncate(bill.thirdPartyPayer.name, 35);
    },
    getExclTaxesDiscount (bill) {
      return bill.discount / (1 + bill.vat / 100);
    },
    getNetExclTaxes (bill) {
      return bill.exclTaxes - this.getExclTaxesDiscount(bill);
    },
    getNetInclTaxes (bill) {
      return bill.inclTaxes - bill.discount;
    },
    setDiscount ({ value, obj, path }) {
      obj[path] = !value || isNaN(value) ? 0 : value;
      this.$emit('discount-input');
    },
    disableDiscountEditing (bill) {
      bill.discountEdition = false;
    },
    async update (event, prop) {
      await this.$emit('update:bill', { ...this.bill, [prop]: event });
    },
    async updateDate (event, prop) {
      await this.update(event, prop);
      await this.$emit('datetime-input');
    },
    startDateOptions (date) {
      return isSameOrBefore(date, this.bill.endDate);
    },
  },
};
</script>

<style lang="sass" scoped>
.border-top td
  border-width: 1px 0 0 0
</style>
