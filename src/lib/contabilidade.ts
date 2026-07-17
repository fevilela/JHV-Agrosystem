export function calcularSaldo(
  nature: "DEVEDORA" | "CREDORA",
  totalDebito: number,
  totalCredito: number
) {
  return nature === "DEVEDORA" ? totalDebito - totalCredito : totalCredito - totalDebito;
}
