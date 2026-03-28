
  window.addEventListener('load', function() {
    const loader = document.getElementById('preloader');
    
    // Forces a 5-second delay so you can see it
    setTimeout(() => {
        loader.classList.add('loader-hidden');
    }, 2000); 
  });
