const authNavRole = sessionStorage.getItem('chajoyLoggedInRole');
const authNavUserIsLoggedIn = ['customer', 'employee', 'admin'].includes(authNavRole);
const signUpButton = document.querySelector('.sign_up');
let signOutButton = document.querySelector('.public-sign-out, .menu-sign-out, .nav-signout, #employeeSignOut');
const roleHomeLink = document.querySelector('[data-role-home]');
const publicNavbar = document.querySelector('.navbar');

function applyCustomerNavigation() {
  if (!publicNavbar || authNavRole !== 'customer') {
    return;
  }

  const publicHeader = publicNavbar.closest('.topbar');
  if (!publicHeader || !publicHeader.hasAttribute('data-customer-header')) {
    return;
  }

  publicHeader.className = 'topbar customer-header';
  publicHeader.innerHTML = `
    <img src="logo-b.png" alt="ChaJoy Bangladesh Logo" class="logo">
    <img src="written_logo.png" alt="ChaJoy Bangladesh Logo" class="written_logo">
    <h2 class="site_title">ChaJoy Bangladesh</h2>
    <nav class="navbar" aria-label="Main navigation">
      <a href="Home_login.html">Home</a>
      <a href="menu.html">Menu</a>
      <a href="branches.html" aria-current="page">Branches</a>
      <a href="about.html">About</a>
      <a href="reviews.html" onclick="alert('Reviews are not available yet, but they will be available soon.'); return false;">Reviews</a>
      <a href="contact.html">Contact</a>
    </nav>
    <button class="sign_out" id="customerSignOut" type="button">
      <img src="sign_out.png" alt="Sign out Icon" class="signout_icon">
      <span class="sign_out_text">Sign Out</span>
    </button>
    <button class="order" type="button" onclick="window.location.href='menu.html'">
      <img src="order.png" alt="Order Icon" class="order_icon">
      <span class="order_text">Start an Order</span>
    </button>
    <button class="edit_profile" type="button" onclick="window.location.href='edit_profile.html'">
      <img src="edit_profile.png" alt="Open profile" class="edit_icon">
    </button>
  `;
}

function applyEmployeeNavigation() {
  if (!publicNavbar || authNavRole !== 'employee') {
    return;
  }

  const publicHeader = publicNavbar.closest('.topbar');
  if (publicHeader) {
    publicHeader.className = 'employee-header';
    publicHeader.innerHTML = `
      <a class="brand" href="employee.html">
        <img src="logo-b.png" alt="ChaJoy Bangladesh Logo" class="employee-logo">
        <span class="employee-site-title">ChaJoy Bangladesh</span>
        <span class="employee-role-label">Employee Desk</span>
      </a>
      <nav class="employee-nav" aria-label="Employee navigation">
        <a href="employee.html">Dashboard</a>
        <a href="employee-status.html">Status</a>
        <a href="menu.html">Menu</a>
        <a href="branches.html">Branches</a>
        <a href="employee-about.html">About</a>
        <a href="employee-reviews.html" onclick="alert('Reviews are not available yet, but they will be available soon.'); return false;">Reviews</a>
        <a href="employee-contact.html">Contact</a>
      </nav>
      <div class="employee-header-actions">
        <button type="button" id="employeeProfileButton" class="employee-profile-button">
          <img src="edit_profile.png" alt="Profile icon" class="employee-profile-icon">
          <span>Profile</span>
        </button>
        <button type="button" id="employeeSignOut" class="sign-out">
          <img src="sign_out.png" alt="" class="employee-sign-out-icon">
          <span>Sign out</span>
        </button>
      </div>
    `;
    const employeeNavigation = publicHeader.querySelector('.employee-nav');
    employeeNavigation.classList.add('employee-navigation');
  }
}

if (authNavUserIsLoggedIn) {
  if (authNavRole === 'employee') {
    applyEmployeeNavigation();
    signOutButton = document.getElementById('employeeSignOut');
  } else if (authNavRole === 'customer') {
    applyCustomerNavigation();
    signOutButton = document.getElementById('customerSignOut') || signOutButton;
  }
  if (signUpButton) {
    signUpButton.hidden = true;
  }
  if (signOutButton) {
    signOutButton.hidden = false;
    if (signOutButton.classList.contains('nav-signout')) {
      signOutButton.textContent = 'Sign out';
      signOutButton.removeAttribute('onclick');
    }
    signOutButton.addEventListener('click', function () {
      sessionStorage.removeItem('chajoyLoggedInRole');
      window.location.href = 'home.html';
    });
  }
  if (roleHomeLink) {
    if (authNavRole === 'admin') {
      roleHomeLink.href = 'public/admin.php?action=admin';
    } else if (authNavRole === 'employee') {
      roleHomeLink.href = 'employee-status.html';
    } else {
      roleHomeLink.href = 'Home_login.html';
    }
    if (authNavRole !== 'employee') {
      applyEmployeeNavigation();
    }
  }
}
