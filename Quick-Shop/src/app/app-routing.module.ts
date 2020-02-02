import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MapComponent } from './components/map/map.component';
import {OptimalComponent} from './optimal/optimal.component';

const routes: Routes = [
  { path: '', component: MapComponent, pathMatch: 'full' },
  { path: 'optimal', component: OptimalComponent},
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