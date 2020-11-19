export const TOKEN_EXPIRE_TIME = 1; // in days

// MEDIA
export const PINK_LOGO = 'https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/'
  + 'compani_texte_rose_1000.png';
export const DOC_EXTENSIONS = 'image/jpg, image/jpeg, application/pdf';
export const IMAGE_EXTENSIONS = 'image/jpg, image/jpeg, image/png';
export const VIDEO_EXTENSIONS = 'video/*';
export const AUDIO_EXTENSIONS = 'audio/*';

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
  saturday: 'Samedi',
  sunday: 'Dimanche',
  publicHoliday: 'Jours fériés',
  twentyFifthOfDecember: '25 décembre',
  firstOfMay: '1er mai',
  evening: 'Soirée',
  custom: 'Personnalisée',
};

// CUSTOMERS SITUATION
export const UNKNOWN = 'unknown';
export const HOME = 'home';
export const NURSING_HOME = 'nursing_home';
export const HOSPITALIZED = 'hospitalized';
export const DECEASED = 'deceased';
export const SITUATION_OPTIONS = [
  { label: 'Non renseigné', value: UNKNOWN },
  { label: 'Domicile', value: HOME },
  { label: 'EHPAD', value: NURSING_HOME },
  { label: 'Hospitalisé', value: HOSPITALIZED },
  { label: 'Décédé', value: DECEASED },
];

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
export const CONTRACT_CREATION_MANDATORY_INFO = {
  'identity.lastname': 'nom',
  'identity.firstname': 'prénom',
  'identity.birthDate': 'date de naissance',
  'identity.birthCity': 'ville de naissance',
  'identity.birthState': 'département de naissance',
  'identity.nationality': 'nationalité',
  'identity.socialSecurityNumber': 'numéro de sécurité sociale',
  'contact.address.fullAddress': 'adresse',
  establishment: 'établissement',
};

// EVENTS
export const INTERVENTION = 'intervention';
export const ABSENCE = 'absence';
export const UNAVAILABILITY = 'unavailability';
export const INTERNAL_HOUR = 'internalHour';
export const ILLNESS = 'illness';
export const UNJUSTIFIED = 'unjustified absence';
export const PAID_LEAVE = 'leave';
export const WORK_ACCIDENT = 'work accident';
export const CESSATION_OF_WORK_CHILD = 'cessation_of_work_child';
export const CESSATION_OF_WORK_RISK = 'cessation_of_work_risk';
export const ABSENCE_TYPES = [
  { label: 'Congé', value: PAID_LEAVE },
  { label: 'Congé sans solde', value: 'unpaid leave' },
  { label: 'Congé maternité', value: 'maternity leave' },
  { label: 'Maladie', value: ILLNESS },
  { label: 'Absence injustifiée', value: UNJUSTIFIED },
  { label: 'Accident du travail', value: WORK_ACCIDENT },
  { label: 'Arrêt de travail - garde d’enfant', value: CESSATION_OF_WORK_CHILD },
  { label: 'Arrêt de travail - salarié à risque', value: CESSATION_OF_WORK_RISK },
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
  { label: 'Intervention', value: INTERVENTION },
  { label: 'Interne', value: INTERNAL_HOUR },
  { label: 'Absence', value: ABSENCE },
  { label: 'Indispo', value: UNAVAILABILITY },
];

// THIRD PARTY PAYERS
export const BILLING_INDIRECT = 'indirect';
export const BILLING_DIRECT = 'direct';

// AVATAR
export const DEFAULT_AVATAR = 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_400,q_auto,w_400/v1513764284/'
  + 'images/users/default_avatar.png';
export const UNKNOWN_AVATAR = 'https://res.cloudinary.com/alenvi/image/upload/c_scale,h_400,q_auto,w_400/v1563288281/'
  + 'images/users/unknown_avatar.png';

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
  { label: 'Initiative de l\'intervenant', value: AUXILIARY_INITIATIVE },
];

// INTERFACE
export const VENDOR = 'vendor';
export const CLIENT = 'client';

// ROLES CLIENT
export const CLIENT_ADMIN = 'client_admin';
export const COACH = 'coach';
export const CUSTOMER = 'customer';
export const AUXILIARY = 'auxiliary';
export const HELPER = 'helper';
export const PLANNING_REFERENT = 'planning_referent';
export const AUXILIARY_WITHOUT_COMPANY = 'auxiliary_without_company';
export const AUXILIARY_ROLES = [AUXILIARY, PLANNING_REFERENT, AUXILIARY_WITHOUT_COMPANY];
export const COACH_ROLES = [CLIENT_ADMIN, COACH];

// ROLES VENDOR
export const VENDOR_ADMIN = 'vendor_admin';
export const TRAINING_ORGANISATION_MANAGER = 'training_organisation_manager';
export const TRAINER = 'trainer';

// ROLE TRANSLATION
export const ROLES_TRANSLATION = {
  [CLIENT_ADMIN]: 'Administrateur',
  [COACH]: 'Coach',
};

