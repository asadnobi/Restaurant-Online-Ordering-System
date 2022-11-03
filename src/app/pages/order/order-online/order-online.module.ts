import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { helpersModule } from 'src/app/_helpers/helpers.module';
//components
import { OrderOnlineComponent } from './order-online.component';
//modules
import { CartModule } from 'src/app/components/layouts/cart/cart.module';


const routes: Routes = [
  { path: '', component: OrderOnlineComponent },
]

@NgModule({
  declarations: [OrderOnlineComponent],
  imports: [
    CommonModule, RouterModule.forChild(routes),
    FormsModule,
    LazyLoadImageModule,
    helpersModule,
    CartModule
  ]
})
export class OrderOnlineModule {
}
