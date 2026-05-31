import { Component } from '@angular/core';
import { Ticket, TicketService } from '../services/ticket.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false
})
export class Tab2Page {
  guiche = 1;
  private totalGuiches = 3;

  senhaChamada: Ticket | null = null;
  mensagem = '';

  constructor(private ticketService: TicketService) {}

  chamarProxima() {
    this.senhaChamada = this.ticketService.chamarProximaSenha(this.guiche);

    if (this.senhaChamada) {
      this.mensagem = 'Senha chamada com sucesso!';

      this.guiche++;

      if (this.guiche > this.totalGuiches) {
        this.guiche = 1;
      }
    } else {
      this.mensagem = 'Não há senhas pendentes para atendimento.';
    }
  }

  descartarSenha(numero: string) {
    const descartou = this.ticketService.descartarSenha(numero);

    if (descartou) {
      this.mensagem = `Senha ${numero} descartada com sucesso.`;
    } else {
      this.mensagem = 'Não foi possível descartar esta senha.';
    }
  }

  get pendentes() {
    return this.ticketService.getPendentes();
  }
}