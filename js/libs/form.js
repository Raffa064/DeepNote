function FormJS(_errorHandler) {
  const DEFAULT_ERROR_HANDLER =
    _errorHandler ||
    ((ruleName, ruleParams, value) => {
      console.log("FormJS ERROR: " + ruleName + ' "' + value + '"');
    });

  const CPF_SEPARATORS = [
    [3, "."],
    [7, "."],
    [11, "-"],
  ]; // nnn.nnn.nnn-nn

  const formJS = (errorHandler = DEFAULT_ERROR_HANDLER) => {
    const ruleList = [];

    const validator = (value) => {
      for (const ruleIndex in ruleList) {
        const [ruleName, ruleParams, rule] = ruleList[ruleIndex];
        const accepted = rule(value);

        if (!accepted) {
          errorHandler(ruleName, ruleParams, value);
          return false;
        }
      }

      return true;
    };

    validator.setRuleList = (_ruleList) => {
      ruleList.splice(0, ruleList.length);
      _ruleList.forEach((rule) => ruleList.push(rule));

      return validator;
    };

    validator.rules = () => {
      return ruleList;
    };

    validator.clone = () => {
      const cloneValidator = formJS(errorHandler).setRuleList(ruleList);

      for (const rule in validator) {
        const isCustomRule = !cloneValidator[rule];
        if (isCustomRule) {
          cloneValidator[rule] = validator[rule]; // Clone custom rules
        }
      }

      return cloneValidator;
    };

    validator.setErrorHandler = (_errorHandler) => {
      errorHandler = _errorHandler;

      return validator;
    };

    const createRule = (name, func) => {
      validator[name] = (...params) => {
        ruleList.push([name, params, (value) => func(params, value)]);

        return validator;
      };

      return validator;
    };

    validator.createRule = createRule;

    createRule("notEmpty", (params, value) => {
      return value.trim().length > 0;
    });

    createRule("minLength", ([minLength], value) => {
      return value.length >= minLength;
    });

    createRule("maxLength", ([maxLength], value) => {
      return value.length <= maxLength;
    });

    createRule("rangeLength", ([minLength, maxLength], value) => {
      return value.length >= minLength && value.length <= maxLength;
    });

    createRule("fixedLength", (fixedLengths, value) => {
      for (const length of fixedLengths) {
        if (value.length == length) {
          return true;
        }
      }

      return false;
    });

    createRule("match", (regexPatterns, value) => {
      for (const regex of regexPatterns) {
        var regexObj = regex;

        if (typeof regex === "string") {
          regexObj = new RegExp(regex);
        }

        if (regexObj.test(value)) {
          return true;
        }
      }

      return false;
    });

    createRule("number", (params, value) => {
      return !isNaN(value);
    });

    createRule("range", ([min, max], value) => {
      return value >= min && value <= max;
    });

    createRule("validCPF", ([checkSeparators], value) => {
      if (value.length < 11 || value.length > 14) {
        // Min/Max CPF length
        return false;
      }

      if (checkSeparators) {
        for (const [index, target] of CPF_SEPARATORS) {
          if (value.charAt(index) != target) {
            return false;
          }
        }
      }

      var sum = 0;
      var count = 0;

      for (let i = 0; i < value.length; i++) {
        const char = value.charAt(i);

        if (!isNaN(char)) {
          sum += parseInt(char);
          count++;
        }
      }

      const { floor } = Math;

      const ten = floor(sum / 10); // 15 = 1
      const ones = floor(sum % 10); // 15 = 5

      return ones == ten && count == 11;
    });

    createRule("format", (formatStrings, value) => {
      /*
                Format:
                    # any
                    n number
                    d lowercase digit
                    D uppercase digit
                    w whole case digit
                    / literal char
                    \b end (used internally)
            */

      const checkFormat = (formatStr, value) => {
        formatStr += "\b";

        var offset = 0;
        for (let index = 0; index < formatStr.length; index++) {
          const char = value.charAt(index - offset);
          const target = formatStr.charAt(index);

          switch (target) {
            case "#": // Accept any char
              break;
            case "n": // Numbers
              if (isNaN(char)) return false;
              break;
            case "d": // Lower case digit (a-z)
              if (!char.match("[a-z]")) return false;
              break;
            case "D": // Upper case digit (A-Z)
              if (!char.match("[A-Z]")) return false;
              break;
            case "w": // Whole case digit (A-z)
              if (!char.match("[A-z]")) return false;
              break;
            case "/": // Force literal char
              const nextTarget = formatStr.charAt(index + 1);

              if (char !== nextTarget) return false;

              index++;
              offset++;

              break;
            case "\b": // End format (check is input length matches format length)
              if (index - offset < value.length) return false;
              break;
            default: // Literal char
              if (char !== target) return false;
              break;
          }
        }

        return true;
      };

      for (const formatStr of formatStrings) {
        const match = checkFormat(formatStr, value);

        if (match) {
          return true;
        }
      }

      return false;
    });

    createRule("contains", (terms, value) => {
      for (const term of terms) {
        if (value.includes(term)) {
          return true;
        }
      }

      return false;
    });

    createRule("containsAll", (terms, value) => {
      for (const term of terms) {
        if (!value.includes(term)) {
          return false;
        }
      }

      return true;
    });

    createRule("prefix", (prefixes, value) => {
      for (const prefix of prefixes) {
        if (value.startsWith(prefix)) {
          return true;
        }
      }

      return false;
    });

    createRule("sufix", (sufixes, value) => {
      for (const sufix of sufixes) {
        if (value.endsWith(sufix)) {
          return true;
        }
      }

      return false;
    });

    return validator;
  };

  return formJS;
}
