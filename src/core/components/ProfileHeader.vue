<template>
  <div class="header">
    <div class="flex-row q-mb-md items-center">
      <ni-button class="on-left" icon="arrow_back" color="primary" @click="$router.go(-1)" />
      <span class="ellipsis page-title flex-1">{{ title }}</span>
      <slot name="title" />
    </div>
    <div v-if="formatedHeaderInfo" class="row profile-info q-pl-lg">
      <q-item v-for="info of formatedHeaderInfo" class="col-md-6 col-xs-12" :key="info.icon">
        <q-item-section side>
          <q-icon size="xs" :name="info.icon" :class="info.iconClass" />
        </q-item-section>
        <q-item-section :class="info.labelClass">{{ info.label }}</q-item-section>
      </q-item>
    </div>
  </div>
</template>

<script>
import Button from '@components/Button';

export default {
  name: 'ProfileHeader',
  props: {
    title: { type: String, default: '' },
    headerInfo: { type: Array, default: () => [] },
  },
  components: {
    'ni-button': Button,
  },
  computed: {
    formatedHeaderInfo () {
      return this.headerInfo.map(info => ({ labelClass: info.class, iconClass: info.class, ...info }));
    },
  },
};
</script>
