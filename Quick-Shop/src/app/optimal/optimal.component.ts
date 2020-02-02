import { Component, OnInit } from '@angular/core';
import { SocketService } from 'src/app/socket.service';
import { Message, Event, User } from '../models';
import { Queue } from 'queue-typescript';

const SERVER_URL: string = "http://localhost:3000";

@Component({
  selector: 'app-optimal',
  templateUrl: './optimal.component.html',
  styleUrls: ['./optimal.component.css'],
})
export class OptimalComponent implements OnInit {
  private ioConnection: any;
  private canvas: any;
  private ctx: any;
  private img: any;
  private sections: Map<any, any>;
  private sectionList : Array<string> = new Array<string>();
  private user: User = { x: 945, y: 615 };
  private id: string;
  private origImgData: any;
  private counts: Map<string, number>;
  private running: boolean = false;

  constructor(private socketService: SocketService) {
    this.counts = new Map<string, number>();
  }

  ngOnInit() {
    this.initImage();
    this.img.onload = () => {
      this.initIoConnection();
      this.initCanvas();
      var canvas = <HTMLCanvasElement>document.getElementById("can");
      var ctx = canvas.getContext("2d");
      canvas.height = this.img.height;
      canvas.width = this.img.width;
      ctx.clearRect(0, 0, this.img.width, this.img.height);
      ctx.drawImage(this.img, 0, 0);
      this.origImgData = ctx.getImageData(0, 0, this.img.width, this.img.height);
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

  async paintLine() {
    for (var i = 0; i < 4 * this.img.width; i += 4) {
      this.ctx.clearRect(0, 0, this.img.width, this.img.height);
      this.ctx.drawImage(this.img, 0, 0);
      let imgData = this.ctx.getImageData(0, 0, this.img.width, this.img.height);
      for (var j = 0; j < this.img.height; j++) {
        imgData.data[i + j * 4 * this.img.width + 0] = 0;
        imgData.data[i + j * 4 * this.img.width + 1] = 0;
        imgData.data[i + j * 4 * this.img.width + 2] = 0;
        imgData.data[i + j * 4 * this.img.width + 3] = 255;
      }
      this.ctx.clearRect(0, 0, this.img.width, this.img.height);
      this.ctx.putImageData(imgData, 0, 0);
      (<HTMLImageElement>document.getElementById("map")).src = this.canvas.toDataURL();

      await this.delay(1);
    }
  }

  async updatePositions(msg: Message) {
    this.ctx.clearRect(0, 0, this.img.width, this.img.height);
    this.ctx.drawImage(this.img, 0, 0);
    let imgData = this.ctx.getImageData(0, 0, this.img.width, this.img.height);
    this.updateOthers(msg.positions, imgData);
    var testUser = this.getMyPos(msg.positions);
    this.updateMe(this.user, imgData);
    this.ctx.clearRect(0, 0, this.img.width, this.img.height);
    if (this.sections) {
      this.findroute(imgData);
    }
    this.ctx.putImageData(imgData, 0, 0);
    (<HTMLImageElement>document.getElementById("map")).src = this.canvas.toDataURL();
  }

  findroute(imgData: ImageData) {
    if (!this.running && this.counts.size != 0) {
      for (var entries of this.counts.entries()) {
        var d = this.distance(this.user.x, this.user.y, this.sections.get(entries[0])[0], this.sections.get(entries[0])[1]);
        if (d <= 20) {
          this.counts.delete(entries[0]);
          return;
        }
      }
      this.running = true;
      let queue = new Queue<number>();
      let visited: boolean[][] = new Array(this.img.width).fill(false).map(() => new Array(this.img.height).fill(false));
      let parent: number[][] = new Array(this.img.width).fill(-1).map(() => new Array(this.img.height).fill(-1));
      let list = [];
      queue.enqueue(this.user.x + this.img.width * this.user.y);
      let start = this.user.x + this.user.y * this.img.width;
      
      visited[this.user.x][this.user.y] = true;
      let end = null;
      let dx = [3, -3, 0, 0];
      let dy = [0, 0, 3, -3];
      whileLoop:
      while (queue.length != 0) {
        let cur = queue.dequeue();
        let curX = cur % this.img.width;
        let curY = Math.floor(cur / this.img.width);
        for (var entries of this.counts.entries()) {
          var d = this.distance(curX, curY, this.sections.get(entries[0])[0], this.sections.get(entries[0])[1]);
          if (d <= 20) {
            end = cur;
            break whileLoop;
          }
        }
        for (var i = 0; i < 4; i++) {
          var newX = curX + dx[i];
          var newY = curY + dy[i];
          if (newX >= 0 && newY >= 0 && newX < this.img.width && newY < this.img.height && !visited[newX][newY] && this.checkPos(newX, newY)) {
            visited[newX][newY] = true;
            parent[newX][newY] = cur;
            queue.enqueue(newX + newY * this.img.width);
          }
        }
      }
      if (end) {
        while (end != start) {
          list.push(end);
          var curX = end % this.img.width;
          var curY = Math.floor(end / this.img.width);
          let index = (curY * this.img.width + curX) * 4;
          imgData.data[index + 0] = 255;
          imgData.data[index + 1] = 0;
          imgData.data[index + 2] = 0;
          imgData.data[index + 3] = 255;
          end = parent[curX][curY];
        }
      }
      if(list.length > 0) {
        var val = list[Math.max(0,list.length-3)];
        this.user.x = val % this.img.width;
        this.user.y = Math.floor(val / this.img.width);
        
      }
      this.running = false;
    }

  }

  distance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }


  getMyPos(users: User[]): User {
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
      this.updatePerson(user, imgData, 0, 255, 0);
    });
  }

  updatePerson(user: User, imgData: ImageData, r: number, g: number, b: number) {
    let x = user["x"];
    let y = user["y"];
    let index = (y * this.img.width + x) * 4;
    for (let i = -5; i <= 5; i++) {
      for (let j = index - 5 * 4; j <= index + 5 * 4; j += 4) {
        imgData.data[j + i * 4 * this.img.width + 0] = r;
        imgData.data[j + i * 4 * this.img.width + 1] = g;
        imgData.data[j + i * 4 * this.img.width + 2] = b;
        imgData.data[j + i * 4 * this.img.width + 3] = 255;
      }
    }
  }

  checkPos(x, y) {
    let pixel = (y * this.img.width + x) * 4;
    return this.origImgData.data[pixel + 0] == 238 && this.origImgData.data[pixel + 1] == 241 && this.origImgData.data[pixel + 2] == 246 && this.origImgData.data[pixel + 3] == 255;
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private initIoConnection(): void {
    this.socketService.initSocket();
    this.socketService.sendUser({ id: this.id, pos: { x: this.user["x"], y: this.user["y"] } });

    this.ioConnection = this.socketService.onMessage()
      .subscribe((message: Message) => {
        // this.paintLine();
        this.updatePositions(message);
      });

    this.socketService.onSections().subscribe((sections: string) => {
      this.sections = new Map(JSON.parse(sections));
      for(var entries of this.sections.entries()) {
        this.sectionList.push(entries[0]);
      }
      for(var i = 0; i < 10; i++) {
        var name = this.sectionList[Math.floor(this.sectionList.length * Math.random())];
        this.counts.set(name,1);
      }
      
    });

    this.socketService.onID().subscribe((id: string) => {
      this.id = id;
      setInterval(() => { this.socketService.sendUser({ id: this.id, pos: { x: this.user["x"], y: this.user["y"] } }) }, 100);
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
