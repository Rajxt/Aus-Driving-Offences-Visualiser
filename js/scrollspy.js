document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.navtab a');
  const pill = document.querySelector('.pill');
  
  function initPill() {
      const activeTab = document.querySelector('.navtab a.active');
      if (activeTab && pill) {
       
          pill.style.opacity = '1';
          positionPill(activeTab);
      }
  }
  
  function positionPill(activeTab) {
      if (!activeTab || !pill) return;
      
      const navtab = document.querySelector('.navtab');
      const activeIndex = Array.from(navLinks).indexOf(activeTab);
      const totalTabs = navLinks.length;
 
      const tabWidth = navtab.offsetWidth / totalTabs;
      const leftPosition = activeIndex * tabWidth;
      
      
      pill.style.width = `${tabWidth - 16}px`;  
      pill.style.left = `${leftPosition + 8}px`;  
      
      console.log(`Moving pill to tab ${activeIndex}: left=${leftPosition + 8}px, width=${tabWidth - 16}px`);
  }
  
  navLinks.forEach((link, index) => {
      link.addEventListener('click', function(e) {
          e.preventDefault();  
          

          navLinks.forEach(l => l.classList.remove('active'));
          
          this.classList.add('active');

          positionPill(this);
          
         
          setTimeout(() => {
              if (this.href && !this.href.includes('#')) {
                  window.location.href = this.href;
              }
          }, 400);  
      });
  });
  
  
  window.addEventListener('resize', function() {
      setTimeout(() => {
          const activeTab = document.querySelector('.navtab a.active');
          if (activeTab) {
              positionPill(activeTab);
          }
      }, 100);  
  });
  
  
  setTimeout(initPill, 100); 
});