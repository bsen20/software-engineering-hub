# 🎓 Software Engineering Learning Hub

A comprehensive, interactive learning platform for mastering software engineering fundamentals. Built with modern web technologies and featuring a beautiful, responsive design.

## ✨ Features

- **📚 Comprehensive Content**: In-depth coverage of System Design and Low-Level Design
- **🌙 Dark/Light Mode**: Toggle between themes for comfortable reading
- **📱 Mobile Responsive**: Perfect experience on all devices
- **📊 Progress Tracking**: Track your learning progress with visual indicators
- **🔄 Auto-Refresh**: Content updates automatically when changes are detected
- **🎯 Interactive Navigation**: Smooth scrolling and topic-based navigation

## 🚀 Live Demo

[View Live Site](https://bsen20.github.io/software-engineering-hub/)

## 📖 Topics Covered

### 🧠 System Design Fundamentals
- Scalability principles and patterns
- Availability and fault tolerance
- Latency vs Throughput optimization
- CAP Theorem and distributed systems
- Load balancing strategies
- Caching mechanisms
- Rate limiting techniques
- Consistent hashing
- And much more...

### 🏗️ Low Level Design (LLD)
- Object-oriented design principles
- Design patterns and best practices
- System implementation details
- Code architecture and structure

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Variables, Flexbox, Grid
- **Features**: Local Storage, Intersection Observer API
- **Fonts**: Inter (Google Fonts)
- **Icons**: Unicode Emojis
- **Code Highlighting**: Prism.js

## 🏃‍♂️ Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/learning-hub.git
   cd learning-hub
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server:
   python -m http.server 8000
   # Then visit: http://localhost:8000
   ```

3. **Start learning!**
   - Select a topic from the dropdown or click on topic cards
   - Use the sidebar for navigation
   - Toggle dark mode for comfortable reading
   - Track your progress as you scroll

## 📁 Project Structure

```
production-2.0/
├── index.html          # Main HTML file
├── script.js           # JavaScript functionality
├── styles.css          # CSS styling and themes
├── content.json        # Learning content data
└── README.md          # This file
```

## 🎨 Customization

### Adding New Content
Edit `content.json` to add new topics or sections:

```json
{
  "topics": {
    "your-topic": {
      "title": "Your Topic Title",
      "description": "Topic description",
      "icon": "🔥",
      "difficulty": "intermediate",
      "estimatedTime": "2-3 hours",
      "tags": ["tag1", "tag2"],
      "sections": [...]
    }
  }
}
```

### Styling
- Modify CSS variables in `styles.css` for theme customization
- All colors, fonts, and spacing use CSS custom properties
- Responsive breakpoints: 768px (tablet), 480px (mobile)

## 🌟 Key Features Explained

### Theme System
- Automatic theme persistence using localStorage
- CSS custom properties for seamless switching
- Optimized for both light and dark environments

### Content Management
- JSON-based content system for easy updates
- Automatic content refresh detection
- Fallback content system for offline use

### Navigation
- Smooth scrolling with intersection observer
- Progress tracking with visual indicators
- Mobile-friendly sidebar with touch gestures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Content inspired by industry best practices
- Design influenced by modern learning platforms
- Built with ❤️ for the developer community

## 📞 Contact

- **GitHub**: [@bsen20](https://github.com/bsen20)
- **Email**: none@gmail.com
- **LinkedIn**: [Bibek Sen](https://linkedin.com/in/bsen20)

---

⭐ **Star this repository if you found it helpful!**

Built with 💻 and ☕ by [Bibek Sen]