// SUBSCRIPTIONS
export const ERP = 'erp';

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
export const PREV_MONTH_STATS = 'prev_month_stat';
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
export const RUP = 'rup';
export const REFERENT = 'referent';
export const WORKING_EVENT = 'working_event';
export const EXPORT_TYPES = [
  { label: 'Services', value: SERVICE },
  { label: 'Souscriptions', value: SUBSCRIPTION },
  { label: 'Financements', value: FUNDING },
  { label: 'Auxiliaires', value: AUXILIARY },
  { label: 'Bénéficiaires', value: CUSTOMER },
  { label: 'Aidants', value: HELPER },
  { label: 'Equipes', value: SECTOR },
  { label: 'Registre unique du personnel', value: RUP },
  { label: 'Référents bénéficiaire', value: REFERENT },
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

// COMPANY
export const COMPANY = 'company';
export const ASSOCIATION = 'association';
export const COMPANY_TYPES = [
  { label: 'Association', value: ASSOCIATION },
  { label: 'Entreprise', value: COMPANY },
];

// SMS
export const CONVOCATION = 'convocation';
export const REMINDER = 'reminder';
export const HR_SMS = 'RH';
export const COURSE_SMS = 'Formation';

// COURSE
export const INTRA = 'intra';
export const INTER_B2B = 'inter_b2b';
export const COURSE_TYPES = [
  { label: 'Intra', value: INTRA },
  { label: 'Inter B2B', value: INTER_B2B },
];
export const BLENDED = 'blended';
export const STRICTLY_E_LEARNING = 'strictly_e_learning';
export const FORTHCOMING = 'forthcoming';
export const IN_PROGRESS = 'inProgress';
export const COMPLETED = 'completed';

// SUBPROGRAM
export const PUBLISHED = 'published';

// STEP
export const E_LEARNING = 'e_learning';
export const ON_SITE = 'on_site';

// ACTIVITY
export const LESSON = 'lesson';
export const QUIZ = 'quiz';
export const SHARING_EXPERIENCE = 'sharing_experience';
export const VIDEO = 'video';
export const QUESTIONNAIRE = 'questionnaire';
export const ACTIVITY_TYPES = [
  { label: 'Cours', value: LESSON },
  { label: 'Quiz', value: QUIZ },
  { label: 'Témoignage', value: SHARING_EXPERIENCE },
  { label: 'Vidéo', value: VIDEO },
  { label: 'Questionnaire', value: QUESTIONNAIRE },
];

// E-LEARNING CARDS
export const TRANSITION = 'transition';
export const TITLE_TEXT_MEDIA = 'title_text_media';
export const TITLE_TEXT = 'title_text';
export const TEXT_MEDIA = 'text_media';
export const FLASHCARD = 'flashcard';
export const FILL_THE_GAPS = 'fill_the_gaps';
export const MULTIPLE_CHOICE_QUESTION = 'multiple_choice_question';
export const SINGLE_CHOICE_QUESTION = 'single_choice_question';
export const ORDER_THE_SEQUENCE = 'order_the_sequence';
export const OPEN_QUESTION = 'open_question';
export const SURVEY = 'survey';
export const QUESTION_ANSWER = 'question_answer';
export const CARD_TEMPLATES = [
  { label: 'Transition', value: TRANSITION, type: LESSON },
  { label: 'Titre Texte Média', value: TITLE_TEXT_MEDIA, type: LESSON },
  { label: 'Titre Texte', value: TITLE_TEXT, type: LESSON },
  { label: 'Texte Média', value: TEXT_MEDIA, type: LESSON },
  { label: 'Flashcard', value: FLASHCARD, type: LESSON },
  { label: 'Texte à trou', value: FILL_THE_GAPS, type: QUIZ },
  { label: 'QCM', value: MULTIPLE_CHOICE_QUESTION, type: QUIZ },
  { label: 'QCU', value: SINGLE_CHOICE_QUESTION, type: QUIZ },
  { label: 'Mettre dans l\'ordre', value: ORDER_THE_SEQUENCE, type: QUIZ },
  { label: 'Question ouverte', value: OPEN_QUESTION, type: QUESTIONNAIRE },
  { label: 'Sondage', value: SURVEY, type: QUESTIONNAIRE },
  { label: 'Question\t&\tRéponse', value: QUESTION_ANSWER, type: QUESTIONNAIRE },
];
export const TEMPLATE_TYPES = {
  [LESSON]: 'Cours',
  [QUIZ]: 'Quiz',
  [QUESTIONNAIRE]: 'Questionnaire',
};

export const SINGLE_CHOICE_QUESTION_MAX_FALSY_ANSWERS_COUNT = 3;
export const MULTIPLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT = 4;
export const FILL_THE_GAPS_MAX_ANSWERS_COUNT = 6;
export const ORDER_THE_SEQUENCE_MAX_ANSWERS_COUNT = 3;
export const SURVEY_LABEL_MAX_LENGTH = 25;
export const QUESTION_MAX_LENGTH = 170;
export const QC_ANSWER_MAX_LENGTH = 70;
export const GAP_ANSWER_MAX_LENGTH = 15;
export const QUESTION_ANSWER_MIN_ANSWERS_COUNT = 2;
export const QUESTION_ANSWER_MAX_ANSWERS_COUNT = 4;
export const FLASHCARD_TEXT_MAX_LENGTH = 450;

// PUBLISHED_DOT
export const PUBLISHED_DOT_ACTIVE = 'active';
export const PUBLISHED_DOT_WARNING = 'warning';

// COURSE HISTORY
export const SLOT_CREATION = 'slot_creation';
export const SLOT_DELETION = 'slot_deletion';
export const SLOT_EDITION = 'slot_edition';
export const TRAINEE_ADDITION = 'trainee_addition';
export const TRAINEE_DELETION = 'trainee_deletion';

// MEDIA UPLOAD
export const UPLOAD_IMAGE = 'image';
export const UPLOAD_VIDEO = 'video';
export const UPLOAD_AUDIO = 'audio';
export const UPLOAD_EXTENSION_OPTIONS = [
  { label: 'Image', value: UPLOAD_IMAGE },
  { label: 'Video', value: UPLOAD_VIDEO },
  { label: 'Audio', value: UPLOAD_AUDIO },
];
