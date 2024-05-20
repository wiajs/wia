/* eslint no-control-regex: "off" */
import {materialColors} from './material-colors.js';

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
  pcPreloaderContent: `
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
  requestAnimationFrame(cb) {
    return $.requestAnimationFrame(cb);
  },
  cancelAnimationFrame(id) {
    return $.cancelAnimationFrame(id);
  },
  nextTick(cb, delay = 0) {
    return $.nextTick(cb, delay);
  },
  nextFrame(cb) {
    return $.nextFrame(cb);
  },
  now() {
    return Date.now();
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
    Object.keys(obj).forEach(key => {
      if (Utils.isObject(obj[key])) {
        Object.keys(obj[key]).forEach(subKey => {
          if (typeof obj[key][subKey] === 'function') {
            obj[key][subKey] = obj[key][subKey].bind(instance);
          }
        });
      }
      instance[key] = obj[key];
    });
  },
  flattenArray(...args) {
    const arr = [];
    args.forEach(arg => {
      if (Array.isArray(arg)) arr.push(...flattenArray(...arg));
      else arr.push(arg);
    });
    return arr;
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
  getShadeTintColors(rgb) {
    const hsl = Utils.colorRgbToHsl(...rgb);
    const hslShade = [hsl[0], hsl[1], Math.max(0, hsl[2] - 0.08)];
    const hslTint = [hsl[0], hsl[1], Math.max(0, hsl[2] + 0.08)];
    const shade = Utils.colorRgbToHex(...Utils.colorHslToRgb(...hslShade));
    const tint = Utils.colorRgbToHex(...Utils.colorHslToRgb(...hslTint));
    return {shade, tint};
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
    const {light, dark} = materialColors(hex);
    const shadeTintIos = Utils.getShadeTintColors(rgb);
    const shadeTintMdLight = Utils.getShadeTintColors(
      Utils.colorHexToRgb(light['--f7-md-primary'])
    );
    const shadeTintMdDark = Utils.getShadeTintColors(Utils.colorHexToRgb(dark['--f7-md-primary']));
    Object.keys(light).forEach(key => {
      if (key.includes('surface-')) {
        light[`${key}-rgb`] = Utils.colorHexToRgb(light[key]);
      }
    });
    Object.keys(dark).forEach(key => {
      if (key.includes('surface-')) {
        dark[`${key}-rgb`] = Utils.colorHexToRgb(dark[key]);
      }
    });
    return {
      ios: {
        '--f7-theme-color': 'var(--f7-ios-primary)',
        '--f7-theme-color-rgb': 'var(--f7-ios-primary-rgb)',
        '--f7-theme-color-shade': 'var(--f7-ios-primary-shade)',
        '--f7-theme-color-tint': 'var(--f7-ios-primary-tint)',
      },
      md: {
        '--f7-theme-color': 'var(--f7-md-primary)',
        '--f7-theme-color-rgb': 'var(--f7-md-primary-rgb)',
        '--f7-theme-color-shade': 'var(--f7-md-primary-shade)',
        '--f7-theme-color-tint': 'var(--f7-md-primary-tint)',
      },
      light: {
        '--f7-ios-primary': hex,
        '--f7-ios-primary-shade': shadeTintIos.shade,
        '--f7-ios-primary-tint': shadeTintIos.tint,
        '--f7-ios-primary-rgb': rgb.join(', '),
        '--f7-md-primary-shade': shadeTintMdLight.shade,
        '--f7-md-primary-tint': shadeTintMdLight.tint,
        '--f7-md-primary-rgb': Utils.colorHexToRgb(light['--f7-md-primary']).join(', '),
        ...light,
      },
      dark: {
        '--f7-md-primary-shade': shadeTintMdDark.shade,
        '--f7-md-primary-tint': shadeTintMdDark.tint,
        '--f7-md-primary-rgb': Utils.colorHexToRgb(dark['--f7-md-primary']).join(', '),
        ...dark,
      },
    };
  },
  colorThemeCSSStyles(colors = {}) {
    const stringifyObject = obj => {
      let res = '';
      Object.keys(obj).forEach(key => {
        res += `${key}:${obj[key]};`;
      });
      return res;
    };
    const colorVars = Utils.colorThemeCSSProperties(colors.primary);

    const primary = [
      `:root{`,
      stringifyObject(colorVars.light),
      `--swiper-theme-color:var(--f7-theme-color);`,
      ...Object.keys(colors).map(colorName => `--f7-color-${colorName}: ${colors[colorName]};`),
      `}`,
      `.dark{`,
      stringifyObject(colorVars.dark),
      `}`,
      `.ios, .ios .dark{`,
      stringifyObject(colorVars.ios),
      '}',
      `.md, .md .dark{`,
      stringifyObject(colorVars.md),
      '}',
    ].join('');

    const restVars = {};

    Object.keys(colors).forEach(colorName => {
      const colorValue = colors[colorName];
      restVars[colorName] = Utils.colorThemeCSSProperties(colorValue);
    });

    // rest
    let rest = '';

    Object.keys(colors).forEach(colorName => {
      const {light, dark, ios, md} = restVars[colorName];

      const whiteColorVars = `
			--f7-ios-primary: #ffffff;
			--f7-ios-primary-shade: #ebebeb;
			--f7-ios-primary-tint: #ffffff;
			--f7-ios-primary-rgb: 255, 255, 255;
			--f7-md-primary-shade: #eee;
			--f7-md-primary-tint: #fff;
			--f7-md-primary-rgb: 255, 255, 255;
			--f7-md-primary: #fff;
			--f7-md-on-primary: #000;
			--f7-md-primary-container: #fff;
			--f7-md-on-primary-container: #000;
			--f7-md-secondary: #fff;
			--f7-md-on-secondary: #000;
			--f7-md-secondary-container: #555;
			--f7-md-on-secondary-container: #fff;
			--f7-md-surface: #fff;
			--f7-md-on-surface: #000;
			--f7-md-surface-variant: #333;
			--f7-md-on-surface-variant: #fff;
			--f7-md-outline: #fff;
			--f7-md-outline-variant: #fff;
			--f7-md-inverse-surface: #000;
			--f7-md-inverse-on-surface: #fff;
			--f7-md-inverse-primary: #000;
			--f7-md-surface-1: #f8f8f8;
			--f7-md-surface-2: #f1f1f1;
			--f7-md-surface-3: #e7e7e7;
			--f7-md-surface-4: #e1e1e1;
			--f7-md-surface-5: #d7d7d7;
			--f7-md-surface-variant-rgb: 51, 51, 51;
			--f7-md-on-surface-variant-rgb: 255, 255, 255;
			--f7-md-surface-1-rgb: 248, 248, 248;
			--f7-md-surface-2-rgb: 241, 241, 241;
			--f7-md-surface-3-rgb: 231, 231, 231;
			--f7-md-surface-4-rgb: 225, 225, 225;
			--f7-md-surface-5-rgb: 215, 215, 215;
			`;
      const blackColorVars = `
			--f7-ios-primary: #000;
			--f7-ios-primary-shade: #000;
			--f7-ios-primary-tint: #232323;
			--f7-ios-primary-rgb: 0, 0, 0;
			--f7-md-primary-shade: #000;
			--f7-md-primary-tint: #232323;
			--f7-md-primary-rgb: 0, 0, 0;
			--f7-md-primary: #000;
			--f7-md-on-primary: #fff;
			--f7-md-primary-container: #000;
			--f7-md-on-primary-container: #fff;
			--f7-md-secondary: #000;
			--f7-md-on-secondary: #fff;
			--f7-md-secondary-container: #aaa;
			--f7-md-on-secondary-container: #000;
			--f7-md-surface: #000;
			--f7-md-on-surface: #fff;
			--f7-md-surface-variant: #ccc;
			--f7-md-on-surface-variant: #000;
			--f7-md-outline: #000;
			--f7-md-outline-variant: #000;
			--f7-md-inverse-surface: #fff;
			--f7-md-inverse-on-surface: #000;
			--f7-md-inverse-primary: #fff;
			--f7-md-surface-1: #070707;
			--f7-md-surface-2: #161616;
			--f7-md-surface-3: #232323;
			--f7-md-surface-4: #303030;
			--f7-md-surface-5: #373737;
			--f7-md-surface-variant-rgb: 204, 204, 204;
			--f7-md-on-surface-variant-rgb: 0, 0, 0;
			--f7-md-surface-1-rgb: 7, 7, 7;
			--f7-md-surface-2-rgb: 22, 22, 22;
			--f7-md-surface-3-rgb: 35, 35, 35;
			--f7-md-surface-4-rgb: 48, 48, 48;
			--f7-md-surface-5-rgb: 55, 55, 55;
			`;
      /* eslint-disable */
      const lightString =
        colorName === 'white'
          ? whiteColorVars
          : colorName === 'black'
          ? blackColorVars
          : stringifyObject(light);
      const darkString =
        colorName === 'white'
          ? whiteColorVars
          : colorName === 'black'
          ? blackColorVars
          : stringifyObject(dark);
      /* eslint-enable */
      rest += [
        `.color-${colorName} {`,
        lightString,
        `--swiper-theme-color: var(--f7-theme-color);`,
        `}`,
        `.color-${colorName}.dark, .color-${colorName} .dark, .dark .color-${colorName} {`,
        darkString,
        `--swiper-theme-color: var(--f7-theme-color);`,
        `}`,
        `.ios .color-${colorName}, .ios.color-${colorName}, .ios .dark .color-${colorName}, .ios .dark.color-${colorName} {`,
        stringifyObject(ios),
        `}`,
        `.md .color-${colorName}, .md.color-${colorName}, .md .dark .color-${colorName}, .md .dark.color-${colorName} {`,
        stringifyObject(md),
        `}`,

        // text color
        `.text-color-${colorName} {`,
        `--f7-theme-color-text-color: ${colors[colorName]};`,
        `}`,

        // bg color
        `.bg-color-${colorName} {`,
        `--f7-theme-color-bg-color: ${colors[colorName]};`,
        `}`,

        // border color
        `.border-color-${colorName} {`,
        `--f7-theme-color-border-color: ${colors[colorName]};`,
        `}`,

        // ripple color
        `.ripple-color-${colorName} {`,
        `--f7-theme-color-ripple-color: rgba(${light['--f7-ios-primary-rgb']}, 0.3);`,
        `}`,
      ].join('');
    });

    return `${primary}${rest}`;
  },
};

export default Utils;
