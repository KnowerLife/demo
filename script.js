"use strict";

// Конфигурация приложения
const CONFIG = {
    APP: {
        NAME: "KNOWER LIFE",
        VERSION: "2.0.0",
        API_BASE: "https://api.knowerlife.ru/v1",
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        REQUEST_TIMEOUT: 30000,
        CACHE_TTL: 300000 // 5 минут
    },
    
    SECURITY: {
        SANITIZE_OPTIONS: {
            ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'br', 'p'],
            ALLOWED_ATTR: []
        },
        PASSWORD_MIN_LENGTH: 8,
        SESSION_DURATION: 7 * 24 * 60 * 60 * 1000 // 7 дней
    },
    
    FEATURES: {
        CHAT: true,
        FILE_UPLOAD: true,
        ANALYTICS: true,
        PWA: true,
        OFFLINE: true
    }
};

// Система управления состоянием
class AppState {
    constructor() {
        this.state = {
            user: null,
            theme: 'light',
            language: 'ru',
            chatHistory: [],
            uploads: [],
            preferences: {}
        };
        this.observers = [];
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notifyObservers();
    }

    subscribe(observer) {
        this.observers.push(observer);
    }

    notifyObservers() {
        this.observers.forEach(observer => observer(this.state));
    }

    // Сохранение в localStorage с проверкой квот
    persist(key, data) {
        try {
            const serialized = JSON.stringify(data);
            if (serialized.length > 5000000) { // 5MB лимит
                console.warn('Data too large for persistence');
                return false;
            }
            localStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            console.error('Persistence error:', error);
            return false;
        }
    }

    // Безопасное чтение из localStorage
    retrieve(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Retrieval error:', error);
            return defaultValue;
        }
    }
}

// Утилиты безопасности
class SecurityUtils {
    static sanitizeHTML(input) {
        if (typeof input !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    static validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    }

    static validatePhone(phone) {
        const re = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
        return re.test(phone);
    }

    static validatePassword(password) {
        if (password.length < CONFIG.SECURITY.PASSWORD_MIN_LENGTH) return false;
        if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) return false;
        if (!/(?=.*\d)/.test(password)) return false;
        return true;
    }

    static generateCSRFToken() {
        return 'csrf_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    static escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

// Система кэширования
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.ttl = CONFIG.APP.CACHE_TTL;
    }

    set(key, value, ttl = this.ttl) {
        const item = {
            value,
            expiry: Date.now() + ttl
        };
        this.cache.set(key, item);
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    delete(key) {
        this.cache.delete(key);
    }

    clear() {
        this.cache.clear();
    }
}

// Основной класс приложения
class KnowerLifeApp {
    constructor() {
        this.stateManager = new AppState();
        this.cacheManager = new CacheManager();
        this.elements = {};
        this.isInitialized = false;
        this.currentUser = null;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            await this.setupErrorHandling();
            await this.loadState();
            await this.initializeModules();
            await this.setupEventListeners();
            await this.setupServiceWorker();
            
            this.isInitialized = true;
            this.log('Application initialized successfully');
        } catch (error) {
            this.handleError('Initialization failed', error);
        }
    }

    async setupErrorHandling() {
        window.addEventListener('error', (event) => {
            this.handleError('Global error', event.error);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Unhandled promise rejection', event.reason);
        });
    }

    async loadState() {
        const savedState = this.stateManager.retrieve('appState');
        if (savedState) {
            this.stateManager.setState(savedState);
        }

        // Загрузка пользователя
        const user = this.stateManager.retrieve('currentUser');
        if (user) {
            this.currentUser = user;
            this.updateUIForUser(user);
        }
    }

    async initializeModules() {
        this.elements = this.gatherElements();
        
        await Promise.all([
            this.initializeTheme(),
            this.initializeLanguage(),
            this.initializeAuth(),
            this.initializeChat(),
            this.initializeFileUpload(),
            this.initializeAnalytics()
        ]);
    }

