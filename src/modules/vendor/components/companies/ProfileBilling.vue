<template>
  <course-billing-infos :profile-id="company._id" @refresh-company="refreshCompany" />
</template>

<script>
import { computed, toRefs } from 'vue';
import { useStore } from 'vuex';
import CourseBillingInfos from '@components/courseBilling/CourseBillingInfos';

export default {
  name: 'ProfileBilling',
  props: {
    profileId: { type: String, required: true },
  },
  components: {
    'course-billing-infos': CourseBillingInfos,
  },
  setup (props) {
    const { profileId } = toRefs(props);
    const $store = useStore();
    const company = computed(() => $store.state.company.company);

    const refreshCompany = async () => {
      try {
        await $store.dispatch('company/fetchCompany', { companyId: profileId.value });
      } catch (e) {
        console.error(e);
      }
    };

    return {
      // Computed
      company,
      // Methods
      refreshCompany,
    };
  },
};
</script>
