import { mapState } from 'vuex';
import omit from 'lodash/omit';
import isEqual from 'lodash/isEqual';
import get from 'lodash/get';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import cloneDeep from 'lodash/cloneDeep';
import { subject } from '@casl/ability';
import InternalHours from '@api/InternalHours';
import Gdrive from '@api/GoogleDrive';
import Events from '@api/Events';
import EventHistories from '@api/EventHistories';
import { NotifyWarning, NotifyNegative, NotifyPositive } from '@components/popup/notify';
import {
  INTERNAL_HOUR,
  ABSENCE,
  INTERVENTION,
  NEVER,
  UNAVAILABILITY,
  ILLNESS,
  DAILY,
  SECTOR,
  PERSON,
  CUSTOMER,
  WORK_ACCIDENT,
} from '@data/constants';
import { defineAbilitiesFor } from '@helpers/ability';
import moment from '@helpers/moment';
import { validationMixin } from '@mixins/validationMixin';

export const planningActionMixin = {
  mixins: [validationMixin],
  data () {
    return {
      editedEventHistories: [],
      historiesLoading: false,
    };
  },
  computed: { ...mapState('main', ['loggedUser']) },
  methods: {
    addSavedTerms (endPath) {
      if (this.$q.localStorage.has(`lastSearch${endPath}`) &&
        this.$q.localStorage.getItem(`lastSearch${endPath}`).length > 0) {
        const lastSearch = JSON.parse(this.$q.localStorage.getItem(`lastSearch${endPath}`));
        if (this.$refs.planningManager) this.$refs.planningManager.restoreFilter(lastSearch);
      }
    },
    async setInternalHours () {
      try {
        this.internalHours = await InternalHours.list();
      } catch (e) {
        console.error(e);
        this.internalHours = [];
      }
    },
    hasContractOnEvent (auxiliary, startDate, endDate = startDate) {
      if (!auxiliary.contracts || auxiliary.contracts.length === 0) return false;

      return auxiliary.contracts.some(contract => moment(contract.startDate).isSameOrBefore(endDate) &&
          (!contract.endDate || moment(contract.endDate).isAfter(startDate)));
    },
    getRowEvents (rowId) {
      return this.events[rowId] || [];
    },
    // Event creation
    canCreateEvent (person, selectedDay) {
      return this.hasContractOnEvent(person, selectedDay);
    },
    resetCreationForm ({ partialReset, type = INTERVENTION }) {
      this.eventValidation.newEvent.$reset();
      if (!partialReset) {
        this.creationModal = false;
        this.newEvent = {};
      } else {
        this.newEvent = {
          ...this.newEvent,
          type,
          repetition: { frequency: NEVER },
          customer: '',
          subscription: '',
          internalHour: '',
          absence: '',
          absenceNature: '',
          extension: '',
          address: {},
          attachment: {},
          ...(type === ABSENCE && {
            absenceNature: DAILY,
            dates: {
              startDate: moment(this.newEvent.dates.startDate).startOf('d').toISOString(),
              endDate: moment(this.newEvent.dates.endDate).endOf('d').toISOString(),
            },
          }),
        };
      }
    },
    closeCreationModal () {
      this.creationModal = false;
    },
    getPayload (event) {
      const payload = {
        ...pickBy(omit(event, ['dates', '__v', 'company', 'isExtendedAbsence'])),
        ...pick(event, ['isCancelled', 'transportMode', 'misc', 'kmDuringEvent']), // pickBy removes false and '' value
        startDate: event.dates.startDate,
        endDate: event.dates.endDate,
      };

      if (event.auxiliary) delete payload.sector;

      if (event.type === ABSENCE && event.absence !== ILLNESS && event.absence !== WORK_ACCIDENT) {
        payload.attachment = {};
      }

      return payload;
    },
    getCreationPayload (event) {
      const payload = this.getPayload(event);

      if (event.address && !event.address.fullAddress) delete payload.address;
      if (event.type === ABSENCE && event.absence !== ILLNESS && event.absence !== WORK_ACCIDENT) {
        payload.attachment = {};
      }

      return payload;
    },
    isCreationAllowed (event) {
      if (event.type === INTERVENTION && event.repetition && event.repetition.frequency !== NEVER) return true;

      return !this.hasConflicts(event, event.type);
    },
    isEditionAllowed (event, eventType) {
      if (event.shouldUpdateRepetition && eventType === INTERVENTION) return true;

      return !this.hasConflicts(event, eventType);
    },
    hasConflicts (scheduledEvent, eventType) {
      if (!scheduledEvent.auxiliary || scheduledEvent.isCancelled) return false;

      const { startDate, endDate, auxiliary } = scheduledEvent;
      const auxiliaryEvents = eventType !== ABSENCE
        ? this.getAuxiliaryEventsBetweenDates(auxiliary, startDate, endDate)
        : this.getAuxiliaryEventsBetweenDates(auxiliary, startDate, endDate, ABSENCE);

      return auxiliaryEvents.some((ev) => {
        if ((scheduledEvent._id && scheduledEvent._id === ev._id) || ev.isCancelled) return false;
        return moment(scheduledEvent.startDate).isBetween(ev.startDate, ev.endDate, 'minutes', '[]') ||
          moment(ev.startDate).isBetween(scheduledEvent.startDate, scheduledEvent.endDate, 'minutes', '[]');
      });
    },
    getAuxiliaryEventsBetweenDates (auxiliaryId, startDate, endDate, type) {
      return this.getRowEvents(auxiliaryId)
        .filter(event => (moment(event.startDate).isBetween(startDate, endDate, 'minutes', '[)') ||
            moment(startDate).isBetween(event.startDate, event.endDate, 'minutes', '[)')) &&
            (!type || type === event.type));
    },
    async createEvent () {
      try {
        this.loading = true;
        const payload = this.getCreationPayload(this.newEvent);
        if (!this.isCreationAllowed(payload)) {
          return NotifyNegative('Impossible : l\'évènement est en conflit avec les évènements de l\'auxiliaire.');
        }

        await Events.create(payload);

        await this.refresh();
        this.creationModal = false;
        NotifyPositive('Évènement créé');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(`Impossible : ${e.data.message}`);

        NotifyNegative('Erreur lors de la création de l\'évènement.');
      } finally {
        this.loading = false;
      }
    },
    getCreationMessageForInternalOrUnavailability (type) {
      return `Les ${type} de la répétition en conflit avec les évènements existants ne seront pas créées. `
        + '<br /><br />Êtes-vous sûr(e) de vouloir créer cette répétition ?';
    },
    getCreationConfirmationMessage () {
      switch (this.newEvent.type) {
        case INTERVENTION:
          return 'Les interventions de la répétition en conflit avec les évènements existants seront passées en '
          + 'à affecter. <br /><br />Êtes-vous sûr(e) de vouloir créer cette répétition ?';
        case INTERNAL_HOUR:
          return this.getCreationMessageForInternalOrUnavailability('heures internes');
        case UNAVAILABILITY:
          return this.getCreationMessageForInternalOrUnavailability('indisponibilités');
        default:
          return 'Êtes-vous sûr(e) de vouloir créer cette répétition ?';
      }
    },
    async validateCreationEvent () {
      try {
        this.eventValidation.newEvent.$touch();
        const isValid = await this.waitForFormValidation(this.eventValidation.newEvent);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

        if (this.newEvent.type === ABSENCE) {
          this.$q.dialog({
            title: 'Confirmation',
            message: 'Les interventions en conflit avec l\'absence seront passées en à affecter et les heures internes '
            + 'et indispo seront supprimées. <br /><br />Êtes-vous sûr(e) de vouloir créer cette absence ?',
            html: true,
            ok: 'OK',
            cancel: 'Annuler',
          })
            .onOk(this.createEvent)
            .onCancel(() => NotifyPositive('Création annulée.'));
        } else if (this.newEvent.auxiliary && get(this.newEvent, 'repetition.frequency', '') !== NEVER) {
          this.$q.dialog({
            title: 'Confirmation',
            message: this.getCreationConfirmationMessage(),
            html: true,
            ok: 'OK',
            cancel: 'Annuler',
          })
            .onOk(this.createEvent)
            .onCancel(() => NotifyPositive('Création annulée.'));
        } else {
          await this.createEvent();
        }
      } catch (e) {
        console.error(e);
        if (e.status === 409) {
          return NotifyNegative('Impossible : l\'évènement est en conflit avec les évènements de l\'auxiliaire.');
        }
        NotifyNegative('Erreur lors de la création de l\'évènement.');
      }
    },
    // Event edition
    async openEditionModal (event) {
      try {
        this.historiesLoading = true;
        const isAllowed = this.canEditEvent({ auxiliaryId: get(event, 'auxiliary._id'), sectorId: event.sector });
        if (!isAllowed) return NotifyWarning('Vous n\'avez pas les droits pour réaliser cette action.');

        await this.formatEditedEvent(event);

        this.editionModal = true;
        this.editedEventHistories = await EventHistories.list({ eventId: event._id });
      } catch (e) {
        console.error(e);
        this.editedEventHistories = [];
      } finally {
        this.historiesLoading = false;
      }
    },
    async refreshHistories (eventId) {
      try {
        this.historiesLoading = true;
        this.editedEventHistories = await EventHistories.list({ eventId });
      } catch (e) {
        console.error(e);
        this.editedEventHistories = [];
      } finally {
        this.historiesLoading = false;
      }
    },
    async formatEditedEvent (event) {
      const {
        createdAt,
        updatedAt,
        startDate,
        endDate,
        isBilled,
        auxiliary,
        subscription,
        address,
        customer,
        internalHour,
        sector,
        transportMode,
        kmDuringEvent,
        misc,
        ...eventData
      } = cloneDeep(event);
      const dates = { startDate, endDate };

      switch (event.type) {
        case INTERVENTION: {
          this.editedEvent = {
            isCancelled: false,
            cancel: { condition: '', reason: '' },
            shouldUpdateRepetition: false,
            ...eventData,
            dates,
            sector: sector || auxiliary.sector._id,
            auxiliary: auxiliary ? auxiliary._id : '',
            customer: customer ? customer._id : '',
            subscription: subscription._id,
            isBilled,
            address,
            transportMode: transportMode || '',
            kmDuringEvent: kmDuringEvent || 0,
            misc,
          };
          break;
        }
        case INTERNAL_HOUR:
          this.editedEvent = {
            address: address || {},
            shouldUpdateRepetition: false,
            ...eventData,
            auxiliary: auxiliary._id,
            internalHour: internalHour._id,
            dates,
            misc,
          };
          break;
        case ABSENCE:
          this.editedEvent = { address: {}, attachment: {}, ...eventData, auxiliary: auxiliary._id, dates, misc };
          break;
        case UNAVAILABILITY:
          this.editedEvent = { shouldUpdateRepetition: false, ...eventData, auxiliary: auxiliary._id, dates, misc };
          break;
      }
    },
    canEditEvent (event) {
      const ability = defineAbilitiesFor(pick(this.loggedUser, ['role', 'company', '_id', 'sector']));

      return ability.can('update', subject('Events', event));
    },
    resetEditionForm () {
      this.eventValidation.editedEvent.$reset();
      this.editionModal = false;
    },
    closeEditionModal () {
      this.editionModal = false;
    },
    getEditionPayload (event) {
      const payload = this.getPayload(event);

      const fieldsToOmit = [
        'customer',
        'repetition',
        'staffingBeginning',
        'staffingDuration',
        'type',
        'displayedStartDate',
        'displayedEndDate',
        'extension',
        'histories',
        'startDateTimeStamp',
        'endDateTimeStamp',
      ];

      if (event.cancel && Object.keys(event.cancel).length === 0) fieldsToOmit.push('cancel');
      if (event.attachment && Object.keys(event.attachment).length === 0) fieldsToOmit.push('attachment');
      if (event.shouldUpdateRepetition) fieldsToOmit.push('misc', 'transportMode', 'kmDuringEvent');
      if (event.auxiliary) fieldsToOmit.push('sector');
      if (event.address && !event.address.fullAddress) payload.address = {};
      if (event.kmDuringEvent === '') payload.kmDuringEvent = 0;

      return omit(payload, fieldsToOmit);
    },
    getEditionMessageForInternalOrUnavailability (type) {
      return `Les ${type} de la répétition en conflit avec les évènements existants seront supprimées. `
        + '<br /><br />Êtes-vous sûr(e) de vouloir modifier cette répétition ?';
    },
    getEditionConfirmationMessage () {
      switch (this.editedEvent.type) {
        case INTERVENTION:
          return 'Les interventions de la répétition en conflit avec les évènements existants seront passées en '
          + 'à affecter. <br /><br />Êtes-vous sûr(e) de vouloir modifier cette répétition ?';
        case INTERNAL_HOUR:
          return this.getEditionMessageForInternalOrUnavailability('heures internes');
        case UNAVAILABILITY:
          return this.getEditionMessageForInternalOrUnavailability('indisponibilités');
        default:
          return 'Êtes-vous sûr(e) de vouloir modifier cette répétition ?';
      }
    },
    areEditedFieldsApplicableToRepetition () {
      const auxiliaryEvents = this.getRowEvents(this.editedEvent.auxiliary);
      const initialEvent = auxiliaryEvents.find(e => e._id === this.editedEvent._id);

      if (!initialEvent) return true;

      const formattedInitialEvent = {
        startDate: initialEvent.startDate,
        endDate: initialEvent.endDate,
        serviceId: initialEvent.subscription._id,
        customerId: initialEvent.customer._id,
      };
      const formattedEditedEvent = {
        startDate: this.editedEvent.dates.startDate,
        endDate: this.editedEvent.dates.endDate,
        serviceId: this.editedEvent.subscription,
        customerId: this.editedEvent.customer,
      };

      return !isEqual(formattedInitialEvent, formattedEditedEvent);
    },
    async confirmEventEdition (shouldUpdateRepetition) {
      this.editedEvent.shouldUpdateRepetition = shouldUpdateRepetition;
      if (shouldUpdateRepetition) {
        this.$q.dialog({
          title: 'Confirmation',
          message: this.getEditionConfirmationMessage(),
          html: true,
          ok: 'OK',
          cancel: 'Annuler',
        })
          .onOk(this.updateEvent)
          .onCancel(() => NotifyPositive('Modification annulée.'));
      } else {
        await this.updateEvent();
      }
    },
    async validateEventEdition () {
      try {
        this.eventValidation.editedEvent.$touch();
        const isValid = await this.waitForFormValidation(this.eventValidation.editedEvent);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

        const isRepetition = get(this.editedEvent, 'repetition.frequency') !== NEVER;
        if (this.editedEvent.type === ABSENCE) {
          this.$q.dialog({
            title: 'Confirmation',
            message: 'Les interventions en conflit avec l\'absence seront passées en à affecter et les heures internes '
            + 'et indispo seront supprimées. <br /><br />Êtes-vous sûr(e) de vouloir modifier cette absence ?',
            html: true,
            ok: 'OK',
            cancel: 'Annuler',
          })
            .onOk(this.updateEvent)
            .onCancel(() => NotifyPositive('Modification annulée.'));
        } else if (this.editedEvent.type === INTERVENTION && this.editedEvent.auxiliary && isRepetition) {
          const editedFieldsAreApplicableToRepetition = this.areEditedFieldsApplicableToRepetition();
          if (editedFieldsAreApplicableToRepetition) {
            this.$q.dialog({
              title: 'Confirmation',
              message: 'Modifier l\'événement périodique',
              html: true,
              options: {
                type: 'radio',
                model: false,
                items: [
                  { label: 'Modifier uniquement cet événement', value: false },
                  { label: 'Modifier cet événement et tous les suivants', value: true },
                ],
              },
              ok: 'OK',
              cancel: 'Annuler',
            })
              .onOk(this.confirmEventEdition)
              .onCancel(() => NotifyPositive('Modification annulée.'));
          } else {
            await this.updateEvent();
          }
        } else if (this.editedEvent.auxiliary && isRepetition && this.editedEvent.shouldUpdateRepetition) {
          this.$q.dialog({
            title: 'Confirmation',
            message: this.getEditionConfirmationMessage(),
            html: true,
            ok: 'OK',
            cancel: 'Annuler',
          })
            .onOk(this.updateEvent)
            .onCancel(() => NotifyPositive('Modification annulée.'));
        } else {
          await this.updateEvent();
        }
      } catch (e) {
        console.error(e);
        if (e.status === 409) {
          return NotifyNegative('Impossible : l\'évènement est en conflit avec les évènements de l\'auxiliaire.');
        }
        NotifyNegative('Erreur lors de la modification de l\'évènement.');
      }
    },
    async updateEvent () {
      try {
        this.eventValidation.editedEvent.$touch();
        const isValid = await this.waitForFormValidation(this.eventValidation.editedEvent);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getEditionPayload(this.editedEvent);

        if (!this.isEditionAllowed(payload, this.editedEvent.type)) {
          this.eventValidation.editedEvent.$reset();
          return NotifyNegative('Impossible : l\'évènement est en conflit avec les évènements de l\'auxiliaire.');
        }
        delete payload._id;
        await Events.updateById(this.editedEvent._id, payload);

        await this.refresh();
        this.editionModal = false;
        NotifyPositive('Évènement modifié.');
      } catch (e) {
        console.error(e);
        if (e.status === 409) {
          this.eventValidation.editedEvent.$reset();
          return NotifyNegative(`Impossible : ${e.data.message}`);
        }
        NotifyNegative('Erreur lors de la modification de l\'évènement.');
      } finally {
        this.loading = false;
      }
    },
    getDragAndDropPayload (toDay, target, draggedObject) {
      const daysBetween = moment(draggedObject.endDate).diff(moment(draggedObject.startDate), 'days');
      const payload = {
        startDate: moment(toDay).hours(moment(draggedObject.startDate).hours())
          .minutes(moment(draggedObject.startDate).minutes()).toISOString(),
        endDate: moment(toDay).add(daysBetween, 'days').hours(moment(draggedObject.endDate).hours())
          .minutes(moment(draggedObject.endDate).minutes())
          .toISOString(),
      };

      if (target.type === SECTOR) payload.sector = target._id;
      else if (get(draggedObject, 'auxiliary._id') || target.type === PERSON) {
        payload.auxiliary = this.personKey === CUSTOMER ? draggedObject.auxiliary._id : target._id;
      } else {
        payload.sector = draggedObject.sector;
      }

      if (draggedObject.isCancelled) {
        payload.isCancelled = draggedObject.isCancelled;
        payload.cancel = draggedObject.cancel;
        payload.misc = draggedObject.misc;
      }

      return payload;
    },
    async updateEventOnDrop (vEvent) {
      try {
        const { toDay, target, draggedObject } = vEvent;

        if (this.personKey === CUSTOMER && target._id !== draggedObject.customer._id) {
          return NotifyNegative('Impossible de modifier le/la bénéficiaire de l\'intervention.');
        }
        if (target.type === SECTOR && draggedObject.type !== INTERVENTION) {
          return NotifyNegative('Cette modification n\'est pas autorisée.');
        }
        if ([ABSENCE, UNAVAILABILITY].includes(draggedObject.type) && draggedObject.auxiliary._id !== target._id) {
          return NotifyNegative('Impossible de modifier l\'auxiliaire de cet évènement.');
        }

        const payload = this.getDragAndDropPayload(toDay, target, draggedObject);
        if (!this.isEditionAllowed(payload, draggedObject.type)) {
          return NotifyNegative('Impossible : l\'évènement est en conflit avec les évènements de l\'auxiliaire.');
        }

        await Events.updateById(draggedObject._id, payload);
        await this.refresh();

        NotifyPositive('Évènement modifié.');
      } catch (e) {
        if (e.status === 409) return NotifyNegative(`Impossible : ${e.data.message}`);

        NotifyNegative('Erreur lors de la modification de l\'évènement.');
      }
    },
    // Event files
    documentUploaded (uploadedInfo) {
      if (!uploadedInfo.xhr || !uploadedInfo.xhr.response) return;

      const json = JSON.parse(uploadedInfo.xhr.response);
      if (!json || !json.data || !json.data.payload) return;

      if (this.creationModal) this.newEvent.attachment = { ...json.data.payload.attachment };
      if (this.editionModal) this.editedEvent.attachment = { ...json.data.payload.attachment };
    },
    validateDocumentDeletion (driveId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer ce document ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteDocument(driveId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteDocument (driveId) {
      try {
        await Gdrive.removeFileById({ id: driveId });
        if (this.creationModal) this.newEvent.attachment = {};
        if (this.editionModal) this.editedEvent.attachment = {};
        NotifyPositive('Document supprimé.');
      } catch (e) {
        return NotifyPositive('Suppression annulée.');
      }
    },
    // Event deletion
    validateEventDeletion () {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer cet évènement ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(this.deleteEvent)
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteEvent () {
      try {
        this.loading = true;
        await Events.deleteById(this.editedEvent._id);

        await this.refresh();
        this.editionModal = false;
        NotifyPositive('Évènement supprimé.');
      } catch (e) {
        console.error(e);
        if (e.status === 409) NotifyNegative(e.data.message);
        else NotifyNegative('Erreur lors de la suppression de l\'événement.');
      } finally {
        this.loading = false;
      }
    },
    async deleteEventRepetition (shouldDeleteRepetition) {
      try {
        this.loading = true;
        if (shouldDeleteRepetition) {
          await Events.deleteRepetition(this.editedEvent._id);
          await this.refresh();
        } else {
          await Events.deleteById(this.editedEvent._id);
          await this.refresh();
        }
        this.editionModal = false;
        NotifyPositive('Évènement supprimé.');
      } catch (e) {
        console.error(e);
        if ([409, 422].includes(e.status)) NotifyNegative(e.data.message);
        else if (shouldDeleteRepetition) NotifyNegative('Erreur lors de la suppression des évènements.');
        else NotifyNegative('Erreur lors de la suppression de l\'évènement.');
      } finally {
        this.loading = false;
      }
    },
    validationDeletionEventRepetition () {
      try {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Supprimer l\'événement périodique',
          ok: 'OK',
          cancel: 'Annuler',
          options: {
            type: 'radio',
            model: false,
            items: [
              { label: 'Supprimer uniquement cet évenement', value: false },
              { label: 'Supprimer cet évenement et tous les suivants', value: true },
            ],
          },
        }).onOk(this.deleteEventRepetition)
          .onCancel(() => NotifyPositive('Suppression annulée.'));
      } catch (e) {
        NotifyNegative('Erreur lors de la suppression de l\'événement.');
      } finally {
        this.loading = false;
      }
    },
    getCustomerStoppedDate (event) {
      const customer = this.customers ? this.customers.find(c => c._id === event.customer) : null;
      return get(customer, 'stoppedAt') || '';
    },
  },
};
