// Update scroll spy functionality
function updateActiveSection() {
	const sections = document.querySelectorAll('section');
	const navLinks = document.querySelectorAll('.nav-links a');
	const sidebarLinks = document.querySelectorAll('.sidebar-item a');

	sections.forEach(section => {
		const sectionTop = section.offsetTop - 100;
		const sectionHeight = section.clientHeight;
		const scrollPosition = window.scrollY;

		if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
			const currentId = section.getAttribute('id');

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

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
	anchor.addEventListener('click', function (e) {
		e.preventDefault();
		const targetId = this.getAttribute('href').slice(1);
		const targetElement = document.getElementById(targetId);
		
		if (targetElement) {
			const headerOffset = 70;
			const elementPosition = targetElement.getBoundingClientRect().top;
			const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

			window.scrollTo({
				top: offsetPosition,
				behavior: 'smooth'
			});

			// Update URL without jumping
			history.pushState(null, null, `#${targetId}`);
		}
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
