export const TOKEN_EXPIRE_DAY = 1; // in days

// MEDIA
export const BLUE_TEXT_LOGO = 'https://storage.googleapis.com/compani-main/icons/compani_texte_bleu.png';
export const DOC_EXTENSIONS = 'image/jpg, image/jpeg, application/pdf';
export const IMAGE_EXTENSIONS = 'image/jpg, image/jpeg, image/png';
export const VIDEO_EXTENSIONS = 'video/*';
export const AUDIO_EXTENSIONS = 'audio/*';
export const HTML_EXTENSIONS = '.html';

// CUSTOMER
export const MR = 'mr';
export const MRS = 'mrs';
export const CIVILITY_OPTIONS = [
  { label: 'Monsieur', value: MR },
  { label: 'Madame', value: MRS },
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
  firstOfJanuary: '1er janvier',
  evening: 'Soirée',
  custom: 'Personnalisée',
};

// CUSTOMERS SITUATION
export const UNKNOWN = 'unknown';
export const HOME = 'home';
export const NURSING_HOME = 'nursing_home';
export const HOSPITALIZED = 'hospitalized';
export const DECEASED = 'deceased';

export const OTHER = 'other';

// CONTRACTS
export const CONTRACT = 'contract';

// EVENTS
export const ABSENCE = 'absence';

export const EDITION = 'edition';
export const DELETION = 'deletion';
export const CREATION = 'creation';

// THIRD PARTY PAYERS
export const BILLING_INDIRECT = 'indirect';
export const BILLING_DIRECT = 'direct';
export const APA = 'APA';
export const PCH = 'PCH';
export const AM = 'AM';
export const TPP_TYPE_OPTIONS = [
  { label: 'APA', value: APA },
  { label: 'Aide ménagère', value: AM },
  { label: 'PCH', value: PCH },
];

// AVATAR
export const DEFAULT_AVATAR = 'https://storage.googleapis.com/compani-main/default_avatar.png';
export const UNKNOWN_AVATAR = 'https://storage.googleapis.com/compani-main/unknown_avatar.png';

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

// ROLES VENDOR
export const VENDOR_ADMIN = 'vendor_admin';
export const TRAINING_ORGANISATION_MANAGER = 'training_organisation_manager';
export const TRAINER = 'trainer';

// ROLES HOLDING
export const HOLDING_ADMIN = 'holding_admin';

export const AUXILIARY_ROLES = [AUXILIARY, PLANNING_REFERENT, AUXILIARY_WITHOUT_COMPANY];
export const COACH_ROLES = [CLIENT_ADMIN, COACH];
export const ROLE_TRANSLATION = {
  [HELPER]: 'Aidant(e)',
  [AUXILIARY]: 'Auxiliaire',
  [PLANNING_REFERENT]: 'Auxiliaire',
  [AUXILIARY_WITHOUT_COMPANY]: 'Auxiliaire',
  [CLIENT_ADMIN]: 'Administrateur(rice)',
  [VENDOR_ADMIN]: 'Administrateur(rice) Vendeur',
  [COACH]: 'Coach',
  [TRAINING_ORGANISATION_MANAGER]: 'Responsable Formation',
  [TRAINER]: 'Formateur(rice)',
};

// ROLE TRANSLATION
export const ROLES_TRANSLATION = {
  [CLIENT_ADMIN]: 'Administrateur(rice)',
  [COACH]: 'Coach',
};

// SUBSCRIPTIONS
export const ERP = 'erp';

// PLANNING
export const PLANNING_VIEW_START_HOUR = 7;
export const PLANNING_VIEW_END_HOUR = 22;
export const SECTOR = 'sector';

export const REQUIRED_LABEL = 'Champ requis';
export const INVALID_NUMBER = 'Nombre invalide';

// BILLING
export const TWO_WEEKS = 'two_weeks';
export const BILL = 'bill';
export const CREDIT_NOTE = 'creditNote';

// PAYMENTS
export const DIRECT_DEBIT = 'direct_debit';
export const BANK_TRANSFER = 'bank_transfer';
export const CHECK = 'check';
export const CESU = 'cesu';
export const CASH = 'cash';
export const CREDIT = 'credit';
export const CREDIT_OPTION = { label: 'Crédit', value: CREDIT };
export const PAYMENT_OPTIONS = [
  { label: 'Prélèvement', value: DIRECT_DEBIT },
  { label: 'Virement', value: BANK_TRANSFER },
  { label: 'Chèque', value: CHECK },
  { label: 'CESU', value: CESU },
  { label: 'Espèces', value: CASH },
];
export const REFUND = 'refund';
export const PAYMENT = 'payment';
export const PAYMENT_NATURE_OPTIONS = [
  { label: 'Paiement', value: PAYMENT },
  { label: 'Remboursement', value: REFUND },
];

// FUNDINGS
export const THIRD_PARTY_PAYER = 'thirdPartyPayer';

// PAY
export const PAY = 'pay';

// ORIGINS
export const COMPANI = 'compani';
export const THIRD_PARTY = 'third_party';
export const OGUST = 'ogust';

