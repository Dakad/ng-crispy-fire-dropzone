import { Component, OnInit } from '@angular/core';
import { PaginationService } from '../pagination.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  constructor(private page: PaginationService) {}

  ngOnInit() {
    const config = {
      reverse: true,
      prepend: false
    };
    this.page.init('pics', 'year', config);
  }

  scrollHandler(event): void {
    if (event === 'down') {
      this.page.more();
    }
  }
}
