import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgxLoadersCssModule } from "ngx-loaders-css";
import { HttpClientModule } from "@angular/common/http";
import { LoadingButtonComponent } from "./loading-button/loading-button.component";
import { StakePlaceholderComponent } from "./stake-placeholder/stake-placeholder.component";
import { ContentLoaderModule } from "@ngneat/content-loader";
import { ContentPlaceholderComponent } from "./content-placeholder/content-placeholder.component";
import { DelegatorsComponent } from "../../coins/components/delegators/delegators.component";
import { StakingComponent } from "../../coins/components/staking/staking.component";
import { UnstakingComponent } from "../../coins/components/unstaking/unstaking.component";
import { DetailsComponent } from "../../coins/components/details/details.component";
import { ReactiveFormsModule } from "@angular/forms";
import { SelectAuthProviderComponent } from "./select-auth-provider/select-auth-provider.component";
import { LogoutComponent } from "./logout/logout.component";
import { ContentComponent } from "./content/content.component";
import { SharedModule } from "../shared.module";
import { ContentDirective } from "../directives/content.directive";
import { SuccessPopupComponent } from "./success-popup/success-popup.component";
import { ErrorPopupComponent } from "./error-popup/error-popup.component";
import { PlaceholderDirective } from "../directives/placeholder.directive";
import { ListviewComponent } from "./listview/listview.component";
import { ItemDirective } from "../directives/item.directive";
import { NoItemsDirective } from "../directives/no-items.directive";
import { LabelComponent } from "./label/label.component";
import { BlockBetweenComponent } from "./block-between/block-between.component";
import { BlockLeftDirective } from "../directives/block-left.directive";
import { BlockRightDirective } from "../directives/block-right.directive";

const components = [
  LoadingButtonComponent,
  ContentPlaceholderComponent,
  SelectAuthProviderComponent,
  LogoutComponent,
  ContentComponent,
  ContentDirective,
  PlaceholderDirective,
  ItemDirective,
  NoItemsDirective,
  BlockLeftDirective,
  BlockRightDirective,
  SuccessPopupComponent,
  ErrorPopupComponent,
  StakePlaceholderComponent,
  ListviewComponent,
  LabelComponent,
  BlockBetweenComponent
];

@NgModule({
  declarations: [...components],
  entryComponents: [
    SelectAuthProviderComponent,
    LogoutComponent,
    SuccessPopupComponent,
    ErrorPopupComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    NgxLoadersCssModule,
    ContentLoaderModule,
    ReactiveFormsModule
  ],
  exports: [...components, ContentLoaderModule]
})
export class ComponentsModule {}
