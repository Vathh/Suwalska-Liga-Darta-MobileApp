const API_BASE_URL = 'http://192.168.0.16:8190/dart_league';

const MATCH_ENDPOINT = '/match';
const MATCH_ACTIVE_ENDPOINT = '/active';

const AUTHORIZATION_ENDPOINT = "/authorization";
const AUTHORIZATION_AUTHENTICATE_ENDPOINT = "/authenticate";

const LOGOUT_ENDPOINT = "/logout";

export const MATCH_ACTIVE_API_URL = API_BASE_URL + MATCH_ENDPOINT + MATCH_ACTIVE_ENDPOINT;

export const MATCH_API_URL = API_BASE_URL + MATCH_ENDPOINT;

export const AUTHENTICATE_API_URL = API_BASE_URL + AUTHORIZATION_ENDPOINT + AUTHORIZATION_AUTHENTICATE_ENDPOINT;

export const LOGOUT_API_URL = API_BASE_URL + LOGOUT_ENDPOINT;