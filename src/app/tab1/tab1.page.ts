import { Component } from '@angular/core';
import { Ticket, TicketService, TipoSenha } from '../services/ticket.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false
})
export class Tab1Page {
  senhaGerada: Ticket | null = null;

  constructor(private ticketService: TicketService) {}

  emitirSenha(tipo: TipoSenha) {
    this.senhaGerada = this.ticketService.emitirSenha(tipo);
  }
}