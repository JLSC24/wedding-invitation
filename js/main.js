            // Conexión a Supabase
            const SUPABASE_URL = "https://eqpmhepvjclbvdbzjuit.supabase.co";
            const SUPABASE_KEY =
                "sb_publishable_SwZlQ3Q6t83S9ZENY2GNeg_DtHXDILM";
            const supabase = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY,
            );

            // scroll reveal
            const revealEls = document.querySelectorAll(".reveal");
            const io = new IntersectionObserver(
                (entries) => {
                    entries.forEach((e) => {
                        if (e.isIntersecting) {
                            e.target.classList.add("in");
                            io.unobserve(e.target);
                        }
                    });
                },
                { threshold: 0.15 },
            );
            revealEls.forEach((el) => io.observe(el));

            // custom alert (estilos propios, no depende del alert() nativo del navegador)
            const customAlert = document.getElementById("customAlert");
            const customAlertText = document.getElementById("customAlertText");
            const customAlertOk = document.getElementById("customAlertOk");
            function showAlert(message) {
                customAlertText.textContent = message;
                customAlert.style.display = "flex";
            }
            function hideAlert() {
                customAlert.style.display = "none";
            }
            customAlertOk.addEventListener("click", hideAlert);

            // custom confirm (Cancelar / Confirmar), devuelve una promesa con true/false
            const customConfirm = document.getElementById("customConfirm");
            const customConfirmText =
                document.getElementById("customConfirmText");
            const customConfirmOk = document.getElementById("customConfirmOk");
            const customConfirmCancel = document.getElementById(
                "customConfirmCancel",
            );
            function showConfirm(message) {
                return new Promise((resolve) => {
                    customConfirmText.textContent = message;
                    customConfirm.style.display = "flex";
                    function cleanup(result) {
                        customConfirm.style.display = "none";
                        customConfirmOk.removeEventListener("click", onOk);
                        customConfirmCancel.removeEventListener(
                            "click",
                            onCancel,
                        );
                        resolve(result);
                    }
                    function onOk() {
                        cleanup(true);
                    }
                    function onCancel() {
                        cleanup(false);
                    }
                    customConfirmOk.addEventListener("click", onOk);
                    customConfirmCancel.addEventListener("click", onCancel);
                });
            }

            // attending radio toggle
            const options = document.querySelectorAll(".radio-option");
            const attendingGroup = document.getElementById("attendingGroup");
            options.forEach((opt) => {
                opt.addEventListener("click", () => {
                    options.forEach((o) => o.classList.remove("selected"));
                    opt.classList.add("selected");
                    opt.querySelector("input").checked = true;
                    attendingGroup.classList.remove("invalid");
                });
            });

            // RSVP: enviar confirmación
            const form = document.getElementById("rsvpForm");
            const nameField = document.getElementById("nameField");
            const nameInput = document.getElementById("name");
            const formMsg = document.getElementById("formMsg");
            const submitBtn = document.getElementById("submitBtn");
            const thankyou = document.getElementById("thankyou");
            const alreadySubmitted =
                document.getElementById("alreadySubmitted");
            const SUBMITTED_KEY = "wedding_rsvp_submitted";
            let isSubmitting = false;

            nameInput.addEventListener("input", () =>
                nameField.classList.remove("invalid"),
            );

            // al cargar, revisar si esta persona ya confirmó antes desde este dispositivo
            (function checkAlreadySubmitted() {
                try {
                    if (localStorage.getItem(SUBMITTED_KEY) === "true") {
                        form.style.display = "none";
                        alreadySubmitted.classList.add("show");
                    }
                } catch (e) {
                    /* no hay confirmación previa: se puede continuar normalmente */
                }
            })();

            submitBtn.addEventListener("click", async () => {
                if (isSubmitting) return;

                const nameValue = nameInput.value.trim();
                const attendingInput = form.querySelector(
                    'input[name="attending"]:checked',
                );
                let valid = true;

                nameField.classList.remove("invalid");
                attendingGroup.classList.remove("invalid");

                if (!nameValue) {
                    nameField.classList.add("invalid");
                    valid = false;
                }
                if (!attendingInput) {
                    attendingGroup.classList.add("invalid");
                    valid = false;
                }
                if (!valid) {
                    formMsg.textContent =
                        "Por favor completa los campos obligatorios.";
                    showAlert(
                        "Por favor completa los campos obligatorios antes de enviar: tu nombre y si asistirás.",
                    );
                    return;
                }

                isSubmitting = true;
                submitBtn.disabled = true;
                submitBtn.textContent = "Verificando...";
                formMsg.textContent = "";

                try {
                    // revisar si ya existe una confirmación con este mismo nombre
                    const { data: existing, error: checkError } =
                        await supabase
                            .from("rsvp")
                            .select("id")
                            .ilike("name", nameValue.trim());

                    if (checkError) throw checkError;

                    if (existing && existing.length > 0) {
                        showAlert(
                            "Ya confirmaste tu asistencia antes. ¡Agradecemos las ansias, pero tranquilo, todavía falta un poco para el gran día!",
                        );
                        submitBtn.disabled = false;
                        submitBtn.textContent = "Enviar confirmación";
                        isSubmitting = false;
                        return;
                    }

                    const entry = {
                        name: nameValue,
                        attending: attendingInput.value,
                        message: document
                            .getElementById("message")
                            .value.trim(),
                    };

                    submitBtn.textContent = "Enviando...";
                    const { error: insertError } = await supabase
                        .from("rsvp")
                        .insert(entry);
                    if (insertError) throw insertError;

                    try {
                        localStorage.setItem(SUBMITTED_KEY, "true");
                    } catch (e) {
                        /* si el navegador bloquea localStorage, seguimos igual */
                    }

                    form.style.display = "none";
                    thankyou.classList.add("show");

                    if (entry.attending === "si") {
                        showAlert(
                            "¡Qué alegría! Quedó confirmada tu asistencia.",
                        );
                    } else {
                        showAlert(
                            "Gracias por avisarnos. ¡Te vamos a extrañar!",
                        );
                    }
                } catch (err) {
                    formMsg.textContent =
                        "Hubo un problema al guardar tu confirmación. Intenta de nuevo.";
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Enviar confirmación";
                    isSubmitting = false;
                }
            });

            // ---------- admin panel ----------
            const ADMIN_PASSWORD = "novios2027"; // cámbiala por la que prefieras

            const adminToggle = document.getElementById("adminToggle");
            const adminSection = document.getElementById("adminSection");
            const adminGate = document.getElementById("adminGate");
            const adminPanel = document.getElementById("adminPanel");
            const adminPass = document.getElementById("adminPass");
            const adminEnter = document.getElementById("adminEnter");
            const adminError = document.getElementById("adminError");
            const adminRefresh = document.getElementById("adminRefresh");
            const adminExport = document.getElementById("adminExport");
            const adminSummary = document.getElementById("adminSummary");
            const adminTbody = document.getElementById("adminTbody");
            const adminEmpty = document.getElementById("adminEmpty");
            const adminTable = document.getElementById("adminTable");
            let currentEntries = [];

            adminToggle.addEventListener("click", () => {
                adminSection.classList.toggle("show");
                if (adminSection.classList.contains("show")) {
                    adminSection.scrollIntoView({ behavior: "smooth" });
                }
            });

            function tryEnter() {
                if (adminPass.value === ADMIN_PASSWORD) {
                    adminGate.style.display = "none";
                    adminPanel.classList.add("show");
                    loadRsvps();
                } else {
                    adminError.textContent = "Contraseña incorrecta.";
                }
            }
            adminEnter.addEventListener("click", tryEnter);
            adminPass.addEventListener("keydown", (e) => {
                if (e.key === "Enter") tryEnter();
            });

            async function loadRsvps() {
                adminSummary.innerHTML =
                    '<p style="opacity:0.6;">Cargando...</p>';
                adminTbody.innerHTML = "";
                adminEmpty.style.display = "none";

                try {
                    const { data: entries, error } = await supabase
                        .from("rsvp")
                        .select("*")
                        .order("submitted_at", { ascending: false });

                    if (error) throw error;

                    if (!entries || entries.length === 0) {
                        currentEntries = [];
                        adminSummary.innerHTML = "";
                        adminTable.style.display = "none";
                        adminEmpty.style.display = "block";
                        return;
                    }

                    currentEntries = entries;

                    const attendingCount = entries.filter(
                        (e) => e.attending === "si",
                    ).length;
                    const notAttendingCount = entries.filter(
                        (e) => e.attending === "no",
                    ).length;

                    adminSummary.innerHTML = `
        <div><span class="stat-num">${attendingCount}</span><span class="stat-label">Confirmados</span></div>
        <div><span class="stat-num">${notAttendingCount}</span><span class="stat-label">No asisten</span></div>
      `;

                    adminTable.style.display = "table";
                    entries.forEach((e) => {
                        const tr = document.createElement("tr");
                        const fecha = e.submitted_at
                            ? new Date(e.submitted_at).toLocaleDateString(
                                  "es-CO",
                                  {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                  },
                              )
                            : "—";
                        tr.innerHTML = `
          <td>${escapeHtml(e.name || "—")}</td>
          <td>${e.attending === "si" ? "Sí" : "No"}</td>
          <td>${escapeHtml(e.message || "—")}</td>
          <td>${fecha}</td>
          <td><button class="row-delete" data-key="${escapeHtml(e.id || "")}">Eliminar</button></td>
        `;
                        adminTbody.appendChild(tr);
                    });

                    adminTbody
                        .querySelectorAll(".row-delete")
                        .forEach((btn) => {
                            btn.addEventListener("click", async () => {
                                const id = btn.dataset.key;
                                const ok = await showConfirm(
                                    "¿Eliminar esta confirmación? Esta acción no se puede deshacer.",
                                );
                                if (!ok) return;
                                try {
                                    const { error: delError } = await supabase
                                        .from("rsvp")
                                        .delete()
                                        .eq("id", id);
                                    if (delError) throw delError;
                                    loadRsvps();
                                } catch (err) {
                                    showAlert(
                                        "No se pudo eliminar la confirmación. Intenta de nuevo.",
                                    );
                                }
                            });
                        });
                } catch (err) {
                    adminSummary.innerHTML =
                        '<p style="color:var(--rust);">No se pudo cargar la información. Intenta de nuevo.</p>';
                }
            }

            function escapeHtml(str) {
                const div = document.createElement("div");
                div.textContent = str;
                return div.innerHTML;
            }

            adminRefresh.addEventListener("click", loadRsvps);

            adminExport.addEventListener("click", () => {
                if (!currentEntries.length) {
                    showAlert("Todavía no hay confirmaciones para descargar.");
                    return;
                }
                try {
                    const rows = currentEntries.map((e) => ({
                        Nombre: e.name || "",
                        Asiste: e.attending === "si" ? "Sí" : "No",
                        Mensaje: e.message || "",
                        Fecha: e.submitted_at
                            ? new Date(e.submitted_at).toLocaleString(
                                  "es-CO",
                                  {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                  },
                              )
                            : "",
                    }));
                    const ws = XLSX.utils.json_to_sheet(rows);
                    ws["!cols"] = [
                        { wch: 26 },
                        { wch: 10 },
                        { wch: 45 },
                        { wch: 20 },
                    ];
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Invitados");
                    XLSX.writeFile(wb, "invitados-luis-y-fernanda.xlsx");
                } catch (err) {
                    showAlert(
                        "No se pudo generar el archivo de Excel. Intenta de nuevo.",
                    );
                }
            });

            const adminReset = document.getElementById("adminReset");
            adminReset.addEventListener("click", async () => {
                const ok = await showConfirm(
                    "¿Seguro que quieres reiniciar la lista de invitados? Se eliminarán TODAS las confirmaciones y no se puede deshacer.",
                );
                if (!ok) return;
                try {
                    const { error: resetError } = await supabase
                        .from("rsvp")
                        .delete()
                        .gte("submitted_at", "1970-01-01");
                    if (resetError) throw resetError;
                    await loadRsvps();
                    showAlert(
                        'Se reiniciaron todas las confirmaciones. Ojo: si algún invitado ya había confirmado desde su celular, ese dispositivo seguirá mostrándole "ya confirmaste" hasta que borre los datos del sitio en su navegador.',
                    );
                } catch (err) {
                    showAlert(
                        "No se pudo reiniciar la lista. Intenta de nuevo.",
                    );
                }
            });
