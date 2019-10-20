<template>
  <ni-modal :value="paySurchargeDetailsModal" @input="close">
    <template slot="title">
      Détails des <span class="text-weight-bold">majorations</span>
    </template>
    <div v-for="(surchargePlanDetails, surchargePlanId) in surchargeDetails" :key="surchargePlanId" class="q-mb-xl">
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
  </ni-modal>
</template>

<script>
import Modal from '../Modal';
import { formatHours } from '../../helpers/utils';
import { SURCHARGES } from '../../data/constants';

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
    surchargeDetails: { type: Object, default: () => {} },
  },
  methods: {
    getSurcharges (surchargesPlanDetails) {
      return this.$_.pick(surchargesPlanDetails, Object.keys(SURCHARGES));
    },
    close () {
      this.$emit('update:paySurchargeDetailsModal', false);
    },
    formatHours,
  },
}
</script>

<style lang="stylus" scoped>
  .surcharge-line
    display: flex;
    flex-direction: row;
    width: 100%;
    border: 1px solid $light-grey;
    &:not(:nth-child(2)) // first-child is title
      border-top: none;

  .surcharge-type
    width: 60%
    border-right: 1px solid $light-grey;
</style>
