import type { Lead } from "./types";
import { digitsOnly } from "./mask";

export { digitsOnly };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function maskCnpj(raw: string): string {
  const d = digitsOnly(raw).slice(0, 14);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 5);
  const p3 = d.slice(5, 8);
  const p4 = d.slice(8, 12);
  const p5 = d.slice(12, 14);
  if (d.length <= 2) return p1;
  if (d.length <= 5) return `${p1}.${p2}`;
  if (d.length <= 8) return `${p1}.${p2}.${p3}`;
  if (d.length <= 12) return `${p1}.${p2}.${p3}/${p4}`;
  return `${p1}.${p2}.${p3}/${p4}-${p5}`;
}

export function maskWhatsappBR(raw: string): string {
  const d = digitsOnly(raw).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidAnoFundacao(
  ano: number,
  anoAtual = new Date().getFullYear(),
): boolean {
  return Number.isInteger(ano) && ano >= 1950 && ano <= anoAtual;
}

export function validateOficina(lead: Lead): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!lead.empresa.trim()) errors.empresa = "Informe o nome da oficina.";
  if (digitsOnly(lead.cnpj).length !== 14) {
    errors.cnpj = "Informe um CNPJ com 14 dígitos.";
  }
  if (!isValidAnoFundacao(lead.anoFundacao)) {
    errors.anoFundacao = "Informe um ano de fundação válido.";
  }
  if (!lead.cidadeUf.trim()) errors.cidadeUf = "Informe a cidade e a UF.";
  return errors;
}

export function validatePessoa(lead: Lead): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!lead.nome.trim()) errors.nome = "Informe seu nome.";
  if (!lead.cargo) errors.cargo = "Selecione o cargo.";
  if (!Number.isInteger(lead.idade) || lead.idade < 16 || lead.idade > 99) {
    errors.idade = "Informe uma idade entre 16 e 99.";
  }
  if (!lead.genero) errors.genero = "Selecione o gênero.";
  return errors;
}

export function validateContato(lead: Lead): Record<string, string> {
  const errors: Record<string, string> = {};
  const phone = digitsOnly(lead.telefone);
  if (phone.length < 10 || phone.length > 11) {
    errors.telefone = "Informe um WhatsApp com DDD.";
  }
  if (!lead.email.trim()) errors.email = "Informe seu e-mail.";
  else if (!isValidEmail(lead.email)) errors.email = "E-mail inválido.";
  return errors;
}
