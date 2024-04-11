import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { AppConstants } from './app.constants';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor() { }

  public encrypt(text: string, key:string) {
    const encJson = CryptoJS.AES.encrypt(JSON.stringify(text), key).toString();
    const encData = CryptoJS.enc.Base64.stringify(
      CryptoJS.enc.Utf8.parse(encJson)
    );
    if (AppConstants.DEBUG) {
      console.log(encData);
    }
    return encData;
  }
  
  public decrypt(text: string, key:string) {
    try {
      const decData = CryptoJS.enc.Base64.parse(text).toString(CryptoJS.enc.Utf8);
      const bytes = CryptoJS.AES.decrypt(decData, key).toString(CryptoJS.enc.Utf8);
      const value = JSON.parse(bytes);
      if (AppConstants.DEBUG) {
        console.log(value);
      }
      return value;
    } catch (error: any) {
      if (AppConstants.DEBUG) {
        console.log(error);
      }
      return '';
    }
  }
}
