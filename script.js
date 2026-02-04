// QuanticaOS Portfolio System
class QuanticaOS {
    constructor() {
        this.windows = new Map();
        this.activeWindow = null;
        this.nextZIndex = 1000;
        this.isDesktopReady = false;
        
        this.init();
    }

    async init() {
        await this.bootSequence();
        this.setupEventListeners();
        this.initializeDesktop();
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
        this.initializeEmailJS();
    }

    async bootSequence() {
        return new Promise((resolve) => {
            setTimeout(() => {
                document.getElementById('bootLoader').style.display = 'none';
                document.getElementById('desktop').style.display = 'block';
                this.isDesktopReady = true;
                resolve();
            }, 5500);
        });
    }

    setupEventListeners() {
        // Desktop icon clicks
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('click', () => {
                const appName = icon.dataset.app;
                this.openWindow(appName);
            });
        });

        // Start button click
        document.querySelector('.start-button').addEventListener('click', () => {
            this.showStartMenu();
        });

        // Global click handler for window management
        document.addEventListener('click', (e) => {
            const window = e.target.closest('.window');
            if (window) {
                this.bringToFront(window.id);
            }
        });

        // Prevent context menu
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    initializeDesktop() {
        // Auto-open terminal for demo
        setTimeout(() => {
            this.openWindow('terminal');
        }, 1000);
    }

    openWindow(appName) {
        if (this.windows.has(appName)) {
            const window = this.windows.get(appName);
            if (window.minimized) {
                this.restoreWindow(appName);
            } else {
                this.bringToFront(window.id);
            }
            return;
        }

        const windowId = `window-${appName}`;
        const windowData = this.createWindowData(appName, windowId);
        
        const windowElement = this.createWindowElement(windowData);
        document.getElementById('windowsContainer').appendChild(windowElement);
        
        this.windows.set(appName, {
            id: windowId,
            element: windowElement,
            minimized: false,
            maximized: false,
            originalBounds: null
        });

        this.setupWindowControls(windowElement, appName);
        this.makeWindowDraggable(windowElement);
        this.makeWindowResizable(windowElement);
        this.addToTaskbar(appName, windowId);
        this.bringToFront(windowId);
    }

    createWindowData(appName, windowId) {
        const windowConfigs = {
            about: {
                title: 'About Me',
                icon: 'fas fa-user-circle',
                width: 500,
                height: 600,
                content: this.getAboutContent()
            },
            projects: {
                title: 'Projects',
                icon: 'fas fa-code-branch',
                width: 800,
                height: 600,
                content: this.getProjectsContent()
            },
            skills: {
                title: 'Skills & Technologies',
                icon: 'fas fa-brain',
                width: 600,
                height: 500,
                content: this.getSkillsContent()
            },
            education: {
                title: 'Education',
                icon: 'fas fa-graduation-cap',
                width: 700,
                height: 600,
                content: this.getEducationContent()
            },
            certifications: {
                title: 'Certifications',
                icon: 'fas fa-certificate',
                width: 600,
                height: 500,
                content: this.getCertificationsContent()
            },
            contact: {
                title: 'Contact Me',
                icon: 'fas fa-envelope',
                width: 500,
                height: 500,
                content: this.getContactContent()
            },
            terminal: {
                title: 'QuanticaOS Terminal',
                icon: 'fas fa-terminal',
                width: 700,
                height: 400,
                content: this.getTerminalContent(),
                isTerminal: true
            }
        };

        return {
            id: windowId,
            ...windowConfigs[appName],
            x: Math.random() * 200 + 100,
            y: Math.random() * 100 + 50
        };
    }

    createWindowElement(windowData) {
        const windowElement = document.createElement('div');
        windowElement.className = `window ${windowData.isTerminal ? 'terminal-window' : ''}`;
        windowElement.id = windowData.id;
        windowElement.style.cssText = `
            left: ${windowData.x}px;
            top: ${windowData.y}px;
            width: ${windowData.width}px;
            height: ${windowData.height}px;
            z-index: ${this.nextZIndex++};
        `;

        windowElement.innerHTML = `
            <div class="window-header">
                <div class="window-title">
                    <i class="${windowData.icon}"></i>
                    ${windowData.title}
                </div>
                <div class="window-controls">
                    <div class="window-control close" data-action="close"></div>
                    <div class="window-control minimize" data-action="minimize"></div>
                    <div class="window-control maximize" data-action="maximize"></div>
                </div>
            </div>
            <div class="window-content">
                ${windowData.content}
            </div>
        `;

        return windowElement;
    }

    setupWindowControls(windowElement, appName) {
        const controls = windowElement.querySelectorAll('.window-control');
        controls.forEach(control => {
            control.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = control.dataset.action;
                
                switch (action) {
                    case 'close':
                        this.closeWindow(appName);
                        break;
                    case 'minimize':
                        this.minimizeWindow(appName);
                        break;
                    case 'maximize':
                        this.toggleMaximize(appName);
                        break;
                }
            });
        });

        // Double-click header to maximize
        const header = windowElement.querySelector('.window-header');
        header.addEventListener('dblclick', () => {
            this.toggleMaximize(appName);
        });
    }

    makeWindowDraggable(windowElement) {
        const header = windowElement.querySelector('.window-header');
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        header.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('window-control')) return;
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;

            if (e.target === header || e.target.parentNode === header) {
                isDragging = true;
                windowElement.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                e.preventDefault();
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;

                xOffset = currentX;
                yOffset = currentY;

                windowElement.style.left = currentX + 'px';
                windowElement.style.top = Math.max(0, currentY) + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            windowElement.style.cursor = 'default';
        });
    }

    makeWindowResizable(windowElement) {
        const resizers = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
        
        resizers.forEach(direction => {
            const resizer = document.createElement('div');
            resizer.className = `resizer resizer-${direction}`;
            resizer.style.cssText = `
                position: absolute;
                background: transparent;
                ${direction.includes('n') ? 'top: 0;' : ''}
                ${direction.includes('s') ? 'bottom: 0;' : ''}
                ${direction.includes('e') ? 'right: 0;' : ''}
                ${direction.includes('w') ? 'left: 0;' : ''}
                ${direction.length === 1 ? 
                    (direction === 'n' || direction === 's' ? 'width: 100%; height: 5px; cursor: ns-resize;' : 'height: 100%; width: 5px; cursor: ew-resize;') :
                    'width: 10px; height: 10px; cursor: ' + direction + '-resize;'
                }
            `;
            windowElement.appendChild(resizer);
            
            this.setupResizer(resizer, windowElement, direction);
        });
    }

    setupResizer(resizer, windowElement, direction) {
        let isResizing = false;
        let startX, startY, startWidth, startHeight, startLeft, startTop;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(document.defaultView.getComputedStyle(windowElement).width, 10);
            startHeight = parseInt(document.defaultView.getComputedStyle(windowElement).height, 10);
            startLeft = parseInt(document.defaultView.getComputedStyle(windowElement).left, 10);
            startTop = parseInt(document.defaultView.getComputedStyle(windowElement).top, 10);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (direction.includes('e')) {
                windowElement.style.width = Math.max(300, startWidth + dx) + 'px';
            }
            if (direction.includes('w')) {
                windowElement.style.width = Math.max(300, startWidth - dx) + 'px';
                windowElement.style.left = Math.min(startLeft + dx, startLeft + startWidth - 300) + 'px';
            }
            if (direction.includes('s')) {
                windowElement.style.height = Math.max(200, startHeight + dy) + 'px';
            }
            if (direction.includes('n')) {
                windowElement.style.height = Math.max(200, startHeight - dy) + 'px';
                windowElement.style.top = Math.max(0, Math.min(startTop + dy, startTop + startHeight - 200)) + 'px';
            }
        });

        document.addEventListener('mouseup', () => {
            isResizing = false;
        });
    }

    closeWindow(appName) {
        if (!this.windows.has(appName)) return;
        
        const windowData = this.windows.get(appName);
        windowData.element.remove();
        this.windows.delete(appName);
        this.removeFromTaskbar(appName);
        
        // Update active window
        if (this.activeWindow === windowData.id) {
            this.activeWindow = null;
        }
    }

    minimizeWindow(appName) {
        if (!this.windows.has(appName)) return;
        
        const windowData = this.windows.get(appName);
        windowData.element.classList.add('minimized');
        windowData.minimized = true;
        this.updateTaskbarApp(appName, false);
    }

    restoreWindow(appName) {
        if (!this.windows.has(appName)) return;
        
        const windowData = this.windows.get(appName);
        windowData.element.classList.remove('minimized');
        windowData.minimized = false;
        this.bringToFront(windowData.id);
        this.updateTaskbarApp(appName, true);
    }

    toggleMaximize(appName) {
        if (!this.windows.has(appName)) return;
        
        const windowData = this.windows.get(appName);
        const element = windowData.element;
        
        if (!windowData.maximized) {
            windowData.originalBounds = {
                left: element.style.left,
                top: element.style.top,
                width: element.style.width,
                height: element.style.height
            };
            element.classList.add('maximized');
            windowData.maximized = true;
        } else {
            element.classList.remove('maximized');
            element.style.left = windowData.originalBounds.left;
            element.style.top = windowData.originalBounds.top;
            element.style.width = windowData.originalBounds.width;
            element.style.height = windowData.originalBounds.height;
            windowData.maximized = false;
        }
    }

    bringToFront(windowId) {
        const windowElement = document.getElementById(windowId);
        if (windowElement) {
            windowElement.style.zIndex = this.nextZIndex++;
            this.activeWindow = windowId;
            
            // Update taskbar active states
            document.querySelectorAll('.taskbar-app').forEach(app => {
                app.classList.remove('active');
            });
            const taskbarApp = document.querySelector(`.taskbar-app[data-window="${windowId}"]`);
            if (taskbarApp) {
                taskbarApp.classList.add('active');
            }
        }
    }

    addToTaskbar(appName, windowId) {
        const taskbarApps = document.getElementById('taskbarApps');
        const taskbarApp = document.createElement('div');
        taskbarApp.className = 'taskbar-app active';
        taskbarApp.dataset.window = windowId;
        taskbarApp.dataset.app = appName;
        
        const windowData = this.windows.get(appName);
        const config = this.createWindowData(appName, windowId);
        
        taskbarApp.innerHTML = `
            <i class="${config.icon}"></i>
            <span>${config.title}</span>
        `;
        
        taskbarApp.addEventListener('click', () => {
            if (windowData.minimized) {
                this.restoreWindow(appName);
            } else {
                this.bringToFront(windowId);
            }
        });
        
        taskbarApps.appendChild(taskbarApp);
    }

    removeFromTaskbar(appName) {
        const taskbarApp = document.querySelector(`.taskbar-app[data-app="${appName}"]`);
        if (taskbarApp) {
            taskbarApp.remove();
        }
    }

    updateTaskbarApp(appName, isActive) {
        const taskbarApp = document.querySelector(`.taskbar-app[data-app="${appName}"]`);
        if (taskbarApp) {
            taskbarApp.classList.toggle('active', isActive);
        }
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateString = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
        document.getElementById('currentTime').textContent = `${timeString} ${dateString}`;
    }

    showStartMenu() {
        // Remove existing start menu if present
        const existingMenu = document.getElementById('startMenu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const startMenu = document.createElement('div');
        startMenu.id = 'startMenu';
        startMenu.className = 'start-menu';
        
        startMenu.innerHTML = `
            <div class="start-menu-header">
                <div class="user-info">
                    <div class="user-avatar">
                        <img src="saran.jpg" alt="Guru Saran Satsangi Peddinti" class="profile-img">
                    </div>
                    <div class="user-details">
                        <div class="user-name">Guru Saran Satsangi Peddinti</div>
                        <div class="user-status">Online</div>
                    </div>
                </div>
            </div>
            <div class="start-menu-apps">
                <div class="menu-section">
                    <div class="section-title">Applications</div>
                    <div class="app-item" data-app="about">
                        <i class="fas fa-user-circle"></i>
                        <span>About Me</span>
                    </div>
                    <div class="app-item" data-app="projects">
                        <i class="fas fa-code-branch"></i>
                        <span>Projects</span>
                    </div>
                    <div class="app-item" data-app="skills">
                        <i class="fas fa-brain"></i>
                        <span>Skills</span>
                    </div>
                    <div class="app-item" data-app="education">
                        <i class="fas fa-graduation-cap"></i>
                        <span>Education</span>
                    </div>
                    <div class="app-item" data-app="certifications">
                        <i class="fas fa-certificate"></i>
                        <span>Certifications</span>
                    </div>
                    <div class="app-item" data-app="contact">
                        <i class="fas fa-envelope"></i>
                        <span>Contact</span>
                    </div>
                    <div class="app-item" data-app="terminal">
                        <i class="fas fa-terminal"></i>
                        <span>Terminal</span>
                    </div>
                </div>
                <div class="menu-section">
                    <div class="section-title">System</div>
                    <div class="app-item" onclick="QuanticaOS.showSystemInfo()">
                        <i class="fas fa-info-circle"></i>
                        <span>System Info</span>
                    </div>
                    <div class="app-item" onclick="QuanticaOS.showSettings()">
                        <i class="fas fa-cog"></i>
                        <span>Settings</span>
                    </div>
                </div>
            </div>
            <div class="start-menu-footer">
                <div class="power-options">
                    <div class="power-item" onclick="QuanticaOS.restartSystem()">
                        <i class="fas fa-redo"></i>
                        <span>Restart</span>
                    </div>
                    <div class="power-item" onclick="QuanticaOS.shutdownSystem()">
                        <i class="fas fa-power-off"></i>
                        <span>Shutdown</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(startMenu);

        // Add event listeners for app items
        startMenu.querySelectorAll('.app-item[data-app]').forEach(item => {
            item.addEventListener('click', () => {
                const appName = item.dataset.app;
                this.openWindow(appName);
                startMenu.remove();
            });
        });

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.start-menu') && !e.target.closest('.start-button')) {
                    const menu = document.getElementById('startMenu');
                    if (menu) menu.remove();
                }
            }, { once: true });
        }, 100);
    }

    showSystemInfo() {
        const info = `QuanticaOS System Information
        
Version: 2.0.1
Build: 20250709
Architecture: x64
Total Memory: 16 GB
Available Memory: 8.4 GB
Processor: Intel Core i7-11700K
Graphics: NVIDIA GeForce RTX 3080
Storage: 1TB NVMe SSD
Network: Connected (WiFi)
        
Created by: Guru Saran Satsangi Peddinti 
Portfolio System: Active`;
        
        alert(info);
        const menu = document.getElementById('startMenu');
        if (menu) menu.remove();
    }

    showSettings() {
        alert('QuanticaOS Settings\n\nThis would open system settings in a real OS.\nFor now, all settings are optimized for portfolio viewing!');
        const menu = document.getElementById('startMenu');
        if (menu) menu.remove();
    }

    restartSystem() {
        if (confirm('Are you sure you want to restart QuanticaOS?')) {
            location.reload();
        }
        const menu = document.getElementById('startMenu');
        if (menu) menu.remove();
    }

    shutdownSystem() {
        if (confirm('Are you sure you want to shutdown QuanticaOS?')) {
            document.body.innerHTML = '<div style="background: #000; color: #fff; display: flex; justify-content: center; align-items: center; height: 100vh; font-family: monospace;">QuanticaOS has been shut down safely.<br><br>You can close this tab now.</div>';
        }
        const menu = document.getElementById('startMenu');
        if (menu) menu.remove();
    }

    // Content generators
    getAboutContent() {
        return `
            <div class="about-content">
                <div class="profile-image">
                    <img src="saran.jpg" alt="Guru Saran Satsangi Peddinti" class="profile-img">
                </div>
                <h2>Guru Saran Satsangi Peddinti</h2>
                <div class="about-text">
                    <p>Hi, I’m Guru Saran Satsangi Peddinti — a self-aware learner, tech enthusiast, and someone who believes in growing steadily, not instantly.</p>
                    
                    <p>I’m currently pursuing my Bachelor’s in Data Science and Applications from the Indian Institute of Technology Madras (BS Program), where I’m exploring how data, logic, and code can come together to solve meaningful problems.</p>
                    
                    <p>But behind that academic tag, I’m just someone who genuinely enjoys figuring things out — be it a bug in my Python code, a tricky SQL query, or a deep question in statistics. I don’t chase titles; I chase clarity. And I believe that slow learning is strong learning..</p>

                    <p> 🌱 My Core Belief : <p>

                    <p> "I don’t want to be the fastest.<p>
                     
                    <p>I want to be the one who understands deeply and builds mindfully.” <p>
                </div>
                <div class="resume-section">
                    <button class="resume-btn" onclick="QuanticaOS.openResume()">
                        <i class="fas fa-file-pdf"></i> My Resume
                    </button>
                </div>
                <div class="social-links">
                    <a href="https://github.com/GurusaranSP" class="social-link">
                        <i class="fab fa-github"></i> GitHub
                    </a>
                    <a href="https://www.linkedin.com/in/guru-saran-satsangi-peddinti-18728b32a/" class="social-link">
                        <i class="fab fa-linkedin"></i> LinkedIn
                    </a>

                </div>
            </div>
        `;
    }

    getProjectsContent() {
        return `
            <div class="projects-grid">
                <div class="project-card">
                    <div class="project-title">Pdf-Reader-Audiobook</div>
                    <div class="project-description">
                        This is a simple PDF text-to-speech reader application created using Pyttsx3 and PyPDF2 in Python. The application reads a specified PDF file and converts the text to speech..
                    </div>
                    <div class="project-tech">
                        <span class="tech-tag">Python</span>
                        <span class="tech-tag">Pyttsx3</span>
                        <span class="tech-tag">PyPDF2</span>
                    </div>
                    <div class="project-links">
                        <a href="https://github.com/GurusaranSP/Pdf-Reader-Audiobook" class="project-link">
                            <i class="fab fa-github"></i> GitHub
                        </a>
                    </div>
                </div>
                
                <div class="project-card">
                    <div class="project-title">Text Editor</div>
                    <div class="project-description">
                        This is a simple text editor created using Tkinter in Python. The editor provides basic functionalities like saving the text to a file and changing the font style.
                    </div>
                    <div class="project-tech">
                        <span class="tech-tag">PyTorch</span>
                        <span class="tech-tag">Tkinter</span>
                    </div>
                    <div class="project-links">
                        <a href="https://github.com/GurusaranSP/Text-Editor" class="project-link">
                            <i class="fab fa-github"></i> GitHub
                        </a>
                    </div>
                </div>
                
                <div class="project-card">
                    <div class="project-title">Web Browser</div>
                    <div class="project-description">
                        This is a simple web browser created using PyQt5 in Python. The browser provides basic functionalities like navigating backward, forward, reloading, and navigating to a home page. Additionally, it allows users to enter a URL and visit the corresponding webpage.
                    </div>
                    <div class="project-tech">
                        <span class="tech-tag">Python</span>
                        <span class="tech-tag">PyQt5</span>
                    </div>
                    <div class="project-links">
                        <a href="https://github.com/GurusaranSP/Web-Browser" class="project-link">
                            <i class="fab fa-github"></i> GitHub
                        </a>
                    </div>
                </div>
                

            </div>
        `;
    }

    getSkillsContent() {
        return `
            <div class="skills-categories">
                <div class="skill-category">
                    <h3>Programming Languages</h3>
                    <div class="skills-list">
                        <div class="skill-item">Python</div>
                        <div class="skill-item">SQL</div>
                        <div class="skill-item">Java</div>
                    </div>
                </div>
                
        `;
    }

    getEducationContent() {
        return `
            <div class="education-timeline">
                <div class="timeline-item">
                    <div class="timeline-date">2014 - 2016</div>
                    <div class="timeline-content">
                        <div class="degree-info">
                            <h3>Intermediate:</h3>
                            <div class="institution">SSP VOCATIONAL COLLEGE</div>
                            <div class="location">Vizianagaram, AP</div>
                            <div class="gpa">Percentage: 89%</div>
                        </div>
                        <div class="coursework">
                            <h4>Relevant Coursework:</h4>
                            <div class="courses-grid">
                                <span class="course-tag">Vocational in computer science</span>
                            </div>
                        </div>
                </div>
                
                <div class="timeline-item">
                    <div class="timeline-date">2017 - 2023</div>
                    <div class="timeline-content">
                        <div class="degree-info">
                            <h3>Diploma in Computer Science</h3>
                            <div class="institution">Sanketika Polytechnic College</div>
                            <div class="location">Visakhapatnam, AP</div>
                            <div class="gpa">Percentage: 70%</div>
                        </div>
                        <div class="coursework">
                            <h4>Relevant Coursework:</h4>
                            <div class="courses-grid">
                                <span class="course-tag">Java</span>
                                <span class="course-tag">DBMS</span>
                                <span class="course-tag">Operating Systems</span>
                                <span class="course-tag">C Programing</span>
                            </div>
                        </div>
                    </div>
                </div>
                                
                <div class="timeline-item">
                    <div class="timeline-date">Ongoing</div>
                    <div class="timeline-content">
                        <div class="degree-info">
                            <h3>BS in Data Science  and Applications</h3>
                            <div class="institution">Indian Institute of Technology Madras</div>
                        </div>
                        <div class="coursework">
                            <h4>Course Work:</h4>
                            <div class="courses-grid">
                                <span class="course-tag">Python</span>
                                <span class="course-tag">statistics</span>
                                <span class="course-tag">Mathematics</span>
                                <span class="course-tag">Computional thinking</span>
                                <span class="course-tag">English</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getCertificationsContent() {
        return `
            <div class="certifications-list">
                <div class="certification-item">
                    <div class="cert-title">Diploma in Software Engineering</div>
                    <div class="cert-issuer">Datapro</div>
                    <div class="cert-date">September 2015</div>
                </div>
                
                <div class="certification-item">
                    <div class="cert-title">Microsoft Virtual Academy - Networking Fundamentals</div>
                    <div class="cert-issuer">Microsoft Virtual Academy</div>
                    <div class="cert-date">March 2017</div>
                </div>
                
                <div class="certification-item">
                    <div class="cert-title">Microsoft Virtual Academy - SQL Database Fundamentals</div>
                    <div class="cert-issuer">Microsoft Virtual Academy</div>
                    <div class="cert-date">March 2017</div>
                </div>
                
                <div class="certification-item">
                    <div class="cert-title">Python Programming Language</div>
                    <div class="cert-issuer">Eduhax Visakhapatnam</div>
                    <div class="cert-date">September 2021</div>
                </div>
                
                <div class="certification-item">
                    <div class="cert-title">Python Projects</div>
                    <div class="cert-issuer">Eduhax Visakhapatnam</div>
                    <div class="cert-date">October 2021</div>
                </div>
            </div>
        `;
    }

getContactContent() {
    return `
        <div class="contact-content">

            <form class="contact-form" onsubmit="QuanticaOS.sendEmail(event)">

                <div class="form-group">
                    <label for="contact-name">Name</label>
                    <input 
                        type="text" 
                        id="contact-name" 
                        name="name" 
                        placeholder="Your name"
                        required>
                </div>

                <div class="form-group">
                    <label for="contact-email">Email</label>
                    <input 
                        type="email" 
                        id="contact-email" 
                        name="email" 
                        placeholder="Your email address"
                        required>
                </div>

                <div class="form-group">
                    <label for="contact-subject">Subject</label>
                    <input 
                        type="text" 
                        id="contact-subject" 
                        name="subject" 
                        placeholder="Reason for reaching out"
                        required>
                </div>

                <div class="form-group">
                    <label for="contact-message">Message</label>
                    <textarea 
                        id="contact-message" 
                        name="message" 
                        rows="5"
                        placeholder="Write your message here..."
                        required></textarea>
                </div>

                <button type="submit" class="submit-btn">
                    <i class="fas fa-paper-plane"></i> Send Message
                </button>

            </form>

            <div class="contact-footer">
                <p>
                    <i class="fas fa-envelope"></i>
                    <span>saransatsangiguru@gmail.com</span>
                </p>
                <p>
                    <i class="fas fa-phone"></i>
                    <span>+91 9581756162</span>
                </p>
                <p>
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Jami, Vizianagaram, Andhra Pradesh, India</span>
                </p>
            </div>

        </div>
    `;
}


    getTerminalContent() {
        return `
            <div class="terminal-output" id="terminalOutput">Welcome to QuanticaOS Terminal v2.0.1
Type 'help' for available commands.

</div>
            <div class="terminal-input-line">
                <span class="terminal-prompt">user@QuanticaOS:~$</span>
                <input type="text" class="terminal-input" id="terminalInput" autocomplete="off" spellcheck="false">
                <span class="cursor"></span>
            </div>
        `;
    }

    handleContactSubmit(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;

        console.log('Form submitted with data:', { name, email, subject, message });

        if (name && email && subject && message) {
            // Show loading state
            const submitBtn = event.target;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            // Send email using EmailJS
            const templateParams = {
                from_name: name,
                from_email: email,
                subject: subject,
                message: message,
                to_name: 'Guru Saran Satsangi Peddinti'
            };

            console.log('Sending email with params:', templateParams);
            console.log('Using service_ydcpdd8 and template_aq5dvrd');

            emailjs.send('service_ydcpdd8', 'template_aq5dvrd', templateParams)
                .then((response) => {
                    console.log('SUCCESS!', response.status, response.text);
                    console.log('Full response:', response);
                    alert(`Thank you ${name}! Your message has been sent successfully. I'll get back to you soon at ${email}.`);
                    
                    // Clear form
                    document.getElementById('name').value = '';
                    document.getElementById('email').value = '';
                    document.getElementById('subject').value = '';
                    document.getElementById('message').value = '';
                })
                .catch((error) => {
                    console.error('FAILED...', error);
                    console.error('Error details:', error.text, error.status);
                    alert('Sorry, there was an error sending your message. Please check the console for details and try again.');
                })
                .finally(() => {
                    // Reset button state
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
        } else {
            alert('Please fill in all fields before submitting.');
        }
    }

    initializeEmailJS() {
        // Initialize EmailJS with your public key
        if (typeof emailjs !== 'undefined') {
            console.log('EmailJS library loaded successfully');
            emailjs.init('dvpHb8oTFVlbb7LBd');
            console.log('EmailJS initialized with public key: dvpHb8oTFVlbb7LBd');
        } else {
            console.error('EmailJS library not loaded!');
        }
    }

    openResume() {
        // You can replace 'resume.pdf' with the actual path to your resume file
        const resumeUrl = 'resume.pdf'; // Update this with your resume file path
        
        // Try to open the resume in a new tab/window
        window.open(resumeUrl, '_blank');
        
        // Alternative: If you want to show a message instead
        // alert('Resume will be available soon! You can contact me for the latest version.');
    }
}

// Terminal functionality
class Terminal {
    constructor() {
        this.commands = {
            help: () => this.showHelp(),
            about: () => this.openApp('about'),
            projects: () => this.openApp('projects'),
            skills: () => this.openApp('skills'),
            education: () => this.openApp('education'),
            certifications: () => this.openApp('certifications'),
            contact: () => this.openApp('contact'),
            clear: () => this.clear(),
            whoami: () => 'john.datascientist',
            date: () => new Date().toString(),
            pwd: () => '/home/user/QuanticaOS',
            ls: () => 'About.app  Projects.app  Skills.app  Education.app  Certifications.app  Contact.app',
            cat: (args) => this.catCommand(args),
            echo: (args) => args.join(' '),
            uptime: () => 'QuanticaOS has been running for ' + Math.floor(Math.random() * 24) + ' hours',
            ps: () => 'PID  NAME\n1    QuanticaOS\n2    WindowManager\n3    Terminal\n4    TaskBar',
            neofetch: () => this.neofetch()
        };
        
        this.setupTerminalInput();
    }

    setupTerminalInput() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.terminal-window')) {
                const terminalInput = document.getElementById('terminalInput');
                if (terminalInput) {
                    terminalInput.focus();
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            const terminalInput = document.getElementById('terminalInput');
            if (terminalInput && document.activeElement === terminalInput) {
                if (e.key === 'Enter') {
                    this.processCommand(terminalInput.value.trim());
                    terminalInput.value = '';
                }
            }
        });
    }

    processCommand(input) {
        const output = document.getElementById('terminalOutput');
        if (!output) return;

        // Add command to output
        output.textContent += `user@QuanticaOS:~$ ${input}\n`;

        const [command, ...args] = input.split(' ');
        
        if (this.commands[command]) {
            const result = this.commands[command](args);
            if (result) {
                output.textContent += result + '\n';
            }
        } else if (input.trim() === '') {
            // Empty command, just show prompt
        } else {
            output.textContent += `Command not found: ${command}\nType 'help' for available commands.\n`;
        }

        output.textContent += '\n';
        output.scrollTop = output.scrollHeight;
    }

    showHelp() {
        return `Available commands:
  help         - Show this help message
  about        - Open About Me window
  projects     - Open Projects window
  skills       - Open Skills window
  education    - Open Education window
  certifications - Open Certifications window
  contact      - Open Contact window
  clear        - Clear terminal screen
  whoami       - Display current user
  date         - Show current date and time
  pwd          - Print working directory
  ls           - List available applications
  cat [file]   - Display file contents
  echo [text]  - Echo text to terminal
  uptime       - Show system uptime
  ps           - Show running processes
  neofetch     - Display system information`;
    }

    openApp(appName) {
        if (window.QuanticaOS) {
            window.QuanticaOS.openWindow(appName);
            return `Opening ${appName} application...`;
        }
        return 'Error: Could not open application';
    }

    clear() {
        const output = document.getElementById('terminalOutput');
        if (output) {
            output.textContent = 'Welcome to QuanticaOS Terminal v2.0.1\nType \'help\' for available commands.\n\n';
        }
        return '';
    }

    catCommand(args) {
        if (args.length === 0) {
            return 'Usage: cat [filename]';
        }
        
        const file = args[0];
        const files = {
            'readme.txt': 'QuanticaOS Portfolio System\n\nWelcome to my interactive portfolio!\nThis system simulates a desktop OS environment.\n\nCreated by: Guru Saran Satsangi Peddinti \nVersion: 2.0.1',
            'skills.txt': 'Core Skills:\n- Machine Learning\n- Data Analysis\n- Python Programming\n- Statistical Modeling\n- Data Visualization',
            'projects.txt': 'Recent Projects:\n1. Customer Churn Prediction\n2. Sentiment Analysis API\n3. Stock Price Forecasting\n4. Computer Vision Object Detection'
        };
        
        return files[file] || `cat: ${file}: No such file or directory`;
    }

    neofetch() {
        return `                    QuanticaOS
                 ──────────────────────
OS: QuanticaOS v2.0.1
Host: Portfolio System
Kernel: JavaScript Engine
Uptime: ${Math.floor(Math.random() * 24)} hours
Packages: 247 (npm), 156 (pip)
Shell: QuanticaOS Terminal
Resolution: ${window.innerWidth}x${window.innerHeight}
Theme: Dark [Electric Blue]
CPU: Intel i7-11700K (8) @ 3.6GHz
Memory: 16384MB
`;
    }
}

// Initialize the system
document.addEventListener('DOMContentLoaded', () => {
    window.QuanticaOS = new QuanticaOS();
    window.terminal = new Terminal();
});

// Add some global utilities
window.addEventListener('resize', () => {
    // Handle responsive design adjustments
    if (window.innerWidth < 768) {
        document.body.classList.add('mobile');
    } else {
        document.body.classList.remove('mobile');
    }
});

// Prevent drag and drop on the page
document.addEventListener('dragover', (e) => e.preventDefault());
document.addEventListener('drop', (e) => e.preventDefault());
