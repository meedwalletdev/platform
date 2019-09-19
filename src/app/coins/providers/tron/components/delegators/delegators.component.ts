import { Component, OnInit } from "@angular/core";
import { Observable, of } from "rxjs";
import { BlockatlasValidator } from "@trustwallet/rpc/lib/blockatlas/models/BlockatlasValidator";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { CosmosService } from "../../../cosmos/services/cosmos.service";
import { TronService } from "../../services/tron.service";

@Component({
  selector: "app-delegators",
  templateUrl: "./delegators.component.html",
  styleUrls: ["./delegators.component.scss"]
})
export class DelegatorsComponent {
  blockchain = "";
  validators$: Observable<Array<BlockatlasValidator>> = of([]);
  placeholderValidators = Array(20).fill(0);

  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private tron: TronService,
    private router: Router
  ) {
    this.blockchain = activatedRoute.snapshot.params.blockchainId;
    this.validators$ = this.tron.getValidatorsFromBlockatlas();
  }

  navigateToMyStakeHoldersList(item: BlockatlasValidator) {
    this.router.navigate([`details/${item.id}`], {
      relativeTo: this.activatedRoute
    });
  }
}
