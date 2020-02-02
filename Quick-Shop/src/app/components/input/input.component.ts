import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

import { SocketService } from 'src/app/socket.service';
import { Event } from '../../models';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit {
  private ioConnection: any;
  private map: Map<string, string>;
  private items: string[];
  private set: Set<string> = new Set();

  constructor(
    private socketService: SocketService,
    private router: Router
    ) { }

  ngOnInit() {
    this.initIoConnection();
  }

  protected update(item: string) {
    if (this.set.has(item)) {
      this.set.delete(item);
    } else {
      this.set.add(item);
    }
  }

  protected submit(route: string) {
    let map = new Map<string, number>();
    this.set.forEach(item => {
      let section = this.map.get(item);
      let count = map[section];
      map[section] = count ? count + 1 : 1;
    });
    let navigationExtras: NavigationExtras = {
      state: {
        map: map
      }
    };
    this.router.navigate([route], navigationExtras);
  }

  private initIoConnection(): void {
    this.socketService.initSocket();

    this.ioConnection = this.socketService.onItemToSection().subscribe((itemToSection : string) => {
        this.map = new Map(JSON.parse(itemToSection));
        this.items = Array.from(this.map.keys());
    });

    this.socketService.onEvent(Event.CONNECT)
      .subscribe(() => {
        console.log('connected');
      });
      
    this.socketService.onEvent(Event.DISCONNECT)
      .subscribe(() => {
        console.log('disconnected');
      });
  }

}
