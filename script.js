"use strict";

// Elements Collection
const elements = {
    hamburger: document.getElementById("hamburger"),
    navMenu: document.getElementById("navMenu"),
    progressBar: document.getElementById("progressBar"),
    scrollTop: document.getElementById("scrollTop"),
    themeSelect: document.getElementById("themeSelect"),
    langButtons: document.querySelectorAll(".lang-btn"),
    typedText: document.getElementById("typedText"),
    chatInput: document.getElementById("chatInput"),
    chatSubmit: document.getElementById("chatSubmit"),
    chatResponse: document.getElementById("chatResponse"),
    faqQuestions: document.querySelectorAll(".faq-question"),
    filterButtons: document.querySelectorAll(".filter-btn"),
    exampleCards: document.querySelectorAll("#exampleCards .card"),
    contactForm: document.getElementById("contactForm"),
    newsletterForm: document.getElementById("newsletterForm"),
    xlsxUpload: document.getElementById("xlsxUpload"),
    xlsxLoader: document.getElementById("xlsxLoader"),
    showcaseTable: document.getElementById("showcaseTable"),
    dataChart: document.getElementById("dataChart"),
    statsNumbers: document.querySelectorAll(".stats-number"),
    statsSection: document.getElementById("stats"),
    pwaInstall: null,
    searchInput: document.querySelector(".search-bar input"),
    searchButton: document.querySelector(".search-bar button"),
    signupModal: document.getElementById("signupModal"),
    signupForm: document.getElementById("signupForm"),
    aiCapabilitiesBtn: document.querySelector(".btn[href='#capabilities']")
};

// Configuration
const CONFIG = {
    TYPED_CONFIG: {
        strings: ["Искры Гениальности", "Будущее ИИ", "Ваш Интеллектуальный Партнер"],
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        cursorChar: "|"
    },
    DEBOUNCE_DELAY: 100,
    SCROLL_THRESHOLD: 300,
    MOBILE_BREAKPOINT: 768,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    LOCALE: "ru-RU",
    ANALYTICS_ID: "G-XXXXXXXXXX",
    STATS_ANIMATION_DURATION: 2000,
    CHART_TYPES: ["bar", "line", "pie"],
    CHART_TYPE_SELECTOR_ID: "chartTypeSelector",
    API_ENDPOINT: "https://x.ai/api"
};

// Utility Functions
const utils = {
    debounce: (func, delay) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), delay);
        };
    },

    sanitizeInput: (input) => {
        const div = document.createElement("div");
        div.textContent = input;
        return div.innerHTML;
    },

    showNotification: (message, type = "info") => {
        const notification = document.createElement("div");
        notification.className = `notification notification-${type}`;
        notification.setAttribute("role", "alert");
        notification.setAttribute("aria-live", "assertive");
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    },

    validateEmail: (email) => {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    },

    formatNumber: (number) => {
        return new Intl.NumberFormat(CONFIG.LOCALE).format(number);
    },

    trackEvent: (category, action, label) => {
        if (window.gtag && localStorage.getItem("analyticsConsent") === "true") {
            gtag("event", action, {
                event_category: category,
                event_label: label
            });
        }
    },

    measurePerformance: (markName) => {
        performance.mark(markName);
        performance.measure(`Time to ${markName}`, markName);
        const measure = performance.getEntriesByName(`Time to ${markName}`)[0];
        utils.trackEvent("Performance", markName, `Duration: ${measure.duration}ms`);
    },

    validateXLSXData: (data) => {
        if (!Array.isArray(data) || data.length === 0) return false;
        return data.every(row => Array.isArray(row) && row.length > 0);
    },

    trapFocus: (modal) => {
        const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        modal.addEventListener("keydown", (e) => {
            if (e.key === "Tab") {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });

        firstElement.focus();
    }
};

