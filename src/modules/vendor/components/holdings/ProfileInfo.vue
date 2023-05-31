<template>
  <div v-if="holding">
    <p class="text-weight-bold q-mt-lg">Structures rattachées</p>
    <q-card>
      <ni-responsive-table :data="companyHoldings" :columns="companyColumns" v-model:pagination="companiesPagination"
        :hide-bottom="false">
        <template #header="{ props }">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :style="col.style"
              :class="col.name">
              <div @click="goToCompanyProfile(props.row)" :class="['ellipsis', 'clickable-name cursor-pointer']">
                {{ col.value }}
              </div>
            </q-td>
          </q-tr>
        </template>
      </ni-responsive-table>
      <q-card-actions align="right">
        <ni-button color="primary" icon="add" class="q-ml-sm" label="Rattacher une structure"
          @click="openCompanyLinkModal" />
      </q-card-actions>
    </q-card>
    <p class="text-weight-bold q-mt-lg">Utilisateurs</p>
    <q-card>
      <ni-responsive-table :data="userHoldings" :columns="userColumns" v-model:pagination="usersPagination"
        :hide-bottom="false">
        <template #header="{ props }">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :style="col.style"
              :class="col.name">
              {{ col.value }}
            </q-td>
          </q-tr>
        </template>
      </ni-responsive-table>
      <q-card-actions align="right">
        <ni-button color="primary" icon="add" class="q-ml-sm" label="Rattacher une personne"
          @click="openUserAdditionModal" />
      </q-card-actions>
    </q-card>

    <company-addition-modal v-model="companyLinkModal" :loading="modalLoading" @submit="linkCompanyToHolding"
      :validations="v$.newCompanyLink" @hide="resetCompanyLinkModal" v-model:selected-company="newCompanyLink"
      :company-options="companyOptions" />

    <user-addition-modal v-model="userAdditionModal" v-model:new-user-registration="newUserRegistration"
      @submit="addUser" :validations="v$.newUserRegistration" :loading="userModalLoading" @hide="resetUserAdditionForm"
      :users-options="usersOptions" label="Utilisateur" />
  </div>
</template>

