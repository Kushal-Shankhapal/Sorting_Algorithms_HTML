// script.js
const arrayContainer = document.getElementById("arrayContainer");
const generateBtn = document.getElementById("generateBtn");
const loadBtn = document.getElementById("loadBtn");
const startBtn = document.getElementById("startBtn");
const stepBtn = document.getElementById("stepBtn");
const resetBtn = document.getElementById("resetBtn");
const arrayInput = document.getElementById("arrayInput");
const speedSlider = document.getElementById("speedRange");
const algorithmSelect = document.getElementById("algorithmSelect");

const passCount = document.getElementById("passCount");
const indexI = document.getElementById("indexI");
const indexJ = document.getElementById("indexJ");
const swapCount = document.getElementById("swapCount");
const pseudocode = document.getElementById("pseudocode");
const originalArrayText = document.getElementById("originalArray");
const sortedArrayText = document.getElementById("sortedArray");

const codeToggle = document.getElementById("codeToggle");
const codeDisplay = document.getElementById("languageCode");
const speedLabel = document.getElementById("speedLabel");

let data = [];
let steps = [];
let currentStep = 0;
let interval = null;
let finalSorted = [];
let currentSpeed = 800;

speedSlider.addEventListener("input", () => {
  currentSpeed = 1600 - parseInt(speedSlider.value);
  const speedX = Math.round((1600 - currentSpeed) / 400);
  speedLabel.textContent = `${speedX}x`;
  if (interval) {
    clearInterval(interval);
    playSteps();
  }
});

codeToggle.addEventListener("change", () => {
  const lang = codeToggle.value;
  let code = "";
  pseudocode.style.display = lang === "pseudo" ? "block" : "none";
  codeDisplay.style.display = lang === "pseudo" ? "none" : "block";
  if (lang === "python") {
    code = `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]`;
  } else if (lang === "c") {
    code = `void bubbleSort(int arr[], int n) {\n    for (int i = 0; i < n-1; i++) {\n        for (int j = 0; j < n-i-1; j++) {\n            if (arr[j] > arr[j+1]) {\n                int temp = arr[j];\n                arr[j] = arr[j+1];\n                arr[j+1] = temp;\n            }\n        }\n    }\n}`;
  } else if (lang === "cpp") {
    code = `void bubbleSort(vector<int>& arr) {\n    int n = arr.size();\n    for (int i = 0; i < n-1; i++) {\n        for (int j = 0; j < n-i-1; j++) {\n            if (arr[j] > arr[j+1]) {\n                swap(arr[j], arr[j+1]);\n            }\n        }\n    }\n}`;
  } else if (lang === "java") {
    code = `void bubbleSort(int[] arr) {\n    int n = arr.length;\n    for (int i = 0; i < n-1; i++) {\n        for (int j = 0; j < n-i-1; j++) {\n            if (arr[j] > arr[j+1]) {\n                int temp = arr[j];\n                arr[j] = arr[j+1];\n                arr[j+1] = temp;\n            }\n        }\n    }\n}`;
  }
  codeDisplay.textContent = code;
});

function highlightLine(line) {
  const lines = pseudocode.innerText.split('\n');
  pseudocode.innerHTML = lines.map((l, i) => `<span class="${i === line ? 'highlight' : ''}">${l}</span>`).join("\n");
}

function generateRandomArray(length = 8) {
  return Array.from({ length }, () => Math.floor(Math.random() * 90 + 10));
}

function renderArray(arr) {
  arrayContainer.innerHTML = "";
  arr.forEach((val, i) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.height = `${val * 3}px`;
    bar.dataset.index = i;
    bar.innerText = val;
    arrayContainer.appendChild(bar);
  });
}

function recordSteps_Bubble(arr) {
  steps = [];
  let swapped;
  let pass = 0;
  let swapCounter = 0;
  do {
    swapped = false;
    steps.push({ type: "line", line: 0 });
    steps.push({ type: "line", line: 1 });
    for (let i = 0; i < arr.length - pass - 1; i++) {
      steps.push({ type: "line", line: 2 });
      steps.push({ type: "compare", i, j: i + 1, pass, swaps: swapCounter });
      if (arr[i] > arr[i + 1]) {
        steps.push({ type: "line", line: 3 });
        steps.push({ type: "swap", i, j: i + 1 });
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapCounter++;
        swapped = true;
        steps.push({ type: "line", line: 4 });
      }
    }
    steps.push({ type: "line", line: 5 });
    pass++;
  } while (swapped);
  return arr;
}

function applyStep(step) {
  const bars = document.querySelectorAll(".bar");
  bars.forEach(bar => bar.classList.remove("highlight", "swap", "sorted"));

  if (!step) return;

  switch (step.type) {
    case "line":
      highlightLine(step.line);
      break;
    case "compare":
      bars[step.i].classList.add("highlight");
      bars[step.j].classList.add("highlight");
      indexI.textContent = step.i;
      indexJ.textContent = step.j;
      passCount.textContent = step.pass;
      swapCount.textContent = step.swaps;
      break;
    case "swap":
      const temp = bars[step.i].style.height;
      bars[step.i].style.height = bars[step.j].style.height;
      bars[step.j].style.height = temp;

      const tempText = bars[step.i].innerText;
      bars[step.i].innerText = bars[step.j].innerText;
      bars[step.j].innerText = tempText;

      bars[step.i].classList.add("swap");
      bars[step.j].classList.add("swap");
      break;
  }
}

function playSteps() {
  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    if (currentStep >= steps.length) {
      clearInterval(interval);
      sortedArrayText.textContent = JSON.stringify(finalSorted);
      return;
    }
    applyStep(steps[currentStep]);
    currentStep++;
  }, currentSpeed);
}

generateBtn.onclick = () => {
  data = generateRandomArray();
  arrayInput.value = data.join(",");
  originalArrayText.textContent = JSON.stringify(data);
  sortedArrayText.textContent = "empty";
  renderArray(data);
};

loadBtn.onclick = () => {
  const values = arrayInput.value.split(",").map(x => parseInt(x.trim())).filter(n => !isNaN(n));
  if (values.length > 0) {
    data = [...values];
    originalArrayText.textContent = JSON.stringify(data);
    sortedArrayText.textContent = "empty";
    renderArray(data);
  }
};

startBtn.onclick = () => {
  currentStep = 0;
  const copy = [...data];
  finalSorted = recordSteps_Bubble(copy);
  sortedArrayText.textContent = "sorting...";
  playSteps();
};

stepBtn.onclick = () => {
  if (currentStep < steps.length) {
    applyStep(steps[currentStep]);
    currentStep++;
  } else if (currentStep === steps.length) {
    sortedArrayText.textContent = JSON.stringify(finalSorted);
  }
};

resetBtn.onclick = () => {
  clearInterval(interval);
  renderArray(data);
  currentStep = 0;
  passCount.textContent = "0";
  indexI.textContent = "-";
  indexJ.textContent = "-";
  swapCount.textContent = "0";
  highlightLine(-1);
  sortedArrayText.textContent = "empty";
};
