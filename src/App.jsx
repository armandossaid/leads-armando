import { useState, useEffect } from "react";

const STEPS = [
  {
    id: "nombre",
    question: "¿Cómo te llamas?",
    subtitle: "Para saber a quién le escribo 👋",
    type: "text",
    placeholder: "Tu nombre completo",
    key: "nombre",
  },
  {
    id: "whatsapp",
    question: "¿Cuál es tu WhatsApp?",
    subtitle: "Te contacto directamente por ahí",
    type: "tel",
    placeholder: "+52 55 1234 5678",
    key: "whatsapp",
  },
  {
    id: "email",
    question: "¿Y tu correo?",
    subtitle: "Para enviarte información detallada",
    type: "email",
    placeholder: "tu@correo.com",
    key: "email",
  },
  {
    id: "interes",
    question: "¿Qué estás buscando?",
    subtitle: "Puedes elegir más de una opción",
    type: "multi",
    key: "interes",
    options: [
      { value: "comprar_vivir", label: "🏠 Comprar para vivir" },
      { value: "comprar_invertir", label: "📈 Comprar para invertir" },
      { value: "preventa", label: "🏗️ Preventa" },
      { value: "rentar", label: "🔑 Rentar" },
      { value: "vender", label: "💼 Vender mi propiedad" },
    ],
  },
  {
    id: "zona",
    question: "¿En qué zona o ciudad te interesa?",
    subtitle: "Ciudad, colonia o estado — lo que tengas en mente",
    type: "text",
    placeholder: "Ej: Roma Norte, CDMX / Puerto Vallarta / Mérida",
    key: "zona",
  },
  {
    id: "presupuesto",
    question: "¿Con qué presupuesto cuentas?",
    subtitle: "Aproximado está bien, sin compromiso",
    type: "single",
    key: "presupuesto",
    options: [
      { value: "menos_2", label: "Menos de $2 MDP" },
      { value: "2_5", label: "$2 – $5 MDP" },
      { value: "5_10", label: "$5 – $10 MDP" },
      { value: "mas_10", label: "Más de $10 MDP" },
      { value: "no_definido", label: "Aún no lo defino" },
    ],
  },
  {
    id: "timeline",
    question: "¿En qué tiempo piensas tomar una decisión?",
    subtitle: "Así sé qué tan urgente es tu búsqueda",
    type: "single",
    key: "timeline",
    options: [
      { value: "ya", label: "⚡ Ya estoy listo" },
      { value: "3meses", label: "📅 En los próximos 3 meses" },
      { value: "6meses", label: "🗓️ En 6 meses" },
      { value: "explorando", label: "👀 Solo estoy explorando" },
    ],
  },
  {
    id: "comentarios",
    question: "¿Algo más que quieras contarme?",
    subtitle: "Opcional — pero entre más detalles, mejor te ayudo",
    type: "textarea",
    placeholder: "Cuéntame lo que necesites...",
    key: "comentarios",
    optional: true,
  },
];

const SCORE_MAP = {
  timeline: { ya: 25, "3meses": 20, "6meses": 10, explorando: 0 },
  presupuesto: { menos_2: 5, "2_5": 10, "5_10": 15, mas_10: 20, no_definido: 0 },
  interes: { comprar_invertir: 15, preventa: 12, comprar_vivir: 10, vender: 8, rentar: 5 },
};

function calcScore(data) {
  let score = 0;
  if (data.timeline) score += SCORE_MAP.timeline[data.timeline] || 0;
  if (data.presupuesto) score += SCORE_MAP.presupuesto[data.presupuesto] || 0;
  if (data.interes?.length) {
    const best = Math.max(...data.interes.map((i) => SCORE_MAP.interes[i] || 0));
    score += best;
  }
  if (data.comentarios?.length > 10) score += 10;
  return Math.min(score, 100);
}

function ScoreTag({ score }) {
  const color = score >= 50 ? "#22c55e" : score >= 25 ? "#f59e0b" : "#94a3b8";
  const label = score >= 50 ? "Lead caliente 🔥" : score >= 25 ? "Lead tibio ⏳" : "Lead frío ❄️";
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 999, padding: "2px 12px", fontSize: 12, fontWeight: 600, letterSpacing: "0.03em" }}>
      {label} · {score} pts
    </span>
  );
}

