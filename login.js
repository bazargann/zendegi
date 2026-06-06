if (sessionStorage.getItem('authToken')) {
    window.location.href = './workout.html';
}

const phoneStep = document.getElementById('phoneStep');
const otpStep = document.getElementById('otpStep');
const loginPhone = document.getElementById('loginPhone');
const sendOtpBtn = document.getElementById('sendOtpBtn');
const verifyOtpBtn = document.getElementById('verifyOtpBtn');
const resendBtn = document.getElementById('resendBtn');
const changePhoneBtn = document.getElementById('changePhoneBtn');
const phoneDisplay = document.getElementById('phoneDisplay');
const alertBox = document.getElementById('alertBox');
let timerEl = document.getElementById('timer');
const otpBoxes = document.querySelectorAll('.otp-box');

const phonePattern = /^09\d{9}$/;
let currentPhone = '';
let timerInterval = null;

function showAlert(message, type = 'error') {
    alertBox.textContent = message;
    alertBox.className = `alert-message ${type}`;
    alertBox.classList.remove('step-hidden');
}

function hideAlert() {
    alertBox.classList.add('step-hidden');
}

function validatePhone() {
    const isValid = phonePattern.test(loginPhone.value.trim());
    loginPhone.classList.toggle('is-invalid', !isValid);
    loginPhone.classList.toggle('is-valid', isValid);
    return isValid;
}

function setLoading(button, isLoading, defaultText) {
    button.disabled = isLoading;
    button.textContent = isLoading ? 'لطفاً صبر کنید...' : defaultText;
}

function getOtpCode() {
    return Array.from(otpBoxes).map(box => box.value).join('');
}

function clearOtpBoxes() {
    otpBoxes.forEach(box => {
        box.value = '';
    });
    otpBoxes[0].focus();
}

function showOtpStep() {
    phoneStep.classList.add('step-hidden');
    otpStep.classList.remove('step-hidden');
    phoneDisplay.textContent = currentPhone;
    clearOtpBoxes();
    startTimer();
    hideAlert();
}

function showPhoneStep() {
    otpStep.classList.add('step-hidden');
    phoneStep.classList.remove('step-hidden');
    stopTimer();
    hideAlert();
}

function resetResendButton() {
    resendBtn.innerHTML = 'ارسال مجدد (<span id="timer">120</span>)';
    timerEl = document.getElementById('timer');
}

function startTimer(seconds = 120) {
    stopTimer();
    resetResendButton();

    let remaining = seconds;
    timerEl.textContent = remaining;
    resendBtn.disabled = true;

    timerInterval = setInterval(() => {
        remaining -= 1;
        timerEl.textContent = remaining;

        if (remaining <= 0) {
            stopTimer();
            resendBtn.disabled = false;
            resendBtn.textContent = 'ارسال مجدد کد';
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function apiRequest(endpoint, body) {
    const headers = { ...API_CONFIG.HEADERS };

    if (API_CONFIG.TOKEN) {
        headers.Authorization = `Bearer ${API_CONFIG.TOKEN}`;
    }

    return fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    }).then(async response => {
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.message || 'خطا در ارتباط با سرور');
        }

        return data;
    });
}

function sendOtp(phone) {
    if (API_CONFIG.MOCK_MODE && !API_CONFIG.TOKEN) {
        return Promise.resolve({ success: true, message: 'کد آزمایشی: 123456' });
    }

    const body = { [API_CONFIG.PHONE_FIELD]: phone };
    return apiRequest(API_CONFIG.SEND_OTP_ENDPOINT, body);
}

function verifyOtp(phone, code) {
    if (API_CONFIG.MOCK_MODE && !API_CONFIG.TOKEN) {
        if (code === API_CONFIG.MOCK_OTP) {
            return Promise.resolve({ token: 'mock-token-' + phone });
        }
        throw new Error('کد وارد شده اشتباه است');
    }

    const body = {
        [API_CONFIG.PHONE_FIELD]: phone,
        [API_CONFIG.OTP_FIELD]: code
    };
    return apiRequest(API_CONFIG.VERIFY_OTP_ENDPOINT, body);
}

