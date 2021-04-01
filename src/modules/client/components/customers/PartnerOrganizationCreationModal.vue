<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Créer une nouvelle <span class="text-weight-bold">structure partenaire</span>
    </template>
    <ni-input in-modal caption="Nom" :value="newPartnerOrganization.name" @input="update($event.trim(), 'name')"
      required-field />
    <ni-input in-modal caption="Téléphone" :value="newPartnerOrganization.phone"
      @input="update($event.trim(), 'phone')" />
    <ni-search-address in-modal :value="newPartnerOrganization.address" @input="update($event, 'address')" />
    <div class="row margin-input last">
      <ni-input in-modal caption="Email" :value="newPartnerOrganization.email"
        @input="update($event.trim(), 'email')" />
    </div>
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Créer la structure" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import SearchAddress from '@components/form/SearchAddress';
import Input from '@components/form/Input';

export default {
  name: 'PartnerOrganizationCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newPartnerOrganization: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-search-address': SearchAddress,
    'ni-input': Input,
    'ni-modal': Modal,
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (event, path) {
      this.$emit('update:newPartnerOrganization', set({ ...this.newPartnerOrganization }, path, event));
    },
  },
};
</script>
