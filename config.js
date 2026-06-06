const API_CONFIG = {
    BASE_URL: 'https://YOUR-API-BASE-URL.com',
    TOKEN: '',

    SEND_OTP_ENDPOINT: '/otp/send',
    VERIFY_OTP_ENDPOINT: '/otp/verify',

    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },

    PHONE_FIELD: 'mobile',
    OTP_FIELD: 'code',

    MOCK_MODE: true,
    MOCK_OTP: '123456'
};
