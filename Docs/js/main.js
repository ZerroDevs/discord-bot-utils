// Add scroll progress indicator
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

// Update scroll progress
window.addEventListener('scroll', () => {
	const windowHeight = document.documentElement.clientHeight;
	const fullHeight = document.documentElement.scrollHeight;
	const scrolled = window.scrollY;
	const progress = scrolled / (fullHeight - windowHeight);
	progressBar.style.transform = `scaleX(${progress})`;
});

// Section visibility observer
const observerOptions = {
	root: null,
	rootMargin: '0px',
	threshold: 0.1
};

const sectionObserver = new IntersectionObserver((entries) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			entry.target.classList.add('visible');
		}
	});
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
	sectionObserver.observe(section);
});

// Update scroll spy functionality
function updateActiveSection() {
	const sections = document.querySelectorAll('section');
	const navLinks = document.querySelectorAll('.nav-links a');
	const sidebarLinks = document.querySelectorAll('.sidebar-item a');
	const scrollPosition = window.scrollY + 100;

	sections.forEach(section => {
		const sectionTop = section.offsetTop;
		const sectionHeight = section.clientHeight;
		const currentId = section.getAttribute('id');

		if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
			// Update nav links
			navLinks.forEach(link => {
				link.classList.remove('active');
				if (link.getAttribute('href') === `#${currentId}`) {
					link.classList.add('active');
				}
			});

			// Update sidebar links
			sidebarLinks.forEach(link => {
				link.classList.remove('active');
				if (link.getAttribute('href') === `#${currentId}`) {
					link.classList.add('active');
				}
			});
		}
	});
}

// Add scroll event listener
window.addEventListener('scroll', updateActiveSection);

// Enhanced smooth scroll for all anchor links including sidebar
document.querySelectorAll('a[href^="#"]').forEach(link => {
	link.addEventListener('click', e => {
		const targetId = link.getAttribute('href');
		if (targetId === '#') return;
		
		e.preventDefault();
		const target = document.querySelector(targetId);
		if (target) {
			const headerOffset = 80;
			const elementPosition = target.getBoundingClientRect().top;
			const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

			window.scrollTo({
				top: offsetPosition,
				behavior: 'smooth'
			});

			// Update URL without jumping
			history.pushState(null, null, targetId);
			
			// Update active states
			if (link.closest('.sidebar-item')) {
				document.querySelectorAll('.sidebar-item a').forEach(l => l.classList.remove('active'));
				link.classList.add('active');
			}
		}
	});
});

// Specific handling for sidebar links
document.querySelectorAll('.sidebar-item a').forEach(link => {
	link.addEventListener('click', (e) => {
		// Remove active class from all sidebar links
		document.querySelectorAll('.sidebar-item a').forEach(l => l.classList.remove('active'));
		// Add active class to clicked link
		link.classList.add('active');
	});
});

// Theme management
function setTheme(theme) {
	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem('theme', theme);
	
	const lightIcon = document.getElementById('light-icon');
	const darkIcon = document.getElementById('dark-icon');
	const themeToggle = document.getElementById('theme-toggle');
	
	if (theme === 'dark') {
		lightIcon.style.display = 'none';
		darkIcon.style.display = 'block';
		themeToggle.checked = true;
	} else {
		lightIcon.style.display = 'block';
		darkIcon.style.display = 'none';
		themeToggle.checked = false;
	}
}

// Initialize theme and active section on page load
document.addEventListener('DOMContentLoaded', () => {
	const savedTheme = localStorage.getItem('theme') || 'light';
	setTheme(savedTheme);

	// Theme toggle functionality
	const themeToggle = document.getElementById('theme-toggle');
	themeToggle.addEventListener('change', () => {
		setTheme(themeToggle.checked ? 'dark' : 'light');
	});

	updateActiveSection();
	
	// Handle initial hash in URL
	const hash = window.location.hash;
	if (hash) {
		const targetElement = document.querySelector(hash);
		if (targetElement) {
			setTimeout(() => {
				const headerOffset = 70;
				const elementPosition = targetElement.getBoundingClientRect().top;
				const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
				
				window.scrollTo({
					top: offsetPosition,
					behavior: 'smooth'
				});
			}, 100);
		}
	}

	// Code highlighting
	Prism.highlightAll();
});

// Mobile menu toggle
let mobileMenuVisible = false;
function toggleMobileMenu() {
	const sidebar = document.querySelector('.sidebar');
	mobileMenuVisible = !mobileMenuVisible;
	if (mobileMenuVisible) {
		sidebar.style.display = 'block';
	} else {
		sidebar.style.display = 'none';
	}
}

// Add mobile menu button if screen is small
if (window.innerWidth <= 768) {
	const nav = document.querySelector('nav');
	const menuBtn = document.createElement('button');
	menuBtn.className = 'mobile-menu-btn';
	menuBtn.innerHTML = '☰';
	menuBtn.onclick = toggleMobileMenu;
	nav.appendChild(menuBtn);
}

// Add notification div to body
document.body.insertAdjacentHTML('beforeend', '<div class="notification"></div>');
const notification = document.querySelector('.notification');

// Add copy buttons to all code blocks
document.querySelectorAll('.code-block').forEach(block => {
	const button = document.createElement('button');
	button.className = 'code-copy-btn';
	button.innerHTML = '<i class="fas fa-copy"></i>';
	
	button.addEventListener('click', async () => {
		const code = block.querySelector('code').textContent;
		try {
			await navigator.clipboard.writeText(code);
			showNotification('Code copied to clipboard!');
		} catch (err) {
			showNotification('Failed to copy code', true);
		}
	});
	
	block.appendChild(button);
});

// Notification function
function showNotification(message, isError = false) {
	notification.textContent = message;
	notification.style.backgroundColor = isError ? '#ff4444' : getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
	notification.classList.add('show');
	
	setTimeout(() => {
		notification.classList.remove('show');
	}, 2000);
}


// Installation box copy functionality
function copyToClipboard(text) {
	navigator.clipboard.writeText(text).then(() => {
		showNotification('Package install command copied to clipboard!');
	}).catch(err => {
		showNotification('Failed to copy command', true);
		console.error('Failed to copy:', err);
	});
}

// Search functionality
document.querySelector('.search-input').addEventListener('input', (e) => {
	const searchTerm = e.target.value.toLowerCase();
	const sections = document.querySelectorAll('section');
	
	sections.forEach(section => {
		const text = section.textContent.toLowerCase();
		if (text.includes(searchTerm)) {
			section.style.display = 'block';
		} else {
			section.style.display = 'none';
		}
	});
});
