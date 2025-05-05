const BASE_URL = "http://192.168.1.201:8000/api";

export const API = {
DEVBASEURL: "http://192.168.1.201:8000/",
  AUTH: {
    LOGIN: `${BASE_URL}/login`,
    GOOGLE_LOGIN: `${BASE_URL}/login/google`,
    REGISTER: `${BASE_URL}/register`,
  },
  SHORT_LINKS: {
    URL: `http://192.168.1.201:8000/s/`,
    GET_ALL: `${BASE_URL}/my-short-links`,
    CREATE: `${BASE_URL}/short-links`,
    CREATE_AUTH: `${BASE_URL}/short-links-user`,
    UPDATE: `${BASE_URL}/short-links-user`,
  },
  QR_CODES: {
    CREATE: `${BASE_URL}/qr-codes-user`,
    GET_ALL: `${BASE_URL}/my-qr-codes`,
    UPLOAD: `${BASE_URL}/upload-qr-codes`,
    UPDATE: `${BASE_URL}/qr-codes-user`,
    DELETE: `${BASE_URL}/qr-codes`,
  },
  FILES: {
    GET_ALL: `${BASE_URL}/files`,
    UPLOAD: `${BASE_URL}/files/upload`,
    DELETE: `${BASE_URL}/files`,
  },
    USERS: {
        GET_USER: `${BASE_URL}/user`,
        UPDATE_USER: `${BASE_URL}/user`,
        DELETE_USER: `${BASE_URL}/user`,
        GOOGLE_LOGIN: `${BASE_URL}/login/google`,
    },
  // Ajoute ici d'autres groupes d’API selon tes besoins
};
