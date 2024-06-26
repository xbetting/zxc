import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { getMarketName, getSelectionName } from '@azuro-org/dictionaries'
import { CommonModule, NgFor } from '@angular/common';
import { AppConstants } from '../app.constants';
import { CryptoService } from '../crypto.service';
import { Subscription } from 'rxjs';
import { CacheService } from '../cache.service';
import { DataTablesModule } from 'angular-datatables';


@Component({
  selector: 'app-bxbt',
  standalone: true,
  imports: [NgFor, CommonModule, DataTablesModule],
  templateUrl: './bxbt.component.html',
  styleUrl: './bxbt.component.css'
})
export class BxbtComponent implements OnInit {

  picks: any = [];
  data: any = [];
  total: number = 0;
  count: number = 0;
  startMillis: number = 0;
  bxMap: Map<string,boolean>;
  private cacheSubscription: Subscription;

  static readonly BETTORS_X = 'VTJGc2RHVmtYMStrcFNydGgyTFdYZkJYUlBGRnA4cy9wdkdqZVBuQk95VFhHK3NGYXkyOG9UWHFzN2tpWGxEbGNaLzZQL1hOdzk4c2s5Z094S2liVVhMSWFXM0RjekpFQ2lDTEJjS3BWUy8vc0ppQkpNeUhSTXNCSklObm1TVjNKblpOVnNxNXNsRmVmVUowcmdYUWlEa29GKzc5M3pLRVc4UXk5S01XSThEcTZPazZjY2hlNHJOenM4OWx4RGc2Ukp5SHdxMUpscGZ4c0tseDJGNE94TExsb2ttcFVQNWUxNnBVSWljTmZtbGM5M3lVQUhwVkpXTFJaclMxRzVmT2hJR1RkakJnZjd1YmEwWVJwU1ZoR25yVC9VRDJCVHZGOStWQ1dsNUo1cDd3QndOSUtmSGYzNnFDdFdacFNuQ0FWNjdoazRYSkVTTm9ZVXlXZVNmQ056WXhnOElaWUdHdHV3QjJjTFlRRm1ndDhpRFZWSTRvRnVLM1hTc1FQWlBZcTdZMTFKVElIQ0l2UmRZbHQrYnI2UHM2eDBCUktYdk5Ycm1jQlFDQTF4MFlaYzN0TmM2TU5BSzUzS2NObTVDRElaZDZxVkM1K29IREtnZDNicVh6aVFudFlsRWRhREpJcHQ5R0sxS2ZUNnUwUGlxdEZKa1dhcTZTV000Vy82THp0czVmVldRUzR2OS9KVUYxOHNRNWFMY2RUMkpDaWFxMHE3dmIzUUx1RXBKQVJjY0FUS2NuZWhWOTZyRndoa1BwZGhjTUY5b2dYWUt0YmYvdXFGWFZpZVFVV1pSengwQkY3MFRkeHNEWEw5TDM1VWhQWml4WTQ1UzlBZ3ZmeWNqSkE0aDRsT3hqd2M5NUVhRU5INHlEcXkyeCtMMGlQZlg1WDB4K1ZEbVdwSHgvQk9yeEFWdEN1RHovVEhXZ2NoZ1lhNVgrYnBOc01YWlByV0pRTDVoeHNBPT0=';
  static readonly BX = 'VTJGc2RHVmtYMTk4WDFmR2ZLQjRHN01GQ29nTXAvVU5UMEc3dzVnSVpDSXlNbHVtS0hVZ3hkcTJLSWVlWkt2c3dXODZaanI3Szd2dkpVN0g2aU1jL0l1QkNFVVZOZ2Jnck4zZWJ4YjZSVCsyaHZ5TmJ0Umx6L2xLMFBiTVdQcTRYNk1IcDFLSDJLazRJeDZaazhCcUJSMkFsUXBMSlc1N1FpK0EySjhJbzBwU3lGZmhXRXZ6U2lkUy9SVFBaTVp3NkVoSHg2c3VCMDlpTHMvWEFaS3BlVm8xNzAzRWEwRGdOYm9DL0Y4czkyS0xYL0VXSE9qeVN3aCt5RTBoN3c2YUxWMmdCd1dLUEY3NGxjbk9rN2J4dGc2VFJvZ2dLTWVMUGFTK1hIb1Z5S3BTdG1OaG0yN2FvSmcra214QmI3Z3BWZjVEbGJVU1JlNWRnZmduRFYxUGRpbjZLK3gxQzNXdnZUTUxiWTcrK1hHVFBRY2hnbWR5L0U1N2l2RmxmQmZFOVB0S29CdWNiWERJaGVYTlJEODZJT2tTQTQyVHVVUXRvSVhCOU9LNnkvYnB1QUg1ZzJ2b3FrWFdSam13MktWQ3ZDMEkrZ0pERFFQdGplUkpOZ3FicHBjWTM2TENOWDhxMndtN0w0OG9FRFhJVXBia1NiOHdCeko0L1NqY0cyN0VnUlB3ZllBakVuZWtEZjM0d2NlV3dId1pkUXpFN0srU0ZHV1A3MUdBSWs0PQ==';
  static readonly AFFILIATE_X = 'VTJGc2RHVmtYMTlxMGptRFNQQkRXMExlQ3doOFFNK1N4dWhUdU1vWWxDUHQwelZaLzc3QUpCNWY4dXdOYWcwMTFJZklwUjh6bzBoajZKM1BQQ1htd0E9PQ==';
  static readonly STATS_QUERY_X = 'VTJGc2RHVmtYMTl3OWQ2QmRIQTdzNlUvTjBFRkFhQ1lIZ0xsazRUcmJ4bFVuamxaMEhBQUxFVDZUWnVTRXJnOWszeWpRbStaZUhCcWdZa1BBLzBuT0dwdFpZcDBQRjhEcE5GaXpHaUxVeEs4WEREUEVTRmxwNndnNkg5Y0tuOUtVVTFudTZ1SWNJOWhCdmV1VytPSDBvK09JeTBFUm52bDBFNGNqUUpXL3g0Nzd1MXdtamJCaHpWMloyV3NUUzJyVjBuak5Fbko0Qkxmcmx0d2doMDlubi9VREdxOTZBVU1tc0hVRjF4a0hGdU1DbDFUSllLZmpYV2hGZzBKZVdic3BpTXpmUEtCeDBUalpHSEkyK1hURm5MMkZKRnZtSnhLa2lLVXNtNjR0K1Z0aEZNZkxtSzJ4anZqRlhwNHpIWHE0MFhDVDhkMzVCZXFUaVgvVWYydldXejhjTk1qRWNHQ01rRXlsM2EwR1lVTC9CT1o1Y29JQlVlQms1Tm80VFgrT0h2cHhSeFd6S2tMeElRZHZDREwrOEZVM0FrcTI4ZEJicFpuZGk2MDZIOD0=';

