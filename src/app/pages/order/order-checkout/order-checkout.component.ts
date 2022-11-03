import { AfterViewInit, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
declare var bootstrap: any;
//services
import { HttpService } from 'src/app/services/http.service';
import { LoadingService } from 'src/app/services/loading.service';
import { SharedService } from 'src/app/services/shared.service';
//store
import { User } from 'src/store/models/user.model';
import { Order, TakeawayAddress } from 'src/store/models/order.model';
import { removeCoupon, updateAddress, updateCoupon, updateOrder } from 'src/store/actions/order.actions';
import { selectCartdata } from 'src/store/selectors/cart.selector';
import { selectOrderdata } from 'src/store/selectors/order.selector';
import { selectResdata } from 'src/store/selectors/restaurant.selector';
import { selectSchedule } from 'src/store/selectors/schedule.selector';
import { selectUserdata } from 'src/store/selectors/user.selector';
import { Restaurant } from 'src/store/models/restaurant.model';
import { Cart } from 'src/store/models/cart.model';

@Component({
  selector: 'app-order-checkout',
  host: {class: 'page-wrapper'},
  templateUrl: './order-checkout.component.html',
  styleUrls: ['./order-checkout.component.scss']
})
export class OrderCheckoutComponent implements OnInit, AfterViewInit {
  public resdata$: Observable<any>;
  public schedule$: Observable<any>;
  public orderdata$: Observable<any>;
  public cartdata$: Observable<any>;
  public userdata$!: Observable<any>;
  private resdata!: Restaurant;
  public cartdata!: Cart[];
  private orderdata!: Order;
  private userdata!: User;

  public changeAddreses: boolean;
  public paymentMethods: any;
  public couponCode!: string;
  public errorMessage!: string;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: any,
    private store: Store,
    private httpService: HttpService,
    private loadingService: LoadingService,
    private sharedService: SharedService,
    private router: Router
  ) {
    this.resdata$ = this.store.select(selectResdata);
    this.schedule$ = this.store.select(selectSchedule);
    this.cartdata$ = this.store.select(selectCartdata);
    this.orderdata$ = this.store.select(selectOrderdata);
    this.userdata$ = this.store.select(selectUserdata);
    this.changeAddreses = false;
  }

  ngOnInit(): void {
    this.resdata$.subscribe((value: Restaurant) => {
      this.resdata = value;
    });
    this.cartdata$.subscribe((value: Cart[]) => {
      this.cartdata = value;
    });
    this.orderdata$.subscribe((value: Order) => {
      this.orderdata = value;
    });
    this.userdata$.subscribe((value: User) => {
      this.userdata = value;
    });
  }
  
  ngAfterViewInit(): void {
    this.getPaymentMethod();    
  }

  private getPaymentMethod() {
    this.loadingService.loadingStart();
    const $obs = this.httpService.getGetPaymentMethod().subscribe({
      next: (value: any) => {
        this.loadingService.loadingClose();
        if(value.status === 'success') this.paymentMethods = value['data'];
      },
      error: (err: Error) => {
        this.loadingService.loadingClose();
      },
      complete: () => {
        $obs.unsubscribe();
        this.loadingService.loadingClose(); 
      }   
    });
  }

  public changePolicy() {
    const timeModalEl = document.getElementById('timeModal');
    if(timeModalEl) new bootstrap.Modal(timeModalEl).show();
  }
  /*--------address start------------*/ 
  public formatedAddress(address: any) {
    return this.sharedService.formatAddress(address);
  }
  public setDeliveryAddress(address: any) {
    const takeawayAddress: TakeawayAddress = {
      first_name: address.first_name ? address.first_name : this.userdata.data?.first_name,
      last_name: address.last_name ? address.last_name : this.userdata.data?.last_name,
      mobile_no: address.mobile_no ? address.mobile_no : this.userdata.data?.mobile_no,
      address1: address.address1 ? address.address1 : (this.userdata.data?.primary_address ? this.userdata.data?.primary_address.address1 : null),
      address2: address.address2 ? address.address2 : (this.userdata.data?.primary_address ? this.userdata.data?.primary_address.address2 : null),
      town_or_city: address.town_or_city ? address.town_or_city : (this.userdata.data?.primary_address ? this.userdata.data?.primary_address.town_or_city : null),
      postcode: address.postcode ? address.postcode : (this.userdata.data?.primary_address ? this.userdata.data?.primary_address.postcode : null),
      country: null,
      driver_instruction: address.driver_instruction ? address.driver_instruction : null,
      distance: address.distance ? address.distance : null,
      duration: address.duration ? address.duration : null,
      charge: address.charge ? address.charge : null
    }
    this.store.dispatch(updateAddress({ address:  takeawayAddress }));
    this.changeAddreses = false;
  }
  public addNewAddress() {

  }
  /*--------address end------------*/  

  public setPaymentMethod(paymentType: string) {
    if (paymentType === 'CPOINT') {
      this.sharedService.showToast('Opps!', 'You have no point yet! Please select other payment method');
      return;
    }
    this.store.dispatch(updateOrder({ payload: {...this.orderdata, payment: paymentType} }));
  }

  /*--------coupon start------------*/ 
  private applyCoupon(data: any) {
    this.loadingService.loadingStart();
    const $obs = this.httpService.applyPromoCode(data).subscribe({
      next: (value: any) => {
        this.loadingService.loadingClose();
        if(value.status) {
          this.store.dispatch(updateCoupon({ coupon: value['data'] }));
        } else {
          this.sharedService.showToast('Opps!', 'Invalid Code. Please try again with vaild coupon code.');
        }
      },
      error: (err: Error) => {
        this.loadingService.loadingClose();
      },
      complete: () => {
        $obs.unsubscribe();
        this.loadingService.loadingClose(); 
      }   
    });
  }
  public validateCoupon() {
    if(!this.couponCode || this.couponCode.length < 6) {
      this.sharedService.showToast('Opps!', 'Please enter your 6 digit code');
      return;
    }
    if (!this.orderdata.subTotal || this.orderdata.subTotal <= 0) {
      this.sharedService.showToast('Opps!', 'Please add some item in your basket, then try again');
      return;
    }
    if (!this.orderdata.policy || !this.orderdata.policy?.takeaway) {
      this.sharedService.showToast('Opps!', 'Please select your order policy first');
      return;
    }
    if (!this.orderdata.payment) {
      this.sharedService.showToast('Opps!', 'Please select your payment methood');
      return;
    }
    if (!this.userdata.isLogged || !this.userdata.data?.isVerified) {
      this.sharedService.showToast('Opps!', 'Please login first with valid user credential, then try again');
      return;
    }
    let CODE = this.couponCode.charAt(0) !== '#' ? '#'.concat(this.couponCode) : this.couponCode;
    const applyCouponData = {
      code: CODE,
      sub_total: this.orderdata.subTotal,
      order_policy: this.orderdata.policy?.takeaway,
      payment_type: this.orderdata.payment,
      userId: this.userdata.data?._id
    }
    this.applyCoupon(applyCouponData);
  }
  public removeCoupon() {
    this.store.dispatch(removeCoupon());
  }
  /*--------coupon end------------*/

  public proceedToCheckout() {
    if (!this.orderdata.policy || !this.orderdata.policy.takeaway) {
      this.sharedService.showToast('Notice!', 'Please select takeaway service method');
      return;
    }
    if (!this.orderdata.subTotal || this.orderdata.subTotal <= 0 || this.orderdata.subTotal < this.orderdata.policy?.min_amount) {
      this.errorMessage = `Minimum order amount for ${this.orderdata.policy.takeaway} is ${this.orderdata.policy.min_amount}<br>
      <small>Notes: Except delivery charge, service charge and VAT etc.</small>`;
      this.sharedService.showToast('Opps!', 'Please add some item in your basket, then try again');
      return;
    }
    if (this.orderdata.policy?.takeaway === 'delivery' && !this.orderdata.address) {
      this.sharedService.showToast('Notice!', 'Please select your delivery address');
      return;
    }
    if (!this.userdata.isLogged || !this.userdata.data?.isVerified) {
      this.sharedService.showToast('Opps!', 'Please login first with valid user credential, then try again');
      return;
    }
    if (!this.orderdata.total || this.orderdata.total <= 0) {
      this.errorMessage = `<b>Opps!</b>Refresh your browser again.`;
      this.sharedService.showToast('Opps!', 'Someting went wrong, please try again');
      return;
    }
    if (this.orderdata.eliPromoList.length > 0 && !this.orderdata.promo) {
      // this.dealsModal.show();
      return;
    }
    if (this.resdata.restaurant_data?.is_tips && !this.orderdata.tips) {
      // this.tipsModal.show();
      return;
    }
    this.submitOrder();
  }

  private submitOrder() {
    const date = new Date();
    const order_id = date.getFullYear() + '' + date.getMonth() + '' +  date.getDate() + '-' + date.getHours() + '' + date.getSeconds() + '-' + date.getMilliseconds();
    const data = {
      customer_info: {
        first_name: this.userdata.data?.first_name,
        last_name: this.userdata.data?.last_name,
        phone: this.userdata.data?.phone_no,
        mobile_no: this.userdata.data?.mobile_no,
        email: this.userdata.data?.email,
        address1: this.userdata.data?.primary_address?.address1,
        address2: this.userdata.data?.primary_address?.address2,
        postcode: this.userdata.data?.primary_address?.postcode,
        city: this.userdata.data?.primary_address?.town_or_city,
        country: this.userdata.data?.primary_address?.country
      },
      user_id: this.userdata.data?._id,
      order_id: order_id,
      delivery_type: this.orderdata.policy?.takeaway,
      delivery_time: this.orderdata.policy?.clock_time,
      order_time: '',
      delivery_address: this.formatedAddress(this.orderdata.address),
      delivery_postcode: this.orderdata.address?.postcode,
      delivery_distance: this.orderdata.address?.distance,
      delivery_duration:  this.orderdata.address?.duration,
      order_policy: this.orderdata.policy?.takeaway,
      payment_method: this.orderdata.payment,
      payment_status: this.orderdata.payment === 'CASH' ? 1 : 0,
      offer_text: this.orderdata.promo?.title,
      discount_text: this.orderdata.promo?.title,
      discount_rate: this.orderdata.promo?.rate,
      discount_type: this.orderdata.promo?.type,
      discount_amount: this.orderdata.promo?.amount,
      delivery_charge: this.orderdata.address?.charge,
      service_charge: this.resdata.restaurant_data?.service_charge,
      vat_amount: this.orderdata.vatAmount,
      bag_charge: this.resdata.restaurant_data?.bag_charge,
      sub_total: this.orderdata.subTotal,
      grand_total: this.orderdata.total,
      cash_payment_amount: 0,
      card_payment_amount:this.orderdata.payment !== 'CASH' ? this.orderdata.total : 0,
      order_status: this.resdata.restaurant_data?.auto_accept_order ? 'Accepted' : 'Pending',
      printing_status: 0,
      printed_at: '',
      special_instruction: this.orderdata.notes,
      note_for_owner: '',
      platform: 1,
      order_items: this.cartdata,
      res_status: true,
      promoCode: this.orderdata.coupon?.code,
      coupon_text: this.orderdata.coupon?.title,
      coupon_amount: this.orderdata.coupon?.amount,
      tips_amount: this.orderdata.tips,
      restaurant_name: this.resdata.restaurant_content?.restaurant_name
    };
    console.log(data)
    return false;
    // this.saveOrder(data);
  }

  private saveOrder(data: any) {
    this.loadingService.loadingStart();
    const $obs = this.httpService.postOrder(data).subscribe({
      next: (res: any) => {
        this.loadingService.loadingClose();
        if (res && res['body'] && res['body'].status === 'success') {
          let data = res['body'].data;
          if (data.payment_status === 1) {
            this.trackOrder(data);
            return;
          }
          if(data['payment_status'] === 0 && data['payment_method'] === 'CARD') {
            this.router.navigate([ '/payment', data['order_id'], 'order' ]);
            return;
          }
        }
      },
      error: (err: Error) => {
        this.loadingService.loadingClose();
      },
      complete: () => {
        $obs.unsubscribe();
        this.loadingService.loadingClose(); 
      }   
    });
  }

  private trackOrder(orderInfo: any) {
    if(orderInfo['order_status'] === 'Pending') {
      this.router.navigate(['/user-order-track', orderInfo['order_id']]);
      return;
    } else if (orderInfo['order_status'] === 'Accepted') {
      this.router.navigate(['/order-online/order-confirmation', orderInfo['order_id']]);
      return;
    }
  }

}
