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

// Initialize active section on page load
document.addEventListener('DOMContentLoaded', () => {
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

// Copy to clipboard functionality
const copyToClipboard = text => {
	navigator.clipboard.writeText(text).then(() => {
		const btn = document.querySelector('.copy-btn');
		const originalText = btn.textContent;
		btn.textContent = 'Copied!';
		setTimeout(() => {
			btn.textContent = originalText;
		}, 2000);
	}).catch(err => {
		console.error('Failed to copy:', err);
	});
};

// Search functionality
const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = 'Search documentation...';
searchInput.className = 'search-input';
document.querySelector('.nav-links').prepend(searchInput);

searchInput.addEventListener('input', (e) => {
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