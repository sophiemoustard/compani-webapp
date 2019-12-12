<template>
  <q-page class="neutral-background q-pb-xl">
    <ni-title-header title="Absences">
      <template slot="content">
        <div class="col-xs-12 col-md-6">
          <ni-date-range v-model="dates" @input="refresh" :error.sync="datesHasError" />
        </div>
      </template>
    </ni-title-header>
    <ni-large-table :data="absences" :columns="columns" :loading="tableLoading" :pagination.sync="pagination">
      <template v-slot:body="{ props }" >
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
            :style="col.style">
            <template v-if="col.name === 'actions'">
              <div class="row no-wrap table-actions">
                <q-btn flat round small color="grey" icon="edit" @click="openEditionModal(props.row)" />
              </div>
            </template>
            <template v-if="col.name === 'attachment'">
              <div v-if="props.row.attachment && props.row.attachment.link" class="row no-wrap table-actions">
                <q-btn flat round small color="primary">
                  <a :href="props.row.attachment.link" target="_blank">
                    <q-icon name="file_download" />
                  </a>
                </q-btn>
              </div>
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </template>
    </ni-large-table>

    <!-- Absence edition modal -->
    <ni-event-edition-modal :validations="$v.editedEvent" :loading="loading" :editedEvent="editedEvent"
      :editionModal="editionModal" :personKey="personKey" :activeAuxiliaries="activeAuxiliaries"
      @resetForm="resetEditionForm" @deleteDocument="validateDocumentDeletion" @documentUploaded="documentUploaded"
      @updateEvent="updateEvent" @close="closeEditionModal" @deleteEvent="validateEventDeletion" />
  </q-page>
</template>

<script>
import DateRange from '../../../components/form/DateRange';
import TitleHeader from '../../../components/TitleHeader';
import { ABSENCE, ABSENCE_NATURES, ABSENCE_TYPES, DAILY, AUXILIARY } from '../../../data/constants';
import LargeTable from '../../../components/table/LargeTable';
import EventEditionModal from '../../../components/planning/EventEditionModal';
import { planningActionMixin } from '../../../mixins/planningActionMixin';
import { formatIdentity, formatHours } from '../../../helpers/utils';
import { NotifyWarning } from '../../../components/popup/notify';

export default {
  name: 'Absences',
  metaInfo: { title: 'Absences' },
  components: {
    'ni-date-range': DateRange,
    'ni-large-table': LargeTable,
    'ni-event-edition-modal': EventEditionModal,
    'ni-title-header': TitleHeader,
  },
  mixins: [planningActionMixin],
  data () {
    return {
      personKey: AUXILIARY,
      events: [],
      loading: false,
      tableLoading: false,
      absences: [],
      auxiliaries: [],
      editedEvent: {},
      editionModal: false,
      selectedAuxiliary: { picture: {}, identity: { lastname: '' } },
      pagination: {
        rowsPerPage: 0,
        sortBy: 'startDate',
        descending: true,
      },
      columns: [
        {
          name: 'auxiliary',
          label: 'Auxiliaire',
          field: row => formatIdentity(row.auxiliary.identity, 'Fl'),
          align: 'left',
          sortable: true,
        },
        {
          name: 'nature',
          label: 'Nature',
          field: row => {
            const nature = ABSENCE_NATURES.find(abs => abs.value === row.absenceNature);
            return nature ? nature.label : '';
          },
          align: 'left',
          sortable: true,
        },
        {
          name: 'startDate',
          label: 'Date de début',
          field: 'startDate',
          format: value => this.$moment(value).format('DD/MM/YYYY'),
          align: 'center',
          sortable: true,
        },
        {
          name: 'startHour',
          label: 'Heure de début',
          field: 'startDate',
          format: value => this.$moment(value).format('HH:mm'),
          align: 'center',
        },
        {
          name: 'endDate',
          label: 'Date de fin',
          field: 'endDate',
          format: value => this.$moment(value).format('DD/MM/YYYY'),
          align: 'center',
          sortable: true,
        },
        {
          name: 'endHour',
          label: 'Heure de fin',
          field: 'endDate',
          format: value => this.$moment(value).format('HH:mm'),
          align: 'center',
        },
        {
          name: 'duration',
          label: 'Durée',
          field: row => this.getAbsenceDuration(row),
          align: 'center',
        },
        {
          name: 'type',
          label: 'Type',
          field: row => {
            const type = ABSENCE_TYPES.find(abs => abs.value === row.absence);
            return type ? type.label : '';
          },
          align: 'left',
          sortable: true,
        },
        {
          name: 'attachment',
          label: 'Justificatif',
        },
        {
          name: 'misc',
          label: 'Notes',
          field: 'misc',
          align: 'left',
        },
        {
          name: 'actions',
          label: '',
        },
      ],
      dates: {
        startDate: this.$moment().startOf('M').toISOString(),
        endDate: this.$moment().endOf('M').toISOString(),
      },
      datesHasError: false,
    };
  },
  async mounted () {
    await this.refresh();
  },
  computed: {
    activeAuxiliaries () {
      return [this.selectedAuxiliary];
    },
  },
  methods: {
    getAbsenceDuration (absence) {
      if (absence.absenceNature === DAILY) {
        const range = Array.from(this.$moment().range(absence.startDate, absence.endDate).by('days'));
        let count = 0;
        for (const day of range) {
          if (day.startOf('d').isBusinessDay()) count += 1; // startOf('day') is necessery to check fr holidays in business day
        }

        return `${count}j`;
      };

      const duration = this.$moment(absence.endDate).diff(absence.startDate, 'm') / 60;
      return formatHours(duration);
    },
    async refresh () {
      try {
        this.tableLoading = true;
        if (this.datesHasError) return;
        this.absences = await this.$events.list({ type: ABSENCE, startDate: this.dates.startDate, endDate: this.dates.endDate });
        this.auxiliaries = await this.$users.listActive();
      } catch (e) {
        this.absences = [];
        this.auxiliaries = [];
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    },
    // Event edition
    openEditionModal (event) {
      const can = this.canEditEvent(event);
      if (!can) return NotifyWarning('Vous n\'avez pas les droits pour réaliser cette action');
      this.selectedAuxiliary = event.auxiliary ? event.auxiliary : { picture: {}, identity: { lastname: '' } };
      this.formatEditedEvent(event);

      this.editionModal = true
    },
  },
}
</script>