export const WEEKS_PER_MONTH = (52 / 12);

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
export const COURSE_SMS = 'Formation';

// COURSE
export const INTRA = 'intra';
export const INTER_B2B = 'inter_b2b';
export const INTRA_HOLDING = 'intra_holding';
export const COURSE_TYPES = [
  { label: 'Intra', value: INTRA },
  { label: 'Inter B2B', value: INTER_B2B },
  { label: 'Intra société mère', value: INTRA_HOLDING },
];
export const BLENDED = 'blended';
export const STRICTLY_E_LEARNING = 'strictly_e_learning';
export const FORTHCOMING = 'forthcoming';
export const IN_PROGRESS = 'inProgress';
export const COMPLETED = 'completed';
export const OPERATIONS = 'operations';
export const PEDAGOGY = 'pedagogy';
export const ARCHIVED_COURSES = 'archived_courses';
export const UNARCHIVED_COURSES = 'unarchived_courses';

// SUBPROGRAM
export const PUBLISHED = 'published';

// STEP
export const E_LEARNING = 'e_learning';
export const ON_SITE = 'on_site';
export const REMOTE = 'remote';
export const STEP_TYPES = [
  { label: 'eLearning', value: E_LEARNING },
  { label: 'présentiel', value: ON_SITE },
  { label: 'distanciel', value: REMOTE },
];
export const REUSE_STEP = 'reuse_step';
export const CREATE_STEP = 'create_step';
export const STEP_ATTACHEMENT_OPTIONS = [
  { label: 'Créer', value: CREATE_STEP },
  { label: 'Réutiliser', value: REUSE_STEP },
];

// ACTIVITY
export const LESSON = 'lesson';
export const QUIZ = 'quiz';
export const SHARING_EXPERIENCE = 'sharing_experience';
export const VIDEO = 'video';
export const ACTIVITY_TYPES = [
  { label: 'Cours', value: LESSON },
  { label: 'Quiz', value: QUIZ },
  { label: 'Témoignage', value: SHARING_EXPERIENCE },
  { label: 'Vidéo', value: VIDEO },
];

// QUESTIONNAIRE
export const QUESTIONNAIRE = 'questionnaire';
export const START_COURSE = 'start_course';
export const END_COURSE = 'end_course';
export const VALIDATE = 'validate';
export const ADJUST = 'adjust';

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

export const SINGLE_CHOICE_QUESTION_MAX_FALSY_ANSWERS_COUNT = 3;
export const SINGLE_CHOICE_QUESTION_MIN_FALSY_ANSWERS_COUNT = 1;
export const MULTIPLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT = 4;
export const MULTIPLE_CHOICE_QUESTION_MIN_ANSWERS_COUNT = 2;
export const FILL_THE_GAPS_MIN_ANSWERS_COUNT = 2;
export const FILL_THE_GAPS_MAX_ANSWERS_COUNT = 6;
export const ORDER_THE_SEQUENCE_MIN_ANSWERS_COUNT = 2;
export const ORDER_THE_SEQUENCE_MAX_ANSWERS_COUNT = 3;
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
export const ESTIMATED_START_DATE_EDITION = 'estimated_start_date_edition';
export const COMPANY_ADDITION = 'company_addition';
export const COMPANY_DELETION = 'company_deletion';

// MEDIA UPLOAD
export const UPLOAD_IMAGE = 'image';
export const UPLOAD_VIDEO = 'video';
export const UPLOAD_AUDIO = 'audio';
export const UPLOAD_EXTENSION_OPTIONS = [
  { label: 'Image', value: UPLOAD_IMAGE },
  { label: 'Video', value: UPLOAD_VIDEO },
  { label: 'Audio', value: UPLOAD_AUDIO },
];

// ACCESS RULES
export const FREE_ACCESS = 'free';
export const RESTRICTED_ACCESS = 'restricted';
export const ACCESS_OPTIONS = [
  { label: 'Libre accès', value: FREE_ACCESS },
  { label: 'Choisir une structure', value: RESTRICTED_ACCESS },
];

// ORIGIN
export const WEBAPP = 'webapp';

// FORMAT
export const PDF = 'pdf';
export const ALL_PDF = 'all_pdf';
export const ALL_WORD = 'all_word';

// TYPE
export const CUSTOM = 'custom';
export const OFFICIAL = 'official';

// Email
export const TRAINEE = 'trainee';

// QUESTIONNAIRE
export const EXPECTATIONS = 'expectations';
export const END_OF_COURSE = 'end_of_course';
export const SELF_POSITIONNING = 'self_positionning';
export const DRAFT = 'draft';
export const QUESTIONNAIRE_TYPES = {
  [EXPECTATIONS]: 'Recueil des attentes',
  [END_OF_COURSE]: 'Fin de formation',
  [SELF_POSITIONNING]: 'Auto-positionnement',
};
export const REVIEW = 'review';