<script>
import { computed, toRefs, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import get from 'lodash/get';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Companies from '@api/Companies';
import Holdings from '@api/Holdings';
import Users from '@api/Users';
import Button from '@components/Button';
import CompanyAdditionModal from '@components/courses/CompanyAdditionModal';
import UserAdditionModal from '@components/courses/UserAdditionModal';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { COACH, CLIENT_ADMIN } from '@data/constants';
import { formatAndSortOptions, formatPhone, formatAndSortUserOptions } from '@helpers/utils';

export default {
  name: 'ProfileInfo',
  props: {
    profileId: { type: String, required: true },
  },
  components: {
    'ni-responsive-table': ResponsiveTable,
    'company-addition-modal': CompanyAdditionModal,
    'ni-button': Button,
    'user-addition-modal': UserAdditionModal,
  },
  setup (props) {
    const { profileId } = toRefs(props);
    const $store = useStore();
    const $router = useRouter();

    const companyColumns = ref([{ name: 'name', label: 'Nom', align: 'left', field: 'name', sortable: true }]);
    const userColumns = ref([
      {
        name: 'firstname',
        label: 'Prénom',
        align: 'left',
        field: row => get(row, 'identity.firstname') || '',
        classes: 'text-capitalize',
      },
      {
        name: 'lastname',
        label: 'Nom',
        align: 'left',
        field: row => get(row, 'identity.lastname') || '',
        classes: 'text-capitalize',
      },
      { name: 'email', label: 'Email', align: 'left', field: row => get(row, 'local.email') || '', classes: 'email' },
      {
        name: 'phone',
        label: 'Téléphone',
        align: 'left',
        field: row => get(row, 'contact.phone') || '',
        format: formatPhone,
      },
    ]);
    const companiesPagination = ref({ sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 });
    const usersPagination = ref({ sortBy: 'lastname', ascending: true, page: 1, rowsPerPage: 15 });
    const companyOptions = ref([]);
    const usersOptions = ref([]);
    const companyLinkModal = ref(false);
    const newCompanyLink = ref('');
    const modalLoading = ref(false);
    const userAdditionModal = ref(false);
    const newUserRegistration = ref({ user: '' });
    const userModalLoading = ref(false);

    const rules = { newCompanyLink: { required }, newUserRegistration: { user: { required } } };
    const v$ = useVuelidate(rules, { newCompanyLink, newUserRegistration });

    const holding = computed(() => $store.state.holding.holding);
    const companyHoldings = computed(() => holding.value.companyHoldings.map(ch => ch.company));
    const userHoldings = computed(() => holding.value.userHoldings.map(uh => uh.user));

    const refreshHolding = async () => {
      try {
        await $store.dispatch('holding/fetchHolding', { holdingId: profileId.value });
      } catch (e) {
        console.error(e);
      }
    };

    const openCompanyLinkModal = async () => {
      try {
        const companies = await Companies.list({ noHolding: true });

        companyOptions.value = formatAndSortOptions(companies, 'name');
        companyLinkModal.value = true;
      } catch (e) {
        console.error(e);
        companyLinkModal.value = false;
        companyOptions.value = [];
      }
    };

    const resetCompanyLinkModal = () => {
      companyOptions.value = [];
      newCompanyLink.value = '';
      v$.value.newCompanyLink.$reset();
    };

    const linkCompanyToHolding = async () => {
      try {
        v$.value.newCompanyLink.$touch();
        if (v$.value.newCompanyLink.$error) return NotifyWarning('Une structure est requise.');

        modalLoading.value = true;
        await Holdings.update(holding.value._id, { company: newCompanyLink.value });

        companyLinkModal.value = false;
        NotifyPositive('Rattachement à la société mère effectué.');

        await refreshHolding();
      } catch (e) {
        console.error(e);
        if (e.status === 403) return NotifyNegative('Cette structure est déjà rattachée à une société mère.');
        NotifyNegative('Erreur lors du rattachement à la structure.');
      } finally {
        modalLoading.value = false;
      }
    };

    const goToCompanyProfile = (row) => {
      $router.push({ name: 'ni users companies info', params: { companyId: row._id } });
    };

    const openUserAdditionModal = async () => {
      try {
        const users = await Users.list({ holding: holding.value._id, role: [COACH, CLIENT_ADMIN] });

        usersOptions.value = formatAndSortUserOptions(users, true);
        userAdditionModal.value = true;
      } catch (e) {
        console.error(e);
        userAdditionModal.value = false;
        usersOptions.value = [];
      }
    };

    const resetUserAdditionForm = () => {
      newUserRegistration.value = {};
      v$.value.newUserRegistration.$reset();
    };

    const addUser = async () => {
      try {
        userModalLoading.value = true;
        v$.value.newUserRegistration.$touch();
        if (v$.value.newUserRegistration.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Users.updateById(newUserRegistration.value.user, { holding: holding.value._id });

        userAdditionModal.value = false;
        refreshHolding();
        NotifyPositive('Personne ajoutée.');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        if (e.status === 403) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout de la personne.');
      } finally {
        userModalLoading.value = false;
      }
    };

    return {
      // Data
      companyColumns,
      userColumns,
      companiesPagination,
      usersPagination,
      companyOptions,
      companyLinkModal,
      newCompanyLink,
      modalLoading,
      userModalLoading,
      userAdditionModal,
      newUserRegistration,
      usersOptions,
      // Computed
      holding,
      companyHoldings,
      userHoldings,
      v$,
      openCompanyLinkModal,
      resetCompanyLinkModal,
      linkCompanyToHolding,
      goToCompanyProfile,
      resetUserAdditionForm,
      addUser,
      openUserAdditionModal,
    };
  },
};
</script>
