import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CosmosService } from "../../services/cosmos.service";
import { BlockatlasValidator } from "@trustwallet/rpc/lib/blockatlas/models/BlockatlasValidator";

@Component({
  selector: "app-cosmos",
  templateUrl: "./delegators.component.html",
  styleUrls: ["./delegators.component.scss"]
})
export class DelegatorsComponent {
  blockchain = this.activatedRoute.snapshot.params.blockchainId;
  validators$: Observable<
    Array<BlockatlasValidator>
  > = this.cosmos.getValidators();

  constructor(
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    private cosmos: CosmosService,
    private router: Router
  ) {}

  select(item: BlockatlasValidator) {
    this.router.navigate([`details/${item.id}`], {
      relativeTo: this.activatedRoute
    });
  }
}
