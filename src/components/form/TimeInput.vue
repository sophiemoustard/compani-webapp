<template>
  <div :class="{ 'col-xs-12 col-md-6': !inModal, 'margin-input full-width': inModal }"
    class="input">
    <div class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <q-input dense bg-color="white" borderless :value="value" @input="update" :class="{ borders: inModal }" clearable
     :error-message="errorLabel" :error="error" :disable="disable" @blur="onBlur" :rules="['time']" mask="time">
      <template v-slot:append>
        <q-icon name="far fa-clock" class="cursor-pointer icon-clock" @click.native="selectTime = !selectTime">
          <q-menu ref="qTimeMenu">
            <q-time :value="value" format24h @input="select" />
          </q-menu>
        </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script>

export default {
  name: 'NiTimeInput',
  data () {
    return {
      selectTime: false,
    }
  },
  props: {
    value: { type: String, default: '' },
    inModal: { type: Boolean, default: false },
    caption: { type: String, default: '' },
    error: { type: Boolean, default: false },
    errorLabel: { type: String, default: '' },
    disable: { type: Boolean, default: false },
    requiredField: { type: Boolean, default: false },
  },
  methods: {
    select (value) {
      this.update(value);
      this.$refs.qTimeMenu.hide();
    },
    update (value) {
      this.$emit('input', value);
    },
    onBlur () {
      this.$emit('blur');
    },
  },
}
</script>

<style lang="stylus" scoped>
  .icon-clock
    font-size: 16px
    color: rgba(0,0,0,0.87)
</style>
