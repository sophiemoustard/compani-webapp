<template>
  <div>
    <ni-input caption="Texte" v-model="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="v$.card.text.$error" type="textarea" :disable="disableEdition" />
    <ni-option-group v-model="card.media.type" :options="extensionOptions" inline :error="v$.card.media.type.$error"
      type="radio" :disable="isUploading || !!card.media.publicId" @update:model-value="updateCard('media.type')" />
    <ni-file-uploader class="file-uploader" caption="Média" path="media" :entity="card" name="media"
      @uploaded="mediaUploaded()" @delete="validateMediaDeletion()" :error="v$.card.media.$error"
      :extensions="extensions" :additional-value="mediaFileName" required-field :disable="disableEdition"
      :url="mediaUploadUrl" label="Pas de média" :max-file-size="maxFileSize" @start="start" @finish="finish" />
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Input from '@components/form/Input';
import FileUploader from '@components/form/FileUploader';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';
import OptionGroup from '@components/form/OptionGroup';

export default {
  name: 'TextMedia',
  props: {
    disableEdition: { type: Boolean, default: false },
    cardParent: { type: Object, default: () => ({}) },
  },
  setup () {
    const $store = useStore();

    const card = computed(() => $store.state.card.card);

    const rules = computed(() => ({
      card: {
        text: { required },
        media: { publicId: { required }, link: { required }, type: { required } },
      },
    }));

    const v$ = useVuelidate(rules, { card });

    return {
      // Validation
      v$,
      // Computed
      card,
    };
  },
  components: {
    'ni-input': Input,
    'ni-file-uploader': FileUploader,
    'ni-option-group': OptionGroup,
  },
  mixins: [templateMixin],
};
</script>

<style lang="sass" scoped>
@media screen and (max-width: 767px)
  .file-uploader
    width: fit-content
</style>
