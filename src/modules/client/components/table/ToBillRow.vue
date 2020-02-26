<template>
  <q-tr :props="props" :class="{'datatable-row-border-top': index === 0 }">
    <q-td v-for="col in props.cols" :key="col.name" :props="props"
      :style="{width: col.name === 'externalBilling' ? '100px' : '200px'}">
      <template v-if="index === 0 && col.name === 'externalBilling' && bill.thirdPartyPayer">
        <q-checkbox v-model="bill.externalBilling" color="grey" />
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
            <q-date v-model="bill.startDate" :max="bill.endDate" mask="YYYY-MM-DD" minimal
              @input="$emit('datetime:input')" />
          </q-menu>
        </div>
      </template>
      <template v-else-if="col.name === 'endDate'">{{ formatDate(bill.endDate) }}</template>
      <template v-else-if="col.name === 'service'">
        {{ getLastVersion(bill.subscription.service.versions).name }}
      </template>
      <template v-else-if="col.name === 'hours'">{{ formatHours(bill) }}</template>
      <template v-else-if="col.name === 'unitExclTaxes'">{{ formatPrice(bill.unitExclTaxes) }}</template>
      <template v-else-if="col.name === 'discount'">
        <ni-editable-td :props="bill" edited-field="discount" edition-boolean-name="discountEdition" :refName="bill._id"
          :value="formatPrice(bill.discount)" @disable="disableDiscountEditing(bill)"
          @click="$emit('discount:click', $event)" @change="setDiscount" suffix="€" />
      </template>
      <template v-else-if="col.name === 'exclTaxes'">{{ formatPrice(getNetExclTaxes(bill)) }}</template>
      <template v-else-if="col.name === 'inclTaxes'">{{ formatPrice(getNetInclTaxes(bill)) }}</template>
      <template v-else-if="index === 0">{{ col.value }}</template>
    </q-td>
    <q-td>
      <q-checkbox v-if="index === 0 && displayCheckbox" v-model="props.selected" dense />
    </q-td>
  </q-tr>
</template>

<script>
import EditableTd from '@components/table/EditableTd';
import { formatPrice, getLastVersion, formatIdentity, truncate } from '@helpers/utils.js';
import { FIXED } from '@data/constants.js';

export default {
  name: 'ToBillRow',
  components: {
    'ni-editable-td': EditableTd,
  },
  props: {
    props: Object,
    bill: Object,
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
      if (bill.subscription.service && bill.subscription.service.nature === FIXED) {
        return bill.eventsList.length;
      }
      return bill.hours ? `${parseFloat(bill.hours).toFixed(2)}h` : '';
    },
    formatDate (value) {
      return value ? `${this.$moment(value).format('DD/MM/YY')}` : '';
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
      this.$emit('discount:input');
    },
    disableDiscountEditing (bill) {
      bill.discountEdition = false;
    },
  },
}
</script>