// EXPORTS
export const SERVICE = 'service';
export const SUBSCRIPTION = 'subscription';
export const FUNDING = 'funding';
export const RUP = 'rup';
export const REFERENT = 'referent';
export const WORKING_EVENT = 'working_event';
export const TRANSPORT = 'transport';
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
  { label: 'Transports', value: TRANSPORT },
];
export const COURSE = 'course';
export const COURSE_SLOT = 'course_slot';
export const COURSE_BILL = 'course_bill';
export const COURSE_PAYMENT = 'course_payment';
export const VENDOR_EXPORT_HISTORY_TYPES = [
  { label: 'Formations', value: COURSE },
  { label: 'Créneaux', value: COURSE_SLOT },
  { label: 'Questionnaires de satisfaction', value: END_OF_COURSE },
  { label: 'Factures et avoirs', value: COURSE_BILL },
  { label: 'Paiements et remboursements', value: COURSE_PAYMENT },
];

// CUSTOMER STATUS
export const ACTIVATED = 'activated';
export const STOPPED = 'stopped';
export const ARCHIVED = 'archived';
export const STATUS_TYPES = { [ACTIVATED]: 'Actif', [STOPPED]: 'Arrêté', [ARCHIVED]: 'Archivé' };

// TIMESTAMPING
export const MANUAL_TIME_STAMPING = 'manual_time_stamping';
export const QR_CODE_TIME_STAMPING = 'qr_code_time_stamping';
export const TIME_STAMPING_ACTIONS = [MANUAL_TIME_STAMPING, QR_CODE_TIME_STAMPING];
export const QRCODE_MISSING = 'qrcode_missing';
export const QRCODE_ERROR = 'qrcode_error';
export const CAMERA_ERROR = 'camera_error';
export const MANUAL_TIME_STAMPING_REASONS = {
  [QRCODE_MISSING]: 'Je n\'ai pas accès au code barre',
  [QRCODE_ERROR]: 'Le code barre ne fonctionne pas',
  [CAMERA_ERROR]: 'Mon appareil photo ne fonctionne pas',
};

// NOTE
export const NOTE_CREATION = 'note_creation';
export const NOTE_UPDATE = 'note_update';

// BILLING ITEMS
export const MANUAL = 'manual';
export const AUTOMATIC = 'automatic';
export const PER_INTERVENTION = 'per_intervention';
export const BILLING_ITEMS_TYPE_OPTIONS = [
  { label: 'Manuel', value: MANUAL },
  { label: 'Par intervention', value: PER_INTERVENTION },
];

// COURSE_BILLS
export const LIST = 'list';
export const BALANCE = 'balance';
export const FUNDING_ORGANISATION = 'funding_organisation';
export const GROUP = 'group';
export const COUNT_UNIT = { [GROUP]: 'groupe', [TRAINEE]: 'stagiaire' };

// KANBAN COURSE FILTERS
export const WITHOUT_TRAINER = 'without_trainer';
export const WITHOUT_SALES_REPRESENTATIVE = 'without_sales_representative';

// END_TO_END TESTS
export const BILLING = 'billing';
export const AUTHENTICATION = 'authentication';

// DAYS
export const DAYS = {
  0: 'Lundi',
  1: 'Mardi',
  2: 'Mercredi',
  3: 'Jeudi',
  4: 'Vendredi',
  5: 'Samedi',
  6: 'Dimanche',
};

// DATE AND DURATION UNITS
export const YEAR = 'year';
export const QUARTER = 'quarter';
export const MONTH = 'month';
export const WEEK = 'week';
export const DAY = 'day';
export const HOUR = 'hour';
export const MINUTE = 'minute';
export const SECOND = 'second';
export const MILLISECOND = 'millisecond';

// COMPANIDURATION
export const PT0S = 'PT0S';

// COMPANIDURATION FORMATS
export const LONG_DURATION_H_MM = 'h\'h\' mm\'min\'';
export const SHORT_DURATION_H_MM = 'h\'h\'mm';

// COMPANIDATE FORMATS
export const DD_MM_YYYY = 'dd/LL/yyyy';
export const DD_MM = 'dd/LL';
export const MM_YYYY = 'LL-yyyy';
export const HHhMM = 'HH\'h\'mm';
export const DAY_MONTH_YEAR = 'DDD';
export const HH_MM = 'T';
export const MONTH_SHORT = 'LLL';
export const MONTH_SHORT_YYYY = 'LLL yyyy';
export const DAY_OF_MONTH = 'd';
export const DAY_OF_WEEK_SHORT = 'ccc';

// LEARNERS
export const DIRECTORY = 'directory';

// BUTTONS TYPES
export const FLOATING = 'floating';
export const MODAL = 'modal';

// QUESTIONNAIRE CARD NAVIGATION
export const DECREMENT = 'decrement';
export const INCREMENT = 'increment';
export const GO_TO_CARD = 'go_to_card';
export const START_CARD_INDEX = -1;

// OPTION GROUP TYPE
export const CHECKBOX = 'checkbox';
export const RADIO = 'radio';

// TRAINER MISSION CREATION METHOD TYPES
export const UPLOAD = 'upload';
export const GENERATION = 'generation';
export const CREATION_METHOD_OPTIONS = [
  { label: 'Téléverser', value: UPLOAD },
  { label: 'Générer', value: GENERATION },
];
