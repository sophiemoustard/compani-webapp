<template>
  <q-page padding class="client-background">
    <ni-title-header title="Mes contacts Compani" class="q-mb-lg" />
    <span class="text-italic">
      Des questions sur l'organisation d'une formation ? Retrouvez le contact sur l’onglet “Organisation”
      de la formation.
    </span>
    <div class="interlocutor-container q-mt-lg">
      <ni-interlocutor-cell :interlocutor="billingRepresentative" caption="Chargé de facturation Compani"
        :can-update="false" />
      <ni-interlocutor-cell :interlocutor="salesRepresentative" caption="Chargé d'accompagnement" :can-update="false" />
    </div>
  </q-page>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import VendorCompanies from '@api/VendorCompanies';
import TitleHeader from '@components/TitleHeader';
import InterlocutorCell from '@components/courses/InterlocutorCell';

export default {
  name: 'ContactProfile',
  components: {
    'ni-title-header': TitleHeader,
    'ni-interlocutor-cell': InterlocutorCell,
  },
  setup () {
    const billingRepresentative = ref({});

    const $store = useStore();
    const salesRepresentative = computed(() => get($store.getters['main/getCompany'], 'salesRepresentative'));

    const getBillingRepresentative = async () => {
      const vendorCompany = await VendorCompanies.get();

      billingRepresentative.value = get(vendorCompany, 'billingRepresentative');
    };

    const created = async () => {
      getBillingRepresentative();
    };

    created();

    return {
      // Data
      billingRepresentative,
      // Computed
      salesRepresentative,
    };
  },
};
</script>
