import { Component } from '@angular/core';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false
})
export class Tab3Page {
  constructor(private ticketService: TicketService) {}

  get ultimasChamadas() {
    return this.ticketService.getUltimasChamadas();
  }

  get senhas() {
    return this.ticketService.getSenhas();
  }

  get relatorio() {
    return this.ticketService.getRelatorio();
  }
}