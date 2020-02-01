import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    let canvas = <HTMLCanvasElement> document.getElementById("canvas");
    let ctx = canvas.getContext("2d");
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    let img = new Image();
    img.src = "../../../assets/images/layout.jpg";
    img.width = window.innerWidth;
    img.height = window.innerHeight;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      let imgData = ctx.getImageData(0, 0, img.width, img.height).data;
      console.log(imgData);
    }
  }

}
