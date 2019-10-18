// CUSTOMER
export const CIVILITY_OPTIONS = [
  { label: 'Monsieur', value: 'mr' },
  { label: 'Madame', value: 'mrs' },
  { label: 'Monsieur / Madame', value: 'couple' },
];

// CUSTOMER FUNDING
export const MONTHLY = 'monthly';
export const ONCE = 'once';
export const FIXED = 'fixed';
export const HOURLY = 'hourly';

export const FUNDING_FREQ_OPTIONS = [
  { label: 'Mensuelle', value: MONTHLY },
  { label: 'Une seule fois', value: ONCE },
];
export const NATURE_OPTIONS = [
  { label: 'Horaire', value: HOURLY },
  { label: 'Forfaitaire', value: FIXED },
];

export const SURCHARGES = {
  'saturday': 'Samedi',
  'sunday': 'Dimanche',
  'publicHoliday': 'Jours fériés',
  'twentyFifthOfDecember': '25 décembre',
  'firstOfMay': '1er mai',
  'evening': 'Soirée',
  'custom': 'Personnalisée',
};

// CONTRACTS
export const CONTRACT = 'contract';
export const OTHER = 'other';
export const END_CONTRACT_REASONS = [
  { label: 'Rupture période d’essai employeur', value: 'employer_trial_period_termination' },
  { label: 'Rupture période d’essai salarié', value: 'employee_trial_period_termination' },
  { label: 'Démission', value: 'resignation' },
  { label: 'Licenciement faute grave', value: 'serious_misconduct_layoff' },
  { label: 'Licenciement faute lourde', value: 'gross_fault_layoff' },
  { label: 'Licenciement autre motif', value: 'other_reason_layoff' },
  { label: 'Mutation', value: 'mutation' },
  { label: 'Rupture conventionnelle', value: 'contractual_termination' },
  { label: 'Fin de stage', value: 'internship_end' },
  { label: 'Fin de contrat CDD', value: 'cdd_end' },
  { label: 'Autres', value: OTHER },
];

// EVENTS
export const INTERVENTION = 'intervention';
export const ABSENCE = 'absence';
export const UNAVAILABILITY = 'unavailability';
export const INTERNAL_HOUR = 'internalHour';
export const ILLNESS = 'illness';
export const UNJUSTIFIED = 'unjustified absence';
export const PAID_LEAVE = 'leave';
export const WORK_ACCIDENT = 'work accident';
export const ABSENCE_TYPES = [
  { label: 'Congé', value: PAID_LEAVE },
  { label: 'Congé sans solde', value: 'unpaid leave' },
  { label: 'Congé maternité', value: 'maternity leave' },
  { label: 'Maladie', value: ILLNESS },
  { label: 'Absence injustifiée', value: UNJUSTIFIED },
  { label: 'Accident du travail', value: WORK_ACCIDENT },
  { label: 'Autre', value: OTHER },
];
export const EDITION = 'edition';
export const DELETION = 'deletion';
export const CANCELLATION = 'cancellation';
export const DAILY = 'daily';
export const ABSENCE_NATURES = [
  { label: 'Journalière', value: DAILY },
  { label: 'Horaire', value: HOURLY },
];
export const EVENT_TYPES = [
  {label: 'Intervention', value: INTERVENTION},
  {label: 'Interne', value: INTERNAL_HOUR},
  {label: 'Absence', value: ABSENCE},
  {label: 'Indispo', value: UNAVAILABILITY},
];

// THIRD PARTY PAYERS
export const BILLING_INDIRECT = 'indirect';
export const BILLING_DIRECT = 'direct';

// AVATAR
export const DEFAULT_AVATAR = 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_400,q_auto,w_400/v1513764284/images/users/default_avatar.png';
export const UNKNOWN_AVATAR = 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_400,q_auto,w_400/v1563288281/images/users/unknown_avatar.png';

// REPETITION FREQUENCY
export const NEVER = 'never';
export const EVERY_DAY = 'every_day';
export const EVERY_WEEK_DAY = 'every_week_day';
export const EVERY_WEEK = 'every_week';
export const EVERY_TWO_WEEKS = 'every_two_weeks';

// CANCELLATION OPTIONS
export const INVOICED_AND_PAID = 'invoiced_and_paid';
export const INVOICED_AND_NOT_PAID = 'invoiced_and_not_paid';
export const NOT_INVOICED_AND_NOT_PAID = 'not_invoiced_and_not_paid';
export const CANCELLATION_OPTIONS = [
  { label: 'Facturée & payée', value: INVOICED_AND_PAID },
  { label: 'Facturée & non payée', value: INVOICED_AND_NOT_PAID },
  { label: 'Non facturée & non payée', value: NOT_INVOICED_AND_NOT_PAID },
];

// CANCELLATION REASONS
export const CUSTOMER_INITIATIVE = 'customer_initiative';
export const AUXILIARY_INITIATIVE = 'auxiliary_initiative';
export const CANCELLATION_REASONS = [
  { label: 'Initiative du client', value: CUSTOMER_INITIATIVE },
  { label: 'Initiative du de l\'intervenant', value: AUXILIARY_INITIATIVE },
];

