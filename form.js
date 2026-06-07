if (!sessionStorage.getItem('authToken')) {
    window.location.href = './login.html';
}

const DRCapital = document.getElementById('DRCapital');
const DRCity = document.getElementById('DRCity');
const userForm = document.getElementById('userForm');

const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const nationalCodeInput = document.getElementById('nationalCode');
const phoneInput = document.getElementById('phone');
const addressInput = document.getElementById('address');
const confirmInfoInput = document.getElementById('confirmInfo');
const confirmBox = document.getElementById('confirmBox');
const confirmFeedback = document.getElementById('confirmFeedback');
const aidTypeGroup = document.getElementById('aidTypeGroup');
const aidTypeError = document.getElementById('aidTypeError');
const aidTypeInputs = document.querySelectorAll('input[name="aidType"]');

const savedPhone = sessionStorage.getItem('userPhone');
if (savedPhone && phoneInput) {
    phoneInput.value = savedPhone;
    phoneInput.readOnly = true;
}

const persianNamePattern = /^[\u0600-\u06FF\s]{2,}$/;
const phonePattern = /^09\d{9}$/;

function isValidNationalCode(code) {
    if (!/^\d{10}$/.test(code) || /^(\d)\1{9}$/.test(code)) {
        return false;
    }

    const check = parseInt(code[9], 10);
    let sum = 0;

    for (let i = 0; i < 9; i++) {
        sum += parseInt(code[i], 10) * (10 - i);
    }

    const remainder = sum % 11;
    return (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);
}

function validateField(input) {
    let isValid = true;

    switch (input.id) {
        case 'firstName':
        case 'lastName':
            isValid = persianNamePattern.test(input.value.trim());
            break;
        case 'nationalCode':
            isValid = isValidNationalCode(input.value.trim());
            break;
        case 'phone':
            isValid = phonePattern.test(input.value.trim());
            break;
        case 'address':
            isValid = input.value.trim().length >= 10;
            break;
        case 'DRCapital':
        case 'DRCity':
            isValid = input.value !== '';
            break;
    }

    input.classList.toggle('is-valid', isValid && input.value.trim() !== '');
    input.classList.toggle('is-invalid', !isValid);
    return isValid;
}

function validateAidType() {
    const isValid = Array.from(aidTypeInputs).some(input => input.checked);
    aidTypeGroup.classList.toggle('is-invalid', !isValid);
    aidTypeError.classList.toggle('show', !isValid);
    return isValid;
}

function validateConfirm() {
    const isValid = confirmInfoInput.checked;
    confirmBox.classList.toggle('is-invalid', !isValid);
    confirmFeedback.classList.toggle('show', !isValid);
    return isValid;
}

function validateForm() {
    const fields = [
        firstNameInput,
        lastNameInput,
        nationalCodeInput,
        phoneInput,
        addressInput,
        DRCapital,
        DRCity
    ];

    return fields.every(validateField) && validateAidType() && validateConfirm();
}

[nationalCodeInput, phoneInput].forEach(input => {
    input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '');
    });
});

[
    firstNameInput,
    lastNameInput,
    nationalCodeInput,
    phoneInput,
    addressInput,
    DRCapital,
    DRCity
].forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid') || input.classList.contains('is-valid')) {
            validateField(input);
        }
    });
});

confirmInfoInput.addEventListener('change', validateConfirm);

aidTypeInputs.forEach(input => {
    input.addEventListener('change', validateAidType);
});

document.getElementById('backHomeBtn').addEventListener('click', () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userPhone');
    window.location.href = './login.html';
});

userForm.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!validateForm()) {
        userForm.classList.add('was-validated');
        return;
    }

    userForm.classList.add('was-validated');
    alert('اطلاعات با موفقیت ثبت شد.');
});

const xhrProvinces = new XMLHttpRequest();
xhrProvinces.open('GET', './api/provinces.json');
xhrProvinces.onload = function () {
    if (xhrProvinces.readyState === 4 && xhrProvinces.status === 200) {
        const provinces = JSON.parse(xhrProvinces.responseText);
        provinces.forEach(element => {
            DRCapital.innerHTML += `
            <option value='${element.provinceId}'>${element.provinceName}</option>`;
        });
    }
};
xhrProvinces.send();

const xhrCities = new XMLHttpRequest();
xhrCities.open('GET', './api/provinces_cities.json');
xhrCities.onload = function () {
    if (xhrCities.readyState === 4 && xhrCities.status === 200) {
        const cities = JSON.parse(xhrCities.responseText);
        cities.forEach(element => {
            DRCity.innerHTML += `
            <option value='${element.cityName}'>${element.cityName}</option>`;
        });
    }
};
xhrCities.send();

const carouselTrack = document.getElementById('carouselTrack');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const carouselDots = document.getElementById('carouselDots');
const carouselSlides = carouselTrack ? carouselTrack.children.length : 0;
let carouselIndex = 0;
let carouselTimer = null;

function goToSlide(index) {
    if (!carouselTrack || carouselSlides === 0) {
        return;
    }

    carouselIndex = (index + carouselSlides) % carouselSlides;
    carouselTrack.style.transform = `translateX(-${carouselIndex * 100}%)`;

    carouselDots.querySelectorAll('.aid-carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === carouselIndex);
    });
}

function startCarouselAutoPlay() {
    stopCarouselAutoPlay();
    carouselTimer = setInterval(() => {
        goToSlide(carouselIndex + 1);
    }, 5000);
}

function stopCarouselAutoPlay() {
    if (carouselTimer) {
        clearInterval(carouselTimer);
        carouselTimer = null;
    }
}

if (carouselTrack && carouselSlides > 0) {
    for (let i = 0; i < carouselSlides; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'aid-carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', `اسلاید ${i + 1}`);
        dot.addEventListener('click', () => {
            goToSlide(i);
            startCarouselAutoPlay();
        });
        carouselDots.appendChild(dot);
    }

    carouselPrev.addEventListener('click', () => {
        goToSlide(carouselIndex - 1);
        startCarouselAutoPlay();
    });

    carouselNext.addEventListener('click', () => {
        goToSlide(carouselIndex + 1);
        startCarouselAutoPlay();
    });

    startCarouselAutoPlay();
}