  constructor(private service: ApiService, private cryptoService: CryptoService, private cacheService: CacheService) { }

  ngOnInit(): void {
    this.startMillis = new Date().getTime() - AppConstants.MILLIS_HOUR;
    this.picks = [];
    if (localStorage && localStorage.getItem("token") != null) {
      this.cacheSubscription = this.cacheService.cache$.subscribe(data => {
        this.data = data;
      });

      this.fetchData(localStorage.getItem("token"));

      setTimeout(()=>{
        $('#bxbtbetstable').DataTable({
          pagingType: 'full_numbers',
          pageLength: 100,
          processing: true,
          lengthMenu : [100, 200, 300],
        });
      }, 1);
    }
  }

  fetchData(token:string) {
    this.bxMap = new Map<string,boolean>();
    const bx = this.cryptoService.decrypt(BxbtComponent.BX, token);
    const bxArr = bx.split(',');
    bxArr.forEach(item => {
      const xArr = item.split(':');
      this.bxMap.set(xArr[0].toLowerCase(), xArr[1]);
    });

    const cachedData = this.cacheService.get('bx-bets');
    if (!cachedData) {
      if (AppConstants.DEBUG) {
        console.log('bxbt: fetching data from API');
      }

      let startMillis = new Date().getTime() - AppConstants.MILLIS_DAY;
      let startSeconds = startMillis / 1000 ;
      let z = this.cryptoService.decrypt(BxbtComponent.BETTORS_X, token);
      const bettorsArr = z.split(',');
      const bettors = [...new Set(bettorsArr)];
      const endpoint = this.cryptoService.decrypt(AppConstants.AZURO_GRAPHQL_ENDPOINT_X, token);
      const query = this.cryptoService.decrypt(AppConstants.AZURO_BETS_QUERY_X, token);
      this.picks = [];
      bettors.forEach( bettor => {
        this.getAzuroBets(endpoint, query, bettor as string, Math.trunc(startSeconds));
      });
    } else if (AppConstants.DEBUG) {
      console.log('bxbt: got data from cache');
    }
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
    if (AppConstants.DEBUG) {
      console.log('startSeconds: ' + startSeconds);
      console.log('endSecs: ' + endSeconds);
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
                let actor = item.bet.actor.toLowerCase();
                let bxName = this.bxMap.has(actor) ? this.bxMap.get(actor) : actor;
                let pick = {
                    betId: item.bet.betId,
                    bettor: bxName,
                    game: item.outcome.condition.game.title,
                    info: info,
                    tip: tip,
                    odds: item.outcome.currentOdds,
                    totalOdds: item.bet.odds,
                    amount: item.bet.amount,
                    gameDateMillis: item.outcome.condition.game.startsAt * 1000,
                    gameStatus: item.outcome.condition.game.status
                }
                if (pick.gameDateMillis >= this.startMillis && pick.gameStatus !== 'Resolved') {
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
            this.cacheService.set('bx-bets', dataSet);
          } else {
            this.cacheService.set('bx-bets', []);
          }
        })
        .catch(error => {
          console.log(error);
        });
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
}
