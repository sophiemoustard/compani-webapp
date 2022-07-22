<template>
  <q-page class="client-background q-pb-xl">
    <ni-title-header title="Absences" padding>
      <template #content>
        <div class="col-xs-12 col-md-6">
          <ni-date-range v-model="dates" @blur="refresh" v-model:error="datesHasError" />
        </div>
      </template>
    </ni-title-header>
    <ni-simple-table :data="events" :columns="columns" :loading="tableLoading" v-model:pagination="pagination">
      <template #body="{ props }">
        <q-tr :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
            :style="col.style">
            <template v-if="col.name === 'actions'">
              <div class="row no-wrap table-actions">
                <ni-button icon="edit" @click="openAbsenceEditionModal(props.row)" />
              </div>
            </template>
            <template v-if="col.name === 'attachment'">
              <div v-if="getDriveId(props.row)" class="row no-wrap table-actions">
                <ni-button @click="downloadDriveDoc(props.row)" icon="file_download" :disable="docLoading" />
              </div>
            </template>
            <template v-else>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </template>
    </ni-simple-table>

    <!-- Absence edition modal -->
    <ni-event-edition-modal :validations="eventValidation.editedEvent" :loading="loading" :edited-event="editedEvent"
      :edition-modal="editionModal" :person-key="personKey" :active-auxiliaries="activeAuxiliaries"
      @hide="resetEditionForm" @delete-document="validateDocumentDeletion" @document-uploaded="documentUploaded"
      @submit="validateEventEdition" @close="closeEditionModal" @delete-event="validateEventDeletion"
      :event-histories="editedEventHistories" :histories-loading="historiesLoading" @update-event="setEvent" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { ref } from 'vue';
import get from 'lodash/get';
import set from 'lodash/set';
import Events from '@api/Events';
import GoogleDrive from '@api/GoogleDrive';
import Button from '@components/Button';
import DateRange from '@components/form/DateRange';
import TitleHeader from '@components/TitleHeader';
import SimpleTable from '@components/table/SimpleTable';
import { formatIdentity } from '@helpers/utils';
import moment from '@helpers/moment';
import { formatDownloadName } from '@helpers/utils';
import { formatDate, formatHours, formatHoursWithMinutes } from '@helpers/date';
import { ABSENCE, ABSENCE_NATURES, ABSENCE_TYPES, DAILY, AUXILIARY } from '@data/constants';
import EventEditionModal from 'src/modules/client/components/planning/EventEditionModal';
import { planningActionMixin } from 'src/modules/client/mixins/planningActionMixin';
import { usePlanningAction } from 'src/modules/client/composables/planningAction';

export default {
  name: 'Absences',
  components: {
    'ni-button': Button,
    'ni-date-range': DateRange,
    'ni-simple-table': SimpleTable,
    'ni-event-edition-modal': EventEditionModal,
    'ni-title-header': TitleHeader,
  },
  setup () {
    const metaInfo = { title: 'Absences' };
    useMeta(metaInfo);

    const personKey = ref(AUXILIARY);
    const { editedEvent, eventValidation } = usePlanningAction(personKey, []);

    return { personKey, editedEvent, eventValidation };
  },
  mixins: [planningActionMixin],
  data () {
    return {
      loading: false,
      tableLoading: false,
      events: [],
      editionModal: false,
      selectedAuxiliary: { picture: {}, identity: { lastname: '' } },
      pagination: { rowsPerPage: 0, sortBy: 'startDate', descending: true },
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
          field: (row) => {
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
          format: formatDate,
          align: 'center',
          sortable: true,
        },
        {
          name: 'startHour',
          label: 'Heure de début',
          field: 'startDate',
          format: formatHoursWithMinutes,
          align: 'center',
        },
        {
          name: 'endDate',
          label: 'Date de fin',
          field: 'endDate',
          format: formatDate,
          align: 'center',
          sortable: true,
        },
        { name: 'endHour', label: 'Heure de fin', field: 'endDate', format: formatHoursWithMinutes, align: 'center' },
        { name: 'duration', label: 'Durée', field: this.getAbsenceDuration, align: 'center' },
        {
          name: 'type',
          label: 'Type',
          field: (row) => {
            const type = ABSENCE_TYPES.find(abs => abs.value === row.absence);
            return type ? type.label : '';
          },
          align: 'left',
          sortable: true,
        },
        { name: 'attachment', label: 'Justificatif', align: 'left' },
        { name: 'misc', label: 'Notes', field: 'misc', align: 'left' },
        { name: 'actions', label: '' },
      ],
      dates: {
        startDate: moment().startOf('M').toISOString(),
        endDate: moment().endOf('M').toISOString(),
      },
      datesHasError: false,
      docLoading: false,
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
    setEvent (payload) {
      const { path, value } = payload;
      set(this.editedEvent, path, value);
    },
    getDriveId (absence) {
      return get(absence, 'attachment.driveId') || '';
    },
    async downloadDriveDoc (doc) {
      if (this.docLoading) return;
      try {
        const { identity } = doc.auxiliary;
        this.docLoading = true;

        const docName = formatDownloadName(`${identity.firstname} ${identity.lastname} absence`);
        await GoogleDrive.downloadFileById(this.getDriveId(doc), docName);
      } catch (e) {
        console.error(e);
      } finally {
        this.docLoading = false;
      }
    },
    getAbsenceDuration (absence) {
      if (absence.absenceNature === DAILY) {
        const range = Array.from(moment().range(absence.startDate, absence.endDate).by('days'));
        const count = range.reduce(
          (acc, day) => { // startOf('day') is necessery to check fr holidays in business day
            if (day.startOf('d').isBusinessDay()) acc += 1;
            return acc;
          },
          0
        );

        return `${count}j`;
      }

      const duration = moment(absence.endDate).diff(absence.startDate, 'm') / 60;
      return formatHours(duration);
    },
    async refresh () {
      try {
        this.tableLoading = true;
        if (this.datesHasError) return;
        this.events = await Events.list({
          type: ABSENCE,
          startDate: this.dates.startDate,
          endDate: this.dates.endDate,
        });
      } catch (e) {
        this.events = [];
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    },
    // Event edition
    async openAbsenceEditionModal (event) {
      this.selectedAuxiliary = event.auxiliary ? event.auxiliary : { picture: {}, identity: { lastname: '' } };
      await this.openEditionModal(event);
    },
  },
};
</script>
