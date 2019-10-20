<template>
  <q-input borderless dense :value="inputDate" bg-color="white" @input="input" placeholder="jj/mm/yyyy"
    :disable="disable">
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-menu ref="qDateMenu">
          <q-date minimal :value="date" @input="select" :options="dateOptions"/>
        </q-menu>
      </q-icon>
    </template>
  </q-input>
</template>

<script>
export default {
  name: 'NiDateInput',
  props: {
    value: String,
    min: { type: String, default: '' },
    disable: { type: Boolean, default: false },
  },
  computed: {
    date () {
      return this.$moment(this.value).format('YYYY/MM/DD');
    },
    inputDate () {
      return this.$moment(this.value).format('DD/MM/YYYY');
    },
  },
  methods: {
    dateOptions (date) {
      if (this.min) return date >= this.$moment(this.min).format('YYYY/MM/DD');
      else return [];
    },
    select (value) {
      const momentValue = this.$moment(value, 'YYYY/MM/DD', true)
      if (!momentValue.isValid()) return;
      this.update(momentValue.toISOString());
      this.$refs.qDateMenu.hide();
    },
    input (value) {
      const momentValue = this.$moment(value, 'DD/MM/YYYY', true)
      if (!momentValue.isValid()) return;
      this.update(momentValue.toISOString());
    },
    update (value) {
      this.$emit('input', value);
    },
  },
}
</script>

<style lang="stylus" scoped>
  .q-input
    /deep/ .q-field__control
      padding-left: 14px
      padding-right: 14px
      border-radius: 3px
</style>
