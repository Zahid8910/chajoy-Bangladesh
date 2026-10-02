const currentPage = window.location.pathname.split('/').pop().toLowerCase() || 'home.html';

document.querySelectorAll('.navbar a, .employee-nav a, .profile-nav a').forEach(function (link) {
  const linkPage = link.href.split('/').pop().split('?')[0].toLowerCase();
  if (linkPage === currentPage) {
    link.setAttribute('aria-current', 'page');
  }
});
