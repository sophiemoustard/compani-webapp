<template>
  <div>
    <q-page padding class="vendor-background q-pb-xl">
      <ni-title-header title="Configuration de la facturation" class="q-mb-xl" />
      <p class="text-weight-bold">Financeurs</p>
      <q-card>
        <ni-responsive-table :data="courseFundingOrganisations" :columns="courseFundingOrganisationColumns"
          v-model:pagination="pagination" class="q-mb-md" :loading="tableLoading">
          <template #body="{ props }">
            <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style">
                  <template v-if="col.name === 'actions'">
                    <div class="row no-wrap table-actions">
                      <ni-button icon="delete" @click="validateOrganisationDeletion(col.value)" />
                    </div>
                  </template>
                  <template v-else>{{ col.value }}</template>
                </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <ni-button color="primary" icon="add" label="Ajouter un financeur" :disable="tableLoading"
            @click="openOrganisationCreationModal" />
        </q-card-actions>
      </q-card>
    </q-page>

    <ni-organisation-creation-modal v-model="organisationCreationModal" v-model:new-organisation="newOrganisation"
      @submit="addOrganisation" :validations="validations.newOrganisation" @hide="resetOrganisationAdditionForm"
      :loading="tableLoading" />
  </div>
</template>

<script>
import { useMeta, Dialog } from 'quasar';
import { ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import { frAddress } from '@helpers/vuelidateCustomVal';
import { sortStrings } from '@helpers/utils';
import CourseFundingOrganisations from '@api/CourseFundingOrganisations';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import TitleHeader from '@components/TitleHeader';
import ResponsiveTable from '@components/table/ResponsiveTable';
import Button from '@components/Button';
import OrganisationCreationModal from 'src/modules/vendor/components/billing/CourseFundingOrganisationCreationModal';

export default {
  name: 'BillingConfig',
  components: {
    'ni-title-header': TitleHeader,
    'ni-responsive-table': ResponsiveTable,
    'ni-organisation-creation-modal': OrganisationCreationModal,
    'ni-button': Button,
  },
  setup () {
    const metaInfo = { title: 'Configuration facturation' };
    useMeta(metaInfo);

    const tableLoading = ref(false);
    const courseFundingOrganisations = ref([]);
    const courseFundingOrganisationColumns = [
      { name: 'name', label: 'Nom', align: 'left', field: 'name' },
      { name: 'address', label: 'Adresse', align: 'left', field: row => get(row, 'address.fullAddress') || '' },
      { name: 'actions', label: '', align: 'left', field: '_id' },
    ];
    const pagination = { rowsPerPage: 0 };
    const organisationCreationModal = ref(false);
    const newOrganisation = ref({ name: '', address: {} });
    const modalLoading = ref(false);

    const rules = {
      newOrganisation: {
        address: {
          zipCode: { required },
          street: { required },
          city: { required },
          fullAddress: { frAddress },
        },
        name: { required },
      },
    };
    const validations = useVuelidate(rules, { newOrganisation });

    const refreshCourseFundingOrganisations = async () => {
      try {
        tableLoading.value = true;
        const organisations = await CourseFundingOrganisations.list();
        courseFundingOrganisations.value = organisations.sort((a, b) => sortStrings(a.name, b.name));
      } catch (e) {
        console.error(e);
        courseFundingOrganisations.value = [];
        NotifyNegative('Erreur lors de la récupération des financeurs.');
      } finally {
        tableLoading.value = false;
      }
    };

    const openOrganisationCreationModal = () => { organisationCreationModal.value = true; };
    const resetOrganisationAdditionForm = () => {
      newOrganisation.value = { name: '', address: {} };
      validations.value.newOrganisation.$reset();
    };
    const addOrganisation = async () => {
      try {
        validations.value.newOrganisation.$touch();
        if (validations.value.newOrganisation.$error) return NotifyWarning('Champ(s) invalide(s)');

        modalLoading.value = true;
        await CourseFundingOrganisations.create(newOrganisation.value);
        NotifyPositive('Financeur ajouté.');

        organisationCreationModal.value = false;
        await refreshCourseFundingOrganisations();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du financeur.');
      } finally {
        modalLoading.value = false;
      }
    };

    const deleteOrganisation = async (organisationId) => {
      try {
        await CourseFundingOrganisations.delete(organisationId);
        refreshCourseFundingOrganisations();
        NotifyPositive('Financeur supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du financeur.');
      }
    };

    const validateOrganisationDeletion = (organisationId) => {
      Dialog.create({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer le financeur ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => deleteOrganisation(organisationId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    };

    const created = async () => {
      refreshCourseFundingOrganisations();
    };

    created();

    return {
      // Data
      courseFundingOrganisationColumns,
      tableLoading,
      pagination,
      courseFundingOrganisations,
      organisationCreationModal,
      newOrganisation,
      // Computed
      validations,
      // Methods
      refreshCourseFundingOrganisations,
      resetOrganisationAdditionForm,
      addOrganisation,
      openOrganisationCreationModal,
      validateOrganisationDeletion,
    };
  },
};
</script>
