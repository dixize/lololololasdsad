document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 1. КАСТОМНЫЙ КУРСОР
    // ==========================================
    const dot = document.querySelector(".custom-cursor-dot");
    if (dot && window.innerWidth > 768) {
        document.addEventListener("mousemove", (e) => {
            dot.style.opacity = "1";
            dot.style.left = `${e.clientX}px`;
            dot.style.top = `${e.clientY}px`;
        });
        document.addEventListener("mouseleave", () => {
            dot.style.opacity = "0";
        });
    }

    // ==========================================
    // 2. АНИМАЦИЯ ПЛАВНОГО ПОЯВЛЕНИЯ (SCROLL REVEAL)
    // ==========================================
    const revealTargets = document.querySelectorAll(".scroll-reveal");
    revealTargets.forEach(target => target.classList.add("js-prep"));

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("scroll-reveal-active");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05 });
    
    revealTargets.forEach(target => revealObserver.observe(target));

    // ==========================================
    // 3. ФИЛЬТРАЦИЯ КАРТОЧЕК ПОРТФОЛИО
    // ==========================================
    const filterButtons = document.querySelectorAll(".filter-btn");
    const portfolioCards = document.querySelectorAll(".portfolio-item-card");

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const filterValue = button.getAttribute("data-filter");
            portfolioCards.forEach(card => {
                const cat = card.getAttribute("data-category");
                if (filterValue === "all" || cat === filterValue) {
                    card.classList.remove("hide");
                } else {
                    card.classList.add("hide");
                }
            });
        });
    });

    // ==========================================
    // 4. ЖИВОЙ КАЛЬКУЛЯТОР СТОИМОСТИ
    // ==========================================
    const tiles = document.querySelectorAll(".selector-tile");
    const checkTg = document.getElementById("addon-tg");
    const checkAnim = document.getElementById("addon-anim");
    const priceDisplay = document.getElementById("live-price-display");
    const tgText = document.getElementById("tg-addon-price-text");
    const animText = document.getElementById("anim-addon-price-text");

    let currentType = "landing"; 
    let currentTypeName = "Лендинг / Промо";

    tiles.forEach(tile => {
        tile.addEventListener("click", () => {
            tiles.forEach(t => t.classList.remove("active"));
            tile.classList.add("active");
            
            currentType = tile.getAttribute("data-type");
            currentTypeName = tile.querySelector("h4").textContent;
            
            if (currentType !== "store") {
                if (checkTg && checkTg.disabled) checkTg.checked = false;
                if (checkAnim && checkAnim.disabled) checkAnim.checked = false;
            }
            calculateTotal();
        });
    });

    if (checkTg) checkTg.addEventListener("change", calculateTotal);
    if (checkAnim) checkAnim.addEventListener("change", calculateTotal);

    function calculateTotal() {
        let basePrice = 750;
        
        if (currentType === "landing") {
            basePrice = 750;
            if (tgText) tgText.textContent = "+200 ₽";
            if (animText) animText.textContent = "+150 ₽";
            if (checkTg) checkTg.disabled = false;
            if (checkAnim) checkAnim.disabled = false;
            if (checkTg && checkTg.checked) basePrice += 200;
            if (checkAnim && checkAnim.checked) basePrice += 150;

        } else if (currentType === "store") {
            basePrice = 1250;
            if (tgText) tgText.textContent = "Включено";
            if (animText) animText.textContent = "Включено";
            if (checkTg) { checkTg.checked = true; checkTg.disabled = true; }
            if (checkAnim) { checkAnim.checked = true; checkAnim.disabled = true; }

        } else if (currentType === "service") {
            basePrice = 800;
            if (tgText) tgText.textContent = "+200 ₽";
            if (animText) animText.textContent = "+100 ₽";
            if (checkTg) checkTg.disabled = false;
            if (checkAnim) checkAnim.disabled = false;
            if (checkTg && checkTg.checked) basePrice += 200;
            if (checkAnim && checkAnim.checked) basePrice += 100;
        }
        
        if (priceDisplay) {
            priceDisplay.textContent = basePrice;
            const counterParent = priceDisplay.parentElement;
            if (counterParent) {
                counterParent.classList.remove("pulse-price");
                void counterParent.offsetWidth; 
                counterParent.classList.add("pulse-price");
            }
        }
    }

    calculateTotal();

    // ==========================================
    // 5. ОТПРАВКА ДАННЫХ В TELEGRAM API
    // ==========================================
    const feedbackForm = document.getElementById("portfolio-interactive-form");
    const successUI = document.getElementById("form-success-state");
    const submitButton = document.getElementById("form-submit-trigger");
    const spinner = submitButton ? submitButton.querySelector(".spinner") : null;
    const btnText = submitButton ? submitButton.querySelector(".btn-text") : null;

    const setupInputReset = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", () => {
                el.classList.remove("invalid");
                const errorLabel = el.parentElement ? el.parentElement.querySelector(".custom-error-label") : null;
                if (errorLabel) errorLabel.style.display = "none";
            });
        }
    };
    setupInputReset("client_name");
    setupInputReset("client_contact");

    if (feedbackForm) {
        feedbackForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nameInput = document.getElementById("client_name");
            const contactInput = document.getElementById("client_contact");
            const commentInput = document.getElementById("client_task");

            let hasErrors = false;

            if (nameInput) {
                const value = nameInput.value.trim();
                const errorLabel = nameInput.parentElement ? nameInput.parentElement.querySelector(".custom-error-label") : null;
                if (value === "") {
                    hasErrors = true;
                    nameInput.classList.add("invalid");
                    if (errorLabel) {
                        errorLabel.textContent = "Пожалуйста, введите ваше имя";
                        errorLabel.style.display = "block";
                    }
                }
            }

            if (contactInput) {
                const value = contactInput.value.trim();
                const errorLabel = contactInput.parentElement ? contactInput.parentElement.querySelector(".custom-error-label") : null;
                if (value === "") {
                    hasErrors = true;
                    contactInput.classList.add("invalid");
                    if (errorLabel) {
                        errorLabel.textContent = "Укажите способ связи";
                        errorLabel.style.display = "block";
                    }
                }
            }

            if (hasErrors) return;

            if (submitButton) {
                if (btnText) btnText.textContent = "Отправка...";
                if (spinner) spinner.classList.remove("hidden");
                submitButton.style.pointerEvents = "none";
            }

            const clientNameVal = nameInput ? nameInput.value.trim() : "Не указано";
            const clientContactVal = contactInput ? contactInput.value.trim() : "Не указано";
            const clientCommentVal = commentInput ? commentInput.value.trim() : "Нет";
            const totalPriceVal = priceDisplay ? priceDisplay.textContent : "750";

            let options = [];
            if (currentType === "store") {
                options.push("Telegram API (Вкл)", "UI-Анимации (Вкл)");
            } else {
                if (checkTg && checkTg.checked) options.push("Telegram API");
                if (checkAnim && checkAnim.checked) options.push("UI-Анимации");
            }
            const optionsText = options.length > 0 ? options.join(", ") : "Нет";

            const tokenCodes = [
                56, 57, 53, 56, 54, 51, 51, 51, 57, 52, 58, 65, 65, 70, 99, 118, 49, 101, 71, 
                113, 115, 76, 117, 52, 48, 104, 108, 55, 88, 101, 103, 84, 113, 103, 66, 87, 
                87, 115, 122, 108, 112, 108, 76, 115, 68, 85
            ];
            
            const BOT_TOKEN = String.fromCharCode(...tokenCodes);
            const CHAT_ID = "5415190532"; 

            const textMessage = `
📝 НОВОЕ ТЗ НА САЙТ
──────────────────
👤 Имя: ${clientNameVal}
📞 Контакт: ${clientContactVal}

🖥️ Архитектура: ${currentTypeName}
⚙️ Модули: ${optionsText}
💬 Пожелания: ${clientCommentVal}

💵 Расчетная стоимость: ${totalPriceVal} ₽
──────────────────
            `.trim();

            try {
                const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        text: textMessage
                    })
                });

                if (response.ok) {
                    feedbackForm.style.opacity = "0";
                    setTimeout(() => {
                        feedbackForm.classList.add("hidden");
                        if (successUI) {
                            successUI.classList.remove("hidden");
                            successUI.style.opacity = "0";
                            void successUI.offsetWidth;
                            successUI.style.transition = "opacity 0.3s ease-in-out";
                            successUI.style.opacity = "1";
                        }
                    }, 250);
                } else {
                    throw new Error(`Ошибка: ${response.status}`);
                }

            } catch (error) {
                console.error(error);
                if (submitButton) {
                    if (btnText) btnText.textContent = "Ошибка. Повторить?";
                    if (spinner) spinner.classList.add("hidden");
                    submitButton.style.pointerEvents = "auto";
                }
            }
        });
    }
});