// ROLES
export const COACH = 'coach';
export const ADMIN = 'admin';
export const CUSTOMER = 'customer';
export const AUXILIARY = 'auxiliary';
export const HELPER = 'helper';
export const PLANNING_REFERENT = 'planningReferent';
export const AUXILIARY_ROLES = [AUXILIARY, PLANNING_REFERENT];
export const COACH_ROLES = [ADMIN, COACH];

// PLANNING
export const THREE_DAYS_VIEW = '3days';
export const WEEK_VIEW = 'week';
export const PLANNING = 'planning';
export const AGENDA = 'agenda';
export const PLANNING_VIEW_START_HOUR = 7;
export const PLANNING_VIEW_END_HOUR = 22;
export const PLANNING_PERCENTAGE_BY_MINUTES = 100 / ((PLANNING_VIEW_END_HOUR - PLANNING_VIEW_START_HOUR) * 60);
export const STAFFING_VIEW_START_HOUR = 8;
export const STAFFING_VIEW_END_HOUR = 20;
export const STAFFING_PERCENTAGE_BY_MINUTES = 100 / ((STAFFING_VIEW_END_HOUR - STAFFING_VIEW_START_HOUR) * 60);
export const SECTOR = 'sector';
export const PERSON = 'person';
export const MAX_WEEKLY_OCCUPATION_LEVEL = 48;
export const LOW = 'low';
export const HIGH = 'high';
export const EXTREME = 'extreme';

// EVENT HISTORY
export const EVENT_CREATION = 'event_creation';
export const EVENT_DELETION = 'event_deletion';
export const EVENT_UPDATE = 'event_update';

// INDICATORS
export const WEEK_STATS = 'week_stats';
export const MONTH_STATS = 'month_stat';

// TRANSORT
export const PUBLIC_TRANSPORT = 'public';
export const PRIVATE_TRANSPORT = 'private';
export const TRANSPORT_OPTIONS = [
  { label: 'Abonnement transports en commun', value: PUBLIC_TRANSPORT },
  { label: 'Voiture personnelle', value: PRIVATE_TRANSPORT },
  { label: 'Aucun', value: 'none' },
];
export const TRANSIT = 'transit';
export const DRIVING = 'driving';

export const REQUIRED_LABEL = 'Champ requis';
export const CUSTOMER_CONTRACT = 'contract_with_customer';
export const COMPANY_CONTRACT = 'contract_with_company';
export const CONTRACT_STATUS_OPTIONS = [
  { label: 'Prestataire', value: COMPANY_CONTRACT },
  { label: 'Mandataire', value: CUSTOMER_CONTRACT },
];

// BILLING

export const TWO_WEEKS = 'two_weeks';
export const MONTH = 'month';
export const BILL = 'bill';
export const CREDIT_NOTE = 'creditNote';

// PAYMENTS
export const DIRECT_DEBIT = 'direct_debit';
export const BANK_TRANSFER = 'bank_transfer';
export const CHECK = 'check';
export const CESU = 'cesu';
export const PAYMENT_OPTIONS = [
  { label: 'Prélèvement', value: DIRECT_DEBIT },
  { label: 'Virement', value: BANK_TRANSFER },
  { label: 'Chèque', value: CHECK },
  { label: 'CESU', value: CESU },
];
export const REFUND = 'refund';
export const PAYMENT = 'payment';
export const PAYMENT_NATURE_OPTIONS = [
  { label: 'Règlement', value: PAYMENT },
  { label: 'Remboursement', value: REFUND },
];

// FUNDINGS
export const THIRD_PARTY_PAYER = 'thirdPartyPayer';

// PAY
export const PAY = 'pay';

// EXPORTS
export const SERVICE = 'service';
export const SUBSCRIPTION = 'subscription';
export const FUNDING = 'funding';
export const WORKING_EVENT = 'working_event';
export const EXPORT_TYPES = [
  { label: 'Services', value: SERVICE },
  { label: 'Souscriptions', value: SUBSCRIPTION },
  { label: 'Financements', value: FUNDING },
  { label: 'Auxiliaires', value: AUXILIARY },
  { label: 'Bénéficiaires', value: CUSTOMER },
  { label: 'Aidants', value: HELPER },
];
export const EXPORT_HISTORY_TYPES = [
  { label: 'Interventions et heures internes', value: WORKING_EVENT },
  { label: 'Factures et avoirs', value: BILL },
  { label: 'Paiements et remboursements', value: PAYMENT },
  { label: 'Absences', value: ABSENCE },
  { label: 'Paies et soldes tout compte', value: PAY },
  { label: 'Contrats', value: CONTRACT },
];

// ORIGINS
export const COMPANI = 'compani';
export const THIRD_PARTY = 'third_party';
export const OGUST = 'ogust';

export const WEEKS_PER_MONTH = (52 / 12);

// PAY DOCUMENT NATURE
export const PAYSLIP = 'payslip';
export const CERTIFICATE = 'certificate';
export const PAY_DOCUMENT_NATURES = [
  { label: 'Bulletin de paie', value: PAYSLIP },
  { label: 'Attestation', value: CERTIFICATE },
  { label: 'Autre', value: OTHER },
];
