<template>
  <q-list class="no-border sidemenu-alenvi sidemenu-flex">
    <div class="sidemenu-header">
      <q-item-label header class="justify-center">
        <img :src="companiLogo" alt="Compani logo">
      </q-item-label>
    </div>
    <ni-side-menu-footer :label="userFirstnameUpper"  :interface-type="interfaceType"
      :userId="loggedUser._id"/>
  </q-list>
</template>

<script>
import SideMenuFooter from '@components/menu/SideMenuFooter';
import { sideMenuMixin } from '@mixins/sideMenuMixin';
import { CLIENT } from '@data/constants'

export default {
  name: 'SideMenuCustomer',
  mixins: [sideMenuMixin],
  components: {
    'ni-side-menu-footer': SideMenuFooter,
  },
  data () {
    return {
      interfaceType: CLIENT,
    }
  },
}
</script>
