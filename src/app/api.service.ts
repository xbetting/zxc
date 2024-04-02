import { Injectable } from '@angular/core';
import axios from 'axios';
import { AppConstants } from './app.constants';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor() { }

  getAzuroBets(endpoint: string, query: any, bettor: any, timestamp: any) {
    return axios.post(endpoint, {
      query: query,
      variables: {
        bettor: bettor,
        timestamp: timestamp
      }
    });
  }

  getAzuroStats(endpoint: string, query: any, startTime: any, endTime: any, affiliate: string, amount: number) {
    return axios.post(endpoint, {
      query: query,
      variables: {
        startTime: startTime,
        endTime: endTime,
        affiliate: affiliate,
        amount: amount
      }
    });
  }

  getXBetsTipsters(username: string, endpoint: string, query: any) {
    return axios.post(endpoint, {
      query: query,
      variables: {
        "user": username
      }
    });
  }

  getXBets(userId: string, endpoint: string, query: any) {
    return axios.post(endpoint, {
      query: query,
      variables: {
        "language": "en",
        "timezone": "Europe/London",
        "limit": 33,
        "skip": 0,
        "sortBy": [
          {
            "field": "MATCHTIME",
            "order": "DESC"
          },
          {
            "field": "MATCHTITLE",
            "order": "ASC"
          },
          {
            "field": "RATING",
            "order": "DESC"
          }
        ],
        "filters": {
          "showDeleted": false,
          "active": true,
          "rating": null,
          "languages": [],
          "sports": [
            "FOOTBALL",
            "TENNIS",
            "ICE_HOCKEY",
            "BASKETBALL",
            "AMERICAN_FOOTBALL",
            "BOXING",
            "VOLLEYBALL",
            "COUNTER_STRIKE"
          ],
          "allSports": true,
          "event": null,
          "user": userId,
          "odds": null,
          "timeFrame": null
        },
        "cache": {
          "enabled": true
        }
      }
    });
  }

}
