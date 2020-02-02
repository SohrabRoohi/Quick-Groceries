import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';

import { SocketService } from 'src/app/socket.service';
import { Event, Item } from '../../models';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.css']
})
export class InputComponent implements OnInit {
  private ioConnection: any;
  private map: Map<string, string>;
  private set: Set<string> = new Set();
  private items: Item[] = new Array<Item>();

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

  private createMap() {
    let newMap = new Map<string, string[]>();
    this.map.forEach((value, key) => {
      for (let i = value.length - 1; i >= 0; i--) {
        if (value[i] > '9') {
          value = value.substr(0, i + 1);
          break;
        }
      }
      if (newMap.has(value)) {
        newMap.get(value).push(key);
      } else {
        newMap.set(value, [key]);
      }
    });
    newMap.forEach((value, key) => {
      this.items.push({section: key, items: value});
    })
  }

  protected submit(route: string) {
    let map = new Map<string, number>();
    this.set.forEach(item => {
      let section = this.map.get(item);
      let count = map.has(section) == false ? 0 : map.get(section);
      map.set(section, count+1);
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
      this.createMap();
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
