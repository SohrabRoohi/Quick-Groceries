import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MapComponent } from './components/map/map.component';
import { InputComponent } from './components/input/input.component';
import { OptimalComponent } from './optimal/optimal.component';
import { OptimalRandomComponent } from './components/optimal-random/optimal-random.component';

const routes: Routes = [
  { path: '', component: InputComponent, pathMatch: 'full' },
  { path: 'map', component: MapComponent },
  { path: 'optimal', component: OptimalComponent},
  { path: 'optimalrandom', component: OptimalRandomComponent},
  { path: '**', redirectTo: ''}
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }