import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

type ToastState = { type: "ok" | "err"; message: string } | null;

export function Scanner() {
  const { user } = useAuth();
  const [toast, setToast] = useState<ToastState>(null);
  const [busy, setBusy] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!user) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 240, height: 240 }, rememberLastUsedCamera: true },
      false
    );
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => onDecoded(decodedText),
      () => {
        /* ignora frames sem QR — comportamento normal do scanner */
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function onDecoded(payload: string) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);

    try {
      if (payload.startsWith("ACT:")) {
        const activityId = payload.slice(4);
        const result = await api.scanPresence({ activityId });
        setToast({ type: "ok", message: result.message });
      } else if (payload.startsWith("USER:")) {
        const scannedId = payload.slice(5);
        const result = await api.scanNetwork({ scannedId });
        setToast({ type: "ok", message: result.message });
      } else {
        setToast({ type: "err", message: "QR Code não reconhecido pelo IT WORKS." });
      }
    } catch (err) {
      setToast({ type: "err", message: err instanceof Error ? err.message : "Erro ao processar QR" });
    } finally {
      // pequeno cooldown pra nao processar o mesmo frame varias vezes seguidas
      setTimeout(() => {
        busyRef.current = false;
        setBusy(false);
      }, 1500);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "30px auto" }}>
      <div className="section-title">
        <span className="bar" />
        <h2>Scanner</h2>
      </div>
      <p style={{ marginTop: -10, marginBottom: 20 }}>
        Aponte a câmera para o QR de uma atividade (telão) ou para o QR de outra pessoa.
      </p>

      <div className="scanner-frame">
        <div id="qr-reader" />
      </div>

      {busy && <p style={{ fontFamily: "var(--font-mono)", marginTop: 14 }}>Processando…</p>}

      {toast && (
        <div className={`result-toast ${toast.type === "ok" ? "ok" : "err"}`}>
          {toast.type === "ok" ? "✓ " : "⚠ "}
          {toast.message}
        </div>
      )}
    </div>
  );
}
