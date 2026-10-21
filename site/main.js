(function () {
  'use strict';

  var SHOP = { name: 'Áo Dài Như Quỳnh', phone: '0702110177' };
  var SVG_NS = 'http://www.w3.org/2000/svg';

  // Gallery content. Add `imgs: ['./images/cuoi-1.jpg', …]` to a category to show real photos
  // instead of the drawn áo; entries without an image fall back to the drawing.
  var CATS = [
    { id: 'cuoi', name: 'Áo cưới', tone: '#E6DDD0', alt: '#DCD2C4', n: 6, colors: ['#A3201E', '#C89B3C', '#8E1B3A', '#F4EDE2', '#B8322A', '#D4AF5A'] },
    { id: 'tt', name: 'Truyền thống', tone: '#E2D8CA', alt: '#D6CBBB', n: 6, colors: ['#1F3A5F', '#F4EDE2', '#2E5446', '#6B3E1E', '#5C2A4A', '#3B4A6B'] },
    { id: 'ct', name: 'Cách tân', tone: '#ECE4D8', alt: '#E0D6C8', n: 6, colors: ['#D8A7A0', '#9FB4A8', '#E3C9A8', '#B7A3C7', '#C98F84', '#8FA9B8'] },
    { id: 'nam', name: 'Áo nam', tone: '#DDD3C5', alt: '#D0C5B5', n: 4, colors: ['#1D1B22', '#6B3E1E', '#1F3A5F', '#2E5446'] }
  ];

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  // Small áo silhouette reusing the shapes defined in the story SVG's <defs>
  function drawnAo(color, strokeWidth) {
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('viewBox', '60 40 300 870');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    var back = document.createElementNS(SVG_NS, 'use');
    back.setAttribute('href', '#ad-back');
    back.setAttribute('fill', color);
    back.setAttribute('fill-opacity', '0.8');
    var front = document.createElementNS(SVG_NS, 'use');
    front.setAttribute('href', '#ad-front');
    front.setAttribute('fill', color);
    front.setAttribute('stroke', '#1E1A16');
    front.setAttribute('stroke-opacity', '0.35');
    front.setAttribute('stroke-width', String(strokeWidth));
    svg.append(back, front);
    return svg;
  }

  function picture(src, alt) {
    var img = el('img');
    img.src = src;
    img.alt = alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    return img;
  }

  /* ---------- Gallery ---------- */
  var dialog = document.querySelector('[data-gallery]');
  var chipsBox = document.querySelector('[data-gallery-chips]');
  var photosBox = document.querySelector('[data-gallery-photos]');
  var countEl = document.querySelector('[data-gallery-count]');
  var currentCat = 'all';
  var opener = null;

  function renderThumbs() {
    var box = document.querySelector('[data-thumbs]');
    if (!box) return;
    CATS.forEach(function (c) {
      var btn = el('button', 'thumb');
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Xem ảnh ' + c.name);
      btn.dataset.openGallery = c.id;
      var frame = el('span', 'thumb-img');
      frame.style.background = c.tone;
      frame.append(c.imgs && c.imgs[0] ? picture(c.imgs[0], '') : drawnAo(c.colors[0], 5));
      btn.append(frame, el('span', 'thumb-name', c.name));
      box.append(btn);
    });
  }

  function renderGallery() {
    chipsBox.textContent = '';
    [{ id: 'all', name: 'Tất cả' }].concat(CATS).forEach(function (c) {
      var chip = el('button', 'filter-chip', c.name);
      chip.type = 'button';
      chip.setAttribute('aria-pressed', String(c.id === currentCat));
      chip.addEventListener('click', function () {
        currentCat = c.id;
        renderGallery();
        chipsBox.querySelector('[aria-pressed="true"]').focus();
      });
      chipsBox.append(chip);
    });

    photosBox.textContent = '';
    var count = 0;
    CATS.filter(function (c) { return currentCat === 'all' || c.id === currentCat; }).forEach(function (c) {
      for (var i = 0; i < c.n; i++) {
        var label = 'Ảnh ' + c.name.toLowerCase() + ' ' + (i + 1);
        var src = c.imgs && c.imgs[i];
        var fig = el('figure', 'photo');
        var frame = el('div', 'photo-img');
        frame.style.background = i % 2 ? c.alt : c.tone;
        if (src) {
          frame.append(picture(src, label));
        } else {
          frame.setAttribute('role', 'img');
          frame.setAttribute('aria-label', label);
          frame.append(drawnAo(c.colors[i % c.colors.length], 3));
        }
        fig.append(frame, el('figcaption', null, c.name));
        photosBox.append(fig);
        count++;
      }
    });
    countEl.textContent = count + ' ảnh';
  }

  function openGallery(cat, trigger) {
    currentCat = cat;
    opener = trigger;
    renderGallery();
    document.documentElement.classList.add('is-locked');
    dialog.showModal();
    dialog.scrollTop = 0;
  }

  if (dialog && typeof dialog.showModal === 'function') {
    renderThumbs();
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-open-gallery]');
      if (trigger) openGallery(trigger.dataset.openGallery, trigger);
    });
    dialog.querySelector('[data-close-gallery]').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('close', function () {
      document.documentElement.classList.remove('is-locked');
      if (opener) opener.focus();
    });
  }

  /* ---------- Booking: compose a message, send it via Zalo or SMS ---------- */
  var form = document.querySelector('[data-booking]');
  var errorEl = document.querySelector('[data-form-error]');
  var toastEl = document.querySelector('[data-toast]');
  var toastTimer;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 5000);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return false; });
    }
    var ta = el('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    ta.remove();
    return Promise.resolve(ok);
  }

  function formatDate(iso) {
    var p = iso.split('-');
    return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso;
  }

  function setInvalid(input, on) {
    input.closest('.field').classList.toggle('is-invalid', on);
    input.setAttribute('aria-invalid', String(on));
  }

  if (form) {
    var nameIn = form.elements.name;
    var phoneIn = form.elements.phone;
    var dateIn = form.elements.date;
    var now = new Date();
    dateIn.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    [nameIn, phoneIn].forEach(function (input) {
      input.addEventListener('input', function () { setInvalid(input, false); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = nameIn.value.trim();
      var phone = phoneIn.value.replace(/[\s.\-]/g, '');
      var phoneOk = /^(\+84|84|0)\d{9}$/.test(phone);

      setInvalid(nameIn, !name);
      setInvalid(phoneIn, !phoneOk);
      if (!name || !phoneOk) {
        errorEl.textContent = !name ? 'Vui lòng nhập họ tên.' : 'Số điện thoại chưa đúng (ví dụ: 0912 345 678).';
        (!name ? nameIn : phoneIn).focus();
        return;
      }
      errorEl.textContent = '';

      var occasion = form.querySelector('input[name="occasion"]:checked');
      var msg = 'Chào ' + SHOP.name + ', tôi là ' + name + ', SĐT ' + phoneIn.value.trim() + '. ' +
        'Tôi muốn đặt lịch đo áo dài' + (occasion ? ' để mặc dịp ' + occasion.value.toLowerCase() : '') +
        (dateIn.value ? ', cần áo trước ngày ' + formatDate(dateIn.value) : '') + '. ' +
        'Nhờ tiệm gọi lại hẹn giờ đo giúp tôi ạ.';

      var via = e.submitter && e.submitter.value;
      if (via === 'sms') {
        window.location.href = 'sms:' + SHOP.phone + '?&body=' + encodeURIComponent(msg);
        return;
      }
      // Zalo links can't carry a pre-filled message, so copy it first, then open the chat.
      // window.open must run synchronously inside the click to avoid popup blockers.
      var copied = copyText(msg);
      window.open('https://zalo.me/' + SHOP.phone, '_blank', 'noopener');
      copied.then(function (ok) {
        toast(ok
          ? 'Đã chép lời nhắn — dán vào khung chat Zalo để gửi cho tiệm.'
          : 'Đã mở Zalo của tiệm. Hãy nhắn tên, SĐT và dịp may áo của bạn.');
      });
    });
  }
})();
