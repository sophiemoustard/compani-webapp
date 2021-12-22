<template>
  <ni-modal :value="paySurchargeDetailsModal" @input="close">
    <template slot="title">
      Détails des <span class="text-weight-bold">majorations</span>
    </template>
    <div v-for="(surchargePlanDetails, surchargePlanId) in pay[surchargeDetailKey]" :key="surchargePlanId"
      class="q-mb-xl">
      <div class="text-primary capitalize text-weight-bold q-mb-md">
        {{ surchargePlanDetails.planName }}
      </div>
      <div v-for="(surchage, surchargeName) in getSurcharges(surchargePlanDetails)" :key="surchargeName"
        class="surcharge-line">
        <div class="surcharge-type q-pa-sm">
          {{ SURCHARGES[surchargeName] }} - {{ surchage.percentage }}%
        </div>
        <div class="q-pa-sm">{{ formatHours(surchage.hours) }}</div>
      </div>
    </div>
    <template v-if="pay.diff && pay.diff[surchargeDetailKey]">
      <div v-for="(surchargePlanDetails, surchargePlanId) in pay.diff[surchargeDetailKey]" class="q-mb-xl"
        :key="`diff${surchargePlanId}`">
        <template v-if="displayDiff(surchargePlanDetails)">
          <div class="text-primary capitalize text-weight-bold q-mb-md">
            {{ surchargePlanDetails.planName }} (M-1)
          </div>
          <div v-for="(surchage, surchargeName) in getSurcharges(surchargePlanDetails)" :key="surchargeName"
            class="surcharge-line">
            <div class="surcharge-type q-pa-sm">
              {{ SURCHARGES[surchargeName] }} - {{ surchage.percentage }}%
            </div>
            <div class="q-pa-sm">{{ formatHours(surchage.hours) }}</div>
          </div>
        </template>
      </div>
    </template>
  </ni-modal>
</template>

<script>
import pick from 'lodash/pick';
import Modal from '@components/modal/Modal';
import { formatHours } from '@helpers/utils';
import { SURCHARGES } from '@data/constants';

export default {
  name: 'PaySurchargeDetailsModal',
  components: {
    'ni-modal': Modal,
  },
  data () {
    return {
      SURCHARGES,
    };
  },
  props: {
    paySurchargeDetailsModal: { type: Boolean, default: false },
    pay: { type: Object, default: () => ({}) },
    surchargeDetailKey: { type: String, default: '' },
  },
  methods: {
    getSurcharges (surchargesPlanDetails) {
      return pick(surchargesPlanDetails, Object.keys(SURCHARGES));
    },
    displayDiff (plan) {
      return Object.values(plan).some(sur => sur.hours);
    },
    close () {
      this.$emit('update:paySurchargeDetailsModal', false);
    },
    formatHours,
  },
};
</script>

<style lang="sass" scoped>
.surcharge-line
  display: flex
  flex-direction: row
  width: 100%
  border: 1px solid $copper-grey-300
  &:not(:nth-child(2)) // first-child is title
    border-top: none

.surcharge-type
  width: 60%
  border-right: 1px solid $copper-grey-300
</style>
