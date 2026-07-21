export const metadata = {
  title: "Política de Privacidade — JHV Agrosystem",
};

export default function PrivacidadePage() {
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-neutral-900">Política de Privacidade</h1>
      <p className="mt-1 text-sm text-neutral-500">JHV Agrosystem — última atualização: julho de 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-neutral-700">
        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900">1. Quem somos</h2>
          <p>
            O JHV Agrosystem é um sistema de gestão voltado a empresas do agronegócio e do setor
            hípico (hípicas, haras, fazendas), oferecido pela JHV a seus clientes contratantes
            (&quot;Organizações&quot;). Cada Organização opera de forma isolada dentro do sistema, com seus
            próprios dados e usuários.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900">2. Quais dados coletamos</h2>
          <p>Dependendo do uso que cada Organização faz do sistema, podemos tratar:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Dados cadastrais de clientes, proprietários, funcionários e fornecedores da
              Organização: nome, CPF/CNPJ, telefone, e-mail e endereço.
            </li>
            <li>
              Dados de animais sob cuidado da Organização, incluindo registros de saúde,
              treinamento e nutrição.
            </li>
            <li>
              Dados financeiros necessários para emissão de cobranças (boletos), incluindo
              histórico de pagamentos processados através do Mercado Pago.
            </li>
            <li>
              Conteúdo de mensagens trocadas via WhatsApp entre a Organização e os clientes dela,
              quando a Organização optar por conectar um número de WhatsApp Business ao sistema.
            </li>
            <li>Dados de acesso dos usuários do sistema (e-mail de login e registros de uso).</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900">3. Como usamos esses dados</h2>
          <p>Os dados são usados exclusivamente para permitir que cada Organização:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Gerencie seus cadastros, animais e operações internas.</li>
            <li>Gere e envie cobranças (boletos) aos próprios clientes.</li>
            <li>
              Envie notificações e se comunique com seus próprios clientes por WhatsApp e e-mail,
              quando essas integrações estiverem configuradas pela Organização.
            </li>
            <li>Gerencie o acesso de seus próprios usuários ao sistema.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900">4. Com quem compartilhamos dados</h2>
          <p>Utilizamos os seguintes prestadores de serviço para operar o sistema:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Meta / WhatsApp Business Platform</strong> — para envio e recebimento de
              mensagens de WhatsApp, quando a Organização conecta um número.
            </li>
            <li>
              <strong>Mercado Pago</strong> — para geração e processamento de cobranças (boletos),
              usando a conta de Mercado Pago da própria Organização.
            </li>
            <li>
              <strong>Resend</strong> — para envio de e-mails transacionais (boletos e contratos),
              quando configurado pela Organização.
            </li>
            <li>
              <strong>Provedores de infraestrutura</strong> (hospedagem e banco de dados) usados
              para operar o sistema.
            </li>
          </ul>
          <p className="mt-2">
            Não vendemos nem compartilhamos dados pessoais com terceiros para fins de publicidade.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900">5. Segurança e retenção</h2>
          <p>
            Os dados de cada Organização ficam isolados dos dados das demais Organizações que usam
            o sistema. Credenciais sensíveis (tokens de integração) são armazenadas de forma
            protegida e nunca exibidas integralmente na interface do sistema. Os dados são mantidos
            enquanto a Organização mantiver contrato ativo com a JHV, ou pelo prazo exigido por lei.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900">
            6. Direitos dos titulares (LGPD)
          </h2>
          <p>
            Nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018), o titular dos dados
            pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade
            ou eliminação de seus dados pessoais, entrando em contato diretamente com a Organização
            responsável pelo cadastro (o cliente da JHV com quem o titular se relaciona), já que é
            ela quem controla os dados inseridos no sistema.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-neutral-900">7. Contato</h2>
          <p>
            Dúvidas sobre esta política podem ser enviadas para{" "}
            <a href="mailto:admin@jhvagrosystem.com" className="text-brand-700 underline">
              admin@jhvagrosystem.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
