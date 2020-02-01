import { Component, OnInit } from '@angular/core';
import { I18nSelectPipe } from '@angular/common';
import * as socketIo from 'socket.io-client';
import { SocketService } from 'src/app/socket.service';
import {Message, Event, User, Action} from '../../models';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private socket;
  SERVER_URL : string = "http://localhost:3000";
  action = Action;
  user: User;
  messages: Message[] = [];
  messageContent: string;
  ioConnection: any;

  constructor(private socketService : SocketService) { }

  ngOnInit() {
    this.initIoConnection();
    //this.hello();

  }

 async hello() {
    let canvas = <HTMLCanvasElement>document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    for (var i = 0; i < 4*1000; i += 4) {
      let img = new Image();
      img.src = "../../../assets/images/layout.jpg";
      img.width = window.innerWidth;
      img.height = window.innerHeight;
      img.onload = () => {  
        ctx.clearRect(0,0,img.width,img.height);
        ctx.drawImage(img, 0, 0);
        let imgData = ctx.getImageData(0, 0, img.width, img.height);
        for(var j = 0; j < img.height; j++) {
          imgData.data[i+j*4*img.width+0] = 0;
          imgData.data[i+j*4*img.width+1] = 0;
          imgData.data[i+j*4*img.width+2] = 0;
          imgData.data[i+j*4*img.width+3] = 255;
        }
        ctx.clearRect(0,0,img.width,img.height);
        ctx.putImageData(imgData, 0, 0);
        (<HTMLImageElement>document.getElementById("myimage")).src = canvas.toDataURL();
      }
      await this.delay(1);
    }
  }

  delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  private initIoConnection(): void {
    this.socketService.initSocket();

    this.ioConnection = this.socketService.onMessage()
      .subscribe((message: Message) => {
        console.log(message);
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
