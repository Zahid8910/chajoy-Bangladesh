const infoContent = {
  'Our Company': 'ChaJoy is a beverage-focused company that aims to bring refreshing drinks and an enjoyable experience to its customers. The company operates through its own branches, providing customers with a comfortable place to enjoy their drinks as well as convenient takeaway service. ChaJoy focuses on creating a simple and welcoming experience where customers can explore a variety of beverages and enjoy them according to their preferences.With its branch-based service model, ChaJoy allows customers to order directly at their preferred location and receive their drinks fresh from the counter. The company also provides a casual environment suitable for individuals, friends, and groups looking for a place to enjoy refreshments together.',
  'About CHAJOY': 'ChaJoy is a drink and refreshment destination offering customers a selection of beverages prepared and served at its branches. Customers can browse the available menu, choose their preferred drink, and place their order directly at the counter. ChaJoy also provides both dine-in and takeaway options, allowing customers to enjoy their drinks at the branch or take them with them.The brand focuses on making the ordering experience straightforward and convenient, with customers receiving their freshly prepared drinks directly from the branch. Whether visiting alone, meeting friends, or simply looking for a refreshing drink, customers can visit their nearest ChaJoy branch and enjoy the available menu.',
  'Customer Service': 'Our customer service team can help with menu questions, order details, branch information, and feedback. Please speak with the team at your nearest ChaJoy branch, and we will do our best to make your visit smooth and enjoyable.',
  'Contact Us': 'For questions, feedback, or branch assistance, please speak with the ChaJoy team at your nearest branch. We welcome your suggestions and will do our best to help with your visit.',
  'Culture and Values': 'ChaJoy values warmth, quality, teamwork, and respect. We aim to create welcoming spaces where every guest is treated thoughtfully, every drink is prepared with care, and team members can grow together.',
  'Belonging at CHAJOY': 'Belonging at ChaJoy means making room for everyone. We celebrate different backgrounds, perspectives, and experiences while building a friendly workplace and an inclusive experience for every customer.',
  'Job Openings': 'CHA Joy welcomes individuals who are passionate, responsible, and interested in building a career in the food and beverage industry. Available positions and recruitment opportunities may vary depending on the current requirements of the company. For the latest updates on job openings, vacancies, and recruitment announcements, join our official group below.',
  'Franchise Opportunities': 'ChaJoy is interested in hearing from people who would like to bring refreshing drinks and a welcoming customer experience to their community. For now, please share your name, preferred location, and business experience with the ChaJoy team at your nearest branch to ask about future franchise opportunities.',
  'Suppliers': 'ChaJoy works with reliable suppliers to support the quality and consistency of its drinks and ingredients. Supplier enquiries can be shared with the ChaJoy team at your nearest branch.',
  'Payment': 'ChaJoy currently accepts CASH PAYMENT ONLY. Customers can pay for their orders directly at the cash counter of their selected ChaJoy branch; card, bKash, Nagad, and other online payment options are not available.',
  'Order and Pick Up Options': 'Customers can browse the ChaJoy menu and place their drink orders at a branch. Since ChaJoy does not currently offer Foodpanda or other online delivery options, customers must collect their orders directly from the selected branch.'
};

const infoModal = document.getElementById('infoModal');
const infoModalTitle = document.getElementById('infoModalTitle');
const infoModalText = document.getElementById('infoModalText');
const infoModalLink = document.getElementById('infoModalLink');
const infoModalClose = document.getElementById('infoModalClose');

function closeInfoModal() {
  infoModal.classList.add('hidden');
}

document.querySelectorAll('.info-link').forEach(function (link) {
  link.addEventListener('click', function () {
    const infoTitle = link.dataset.infoTitle;
    infoModalTitle.textContent = infoTitle;
    infoModalText.textContent = infoContent[infoTitle];
    infoModalLink.classList.toggle('hidden', infoTitle !== 'Job Openings');
    infoModal.classList.remove('hidden');
  });
});

infoModalClose.addEventListener('click', closeInfoModal);

infoModal.addEventListener('click', function (event) {
  if (event.target === infoModal) {
    closeInfoModal();
  }
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && !infoModal.classList.contains('hidden')) {
    closeInfoModal();
  }
});