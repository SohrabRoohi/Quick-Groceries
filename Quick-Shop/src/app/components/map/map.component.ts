import { Component, OnInit } from '@angular/core';
import { SocketService } from 'src/app/socket.service';
import { Message, Event, User } from '../../models';

const SERVER_URL : string = "http://localhost:3000";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  host: {
    '(document:keydown)': 'onKeyDown($event)'
  }
})
export class MapComponent implements OnInit {
  private ioConnection: any;
  private canvas: any;
  private ctx: any;
  private img: any;
  private sections : Map<any,any>;
  private user: User = {x: 945, y: 630};
  private id : string;

  constructor(private socketService : SocketService) { }

  ngOnInit() {
    this.initImage();
    this.img.onload = () => { 
      this.initIoConnection();
      this.initCanvas();
    }
  }

  private initCanvas() {
    this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.canvas.width = window.innerWidth;
    this.ctx.canvas.height = window.innerHeight;
  }

  private initImage() {
    this.img = new Image();
    this.img.src = "../../../assets/images/layout.jpg";
  }

  async paintLine () {
    for (var i = 0; i < 4*this.img.width; i += 4) {
      this.ctx.clearRect(0,0,this.img.width,this.img.height);
      this.ctx.drawImage(this.img, 0, 0);
      let imgData = this.ctx.getImageData(0, 0, this.img.width, this.img.height);
      for(var j = 0; j < this.img.height; j++) {
        imgData.data[i+j*4*this.img.width+0] = 0;
        imgData.data[i+j*4*this.img.width+1] = 0;
        imgData.data[i+j*4*this.img.width+2] = 0;
        imgData.data[i+j*4*this.img.width+3] = 255;
      }
      this.ctx.clearRect(0,0,this.img.width,this.img.height);
      this.ctx.putImageData(imgData, 0, 0);
      (<HTMLImageElement>document.getElementById("map")).src = this.canvas.toDataURL();

      await this.delay(1);
    }
  }

  async updatePositions(msg: Message) {
    this.ctx.clearRect(0,0,this.img.width,this.img.height);
    this.ctx.drawImage(this.img, 0, 0);
    let imgData = this.ctx.getImageData(0, 0, this.img.width, this.img.height);

    this.updateOthers(msg.positions, imgData);
    var testUser = this.getMyPos(msg.positions);
    //console.log(testUser);
    //if(testUser != null) this.user = testUser;
    this.updateMe(this.user, imgData);

    this.ctx.clearRect(0,0,this.img.width,this.img.height);
    this.ctx.putImageData(imgData, 0, 0);
    (<HTMLImageElement>document.getElementById("map")).src = this.canvas.toDataURL();
  }

  getMyPos(users: User[]) : User {
    let min_dis = 9000000000;
    let user = null;
    users.forEach(element => {
      let dis = Math.pow(element.x - this.user["x"], 2) + Math.pow(element.y - this.user["y"], 2);
      if (dis < min_dis) {
        min_dis = dis;
        user = element;
      }
    });
    //this.user = user;
    return user;
  }

  updateMe(user: User, imgData: ImageData) {
    this.updatePerson(user, imgData, 0, 0, 255);
  }

  updateOthers(users: User[], imgData: ImageData) {
    users.forEach(user => {
      this.updatePerson(user,imgData, 0, 255, 0);
    });
  }

  updatePerson(user: User, imgData: ImageData, r: number, g: number, b: number) {
    let x = user["x"];
    let y = user["y"];
    let index = (y * this.img.width + x) * 4;
    for (let i = -5; i <= 5; i++) {
      for(let j = index-5*4; j <= index+5*4; j += 4) {
        imgData.data[j+i*4*this.img.width+0] = r;
        imgData.data[j+i*4*this.img.width+1] = g;
        imgData.data[j+i*4*this.img.width+2] = b;
        imgData.data[j+i*4*this.img.width+3] = 255;
      }
    }
  }

  private delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
  }

  private onKeyDown(event:KeyboardEvent) {
    // PRESS LEFT ARRO
    if (event.keyCode == 37) {
      this.user.x -= 3;
      console.log(this.user.x);
    }
    // PRESS UP ARROW
    else if (event.keyCode == 38) {
       this.user.y -= 3;
    }
    // PRESS RIGHT ARROW
    else if (event.keyCode == 39) {
       this.user.x += 3;
    }
    // PRESS DOWN ARROW
    else if (event.keyCode == 40) {
       this.user.y += 3;
    }
  }

  private initIoConnection(): void {
    this.socketService.initSocket();
    this.socketService.sendUser({id: this.id, pos: {x: this.user["x"], y : this.user["y"]}});
    
    this.ioConnection = this.socketService.onMessage()
      .subscribe((message: Message) => {
        // this.paintLine();
        console.log(message);
        this.updatePositions(message);
      });

    this.socketService.onSections().subscribe((sections : string) => {
        console.log(sections);
        this.sections = new Map(JSON.parse(sections));
    });

    this.socketService.onID().subscribe((id : string) => {
      this.id = id;
      setInterval(() => {this.user.y -= 10; this.socketService.sendUser({id: this.id, pos: {x: this.user["x"], y : this.user["y"]}})}, 1000);
    });

    this.socketService.onEvent(Event.CONNECT)
      .subscribe(() => {
        console.log('connected');
      });
      
    this.socketService.onEvent(Event.DISCONNECT)
      .subscribe(() => {
        console.log('disconnected');
      })
  }
}
