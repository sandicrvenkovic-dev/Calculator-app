let firstOperand = null;
let secondOperand = null;
let operator = null;
let shouldStartNewNumber = true;

const buttons = document.querySelectorAll(".buttons button");
const display = document.querySelector(".display");
const status = document.querySelector(".status");
const decimalButton = document.querySelector('[data-action="decimal"]');

let currentInput = "0";
let expression = "";
display.value = "0";

function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

function multiply(a, b) {
  return a * b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error("Nice try. Cannot divide by zero.");
  }
  return a / b;
}

function squareRoot(a) {
  if (a < 0) {
    throw new Error("Cannot take the square root of a negative number");
  }
  return Math.sqrt(a);
}

function calculate(a, b, operator) {
  switch (operator) {
    case "+":
      return add(a, b);
    case "-":
      return subtract(a, b);
    case "*":
      return multiply(a, b);
    case "/":
      return divide(a, b);
    default:
      throw new Error("Invalid operator");
  }
}

// Remove unnecessary decimals and keep large or tiny results readable.
function formatNumber(num) {
  if (!Number.isFinite(num)) throw new Error("Invalid number");
  const rounded = Number(num.toPrecision(10));
  const text = String(rounded);
  return text.length <= 12 ? text : rounded.toExponential(5);
}

function updateDisplay() {
  if (operator === null) {
    expression = currentInput;
  } else if (shouldStartNewNumber) {
    expression = `${formatNumber(firstOperand)} ${operator}`;
  } else {
    expression = `${formatNumber(firstOperand)} ${operator} ${currentInput}`;
  }
  display.value = expression;
  display.classList.remove("error");
  status.textContent = expression;
  // Keep long expressions visible at the right edge of the input.
  display.scrollLeft = display.scrollWidth;
  decimalButton.disabled = !shouldStartNewNumber && currentInput.includes(".");
  buttons.forEach((button) => {
    if (button.dataset.action === "operator") {
      const selected = button.dataset.value === operator;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    }
  });
}

// Reset failed calculations while retaining a helpful error message.
function showError(error) {
  firstOperand = null;
  secondOperand = null;
  operator = null;
  currentInput = "0";
  expression = "";
  shouldStartNewNumber = true;
  updateDisplay();
  display.value = "Error";
  display.classList.add("error");
  status.textContent = error.message;
}

function enterDigit(digit) {
  if (shouldStartNewNumber || display.value === "Error") {
    currentInput = digit;
    shouldStartNewNumber = false;
  } else if (currentInput === "0") {
    currentInput = digit;
  } else if (currentInput.replace(/[^0-9]/g, "").length < 12) {
    currentInput += digit;
  }
  updateDisplay();
}

function enterDecimal() {
  if (shouldStartNewNumber || display.value === "Error") {
    currentInput = "0.";
    shouldStartNewNumber = false;
  } else if (!currentInput.includes(".")) {
    currentInput += ".";
  }
  updateDisplay();
}

function chooseOperator(nextOperator) {
  if (display.value === "Error") return;

  if (operator !== null && shouldStartNewNumber) {
    operator = nextOperator;
    updateDisplay();
    return;
  }

  if (operator !== null) {
    calculateResult();
    if (display.value === "Error") return;
  }
  firstOperand = Number(currentInput);
  operator = nextOperator;
  secondOperand = null;
  shouldStartNewNumber = true;
  updateDisplay();
}

function calculateResult() {
  if (operator === null || firstOperand === null || shouldStartNewNumber) {
    return;
  }
  secondOperand = Number(currentInput);

  try {
    const result = calculate(firstOperand, secondOperand, operator);
    currentInput = formatNumber(result);
    firstOperand = null;
    operator = null;
    secondOperand = null;
    shouldStartNewNumber = true;
    updateDisplay();
  } catch (error) {
    showError(error);
  }
}

function clearAll() {
  firstOperand = null;
  secondOperand = null;
  operator = null;
  currentInput = "0";
  expression = "";
  shouldStartNewNumber = true;
  updateDisplay();
}

function backspace() {
  if (display.value === "Error") return clearAll();
  if (shouldStartNewNumber) return;
  currentInput = currentInput.slice(0, -1);
  if (currentInput === "" || currentInput === "-") {
    currentInput = "0";
  }
  updateDisplay();
}

// Percent means the current number divided by 100.
function calculatePercentage() {
  if (display.value === "Error") return;
  if (operator !== null && shouldStartNewNumber) return;
  try {
    currentInput = formatNumber(Number(currentInput) / 100);
    shouldStartNewNumber = operator === null;
    updateDisplay();
  } catch (error) {
    showError(error);
  }
}

function applySquareRoot() {
  if (display.value === "Error") return;
  if (operator !== null && shouldStartNewNumber) return;
  try {
    currentInput = formatNumber(squareRoot(Number(currentInput)));
    // Preserve a pending operation: 9 + 16 √ = becomes 9 + 4 =.
    shouldStartNewNumber = operator === null;
    updateDisplay();
  } catch (error) {
    showError(error);
  }
}

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    const value = button.dataset.value;

    switch (action) {
      case "digit":
        enterDigit(value);
        break;
      case "decimal":
        enterDecimal();
        break;
      case "operator":
        chooseOperator(value);
        break;
      case "equals":
        calculateResult();
        break;
      case "clear-all":
        clearAll();
        break;
      case "backspace":
        backspace();
        break;
      case "percent":
        calculatePercentage();
        break;
      case "sqrt":
        applySquareRoot();
        break;
      default:
        break;
    }
  });
});

// Keyboard input uses the same functions as the buttons.
document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key;
  if (/^[0-9]$/.test(key)) enterDigit(key);
  else if (["+", "-", "*", "/"].includes(key)) chooseOperator(key);
  else if (key === "Enter" || key === "=") calculateResult();
  else if (key === ".") enterDecimal();
  else if (key === "Escape" || key === "Delete") clearAll();
  else if (key === "Backspace") backspace();
  else if (key === "%") calculatePercentage();
  else return;
  event.preventDefault();
});

updateDisplay();
