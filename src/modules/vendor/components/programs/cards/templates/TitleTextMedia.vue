<template>
  <div>
    <ni-input caption="Titre" v-model="card.title" required-field @focus="saveTmp('title')"
      @blur="updateCard('title')" :error="v$.card.title.$error" :error-message="titleErrorMsg"
      :disable="disableEdition" />
    <ni-input caption="Texte" v-model="card.text" required-field @focus="saveTmp('text')"
      @blur="updateCard('text')" :error="v$.card.text.$error" type="textarea" :disable="disableEdition" />
    <ni-option-group v-model="card.media.type" inline @update:model-value="updateCard('media.type')"
      type="radio" :disable="isUploading || !!card.media.publicId" :error="v$.card.media.type.$error"
      :options="UPLOAD_EXTENSION_OPTIONS" />
    <ni-file-uploader class="file-uploader" caption="Média" path="media" :entity="card" name="media"
      @uploaded="mediaUploaded()" @delete="validateMediaDeletion()" :error="v$.card.media.$error"
      :extensions="extensions" :additional-value="mediaFileName" required-field @start="start" @finish="finish"
      :url="mediaUploadUrl" label="Pas de média" :max-file-size="maxFileSize" :disable="disableEdition" />
  </div>
</template>

<script>
import { computed, toRefs } from 'vue';
import { useStore } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required, maxLength } from '@vuelidate/validators';
import Input from '@components/form/Input';
import FileUploader from '@components/form/FileUploader';
import OptionGroup from '@components/form/OptionGroup';
import { UPLOAD_EXTENSION_OPTIONS, QUESTION_OR_TITLE_MAX_LENGTH } from '@data/constants';
import { useCardTemplate } from 'src/modules/vendor/composables/CardTemplate';

export default {
  name: 'TitleTextMedia',
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
        title: { required, maxLength: maxLength(QUESTION_OR_TITLE_MAX_LENGTH) },
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
      extensions,
      mediaFileName,
      mediaUploadUrl,
      maxFileSize,
      isUploading,
      start,
      finish,
      titleErrorMsg,
    } = useCardTemplate(card, v$, refreshCard, cardParent);

    return {
      // Validation
      v$,
      // Data
      UPLOAD_EXTENSION_OPTIONS,
      isUploading,
      // Computed
      card,
      extensions,
      mediaFileName,
      mediaUploadUrl,
      maxFileSize,
      titleErrorMsg,
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
