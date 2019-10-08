import {
  Component,
  ContentChild,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef
} from "@angular/core";
import {
  combineLatest,
  forkJoin,
  Observable,
  of,
  Subscription,
  throwError
} from "rxjs";
import { CosmosStakingInfo } from "@trustwallet/rpc/lib/cosmos/models/CosmosStakingInfo";
import { FormBuilder, FormGroup } from "@angular/forms";
import BigNumber from "bignumber.js";
import { ActivatedRoute, Router } from "@angular/router";
import { DialogsService } from "../../../shared/services/dialogs.service";
import { StakeValidator } from "../../validators/stake.validator";
import { CoinProviderConfig, StakeAction } from "../../coin-provider-config";
import {
  catchError,
  first,
  map,
  shareReplay,
  switchMap,
  tap
} from "rxjs/operators";
import { BlockatlasValidator, CosmosUtils } from "@trustwallet/rpc/lib";
import { CoinService } from "../../services/coin.service";
import { DetailsValidatorInterface } from "../details/details.component";
import { AuthService } from "../../../auth/services/auth.service";
import { SelectAuthProviderComponent } from "../../../shared/components/select-auth-provider/select-auth-provider.component";
import { AuthProvider } from "../../../auth/services/auth-provider";
import { ErrorsService } from "../../../shared/services/errors/errors.service";
import { Errors } from "../../../shared/consts";
import { ContentDirective } from "../../../shared/directives/content.directive";

interface StakeDetails {
  config: CoinProviderConfig;
  hasProvider: boolean;
}

@Component({
  selector: "app-shared-staking",
  templateUrl: "./staking.component.html",
  styleUrls: ["./staking.component.scss"]
})
export class StakingComponent implements OnInit, OnDestroy {
  @Input() config: Observable<CoinProviderConfig>;
  @Input() validator: Observable<BlockatlasValidator>;
  @Input() balance: Observable<BigNumber>;
  @Input() hasProvider: Observable<boolean>;
  @Input() staked: Observable<BigNumber>;
  @Input() info: Observable<any>;
  @Input() max: number;
  @Input() prepareTx: (
    action: StakeAction,
    validatorId: string,
    amount: BigNumber
  ) => Observable<any>;
  @Input() formatMax: (max: BigNumber) => BigNumber;

  @ContentChild(ContentDirective, { read: TemplateRef, static: false })
  contentTemplate;

  stakeForm: FormGroup;
  max$: Observable<any>;
  warn$: Observable<BigNumber>;
  monthlyEarnings$: Observable<BigNumber>;
  Math = Math;
  isLoading = false;
  details$: Observable<StakeDetails>;

  confSubs: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private dialogService: DialogsService,
    private router: Router,
    private errorsService: ErrorsService,
    private auth: AuthService
  ) {}

  stake() {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;

    const stake$ = combineLatest([this.config, this.validator]).pipe(
      switchMap(([cfg, validator]) => {
        const amount = cfg.toUnits(
          new BigNumber(this.stakeForm.get("amount").value)
        );
        return this.prepareTx(StakeAction.STAKE, validator.id, amount);
      }),
      tap(() => (this.isLoading = false), e => (this.isLoading = false)),
      switchMap(_ => this.config)
    );

    this.details$
      .pipe(
        switchMap(({ hasProvider }) => {
          if (hasProvider) {
            return stake$;
          } else {
            const modal = this.dialogService.showModal(
              SelectAuthProviderComponent
            );
            return modal.componentInstance.select.pipe(
              switchMap((provider: AuthProvider) =>
                combineLatest([
                  this.auth.authorize(provider),
                  of(provider),
                  this.config
                ])
              ),
              switchMap(([authorized, provider, config]) =>
                authorized
                  ? provider.getAddress(config.coin)
                  : throwError("closed")
              ),
              catchError(error => {
                if (error === "closed") {
                  return throwError(Errors.REJECTED_BY_USER);
                }
                return throwError(error);
              })
            );
          }
        }),
        tap(() => (this.isLoading = false), e => (this.isLoading = false))
      )
      .subscribe(
        (result: any) => {
          if (typeof result === "string") {
            location.reload();
          } else {
            this.congratulate(result, this.stakeForm.get("amount").value);
          }
        },
        error => {
          this.errorsService.showError(error);
        }
      );
  }

  setMax() {
    this.max$.subscribe(({ normal }) => {
      this.stakeForm.get("amount").setValue(this.formatMax(normal));
    });
  }

  warn(): Observable<BigNumber> {
    return combineLatest([
      this.stakeForm.get("amount").valueChanges,
      this.max$
    ]).pipe(
      map(([value, max]) => {
        const val = new BigNumber(value);
        if (val.isGreaterThan(max.normal) && val.isLessThan(max.min)) {
          return max.normal;
        }
        return null;
      }),
      shareReplay(1)
    );
  }

  getMonthlyEarnings(): Observable<BigNumber> {
    return combineLatest([
      this.stakeForm.get("amount").valueChanges,
      this.validator
    ]).pipe(
      map(([value, validator]) => {
        const val = new BigNumber(value);
        if (val.isNaN()) {
          return null;
        }
        return val.multipliedBy(validator.reward.annual / 100).dividedBy(12);
      }),
      shareReplay(1)
    );
  }
  getMax(): Observable<{ min: BigNumber; normal: BigNumber }> {
    return combineLatest([this.balance, this.config]).pipe(
      map(([balance, config]) => {
        const additional = config.toCoin(new BigNumber(config.fee));
        const normal = balance.minus(additional.multipliedBy(2));
        const min = balance.minus(additional);
        return {
          normal: normal.isGreaterThan(0) ? normal : new BigNumber(0),
          min: min.isGreaterThan(0) ? min : new BigNumber(0)
        };
      }),
      shareReplay(1)
    );
  }

  congratulate(config: CoinProviderConfig, sum: number) {
    const modalRef = this.dialogService.showSuccess(
      `You have successfully staked ${sum} ${config.currencySymbol}s`
    );
    modalRef.result.then(
      data => {
        this.router.navigate([`/`]);
      },
      reason => {
        this.router.navigate([`/`]);
      }
    );
  }

  ngOnInit(): void {
    this.confSubs = this.config.subscribe(config => {
      this.stakeForm = this.fb.group({
        amount: [
          "",
          [],
          [StakeValidator(true, config, this.balance, this.staked, this.max)]
        ]
      });
    });

    this.max$ = this.getMax();
    this.warn$ = this.warn();
    this.monthlyEarnings$ = this.getMonthlyEarnings();
    this.details$ = forkJoin({
      config: this.config.pipe(first()),
      hasProvider: this.hasProvider
    });
  }

  ngOnDestroy(): void {
    this.confSubs.unsubscribe();
  }
}