/**
 * JS của bản demo tĩnh (thay cho JS Next.js bị bỏ khi xuất): header thu gọn khi cuộn, menu mobile, ô tìm mobile, slider banner,
 * bộ ảnh sản phẩm, trang tìm kiếm chạy trên window.DEMO_PRODUCTS, form tư vấn / liên hệ mô phỏng gửi thành công.
 * Dùng bởi: scripts/export-demo-site.mjs chép thành assets/js/demo.js của thư mục demo.
 * Lưu ý: bám theo class / aria của component thật (Header, CategoryDrawer, HeroBanner, ProductGallery, ProductListing) — đổi markup
 * ở đó thì xuất lại demo và thử các phần này. Không dùng thư viện, chạy được cả khi mở bằng file://.
 */
(function () {
  var rootPrefix =
    document.documentElement.getAttribute("data-demo-root") || "./";
  var toastElement = null;
  var toastTimer = null;

  function showToast(message) {
    if (!toastElement) {
      toastElement = document.createElement("div");
      toastElement.setAttribute("role", "status");
      toastElement.style.cssText =
        "position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:9999;max-width:calc(100% - 32px);" +
        "padding:12px 18px;border-radius:12px;background:#0b3d2a;color:#fff;font:500 14px/1.45 system-ui,sans-serif;" +
        "box-shadow:0 12px 30px -12px rgba(0,0,0,.45);opacity:0;transition:opacity .25s;pointer-events:none";
      document.body.appendChild(toastElement);
    }
    toastElement.textContent = message;
    toastElement.style.opacity = "1";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastElement.style.opacity = "0";
    }, 3000);
  }

  function removeDiacritics(value) {
    return value
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setupUnresolvedLinks() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest && event.target.closest("a[href]");
      if (!link) return;
      var href = link.getAttribute("href");
      if (href.charAt(0) === "/" && href.charAt(1) !== "/") {
        event.preventDefault();
        showToast(
          "Trang này chỉ có trên website chính thức, bản demo chưa có.",
        );
      }
    });
  }

  function setupHeader() {
    var header = document.querySelector("header.sticky");
    if (!header) return;
    function updateScrolled() {
      if (window.scrollY > 8) header.setAttribute("data-scrolled", "");
      else header.removeAttribute("data-scrolled");
    }
    window.addEventListener("scroll", updateScrolled, { passive: true });
    updateScrolled();

    var drawer = document.getElementById("site-drawer");
    var openButton = document.querySelector('[aria-controls="site-drawer"]');
    if (drawer && openButton) {
      var setDrawerOpen = function (isOpen) {
        drawer.classList.toggle("hidden", !isOpen);
        drawer.classList.toggle("block", isOpen);
        openButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
        if (isOpen) header.setAttribute("data-open", "");
        else header.removeAttribute("data-open");
        document.body.style.overflow = isOpen ? "hidden" : "";
      };
      openButton.addEventListener("click", function () {
        setDrawerOpen(true);
      });
      drawer
        .querySelectorAll('[aria-label="Đóng menu"]')
        .forEach(function (button) {
          button.addEventListener("click", function () {
            setDrawerOpen(false);
          });
        });
      drawer.addEventListener("click", function (event) {
        if (event.target.closest("a[href]")) setDrawerOpen(false);
      });
      document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") setDrawerOpen(false);
      });
    }

    var searchButton = document.querySelector(
      '[aria-controls="mobile-search"]',
    );
    var drawerSearchForm =
      drawer && drawer.querySelector('form[role="search"]');
    if (searchButton && drawerSearchForm) {
      var searchPanel = null;
      var closeIcon =
        '<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
      var searchIcon = searchButton.innerHTML;
      searchButton.addEventListener("click", function () {
        if (searchPanel) {
          searchPanel.remove();
          searchPanel = null;
          searchButton.innerHTML = searchIcon;
          searchButton.setAttribute("aria-expanded", "false");
          return;
        }
        searchPanel = document.createElement("div");
        searchPanel.id = "mobile-search";
        searchPanel.className = "site-container hidden pb-3 max-[900px]:block";
        var form = drawerSearchForm.cloneNode(true);
        form.querySelectorAll("[id]").forEach(function (element) {
          element.id = element.id + "-mobile";
        });
        form.querySelectorAll("label[for]").forEach(function (label) {
          label.setAttribute("for", label.getAttribute("for") + "-mobile");
        });
        searchPanel.appendChild(form);
        var row = searchButton.closest(".site-container");
        row.parentNode.insertBefore(searchPanel, row.nextSibling);
        searchButton.innerHTML = closeIcon;
        searchButton.setAttribute("aria-expanded", "true");
        var input = form.querySelector('input[name="q"]');
        if (input) input.focus();
      });
    }
  }

  function setupHeroCarousels() {
    document
      .querySelectorAll('section[aria-roledescription="carousel"]')
      .forEach(function (carousel) {
        var frame = carousel.querySelector(".overflow-hidden.rounded-lg");
        if (!frame) return;
        var slides = Array.prototype.filter.call(
          frame.children,
          function (child) {
            return child.classList.contains("transition-opacity");
          },
        );
        if (slides.length < 2) return;
        var dotGroup = frame.querySelector('[role="group"]');
        var dots = dotGroup
          ? Array.prototype.slice.call(dotGroup.querySelectorAll("button"))
          : [];
        var arrows = Array.prototype.filter.call(
          frame.querySelectorAll("button"),
          function (button) {
            return !dotGroup || !dotGroup.contains(button);
          },
        );
        var currentIndex = 0;
        var timer = null;
        var isPaused = false;

        function schedule() {
          clearTimeout(timer);
          if (!isPaused) {
            timer = setTimeout(function () {
              showSlide(currentIndex + 1);
            }, 6000);
          }
        }

        function showSlide(nextIndex) {
          currentIndex = (nextIndex + slides.length) % slides.length;
          slides.forEach(function (slide, index) {
            var isActive = index === currentIndex;
            slide.classList.toggle("z-1", isActive);
            slide.classList.toggle("opacity-100", isActive);
            slide.classList.toggle("opacity-0", !isActive);
            slide.classList.toggle("pointer-events-none", !isActive);
            slide.setAttribute("aria-hidden", isActive ? "false" : "true");
          });
          dots.forEach(function (dot, index) {
            var isActive = index === currentIndex;
            dot.classList.toggle("w-8", isActive);
            dot.classList.toggle("bg-gold-400", isActive);
            dot.classList.toggle("w-2.5", !isActive);
            dot.classList.toggle("bg-light/60", !isActive);
            if (isActive) dot.setAttribute("aria-current", "true");
            else dot.removeAttribute("aria-current");
          });
          schedule();
        }

        if (arrows[0])
          arrows[0].addEventListener("click", function () {
            showSlide(currentIndex - 1);
          });
        if (arrows[1])
          arrows[1].addEventListener("click", function () {
            showSlide(currentIndex + 1);
          });
        dots.forEach(function (dot, index) {
          dot.addEventListener("click", function () {
            showSlide(index);
          });
        });
        carousel.addEventListener("mouseenter", function () {
          isPaused = true;
          clearTimeout(timer);
        });
        carousel.addEventListener("mouseleave", function () {
          isPaused = false;
          schedule();
        });
        schedule();
      });
  }

  function setupProductGallery() {
    var thumbButtons = Array.prototype.slice.call(
      document.querySelectorAll('button[aria-label^="Xem ảnh"]'),
    );
    if (thumbButtons.length < 2) return;
    var stage = thumbButtons[0]
      .closest(".flex.flex-col")
      .querySelector(".relative.aspect-square");
    var mainImage = stage && stage.querySelector("img");
    if (!mainImage) return;
    var baseAlt = mainImage.getAttribute("alt").replace(/ — ảnh \d+$/, "");
    var currentIndex = 0;

    function showImage(nextIndex) {
      currentIndex = (nextIndex + thumbButtons.length) % thumbButtons.length;
      var thumbImage = thumbButtons[currentIndex].querySelector("img");
      mainImage.setAttribute("src", thumbImage.getAttribute("src"));
      mainImage.setAttribute("alt", baseAlt + " — ảnh " + (currentIndex + 1));
      thumbButtons.forEach(function (button, index) {
        var isActive = index === currentIndex;
        button.classList.toggle("border-navy-700", isActive);
        button.classList.toggle("border-line", !isActive);
        button.classList.toggle("hover:border-navy-600", !isActive);
        if (isActive) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
      });
    }

    thumbButtons.forEach(function (button, index) {
      button.addEventListener("click", function () {
        showImage(index);
      });
    });
    var arrows = stage.querySelectorAll("button");
    if (arrows[0])
      arrows[0].addEventListener("click", function () {
        showImage(currentIndex - 1);
      });
    if (arrows[1])
      arrows[1].addEventListener("click", function () {
        showImage(currentIndex + 1);
      });
  }

  function setupForms() {
    document.querySelectorAll("form").forEach(function (form) {
      if (form.getAttribute("role") === "search") return;
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (typeof form.reportValidity === "function" && !form.reportValidity())
          return;
        form.reset();
        showToast(
          "Cảm ơn bạn! Đây là bản demo nên yêu cầu chưa được gửi đi — website chính thức sẽ gọi lại cho bạn.",
        );
      });
    });
  }

  function renderSearchPage() {
    if (!document.documentElement.hasAttribute("data-demo-search-page")) return;
    var query = (
      new URLSearchParams(window.location.search).get("q") || ""
    ).trim();
    var products = window.DEMO_PRODUCTS || [];
    var words = removeDiacritics(query)
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);
    var matches = products.filter(function (product) {
      return words.every(function (word) {
        return product.text.indexOf(word) !== -1;
      });
    });

    document.querySelectorAll('input[name="q"]').forEach(function (input) {
      input.value = query;
    });
    document.title =
      (query ? "Tìm kiếm: " + query : "Tìm kiếm sản phẩm") + " — Xe Điện Xanh";
    document
      .querySelectorAll(
        'nav[aria-label="Sắp xếp"], nav[aria-label="Phân trang"]',
      )
      .forEach(function (nav) {
        nav.style.display = "none";
      });

    var heading = document.querySelector("main h1, h1");
    if (heading)
      heading.textContent = query
        ? "Kết quả tìm kiếm “" + query + "”"
        : "Tìm kiếm sản phẩm";

    var countLine = Array.prototype.find.call(
      document.querySelectorAll("p"),
      function (paragraph) {
        return (
          / sản phẩm/.test(paragraph.textContent) &&
          paragraph.querySelector("strong")
        );
      },
    );
    if (countLine) {
      countLine.innerHTML =
        '<strong class="text-ink">' +
        matches.length +
        "</strong> sản phẩm" +
        (query
          ? ' cho “<strong class="text-ink">' + escapeHtml(query) + "</strong>”"
          : "");
    }

    var firstCard = document.querySelector("article");
    var grid = firstCard && firstCard.closest("ul");
    if (!grid) return;
    var itemClassName = firstCard.parentElement.className;
    if (matches.length === 0) {
      grid.outerHTML =
        '<div class="rounded-lg border border-line bg-paper p-8 text-center">' +
        '<p class="m-0 mb-2 text-h4 font-semibold">Không tìm thấy sản phẩm phù hợp</p>' +
        '<p class="m-0 text-sm text-ink-faint">Thử từ khoá khác, ví dụ: xe đạp điện, VinFast, YAKA, pin…</p></div>';
      return;
    }
    grid.innerHTML = matches
      .map(function (product) {
        return (
          '<li class="' +
          itemClassName +
          '">' +
          product.cardHtml.split("{{ROOT}}").join(rootPrefix) +
          "</li>"
        );
      })
      .join("");
  }

  setupUnresolvedLinks();
  setupHeader();
  setupHeroCarousels();
  setupProductGallery();
  setupForms();
  renderSearchPage();
})();