loginPhone.addEventListener('input', () => {
    loginPhone.value = loginPhone.value.replace(/\D/g, '');

    if (loginPhone.classList.contains('is-invalid') || loginPhone.classList.contains('is-valid')) {
        validatePhone();
    }
});

sendOtpBtn.addEventListener('click', () => {
    hideAlert();

    if (!validatePhone()) {
        return;
    }

    currentPhone = loginPhone.value.trim();
    setLoading(sendOtpBtn, true, 'ارسال کد یکبار مصرف');

    sendOtp(currentPhone)
        .then(data => {
            showOtpStep();

            if (API_CONFIG.MOCK_MODE && !API_CONFIG.TOKEN) {
                showAlert('حالت آزمایشی: کد 123456 را وارد کنید', 'success');
            } else if (data.message) {
                showAlert(data.message, 'success');
            }
        })
        .catch(error => {
            showAlert(error.message || 'ارسال کد با خطا مواجه شد');
        })
        .finally(() => {
            setLoading(sendOtpBtn, false, 'ارسال کد یکبار مصرف');
        });
});

verifyOtpBtn.addEventListener('click', () => {
    hideAlert();
    const code = getOtpCode();

    if (code.length !== 6) {
        showAlert('لطفاً کد ۶ رقمی را کامل وارد کنید');
        return;
    }

    setLoading(verifyOtpBtn, true, 'تایید و ورود');

    verifyOtp(currentPhone, code)
        .then(data => {
            const token = data.token || data.accessToken || data.access_token;

            if (!token) {
                throw new Error('توکن از سرور دریافت نشد');
            }

            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('userPhone', currentPhone);
            window.location.href = './workout.html';
        })
        .catch(error => {
            showAlert(error.message || 'کد وارد شده نامعتبر است');
        })
        .finally(() => {
            setLoading(verifyOtpBtn, false, 'تایید و ورود');
        });
});

resendBtn.addEventListener('click', () => {
    if (resendBtn.disabled) {
        return;
    }

    hideAlert();
    resendBtn.disabled = true;
    resendBtn.textContent = 'در حال ارسال...';

    sendOtp(currentPhone)
        .then(() => {
            clearOtpBoxes();
            startTimer();

            if (API_CONFIG.MOCK_MODE && !API_CONFIG.TOKEN) {
                showAlert('کد جدید ارسال شد. کد آزمایشی: 123456', 'success');
            } else {
                showAlert('کد جدید ارسال شد', 'success');
            }
        })
        .catch(error => {
            showAlert(error.message || 'ارسال مجدد با خطا مواجه شد');
            resendBtn.disabled = false;
            resendBtn.textContent = 'ارسال مجدد کد';
        });
});

changePhoneBtn.addEventListener('click', () => {
    showPhoneStep();
    clearOtpBoxes();
});

otpBoxes.forEach((box, index) => {
    box.addEventListener('input', () => {
        box.value = box.value.replace(/\D/g, '').slice(-1);

        if (box.value && index < otpBoxes.length - 1) {
            otpBoxes[index + 1].focus();
        }

        if (getOtpCode().length === 6) {
            verifyOtpBtn.click();
        }
    });

    box.addEventListener('keydown', event => {
        if (event.key === 'Backspace' && !box.value && index > 0) {
            otpBoxes[index - 1].focus();
        }
    });

    box.addEventListener('paste', event => {
        event.preventDefault();
        const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

        pasted.split('').forEach((digit, i) => {
            if (otpBoxes[i]) {
                otpBoxes[i].value = digit;
            }
        });

        if (pasted.length === 6) {
            verifyOtpBtn.click();
        } else if (pasted.length > 0) {
            otpBoxes[Math.min(pasted.length, otpBoxes.length - 1)].focus();
        }
    });
});
