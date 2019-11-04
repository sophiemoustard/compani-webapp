<template>
  <div v-if="!hidden" :class="{ 'col-xs-12 col-md-6': !inModal, 'margin-input full-width': inModal, last: last }"
    class="input">
    <div class="row justify-between">
      <p :class="['input-caption', { required: requiredField }]">{{ caption }}</p>
      <q-icon v-if="error" name="error_outline" color="secondary" />
    </div>
    <template v-if="type === 'file'">
      <div class="row input-file-container" :class="{'borders': inModal}">
        <div class="col full-width">
          <span class="input-file-empty" v-if="!value">Pas de document</span>
          <template v-else>{{ value.name }}</template>
        </div>
        <i aria-hidden="true" class="q-icon on-right material-icons self-center relative-position">
          add
          <input ref="inputFile" type="file" @input="updateInputFile" class="input-file absolute-full cursor-pointer"
            @blur="onBlur" >
        </i>
      </div>
    </template>
    <template v-else>
      <q-input borderless dense :ref="name" :value="value" bg-color="white" @focus="onFocus" :disable="disable"
        :upper-case="upperCase" :lower-case="lowerCase" :type="inputType" :rows="rows" :suffix="suffix" :error="error"
        @blur="onBlur" @input="update" @keyup.enter="$emit('keyup:enter')" :error-message="errorLabel"
        :autogrow="this.type === 'textarea'" :readOnly="readOnly" :debounce="debounce" :placeholder="placeholder"
        :class="{ 'borders': inModal }">
        <template v-if="icon" v-slot:prepend>
          <q-icon size="xs" :name="icon" ></q-icon>
        </template>
        <template v-if="isPassword" v-slot:append>
          <q-icon :name="isPassword && showPassword ? 'visibility' : 'visibility_off'" class="cursor-pointer" size="xs"
            @click.native="showPassword = !showPassword" />
        </template>
      </q-input>
    </template>
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '../../data/constants';

export default {
  name: 'NiInput',
  props: {
    caption: { type: String, default: '' },
    error: { type: Boolean, default: false },
    errorLabel: { type: String, default: REQUIRED_LABEL },
    value: [String, Number, File],
    upperCase: { type: Boolean, default: false },
    lowerCase: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
    type: { type: String, default: 'text' },
    rows: { type: Number, default: 1 },
    hidden: { type: Boolean, default: false },
    suffix: { type: String, default: '' },
    requiredField: { type: Boolean, default: false },
    name: { type: String, default: '' },
    inModal: { type: Boolean, default: false },
    last: { type: Boolean, default: false },
    autofocus: { type: Boolean, default: false },
    debounce: { type: Number, default: undefined },
    placeholder: { type: String, default: '' },
    icon: { type: String, default: '' },
  },
  data () {
    return {
      showPassword: false,
    }
  },
  computed: {
    isPassword () {
      return this.type === 'password';
    },
    inputType () {
      return this.isPassword && this.showPassword ? 'text' : this.type;
    },
  },
  methods: {
    updateInputFile () {
      this.$emit('input', this.$refs.inputFile.files[0]);
    },
    onBlur (event) {
      if (this.type === 'number') this.$nextTick(() => this.$emit('blur'));
      else this.$emit('blur');
    },
    onFocus (event) {
      this.$emit('focus');
    },
    update (value) {
      this.$emit('input', value);
    },
  },
  watch: {
    value () {
      if (this.$refs.inputFile && !this.value) {
        // Otherwise you can't pick the same file twice in a row.
        this.$refs.inputFile.value = '';
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  .input-file-container
    padding: 6px 10px
    .input-file-empty
      font-size: 12px
    .input-file
      opacity: 0
      max-width: 100%
      height: 100%
      width: 100%
      font-size: 0
    &.borders
      border: 1px solid $light-grey
</style>
