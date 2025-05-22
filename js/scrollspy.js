const scrollspyLinks = document.querySelectorAll('#scrollspy-menu a');
const sections = document.querySelectorAll('.section-content');

document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.navtab a');
    const pill = document.querySelector('.pill');

    function initPill() {
      const activeTab = document.querySelector('.navtab a.active');
      positionPill(activeTab);
    }

    function positionPill(activeTab) {
      if (!activeTab || !pill) return;

      const tabRect = activeTab.getBoundingClientRect();
      const navRect = document.querySelector('.navtab').getBoundingClientRect();

      pill.style.width = `${tabRect.width}px`;
      pill.style.left = `${tabRect.left - navRect.left}px`;
    }

    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        // Allow default anchor behavior (page navigation)
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        positionPill(this);
      });
    });

    window.addEventListener('resize', function() {
      const activeTab = document.querySelector('.navtab a.active');
      positionPill(activeTab);
    });

    initPill();
  });

function highlightScrollspy() {
    let scrollPosition = window.scrollY + 100; // Offset for better highlighting
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            scrollspyLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}


scrollspyLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        window.scrollTo({
            top: targetSection.offsetTop - 80,
            behavior: 'smooth'
        });
        
        scrollspyLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

window.addEventListener('scroll', highlightScrollspy);
window.addEventListener('resize', initPill);

initPill();
highlightScrollspy(); 