export default function LeadForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const [inputVal, setInputVal] = useState("");
  const [multiVal, setMultiVal] = useState([]);
  const [done, setDone] = useState(false);
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState("form");
  const [adminPass, setAdminPass] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [shake, setShake] = useState(false);
  const [animDir, setAnimDir] = useState("forward");
  const [visible, setVisible] = useState(true);

  const current = STEPS[step];
  const progress = (step / STEPS.length) * 100;

  useEffect(() => {
    setInputVal(data[current?.key] || "");
    setMultiVal(Array.isArray(data[current?.key]) ? data[current.key] : []);
  }, [step]);

  function triggerShake() { setShake(true); setTimeout(() => setShake(false), 400); }

  function animateTransition(dir, cb) {
    setAnimDir(dir); setVisible(false);
    setTimeout(() => { cb(); setVisible(true); }, 200);
  }

  function canProceed() {
    if (current.optional) return true;
    if (current.type === "multi") return multiVal.length > 0;
    if (current.type === "single") return !!data[current.key];
    return inputVal.trim().length > 0;
  }

  function handleNext() {
    if (!canProceed()) { triggerShake(); return; }
    const newData = { ...data };
    if (["text","tel","email","textarea"].includes(current.type)) newData[current.key] = inputVal;
    setData(newData);
    if (step < STEPS.length - 1) {
      animateTransition("forward", () => setStep((s) => s + 1));
    } else {
      const score = calcScore(newData);
      const clasificacion = score >= 50 ? "🔥 Caliente" : score >= 25 ? "⏳ Tibio" : "❄️ Frío";
      const lead = { ...newData, score, clasificacion, fecha: new Date().toLocaleString("es-MX") };
      setLeads((prev) => [lead, ...prev]);
      const SHEETS_URL = "https://script.google.com/macros/s/AKfycbzHyef8vBLo8VhNBEcduN054TEqAdvOO6fx_WByjl5CywbZBUf5Ni5GQyN-A_E2beuL/exec";
      fetch(SHEETS_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...lead, interes: Array.isArray(lead.interes) ? lead.interes.join(", ") : lead.interes }) }).catch(console.error);
      setDone(true);
    }
  }

  function handleBack() { if (step === 0) return; animateTransition("back", () => setStep((s) => s - 1)); }
  function handleSingle(val) { setData((prev) => ({ ...prev, [current.key]: val })); }
  function handleMulti(val) {
    setMultiVal((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]);
    setData((prev) => { const arr = prev[current.key] || []; return { ...prev, [current.key]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] }; });
  }
  function handleKeyDown(e) { if (e.key === "Enter" && current.type !== "textarea") handleNext(); }

  const inputStyle = { width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff", fontSize: 18, padding: "14px 18px", outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border 0.2s" };

  if (view === "admin") {
    if (!adminUnlocked) return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ background: "#13131a", border: "1px solid #222", borderRadius: 20, padding: 40, width: 340, textAlign: "center" }}>
          <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Panel de Leads</div>
          <div style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>Ingresa la clave de acceso</div>
          <input type="password" placeholder="Contraseña" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && adminPass === "armando2024") setAdminUnlocked(true); }} style={{ ...inputStyle, fontSize: 15, marginBottom: 12 }} />
          <button onClick={() => { if (adminPass === "armando2024") setAdminUnlocked(true); }} style={{ width: "100%", background: "#c9a96e", color: "#0a0a0f", border: "none", borderRadius: 10, padding: "12px 0", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Entrar</button>
          <button onClick={() => setView("form")} style={{ marginTop: 12, background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 13 }}>← Volver al formulario</button>
        </div>
      </div>
    );
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "system-ui, sans-serif", padding: "40px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
            <div>
              <div style={{ color: "#c9a96e", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Armando Said</div>
              <div style={{ color: "#fff", fontSize: 24, fontWeight: 700 }}>Panel de Leads</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ background: "#13131a", border: "1px solid #222", borderRadius: 12, padding: "10px 20px", color: "#fff", fontSize: 14 }}><span style={{ color: "#c9a96e", fontWeight: 700 }}>{leads.length}</span> leads</div>
              <button onClick={() => setView("form")} style={{ background: "#13131a", border: "1px solid #222", borderRadius: 12, padding: "10px 16px", color: "#666", fontSize: 13, cursor: "pointer" }}>← Formulario</button>
            </div>
          </div>
          {leads.length === 0 ? (
            <div style={{ textAlign: "center", color: "#333", padding: "80px 0", fontSize: 16 }}>Aún no hay leads. Comparte el formulario y aquí aparecerán.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {leads.map((lead, i) => (
                <div key={i} style={{ background: "#13131a", border: "1px solid #222", borderRadius: 16, padding: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                    <div><div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>{lead.nombre}</div><div style={{ color: "#555", fontSize: 12, marginTop: 2 }}>{lead.fecha}</div></div>
                    <ScoreTag score={lead.score} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                    {[{ label: "WhatsApp", val: lead.whatsapp }, { label: "Email", val: lead.email }, { label: "Zona", val: lead.zona }, { label: "Presupuesto", val: lead.presupuesto }, { label: "Timeline", val: lead.timeline }, { label: "Interés", val: Array.isArray(lead.interes) ? lead.interes.join(", ") : lead.interes }].map((f) => f.val && (
                      <div key={f.label} style={{ background: "#0a0a0f", borderRadius: 10, padding: "10px 14px" }}>
                        <div style={{ color: "#555", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{f.label}</div>
                        <div style={{ color: "#ccc", fontSize: 14 }}>{f.val}</div>
                      </div>
                    ))}
                  </div>
                  {lead.comentarios && <div style={{ marginTop: 12, background: "#0a0a0f", borderRadius: 10, padding: "10px 14px" }}><div style={{ color: "#555", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Comentarios</div><div style={{ color: "#ccc", fontSize: 14 }}>{lead.comentarios}</div></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (done) return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 440 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🙌</div>
        <div style={{ color: "#c9a96e", fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>¡Listo!</div>
        <div style={{ color: "#fff", fontSize: 28, fontWeight: 700, lineHeight: 1.3, marginBottom: 16 }}>Recibí tu información, {data.nombre?.split(" ")[0]}</div>
        <div style={{ color: "#666", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>Me pongo en contacto contigo muy pronto por WhatsApp para ayudarte a encontrar la mejor oportunidad.</div>
        <button onClick={() => { setDone(false); setStep(0); setData({}); setInputVal(""); setMultiVal([]); }} style={{ background: "transparent", border: "1px solid #333", color: "#666", borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontSize: 14 }}>Enviar otro lead</button>
        <div style={{ marginTop: 16 }}><button onClick={() => setView("admin")} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 12 }}>Panel admin</button></div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", flexDirection: "column", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#c9a96e", fontSize: 13, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>Armando Said</div>
        <button onClick={() => setView("admin")} style={{ background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 12 }}>···</button>
      </div>
      <div style={{ height: 2, background: "#111" }}>
        <div style={{ height: "100%", background: "linear-gradient(90deg, #c9a96e, #e8c98a)", width: `${progress}%`, transition: "width 0.4s ease", borderRadius: 2 }} />
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
        <div style={{ maxWidth: 520, width: "100%", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : animDir === "forward" ? "translateY(16px)" : "translateY(-16px)", transition: "opacity 0.2s ease, transform 0.2s ease" }}>
          <div style={{ color: "#444", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>{step + 1} / {STEPS.length}</div>
          <div style={{ color: "#fff", fontSize: 26, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>{current.question}</div>
          <div style={{ color: "#555", fontSize: 15, marginBottom: 32 }}>{current.subtitle}</div>
          <div style={{ animation: shake ? "shake 0.4s ease" : "none" }}>
            {["text","tel","email"].includes(current.type) && <input autoFocus type={current.type} placeholder={current.placeholder} value={inputVal} onChange={(e) => setInputVal(e.target.value)} onKeyDown={handleKeyDown} style={inputStyle} />}
            {current.type === "textarea" && <textarea autoFocus placeholder={current.placeholder} value={inputVal} onChange={(e) => setInputVal(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />}
            {current.type === "single" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {current.options.map((opt) => (
                  <button key={opt.value} onClick={() => handleSingle(opt.value)} style={{ background: data[current.key] === opt.value ? "rgba(201,169,110,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${data[current.key] === opt.value ? "#c9a96e" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, color: data[current.key] === opt.value ? "#c9a96e" : "#aaa", padding: "14px 18px", textAlign: "left", fontSize: 15, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit", fontWeight: data[current.key] === opt.value ? 600 : 400 }}>{opt.label}</button>
                ))}
              </div>
            )}
            {current.type === "multi" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {current.options.map((opt) => { const sel = multiVal.includes(opt.value); return (
                  <button key={opt.value} onClick={() => handleMulti(opt.value)} style={{ background: sel ? "rgba(201,169,110,0.12)" : "rgba(255,255,255,0.04)", border: `1px solid ${sel ? "#c9a96e" : "rgba(255,255,255,0.08)"}`, borderRadius: 12, color: sel ? "#c9a96e" : "#aaa", padding: "14px 18px", textAlign: "left", fontSize: 15, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit", fontWeight: sel ? 600 : 400, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 18, height: 18, borderRadius: 4, border: `1.5px solid ${sel ? "#c9a96e" : "#444"}`, background: sel ? "#c9a96e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{sel && <span style={{ color: "#0a0a0f", fontSize: 12, fontWeight: 900 }}>✓</span>}</span>
                    {opt.label}
                  </button>
                );})}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 28, alignItems: "center" }}>
            {step > 0 && <button onClick={handleBack} style={{ background: "transparent", border: "1px solid #222", color: "#555", borderRadius: 10, padding: "12px 20px", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>←</button>}
            <button onClick={handleNext} style={{ flex: 1, background: "linear-gradient(135deg, #c9a96e, #e8c98a)", color: "#0a0a0f", border: "none", borderRadius: 12, padding: "14px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.02em" }}>
              {step === STEPS.length - 1 ? "Enviar →" : current.optional ? "Continuar →" : "Siguiente →"}
            </button>
          </div>
          {current.optional && <div style={{ textAlign: "center", marginTop: 12 }}><button onClick={handleNext} style={{ background: "none", border: "none", color: "#444", fontSize: 13, cursor: "pointer" }}>Omitir esta pregunta</button></div>}
        </div>
      </div>
      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} } input::placeholder,textarea::placeholder{color:#333} input:focus,textarea:focus{border-color:#c9a96e!important} button:hover{opacity:0.9}`}</style>
    </div>
  );
}
