// api.ts
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const API_URL = "https://meeting.zoho.in/api/v2/60031615187/sessions.json";
const AUTH_URL = "https://accounts.zoho.in/oauth/v2/token";
const CLIENT_ID = "1000.CS2Y4EMV1BTPQU1XO6LKQK3RBNFRME";
const CLIENT_SECRET = "b4a539c9cd2decfe9bab524eb212b70c6812d79dc0";
const REFRESH_TOKEN =
  "1000.0064f3a097043a840201bc6f6828a2d4.63bf354524b63346cc8d3970d189c3b5";
const redirectURI = "https://talentakeaways.com";

let accessToken: string | null = null;
const refreshToken: string = REFRESH_TOKEN;
let tokenExpiryTime: number | null = null;

interface AuthResponse {
  access_token: string;
  expires_in: number;
}

// Function to get a new access token
const getAccessToken = async (): Promise<string> => {
  const response: AxiosResponse<AuthResponse> = await axios.post(AUTH_URL, {
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: refreshToken,
    redirect_uri: redirectURI,
  });
  const data = response.data;
  accessToken = data.access_token;
  tokenExpiryTime = Date.now() + data.expires_in * 1000; // Convert expires_in to milliseconds
  return accessToken;
};

// Axios instance with request interceptor
const api = axios.create();

api.interceptors.request.use(
  async (config) => {
    if (!accessToken || Date.now() > tokenExpiryTime!) {
      accessToken = await getAccessToken();
    }
    config.headers.Authorization = `Zoho-oauthtoken ${accessToken}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const makeApiCall = async (): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await api.get(API_URL);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, refresh and retry
      accessToken = await getAccessToken();
      const response: AxiosResponse<any> = await api.get(API_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } else {
      throw error;
    }
  }
};
