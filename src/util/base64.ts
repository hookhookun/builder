import {Base64Tool} from './Base64Tool';

const s = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const Base64 = new Base64Tool(`${s}+/`, '=');
export const URLSafeBase64 = new Base64Tool(`${s}-_`, '$');
