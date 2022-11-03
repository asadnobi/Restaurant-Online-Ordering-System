import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-confirmation',
  host: {class: 'page-wrapper'},
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
