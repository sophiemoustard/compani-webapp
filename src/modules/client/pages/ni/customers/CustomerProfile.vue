<template>
  <q-page padding class="client-background">
    <div v-if="customer">
      <customer-profile-header :profile-id="customerId" :title="customerName" />
      <profile-tabs :profile-id="customerId" :tabs-content="tabsContent" :notifications="notifications" />
    </div>
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { ref, computed, watch, onBeforeUnmount, toRefs } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import ProfileTabs from '@components/ProfileTabs';
import { formatIdentity } from '@helpers/utils';
import CustomerProfileHeader from 'src/modules/client/components/customers/CustomerProfileHeader';
import ProfileFollowUp from 'src/modules/client/components/customers/ProfileFollowUp';
import ProfileInfo from 'src/modules/client/components/customers/infos/ProfileInfo';
import ProfileBilling from 'src/modules/client/components/customers/billing/ProfileBilling';

export default {
  props: {
    customerId: { type: String, required: true },
    defaultTab: { type: String, default: () => 'followUp' },
  },
  components: {
    'customer-profile-header': CustomerProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  setup (props) {
    const metaInfo = { title: 'Fiche bénéficiaire' };
    useMeta(metaInfo);
    const { defaultTab, customerId } = toRefs(props);

    const tabsContent = [
      {
        label: 'Accompagnement',
        name: 'followUp',
        default: defaultTab.value === 'followUp',
        component: ProfileFollowUp,
      },
      {
        label: 'Infos',
        name: 'info',
        default: defaultTab.value === 'info',
        component: ProfileInfo,
        notification: 'profiles',
      },
      {
        label: 'Facturation',
        name: 'billing',
        default: defaultTab.value === 'billing',
        component: ProfileBilling,
      },
    ];
    const customerName = ref('');

    const $store = useStore();
    const customer = computed(() => $store.state.customer.customer);
    const notifications = computed(() => $store.state.customer.notifications);

    watch(customer, async () => $store.dispatch('customer/updateNotifications'));
    watch(customer, () => { refreshCustomerName(); });

    const refreshCustomerName = () => {
      customerName.value = get(customer.value, 'identity') ? formatIdentity(customer.value.identity, 'FL') : '';
    };

    const created = async () => {
      await $store.dispatch('customer/fetchCustomer', { customerId: customerId.value });
      refreshCustomerName();
    };

    onBeforeUnmount(() => { $store.dispatch('customer/resetCustomer'); });

    created();

    return {
      // Data
      tabsContent,
      customerName,
      // Computed
      customer,
      notifications,
    };
  },
};
</script>
