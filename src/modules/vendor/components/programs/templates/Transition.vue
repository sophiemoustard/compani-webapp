<template>
  <ni-input caption="Titre" v-model.trim="card.title" required-field @focus="saveTmp('title')"
    @blur="updateCard('title')" />
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import set from 'lodash/set';
import Cards from '@api/Cards';
import Input from '@components/form/Input';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';

export default {
  name: 'Transition',
  components: {
    'ni-input': Input,
  },
  data () {
    return {
      tmpInput: '',
    };
  },
  computed: {
    ...mapState('program', ['card', 'activity']),
  },
  methods: {
    saveTmp (path) {
      if (this.tmpInput === '') this.tmpInput = get(this.userProfile, path);
    },
    async updateCard (path) {
      try {
        const value = get(this.card, path);
        const payload = set({}, path, value);

        await Cards.updateById(this.card._id, payload);

        await this.refreshCard();
        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      }
    },
    async refreshCard () {
      try {
        await this.$store.dispatch('program/fetchActivity', { activityId: this.activity._id });
        const card = this.activity.cards.find(card => card._id === this.card._id);
        this.$store.dispatch('program/fetchCard', card);
      } catch (e) {
        console.error(e);
      }
    },
  },
}
</script>
