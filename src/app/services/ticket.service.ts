import { Injectable } from '@angular/core';

export type TipoSenha = 'SP' | 'SG' | 'SE';

export interface Ticket {
  numero: string;
  tipo: TipoSenha;
  dataEmissao: Date;
  dataAtendimento?: Date;
  dataDescarte?: Date;
  guiche?: number;
  atendida: boolean;
  descartada: boolean;
  tempoAtendimento?: number;
  motivoDescarte?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private senhas: Ticket[] = [];
  private ultimasChamadas: Ticket[] = [];

  private sequencias = {
    SP: 0,
    SG: 0,
    SE: 0
  };

  private chamarPrioritaria = true;

  emitirSenha(tipo: TipoSenha): Ticket {
    const hoje = new Date();

    this.sequencias[tipo]++;

    const ano = String(hoje.getFullYear()).slice(-2);
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const sequencia = String(this.sequencias[tipo]).padStart(2, '0');

    const numero = `${ano}${mes}${dia}-${tipo}${sequencia}`;

    const senha: Ticket = {
      numero,
      tipo,
      dataEmissao: hoje,
      atendida: false,
      descartada: false
    };

    this.senhas.push(senha);
    return senha;
  }

chamarProximaSenha(guiche: number): Ticket | null {
  if (!this.expedienteAberto()) {
    this.descartarSenhasPendentesPorFimDeExpediente();
    return null;
  }

  const proxima = this.definirProximaSenha();

  if (!proxima) {
    return null;
  }

  proxima.atendida = true;
  proxima.dataAtendimento = new Date();
  proxima.guiche = guiche;
  proxima.tempoAtendimento = this.calcularTempoAtendimento(proxima.tipo);

  if (proxima.tipo === 'SP') {
    this.chamarPrioritaria = false;
  } else {
    this.chamarPrioritaria = true;
  }

  this.ultimasChamadas.unshift(proxima);
  this.ultimasChamadas = this.ultimasChamadas.slice(0, 5);

  return proxima;
  
}

  expedienteAberto(): boolean {
  const agora = new Date();
  const hora = agora.getHours();

  return hora >= 7 && hora < 17;
}

  private descartarSenhasPendentesPorFimDeExpediente(): void {
    this.senhas.forEach(senha => {
      if (!senha.atendida && !senha.descartada) {
        senha.descartada = true;
        senha.dataDescarte = new Date();
        senha.motivoDescarte = 'Fim do expediente';
      }
    });
  }

  private simularNaoAtendimento(): boolean {
    return Math.random() < 0.05;
  }

  private definirProximaSenha(): Ticket | null {
    const filaSP = this.buscarPendentePorTipo('SP');
    const filaSE = this.buscarPendentePorTipo('SE');
    const filaSG = this.buscarPendentePorTipo('SG');

    if (this.chamarPrioritaria && filaSP) {
      return filaSP;
    }

    if (!this.chamarPrioritaria) {
      if (filaSE) {
        return filaSE;
      }

      if (filaSG) {
        return filaSG;
      }

      if (filaSP) {
        return filaSP;
      }
    }

    if (filaSP) {
      return filaSP;
    }

    if (filaSE) {
      return filaSE;
    }

    if (filaSG) {
      return filaSG;
    }

    return null;
  }

  private buscarPendentePorTipo(tipo: TipoSenha): Ticket | undefined {
    return this.senhas.find(
      senha => senha.tipo === tipo && !senha.atendida && !senha.descartada
    );
  }

  descartarSenha(numero: string): boolean {
    const senha = this.senhas.find(
      item => item.numero === numero && !item.atendida && !item.descartada
    );

    if (!senha) {
      return false;
    }

    senha.descartada = true;
    senha.dataDescarte = new Date();
    senha.motivoDescarte = 'Descarte manual';

    return true;
  }

