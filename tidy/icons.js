// Hand drawn halloween icons, all on a 100x100 grid.
(function () {
  var O = 'stroke="#1b0d06" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"';
  var SH = 'fill="url(#sh)"';

  var defs = {
    candycorn: {
      name: 'candy corn',
      body:
        '<clipPath id="k"><path d="M50 8C60 8 82 60 84 76C86 92 14 92 16 76C18 60 40 8 50 8Z"/></clipPath>' +
        '<g clip-path="url(#k)">' +
        '<rect width="100" height="42" fill="#fff4e0"/>' +
        '<rect y="42" width="100" height="24" fill="#ff7a10"/>' +
        '<rect y="66" width="100" height="40" fill="#ffc21a"/>' +
        '<rect width="100" height="100" ' + SH + '/>' +
        '<path d="M41 24C35 40 31 56 29 70" stroke="#fff" stroke-width="5" opacity=".55" fill="none" stroke-linecap="round"/>' +
        '</g>' +
        '<path d="M50 8C60 8 82 60 84 76C86 92 14 92 16 76C18 60 40 8 50 8Z" fill="none" ' + O + '/>'
    },
    sweet: {
      name: 'wrapped sweet',
      body:
        '<path d="M32 50L8 28C1 42 1 58 8 72Z" fill="#c9a0ff" ' + O + '/>' +
        '<path d="M68 50L92 28C99 42 99 58 92 72Z" fill="#c9a0ff" ' + O + '/>' +
        '<path d="M8 40L26 48M8 60L26 52M92 40L74 48M92 60L74 52" stroke="#7a3fd1" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
        '<clipPath id="k"><ellipse cx="50" cy="50" rx="23" ry="20"/></clipPath>' +
        '<g clip-path="url(#k)">' +
        '<rect width="100" height="100" fill="#a35cff"/>' +
        '<path d="M26 72L48 26M40 76L62 30M54 78L76 32" stroke="#ff9a3a" stroke-width="6" fill="none"/>' +
        '<rect width="100" height="100" ' + SH + '/>' +
        '</g>' +
        '<ellipse cx="42" cy="41" rx="6" ry="3.5" fill="#fff" opacity=".6"/>' +
        '<ellipse cx="50" cy="50" rx="23" ry="20" fill="none" ' + O + '/>'
    },
    lollipop: {
      name: 'lollipop',
      body:
        '<rect x="46" y="56" width="8" height="40" rx="4" fill="#f3e9dc" ' + O + '/>' +
        '<clipPath id="k"><circle cx="50" cy="38" r="31"/></clipPath>' +
        '<g clip-path="url(#k)">' +
        '<rect width="100" height="100" fill="#ff7a10"/>' +
        '<path d="M50 38a4 4 0 0 1 8 0a8 8 0 0 1-16 0a12 12 0 0 1 24 0a16 16 0 0 1-32 0a20 20 0 0 1 40 0a24 24 0 0 1-48 0a28 28 0 0 1 56 0" stroke="#fff1d6" stroke-width="5" fill="none"/>' +
        '<rect width="100" height="100" ' + SH + '/>' +
        '</g>' +
        '<ellipse cx="38" cy="22" rx="7" ry="4" fill="#fff" opacity=".55" transform="rotate(-30 38 22)"/>' +
        '<circle cx="50" cy="38" r="31" fill="none" ' + O + '/>'
    },
    bat: {
      name: 'bat',
      body:
        '<g transform="translate(0 4)">' +
        '<g id="w"><path d="M46 44C36 24 18 20 4 32C10 38 11 45 8 53C15 50 21 53 23 61C28 55 34 56 37 64C40 56 43 52 46 52Z" fill="#3d3159" ' + O + '/>' +
        '<path d="M42 44C34 36 24 33 14 36M40 50C34 46 28 45 22 48" stroke="#6a589a" stroke-width="2.2" fill="none" stroke-linecap="round"/></g>' +
        '<use href="#w" transform="matrix(-1 0 0 1 100 0)"/>' +
        '<ellipse cx="50" cy="54" rx="10" ry="16" fill="#3d3159" ' + O + '/>' +
        '<ellipse cx="50" cy="54" rx="10" ry="16" ' + SH + '/>' +
        '<path d="M42 36L43 22L49 31ZM58 36L57 22L51 31Z" fill="#3d3159" ' + O + '/>' +
        '<circle cx="50" cy="38" r="10" fill="#3d3159" ' + O + '/>' +
        '<circle cx="50" cy="38" r="10" ' + SH + '/>' +
        '<circle cx="46" cy="37" r="2.6" fill="#ffd23a"/><circle cx="54" cy="37" r="2.6" fill="#ffd23a"/>' +
        '<path d="M46.5 43L48 46.5L49.5 43M50.5 43L52 46.5L53.5 43" fill="#fff" stroke="#fff" stroke-width="1" stroke-linejoin="round"/>' +
        '</g>'
    },
    cat: {
      name: 'black cat',
      body:
        '<path d="M66 84C86 86 94 66 84 56" fill="none" stroke="#1b0d06" stroke-width="11" stroke-linecap="round"/>' +
        '<path d="M66 84C86 86 94 66 84 56" fill="none" stroke="#3a2f55" stroke-width="4.5" stroke-linecap="round"/>' +
        '<path d="M30 92C24 72 30 58 40 52L60 52C70 58 76 72 70 92Z" fill="#3a2f55" ' + O + '/>' +
        '<path d="M30 92C24 72 30 58 40 52L60 52C70 58 76 72 70 92Z" ' + SH + '/>' +
        '<path d="M44 92C42 86 44 82 47 82M56 92C58 86 56 82 53 82" stroke="#1b0d06" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M32 34L30 11L47 24ZM68 34L70 11L53 24Z" fill="#3a2f55" ' + O + '/>' +
        '<path d="M34 27L33 18L40 23ZM66 27L67 18L60 23Z" fill="#ff7aa8"/>' +
        '<circle cx="50" cy="38" r="20" fill="#3a2f55" ' + O + '/>' +
        '<circle cx="50" cy="38" r="20" ' + SH + '/>' +
        '<ellipse cx="42" cy="37" rx="5" ry="6" fill="#8cff3a"/><ellipse cx="58" cy="37" rx="5" ry="6" fill="#8cff3a"/>' +
        '<ellipse cx="42" cy="37" rx="1.6" ry="5" fill="#120a0a"/><ellipse cx="58" cy="37" rx="1.6" ry="5" fill="#120a0a"/>' +
        '<path d="M47 45H53L50 48Z" fill="#ff7aa8"/>' +
        '<path d="M38 46L26 44M38 49L27 51M62 46L74 44M62 49L73 51" stroke="#a39489" stroke-width="1.5" opacity=".8" stroke-linecap="round"/>'
    },
    eyeball: {
      name: 'eyeball',
      body:
        '<circle cx="50" cy="50" r="36" fill="#fff3e6"/>' +
        '<path d="M16 46C24 44 28 50 35 47M18 62C26 60 30 66 37 62M70 82C66 74 70 68 66 62M84 56C77 56 74 62 70 60M30 22C34 28 32 32 38 34" stroke="#e0414a" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<circle cx="57" cy="45" r="15" fill="#8cff3a" stroke="#3d7a12" stroke-width="3"/>' +
        '<circle cx="57" cy="45" r="7.5" fill="#120a0a"/>' +
        '<circle cx="52" cy="40" r="3.5" fill="#fff"/>' +
        '<circle cx="50" cy="50" r="36" ' + SH + '/>' +
        '<circle cx="50" cy="50" r="36" fill="none" ' + O + '/>'
    },
    pumpkin: {
      name: 'pumpkin',
      body:
        '<path d="M46 34C46 24 44 18 40 14L48 9C54 16 56 24 55 34Z" fill="#6b8f2a" ' + O + '/>' +
        '<ellipse cx="31" cy="61" rx="21" ry="26" fill="#f2690c" ' + O + '/>' +
        '<ellipse cx="69" cy="61" rx="21" ry="26" fill="#f2690c" ' + O + '/>' +
        '<ellipse cx="50" cy="61" rx="19" ry="29" fill="#ff7f17" ' + O + '/>' +
        '<clipPath id="k"><ellipse cx="31" cy="61" rx="21" ry="26"/><ellipse cx="69" cy="61" rx="21" ry="26"/><ellipse cx="50" cy="61" rx="19" ry="29"/></clipPath>' +
        '<rect x="8" y="30" width="84" height="62" clip-path="url(#k)" ' + SH + '/>' +
        '<path d="M52 33C46 30 46 26 49 22" fill="none" stroke="#1b0d06" stroke-width="3.5" stroke-linecap="round"/>' +
        '<path d="M55 22C63 14 72 17 70 24" stroke="#7fb83a" stroke-width="3" fill="none" stroke-linecap="round"/>' +
        '<path d="M31 58L38 47L45 58ZM55 58L62 47L69 58Z" fill="#ffc21a" stroke="#1b0d06" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="M32 66Q50 82 68 66Q60 70 56 68L54 72L50 69L46 72L44 68Q40 70 32 66Z" fill="#ffc21a" stroke="#1b0d06" stroke-width="2.5" stroke-linejoin="round"/>'
    },
    skull: {
      name: 'skull',
      body:
        '<path d="M50 10C27 10 14 26 14 46C14 58 20 65 28 69L28 82C28 87 32 90 37 90L63 90C68 90 72 87 72 82L72 69C80 65 86 58 86 46C86 26 73 10 50 10Z" fill="#efe4cf"/>' +
        '<path d="M50 10C27 10 14 26 14 46C14 58 20 65 28 69L28 82C28 87 32 90 37 90L63 90C68 90 72 87 72 82L72 69C80 65 86 58 86 46C86 26 73 10 50 10Z" ' + SH + '/>' +
        '<ellipse cx="35" cy="47" rx="10" ry="11" fill="#2a1608"/><ellipse cx="65" cy="47" rx="10" ry="11" fill="#2a1608"/>' +
        '<circle cx="38" cy="44" r="2.5" fill="#ff6a00"/><circle cx="68" cy="44" r="2.5" fill="#ff6a00"/>' +
        '<path d="M50 57L45 66H55Z" fill="#2a1608" stroke="#2a1608" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M34 76H66M41 76V89M50 76V89M59 76V89" stroke="#1b0d06" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
        '<path d="M62 14L57 23L62 28" stroke="#8a7a66" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path d="M50 10C27 10 14 26 14 46C14 58 20 65 28 69L28 82C28 87 32 90 37 90L63 90C68 90 72 87 72 82L72 69C80 65 86 58 86 46C86 26 73 10 50 10Z" fill="none" ' + O + '/>'
    },
    candle: {
      name: 'candle',
      body:
        '<circle cx="50" cy="24" r="19" fill="#ffb21a" opacity=".16"/>' +
        '<ellipse cx="50" cy="88" rx="32" ry="8" fill="#5a4a80" ' + O + '/>' +
        '<path d="M34 42C34 37 66 37 66 42L66 87L34 87Z" fill="#f6e6c4" ' + O + '/>' +
        '<path d="M34 42C34 37 66 37 66 42L66 87L34 87Z" ' + SH + '/>' +
        '<path d="M34 42C34 37 66 37 66 42L66 52C66 56 62 56 62 52L62 48C62 46 58 46 58 48L58 60C58 64 53 64 53 60L53 48C53 46 46 46 46 50L46 54C46 58 41 58 41 54L41 48C41 46 34 46 34 48Z" fill="#fffaf0" stroke="#1b0d06" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M50 39V32" stroke="#1b0d06" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M50 6C58 16 62 22 60 28C58 34 42 34 40 28C38 22 44 16 50 6Z" fill="#ffb21a" ' + O + '/>' +
        '<path d="M50 16C54 22 55 26 53 29C51 31 49 31 47 29C45 26 46 22 50 16Z" fill="#fff4c2"/>'
    },
    tombstone: {
      name: 'tombstone',
      body:
        '<path d="M22 88L22 40C22 15 78 15 78 40L78 88Z" fill="#8f8aa0" ' + O + '/>' +
        '<path d="M22 88L22 40C22 15 78 15 78 40L78 88Z" ' + SH + '/>' +
        '<path d="M28 42C28 28 36 23 44 22" stroke="#c9c4d8" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>' +
        '<path d="M50 34V66M40 45H60" stroke="#5d5870" stroke-width="5.5" stroke-linecap="round"/>' +
        '<path d="M70 30L64 40L68 46" stroke="#5d5870" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
        '<rect x="14" y="82" width="72" height="11" rx="4" fill="#6b6680" ' + O + '/>' +
        '<path d="M14 93L18 80L22 90L26 81L30 93ZM68 93L72 82L76 90L80 79L85 93Z" fill="#5cbf2a" stroke="#1b0d06" stroke-width="2.5" stroke-linejoin="round"/>'
    },
    witchhat: {
      name: 'witch hat',
      body:
        '<ellipse cx="50" cy="80" rx="45" ry="12" fill="#3d3159" ' + O + '/>' +
        '<ellipse cx="50" cy="80" rx="45" ry="12" ' + SH + '/>' +
        '<path d="M28 80C34 60 40 40 46 24C49 14 58 6 70 10C62 16 60 26 62 40C64 56 68 68 72 80Z" fill="#4a3b6e" ' + O + '/>' +
        '<path d="M28 80C34 60 40 40 46 24C49 14 58 6 70 10C62 16 60 26 62 40C64 56 68 68 72 80Z" ' + SH + '/>' +
        '<path d="M31 69C44 73 57 73 69 69L72 80C57 84 43 84 28 80Z" fill="#ff6a00" stroke="#1b0d06" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<rect x="44" y="70" width="12" height="11" rx="1.5" fill="none" stroke="#ffd23a" stroke-width="3"/>' +
        '<path d="M52 36l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="#8cff3a"/>'
    },
    potion: {
      name: 'potion',
      body:
        '<clipPath id="k"><path d="M42 16L58 16L58 36C72 40 80 50 80 62C80 79 66 92 50 92C34 92 20 79 20 62C20 50 28 40 42 36Z"/></clipPath>' +
        '<g clip-path="url(#k)">' +
        '<rect width="100" height="100" fill="#d7eef5"/>' +
        '<path d="M16 58C30 52 40 64 52 58C62 53 72 60 84 56L84 100L16 100Z" fill="#8cff3a"/>' +
        '<path d="M16 58C30 52 40 64 52 58C62 53 72 60 84 56" fill="none" stroke="#3d7a12" stroke-width="2.5"/>' +
        '<circle cx="42" cy="72" r="4" fill="none" stroke="#e6ffd6" stroke-width="2"/><circle cx="58" cy="80" r="3" fill="none" stroke="#e6ffd6" stroke-width="2"/><circle cx="60" cy="66" r="2" fill="#e6ffd6"/>' +
        '<rect width="100" height="100" ' + SH + '/>' +
        '<path d="M30 56C30 48 35 43 41 41" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>' +
        '</g>' +
        '<path d="M42 16L58 16L58 36C72 40 80 50 80 62C80 79 66 92 50 92C34 92 20 79 20 62C20 50 28 40 42 36Z" fill="none" ' + O + '/>' +
        '<rect x="39" y="6" width="22" height="13" rx="3" fill="#b07a45" ' + O + '/>' +
        '<path d="M44 10V15M50 10V15M56 10V15" stroke="#7a4f26" stroke-width="2" stroke-linecap="round"/>'
    },
    broom: {
      name: 'broomstick',
      body:
        '<path d="M86 8L42 62" stroke="#1b0d06" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M86 8L42 62" stroke="#9a6533" stroke-width="4.5" stroke-linecap="round"/>' +
        '<path d="M38 55L50 65C46 80 40 92 36 98C26 98 12 90 6 77C20 72 32 64 38 55Z" fill="#e9b949" ' + O + '/>' +
        '<path d="M38 55L50 65C46 80 40 92 36 98C26 98 12 90 6 77C20 72 32 64 38 55Z" ' + SH + '/>' +
        '<path d="M43 62L22 90M46 64L32 94M40 59L14 82" stroke="#b8862a" stroke-width="2" stroke-linecap="round"/>' +
        '<path d="M35 51L53 65L48 70L31 56Z" fill="#a35cff" stroke="#1b0d06" stroke-width="3" stroke-linejoin="round"/>'
    },
    moon: {
      name: 'moon',
      body:
        '<clipPath id="k"><path d="M52.6 10.3A40 40 0 1 0 86.9 59.3A30 30 0 1 1 52.6 10.3Z"/></clipPath>' +
        '<g clip-path="url(#k)">' +
        '<rect width="100" height="100" fill="#ffd76a"/>' +
        '<circle cx="26" cy="62" r="5" fill="#e8b84a"/><circle cx="44" cy="80" r="4" fill="#e8b84a"/><circle cx="20" cy="42" r="3" fill="#e8b84a"/>' +
        '<rect width="100" height="100" ' + SH + '/>' +
        '</g>' +
        '<path d="M32 50Q36 54 40 50M37 61Q41 64 45 60" stroke="#1b0d06" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
        '<ellipse cx="31" cy="56" rx="3.5" ry="2" fill="#ff9a6a" opacity=".7"/>' +
        '<path d="M52.6 10.3A40 40 0 1 0 86.9 59.3A30 30 0 1 1 52.6 10.3Z" fill="none" ' + O + '/>'
    },
    ghost: {
      name: 'ghost',
      body:
        '<path d="M22 52C12 54 9 62 14 65C18 66 21 62 23 60M78 52C88 54 91 62 86 65C82 66 79 62 77 60" fill="#f4f0ff" ' + O + '/>' +
        '<path d="M50 10C28 10 20 28 20 48L20 86C24 92 30 82 35 86C40 92 45 82 50 86C55 92 60 82 65 86C70 92 76 82 80 86L80 48C80 28 72 10 50 10Z" fill="#f4f0ff" ' + O + '/>' +
        '<path d="M50 10C28 10 20 28 20 48L20 86C24 92 30 82 35 86C40 92 45 82 50 86C55 92 60 82 65 86C70 92 76 82 80 86L80 48C80 28 72 10 50 10Z" ' + SH + '/>' +
        '<ellipse cx="40" cy="44" rx="4.5" ry="6" fill="#1b0d06"/><ellipse cx="60" cy="44" rx="4.5" ry="6" fill="#1b0d06"/>' +
        '<circle cx="41.5" cy="42" r="1.5" fill="#fff"/><circle cx="61.5" cy="42" r="1.5" fill="#fff"/>' +
        '<ellipse cx="33" cy="54" rx="5" ry="3" fill="#ff9ab8" opacity=".75"/><ellipse cx="67" cy="54" rx="5" ry="3" fill="#ff9ab8" opacity=".75"/>' +
        '<ellipse cx="50" cy="58" rx="4" ry="5" fill="#1b0d06"/>'
    }
  };

  var grad =
    '<defs><radialGradient id="sh" cx=".35" cy=".3" r=".8">' +
    '<stop offset="0" stop-color="#fff" stop-opacity=".38"/>' +
    '<stop offset=".45" stop-color="#fff" stop-opacity="0"/>' +
    '<stop offset="1" stop-color="#1b0d06" stop-opacity=".38"/>' +
    '</radialGradient></defs>';

  // pad: extra room around the 100x100 box, px: output size
  function svg(key, pad, px) {
    pad = pad || 0;
    var size = 100 + pad * 2;
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + (-pad) + ' ' + (-pad) + ' ' + size + ' ' + size +
      '" width="' + px + '" height="' + px + '">' + grad + defs[key].body + '</svg>';
  }

  function url(key, pad, px) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(key, pad, px || 100));
  }

  window.ICONS = { keys: Object.keys(defs), defs: defs, url: url };
})();
