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
      let startMillis = new Date().getTime() - AppConstants.MILLIS_TWO_DAYS;
      let startSeconds = startMillis / 1000 ;
      let z = this.cryptoService.decrypt(AppConstants.AZURO_BETTORS_X, token);
      const bettorsArr = z.replaceAll("'","").split(',');
      const bettors = [...new Set(bettorsArr)];
      const endpoint = this.cryptoService.decrypt(AppConstants.AZURO_GRAPHQL_ENDPOINT_X, token);
      const query = this.cryptoService.decrypt(AppConstants.AZURO_BETS_QUERY_X, token);
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
          response.data.data.selections.forEach((item: { bet: any; outcome: any; }) => {
              let mName = getMarketName({ outcomeId: item.outcome.outcomeId })
              let sName = getSelectionName({ outcomeId: item.outcome.outcomeId, withPoint: true});
              let tip = mName + ' ' + sName
              let info = item.outcome.condition.game.sport.name + ' - ' + item.outcome.condition.game.league.name
              let pick = {
                  id: item.bet.id,
                  bettor: item.bet.actor,
                  game: item.outcome.condition.game.title,
                  info: info,
                  tip: tip,
                  odds: item.outcome.currentOdds,
                  gameDateMillis: item.outcome.condition.game.startsAt * 1000,
                  gameStatus: item.outcome.condition.game.status
              }
              if (pick.gameStatus !== 'Resolved') {
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
                this.cacheService.set('azuro-bets', dataSet);
              }
          });
        })
        .catch(error => {
          console.log(error);
        });
  }
}
