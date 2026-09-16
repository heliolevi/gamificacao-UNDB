import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api, getStoredUserId } from "../api";

type ToastState = { type: "ok" | "err"; message: string } | null;

export function Scanner() {
  const myId = getStoredUserId();
  const [toast, setToast] = useState<ToastState>(null);
  const [busy, setBusy] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!myId) return;

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
  }, [myId]);

  async function onDecoded(payload: string) {
    if (busyRef.current || !myId) return;
    busyRef.current = true;
    setBusy(true);

    try {
      if (payload.startsWith("ACT:")) {
        const activityId = payload.slice(4);
        const result = await api.scanPresence({ userId: myId, activityId });
        setToast({ type: "ok", message: result.message });
      } else if (payload.startsWith("USER:")) {
        const scannedId = payload.slice(5);
        const result = await api.scanNetwork({ scannerId: myId, scannedId });
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

  if (!myId) {
    return (
      <div className="panel glow-magenta" style={{ maxWidth: 480, margin: "60px auto", textAlign: "center" }}>
        <h2>Crie seu perfil primeiro</h2>
        <p>Você precisa de um perfil (e QR Code) antes de usar o scanner.</p>
        <Link to="/cadastro" className="btn">
          Criar perfil
        </Link>
      </div>
    );
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
