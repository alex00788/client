import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  socket = new WebSocket('ws://localhost:3500');
}
