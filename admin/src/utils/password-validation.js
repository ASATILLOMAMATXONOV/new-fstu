function isNumber(value) {
  return new RegExp('^(?=.*[0-9]).+$').test(value);
}

function isLowercaseChar(value) {
  return new RegExp('^(?=.*[a-z]).+$').test(value);
}

function isUppercaseChar(value) {
  return new RegExp('^(?=.*[A-Z]).+$').test(value);
}

function isSpecialChar(value) {
  return new RegExp('^(?=.*[-+_!@#$%^&*.,?]).+$').test(value);
}

function minLength(value) {
  return value.length > 11;
}

function hasWhitespace(value) {
  return /\s/.test(value);
}

function getPasswordValidationErrors(value) {
  const source = String(value || '');
  const errors = [];

  if (!minLength(source)) {
    errors.push('Kamida 12 ta belgi bo‘lishi kerak');
  }

  if (!isUppercaseChar(source)) {
    errors.push('Kamida 1 ta katta harf kerak');
  }

  if (!isLowercaseChar(source)) {
    errors.push('Kamida 1 ta kichik harf kerak');
  }

  if (!isNumber(source)) {
    errors.push('Kamida 1 ta raqam kerak');
  }

  if (!isSpecialChar(source)) {
    errors.push('Kamida 1 ta maxsus belgi kerak');
  }

  if (hasWhitespace(source)) {
    errors.push('Bo‘sh joy bo‘lmasligi kerak');
  }

  return errors;
}

export { getPasswordValidationErrors, hasWhitespace, isNumber, isLowercaseChar, isSpecialChar, isUppercaseChar, minLength };
