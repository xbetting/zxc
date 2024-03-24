import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { ApiService } from '../api.service';
import { AppConstants } from '../app.constants';
import { CryptoService } from '../crypto.service';
import { Subscription } from 'rxjs';
import { CacheService } from '../cache.service';

@Component({
  selector: 'app-x-bets',
  standalone: true,
  imports: [NgFor, CommonModule],
  templateUrl: './x-bets.component.html',
  styleUrl: './x-bets.component.css'
})
export class XBetsComponent implements OnInit {

  picks: any = [];
  data: any = [];
  private cacheSubscription: Subscription;

  constructor(private apiService: ApiService, private cryptoService: CryptoService, private cacheService: CacheService) { }

  ngOnInit(): void {
    this.picks = [];
    if (localStorage && localStorage.getItem("token") != null) {
      this.cacheSubscription = this.cacheService.cache$.subscribe(data => {
        this.data = data;
      });

      this.fetchData();
    }
  }

  fetchData() {
    const cachedData = this.cacheService.get('x-bets');
    if (!cachedData) {
      if (AppConstants.DEBUG) {
        console.log('x: fetching data from API');
      }
      const token = localStorage.getItem("token");
      let z = this.cryptoService.decrypt(AppConstants.XBETS_TIPSTERS_X, token);
      const bettorsArr = z.replaceAll("'","").split(',');
      const endpoint = this.cryptoService.decrypt(AppConstants.XBETS_ENDPOINT_X, token);
      const query1 = this.cryptoService.decrypt(AppConstants.XBETS_TIPSTERS_QUERY_X, token);
      const query2 = this.cryptoService.decrypt(AppConstants.XBETS_BETS_QUERY_X, token);
      const bettors = [...new Set(bettorsArr)];
      bettors.forEach( bettor => {
        this.fetchTipsters(bettor as string, endpoint, query1, query2);
      });
    } else if (AppConstants.DEBUG) {
      console.log('x: got data from cache');
    }
  }

  ngOnDestroy(): void {
    this.cacheSubscription.unsubscribe();
  }

  fetchTipsters(username: string, endpoint: string, query1: any, query2: any): void {
    this.apiService
        .getXBetsTipsters(username, endpoint, query1)
        .then(response => {
          let userData = response.data.data.user;
          let stats = response.data.data.user.stats;
          if (stats.profit > 1 && stats.yield > 1 && stats.winRate > 40) {
            this.fetchPicks(userData.guid, endpoint, query2);
          } else if (AppConstants.DEBUG) {
            console.log('skipping ' + username);
          }
        })
        .catch(error => {
          console.log(error);
        });
  }

  fetchPicks(userId: string, endpoint: string, query: any): void {
    this.apiService
        .getXBets(userId, endpoint, query)
        .then(response => {
          let tips = response.data.data.filterTips.tips;
          tips.forEach((item: any) => {
            let info = item.sport.name + ' - ' + item.match.country.name + ' ';
            if (item.tournament) {
              info += item.tournament.template.name;
            }
            let dateStr = item.match.time.date;
            let gameDate = Date.parse(dateStr);
            // minus 1 hour because gameDate is in CET
            let gameMillis = gameDate - AppConstants.MILLIS_HOUR;
            let pick = {
              bettor: item.user.username,
              game: item.match.title,
              info: info,
              tip: item.oneliner,
              odds: item.bet.odds,
              gameDateMillis: gameMillis
            }
            this.picks.push(pick);

            const dataSet = [...new Set(this.picks)];
            dataSet.sort((obj1: { gameDateMillis: number; }, obj2: { gameDateMillis: number; }) => {
              if (obj1.gameDateMillis > obj2.gameDateMillis) {
                  return 1;
              }
          
              if (obj1.gameDateMillis < obj2.gameDateMillis) {
                  return -1;
              }
          
              return 0;
            });
            this.cacheService.set('x-bets', dataSet);
          });

        })
        .catch(error => {
          console.log(error);
        });
  }
}
