"use client";

import { useEffect, useRef, useState } from "react";
import { conectarWhatsappAction } from "./actions";

declare global {
  interface Window {
    FB?: {
      init: (params: {
        appId: string;
        autoLogAppEvents?: boolean;
        xfbml?: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: { code?: string };
          status?: string;
        }) => void,
        options: {
          config_id: string;
          response_type: string;
          override_default_response_type: boolean;
          extras?: Record<string, unknown>;
        }
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export function ConnectWhatsappButton({ organizationId }: { organizationId: string }) {
  const [status, setStatus] = useState<"idle" | "connecting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const signupData = useRef<{ phoneNumberId?: string; wabaId?: string }>({});

  useEffect(() => {
    const origensAceitas = [
      "https://www.facebook.com",
      "https://web.facebook.com",
      "https://business.facebook.com",
    ];

    function handleMessage(event: MessageEvent) {
      if (!origensAceitas.includes(event.origin)) return;
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (data?.type === "WA_EMBEDDED_SIGNUP" && data?.data) {
          if (data.data.phone_number_id) signupData.current.phoneNumberId = data.data.phone_number_id;
          if (data.data.waba_id) signupData.current.wabaId = data.data.waba_id;
        }
      } catch {
        // mensagens que não são do embedded signup são ignoradas
      }
    }

    window.addEventListener("message", handleMessage);

    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    if (appId && !window.FB) {
      window.fbAsyncInit = () => {
        window.FB?.init({ appId, xfbml: true, version: "v21.0" });
      };
      const script = document.createElement("script");
      script.src = "https://connect.facebook.net/pt_BR/sdk.js";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  async function finalizarConexao(code: string) {
    const resultado = await conectarWhatsappAction(organizationId, {
      code,
      phoneNumberId: signupData.current.phoneNumberId,
      wabaId: signupData.current.wabaId,
    });

    if (resultado?.error) {
      setStatus("error");
      setMessage(resultado.error);
    } else {
      setStatus("success");
      setMessage("WhatsApp conectado com sucesso!");
    }
  }

  function handleClick() {
    const configId = process.env.NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID;
    if (!window.FB || !configId) {
      setStatus("error");
      setMessage("SDK do Facebook ainda não carregou, ou NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID não está configurado.");
      return;
    }

    setStatus("connecting");
    setMessage(null);
    signupData.current = {};

    // O callback do FB.login precisa ser uma função síncrona (não async) — o SDK do
    // Facebook rejeita internamente uma função assíncrona passada direto aqui
    // ("Expression is of type asyncfunction, not function"), então o trabalho
    // assíncrono fica isolado em finalizarConexao, só disparado daqui.
    window.FB.login(
      (response) => {
        const code = response.authResponse?.code;
        if (!code) {
          setStatus("error");
          setMessage("Conexão cancelada ou sem permissão concedida.");
          return;
        }

        finalizarConexao(code);
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        // Sem featureType: fluxo padrão da Meta (Cloud API), que cria um número novo
        // direto — mais simples e mais confiável que o de Coexistência, que exige
        // parear com o app WhatsApp Business já instalado no celular.
        extras: {
          sessionInfoVersion: "3",
        },
      }
    );
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={status === "connecting"}
        className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-60"
      >
        {status === "connecting" ? "Conectando..." : "Conectar WhatsApp"}
      </button>
      {message && (
        <p className={`text-sm ${status === "error" ? "text-red-600" : "text-green-700"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