  private calcularTempoAtendimento(tipo: TipoSenha): number {
    if (tipo === 'SP') {
      return this.numeroAleatorio(10, 20);
    }

    if (tipo === 'SG') {
      return this.numeroAleatorio(2, 8);
    }

    const chance = Math.random();

    if (chance <= 0.95) {
      return 1;
    }

    return 5;
  }

  private numeroAleatorio(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getSenhas(): Ticket[] {
    return this.senhas;
  }

  getUltimasChamadas(): Ticket[] {
    return this.ultimasChamadas;
  }

  getPendentes(): Ticket[] {
    return this.senhas.filter(s => !s.atendida && !s.descartada);
  }

  getRelatorio() {
    const hoje = new Date();

    const senhasDiarias = this.senhas.filter(senha =>
      this.mesmaData(senha.dataEmissao, hoje)
    );

    const senhasMensais = this.senhas.filter(senha =>
      senha.dataEmissao.getMonth() === hoje.getMonth() &&
      senha.dataEmissao.getFullYear() === hoje.getFullYear()
    );

    return {
      emitidas: this.senhas.length,
      atendidas: this.senhas.filter(s => s.atendida).length,
      descartadas: this.senhas.filter(s => s.descartada).length,
      pendentes: this.getPendentes().length,

      emitidasSP: this.contarPorTipo(this.senhas, 'SP'),
      emitidasSG: this.contarPorTipo(this.senhas, 'SG'),
      emitidasSE: this.contarPorTipo(this.senhas, 'SE'),

      atendidasSP: this.contarAtendidasPorTipo(this.senhas, 'SP'),
      atendidasSG: this.contarAtendidasPorTipo(this.senhas, 'SG'),
      atendidasSE: this.contarAtendidasPorTipo(this.senhas, 'SE'),

      descartadasSP: this.contarDescartadasPorTipo(this.senhas, 'SP'),
      descartadasSG: this.contarDescartadasPorTipo(this.senhas, 'SG'),
      descartadasSE: this.contarDescartadasPorTipo(this.senhas, 'SE'),

      tempoMedioGeral: this.calcularTempoMedio(this.senhas.filter(s => s.atendida)),
      tempoMedioSP: this.calcularTempoMedio(this.senhas.filter(s => s.tipo === 'SP' && s.atendida)),
      tempoMedioSG: this.calcularTempoMedio(this.senhas.filter(s => s.tipo === 'SG' && s.atendida)),
      tempoMedioSE: this.calcularTempoMedio(this.senhas.filter(s => s.tipo === 'SE' && s.atendida)),

      diarioEmitidas: senhasDiarias.length,
      diarioAtendidas: senhasDiarias.filter(s => s.atendida).length,
      diarioDescartadas: senhasDiarias.filter(s => s.descartada).length,

      mensalEmitidas: senhasMensais.length,
      mensalAtendidas: senhasMensais.filter(s => s.atendida).length,
      mensalDescartadas: senhasMensais.filter(s => s.descartada).length
    };
  }

  private mesmaData(data1: Date, data2: Date): boolean {
    return (
      data1.getDate() === data2.getDate() &&
      data1.getMonth() === data2.getMonth() &&
      data1.getFullYear() === data2.getFullYear()
    );
  }

  private contarPorTipo(lista: Ticket[], tipo: TipoSenha): number {
    return lista.filter(s => s.tipo === tipo).length;
  }

  private contarAtendidasPorTipo(lista: Ticket[], tipo: TipoSenha): number {
    return lista.filter(s => s.tipo === tipo && s.atendida).length;
  }

  private contarDescartadasPorTipo(lista: Ticket[], tipo: TipoSenha): number {
    return lista.filter(s => s.tipo === tipo && s.descartada).length;
  }

  private calcularTempoMedio(lista: Ticket[]): number {
    if (lista.length === 0) {
      return 0;
    }

    const total = lista.reduce((soma, senha) => soma + (senha.tempoAtendimento || 0), 0);
    return Number((total / lista.length).toFixed(2));
  }
}