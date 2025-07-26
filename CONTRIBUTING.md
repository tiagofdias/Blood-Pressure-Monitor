# Contributing to Blood Pressure Monitor App

Thank you for your interest in contributing to the Blood Pressure Monitor App! This document provides guidelines and information for contributors.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our code of conduct:
- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a welcoming environment
- Report any unacceptable behavior

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- pnpm (recommended) or npm
- Git
- Basic knowledge of Next.js, TypeScript, and React

### Development Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/bp-monitor-app.git`
3. Install dependencies: `pnpm install`
4. Set up environment variables (copy `.env.example` to `.env`)
5. Initialize database: `pnpm run db:generate && pnpm run db:push`
6. Start development server: `pnpm run dev`

## 📋 How to Contribute

### Reporting Bugs
1. Check existing issues to avoid duplicates
2. Use the bug report template
3. Include:
   - Clear description of the issue
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, browser, Node.js version)
   - Screenshots if applicable

### Suggesting Features
1. Check existing feature requests
2. Use the feature request template
3. Explain:
   - The problem you're solving
   - Your proposed solution
   - Alternative solutions considered
   - Additional context

### Pull Requests

#### Before You Start
1. Create an issue to discuss major changes
2. Check if someone else is already working on it
3. Fork the repository and create a feature branch

#### Making Changes
1. **Branch naming**: Use descriptive names like `feature/excel-export-enhancement` or `fix/chart-rendering-bug`
2. **Commits**: Use conventional commit messages:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `style:` for formatting changes
   - `refactor:` for code refactoring
   - `test:` for adding tests
   - `chore:` for maintenance tasks

#### Code Standards
- **TypeScript**: Use strict typing, avoid `any`
- **Formatting**: Code is auto-formatted with Prettier
- **Linting**: Follow ESLint rules
- **Testing**: Add tests for new features
- **Documentation**: Update relevant docs

#### Pull Request Process
1. **Update your branch**: Rebase on the latest main branch
2. **Test thoroughly**: Ensure all tests pass
3. **Update documentation**: Include any necessary doc updates
4. **Create PR**: Use the pull request template
5. **Review process**: Address any feedback promptly

## 🧪 Testing

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Test Requirements
- Write unit tests for utility functions
- Add integration tests for API endpoints
- Include component tests for complex UI
- Ensure >80% code coverage for new features

## 📁 Project Structure

```
bp-monitor-app/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   └── (routes)/          # Page routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature components
├── lib/                  # Utility functions
├── prisma/               # Database schema
├── public/               # Static assets
└── tests/                # Test files
```

## 🎯 Development Guidelines

### Database Changes
- Always create migrations for schema changes
- Test migrations on sample data
- Update seed files if necessary
- Document breaking changes

### API Development
- Follow RESTful conventions
- Implement proper error handling
- Add input validation
- Include rate limiting for public endpoints
- Document API changes

### UI/UX Guidelines
- Follow existing design patterns
- Ensure responsive design
- Test on multiple browsers
- Maintain accessibility standards (WCAG 2.1)
- Use semantic HTML

### Security Considerations
- Never commit secrets or API keys
- Validate all user inputs
- Use parameterized queries
- Follow OWASP guidelines
- Report security issues privately

## 🏷️ Release Process

### Versioning
We use Semantic Versioning (SemVer):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Migration scripts tested
- [ ] Security review completed
- [ ] Performance impact assessed

## 💡 Development Tips

### Local Development
- Use `pnpm run dev` for hot reloading
- Access Prisma Studio: `pnpm run db:studio`
- Check database: `pnpm run db:seed` for sample data

### Debugging
- Use browser dev tools for frontend issues
- Check server logs for API problems
- Use Prisma Studio for database inspection
- Enable debug mode: `DEBUG=* pnpm run dev`

### Performance
- Optimize database queries
- Minimize bundle size
- Use Next.js built-in optimizations
- Test with realistic data volumes

## 📞 Getting Help

- **Questions**: Open a discussion in the GitHub Discussions tab
- **Bugs**: Create an issue with the bug template
- **Security**: Email security issues privately
- **General**: Join our community chat (link in README)

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Annual contributor appreciation

Thank you for contributing to better health monitoring tools! 🩺❤️
