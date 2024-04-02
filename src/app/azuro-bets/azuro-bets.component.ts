import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { getMarketName, getSelectionName } from '@azuro-org/dictionaries'
import { CommonModule, NgFor } from '@angular/common';
import { AppConstants } from '../app.constants';
import { CryptoService } from '../crypto.service';
import { Subscription } from 'rxjs';
import { CacheService } from '../cache.service';


@Component({
  selector: 'app-azuro-bets',
  standalone: true,
  imports: [NgFor, CommonModule],
  templateUrl: './azuro-bets.component.html',
  styleUrl: './azuro-bets.component.css'
})
export class AzuroBetsComponent implements OnInit {

  picks: any = [];
  data: any = [];
  private cacheSubscription: Subscription;

  constructor(private service: ApiService, private cryptoService: CryptoService, private cacheService: CacheService) { }

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
    const cachedData = this.cacheService.get('azuro-bets');
    if (!cachedData) {
      if (AppConstants.DEBUG) {
        console.log('azuro: fetching data from API');
      }
      const token = localStorage.getItem("token");
      let startMillis = new Date().getTime() - AppConstants.MILLIS_DAY;
      let startSeconds = startMillis / 1000 ;
      let z = this.cryptoService.decrypt(AppConstants.AZURO_BETTORS_X, token);
      const bettorsArr = z.replaceAll("'","").split(',');
      const bettors = [...new Set(bettorsArr)];
      const endpoint = this.cryptoService.decrypt(AppConstants.AZURO_GRAPHQL_ENDPOINT_X, token);
      const query = this.cryptoService.decrypt(AppConstants.AZURO_BETS_QUERY_X, token);
      this.picks = [];
      bettors.forEach( bettor => {
        this.getAzuroBets(endpoint, query, bettor as string, Math.trunc(startSeconds));
      });
    } else if (AppConstants.DEBUG) {
      console.log('azuro: got data from cache');
    }
  }

  ngOnDestroy(): void {
    this.cacheSubscription.unsubscribe();
  }

  getAzuroBets(endpoint: string, query: any, bettor: string, startSeconds: number): void {
    this.service
        .getAzuroBets(endpoint, query, bettor, startSeconds)
        .then(response => {
          if (response.data.data.selections && response.data.data.selections.length > 0) {
            response.data.data.selections.forEach((item: { bet: any; outcome: any; }) => {
                let mName = getMarketName({ outcomeId: item.outcome.outcomeId })
                let sName = getSelectionName({ outcomeId: item.outcome.outcomeId, withPoint: true});
                let tip = mName + ' ' + sName
                let info = item.outcome.condition.game.sport.name + ' - ' + item.outcome.condition.game.league.name
                let pick = {
                    betId: item.bet.betId,
                    bettor: item.bet.actor,
                    game: item.outcome.condition.game.title,
                    info: info,
                    tip: tip,
                    odds: item.outcome.currentOdds,
                    totalOdds: item.bet.odds,
                    amount: item.bet.amount,
                    gameDateMillis: item.outcome.condition.game.startsAt * 1000,
                    gameStatus: item.outcome.condition.game.status
                }
                if (pick.gameStatus !== 'Resolved') {
                  this.picks.push(pick);
                }
            });
          }
          if (this.picks.length > 0) {
            const dataSet = [...new Set(this.picks)];
            dataSet.sort((obj1: { gameDateMillis: number; game:string; }, obj2: { gameDateMillis: number; game:string; }) => {
              if (obj1.gameDateMillis > obj2.gameDateMillis) {
                return 1;
              }

              if (obj1.gameDateMillis < obj2.gameDateMillis) {
                return -1;
              }

              if (obj1.game > obj2.game) {
                return 1;
              }

              if (obj1.game < obj2.game) {
                return -1;
              }

              return 0;
            });
            //this.data = dataSet;
            this.cacheService.set('azuro-bets', dataSet);
          } else {
            //this.data = [];
            this.cacheService.set('azuro-bets', []);
          }
        })
        .catch(error => {
          console.log(error);
        });
  }
}
