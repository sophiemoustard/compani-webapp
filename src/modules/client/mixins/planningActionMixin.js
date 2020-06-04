import { mapState } from 'vuex';
import omit from 'lodash/omit';
import get from 'lodash/get';
import pickBy from 'lodash/pickBy';
import cloneDeep from 'lodash/cloneDeep';
import { subject } from '@casl/ability';
import { required, requiredIf } from 'vuelidate/lib/validators';
import InternalHours from '@api/InternalHours';
import Gdrive from '@api/GoogleDrive';
import Events from '@api/Events';
import { NotifyWarning, NotifyNegative, NotifyPositive } from '@components/popup/notify';
import { frAddress, validHour } from '@helpers/vuelidateCustomVal.js';
import { defineAbilitiesFor } from '@helpers/ability';
import {
  INTERNAL_HOUR,
  ABSENCE,
  INTERVENTION,
  NEVER,
  UNAVAILABILITY,
  ILLNESS,
  CUSTOMER_CONTRACT,
  COMPANY_CONTRACT,
  DAILY,
  SECTOR,
  CUSTOMER,
  OTHER,
  HOURLY,
  WORK_ACCIDENT,
} from '@data/constants';
import { validationMixin } from 'src/modules/client/mixins/validationMixin';

export const planningActionMixin = {
  mixins: [validationMixin],
  computed: {
    ...mapState('main', ['loggedUser']),
  },
  validations () {
    return {
      newEvent: {
        type: { required },
        dates: {
          startDate: { required },
          endDate: { required: requiredIf((item, parent) => parent && (parent.type !== ABSENCE || parent.absenceNature === DAILY)) },
          startHour: {
            required: requiredIf((item, parent) => parent && (parent.type !== ABSENCE || parent.absenceNature === HOURLY)),
            validHour,
          },
          endHour: {
            required: requiredIf((item, parent) => parent && (parent.type !== ABSENCE || parent.absenceNature === HOURLY)),
            validHour,
          },
        },
        auxiliary: { required: requiredIf((item) => item && item.type !== INTERVENTION) },
        customer: { required: requiredIf((item) => item && item.type === INTERVENTION) },
        subscription: { required: requiredIf((item) => item && item.type === INTERVENTION) },
        internalHour: { required: requiredIf((item) => item && item.type === INTERNAL_HOUR) },
        absence: { required: requiredIf((item) => item && item.type === ABSENCE) },
        absenceNature: { required: requiredIf((item) => item && item.type === ABSENCE) },
        address: {
          zipCode: { required: requiredIf(item => item && !!item.fullAddress) },
          street: { required: requiredIf(item => item && !!item.fullAddress) },
          city: { required: requiredIf(item => item && !!item.fullAddress) },
          fullAddress: this.newEvent && this.newEvent.type === INTERNAL_HOUR ? { frAddress } : {},
        },
        repetition: {
          frequency: { required: requiredIf((item, parent) => parent && parent.type !== ABSENCE) },
        },
        attachment: {
          driveId: { required: requiredIf((item, parent) => parent && parent.type === ABSENCE && [ILLNESS, WORK_ACCIDENT].includes(parent.absence)) },
          link: { required: requiredIf((item, parent) => parent && parent.type === ABSENCE && [ILLNESS, WORK_ACCIDENT].includes(parent.absence)) },
        },
        misc: { required: requiredIf(item => item && item.type === ABSENCE && item.absence === OTHER) },
      },
      editedEvent: {
        dates: {
          startDate: { required },
          endDate: { required },
          startHour: {
            required: requiredIf((item, parent) => parent && (parent.type !== ABSENCE || parent.absenceNature === HOURLY)),
            validHour,
          },
          endHour: {
            required: requiredIf((item, parent) => parent && (parent.type !== ABSENCE || parent.absenceNature === HOURLY)),
            validHour,
          },
        },
        auxiliary: { required: requiredIf((item) => item && item.type !== INTERVENTION) },
        sector: { required: requiredIf((item) => item && !item.auxiliary) },
        customer: { required: requiredIf((item) => item && item.type === INTERVENTION) },
        subscription: { required: requiredIf((item) => item && item.type === INTERVENTION) },
        internalHour: { required: requiredIf((item) => item && item.type === INTERNAL_HOUR) },
        absence: { required: requiredIf((item) => item && item.type === ABSENCE) },
        absenceNature: { required: requiredIf((item) => item && item.type === ABSENCE) },
        address: {
          zipCode: { required: requiredIf(item => item && !!item.fullAddress) },
          street: { required: requiredIf(item => item && !!item.fullAddress) },
          city: { required: requiredIf(item => item && !!item.fullAddress) },
          fullAddress: this.editedEvent && this.editedEvent.type === INTERNAL_HOUR ? { frAddress } : {},
        },
        attachment: {
          driveId: { required: requiredIf(() => this.editedEvent && this.editedEvent.type === ABSENCE && [ILLNESS, WORK_ACCIDENT].includes(this.editedEvent.absence)) },
          link: { required: requiredIf(() => this.editedEvent && this.editedEvent.type === ABSENCE && [ILLNESS, WORK_ACCIDENT].includes(this.editedEvent.absence)) },
        },
        cancel: {
          condition: { required: requiredIf(() => this.editedEvent && this.editedEvent.type === INTERVENTION && this.editedEvent.isCancelled) },
          reason: { required: requiredIf(() => this.editedEvent && this.editedEvent.type === INTERVENTION && this.editedEvent.isCancelled) },
        },
        misc: {
          required: requiredIf((item) => item && ((item.type === ABSENCE && item.absence === OTHER) || item.isCancelled)),
        },
      },
    };
  },
  methods: {
    addSavedTerms (endPath) {
      if (this.$q.localStorage.has(`lastSearch${endPath}`) && this.$q.localStorage.getItem(`lastSearch${endPath}`).length > 0) {
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
    hasCustomerContractOnEvent (auxiliary, startDate, endDate = startDate) {
      if (!auxiliary.contracts || auxiliary.contracts.length === 0) return false;
      if (!auxiliary.contracts.some(contract => contract.status === CUSTOMER_CONTRACT)) return false;

      const customerContracts = auxiliary.contracts.filter(contract => contract.status === CUSTOMER_CONTRACT);

      return customerContracts.some(contract => {
        return this.$moment(contract.startDate).isSameOrBefore(endDate) &&
          (!contract.endDate || this.$moment(contract.endDate).isSameOrAfter(startDate));
      });
    },
    hasCompanyContractOnEvent (auxiliary, startDate, endDate = startDate) {
      if (!auxiliary.contracts || auxiliary.contracts.length === 0) return false;
      if (!auxiliary.contracts.some(contract => contract.status === COMPANY_CONTRACT)) return false;

      const companyContracts = auxiliary.contracts.filter(contract => contract.status === COMPANY_CONTRACT);

      return companyContracts.some(contract => {
        return this.$moment(contract.startDate).isSameOrBefore(endDate) &&
          (!contract.endDate || this.$moment(contract.endDate).isAfter(startDate));
      });
    },
    getRowEvents (rowId) {
      const rowEvents = this.events.find(group => group._id === rowId);

      return (!rowEvents || !rowEvents.events) ? [] : rowEvents.events;
    },
    // Event creation
    canCreateEvent (person, selectedDay) {
      const hasCustomerContractOnEvent = this.hasCustomerContractOnEvent(person, selectedDay);
      const hasCompanyContractOnEvent = this.hasCompanyContractOnEvent(person, selectedDay);

      return hasCustomerContractOnEvent || hasCompanyContractOnEvent;
    },
    resetCreationForm ({ partialReset, type = INTERVENTION }) {
      this.$v.newEvent.$reset();
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
          address: {},
          attachment: {},
          ...(type === ABSENCE && { absenceNature: DAILY }),
        };
      }
    },
    closeCreationModal () {
      this.creationModal = false;
    },
    getPayload (event) {
      let payload = { ...omit(event, ['dates', '__v', 'company']) }
      payload = pickBy(payload);

      payload.startDate = event.dates.startDate;
      payload.endDate = event.dates.endDate;

      if (event.type === INTERVENTION) {
        const customer = this.customers.find(cus => cus._id === event.customer);
        if (customer) {
          const subscription = customer.subscriptions.find(sub => sub._id === event.subscription);
          if (subscription && subscription.service) payload.status = subscription.service.type;
        }
      }

      if (event.auxiliary) delete payload.sector;

      if (event.type === ABSENCE && event.absence !== ILLNESS && event.absence !== WORK_ACCIDENT) payload.attachment = {};

      return payload;
    },
    getCreationPayload (event) {
      const payload = this.getPayload(event);

      if (event.address && !event.address.fullAddress) delete payload.address;
      if (event.type === ABSENCE && event.absence !== ILLNESS && event.absence !== WORK_ACCIDENT) payload.attachment = {};

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

      const auxiliaryEvents = eventType !== ABSENCE
        ? this.getAuxiliaryEventsBetweenDates(scheduledEvent.auxiliary, scheduledEvent.startDate, scheduledEvent.endDate)
        : this.getAuxiliaryEventsBetweenDates(scheduledEvent.auxiliary, scheduledEvent.startDate, scheduledEvent.endDate, ABSENCE);

      return auxiliaryEvents.some(ev => {
        if ((scheduledEvent._id && scheduledEvent._id === ev._id) || ev.isCancelled) return false;
        return this.$moment(scheduledEvent.startDate).isBetween(ev.startDate, ev.endDate, 'minutes', '[]') ||
          this.$moment(ev.startDate).isBetween(scheduledEvent.startDate, scheduledEvent.endDate, 'minutes', '[]');
      });
    },
    getAuxiliaryEventsBetweenDates (auxiliaryId, startDate, endDate, type) {
      return this.getRowEvents(auxiliaryId)
        .filter(event => {
          return (this.$moment(event.startDate).isBetween(startDate, endDate, 'minutes', '[)') ||
            this.$moment(startDate).isBetween(event.startDate, event.endDate, 'minutes', '[)')) &&
            (!type || type === event.type)
        });
    },
    async createEvent () {
      try {
        this.loading = true;
        const payload = this.getCreationPayload(this.newEvent);
        if (!this.isCreationAllowed(payload)) {
          return NotifyNegative('Impossible de créer l\'évènement : il est en conflit avec les évènements de l\'auxiliaire.');
        }

        await Events.create(payload);

        await this.refresh();
        this.creationModal = false;
        NotifyPositive('Évènement créé');
      } catch (e) {
        console.error(e);
        if (e.data && e.data.statusCode === 422) return NotifyNegative('La création de cet évènement n\'est pas autorisée.');
        NotifyNegative('Erreur lors de la création de l\'évènement.');
      } finally {
        this.loading = false;
      }
    },
    getMessageForInternalOrUnavailability (type) {
      return `Les ${type} de la répétition en conflit avec les évènements existants ne seront pas créées. Es-tu sûr(e) de vouloir créer cette répétition ?`;
    },
    getConfirmationMessage () {
      switch (this.newEvent.type) {
        case INTERVENTION:
          return 'Les interventions de la répétition en conflit avec les évènements existants seront passées en à affecter. Es-tu sûr(e) de vouloir créer cette répétition ?';
        case INTERNAL_HOUR:
          return this.getMessageForInternalOrUnavailability('heures internes');
        case UNAVAILABILITY:
          return this.getMessageForInternalOrUnavailability('indisponibilités');
        default:
          return 'Es-tu sûr(e) de vouloir créer cette répétition ?';
      }
    },
    async validateCreationEvent () {
      try {
        this.$v.newEvent.$touch();
        const isValid = await this.waitForFormValidation(this.$v.newEvent);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

        if (this.newEvent.type === ABSENCE) {
          this.$q.dialog({
            title: 'Confirmation',
            message: 'Les interventions en conflit avec l\'absence seront passées en à affecter et les heures internes et indispo seront supprimées. Es-tu sûr(e) de vouloir créer cette absence ?',
            ok: 'OK',
            cancel: 'Annuler',
          })
            .onOk(this.createEvent)
            .onCancel(() => NotifyPositive('Création annulée.'));
        } else if (this.newEvent.auxiliary && get(this.newEvent, 'repetition.frequency', '') !== NEVER) {
          this.$q.dialog({
            title: 'Confirmation',
            message: this.getConfirmationMessage(),
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
        if (e.data && e.data.statusCode === 422) return NotifyNegative('La création de cet évènement n\'est pas autorisée.');
        NotifyNegative('Erreur lors de la création de l\'évènement.');
      }
    },
    // Event edition
    openEditionModal (event) {
      const eventPermissionInfo = { auxiliaryId: get(event, 'auxiliary._id'), sectorId: event.sector }
      const isAllowed = this.canEditEvent(eventPermissionInfo);
      if (!isAllowed) return NotifyWarning('Vous n\'avez pas les droits pour réaliser cette action.');
      this.formatEditedEvent(event);

      this.editionModal = true;
    },
    formatEditedEvent (event) {
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
        ...eventData
      } = cloneDeep(event);
      const dates = { startDate, endDate };

      switch (event.type) {
        case INTERVENTION: {
          const subscription = event.subscription._id;
          this.editedEvent = {
            isCancelled: false,
            cancel: {},
            shouldUpdateRepetition: false,
            ...eventData,
            dates,
            sector: sector || auxiliary.sector._id,
            auxiliary: auxiliary ? auxiliary._id : '',
            customer: customer ? customer._id : '',
            subscription,
            isBilled,
            address,
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
          };
          break;
        case ABSENCE:
          this.editedEvent = { address: {}, attachment: {}, ...eventData, auxiliary: auxiliary._id, dates };
          break;
        case UNAVAILABILITY:
          this.editedEvent = { shouldUpdateRepetition: false, ...eventData, auxiliary: auxiliary._id, dates };
          break;
      }
    },
    canEditEvent (event) {
      const ability = defineAbilitiesFor(
        get(this.loggedUser, 'role.client.name'),
        null,
        this.loggedUser.company,
        this.loggedUser._id,
        this.loggedUser.sector
      );
      return ability.can('edit', subject('Events', event));
    },
    resetEditionForm () {
      this.$v.editedEvent.$reset();
      this.editedEvent = {};
    },
    closeEditionModal () {
      this.editionModal = false;
    },
    getEditionPayload (event) {
      const payload = this.getPayload(event);

      if (event.cancel && Object.keys(event.cancel).length === 0) delete payload.cancel;
      if (event.attachment && Object.keys(event.attachment).length === 0) delete payload.attachment;
      if (event.shouldUpdateRepetition) delete payload.misc;
      if (event.auxiliary) delete payload.sector;
      if (event.address && !event.address.fullAddress) payload.address = {};

      return omit(payload, [
        'customer',
        'repetition',
        'staffingBeginning',
        'staffingDuration',
        'type',
        'displayedStartDate',
        'displayedEndDate',
      ]);
    },
    async updateEvent () {
      try {
        await this.$v.editedEvent.$touch();
        const isValid = await this.waitForFormValidation(this.$v.editedEvent);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.getEditionPayload(this.editedEvent);

        if (!this.isEditionAllowed(payload, this.editedEvent.type)) {
          this.$v.editedEvent.$reset();
          return NotifyNegative('Impossible de modifier l\'évènement : il est en conflit avec les évènements de l\'auxiliaire.');
        }
        delete payload._id;
        await Events.updateById(this.editedEvent._id, payload);

        await this.refresh();
        this.editionModal = false;
        NotifyPositive('Évènement modifié.');
      } catch (e) {
        console.error(e)
        if (e.data && e.data.statusCode === 422) {
          this.$v.editedEvent.$reset();
          return NotifyNegative('Cette modification n\'est pas autorisée.');
        }
        NotifyNegative('Erreur lors de la modification de l\'évènement.');
      } finally {
        this.loading = false;
      }
    },
    getDragAndDropPayload (toDay, target, draggedObject) {
      const daysBetween = this.$moment(draggedObject.endDate).diff(this.$moment(draggedObject.startDate), 'days');
      const payload = {
        startDate: this.$moment(toDay).hours(this.$moment(draggedObject.startDate).hours())
          .minutes(this.$moment(draggedObject.startDate).minutes()).toISOString(),
        endDate: this.$moment(toDay).add(daysBetween, 'days').hours(this.$moment(draggedObject.endDate).hours())
          .minutes(this.$moment(draggedObject.endDate).minutes()).toISOString(),
      };

      if (target.type === SECTOR) payload.sector = target._id;
      else if (this.personKey === CUSTOMER) payload.auxiliary = draggedObject.auxiliary._id;
      else payload.auxiliary = target._id;

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
          return NotifyNegative('Impossible de modifier le bénéficiaire de l\'intervention.');
        } else {
          if (target.type === SECTOR && draggedObject.type !== INTERVENTION) return NotifyNegative('Cette modification n\'est pas autorisée.');
          if ([ABSENCE, UNAVAILABILITY].includes(draggedObject.type) && draggedObject.auxiliary._id !== target._id) {
            return NotifyNegative('Impossible de modifier l\'auxiliaire de cet évènement.');
          }
        }

        const payload = this.getDragAndDropPayload(toDay, target, draggedObject);
        if (!this.isEditionAllowed(payload, draggedObject.type)) {
          return NotifyNegative('Impossible de modifier l\'évènement : il est en conflit avec les évènements de l\'auxiliaire.');
        }

        await Events.updateById(draggedObject._id, payload);
        await this.refresh();

        NotifyPositive('Évènement modifié.');
      } catch (e) {
        if (e.data && e.data.statusCode === 422) return NotifyNegative('Cette modification n\'est pas autorisée.');
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
        message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
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
        message: 'Es-tu sûr(e) de vouloir supprimer cet évènement ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(this.deleteEvent)
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteEvent () {
      try {
        this.loading = true
        await Events.deleteById(this.editedEvent._id);

        await this.refresh();
        this.editionModal = false;
        NotifyPositive('Évènement supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de l\'événement.');
      } finally {
        this.loading = false
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
        if (shouldDeleteRepetition) NotifyNegative('Erreur lors de la suppression des évènements.');
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
  },
};
