<template>
  <div>
    <ni-input caption="Texte" v-model="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="v$.card.text.$error" type="textarea" :disable="disableEdition" />
    <ni-option-group v-model="card.media.type" :options="UPLOAD_EXTENSION_OPTIONS" inline
      :error="v$.card.media.type.$error" type="radio" :disable="isUploading || !!card.media.publicId"
      @update:model-value="updateCard('media.type')" />
    <ni-file-uploader class="file-uploader" caption="Média" path="media" :entity="card" name="media"
      @uploaded="mediaUploaded()" @delete="validateMediaDeletion()" :error="v$.card.media.$error"
      :extensions="extensions" :additional-value="mediaFileName" required-field :disable="disableEdition"
      :url="mediaUploadUrl" label="Pas de média" :max-file-size="maxFileSize" @start="start" @finish="finish" />
  </div>
</template>

<script>
import { computed, toRefs } from 'vue';
import { useStore } from 'vuex';
import { useCardTemplate } from 'src/modules/vendor/composables/CardTemplate';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Input from '@components/form/Input';
import FileUploader from '@components/form/FileUploader';
import OptionGroup from '@components/form/OptionGroup';
import { UPLOAD_EXTENSION_OPTIONS } from '@data/constants';

export default {
  name: 'TextMedia',
  props: {
    disableEdition: { type: Boolean, default: false },
    cardParent: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-input': Input,
    'ni-file-uploader': FileUploader,
    'ni-option-group': OptionGroup,
  },
  emits: ['refresh'],
  setup (props, { emit }) {
    const { cardParent } = toRefs(props);

    const $store = useStore();

    const card = computed(() => $store.state.card.card);

    const rules = computed(() => ({
      card: {
        text: { required },
        media: { publicId: { required }, link: { required }, type: { required } },
      },
    }));

    const v$ = useVuelidate(rules, { card });

    const refreshCard = () => { emit('refresh'); };

    const {
      saveTmp,
      updateCard,
      mediaUploaded,
      validateMediaDeletion,
      mediaFileName,
      mediaUploadUrl,
      extensions,
      maxFileSize,
      start,
      finish,
      isUploading,
    } = useCardTemplate(card, v$, refreshCard, cardParent);

    return {
      // Validation
      v$,
      // Data
      UPLOAD_EXTENSION_OPTIONS,
      isUploading,
      // Computed
      card,
      mediaFileName,
      mediaUploadUrl,
      extensions,
      maxFileSize,
      // Methods
      saveTmp,
      updateCard,
      mediaUploaded,
      validateMediaDeletion,
      start,
      finish,
    };
  },
};
</script>

<style lang="sass" scoped>
@media screen and (max-width: 767px)
  .file-uploader
    width: fit-content
</style>
