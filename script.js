/* Recommendation: Use strict mode to catch common coding errors and improve performance */
"use strict";

// Recommendation: Organize event listeners in a single function for better maintainability
document.addEventListener("DOMContentLoaded", () => {
    /* Hamburger Menu Toggle */
    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("navMenu");
    
    // Recommendation: Add error handling for missing DOM elements
    if (!hamburger || !navMenu) {
        console.error("Hamburger or navMenu element not found");
        return;
    }

    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    /* Scroll Progress Bar */
    const progressBar = document.getElementById("progressBar");
    if (progressBar) {
        window.addEventListener("scroll", () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = `${scrollPercent}%`;
        });
    } else {
        console.warn("Progress bar element not found");
    }

    /* Scroll to Top Button */
    const scrollTop = document.getElementById("scrollTop");
    if (scrollTop) {
        scrollTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });

        window.addEventListener("scroll", () => {
            scrollTop.style.display = window.scrollY > 300 ? "block" : "none";
        });
    }

    /* Theme Switcher */
    const themeSelect = document.getElementById("themeSelect");
    if (themeSelect) {
        themeSelect.addEventListener("change", (e) => {
            document.body.className = "";
            document.body.classList.add(e.target.value);
            localStorage.setItem("theme", e.target.value);
        });

        // Load saved theme
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            document.body.className = "";
            document.body.classList.add(savedTheme);
            themeSelect.value = savedTheme;
        }
    }

    /* Language Switcher */
    const langButtons = document.querySelectorAll(".lang-btn");
    langButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            langButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            localStorage.setItem("language", btn.dataset.lang);
            // Recommendation: Implement actual language switching logic here
            console.log(`Language switched to: ${btn.dataset.lang}`);
        });
    });

    // Load saved language
    const savedLang = localStorage.getItem("language") || "ru";
    langButtons.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.lang === savedLang);
    });

    /* Typed.js Animation */
    // Recommendation: Check if Typed.js is loaded before initializing
    if (typeof Typed === "function") {
        new Typed("#typedText", {
            strings: [
                "Искры Гениальности",
                "Будущее ИИ",
                "Ваш Интеллектуальный Партнер"
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true,
            cursorChar: "|"
        });
    } else {
        console.warn("Typed.js not loaded");
    }

    /* Chatbot Widget */
    const chatInput = document.getElementById("chatInput");
    const chatSubmit = document.getElementById("chatSubmit");
    const chatResponse = document.getElementById("chatResponse");
    
    if (chatInput && chatSubmit && chatResponse) {
        chatSubmit.addEventListener("click", () => {
            const query = chatInput.value.trim();
            if (!query) {
                chatResponse.textContent = "Пожалуйста, введите запрос.";
                chatResponse.style.display = "block";
                return;
            }
            // Recommendation: Implement actual AI response logic here
            chatResponse.textContent = `Ответ на ваш запрос "${query}": Это пример ответа от KNOWER LIFE.`;
            chatResponse.style.display = "block";
            chatInput.value = "";
        });
    }

    /* FAQ Toggle */
    const faqQuestions = document.querySelectorAll(".faq-question");
    faqQuestions.forEach((question) => {
        question.addEventListener("click", () => {
            const answer = question.nextElementSibling;
            if (answer) {
                answer.classList.toggle("active");
                question.querySelector("i").classList.toggle("fa-chevron-down");
                question.querySelector("i").classList.toggle("fa-chevron-up");
            }
        });
    });

    /* Filter Buttons for Examples */
    const filterButtons = document.querySelectorAll(".filter-btn");
    const exampleCards = document.querySelectorAll("#exampleCards .card");
    
    filterButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const filter = btn.dataset.filter;
            exampleCards.forEach((card) => {
                card.style.display =
                    filter === "all" || card.dataset.category === filter
                        ? "block"
                        : "none";
            });
        });
    });

    /* Contact Form Submission */
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            // Recommendation: Add form validation and actual submission logic
            alert("Форма отправлена!");
            contactForm.reset();
        });
    }

    /* Newsletter Form Submission */
    const newsletterForm = document.getElementById("newsletterForm");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            // Recommendation: Add email validation and actual submission logic
            alert("Вы подписались на рассылку!");
            newsletterForm.reset();
        });
    }

    /* XLSX File Upload and Chart */
    const xlsxUpload = document.getElementById("xlsxUpload");
    const xlsxLoader = document.getElementById("xlsxLoader");
    const showcaseTable = document.getElementById("showcaseTable");
    const dataChart = document.getElementById("dataChart");
    
    if (xlsxUpload && xlsxLoader && showcaseTable && dataChart) {
        xlsxUpload.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            xlsxLoader.style.display = "block";
            const reader = new FileReader();

            reader.onload = (event) => {
                try {
                    // Recommendation: Check if XLSX is loaded
                    if (typeof XLSX === "undefined") {
                        throw new Error("XLSX library not loaded");
                    }

                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const firstSheet = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheet];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                    // Render Table
                    showcaseTable.innerHTML = "";
                    const table = document.createElement("table");
                    table.className = "showcase-table";
                    jsonData.forEach((row, index) => {
                        const tr = document.createElement("tr");
                        row.forEach((cell) => {
                            const cellTag = index === 0 ? "th" : "td";
                            const td = document.createElement(cellTag);
                            td.textContent = cell || "";
                            tr.appendChild(td);
                        });
                        table.appendChild(tr);
                    });
                    showcaseTable.appendChild(table);

                    // Render Chart
                    // Recommendation: Destroy existing chart to prevent memory leaks
                    if (window.chartInstance) {
                        window.chartInstance.destroy();
                    }

                    const headers = jsonData[0];
                    const dataRows = jsonData.slice(1).filter(row => row.length > 0);
                    const labels = dataRows.map((_, i) => `Row ${i + 1}`);
                    const datasets = headers.slice(1).map((header, i) => ({
                        label: header,
                        data: dataRows.map(row => Number(row[i + 1]) || 0),
                        backgroundColor: `rgba(${75 + i * 50}, ${192 - i * 20}, ${192 - i * 30}, 0.5)`,
                        borderColor: `rgba(${75 + i * 50}, ${192 - i * 20}, ${192 - i * 30}, 1)`,
                        borderWidth: 1
                    }));

                    window.chartInstance = new Chart(dataChart.getContext("2d"), {
                        type: "bar",
                        data: { labels, datasets },
                        options: {
                            responsive: true,
                            scales: {
                                y: { beginAtZero: true }
                            }
                        }
                    });

                    xlsxLoader.style.display = "none";
                } catch (error) {
                    console.error("Error processing XLSX file:", error);
                    xlsxLoader.style.display = "none";
                    alert("Ошибка при обработке файла. Пожалуйста, проверьте формат файла.");
                }
            };

            reader.readAsArrayBuffer(file);
        });
    }

    /* Stats Animation */
    // Recommendation: Use IntersectionObserver to trigger animations only when visible
    const statsNumbers = document.querySelectorAll(".stats-number");
    const animateStats = () => {
        statsNumbers.forEach((stat) => {
            const target = parseInt(stat.dataset.target) || 0;
            let count = 0;
            const increment = target / 100;
            const updateCount = () => {
                if (count < target) {
                    count += increment;
                    stat.textContent = Math.round(count);
                    requestAnimationFrame(updateCount);
                } else {
                    stat.textContent = target;
                }
            };
            updateCount();
        });
    };

    // Set example target values
    document.getElementById("statsQueries")?.setAttribute("data-target", "10000");
    document.getElementById("statsFiles")?.setAttribute("data-target", "5000");
    document.getElementById("statsUsers")?.setAttribute("data-target", "2000");

    // Trigger stats animation
    const statsSection = document.getElementById("stats");
    if (statsSection) {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    animateStats();
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );
        observer.observe(statsSection);
    }

    /* Google Analytics */
    // Recommendation: Load Google Analytics asynchronously and respect user privacy
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        window.dataLayer.push(arguments);
    }
    gtag("js", new Date());
    gtag("config", "G-XXXXXXXXXX");

    /* Onboarding Modal */
    // Recommendation: Implement onboarding logic with localStorage to show only once
    const onboardingModal = document.createElement("div");
    onboardingModal.className = "onboarding-modal";
    onboardingModal.innerHTML = `
        <div class="onboarding-content">
            <h2>Добро пожаловать в KNOWER LIFE!</h2>
            <p>Пройдите короткий онбординг, чтобы узнать, как использовать мои возможности:</p>
            <div class="onboarding-task" data-task="chat">
                <i class="fas fa-check-circle"></i>
                <span>Попробуйте задать мне вопрос в чат-боте</span>
            </div>
            <div class="onboarding-task" data-task="xlsx">
                <i class="fas fa-check-circle"></i>
                <span>Загрузите XLSX-файл для анализа</span>
            </div>
            <div class="onboarding-task" data-task="contact">
                <i class="fas fa-check-circle"></i>
                <span>Отправьте форму обратной связи</span>
            </div>
            <button class="btn onboarding-close">Закрыть</button>
        </div>
    `;
    document.body.appendChild(onboardingModal);

    const onboardingClose = onboardingModal.querySelector(".onboarding-close");
    if (onboardingClose) {
        onboardingClose.addEventListener("click", () => {
            onboardingModal.classList.remove("active");
        });
    }

    // Show onboarding if not completed
    if (!localStorage.getItem("onboardingCompleted")) {
        onboardingModal.classList.add("active");
    }

    /* Feedback Modal */
    const feedbackBtn = document.createElement("div");
    feedbackBtn.className = "feedback-btn";
    feedbackBtn.innerHTML = `<i class="fas fa-comment"></i>`;
    document.body.appendChild(feedbackBtn);

    const feedbackModal = document.createElement("div");
    feedbackModal.className = "feedback-modal";
    feedbackModal.innerHTML = `
        <div class="feedback-content">
            <h2>Оставьте отзыв</h2>
            <div class="star-rating">
                <i class="fas fa-star" data-rating="1"></i>
                <i class="fas fa-star" data-rating="2"></i>
                <i class="fas fa-star" data-rating="3"></i>
                <i class="fas fa-star" data-rating="4"></i>
                <i class="fas fa-star" data-rating="5"></i>
            </div>
            <textarea class="form-control" placeholder="Ваш отзыв..." aria-label="Ваш отзыв"></textarea>
            <button class="btn feedback-submit">Отправить</button>
            <button class="btn feedback-close">Закрыть</button>
        </div>
    `;
    document.body.appendChild(feedbackModal);

    feedbackBtn.addEventListener("click", () => {
        feedbackModal.classList.add("active");
    });

    const feedbackClose = feedbackModal.querySelector(".feedback-close");
    if (feedbackClose) {
        feedbackClose.addEventListener("click", () => {
            feedbackModal.classList.remove("active");
        });
    }

    const feedbackSubmit = feedbackModal.querySelector(".feedback-submit");
    if (feedbackSubmit) {
        feedbackSubmit.addEventListener("click", () => {
            // Recommendation: Add actual feedback submission logic
            alert("Спасибо за ваш отзыв!");
            feedbackModal.classList.remove("active");
        });
    }

    const stars = feedbackModal.querySelectorAll(".star-rating i");
    stars.forEach((star) => {
        star.addEventListener("click", () => {
            const rating = star.dataset.rating;
            stars.forEach((s) =>
                s.classList.toggle("active", s.dataset.rating <= rating)
            );
        });
    });

    /* Responsive Navigation for Mobile */
    // Recommendation: Debounce resize event to improve performance
    let timeout;
    window.addEventListener("resize", () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            if (window.innerWidth > 768) {
                hamburger.classList.remove("active");
                navMenu.classList.remove("active");
            }
        }, 100);
    });

    if (window.innerWidth <= 768) {
        hamburger.style.display = "block";
        navMenu.style.display = "none";
        hamburger.addEventListener("click", () => {
            navMenu.style.display = navMenu.style.display === "none" ? "flex" : "none";
        });
    }
});