// Main Initialization
document.addEventListener("DOMContentLoaded", () => {
    // Error Handling Wrapper
    const safeExecute = (fn, name) => {
        try {
            fn();
            utils.measurePerformance(name);
        } catch (error) {
            console.error(`Error in ${name}:`, error);
            utils.showNotification(`Ошибка при ${name.toLowerCase()}: ${error.message}`, "error");
        }
    };

    // Hamburger Menu
    const initHamburger = () => {
        if (!elements.hamburger || !elements.navMenu) {
            throw new Error("Hamburger or navMenu not found");
        }

        elements.hamburger.addEventListener("click", () => {
            const isActive = elements.hamburger.classList.toggle("active");
            elements.navMenu.classList.toggle("active");
            elements.hamburger.setAttribute("aria-expanded", isActive);
            utils.trackEvent("Navigation", "Toggle Menu", isActive ? "Open" : "Close");
        });

        elements.hamburger.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                elements.hamburger.click();
            }
        });

        document.addEventListener("click", (e) => {
            if (!elements.navMenu.contains(e.target) && !elements.hamburger.contains(e.target)) {
                elements.navMenu.classList.remove("active");
                elements.hamburger.classList.remove("active");
                elements.hamburger.setAttribute("aria-expanded", "false");
            }
        });
    };

    // Scroll Progress and Top Button
    const initScroll = () => {
        if (!elements.progressBar || !elements.scrollTop) {
            throw new Error("Progress bar or scroll top element not found");
        }

        elements.scrollTop.classList.remove("active");
        elements.scrollTop.setAttribute("aria-hidden", "true");

        const updateScroll = utils.debounce(() => {
            const scrollTopPos = window.scrollY || window.pageYOffset;
            const docHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.offsetHeight,
                document.body.clientHeight,
                document.documentElement.clientHeight
            ) - window.innerHeight;

            if (docHeight <= 0) {
                console.warn("Document height is too small for scroll calculations");
                return;
            }

            const scrollPercent = Math.min((scrollTopPos / docHeight) * 100, 100);
            elements.progressBar.style.width = `${scrollPercent}%`;
            const isVisible = scrollTopPos > CONFIG.SCROLL_THRESHOLD;
            elements.scrollTop.classList.toggle("active", isVisible);
            elements.scrollTop.setAttribute("aria-hidden", !isVisible);
            utils.trackEvent("Navigation", "Scroll", `Position: ${scrollTopPos}`);
        }, CONFIG.DEBOUNCE_DELAY);

        window.addEventListener("scroll", updateScroll, { passive: true });
        updateScroll();

        elements.scrollTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
            utils.trackEvent("Navigation", "Scroll to Top", "Clicked");
        });

        elements.scrollTop.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                elements.scrollTop.click();
            }
        });
    };

    // Smooth Scrolling for Anchor Links
    const initSmoothScroll = () => {
        document.querySelectorAll('.nav-menu a[href^="#"]').forEach(anchor => {
            anchor.addEventListener("click", (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute("href").substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: "smooth" });
                    utils.trackEvent("Navigation", "Anchor Link", targetId);
                }
            });
        });
    };

    // Theme Switcher
    const initTheme = () => {
        if (!elements.themeSelect) return;

        elements.themeSelect.addEventListener("change", (e) => {
            document.body.className = "";
            document.body.classList.add(e.target.value);
            localStorage.setItem("theme", e.target.value);
            utils.trackEvent("Preferences", "Change Theme", e.target.value);
        });

        const savedTheme = localStorage.getItem("theme") || "light";
        document.body.className = "";
        document.body.classList.add(savedTheme);
        elements.themeSelect.value = savedTheme;
    };

    // Language Switcher
    const initLanguage = () => {
        elements.langButtons.forEach((btn) => {
            btn.setAttribute("role", "button");
            btn.addEventListener("click", () => {
                elements.langButtons.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                localStorage.setItem("language", btn.dataset.lang);
                CONFIG.LOCALE = btn.dataset.lang === "ru" ? "ru-RU" : "en-US";
                utils.showNotification(`Язык изменен на: ${btn.dataset.lang === "ru" ? "Русский" : "English"}`);
                utils.trackEvent("Preferences", "Change Language", btn.dataset.lang);
            });

            btn.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    btn.click();
                }
            });
        });

        const savedLang = localStorage.getItem("language") || "ru";
        elements.langButtons.forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.lang === savedLang);
            if (btn.dataset.lang === savedLang) CONFIG.LOCALE = savedLang === "ru" ? "ru-RU" : "en-US";
        });
    };

    // Typed.js Animation
    const initTyped = () => {
        if (!elements.typedText || typeof Typed !== "function") {
            console.warn("Typed.js or typedText element not found");
            return;
        }
        new Typed(elements.typedText, CONFIG.TYPED_CONFIG);
    };

    // Chatbot with API Placeholder
    const initChatbot = () => {
        if (!elements.chatInput || !elements.chatSubmit || !elements.chatResponse) return;

        const simulateGrokResponse = (query) => {
            const responses = {
                "привет": "Привет! Я KNOWER LIFE, твой интеллектуальный помощник. Чем могу помочь?",
                "как дела": "Отлично, спасибо! А у тебя как дела?",
                "что ты умеешь": "Я могу отвечать на вопросы, анализировать данные, писать код, создавать контент и многое другое. Задай мне задачу!",
                "погода": "Я не имею доступа к данным о погоде в реальном времени, но могу помочь составить запрос для API погоды. Хочешь пример?",
                "код": "Я могу помочь с программированием! Например, хочешь пример кода на JavaScript или Python?",
                default: `Интересный вопрос: "${query}"! Я могу предложить помощь с анализом данных, написанием текстов или программированием. Что выберешь?`
            };
            return responses[query.toLowerCase()] || responses.default;
        };

        const fetchGrokResponse = async (query) => {
            try {
                // Placeholder for real API call
                utils.showNotification("API integration not implemented. Using simulated response.", "info");
                return simulateGrokResponse(query);
                // Example API call (uncomment when implemented):
                /*
                const response = await fetch(CONFIG.API_ENDPOINT, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ query })
                });
                const data = await response.json();
                return data.response || simulateGrokResponse(query);
                */
            } catch (error) {
                console.error("API error:", error);
                return simulateGrokResponse(query);
            }
        };

        elements.chatSubmit.addEventListener("click", async () => {
            elements.chatSubmit.disabled = true;
            elements.chatSubmit.classList.add("loading");
            const query = utils.sanitizeInput(elements.chatInput.value.trim());
            if (!query) {
                utils.showNotification("Пожалуйста, введите запрос", "error");
                elements.chatSubmit.disabled = false;
                elements.chatSubmit.classList.remove("loading");
                return;
            }

            const response = await fetchGrokResponse(query);
            elements.chatResponse.textContent = response;
            elements.chatResponse.style.display = "block";
            elements.chatResponse.setAttribute("aria-live", "polite");
            elements.chatInput.value = "";
            localStorage.setItem("onboardingChat", "true");
            updateOnboarding();
            utils.trackEvent("Chatbot", "Query", query);
            elements.chatSubmit.disabled = false;
            elements.chatSubmit.classList.remove("loading");
        });

        elements.chatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !elements.chatSubmit.disabled) {
                e.preventDefault();
                elements.chatSubmit.click();
            }
        });
    };

    // FAQ Toggle
    const initFAQ = () => {
        elements.faqQuestions.forEach((question) => {
            question.setAttribute("role", "button");
            question.setAttribute("aria-expanded", "false");
            question.addEventListener("click", () => {
                const answer = question.nextElementSibling;
                if (answer) {
                    answer.classList.toggle("active");
                    question.setAttribute("aria-expanded", answer.classList.contains("active"));
                    const icon = question.querySelector("i");
                    icon.classList.toggle("fa-chevron-down");
                    icon.classList.toggle("fa-chevron-up");
                    utils.trackEvent("FAQ", "Toggle", question.textContent.trim());
                }
            });

            question.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    question.click();
                }
            });
        });
    };

    // Example Filters
    const initFilters = () => {
        elements.filterButtons.forEach((btn) => {
            btn.setAttribute("role", "button");
            btn.addEventListener("click", () => {
                elements.filterButtons.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                const filter = btn.dataset.filter.toLowerCase();
                elements.exampleCards.forEach((card) => {
                    const category = card.dataset.category?.toLowerCase();
                    card.style.display = filter === "all" || category?.includes(filter) ? "block" : "none";
                    card.setAttribute("aria-hidden", card.style.display === "none");
                });
                utils.trackEvent("Filters", "Apply", filter);
            });

            btn.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
    };

    // Form Submissions
    const initForms = () => {
        if (elements.contactForm) {
            elements.contactForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const email = elements.contactForm.querySelector("#email")?.value;
                const button = elements.contactForm.querySelector("button[type='submit']");
                button.disabled = true;
                button.classList.add("loading");

                if (!utils.validateEmail(email)) {
                    utils.showNotification("Пожалуйста, введите корректный email", "error");
                    button.disabled = false;
                    button.classList.remove("loading");
                    return;
                }

                setTimeout(() => {
                    utils.showNotification("Форма отправлена!");
                    elements.contactForm.reset();
                    localStorage.setItem("onboardingContact", "true");
                    updateOnboarding();
                    utils.trackEvent("Form", "Submit", "Contact");
                    button.disabled = false;
                    button.classList.remove("loading");
                }, 500);
            });
        }

        if (elements.newsletterForm) {
            elements.newsletterForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const email = elements.newsletterForm.querySelector("input[type='email']")?.value;
                const button = elements.newsletterForm.querySelector("button[type='submit']");
                button.disabled = true;
                button.classList.add("loading");

                if (!utils.validateEmail(email)) {
                    utils.showNotification("Пожалуйста, введите корректный email", "error");
                    button.disabled = false;
                    button.classList.remove("loading");
                    return;
                }

                setTimeout(() => {
                    utils.showNotification("Вы подписались на рассылку!");
                    elements.newsletterForm.reset();
                    utils.trackEvent("Form", "Submit", "Newsletter");
                    button.disabled = false;
                    button.classList.remove("loading");
                }, 500);
            });
        }

        if (elements.signupForm) {
            elements.signupForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const email = elements.signupForm.querySelector("#signupEmail")?.value;
                const password = elements.signupForm.querySelector("#signupPassword")?.value;
                const button = elements.signupForm.querySelector("button[type='submit']");
                button.disabled = true;
                button.classList.add("loading");

                if (!utils.validateEmail(email)) {
                    utils.showNotification("Пожалуйста, введите корректный email", "error");
                    button.disabled = false;
                    button.classList.remove("loading");
                    return;
                }

                if (password.length < 6) {
                    utils.showNotification("Пароль должен быть не менее 6 символов", "error");
                    button.disabled = false;
                    button.classList.remove("loading");
                    return;
                }

                setTimeout(() => {
                    utils.showNotification("Регистрация успешна!");
                    elements.signupModal.classList.remove("active");
                    elements.signupModal.setAttribute("aria-hidden", "true");
                    elements.signupForm.reset();
                    utils.trackEvent("Form", "Submit", "Signup");
                    button.disabled = false;
                    button.classList.remove("loading");
                }, 500);
            });
        }
    };

    // XLSX Processing with Chart Type Selector
    const initXLSX = () => {
        if (!elements.xlsxUpload || !elements.xlsxLoader || !elements.showcaseTable || !elements.dataChart) return;

        const chartSelector = document.createElement("select");
        chartSelector.id = CONFIG.CHART_TYPE_SELECTOR_ID;
        chartSelector.setAttribute("aria-label", "Выберите тип диаграммы");
        CONFIG.CHART_TYPES.forEach((type) => {
            const option = document.createElement("option");
            option.value = type;
            option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
            chartSelector.appendChild(option);
        });
        elements.xlsxUpload.parentNode.insertBefore(chartSelector, elements.xlsxUpload.nextSibling);

        elements.xlsxUpload.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > CONFIG.MAX_FILE_SIZE) {
                utils.showNotification("Файл слишком большой. Максимум 5MB.", "error");
                return;
            }

            elements.xlsxLoader.style.display = "block";
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    if (typeof XLSX === "undefined") throw new Error("XLSX library not loaded");

                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const firstSheet = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheet];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

                    if (!utils.validateXLSXData(jsonData)) {
                        throw new Error("Файл пустой или содержит некорректные данные");
                    }

                    elements.showcaseTable.innerHTML = "";
                    const table = document.createElement("table");
                    table.className = "showcase-table";
                    table.setAttribute("aria-label", "Данные из загруженного файла");
                    const caption = document.createElement("caption");
                    caption.textContent = "Таблица данных";
                    table.appendChild(caption);

                    const thead = document.createElement("thead");
                    const tbody = document.createElement("tbody");
                    jsonData.forEach((row, index) => {
                        const tr = document.createElement("tr");
                        row.forEach((cell, cellIndex) => {
                            const cellTag = index === 0 ? "th" : "td";
                            const td = document.createElement(cellTag);
                            if (index === 0) td.setAttribute("scope", "col");
                            td.textContent = utils.sanitizeInput(cell || "");
                            tr.appendChild(td);
                        });
                        (index === 0 ? thead : tbody).appendChild(tr);
                    });
                    table.appendChild(thead);
                    table.appendChild(tbody);
                    elements.showcaseTable.appendChild(table);

                    if (window.chartInstance) window.chartInstance.destroy();
                    const headers = jsonData[0];
                    const dataRows = jsonData.slice(1).filter(row => row.some(cell => cell != null));
                    const labels = dataRows.map((_, i) => `Row ${i + 1}`);
                    const datasets = headers.slice(1).map((header, i) => ({
                        label: utils.sanitizeInput(header || `Column ${i + 1}`),
                        data: dataRows.map(row => Number(row[i + 1]) || 0),
                        backgroundColor: `rgba(${75 + i * 50}, ${192 - i * 20}, ${192 - i * 30}, 0.5)`,
                        borderColor: `rgba(${75 + i * 50}, ${192 - i * 20}, ${192 - i * 30}, 1)`,
                        borderWidth: 1
                    }));

                    window.chartInstance = new Chart(elements.dataChart.getContext("2d"), {
                        type: chartSelector.value,
                        data: { labels, datasets },
                        options: {
                            responsive: true,
                            scales: chartSelector.value !== "pie" ? { y: { beginAtZero: true } } : {},
                            plugins: {
                                legend: { position: "top" },
                                title: { display: true, text: "Данные из XLSX" }
                            }
                        }
                    });

                    chartSelector.addEventListener("change", () => {
                        if (window.chartInstance) {
                            window.chartInstance.destroy();
                            window.chartInstance = new Chart(elements.dataChart.getContext("2d"), {
                                type: chartSelector.value,
                                data: { labels, datasets },
                                options: {
                                    responsive: true,
                                    scales: chartSelector.value !== "pie" ? { y: { beginAtZero: true } } : {},
                                    plugins: {
                                        legend: { position: "top" },
                                        title: { display: true, text: "Данные из XLSX" }
                                    }
                                }
                            });
                            utils.trackEvent("Chart", "Change Type", chartSelector.value);
                        }
                    });

                    elements.xlsxLoader.style.display = "none";
                    utils.showNotification("Файл успешно обработан!");
                    localStorage.setItem("onboardingXlsx", "true");
                    updateOnboarding();
                    utils.trackEvent("File", "Upload", file.name);
                } catch (error) {
                    console.error("Error processing XLSX:", error);
                    elements.xlsxLoader.style.display = "none";
                    utils.showNotification("Ошибка при обработке файла: " + error.message, "error");
                }
            };

            reader.readAsArrayBuffer(file);
        });
    };

    // Stats Animation
    const initStats = () => {
        if (!elements.statsSection || !elements.statsNumbers.length) {
            throw new Error("Stats section or stats numbers not found");
        }

        const statsElements = [
            { id: "statsQueries", target: 10000 },
            { id: "statsFiles", target: 5000 },
            { id: "statsUsers", target: 2000 }
        ];

        statsElements.forEach(({ id, target }) => {
            const element = document.getElementById(id);
            if (element) {
                element.setAttribute("data-target", target);
                element.textContent = "0";
            } else {
                console.warn(`Stats element ${id} not found`);
            }
        });

        const animateStats = () => {
            elements.statsNumbers.forEach((stat) => {
                const target = parseInt(stat.dataset.target) || 0;
                if (target === 0) {
                    console.warn(`No valid data-target for stat element: ${stat.id}`);
                    return;
                }

                let start = 0;
                const duration = CONFIG.STATS_ANIMATION_DURATION;
                const startTime = performance.now();

                const updateCount = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const value = Math.round(start + (target - start) * progress);
                    stat.textContent = utils.formatNumber(value);

                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                    } else {
                        stat.textContent = utils.formatNumber(target);
                    }
                };

                requestAnimationFrame(updateCount);
            });
            utils.trackEvent("Stats", "View", "Animated");
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    animateStats();
                    observer.disconnect();
                }
            },
            { threshold: 0.5, rootMargin: "0px" }
        );

        observer.observe(elements.statsSection);
    };

    // Lazy Load Images and Videos
    const initLazyLoad = () => {
        const images = document.querySelectorAll("#exampleCards img[data-src]");
        const videos = document.querySelectorAll(".video-card iframe[data-src]");
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const element = entry.target;
                        element.src = element.dataset.src;
                        element.removeAttribute("data-src");
                        element.classList.add("loaded");
                        element.setAttribute("aria-hidden", "false");
                        obs.unobserve(element);
                        utils.trackEvent(element.tagName === "IMG" ? "Image" : "Video", "Load", element.src);
                    }
                });
            },
            { threshold: 0.1 }
        );

        images.forEach((img) => observer.observe(img));
        videos.forEach((video) => observer.observe(video));
    };

    // Onboarding Modal
    const initOnboarding = () => {
        const onboardingModal = document.createElement("div");
        onboardingModal.className = "onboarding-modal";
        onboardingModal.setAttribute("aria-hidden", "true");
        onboardingModal.innerHTML = `
            <div class="onboarding-content">
                <h2>Добро пожаловать в KNOWER LIFE!</h2>
                <p>Пройдите короткий онбординг, чтобы узнать, как использовать мои возможности:</p>
                <div class="onboarding-task" data-task="chat">
                    <i class="fas fa-check-circle ${localStorage.getItem("onboardingChat") ? "completed" : ""}"></i>
                    <span>Попробуйте задать мне вопрос в чат-боте</span>
                </div>
                <div class="onboarding-task" data-task="xlsx">
                    <i class="fas fa-check-circle ${localStorage.getItem("onboardingXlsx") ? "completed" : ""}"></i>
                    <span>Загрузите XLSX-файл для анализа</span>
                </div>
                <div class="onboarding-task" data-task="contact">
                    <i class="fas fa-check-circle ${localStorage.getItem("onboardingContact") ? "completed" : ""}"></i>
                    <span>Отправьте форму обратной связи</span>
                </div>
                <button class="btn onboarding-close">Закрыть</button>
            </div>
        `;
        document.body.appendChild(onboardingModal);

        const onboardingClose = onboardingModal.querySelector(".onboarding-close");
        onboardingClose.addEventListener("click", () => {
            onboardingModal.classList.remove("active");
            onboardingModal.setAttribute("aria-hidden", "true");
            utils.trackEvent("Onboarding", "Close", "Modal");
        });

        onboardingClose.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onboardingClose.click();
            }
        });

        if (!localStorage.getItem("onboardingCompleted")) {
            onboardingModal.classList.add("active");
            onboardingModal.setAttribute("aria-hidden", "false");
            utils.trapFocus(onboardingModal);
        }
    };

    // Update Onboarding Status
    const updateOnboarding = () => {
        const tasks = ["chat", "xlsx", "contact"];
        const allCompleted = tasks.every((task) => localStorage.getItem(`onboarding${task.charAt(0).toUpperCase() + task.slice(1)}`));
        if (allCompleted) {
            localStorage.setItem("onboardingCompleted", "true");
            const modal = document.querySelector(".onboarding-modal");
            if (modal) {
                modal.classList.remove("active");
                modal.setAttribute("aria-hidden", "true");
            }
        }
        document.querySelectorAll(".onboarding-task").forEach((task) => {
            const taskName = task.dataset.task;
            task.querySelector("i").classList.toggle("completed", !!localStorage.getItem(`onboarding${taskName.charAt(0).toUpperCase() + taskName.slice(1)}`));
        });
    };

    // Feedback Modal
    const initFeedback = () => {
        const feedbackBtn = document.createElement("div");
        feedbackBtn.className = "feedback-btn";
        feedbackBtn.innerHTML = `<i class="fas fa-comment"></i>`;
        feedbackBtn.setAttribute("aria-label", "Открыть форму обратной связи");
        feedbackBtn.setAttribute("role", "button");
        document.body.appendChild(feedbackBtn);

        const feedbackModal = document.createElement("div");
        feedbackModal.className = "feedback-modal";
        feedbackModal.setAttribute("aria-hidden", "true");
        feedbackModal.innerHTML = `
            <div class="feedback-content">
                <h2>Оставьте отзыв</h2>
                <div class="star-rating" role="radiogroup" aria-label="Оценка">
                    <i class="fas fa-star" data-rating="1" role="radio" aria-checked="false" tabindex="0"></i>
                    <i class="fas fa-star" data-rating="2" role="radio" aria-checked="false" tabindex="0"></i>
                    <i class="fas fa-star" data-rating="3" role="radio" aria-checked="false" tabindex="0"></i>
                    <i class="fas fa-star" data-rating="4" role="radio" aria-checked="false" tabindex="0"></i>
                    <i class="fas fa-star" data-rating="5" role="radio" aria-checked="false" tabindex="0"></i>
                </div>
                <textarea class="form-control" placeholder="Ваш отзыв..." aria-label="Ваш отзыв"></textarea>
                <button class="btn feedback-submit">Отправить</button>
                <button class="btn feedback-close">Закрыть</button>
            </div>
        `;
        document.body.appendChild(feedbackModal);

        feedbackBtn.addEventListener("click", () => {
            feedbackModal.classList.add("active");
            feedbackModal.setAttribute("aria-hidden", "false");
            utils.trapFocus(feedbackModal);
            utils.trackEvent("Feedback", "Open", "Modal");
        });

        feedbackBtn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                feedbackBtn.click();
            }
        });

        const feedbackClose = feedbackModal.querySelector(".feedback-close");
        feedbackClose.addEventListener("click", () => {
            feedbackModal.classList.remove("active");
            feedbackModal.setAttribute("aria-hidden", "true");
            utils.trackEvent("Feedback", "Close", "Modal");
        });

        feedbackClose.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                feedbackClose.click();
            }
        });

        const feedbackSubmit = feedbackModal.querySelector(".feedback-submit");
        feedbackSubmit.addEventListener("click", () => {
            const comment = utils.sanitizeInput(feedbackModal.querySelector("textarea").value);
            const rating = feedbackModal.querySelector(".star-rating .active")?.dataset.rating || "0";
            if (!comment) {
                utils.showNotification("Пожалуйста, напишите отзыв", "error");
                return;
            }
            feedbackSubmit.disabled = true;
            feedbackSubmit.classList.add("loading");
            setTimeout(() => {
                utils.showNotification("Спасибо за ваш отзыв!");
                feedbackModal.classList.remove("active");
                feedbackModal.setAttribute("aria-hidden", "true");
                feedbackModal.querySelector("textarea").value = "";
                feedbackModal.querySelectorAll(".star-rating i").forEach((s) => {
                    s.classList.remove("active");
                    s.setAttribute("aria-checked", "false");
                });
                utils.trackEvent("Feedback", "Submit", `Rating: ${rating}`);
                feedbackSubmit.disabled = false;
                feedbackSubmit.classList.remove("loading");
            }, 500);
        });

        const stars = feedbackModal.querySelectorAll(".star-rating i");
        stars.forEach((star) => {
            star.addEventListener("click", () => {
                const rating = star.dataset.rating;
                stars.forEach((s) => {
                    s.classList.toggle("active", s.dataset.rating <= rating);
                    s.setAttribute("aria-checked", s.dataset.rating <= rating ? "true" : "false");
                });
            });

            star.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    star.click();
                }
            });
        });
    };

    // Signup Modal
    const initSignup = () => {
        if (!elements.signupModal || !elements.signupForm) return;

        const signupClose = elements.signupModal.querySelector(".signup-close");
        signupClose.addEventListener("click", () => {
            elements.signupModal.classList.remove("active");
            elements.signupModal.setAttribute("aria-hidden", "true");
            utils.trackEvent("Signup", "Close", "Modal");
        });

        signupClose.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                signupClose.click();
            }
        });

        document.querySelectorAll(".faq-answer a[href='#signup']").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                elements.signupModal.classList.add("active");
                elements.signupModal.setAttribute("aria-hidden", "false");
                utils.trapFocus(elements.signupModal);
                utils.trackEvent("Signup", "Open", "Modal");
            });
        });
    };

    // Search Functionality
    const initSearch = () => {
        if (!elements.searchInput || !elements.searchButton) return;

        elements.searchButton.addEventListener("click", () => {
            const query = utils.sanitizeInput(elements.searchInput.value.trim());
            if (!query) {
                utils.showNotification("Пожалуйста, введите поисковый запрос", "error");
                return;
            }
            utils.showNotification(`Поиск: ${query}. Функция поиска в разработке.`, "info");
            utils.trackEvent("Search", "Query", query);
        });

        elements.searchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                elements.searchButton.click();
            }
        });
    };

    // AI Capabilities Modal
    const initAICapabilities = () => {
        if (!elements.aiCapabilitiesBtn) return;

        const capabilitiesModal = document.createElement("div");
        capabilitiesModal.className = "capabilities-modal";
        capabilitiesModal.setAttribute("aria-hidden", "true");
        capabilitiesModal.innerHTML = `
            <div class="capabilities-content">
                <h2>Возможности ИИ</h2>
                <p>KNOWER LIFE предоставляет передовые возможности ИИ, включая генерацию текста, анализ данных, программирование и многое другое. Для получения API доступа посетите <a href="https://x.ai/api" target="_blank">xAI API</a>.</p>
                <button class="btn capabilities-close">Закрыть</button>
            </div>
        `;
        document.body.appendChild(capabilitiesModal);

        elements.aiCapabilitiesBtn.addEventListener("click", (e) => {
            e.preventDefault();
            capabilitiesModal.classList.add("active");
            capabilitiesModal.setAttribute("aria-hidden", "false");
            utils.trapFocus(capabilitiesModal);
            utils.trackEvent("Capabilities", "Open", "Modal");
        });

        const closeBtn = capabilitiesModal.querySelector(".capabilities-close");
        closeBtn.addEventListener("click", () => {
            capabilitiesModal.classList.remove("active");
            capabilitiesModal.setAttribute("aria-hidden", "true");
            utils.trackEvent("Capabilities", "Close", "Modal");
        });

        closeBtn.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                closeBtn.click();
            }
        });
    };

    // Responsive Navigation
    const initResponsiveNav = () => {
        if (!elements.hamburger || !elements.navMenu) return;

        const updateNav = utils.debounce(() => {
            if (window.innerWidth > CONFIG.MOBILE_BREAKPOINT) {
                elements.hamburger.classList.remove("active");
                elements.navMenu.classList.remove("active");
                elements.navMenu.style.display = "flex";
                elements.hamburger.style.display = "none";
                elements.hamburger.setAttribute("aria-hidden", "true");
            } else {
                elements.hamburger.style.display = "block";
                elements.navMenu.style.display = elements.navMenu.classList.contains("active") ? "flex" : "none";
                elements.hamburger.setAttribute("aria-hidden", "false");
            }
        }, CONFIG.DEBOUNCE_DELAY);

        window.addEventListener("resize", updateNav, { passive: true });
        updateNav();
    };

    // Cookie Consent Banner
    const initCookieConsent = () => {
        if (localStorage.getItem("cookieConsent")) return;

        const consentBanner = document.createElement("div");
        consentBanner.className = "cookie-consent";
        consentBanner.setAttribute("aria-live", "polite");
        consentBanner.innerHTML = `
            <div class="cookie-content">
                <p>Мы используем cookies для аналитики и улучшения работы сайта. Согласны ли вы с этим?</p>
                <button class="btn cookie-accept">Принять</button>
                <button class="btn cookie-decline">Отклонить</button>
            </div>
        `;
        document.body.appendChild(consentBanner);

        const acceptBtn = consentBanner.querySelector(".cookie-accept");
        const declineBtn = consentBanner.querySelector(".cookie-decline");

        acceptBtn.addEventListener("click", () => {
            localStorage.setItem("cookieConsent", "true");
            localStorage.setItem("analyticsConsent", "true");
            consentBanner.remove();
            initAnalytics();
            utils.trackEvent("Consent", "Accept", "Cookies");
        });

        declineBtn.addEventListener("click", () => {
            localStorage.setItem("cookieConsent", "true");
            localStorage.setItem("analyticsConsent", "false");
            consentBanner.remove();
            utils.trackEvent("Consent", "Decline", "Cookies");
        });

        [acceptBtn, declineBtn].forEach((btn) => {
            btn.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    btn.click();
                }
            });
        });
    };

    // PWA Install Prompt
    const initPWAInstall = () => {
        let deferredPrompt;
        elements.pwaInstall = document.createElement("button");
        elements.pwaInstall.className = "pwa-install";
        elements.pwaInstall.innerHTML = `<i class="fas fa-download"></i> Установить приложение`;
        elements.pwaInstall.setAttribute("aria-label", "Установить приложение");
        elements.pwaInstall.setAttribute("role", "button");
        document.body.appendChild(elements.pwaInstall);

        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            deferredPrompt = e;
            elements.pwaInstall.classList.add("active");
            elements.pwaInstall.setAttribute("aria-hidden", "false");
            utils.trackEvent("PWA", "Prompt Available", "Install");
        });

        elements.pwaInstall.addEventListener("click", async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            utils.trackEvent("PWA", "Install", outcome);
            elements.pwaInstall.classList.remove("active");
            elements.pwaInstall.setAttribute("aria-hidden", "true");
            deferredPrompt = null;
        });

        elements.pwaInstall.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                elements.pwaInstall.click();
            }
        });

        window.addEventListener("appinstalled", () => {
            utils.showNotification("Приложение успешно установлено!");
            elements.pwaInstall.classList.remove("active");
            elements.pwaInstall.setAttribute("aria-hidden", "true");
            utils.trackEvent("PWA", "Installed", "Success");
        });
    };

    // Service Worker for PWA
    const initServiceWorker = () => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").then(
                (registration) => {
                    console.log("Service Worker registered:", registration);
                    utils.trackEvent("PWA", "ServiceWorker", "Registered");
                },
                (error) => {
                    console.error("Service Worker registration failed:", error);
                    utils.showNotification("Ошибка регистрации Service Worker", "error");
                }
            );
        }
    };

    // Analytics
    const initAnalytics = () => {
        if (localStorage.getItem("analyticsConsent") !== "true") return;

        const script = document.createElement("script");
        script.src = `https://www.googletagmanager.com/gtag/js?id=${CONFIG.ANALYTICS_ID}`;
        script.async = true;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() {
            window.dataLayer.push(arguments);
        }
        gtag("js", new Date());
        gtag("config", CONFIG.ANALYTICS_ID);
        utils.measurePerformance("Page Load");
    };

    // Initialize All
    safeExecute(initHamburger, "Hamburger Menu Initialization");
    safeExecute(initScroll, "Scroll Features Initialization");
    safeExecute(initSmoothScroll, "Smooth Scroll Initialization");
    safeExecute(initTheme, "Theme Switcher Initialization");
    safeExecute(initLanguage, "Language Switcher Initialization");
    safeExecute(initTyped, "Typed Animation Initialization");
    safeExecute(initChatbot, "Chatbot Initialization");
    safeExecute(initFAQ, "FAQ Initialization");
    safeExecute(initFilters, "Filters Initialization");
    safeExecute(initForms, "Forms Initialization");
    safeExecute(initXLSX, "XLSX Processing Initialization");
    safeExecute(initStats, "Stats Animation Initialization");
    safeExecute(initLazyLoad, "Lazy Load Initialization");
    safeExecute(initOnboarding, "Onboarding Initialization");
    safeExecute(initFeedback, "Feedback Initialization");
    safeExecute(initSignup, "Signup Modal Initialization");
    safeExecute(initSearch, "Search Initialization");
    safeExecute(initAICapabilities, "AI Capabilities Initialization");
    safeExecute(initResponsiveNav, "Responsive Navigation Initialization");
    safeExecute(initCookieConsent, "Cookie Consent Initialization");
    safeExecute(initServiceWorker, "Service Worker Initialization");
    safeExecute(initPWAInstall, "PWA Install Initialization");
});
