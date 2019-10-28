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
        <q-icon name="access_time" class="cursor-pointer" @click.native="selectTime = !selectTime">
          <q-popup-proxy transition-show="scale" transition-hide="scale" ref="qTimePopup">
            <q-time :value="value" format24h @input="select" />
          </q-popup-proxy>
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
      const momentValue = this.$moment(value, 'HH:mm');
      this.update(momentValue.format('HH:mm'));
      this.$refs.qTimePopup.hide();
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
