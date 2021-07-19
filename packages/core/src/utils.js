/* eslint no-control-regex: "off" */

let uniqueNumber = 1;

const Utils = {
  uniqueNumber() {
    uniqueNumber += 1;
    return uniqueNumber;
  },
  id(mask = 'xxxxxxxxxx', map = '0123456789abcdef') {
    return $.uid(mask, map);
  },
  mdPreloaderContent: `
    <span class="preloader-inner">
			<svg viewBox="0 0 36 36">
				<circle cx="18" cy="18" r="16"></circle>
			</svg>
    </span>
  `.trim(),
  iosPreloaderContent: `
    <span class="preloader-inner">
			${[0, 1, 2, 3, 4, 5, 6, 7].map(() => '<span class="preloader-inner-line"></span>').join('')}
    </span>
  `.trim(),
  auroraPreloaderContent: `
    <span class="preloader-inner">
      <span class="preloader-inner-circle"></span>
    </span>
  `,
  eventNameToColonCase(eventName) {
    let hasColon;
    return eventName
      .split('')
      .map((char, index) => {
        if (char.match(/[A-Z]/) && index !== 0 && !hasColon) {
          hasColon = true;
          return `:${char.toLowerCase()}`;
        }
        return char.toLowerCase();
      })
      .join('');
  },
  deleteProps(obj) {
    $.deleteProps(obj);
  },
  nextTick(callback, delay = 0) {
    return setTimeout(callback, delay);
  },
  nextFrame(cb) {
    return $.nextFrame(cb);
  },
  now() {
    return Date.now();
  },
  requestAnimationFrame(cb) {
    return $.requestAnimationFrame(cb);
  },
  cancelAnimationFrame(id) {
    return $.cancelAnimationFrame(id);
  },
  parseUrlQuery(url) {
    return $.urlParam(url);
  },
  getTranslate(el, axis = 'x') {
    return $.getTranslate(el, axis);
  },
  serializeObject(obj, parents = []) {
    if (typeof obj === 'string') return obj;
    const resultArray = [];
    const separator = '&';
    let newParents;
    function varName(name) {
      if (parents.length > 0) {
        let parentParts = '';
        for (let j = 0; j < parents.length; j += 1) {
          if (j === 0) parentParts += parents[j];
          else parentParts += `[${encodeURIComponent(parents[j])}]`;
        }
        return `${parentParts}[${encodeURIComponent(name)}]`;
      }
      return encodeURIComponent(name);
    }
    function varValue(value) {
      return encodeURIComponent(value);
    }
    Object.keys(obj).forEach(prop => {
      let toPush;
      if (Array.isArray(obj[prop])) {
        toPush = [];
        for (let i = 0; i < obj[prop].length; i += 1) {
          if (!Array.isArray(obj[prop][i]) && typeof obj[prop][i] === 'object') {
            newParents = parents.slice();
            newParents.push(prop);
            newParents.push(String(i));
            toPush.push(Utils.serializeObject(obj[prop][i], newParents));
          } else {
            toPush.push(`${varName(prop)}[]=${varValue(obj[prop][i])}`);
          }
        }
        if (toPush.length > 0) resultArray.push(toPush.join(separator));
      } else if (obj[prop] === null || obj[prop] === '') {
        resultArray.push(`${varName(prop)}=`);
      } else if (typeof obj[prop] === 'object') {
        // Object, convert to named array
        newParents = parents.slice();
        newParents.push(prop);
        toPush = Utils.serializeObject(obj[prop], newParents);
        if (toPush !== '') resultArray.push(toPush);
      } else if (typeof obj[prop] !== 'undefined' && obj[prop] !== '') {
        // Should be string or plain value
        resultArray.push(`${varName(prop)}=${varValue(obj[prop])}`);
      } else if (obj[prop] === '') resultArray.push(varName(prop));
    });
    return resultArray.join(separator);
  },
  isObject(o) {
    return typeof o === 'object' && o !== null && o.constructor && o.constructor === Object;
  },
  merge(...args) {
    return $.merge(...args);
  },
  extend(...args) {
    const to = args[0];
    args.splice(0, 1);
    return $.assign(to, ...args);
  },
  // 绑定类方法到类实例，复制类属性、方法到类
	bindMethods(instance, obj) { 
		Object.keys(obj).forEach((key) => {
			if (this.isObject(obj[key])) {
				Object.keys(obj[key]).forEach((subKey) => {
					if (typeof obj[key][subKey] === 'function') {
						obj[key][subKey] = obj[key][subKey].bind(instance);
					}
				});
			}
			instance[key] = obj[key];
		});
	},	
  colorHexToRgb(hex) {
    const h = hex.replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => r + r + g + g + b + b
    );
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
    return result ? result.slice(1).map(n => parseInt(n, 16)) : null;
  },
  colorRgbToHex(r, g, b) {
    const result = [r, g, b]
      .map(n => {
        const hex = n.toString(16);
        return hex.length === 1 ? `0${hex}` : hex;
      })
      .join('');
    return `#${result}`;
  },
  colorRgbToHsl(r, g, b) {
    r /= 255; // eslint-disable-line
    g /= 255; // eslint-disable-line
    b /= 255; // eslint-disable-line
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h;
    if (d === 0) h = 0;
    else if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else if (max === b) h = (r - g) / d + 4;
    const l = (min + max) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    if (h < 0) h = 360 / 60 + h;
    return [h * 60, s, l];
  },
  colorHslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = h / 60;
    const x = c * (1 - Math.abs((hp % 2) - 1));
    let rgb1;
    if (Number.isNaN(h) || typeof h === 'undefined') {
      rgb1 = [0, 0, 0];
    } else if (hp <= 1) rgb1 = [c, x, 0];
    else if (hp <= 2) rgb1 = [x, c, 0];
    else if (hp <= 3) rgb1 = [0, c, x];
    else if (hp <= 4) rgb1 = [0, x, c];
    else if (hp <= 5) rgb1 = [x, 0, c];
    else if (hp <= 6) rgb1 = [c, 0, x];
    const m = l - c / 2;
    return rgb1.map(n => Math.max(0, Math.min(255, Math.round(255 * (n + m)))));
  },
  colorHsbToHsl(h, s, b) {
    const HSL = {
      h,
      s: 0,
      l: 0,
    };
    const HSB = {h, s, b};

    HSL.l = ((2 - HSB.s) * HSB.b) / 2;
    HSL.s =
      HSL.l && HSL.l < 1 ? (HSB.s * HSB.b) / (HSL.l < 0.5 ? HSL.l * 2 : 2 - HSL.l * 2) : HSL.s;

    return [HSL.h, HSL.s, HSL.l];
  },
  colorHslToHsb(h, s, l) {
    const HSB = {
      h,
      s: 0,
      b: 0,
    };
    const HSL = {h, s, l};

    const t = HSL.s * (HSL.l < 0.5 ? HSL.l : 1 - HSL.l);
    HSB.b = HSL.l + t;
    HSB.s = HSL.l > 0 ? (2 * t) / HSB.b : HSB.s;

    return [HSB.h, HSB.s, HSB.b];
  },
  colorThemeCSSProperties(...args) {
    let hex;
    let rgb;
    if (args.length === 1) {
      hex = args[0];
      rgb = Utils.colorHexToRgb(hex);
    } else if (args.length === 3) {
      rgb = args;
      hex = Utils.colorRgbToHex(...rgb);
    }
    if (!rgb) return {};
    const hsl = Utils.colorRgbToHsl(...rgb);
    const hslShade = [hsl[0], hsl[1], Math.max(0, hsl[2] - 0.08)];
    const hslTint = [hsl[0], hsl[1], Math.max(0, hsl[2] + 0.08)];
    const shade = Utils.colorRgbToHex(...Utils.colorHslToRgb(...hslShade));
    const tint = Utils.colorRgbToHex(...Utils.colorHslToRgb(...hslTint));
    return {
      '--f7-theme-color': hex,
      '--f7-theme-color-rgb': rgb.join(', '),
      '--f7-theme-color-shade': shade,
      '--f7-theme-color-tint': tint,
    };
  },
};

export default Utils;
