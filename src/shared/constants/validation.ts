export const EMAIL_REGEX = /^[^@\s]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z0-9-]+$/;

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&£"#^~`|\\/()_+={}[\]:";'<>.,])[A-Za-z\d@$!%*?&£"#^~`|\\/()_+={}[\]:";'<>.,]/;

export const EMAIL = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 50,
};

export const DISPLAY_NAME = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
};

export const PASSWORD = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 50,
};

export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  if (email.length < EMAIL.MIN_LENGTH || email.length > EMAIL.MAX_LENGTH) {
    return {
      isValid: false,
      error: `Email must be ${EMAIL.MIN_LENGTH}-${EMAIL.MAX_LENGTH} characters`,
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true };
};

export const emailFieldValidation = {
  required: 'Email is required',
  minLength: {
    value: EMAIL.MIN_LENGTH,
    message: `Email must be at least ${EMAIL.MIN_LENGTH} characters`,
  },
  maxLength: {
    value: EMAIL.MAX_LENGTH,
    message: `Email must not exceed ${EMAIL.MAX_LENGTH} characters`,
  },
  pattern: {
    value: EMAIL_REGEX,
    message: 'Please enter a valid email address',
  },
};

export const passwordFieldValidation = {
  required: 'Password is required',
  minLength: {
    value: PASSWORD.MIN_LENGTH,
    message: `Password must be at least ${PASSWORD.MIN_LENGTH} characters`,
  },
  maxLength: {
    value: PASSWORD.MAX_LENGTH,
    message: `Password must not exceed ${PASSWORD.MAX_LENGTH} characters`,
  },
  pattern: {
    value: PASSWORD_REGEX,
    message: 'Password must contain uppercase, lowercase, number, and special character',
  },
};

export const displayNameFieldValidation = {
  required: 'Display name is required',
  minLength: {
    value: DISPLAY_NAME.MIN_LENGTH,
    message: `Display name must be at least ${DISPLAY_NAME.MIN_LENGTH} characters`,
  },
  maxLength: {
    value: DISPLAY_NAME.MAX_LENGTH,
    message: `Display name must not exceed ${DISPLAY_NAME.MAX_LENGTH} characters`,
  },
};

export const passwordConfirmFieldValidation = (password: string) => ({
  required: 'Password confirmation is required',
  validate: (value: string) => value === password || 'Passwords do not match',
});
