import { NgModule } from '@angular/core';
//global
import { environment } from '../environments/environment';
//components
import { AppComponent } from './app.component';
//Module
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreModule } from '@ngrx/store';
import { reducers } from 'src/store';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { helpersModule } from './_helpers/helpers.module';
//services
import { HttpService } from './services/http.service';
import { LoadingService } from './services/loading.service';
import { SharedService } from './services/shared.service';
import { LoginService } from './services/login.service';
// component module
import { ModalPolicyTimeModule } from './components/modals/modal-policy-time/modal-policy-time.module';
import { ModalDishDetailsModule } from 'src/app/components/modals/modal-dish-details/modal-dish-details.module';
import { ModalAllergyInfoModule } from 'src/app/components/modals/modal-allergy-info/modal-allergy-info.module';
import { OtpSignModalModule } from 'src/app/components/modals/otp-sign-modal/otp-sign-modal.module';


@NgModule({
  declarations: [AppComponent],
  imports: [ 
    AppRoutingModule, HttpClientModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    StoreModule.forRoot(reducers),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: environment.production }),
    // ServiceWorkerModule.register('ngsw-worker.js', {
    //   enabled: environment.production,
    //   // Register the ServiceWorker as soon as the application is stable
    //   // or after 30 seconds (whichever comes first).
    //   registrationStrategy: 'registerWhenStable:30000'
    // }),
    helpersModule, LazyLoadImageModule,
    ModalPolicyTimeModule, ModalDishDetailsModule, ModalAllergyInfoModule, OtpSignModalModule
  ],
  providers: [
    HttpService, LoadingService, SharedService, LoginService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