    gatherElements() {
        return {
            // Основные элементы
            hamburger: document.getElementById('hamburger'),
            navMenu: document.getElementById('navMenu'),
            progressBar: document.getElementById('progressBar'),
            scrollTop: document.getElementById('scrollTop'),
            
            // Навигация
            themeSelect: document.getElementById('themeSelect'),
            langButtons: document.querySelectorAll('.lang-btn'),
            
            // Чат
            typedText: document.getElementById('typedText'),
            chatInput: document.getElementById('chatInput'),
            chatSubmit: document.getElementById('chatSubmit'),
            chatResponse: document.getElementById('chatResponse'),
            
            // Формы
            contactForm: document.getElementById('contactForm'),
            newsletterForm: document.getElementById('newsletterForm'),
            
            // Файлы
            xlsxUpload: document.getElementById('xlsxUpload'),
            xlsxLoader: document.getElementById('xlsxLoader'),
            showcaseTable: document.getElementById('showcaseTable'),
            dataChart: document.getElementById('dataChart'),
            
            // Статистика
            statsNumbers: document.querySelectorAll('.stats-number'),
            statsSection: document.getElementById('stats'),
            
            // FAQ
            faqQuestions: document.querySelectorAll('.faq-question'),
            
            // Фильтры
            filterButtons: document.querySelectorAll('.filter-btn'),
            exampleCards: document.querySelectorAll('#exampleCards .card'),
            
            // Поиск
            searchInput: document.querySelector('.search-bar input'),
            searchButton: document.querySelector('.search-bar button')
        };
    }

    // Инициализация аутентификации
    async initializeAuth() {
        this.setupAuthModal();
        this.setupAuthForms();
    }

    setupAuthModal() {
        // Создание модального окна аутентификации
        const authModal = document.createElement('div');
        authModal.className = 'auth-modal';
        authModal.innerHTML = `
            <div class="auth-content">
                <div class="auth-tabs">
                    <button class="auth-tab active" data-tab="login">Вход</button>
                    <button class="auth-tab" data-tab="register">Регистрация</button>
                </div>
                
                <form class="auth-form active" id="loginForm">
                    <div class="form-group">
                        <label for="loginEmail">Email</label>
                        <input type="email" id="loginEmail" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">Пароль</label>
                        <input type="password" id="loginPassword" class="form-control" required>
                    </div>
                    <button type="submit" class="btn">Войти</button>
                </form>
                
                <form class="auth-form" id="registerForm">
                    <div class="form-group">
                        <label for="registerName">Имя</label>
                        <input type="text" id="registerName" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="registerEmail">Email</label>
                        <input type="email" id="registerEmail" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="registerPassword">Пароль</label>
                        <input type="password" id="registerPassword" class="form-control" required>
                        <div class="password-strength">
                            <div class="password-strength-bar"></div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="registerConfirmPassword">Подтвердите пароль</label>
                        <input type="password" id="registerConfirmPassword" class="form-control" required>
                    </div>
                    <button type="submit" class="btn">Зарегистрироваться</button>
                </form>
            </div>
        `;
        
        document.body.appendChild(authModal);
        this.elements.authModal = authModal;
    }

