import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PreloadRouter } from './services/preload-router.service';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomeModule) },
  { path: 'about-us', loadChildren: () => import('./pages/about/about.module').then(m => m.AboutModule) },
  { path: 'deals', loadChildren: () => import('./pages/deals/deals.module').then(m => m.DealsModule) },
  { path: 'menu', loadChildren: () => import('./pages/menu/menu.module').then(m => m.MenuModule) },
  { path: 'reviews', loadChildren: () => import('./pages/review/review.module').then(m => m.ReviewModule) },
  { path: 'events', loadChildren: () => import('./pages/event/event.module').then(m => m.EventModule) },
  { path: 'awards', loadChildren: () => import('./pages/award/award.module').then(m => m.AwardModule) },
  { path: 'gallery', loadChildren: () => import('./pages/gallery/gallery.module').then(m => m.GalleryModule) },
  { path: 'contact-us', loadChildren: () => import('./pages/contact/contact.module').then(m => m.ContactModule) },
  { path: 'blogs', loadChildren: () => import('./pages/blog/blog.module').then(m => m.BlogModule) },
  { path: 'our-team', loadChildren: () => import('./pages/team/team.module').then(m => m.TeamModule) },

  { path: 'sign-in', loadChildren: () => import('./pages/auth/sign-in/sign-in.module').then(m => m.SignInModule) },
  { path: 'sign-up', loadChildren: () => import('./pages/auth/sign-up/sign-up.module').then(m => m.SignUpModule) },
  { path: 'forget-password', loadChildren: () => import('./pages/auth/forget-password/forget-password.module').then(m => m.ForgetPasswordModule) },
  { path: 'reset-password', loadChildren: () => import('./pages/auth/forget-password/forget-password.module').then(m => m.ForgetPasswordModule) },

  { path: 'my-account', loadChildren: () => import('./pages/user/user-account/user-account.module').then(m => m.UserAccountModule) },
  { path: 'my-setting', loadChildren: () => import('./pages/user/user-setting/user-setting.module').then(m => m.UserSettingModule) },
  { path: 'my-order', loadChildren: () => import('./pages/user/user-order/user-order.module').then(m => m.UserOrderModule) },
  { path: 'my-reservation', loadChildren: () => import('./pages/user/user-booking/user-booking.module').then(m => m.UserBookingModule) },
  { path: 'my-review', loadChildren: () => import('./pages/user/user-review/user-review.module').then(m => m.UserReviewModule) },
  { path: 'my-favourite', loadChildren: () => import('./pages/user/user-favourite/user-favourite.module').then(m => m.UserFavouriteModule) },

  { path: 'order-online', loadChildren: () => import('./pages/order/order-online/order-online.module').then(m => m.OrderOnlineModule) },
  { path: 'order-checkout', loadChildren: () => import('./pages/order/order-checkout/order-checkout.module').then(m => m.OrderCheckoutModule) },
  { path: 'order-confirmation/:oid', loadChildren: () => import('./pages/order/order-confirmation/order-confirmation.module').then(m => m.OrderConfirmationModule) },

  { path: 'reservation', loadChildren: () => import('./pages/reservation/reservation-process/reservation-process.module').then(m => m.ReservationProcessModule) },
  { path: 'reservation-details/:booking_id', loadChildren: () => import('./pages/reservation/reservation-details/reservation-details.module').then(m => m.ReservationDetailsModule) },

  { path: 'payment/:id/:for', loadChildren: () => import('./pages/payment/payment-process/payment-process.module').then(m => m.PaymentProcessModule) },
  { path: 'payment-details/:id/:for', loadChildren: () => import('./pages/payment/payment-details/payment-details.module').then(m => m.PaymentDetailsModule) },
  
  { path: 'privacy-policy', loadChildren: () => import('./pages/others/privacy-policy/privacy-policy.module').then(m => m.PrivacyPolicyModule) },
  { path: 'terms-conditions', loadChildren: () => import('./pages/others/terms-condition/terms-condition.module').then(m => m.TermsConditionModule) },
  { path: 'faq', loadChildren: () => import('./pages/others/faq/faq.module').then(m => m.FaqModule) },
  // preloading module
  { 
    path: 'error-page', loadChildren: () => import('./pages/others/error-page/error-page.module').then(m => m.ErrorPageModule),
    data: {preload: true, loadAfterSeconds: 5} 
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
      preloadingStrategy: PreloadRouter
    }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }