<template>
  <ni-input caption="Titre" v-model.trim="card.title" required-field @focus="saveTmp('title')"
    @blur="updateCard('title')" />
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import set from 'lodash/set';
import { required } from 'vuelidate/lib/validators';
import Cards from '@api/Cards';
import Input from '@components/form/Input';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';

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
  validations () {
    return {
      card: {
        title: { required },
      },
    };
  },
  computed: {
    ...mapState('program', ['card', 'activity']),
  },
  methods: {
    saveTmp (path) {
      if (this.tmpInput === '') this.tmpInput = get(this.card, path);
    },
    async updateCard (path) {
      try {
        const value = get(this.card, path);
        if (this.tmpInput === value) return;

        get(this.$v.card, path).$touch();
        if (get(this.$v.card, path).$error) return NotifyWarning('Champ(s) invalide(s)');

        await Cards.updateById(this.card._id, set({}, path, value));

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
