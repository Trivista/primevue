export default {
    object: {
        isEmpty(value) {
            return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0) || (!(value instanceof Date) && typeof value === 'object' && Object.keys(value).length === 0);
        },
        isNotEmpty(value) {
            return !this.isEmpty(value);
        },
        isFunction(value) {
            return !!(value && value.constructor && value.call && value.apply);
        },
        isObject(value, empty = true) {
            return value instanceof Object && value.constructor === Object && (empty || Object.keys(value).length !== 0);
        },
        isArray(value, empty = true) {
            return Array.isArray(value) && (empty || value.length !== 0);
        },
        isString(value, empty = true) {
            return typeof value === 'string' && (empty || value !== '');
        },
        isNumber(value) {
            return !isNaN(value);
        },
        toFlatCase(str) {
            // convert snake, kebab, camel and pascal cases to flat case
            return this.isString(str) ? str.replace(/(-|_)/g, '').toLowerCase() : str;
        },
        toKebabCase(str) {
            // convert snake, camel and pascal cases to kebab case
            return this.isString(str)
                ? str
                      .replace(/(_)/g, '-')
                      .replace(/[A-Z]/g, (c, i) => (i === 0 ? c : '-' + c.toLowerCase()))
                      .toLowerCase()
                : str;
        },
        merge(value1, value2) {
            if (this.isArray(value1)) {
                value1.push(...(value2 || []));
            } else if (this.isObject(value1)) {
                Object.assign(value1, value2);
            }
        },
        getItemValue(obj, ...params) {
            return this.isFunction(obj) ? obj(...params) : obj;
        },
        getOptionValue(options, key = '', params = {}) {
            const fKeys = this.toFlatCase(key).split('.');
            const fKey = fKeys.shift();

            return fKey
                ? this.isObject(options)
                    ? this.getOptionValue(this.getItemValue(options[Object.keys(options).find((k) => this.toFlatCase(k) === fKey) || ''], params), fKeys.join('.'), params)
                    : undefined
                : this.getItemValue(options, params);
        },
        test(regex, str) {
            if (regex) {
                const match = regex.test(str);

                regex.lastIndex = 0;

                return match;
            }

            return false;
        },
        toValue(value) {
            return this.isObject(value) && value.hasOwnProperty('value') ? value.value : value;
        },
        toUnit(value, variable = '') {
            const excludedProperties = ['opacity', 'z-index', 'line-height', 'font-weight', 'flex', 'flex-grow', 'flex-shrink', 'order'];

            if (!excludedProperties.some((property) => variable.endsWith(property))) {
                const val = `${value}`.trim();
                const valArr = val.split(' ');

                return valArr.map((v) => (this.isNumber(v) ? `${v}px` : v)).join(' ');
            }

            return value;
        },
        toNormalizePrefix(prefix) {
            return prefix.replaceAll(/ /g, '').replace(/[^\w]/g, '-');
        },
        toNormalizeVariable(prefix = '', variable = '') {
            return this.toNormalizePrefix(`${this.isString(prefix, false) && this.isString(variable, false) ? `${prefix}-` : prefix}${variable}`);
        },
        getVariableName(prefix = '', variable = '') {
            return `--${this.toNormalizeVariable(prefix, variable)}`;
        },
        getVariableValue(value, variable = '', prefix = '', excludedKeyRegexes = []) {
            if (this.isString(value)) {
                const regex = /{([^}]*)}/g;
                const val = value.trim();

                if (this.test(regex, val)) {
                    const _val = val.replaceAll(regex, (v) => {
                        const path = v.replace(/{|}/g, '');
                        const keys = path.split('.').filter((_v) => !excludedKeyRegexes.some((_r) => this.test(_r, _v)));

                        return `var(${this.getVariableName(prefix, this.toKebabCase(keys.join('-')))})`;
                    });

                    const calculationRegex = /(\d+\s+[\+\-\*\/]\s+\d+)/g;
                    const cleanedVarRegex = /var\([^)]+\)/g;

                    return this.test(calculationRegex, _val.replace(cleanedVarRegex, '0')) ? `calc(${_val})` : _val;
                }

                return this.toUnit(val, variable);
            } else if (this.isNumber(value)) {
                return this.toUnit(value, variable);
            }

            return undefined;
        },
        getComputedValue(obj = {}, value) {
            if (this.isString(value)) {
                const regex = /{([^}]*)}/g;
                const val = value.trim();

                return this.test(regex, val) ? val.replaceAll(regex, (v) => this.getOptionValue(obj, v.replace(/{|}/g, ''))) : val;
            } else if (this.isNumber(value)) {
                return value;
            }

            return undefined;
        },
        setProperty(properties, key, value) {
            if (this.isString(key, false)) {
                properties.push(`${key}:${value};`);
            }
        },
        getRule(selector, properties) {
            if (selector) {
                return `${selector}{${properties}}`;
            }

            return '';
        }
    },
    dom: {
        isClient() {
            return !!(typeof window !== 'undefined' && window.document && window.document.createElement);
        },
        addClass(element, className) {
            if (element && className && !this.hasClass(element, className)) {
                if (element.classList) element.classList.add(className);
                else element.className += ' ' + className;
            }
        },
        removeClass(element, className) {
            if (element && className) {
                if (element.classList) element.classList.remove(className);
                else element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        },
        hasClass(element, className) {
            if (element) {
                if (element.classList) return element.classList.contains(className);
                else return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
            }

            return false;
        }
    }
};
