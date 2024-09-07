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
    user_id: [],
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
    sex: [],
    is_active: [],
    created_at: [],
    updated_at: [],
    dkeoakde: [],
  },
  relations: {
    location: [],
    specialisms: [],
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

export const serviceFields = [
  "id",
  "location_id",
  "category_id",
  "title",
  "description",
  "price",
  "price_unit",
  "duration",
  "is_active",
  "created_at",
  "updated_at",
];

export const doctorSessionFields = [
  "id",
  "doctor_id",
  "service_id",
  "date",
  "time_start",
  "time_end",
  "note",
  "is_locked",
  "created_at",
  "updated_at",
];

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

export const bookingFields = [
  "id",
  "profile_id",
  "status",
  "total",
  "created_at",
  "updated_at",
];
