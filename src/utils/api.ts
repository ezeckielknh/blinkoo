import axios from "axios";
const BASE_URL = "https://bliic.me/api";

export const API = {
  APP_NAME: "Bliic",
  BASE_URL: "https://bliic.me/api",
  DEVBASEURL: "https://bliic.me/",
  AUTH: {
    LOGIN: `${BASE_URL}/login`,
    GOOGLE_LOGIN: `${BASE_URL}/login/google`,
    REGISTER: `${BASE_URL}/register`,
    VERIFY: `${BASE_URL}/email/verify`,
    RESEND_CODE: `${BASE_URL}/email/resend`,
  },
  SHORT_LINKS: {
    URL: `https://bliic.me/`,
    GET_ALL: `${BASE_URL}/my-short-links`,
    CREATE: `${BASE_URL}/short-links`,
    CREATE_AUTH: `${BASE_URL}/short-links-user`,
    UPDATE: `${BASE_URL}/short-links-user`,
    DELETE: `${BASE_URL}/short-links`,
    GET_ONE: `${BASE_URL}/short-links`,
  },
  QR_CODES: {
    CREATE: `${BASE_URL}/qr-codes-user`,
    GET_ALL: `${BASE_URL}/my-qr-codes`,
    UPLOAD: `${BASE_URL}/upload-qr-codes`,
    UPDATE: `${BASE_URL}/qr-codes-user`,
    DELETE: `${BASE_URL}/qr-codes`,
    VERIFY_PASSWORD: `${BASE_URL}/qr-codes/verify-password`,
    GET_TEXT: `${BASE_URL}/qr/text`,
    GET_ONE: `${BASE_URL}/qr-codes`,
  },
  FILES: {
    GET_ALL: `${BASE_URL}/files`,
    UPLOAD: `${BASE_URL}/files/upload`,
    DELETE: `${BASE_URL}/files`,
    GET_FILE: `${BASE_URL}/files`,
    DOWNLOAD: `${BASE_URL}/files/download`,
    DOWNLOAD_STATS: `${BASE_URL}/files`,
  },
  USERS: {
    GET_USER: `${BASE_URL}/user`,
    UPDATE_USER: `${BASE_URL}/update-profile`,
    DELETE_USER: `${BASE_URL}/user`,
    GOOGLE_LOGIN: `${BASE_URL}/login/google`,
    UPDATE_PASSWORD: `${BASE_URL}/update-password`,
    TRIAL_START: `${BASE_URL}/trial/start`, // Nouvelle route
    TRIAL_STATUS: `${BASE_URL}/trial/status`,
    GET_API_KEY: `${BASE_URL}/user/api-key`,
    TOGGLE_RENEW_PLAN: `${BASE_URL}/users/toggle-renew-plan`,
  },
  TRANSACTIONS: {
    GET_ALL: `${BASE_URL}/transactions`,
    CREATE: `${BASE_URL}/transactions/init`,
    VERIFY: `${BASE_URL}/transactions/verify`,
    GET_ONE: `${BASE_URL}/transactions`,
  },

  ADMIN: {
    GET_STATS: `${BASE_URL}/admin/getStats`,

    GET_ALL_USERS: (params: any) =>
      axios.get(`${BASE_URL}/admin/users`, {
        params,
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    UPDATE_USER: (id: number, data: { name: string; email: string }) =>
      axios.put(`${BASE_URL}/admin/users/${id}`, data, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    TOGGLE_STATUS: (id: number) =>
      axios.patch(
        `${BASE_URL}/admin/users/${id}/status`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      ),
    CHANGE_PLAN: (id: number, data: { plan: string }) =>
      axios.patch(`${BASE_URL}/admin/users/${id}/plan`, data, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    DELETE_USER: (id: number) =>
      axios.delete(`${BASE_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),

    GET_LINKS: () =>
      axios.get(`${BASE_URL}/admin/links`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    GET_LINK: (id: string) =>
      axios.get(`${BASE_URL}/admin/links/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    EXPIRE_LINK: (id: string) =>
      axios.patch(
        `${BASE_URL}/admin/links/${id}/expire`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      ),
    DELETE_LINK: (id: string) =>
      axios.delete(`${BASE_URL}/admin/links/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),

    GET_QR_CODES: () =>
      axios.get(`${BASE_URL}/admin/qr-codes`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    GET_QR_CODE: (id: string) =>
      axios.get(`${BASE_URL}/admin/qr-codes/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    EXPIRE_QR_CODE: (id: string, data: { days?: number }) =>
      axios.patch(`${BASE_URL}/admin/qr-codes/${id}/expire`, data, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    DELETE_QR_CODE: (id: string) =>
      axios.delete(`${BASE_URL}/admin/qr-codes/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    DOWNLOAD_QR_CODE: (id: string) =>
      axios.get(`${BASE_URL}/admin/qr-codes/${id}/download`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),

    GET_FILES: () =>
      axios.get(`${BASE_URL}/admin/files`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    GET_FILE: (id: string) =>
      axios.get(`${BASE_URL}/admin/files/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    EXTEND_FILE: (id: string, data: { days?: number }) =>
      axios.patch(`${BASE_URL}/admin/files/${id}/extend`, data, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    RESET_FILE_DOWNLOADS: (id: string) =>
      axios.patch(
        `${BASE_URL}/admin/files/${id}/reset-downloads`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      ),
    DELETE_FILE: (id: string) =>
      axios.delete(`${BASE_URL}/admin/files/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),

    GET_TRANSACTIONS: (params: any) =>
      axios.get(`${BASE_URL}/admin/transactions`, {
        params,
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    GET_TRANSACTION: (id: string) =>
      axios.get(`${BASE_URL}/admin/transactions/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    REPLAY_TRANSACTION: (id: string) =>
      axios.patch(
        `${BASE_URL}/admin/transactions/${id}/replay`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      ),
    MARK_SUCCESS_TRANSACTION: (id: string) =>
      axios.patch(
        `${BASE_URL}/admin/transactions/${id}/mark-success`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      ),
  },
  SUPER_ADMIN: {
    GET_STATS: `${BASE_URL}/super-admin/getStats`,

    GET_ALL_USERS: (params: any) =>
      axios.get(`${BASE_URL}/super-admin/users`, {
        params,
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    UPDATE_USER: (id: number, data: { name: string; email: string }) =>
      axios.put(`${BASE_URL}/super-admin/users/${id}`, data, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    TOGGLE_STATUS: (id: number) =>
      axios.patch(
        `${BASE_URL}/super-admin/users/${id}/status`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      ),
    CHANGE_PLAN: (id: number, data: { plan: string }) =>
      axios.patch(`${BASE_URL}/super-admin/users/${id}/plan`, data, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    DELETE_USER: (id: number) =>
      axios.delete(`${BASE_URL}/super-admin/users/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),

    GET_LINKS: () =>
      axios.get(`${BASE_URL}/super-admin/links`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    GET_LINK: (id: string) =>
      axios.get(`${BASE_URL}/super-admin/links/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    EXPIRE_LINK: (id: string) =>
      axios.patch(
        `${BASE_URL}/super-admin/links/${id}/expire`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      ),
    DELETE_LINK: (id: string) =>
      axios.delete(`${BASE_URL}/super-admin/links/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),

    GET_QR_CODES: () =>
      axios.get(`${BASE_URL}/super-admin/qr-codes`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    GET_QR_CODE: (id: string) =>
      axios.get(`${BASE_URL}/super-admin/qr-codes/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    EXPIRE_QR_CODE: (id: string, data: { days?: number }) =>
      axios.patch(`${BASE_URL}/super-admin/qr-codes/${id}/expire`, data, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    DELETE_QR_CODE: (id: string) =>
      axios.delete(`${BASE_URL}/super-admin/qr-codes/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    DOWNLOAD_QR_CODE: (id: string) =>
      axios.get(`${BASE_URL}/super-admin/qr-codes/${id}/download`, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),

    GET_FILES: () =>
      axios.get(`${BASE_URL}/super-admin/files`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    GET_FILE: (id: string) =>
      axios.get(`${BASE_URL}/super-admin/files/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    EXTEND_FILE: (id: string, data: { days?: number }) =>
      axios.patch(`${BASE_URL}/super-admin/files/${id}/extend`, data, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    RESET_FILE_DOWNLOADS: (id: string) =>
      axios.patch(
        `${BASE_URL}/super-admin/files/${id}/reset-downloads`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      ),
    DELETE_FILE: (id: string) =>
      axios.delete(`${BASE_URL}/super-admin/files/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),

    GET_TRANSACTIONS: (params: any) =>
      axios.get(`${BASE_URL}/super-admin/transactions`, {
        params,
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    GET_TRANSACTION: (id: string) =>
      axios.get(`${BASE_URL}/super-admin/transactions/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    REPLAY_TRANSACTION: (id: string) =>
      axios.patch(
        `${BASE_URL}/super-admin/transactions/${id}/replay`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      ),
    MARK_SUCCESS_TRANSACTION: (id: string) =>
      axios.patch(
        `${BASE_URL}/super-admin/transactions/${id}/mark-success`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      ),
    SEND_NOTIFICATION: (data: {
      subject: string;
      message: string;
      target: "all" | "user" | "plan";
      user_id?: number;
      plan?: string;
      type?: string;
      buttonUrl?: string;
      buttonLabel?: string;
      images?: File[]; // Ajout des images
    }) => {
      const formData = new FormData();
      formData.append("subject", data.subject);
      formData.append("message", data.message);
      formData.append("target", data.target);
      if (data.user_id) formData.append("user_id", String(data.user_id));
      if (data.plan) formData.append("plan", data.plan);
      if (data.type) formData.append("type", data.type);
      if (data.buttonUrl) formData.append("buttonUrl", data.buttonUrl);
      if (data.buttonLabel) formData.append("buttonLabel", data.buttonLabel);

      // Ajout des images
      if (data.images) {
        data.images.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
      }

      return axios.post(
        `${BASE_URL}/super-admin/notifications/send`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "multipart/form-data", // Nécessaire pour l'envoi de fichiers
          },
        }
      );
    },
    GET_NOTIFICATION_HISTORY: (params: any = {}) =>
      axios.get(`${BASE_URL}/super-admin/notifications/history`, {
        params,
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    GET_ADMINS: `${BASE_URL}/super-admin/admins`,
    STORE_ADMIN: `${BASE_URL}/super-admin/admins`,
    DELETE_ADMIN: `${BASE_URL}/super-admin/admins`,
    UPDATE_ADMIN: `${BASE_URL}/super-admin/admins`,
  },

  PASSWORD: {
    SEND_RESET_EMAIL: `${BASE_URL}/password/email`,
    RESET_WITH_CODE: `${BASE_URL}/password/reset`,
  },
  EXTERNAL_LINKS: {
    CREATE: `${BASE_URL}/external/links`,
    LIST: `${BASE_URL}/external/links`,
    SHOW: (shortCode: string) => `${BASE_URL}/external/links/${shortCode}`,
    UPDATE: (shortLink: string) => `${BASE_URL}/external/links/${shortLink}`,
    DELETE: (shortLink: string) => `${BASE_URL}/external/links/${shortLink}`,
  },
  CUSTOM_DOMAINS: {
    GET_ALL: () =>
      axios.get(`${BASE_URL}/custom-domains`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      }),
    CREATE: (domain: string) =>
      axios.post(
        `${BASE_URL}/custom-domains`,
        { domain: domain }, // Explicitement passer l'objet avec la clé 'domain'
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      ),
    VERIFY: (id: string) =>
      axios.post(
        `${BASE_URL}/custom-domains/${id}/verify`,
        {},
        { headers: { Authorization: `Bearer ${getAuthToken()}` } }
      ),
  },
  // Ajoute ici d'autres groupes d’API selon tes besoins
};

function getAuthToken() {
  // Implement token retrieval from useAuth or local storage
  return localStorage.getItem("bliic_token") || "";
}
