export const userFields = [
  "id",
  "full_name",
  "email",
  "password",
  "status",
  "email_verified",
  "avatar",
  "reset_token",
  "reset_token_exp",
  "created_at",
  "updated_at",
];

export const doctorProfileFields = [
  "id",
  "user_id",
  "location_id",
  "category",
  "title",
  "first_name",
  "last_name",
  "email",
  "phone_number",
  "pob",
  "dob",
  "address",
  "sex",
  "is_active",
  "created_at",
  "updated_at",
];

export const doctorFields = {
  fields: {
    id: [],
    user_id: ["USR"],
    location_id: [],
    category: [],
    title: [],
    first_name: [],
    last_name: [],
    email: ["USR"],
    phone_number: ["USR"],
    pob: ["USR"],
    dob: ["USR"],
    address: ["USR"],
    avatar: [],
    sex: [],
    grade_id: [],
    is_active: [],
    created_at: [],
    updated_at: [],
  },
  relations: {
    user: ["USR"],
    location: [],
    specialisms: [],
    grade: [],
  },
  get(role = "") {
    return Object.keys(this.fields).filter((k) =>
      role ? !this.fields[k].includes(role) : true
    );
  },
  full(role = "") {
    const join = { ...this.fields, ...this.relations };
    return Object.keys(join).filter((k) =>
      role ? !join[k].includes(role) : true
    );
  },
};

export const serviceFields = {
  fields: {
    id: [],
    category_id: [],
    location_id: [],
    title: [],
    description: [],
    duration: [],
    duration_description: [],
    price: [],
    price_unit: [],
    price_minimum: [],
    doctor_fee: [],
    is_active: [],
  },
  relations: {
    category: [],
    location: [],
    doctors: [],
    sessions: [],
    required_services: [],
    prerequisite_For: [],
    questionnaires: [],
    bookings: [],
  },
  getFields(role = "") {
    return Object.keys(this.fields).filter((k) =>
      role ? !this.fields[k].includes(role) : true
    );
  },
  withRelation(role = "") {
    const join = { ...this.fields, ...this.relations };
    return Object.keys(join).filter((k) =>
      role ? !join[k].includes(role) : true
    );
  },
};

export const questionFields = [
  "id",
  "questionnaire_id",
  "code",
  "section",
  "label",
  "name",
  "hint",
  "help",
  "typ",
  "min",
  "max",
  "file_typ",
  "file_max_byte",
  "other",
  "required",
];

export const questionAnswerFields = [
  "id",
  "response_id",
  "question_id",
  "text",
  "number",
  "date",
];

export const bookingFields = {
  fields: {
    id: [],
    profile_id: [],
    user_id: [],
    status: [],
    total: [],
    is_locked: [],
    created_at: [],
    updated_at: [],
  },
  relations: {
    profile: [],
    user: [],
    services: [],
    payments: [],
  },
  getFields(role = "") {
    return Object.keys(this.fields).filter((k) =>
      role ? !this.fields[k].includes(role) : true
    );
  },
  withRelation(role = "") {
    const join = { ...this.fields, ...this.relations };
    return Object.keys(join).filter((k) =>
      role ? !join[k].includes(role) : true
    );
  },
};

export const bookingServiceFields = {
  fields: {
    id: [],
    booking_id: [],
    service_id: [],
    category_id: [],
    location_id: [],
    compliant: [],
    quantity: [],
    service_data: [],
    is_locked: [],
    created_at: [],
    updated_at: [],
  },
  relations: {
    questionnaire_responses: [],
    doctor_sessions: [],
    booking: [],
    service: [],
  },
  getFields(role = "") {
    return Object.keys(this.fields).filter((k) =>
      role ? !this.fields[k].includes(role) : true
    );
  },
  withRelation(role = "") {
    const join = { ...this.fields, ...this.relations };
    return Object.keys(join).filter((k) =>
      role ? !join[k].includes(role) : true
    );
  },
};

export const QuestionnaireResponseFields = {
  fields: {
    id: [],
    note: [],
    user_id: [],
    client_id: [],
    questionnaire_id: [],
    booking_service_id: [],
    is_locked: [],
    created_at: [],
    updated_at: [],
  },
  relations: {
    user: [],
    client: [],
    questionnaire: [],
    booking_service: [],
    answers: [],
  },
  getFields(role = "") {
    return Object.keys(this.fields).filter((k) =>
      role ? !this.fields[k].includes(role) : true
    );
  },
  withRelation(role = "") {
    const join = { ...this.fields, ...this.relations };
    return Object.keys(join).filter((k) =>
      role ? !join[k].includes(role) : true
    );
  },
};
