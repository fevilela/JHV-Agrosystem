import { MercadoPagoConfig, Payment } from "mercadopago";

export function getPaymentClient(accessToken: string) {
  const config = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
  return new Payment(config);
}

export function identificationFromCpfCnpj(cpfCnpj: string) {
  const digits = cpfCnpj.replace(/\D/g, "");
  if (digits.length === 11) return { type: "CPF", number: digits };
  if (digits.length === 14) return { type: "CNPJ", number: digits };
  return null;
}

export function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const first_name = parts[0] ?? fullName;
  const last_name = parts.length > 1 ? parts.slice(1).join(" ") : first_name;
  return { first_name, last_name };
}
