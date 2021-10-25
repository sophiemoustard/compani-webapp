<template>
    <q-dialog :value="value" @hide="hide">
      <q-card>
        <q-card-section class="title">Confirmation</q-card-section>
        <div class="banner row q-mx-md q-pa-sm">
          <q-icon size="sm" name="info_outline" color="orange-700" class="q-mr-sm" />
          <div>{{ start ? 'Début d\'intervention horodaté' : 'Fin d\'intervention horodatée' }}</div>
        </div>
        <q-card-section>
          Êtes-vous sûr(e) de vouloir annuler l'horodatage ? Vous pourrez ensuite modifier l'évènement.
        </q-card-section>
        <q-card-section class="row justify-end no-wrap">
          <ni-button label="RETOUR" @click.native="hide" />
          <ni-button label="ANNULER L'HORODATAGE" @click.native="cancelTimeStamping" />
        </q-card-section>
      </q-card>
    </q-dialog>
</template>

<script>
import Button from '@components/Button';

export default {
  name: 'HistoryCancellationModal',
  components: {
    'ni-button': Button,
  },
  props: {
    value: { type: Boolean, default: false },
    start: { type: Boolean, default: true },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    cancelTimeStamping () {
      this.$emit('cancelTimeStamping');
    },
  },
};
</script>

<style lang="stylus" scoped>
.title
  font-size: 20px
.banner
  background-color: $orange-50
  color: $orange-900
</style>
