import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { getMarketName, getSelectionName } from '@azuro-org/dictionaries'
import { CommonModule, NgFor } from '@angular/common';
import { AppConstants } from '../app.constants';
import { CryptoService } from '../crypto.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-bxbt',
  standalone: true,
  imports: [NgFor, CommonModule, FormsModule],
  templateUrl: './bxbt.component.html',
  styleUrl: './bxbt.component.css'
})
export class BxbtComponent implements OnInit {

  actor: string;
  userData: User = { password: '', startSeconds: 0 };
  picks: any = [];
  data: any = [];
  total: number = 0;
  count: number = 0;

  constructor(private service: ApiService, private cryptoService: CryptoService) { }

  static readonly AFFILIATE_X = 'VTJGc2RHVmtYMTlxMGptRFNQQkRXMExlQ3doOFFNK1N4dWhUdU1vWWxDUHQwelZaLzc3QUpCNWY4dXdOYWcwMTFJZklwUjh6bzBoajZKM1BQQ1htd0E9PQ==';
  static readonly STATS_QUERY_X = 'VTJGc2RHVmtYMTl3OWQ2QmRIQTdzNlUvTjBFRkFhQ1lIZ0xsazRUcmJ4bFVuamxaMEhBQUxFVDZUWnVTRXJnOWszeWpRbStaZUhCcWdZa1BBLzBuT0dwdFpZcDBQRjhEcE5GaXpHaUxVeEs4WEREUEVTRmxwNndnNkg5Y0tuOUtVVTFudTZ1SWNJOWhCdmV1VytPSDBvK09JeTBFUm52bDBFNGNqUUpXL3g0Nzd1MXdtamJCaHpWMloyV3NUUzJyVjBuak5Fbko0Qkxmcmx0d2doMDlubi9VREdxOTZBVU1tc0hVRjF4a0hGdU1DbDFUSllLZmpYV2hGZzBKZVdic3BpTXpmUEtCeDBUalpHSEkyK1hURm5MMkZKRnZtSnhLa2lLVXNtNjR0K1Z0aEZNZkxtSzJ4anZqRlhwNHpIWHE0MFhDVDhkMzVCZXFUaVgvVWYydldXejhjTk1qRWNHQ01rRXlsM2EwR1lVTC9CT1o1Y29JQlVlQms1Tm80VFgrT0h2cHhSeFd6S2tMeElRZHZDREwrOEZVM0FrcTI4ZEJicFpuZGk2MDZIOD0=';

  ngOnInit(): void {
    this.picks = [];
  }

  fetchStats(): void {
    this.total = 0;
    this.count = 0;
    const token = localStorage.getItem("token");
    let startSeconds = 1710329330;
    let endSeconds = startSeconds + 1440;
    const endpoint = this.cryptoService.decrypt(AppConstants.AZURO_GRAPHQL_ENDPOINT_X, token);
    const query = this.cryptoService.decrypt(BxbtComponent.STATS_QUERY_X, token);
    const affiliate = this.cryptoService.decrypt(BxbtComponent.AFFILIATE_X, token);
    
    while (endSeconds <= 1711929599) {
      this.getAzuroStats(endpoint, query, Math.trunc(startSeconds), Math.trunc(endSeconds), affiliate, 10);
      startSeconds = endSeconds + 1;
      endSeconds = startSeconds + 10000;
    }
    console.log('startSeconds: ' + startSeconds);
    console.log('endSecs: ' + endSeconds);
  }

  update(): void {
    this.picks = [];
    this.actor = this.userData.password;
    if (this.actor) {
      this.fetchData();
    }
  }

  fetchData() {
      if (AppConstants.DEBUG) {
        console.log('bxbt: fetching data from API');
      }
      const token = localStorage.getItem("token");
      let startMillis = new Date().getTime() - AppConstants.MILLIS_DAY;
      let startSeconds = startMillis / 1000 ;
      const endpoint = this.cryptoService.decrypt(AppConstants.AZURO_GRAPHQL_ENDPOINT_X, token);
      const query = this.cryptoService.decrypt(AppConstants.AZURO_BETS_QUERY_X, token);
      if (this.userData.startSeconds > 0) {
        startSeconds = this.userData.startSeconds;
      }
      this.getAzuroBets(endpoint, query, this.actor as string, Math.trunc(startSeconds));
  }

  ngOnDestroy(): void {
  }

  getAzuroStats(endpoint: string, query: any, startSeconds: number, endSeconds: number, affiliate: string, amount: number): void {
    this.service
        .getAzuroStats(endpoint, query, startSeconds, endSeconds, affiliate, amount)
        .then(response => {
          if (response.data.data.bets && response.data.data.bets.length > 0) {
            response.data.data.bets.forEach((item: any) => {
                this.total = this.total + 10;
                this.count = this.count + 1;
            });
          }
        })
        .catch(error => {
          console.log(error);
        });
  };

  getAzuroBets(endpoint: string, query: any, bettor: string, startSeconds: number): void {
    console.log('start secs: ' + startSeconds);
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
            this.data = dataSet;
          } else {
            this.data = [];
          }
        })
        .catch(error => {
          console.log(error);
        });
  }
}

export interface User {
  password: string;
  startSeconds: number;
}
