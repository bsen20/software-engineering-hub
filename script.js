class LearningHub {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.currentTopic = localStorage.getItem('currentTopic') || null;
        this.contentData = null;
        this.sections = [];
        this.lastModified = null;
        this.autoRefreshInterval = null;
        this.isUsingFileContent = false;
        this.init();
    }

    async init() {
        this.setupTheme();
        this.setupEventListeners();
        await this.loadContentData();
        this.renderWelcomeScreen();

        // Load last viewed topic if exists
        if (this.currentTopic) {
            this.loadTopic(this.currentTopic);
        }
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const darkModeBtn = document.getElementById('darkModeToggle');
        darkModeBtn.textContent = this.currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    }

    setupEventListeners() {
        // Topic selector
        document.getElementById('topicSelector').addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadTopic(e.target.value);
            } else {
                this.showWelcomeScreen();
            }
        });

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshContent();
        });

        // Dark mode toggle
        document.getElementById('darkModeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Mobile menu toggle
        document.getElementById('mobileMenuToggle').addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Close sidebar
        document.getElementById('closeSidebar').addEventListener('click', () => {
            this.closeMobileMenu();
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const mobileMenuBtn = document.getElementById('mobileMenuToggle');

            if (window.innerWidth <= 768 &&
                !sidebar.contains(e.target) &&
                !mobileMenuBtn.contains(e.target) &&
                sidebar.classList.contains('open')) {
                this.closeMobileMenu();
            }
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);

        const darkModeBtn = document.getElementById('darkModeToggle');
        darkModeBtn.textContent = this.currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
    }

    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('open');
    }

    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.remove('open');
    }

    async loadContentData() {
        try {
            // Try to fetch the JSON file first
            const response = await fetch('content.json?t=' + Date.now());
            if (response.ok) {
                this.contentData = await response.json();
                const lastModified = response.headers.get('last-modified') || new Date().toISOString();

                if (this.lastModified !== lastModified) {
                    this.lastModified = lastModified;
                    this.isUsingFileContent = true;
                    this.showSuccessMessage('✅ Content loaded from JSON file');
                    this.startAutoRefresh();
                } else {
                    console.log('Content unchanged, skipping update');
                    return;
                }
            } else {
                throw new Error('JSON file not found');
            }
        } catch (error) {
            console.warn('Could not load JSON file, using fallback:', error.message);
            this.contentData = this.getFallbackContent();
            this.isUsingFileContent = false;
            this.showWarningMessage('⚠️ Using fallback content - JSON file not accessible');
        }

        // Filter out DSA and Dynamic Programming sections for production
        this.filterContentForProduction();
        this.populateTopicSelector();
    }

    filterContentForProduction() {
        if (this.contentData && this.contentData.topics) {
            console.log('🔍 Topics before filtering:', Object.keys(this.contentData.topics));

            // Remove DSA and Dynamic Programming topics
            const excludedTopics = ['dsa-patterns', 'dynamic-programming'];

            excludedTopics.forEach(topicKey => {
                if (this.contentData.topics[topicKey]) {
                    delete this.contentData.topics[topicKey];
                    console.log(`✅ Filtered out topic: ${topicKey}`);
                }
            });

            console.log('🎯 Topics after filtering:', Object.keys(this.contentData.topics));

            // Also clear current topic if it was one of the excluded ones
            if (excludedTopics.includes(this.currentTopic)) {
                this.currentTopic = null;
                localStorage.removeItem('currentTopic');
                console.log('🧹 Cleared excluded topic from localStorage');
            }
        }
    }

    async refreshContent() {
        const refreshBtn = document.getElementById('refreshBtn');
        const originalText = refreshBtn.textContent;

        refreshBtn.textContent = '🔄 Refreshing...';
        refreshBtn.disabled = true;

        try {
            await this.loadContentData();
            this.renderWelcomeScreen();

            // Reload current topic if one is selected
            if (this.currentTopic) {
                this.loadTopic(this.currentTopic);
            }
        } finally {
            refreshBtn.textContent = originalText;
            refreshBtn.disabled = false;
        }
    }

    startAutoRefresh() {
        if (this.isUsingFileContent && !this.autoRefreshInterval) {
            this.autoRefreshInterval = setInterval(() => {
                this.loadContentData();
            }, 10000); // Check every 10 seconds
            console.log('Auto-refresh started - checking for JSON changes every 10 seconds');
        }
    }

    populateTopicSelector() {
        const selector = document.getElementById('topicSelector');
        selector.innerHTML = '<option value="">Select Topic...</option>';

        if (this.contentData && this.contentData.topics) {
            Object.keys(this.contentData.topics).forEach(topicKey => {
                const topic = this.contentData.topics[topicKey];
                const option = document.createElement('option');
                option.value = topicKey;
                option.textContent = `${topic.icon} ${topic.title}`;
                selector.appendChild(option);
            });
        }
    }

    renderWelcomeScreen() {
        const topicsGrid = document.getElementById('topicsGrid');
        topicsGrid.innerHTML = '';

        if (this.contentData && this.contentData.topics) {
            Object.keys(this.contentData.topics).forEach(topicKey => {
                const topic = this.contentData.topics[topicKey];
                const topicCard = this.createTopicCard(topicKey, topic);
                topicsGrid.appendChild(topicCard);
            });
        }
    }

    createTopicCard(topicKey, topic) {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.onclick = () => this.loadTopic(topicKey);

        const difficultyClass = this.getDifficultyClass(topic.difficulty);

        card.innerHTML = `
            <div class="topic-card-header">
                <span class="topic-card-icon">${topic.icon}</span>
                <div class="topic-card-badges">
                    <span class="difficulty-badge ${difficultyClass}">${topic.difficulty}</span>
                </div>
            </div>
            <h3 class="topic-card-title">${topic.title}</h3>
            <p class="topic-card-description">${topic.description}</p>
            <div class="topic-card-meta">
                <span class="time-estimate">⏱️ ${topic.estimatedTime}</span>
                <span class="sections-count">📄 ${topic.sections.length} sections</span>
            </div>
            <div class="topic-card-tags">
                ${topic.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;

        return card;
    }

    getDifficultyClass(difficulty) {
        const difficultyMap = {
            'beginner': 'difficulty-beginner',
            'intermediate': 'difficulty-intermediate',
            'advanced': 'difficulty-advanced',
            'beginner-advanced': 'difficulty-mixed'
        };
        return difficultyMap[difficulty] || 'difficulty-intermediate';
    }

    loadTopic(topicKey) {
        if (!this.contentData || !this.contentData.topics[topicKey]) {
            this.showErrorMessage('❌ Topic not found');
            return;
        }

        this.currentTopic = topicKey;
        localStorage.setItem('currentTopic', topicKey);

        const topic = this.contentData.topics[topicKey];
        this.sections = topic.sections;

        // Update UI
        this.showTopicScreen();
        this.updateTopicSelector(topicKey);
        this.renderTopicHeader(topic);
        this.renderTopicSidebar(topic);
        this.renderTopicContent();
        this.setupScrollSpy();
        this.setupScrollTracking();
    }

    showWelcomeScreen() {
        document.getElementById('welcomeScreen').style.display = 'block';
        document.getElementById('topicContentScreen').style.display = 'none';
        document.getElementById('topicOverview').style.display = 'none';
        document.getElementById('sidebarFooter').style.display = 'none';
        document.getElementById('sidebarTitle').textContent = '📚 Select a Topic';
        document.getElementById('tableOfContents').innerHTML = '';
        document.getElementById('topicSelector').value = '';

        this.currentTopic = null;
        localStorage.removeItem('currentTopic');
    }

    showTopicScreen() {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('topicContentScreen').style.display = 'block';
        document.getElementById('topicOverview').style.display = 'block';
        document.getElementById('sidebarFooter').style.display = 'block';
    }

    updateTopicSelector(topicKey) {
        document.getElementById('topicSelector').value = topicKey;
    }

    renderTopicHeader(topic) {
        const contentHeader = document.getElementById('contentHeader');
        contentHeader.innerHTML = `
            <div class="topic-header-content">
                <div class="topic-header-main">
                    <span class="topic-header-icon">${topic.icon}</span>
                    <div>
                        <h1 class="topic-header-title">${topic.title}</h1>
                        <p class="topic-header-description">${topic.description}</p>
                    </div>
                </div>
                <div class="topic-header-meta">
                    <span class="difficulty-badge ${this.getDifficultyClass(topic.difficulty)}">${topic.difficulty}</span>
                    <span class="time-estimate">⏱️ ${topic.estimatedTime}</span>
                </div>
            </div>
        `;
    }

    renderTopicSidebar(topic) {
        // Update sidebar title
        document.getElementById('sidebarTitle').textContent = `📚 ${topic.title}`;

        // Update topic overview
        document.getElementById('difficultyBadge').textContent = topic.difficulty;
        document.getElementById('difficultyBadge').className = `difficulty-badge ${this.getDifficultyClass(topic.difficulty)}`;
        document.getElementById('timeEstimate').textContent = `⏱️ ${topic.estimatedTime}`;
        document.getElementById('topicDescription').textContent = topic.description;

        const tagsContainer = document.getElementById('topicTags');
        tagsContainer.innerHTML = topic.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        // Render table of contents
        this.renderTableOfContents();
    }

    renderTableOfContents() {
        const tocList = document.getElementById('tableOfContents');
        tocList.innerHTML = '';

        this.sections.forEach((section, index) => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `#${section.id}`;
            a.innerHTML = `<span class="toc-number">${section.number}</span> ${section.title}`;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToSection(section.id);
                this.closeMobileMenu();
            });

            li.appendChild(a);
            tocList.appendChild(li);
        });
    }

    renderTopicContent() {
        const contentWrapper = document.getElementById('contentWrapper');
        contentWrapper.innerHTML = '';

        this.sections.forEach((section, index) => {
            const sectionElement = this.createSectionElement(section, index);
            contentWrapper.appendChild(sectionElement);
        });

        // Highlight code blocks with Prism.js
        if (typeof Prism !== 'undefined') {
            Prism.highlightAll();
        }
    }

    createSectionElement(section, index) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'topic-section';
        sectionDiv.id = section.id;

        const headerDiv = document.createElement('div');
        headerDiv.className = 'section-header';

        const iconSpan = document.createElement('span');
        iconSpan.className = 'section-icon';
        iconSpan.textContent = section.icon;

        const titleH2 = document.createElement('h2');
        titleH2.className = 'section-title';
        titleH2.textContent = `${section.number}. ${section.title}`;

        headerDiv.appendChild(iconSpan);
        headerDiv.appendChild(titleH2);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'section-content';
        contentDiv.innerHTML = this.formatContent(section.content);

        sectionDiv.appendChild(headerDiv);
        sectionDiv.appendChild(contentDiv);

        return sectionDiv;
    }

    formatContent(content) {
        let formatted = content;

        // Convert markdown-style formatting
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Convert emojis with colors
        formatted = formatted.replace(/✅/g, '<span class="emoji success">✅</span>');
        formatted = formatted.replace(/❌/g, '<span class="emoji error">❌</span>');
        formatted = formatted.replace(/⚠️/g, '<span class="emoji warning">⚠️</span>');
        formatted = formatted.replace(/🔍/g, '<span class="emoji info">🔍</span>');
        formatted = formatted.replace(/🔸/g, '<span class="emoji info">🔸</span>');
        formatted = formatted.replace(/🔹/g, '<span class="emoji info">🔹</span>');
        formatted = formatted.replace(/🔗/g, '<span class="emoji info">🔗</span>');
        formatted = formatted.replace(/🧪/g, '<span class="emoji warning">🧪</span>');

        // Convert headings
        formatted = formatted.replace(/^### (.*$)/gm, '<h4 class="content-h4">$1</h4>');
        formatted = formatted.replace(/^## (.*$)/gm, '<h3 class="content-h3">$1</h3>');

        // Convert code blocks (multi-line code between specific markers)
        formatted = this.convertCodeBlocks(formatted);

        // Convert inline code
        formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

        // Convert lists
        formatted = this.convertLists(formatted);

        // Convert tables
        formatted = this.convertTables(formatted);

        // Convert example boxes
        formatted = this.convertExampleBoxes(formatted);

        // Convert practice links
        formatted = this.convertPracticeLinks(formatted);

        // Convert paragraphs
        formatted = this.convertParagraphs(formatted);

        return formatted;
    }

    convertCodeBlocks(content) {
        let formatted = content;

        // Find code sections marked with [CODE_START] and [CODE_END] by Python
        // Try multiple patterns to catch different variations
        console.log('Processing content for code blocks...');

        // Pattern 1: Basic pattern
        formatted = formatted.replace(/\[CODE_START\]([\s\S]*?)\[CODE_END\]/g, (match, code) => {
            console.log('Found code block (Pattern 1):', match.substring(0, 100) + '...');
            const trimmedCode = code.trim();
            if (trimmedCode.length > 10) {
                const escapedCode = this.escapeHtml(trimmedCode);
                return `<div class="java-code-block">
    <div class="code-header">
        <div class="code-tabs">
            <div class="code-tab java active">Java</div>
        </div>
    </div>
    <pre><code>${escapedCode}</code></pre>
</div>

`;
            }
            return match;
        });

        // Pattern 2: With optional whitespace
        formatted = formatted.replace(/\[CODE_START\]\s*([\s\S]*?)\s*\[CODE_END\]/g, (match, code) => {
            console.log('Found code block (Pattern 2):', match.substring(0, 100) + '...');
            const trimmedCode = code.trim();
            if (trimmedCode.length > 10) {
                const escapedCode = this.escapeHtml(trimmedCode);
                return `<div class="java-code-block">
    <div class="code-header">
        <div class="code-tabs">
            <div class="code-tab java active">Java</div>
        </div>
    </div>
    <pre><code>${escapedCode}</code></pre>
</div>

`;
            }
            return match;
        });

        // Pattern 3: With newlines
        formatted = formatted.replace(/\[CODE_START\]\n([\s\S]*?)\n\[CODE_END\]/g, (match, code) => {
            console.log('Found code block (Pattern 3):', match.substring(0, 100) + '...');
            const trimmedCode = code.trim();
            if (trimmedCode.length > 10) {
                const escapedCode = this.escapeHtml(trimmedCode);
                return `<div class="java-code-block">
    <div class="code-header">
        <div class="code-tabs">
            <div class="code-tab java active">Java</div>
        </div>
    </div>
    <pre><code>${escapedCode}</code></pre>
</div>

`;
            }
            return match;
        });

        // Pattern 4: Very flexible - any characters between markers
        formatted = formatted.replace(/\[CODE_START\][^]*?\[CODE_END\]/g, (match) => {
            console.log('Found code block (Pattern 4):', match.substring(0, 100) + '...');
            // Extract code between markers
            const codeMatch = match.match(/\[CODE_START\]([\s\S]*?)\[CODE_END\]/);
            if (codeMatch) {
                const code = codeMatch[1].trim();
                if (code.length > 10) {
                    const escapedCode = this.escapeHtml(code);
                    return `<div class="java-code-block">
    <div class="code-header">
        <div class="code-tabs">
            <div class="code-tab java active">Java</div>
        </div>
    </div>
    <pre><code>${escapedCode}</code></pre>
</div>

`;
                }
            }
            return match;
        });

        return formatted;
    }

    addBasicJavaSyntaxHighlighting(code) {
        let highlighted = this.escapeHtml(code);

        // Java keywords
        const keywords = ['public', 'private', 'protected', 'static', 'final', 'class', 'interface', 'extends', 'implements',
            'void', 'int', 'String', 'boolean', 'char', 'double', 'float', 'long', 'short', 'byte',
            'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue',
            'return', 'new', 'this', 'super', 'null', 'true', 'false', 'try', 'catch', 'finally',
            'throw', 'throws', 'import', 'package', 'abstract', 'synchronized', 'volatile'];

        // Highlight comments
        highlighted = highlighted.replace(/\/\/.*$/gm, '<span class="comment">$&</span>');
        highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>');

        // Highlight strings
        highlighted = highlighted.replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="string">"$1"</span>');
        highlighted = highlighted.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '<span class="string">\'$1\'</span>');

        // Highlight numbers
        highlighted = highlighted.replace(/\b\d+\.?\d*[fFdDlL]?\b/g, '<span class="number">$&</span>');

        // Highlight keywords
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="keyword">${keyword}</span>`);
        });

        // Highlight class names (capitalized words)
        highlighted = highlighted.replace(/\b[A-Z][a-zA-Z0-9_]*\b/g, '<span class="class-name">$&</span>');

        // Highlight method calls
        highlighted = highlighted.replace(/\b([a-z][a-zA-Z0-9_]*)\s*\(/g, '<span class="method">$1</span>(');

        return highlighted;
    }

    convertPracticeLinks(content) {
        // Convert practice problem links
        return content.replace(/🔗 Practice:\s*\n([\s\S]*?)(?=\n\n|\n🔸|\n🔹|\n✅|$)/g, (match, links) => {
            const linkLines = links.split('\n').filter(line => line.trim());
            const formattedLinks = linkLines.map(line => {
                const trimmed = line.trim().replace(/^\*\s*/, '');
                if (trimmed.includes('Leetcode') || trimmed.includes('GFG')) {
                    return `<li class="practice-link">🎯 ${trimmed}</li>`;
                }
                return `<li class="practice-link">${trimmed}</li>`;
            }).join('');

            return `<div class="practice-section">
                        <h4 class="practice-title">🔗 Practice Problems:</h4>
                        <ul class="practice-list">${formattedLinks}</ul>
                    </div>\n\n`;
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    convertLists(content) {
        const lines = content.split('\n');
        let result = [];
        let inList = false;
        let listType = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            const isUnorderedItem = /^[-•*]\s/.test(trimmed);
            const isOrderedItem = /^\d+\.\s/.test(trimmed);

            if (isUnorderedItem || isOrderedItem) {
                if (!inList) {
                    listType = isUnorderedItem ? 'ul' : 'ol';
                    result.push(`<${listType} class="content-list">`);
                    inList = true;
                }

                const itemContent = trimmed.replace(/^[-•*]\s/, '').replace(/^\d+\.\s/, '');
                result.push(`<li>${itemContent}</li>`);
            } else {
                if (inList) {
                    result.push(`</${listType}>`);
                    inList = false;
                    listType = null;
                }
                result.push(line);
            }
        });

        if (inList) {
            result.push(`</${listType}>`);
        }

        return result.join('\n');
    }

    convertTables(content) {
        return content.replace(/(\|.+\|\n)+/g, (match) => {
            const rows = match.trim().split('\n');
            let tableHTML = '<div class="table-container"><table class="content-table">';

            rows.forEach((row, index) => {
                const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
                if (cells.length === 0) return;

                const tag = index === 0 ? 'th' : 'td';
                tableHTML += '<tr>';
                cells.forEach(cell => {
                    tableHTML += `<${tag}>${cell}</${tag}>`;
                });
                tableHTML += '</tr>';
            });

            tableHTML += '</table></div>';
            return tableHTML;
        });
    }

    convertExampleBoxes(content) {
        return content.replace(/(🟢|🔵|🔴|🟡)\s+(.+?)(?=\n\n|\n🟢|\n🔵|\n🔴|\n🟡|$)/gs, (match, icon, content) => {
            const colorClass = {
                '🟢': 'success',
                '🔵': 'info',
                '🔴': 'error',
                '🟡': 'warning'
            }[icon];

            const lines = content.split('\n');
            const title = lines[0];
            const body = lines.slice(1).join('<br>');

            return `<div class="example-box ${colorClass}">
                        <div class="example-title">${icon} ${title}</div>
                        ${body ? `<div class="example-content">${body}</div>` : ''}
                    </div>`;
        });
    }

    convertParagraphs(content) {
        const lines = content.split('\n');
        let result = [];
        let currentParagraph = [];

        lines.forEach(line => {
            const trimmed = line.trim();

            if (trimmed === '') {
                if (currentParagraph.length > 0) {
                    const paragraphText = currentParagraph.join(' ').trim();
                    if (paragraphText && !paragraphText.startsWith('<')) {
                        result.push(`<p class="content-paragraph">${paragraphText}</p>`);
                    } else {
                        result.push(paragraphText);
                    }
                    currentParagraph = [];
                }
                result.push('');
            } else if (trimmed.startsWith('<') || trimmed.match(/^#+\s/) || trimmed.match(/^[-•*]\s/) || trimmed.match(/^\d+\.\s/)) {
                if (currentParagraph.length > 0) {
                    const paragraphText = currentParagraph.join(' ').trim();
                    result.push(`<p class="content-paragraph">${paragraphText}</p>`);
                    currentParagraph = [];
                }
                result.push(line);
            } else {
                currentParagraph.push(line);
            }
        });

        if (currentParagraph.length > 0) {
            const paragraphText = currentParagraph.join(' ').trim();
            if (paragraphText) {
                result.push(`<p class="content-paragraph">${paragraphText}</p>`);
            }
        }

        return result.join('\n');
    }

    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    setupScrollSpy() {
        const sections = document.querySelectorAll('.topic-section');
        const tocLinks = document.querySelectorAll('.toc-list a');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    tocLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, {
            rootMargin: '-20% 0px -80% 0px'
        });

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    setupScrollTracking() {
        let ticking = false;

        const updateProgress = () => {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = Math.round((scrollTop / docHeight) * 100);

            document.getElementById('readingProgress').textContent = `${scrollPercent}%`;
            document.getElementById('progressFill').style.width = `${scrollPercent}%`;

            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateProgress);
                ticking = true;
            }
        });
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showWarningMessage(message) {
        this.showNotification(message, 'warning');
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') notification.style.background = '#10b981';
        if (type === 'warning') notification.style.background = '#f59e0b';
        if (type === 'error') notification.style.background = '#ef4444';

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    getFallbackContent() {
        return {
            metadata: {
                version: "1.0.0",
                lastUpdated: "2025-01-20",
                description: "Fallback content when JSON file is not accessible"
            },
            topics: {
                "fallback": {
                    title: "Fallback Content",
                    description: "This is fallback content displayed when the JSON file cannot be loaded.",
                    icon: "⚠️",
                    difficulty: "beginner",
                    estimatedTime: "5 minutes",
                    tags: ["fallback", "error"],
                    sections: [
                        {
                            id: "fallback-section",
                            number: 1,
                            title: "JSON File Not Found",
                            icon: "⚠️",
                            content: "The content.json file could not be loaded. Please ensure the file exists and is accessible."
                        }
                    ]
                }
            }
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LearningHub();
});