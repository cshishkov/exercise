let passShown = false;
let cPassShown = false;

function toggle(field) {
  const element = document.getElementById(field);
  const passHideSwitch = document.getElementById('pass-hide-switch');
  const passShowSwitch = document.getElementById('pass-show-switch');
  const cPassHideSwitch = document.getElementById('c-hide-switch');
  const cPassShowSwitch = document.getElementById('c-show-switch');

  if (field === "pass") {
    passShown = !passShown;
    element.setAttribute("type", passShown ? "text" : "password");
    passHideSwitch.classList.toggle('invisible');
    passShowSwitch.classList.toggle('visible');
  } else if (field === "c-pass") {
    cPassShown = !cPassShown;
    element.setAttribute("type", cPassShown ? "text" : "password");
    cPassHideSwitch.classList.toggle('invisible');
    cPassShowSwitch.classList.toggle('visible');
  }
}

document.getElementById("register-form").addEventListener("submit", validate);

function validate(e) {
  e.preventDefault();

  const fname = document.getElementById("fname");
  const lname = document.getElementById("lname");
  const email = document.getElementById("email");
  const phoneNumber = document.getElementById("phone");
  const pass = document.getElementById("pass");
  const cPass = document.getElementById("c-pass");
  const fNameError = document.getElementById("fNameError");
  const lNameError = document.getElementById("lNameError");
  const emailError = document.getElementById("emailError");
  const phoneError = document.getElementById("phoneError");
  const passError = document.getElementById("passError");
  const cPassError = document.getElementById("cPassError");
  const genderError = document.getElementById("genderError");
  const tosError = document.getElementById("tosError");
  const gender = document.querySelector('input[name="gender"]:checked');
  const tos = document.getElementById("tos");
  const checkbox1 = document.getElementById("checkbox1");
  const checkbox2 = document.getElementById("checkbox2");
  const checkbox3 = document.getElementById("checkbox3");
  const successMessage = document.getElementById('success');
  const formErrorMessage = document.getElementById('formError');

  const textMinLength = 1;
  const textMaxLength = 20;

  let isValid = {
    firstNameValid: true,
    lastNameValid: true,
    emailValid: true,
    phoneNumberValid: true,
    passValid: true,
    cPassValid: true,
    genderValid: true,
    tosValid: true,
    checkboxValid: true,
    formValid: true
  }

  if (isRequired(fname.value)) {
    if (!isTextValid(fname.value, textMinLength, textMaxLength)) {
      isValid['firstNameValid'] = false
      showError(fNameError, "Invalid first name");
    } else {
      hideError(fNameError);
    }
  } else {
    isValid['firstNameValid'] = false
    showError(fNameError, "Field is required");
  }

  if (isRequired(lname.value)) {
    if (!isTextValid(lname.value, textMinLength, textMaxLength)) {
      isValid['lastNameValid'] = false
      showError(lNameError, "Invalid last name");
    } else {
      hideError(lNameError);
    }
  } else {
    isValid['lastNameValid'] = false
    showError(lNameError, "Field is required");
  }

  if (isRequired(email.value)) {
    if (!isEmailValid(email.value)) {
      isValid['emailValid'] = false
      showError(emailError, "Invalid email");
    } else {
      hideError(emailError);
    }
  } else {
    isValid['emailValid'] = false
    showError(emailError, "Field is required");
  }

  if (isRequired(phoneNumber.value)) {
    if (!isPhoneValid(phoneNumber.value)) {
      isValid['phoneNumberValid'] = false
      showError(phoneError, "Invalid phone number");
    } else {
      hideError(phoneError);
    }
  } else {
    isValid['phoneNumberValid'] = false
    showError(phoneError, "Field is required");
  }

  if (isRequired(pass.value)) {
    if (!isPasswordValid(pass.value)) {
      isValid['passValid'] = false
      showError(passError, "Invalid password");
    } else {
      hideError(passError);
    }
  } else {
    isValid['passValid'] = false
    showError(passError, "Field is required");
  }

  if (isRequired(cPass.value)) {
    if (!isPasswordValid(pass.value)) {
      isValid['cPassValid'] = false
      showError(cPassError, "Invalid password");
    } else if (!equals(pass.value, cPass.value)) {
      isValid['cPassValid'] = false
      showError(cPassError, "Passwords do not match");
    } else {
      hideError(cPassError);
    }
  } else {
    isValid['cPassValid'] = false
    showError(cPassError, "Field is required");
  }

  if (!gender) {
    isValid['genderValid'] = false
    showError(genderError, "Please select a gender");
  } else {
    hideError(genderError);
  }

  if (!tos.checked) {
    isValid['tosValid'] = false
    showError(tosError, "TOS are required");
  } else {
    hideError(tosError);
  }

  const checkedCount = [checkbox1, checkbox2, checkbox3].filter(
    (checkbox) => checkbox.checked
  ).length;
  if (checkedCount == 0) {
    isValid['checkboxValid'] = false
    showError(checkboxError, 'Please select at least 2 options')
  } else if (checkedCount > 2) {
    isValid['checkboxValid'] = false
    showError(checkboxError, "Please select 2 out of 3 options");
  } else {
    hideError(checkboxError);
  }

  if (Object.values(isValid).every(Boolean)) {
    showSuccess(successMessage, 'Submitted');
    hideError(formErrorMessage);
  } else {
    hideSuccess(successMessage);
    showError(formErrorMessage, "Form has errors");
  }
}

function isRequired(value) {
  return value.trim() !== "";
}

function equals(firstValue, secondValue) {
  return firstValue.trim() === secondValue.trim();
}

function showError(element, message) {
  element.classList.add("visible");
  element.textContent = message;
}

function showSuccess(element, message) {
  element.classList.add('visible');
  element.textContent = message;
}

function hideError(element) {
  element.classList.remove("visible");
  element.textContent = "";
}

function hideSuccess(element) {
  element.classList.remove("visible");
  element.textContent = "";
}

function isTextValid(text, min, max) {
  const value = String(text.trim());
  const textRegex = /^[A-Za-z]{1,20}$/;
  return textRegex.test(value) && isBetween(value.length, min, max);
}

function isEmailValid(email) {
  const value = String(email.trim()).toLocaleLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

function isPhoneValid(phone) {
  const value = String(phone.trim()).toLocaleLowerCase();
  const phoneNumberRegex = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/;
  return phoneNumberRegex.test(value);
}

function isPasswordValid(password) {
  const value = String(password.trim());
  const passRegex = /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W]).{6,20})/;
  return passRegex.test(value);
}

function isBetween(length, min, max) {
  return length >= min && length <= max;
}