/* ── Phone parallax ── */
(function () {
  const phone    = document.querySelector('.phone');
  const isMobile = window.innerWidth < 500;
  if (!phone || isMobile) return;

  function scrollPhone() {
    phone.style.transform = `translateY(${(window.scrollY / window.innerHeight) * -85}%)`;
  }

  // on vertical scroll, move .phone a % of the viewport height
  window.addEventListener('scroll', scrollPhone)
  scrollPhone();
}());