    setupAuthForms() {
        // Табы аутентификации
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                
                // Активация таба
                document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Показ соответствующей формы
                document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
                document.getElementById(tabName + 'Form').classList.add('active');
            });
        });

        // Валидация пароля при регистрации
        const registerPassword = document.getElementById('registerPassword');
        if (registerPassword) {
            registerPassword.addEventListener('input', (e) => {
                this.validatePasswordStrength(e.target.value);
            });
        }

        // Обработка форм
        this.setupLoginForm();
        this.setupRegisterForm();
    }

    validatePasswordStrength(password) {
        const strengthBar = document.querySelector('.password-strength-bar');
        const strengthContainer = document.querySelector('.password-strength');
        
        if (!strengthBar) return;

        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        strengthContainer.className = 'password-strength';
        if (strength <= 2) {
            strengthContainer.classList.add('weak');
        } else if (strength <= 4) {
            strengthContainer.classList.add('medium');
        } else {
            strengthContainer.classList.add('strong');
        }
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (!loginForm) return;

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            if (!SecurityUtils.validateEmail(email)) {
                this.showNotification('Введите корректный email', 'error');
                return;
            }

            await this.performLogin(email, password);
        });
    }

    setupRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (!registerForm) return;

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;

            if (!SecurityUtils.validateEmail(email)) {
                this.showNotification('Введите корректный email', 'error');
                return;
            }

            if (!SecurityUtils.validatePassword(password)) {
                this.showNotification('Пароль должен содержать минимум 8 символов, включая заглавные и строчные буквы, цифры', 'error');
                return;
            }

            if (password !== confirmPassword) {
                this.showNotification('Пароли не совпадают', 'error');
                return;
            }

            await this.performRegistration(name, email, password);
        });
    }

    async performLogin(email, password) {
        try {
            const button = document.querySelector('#loginForm button');
            button.disabled = true;
            button.classList.add('loading');

            // Имитация API запроса
            await new Promise(resolve => setTimeout(resolve, 1000));

            const user = {
                id: 1,
                name: 'Пользователь',
                email: email,
                plan: 'free',
                joined: new Date().toISOString()
            };

            this.currentUser = user;
            this.stateManager.persist('currentUser', user);
            this.updateUIForUser(user);
            this.elements.authModal.classList.remove('active');
            
            this.showNotification('Успешный вход!', 'success');
            this.trackEvent('auth', 'login', 'success');

        } catch (error) {
            this.showNotification('Ошибка входа. Проверьте данные.', 'error');
            this.trackEvent('auth', 'login', 'error');
        } finally {
            const button = document.querySelector('#loginForm button');
            button.disabled = false;
            button.classList.remove('loading');
        }
    }

    async performRegistration(name, email, password) {
        try {
            const button = document.querySelector('#registerForm button');
            button.disabled = true;
            button.classList.add('loading');

            // Имитация API запроса
            await new Promise(resolve => setTimeout(resolve, 1000));

            const user = {
                id: Date.now(),
                name: name,
                email: email,
                plan: 'free',
                joined: new Date().toISOString()
            };

            this.currentUser = user;
            this.stateManager.persist('currentUser', user);
            this.updateUIForUser(user);
            this.elements.authModal.classList.remove('active');
            
            this.showNotification('Регистрация успешна!', 'success');
            this.trackEvent('auth', 'register', 'success');

        } catch (error) {
            this.showNotification('Ошибка регистрации.', 'error');
            this.trackEvent('auth', 'register', 'error');
        } finally {
            const button = document.querySelector('#registerForm button');
            button.disabled = false;
            button.classList.remove('loading');
        }
    }

    updateUIForUser(user) {
        // Обновление навигации для авторизованного пользователя
        const authSection = document.querySelector('.user-auth');
        if (!authSection) {
            this.createUserAuthSection();
        }
        
        this.updateUserMenu(user);
    }

    createUserAuthSection() {
        const headerContainer = document.querySelector('.header-container');
        if (!headerContainer) return;

        const authSection = document.createElement('div');
        authSection.className = 'user-auth';
        authSection.innerHTML = `
            <div class="user-menu" style="display: none;">
                <span class="user-greeting">Привет, </span>
                <div class="user-dropdown">
                    <button class="user-dropdown-btn">
                        <span class="user-name"></span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="user-dropdown-content">
                        <a href="#profile"><i class="fas fa-user"></i> Профиль</a>
                        <a href="#settings"><i class="fas fa-cog"></i> Настройки</a>
                        <a href="#billing"><i class="fas fa-credit-card"></i> Тарифы</a>
                        <button class="logout-btn"><i class="fas fa-sign-out-alt"></i> Выйти</button>
                    </div>
                </div>
            </div>
            <div class="auth-buttons">
                <button class="btn btn-secondary login-btn">Войти</button>
                <button class="btn register-btn">Регистрация</button>
            </div>
        `;

        headerContainer.appendChild(authSection);
        this.setupAuthButtons();
    }

    setupAuthButtons() {
        // Кнопка входа
        document.querySelector('.login-btn')?.addEventListener('click', () => {
            this.elements.authModal.classList.add('active');
            document.querySelector('.auth-tab[data-tab="login"]').click();
        });

        // Кнопка регистрации
        document.querySelector('.register-btn')?.addEventListener('click', () => {
            this.elements.authModal.classList.add('active');
            document.querySelector('.auth-tab[data-tab="register"]').click();
        });

        // Кнопка выхода
        document.querySelector('.logout-btn')?.addEventListener('click', () => {
            this.performLogout();
        });
    }

    updateUserMenu(user) {
        const userMenu = document.querySelector('.user-menu');
        const authButtons = document.querySelector('.auth-buttons');
        
        if (user) {
            document.querySelector('.user-name').textContent = user.name;
            document.querySelector('.user-greeting').textContent = `Привет, ${user.name}`;
            
            userMenu.style.display = 'flex';
            authButtons.style.display = 'none';
        } else {
            userMenu.style.display = 'none';
            authButtons.style.display = 'flex';
        }
    }

    performLogout() {
        this.currentUser = null;
        this.stateManager.persist('currentUser', null);
        this.updateUIForUser(null);
        this.showNotification('Вы вышли из системы', 'info');
        this.trackEvent('auth', 'logout', 'success');
    }

    // Инициализация чата с улучшенной безопасностью
    async initializeChat() {
        if (!this.elements.chatInput || !this.elements.chatSubmit) return;

        this.elements.chatSubmit.addEventListener('click', async () => {
            await this.handleChatSubmit();
        });

        this.elements.chatInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                await this.handleChatSubmit();
            }
        });
    }

    async handleChatSubmit() {
        const query = SecurityUtils.sanitizeHTML(this.elements.chatInput.value.trim());
        
        if (!query) {
            this.showNotification('Введите сообщение', 'error');
            return;
        }

        if (query.length > 1000) {
            this.showNotification('Сообщение слишком длинное', 'error');
            return;
        }

        await this.sendChatMessage(query);
    }

    async sendChatMessage(query) {
        this.elements.chatSubmit.disabled = true;
        this.elements.chatSubmit.classList.add('loading');

        try {
            // Имитация API запроса к AI
            const response = await this.simulateAIResponse(query);
            
            this.elements.chatResponse.textContent = response;
            this.elements.chatResponse.style.display = 'block';
            this.elements.chatInput.value = '';

            // Сохранение в историю
            this.saveToChatHistory(query, response);
            this.trackEvent('chat', 'message_sent', 'success');

        } catch (error) {
            this.showNotification('Ошибка отправки сообщения', 'error');
            this.trackEvent('chat', 'message_sent', 'error');
        } finally {
            this.elements.chatSubmit.disabled = false;
            this.elements.chatSubmit.classList.remove('loading');
        }
    }

    async simulateAIResponse(query) {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const responses = {
            'привет': 'Привет! Я KNOWER LIFE. Чем могу помочь?',
            'как дела': 'Отлично! Готов помочь вам с любыми задачами.',
            'что ты умеешь': 'Я могу: анализировать данные, писать код, создавать контент, помогать с обучением и многое другое!',
            'default': `Спасибо за ваш вопрос: "${query}". Я могу помочь с анализом данных, программированием, созданием контента и другими задачами. Что вас интересует?`
        };

        return responses[query.toLowerCase()] || responses.default;
    }

    saveToChatHistory(query, response) {
        const chatHistory = this.stateManager.retrieve('chatHistory', []);
        chatHistory.push({
            query,
            response,
            timestamp: new Date().toISOString(),
            id: Date.now()
        });

        // Ограничение истории 100 сообщениями
        if (chatHistory.length > 100) {
            chatHistory.shift();
        }

        this.stateManager.persist('chatHistory', chatHistory);
    }

    // Инициализация темы
    async initializeTheme() {
        const savedTheme = this.stateManager.retrieve('theme', 'light');
        this.applyTheme(savedTheme);
        
        if (this.elements.themeSelect) {
            this.elements.themeSelect.value = savedTheme;
            this.elements.themeSelect.addEventListener('change', (e) => {
                this.applyTheme(e.target.value);
            });
        }
    }

    applyTheme(theme) {
        document.body.className = theme;
        this.stateManager.persist('theme', theme);
        this.trackEvent('preferences', 'theme_change', theme);
    }

    // Инициализация языка
    async initializeLanguage() {
        const savedLang = this.stateManager.retrieve('language', 'ru');
        this.applyLanguage(savedLang);

        this.elements.langButtons?.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === savedLang);
            btn.addEventListener('click', () => {
                this.applyLanguage(btn.dataset.lang);
            });
        });
    }

    applyLanguage(lang) {
        this.stateManager.persist('language', lang);
        this.trackEvent('preferences', 'language_change', lang);
        this.showNotification(`Язык изменен на: ${lang === 'ru' ? 'Русский' : 'English'}`);
    }

    // Инициализация загрузки файлов
    async initializeFileUpload() {
        if (!this.elements.xlsxUpload) return;

        this.elements.xlsxUpload.addEventListener('change', (e) => {
            this.handleFileUpload(e);
        });
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Проверка размера файла
        if (file.size > CONFIG.APP.MAX_FILE_SIZE) {
            this.showNotification('Файл слишком большой. Максимум 10MB.', 'error');
            return;
        }

        // Проверка типа файла
        if (!file.name.endsWith('.xlsx')) {
            this.showNotification('Поддерживаются только XLSX файлы', 'error');
            return;
        }

        await this.processXLSXFile(file);
    }

    async processXLSXFile(file) {
        this.elements.xlsxLoader.style.display = 'block';

        try {
            // Имитация обработки файла
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Здесь была бы реальная обработка XLSX
            this.showNotification('Файл успешно обработан!', 'success');
            this.trackEvent('file', 'upload', 'success');

        } catch (error) {
            this.showNotification('Ошибка обработки файла', 'error');
            this.trackEvent('file', 'upload', 'error');
        } finally {
            this.elements.xlsxLoader.style.display = 'none';
            this.elements.xlsxUpload.value = '';
        }
    }

    // Инициализация аналитики
    async initializeAnalytics() {
        if (this.stateManager.retrieve('analyticsConsent') !== 'true') return;

        // Инициализация Google Analytics или другой аналитики
        this.trackEvent('app', 'init', 'success');
    }

    // Утилиты
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'assertive');
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    trackEvent(category, action, label) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label
            });
        }
        
        console.log(`[Analytics] ${category}.${action}: ${label}`);
    }

    log(message, data = null) {
        console.log(`[KNOWER LIFE] ${message}`, data || '');
    }

    handleError(context, error) {
        console.error(`[KNOWER LIFE Error] ${context}:`, error);
        this.trackEvent('error', context, error.message);
        
        // Показ пользователю только безопасной информации
        this.showNotification('Произошла ошибка. Пожалуйста, попробуйте позже.', 'error');
    }

    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                this.log('Service Worker зарегистрирован', registration);
            } catch (error) {
                this.handleError('Service Worker registration', error);
            }
        }
    }

    async setupEventListeners() {
        // Глобальные обработчики событий
        window.addEventListener('online', () => {
            this.showNotification('Соединение восстановлено', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('Отсутствует подключение к интернету', 'warning');
        });

        // Обработчики для существующих элементов
        this.setupExistingEventListeners();
    }

    setupExistingEventListeners() {
        // Прогресс бар и скролл
        window.addEventListener('scroll', this.debounce(() => {
            this.updateScrollProgress();
        }, 10));

        // Кнопка "Наверх"
        this.elements.scrollTop?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // FAQ
        this.elements.faqQuestions?.forEach(question => {
            question.addEventListener('click', () => {
                this.toggleFAQ(question);
            });
        });

        // Фильтры
        this.elements.filterButtons?.forEach(btn => {
            btn.addEventListener('click', () => {
                this.applyFilter(btn.dataset.filter);
            });
        });

        // Поиск
        this.elements.searchButton?.addEventListener('click', () => {
            this.performSearch();
        });

        this.elements.searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
    }

    updateScrollProgress() {
        if (!this.elements.progressBar) return;

        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight - windowHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        const scrollPercent = (scrollTop / documentHeight) * 100;
        this.elements.progressBar.style.width = `${scrollPercent}%`;

        // Показать/скрыть кнопку "Наверх"
        if (this.elements.scrollTop) {
            const isVisible = scrollTop > 300;
            this.elements.scrollTop.classList.toggle('active', isVisible);
        }
    }

    toggleFAQ(question) {
        const answer = question.nextElementSibling;
        const isExpanded = answer.classList.toggle('active');
        
        question.setAttribute('aria-expanded', isExpanded);
        const icon = question.querySelector('i');
        if (icon) {
            icon.className = isExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
        }
    }

    applyFilter(filter) {
        this.elements.filterButtons?.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.elements.exampleCards?.forEach(card => {
            const category = card.dataset.category;
            const shouldShow = filter === 'all' || category === filter;
            card.style.display = shouldShow ? 'block' : 'none';
        });
    }

    performSearch() {
        const query = SecurityUtils.sanitizeHTML(this.elements.searchInput?.value.trim() || '');
        
        if (!query) {
            this.showNotification('Введите поисковый запрос', 'error');
            return;
        }

        this.trackEvent('search', 'perform', query);
        this.showNotification(`Поиск: ${query}`, 'info');
        
        // Здесь можно добавить реальную логику поиска
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', async () => {
    const app = new KnowerLifeApp();
    await app.initialize();
    
    // Глобальная ссылка для отладки
    window.knowerApp = app;
});
