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
let currentSpeed = 400;
let isPlaying = false;

// Algorithm metadata registry (pseudocode lines, language code snippets, and step recorder)
const algorithms = {
  bubble: {
    pseudocode: [
      "Repeat until no swaps:",
      "  Start a new pass",
      "  For each pair of adjacent numbers:",
      "    If left > right:",
      "      Swap them",
      "      Mark that a swap happened",
      "  Move to next pass",
    ],
    code: {
      python: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]`,
      c: `void bubbleSort(int arr[], int n) {\n    for (int i = 0; i < n-1; i++) {\n        for (int j = 0; j < n-i-1; j++) {\n            if (arr[j] > arr[j+1]) {\n                int temp = arr[j];\n                arr[j] = arr[j+1];\n                arr[j+1] = temp;\n            }\n        }\n    }\n}`,
      cpp: `void bubbleSort(vector<int>& arr) {\n    int n = arr.size();\n    for (int i = 0; i < n-1; i++) {\n        for (int j = 0; j < n-i-1; j++) {\n            if (arr[j] > arr[j+1]) {\n                swap(arr[j], arr[j+1]);\n            }\n        }\n    }\n}`,
      java: `void bubbleSort(int[] arr) {\n    int n = arr.length;\n    for (int i = 0; i < n-1; i++) {\n        for (int j = 0; j < n-i-1; j++) {\n            if (arr[j] > arr[j+1]) {\n                int temp = arr[j];\n                arr[j] = arr[j+1];\n                arr[j+1] = temp;\n            }\n        }\n    }\n}`
    },
    recordSteps: recordSteps_Bubble
  },
  selection: {
    pseudocode: [
      "Repeat for i = 0 to n-1:",
      "  Find the index of the minimum element in i..n-1",
      "  If min_index != i:",
      "    Swap element at i with element at min_index",
    ],
    code: {
      python: `def selection_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        min_idx = i\n        for j in range(i+1, n):\n            if arr[j] < arr[min_idx]:\n                min_idx = j\n        arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
      c: `void selectionSort(int arr[], int n) {\n    for (int i = 0; i < n-1; i++) {\n        int min_idx = i;\n        for (int j = i+1; j < n; j++) {\n            if (arr[j] < arr[min_idx])\n                min_idx = j;\n        }\n        int temp = arr[i];\n        arr[i] = arr[min_idx];\n        arr[min_idx] = temp;\n    }\n}`,
      cpp: `void selectionSort(vector<int>& arr) {\n    int n = arr.size();\n    for (int i = 0; i < n-1; i++) {\n        int min_idx = i;\n        for (int j = i+1; j < n; j++) {\n            if (arr[j] < arr[min_idx])\n                min_idx = j;\n        }\n        swap(arr[i], arr[min_idx]);\n    }\n}`,
      java: `void selectionSort(int[] arr) {\n    int n = arr.length;\n    for (int i = 0; i < n-1; i++) {\n        int min_idx = i;\n        for (int j = i+1; j < n; j++) {\n            if (arr[j] < arr[min_idx])\n                min_idx = j;\n        }\n        int temp = arr[i];\n        arr[i] = arr[min_idx];\n        arr[min_idx] = temp;\n    }\n}`
    },
    recordSteps: recordSteps_Selection
  }
};

// Map recorded step line indexes to pseudocode line indexes per algorithm
const lineMap = {
  bubble: {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 5, // recordSteps uses 4 after swap -> map to 'Mark that a swap happened'
    5: 6  // end-of-pass -> 'Move to next pass'
  },
  selection: {
    0: 0,
    1: 1,
    2: 1,
    3: 1,
    4: 3 // map the recorded 'before-swap' line to concise swap line index
  }
};

// Which pseudocode index to highlight during a physical 'swap' step
const swapLineMap = {
  bubble: 4,
  selection: 3
};

function highlightPseudoAt(algo, pseudoIndex, colorClass = '') {
  const pseudoEl = document.getElementById("pseudocode");
  if (!pseudoEl) return;
  const meta = algorithms && algorithms[algo] ? algorithms[algo] : null;
  const rawLines = meta && meta.pseudocode ? meta.pseudocode.slice() : [];
  pseudoEl.innerHTML = rawLines.map((l, i) => {
    const classes = i === pseudoIndex ? `highlight ${colorClass}`.trim() : '';
    return `<span class="${classes}">${l}</span>`;
  }).join("\n");
}

function updateCodeVisibility() {
  const algo = algorithmSelect.value;
  const lang = codeToggle.value;
  const pseudoEl = document.getElementById("pseudocode");
  const meta = algorithms && algorithms[algo] ? algorithms[algo] : null;

  if (lang === "pseudo") {
    // show pseudocode for the selected algorithm
    if (pseudoEl) {
      pseudoEl.style.display = "block";
      // set content from algorithm meta (if available)
      if (meta && meta.pseudocode) {
        pseudoEl.innerText = meta.pseudocode.join('\n');
      } else {
        pseudoEl.innerText = '';
      }
    }
    codeDisplay.style.display = "none";
  } else {
    if (pseudoEl) pseudoEl.style.display = "none";
    codeDisplay.style.display = "block";
    // populate language code for the selected algorithm (no highlighting)
    if (meta && meta.code && meta.code[lang]) {
      const raw = meta.code[lang];
      codeDisplay.textContent = raw;
    } else {
      codeDisplay.textContent = '';
    }
  }
}

algorithmSelect.addEventListener("change", () => {
  // Stop and reset when algorithm changes to avoid mid-play inconsistencies
  if (isPlaying) {
    clearInterval(interval);
    isPlaying = false;
    startBtn.textContent = "▶ Start";
  }
  updateCodeVisibility();
  // reset UI state
  resetBtn.click();
});

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
  updateCodeVisibility();
});

// initialize visibility on load
updateCodeVisibility();

function highlightLine(line, colorClass = '') {
  const lang = codeToggle.value;
  if (lang === "pseudo") {
    const algo = algorithmSelect.value;
    const pseudoEl = document.getElementById("pseudocode");
    if (!pseudoEl) return;
    const meta = algorithms && algorithms[algo] ? algorithms[algo] : null;
    const rawLines = meta && meta.pseudocode ? meta.pseudocode.slice() : [];
    // map recorded line index to pseudocode index if mapping exists
    const map = lineMap && lineMap[algo] ? lineMap[algo] : null;
    const target = (map && map[line] !== undefined) ? map[line] : line;
    pseudoEl.innerHTML = rawLines.map((l, i) => {
      const classes = i === target ? `highlight ${colorClass}`.trim() : '';
      return `<span class="${classes}">${l}</span>`;
    }).join("\n");
  } else {
    // When not in pseudocode view we do not highlight code lines.
    return;
  }
}

function generateRandomArray(length = 8) {
  length = Math.min(length, 10);
  return Array.from({ length }, () => Math.floor(Math.random() * 100 + 1));
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
      steps.push({ type: "compare", i, j: i + 1, pass, swaps: swapCounter, line: 2 });
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

function recordSteps_Selection(arr) {
  steps = [];
  let swapCounter = 0;
  for (let i = 0; i < arr.length; i++) {
    steps.push({ type: "line", line: 0 });
    let minIdx = i;
    steps.push({ type: "line", line: 1 });
    for (let j = i + 1; j < arr.length; j++) {
      steps.push({ type: "line", line: 2 });
      steps.push({ type: "compare", i, j, pass: i, swaps: swapCounter, line: 2 });
      if (arr[j] < arr[minIdx]) {
        steps.push({ type: "line", line: 3 });
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      steps.push({ type: "line", line: 4 });
      steps.push({ type: "swap", i, j: minIdx });
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      swapCounter++;
    }
  }
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
      // highlight pseudocode with compare color
      if (codeToggle.value === 'pseudo') {
        const algo = algorithmSelect.value;
        const map = lineMap && lineMap[algo] ? lineMap[algo] : null;
        const target = (map && map[step.line] !== undefined) ? map[step.line] : step.line;
        highlightPseudoAt(algo, target, 'compare');
      }
      break;
    case "swap":
      const bar1 = bars[step.i];
      const bar2 = bars[step.j];
      
      // Swap heights and values
      // highlight the 'Swap' pseudocode line with swap color if showing pseudocode
      if (codeToggle.value === 'pseudo') {
        const algo = algorithmSelect.value;
        const pseudoIdx = swapLineMap && swapLineMap[algo] !== undefined ? swapLineMap[algo] : null;
        if (pseudoIdx !== null) highlightPseudoAt(algo, pseudoIdx, 'swap');
      }

      const tempHeight = bar1.style.height;
      bar1.style.height = bar2.style.height;
      bar2.style.height = tempHeight;

      const tempText = bar1.innerText;
      bar1.innerText = bar2.innerText;
      bar2.innerText = tempText;

      bar1.classList.add("swap");
      bar2.classList.add("swap");
      break;
  }
}

function playSteps() {
  if (interval) clearInterval(interval);
  interval = setInterval(() => {
    if (currentStep >= steps.length) {
      clearInterval(interval);
      isPlaying = false;
      startBtn.textContent = "▶ Start";
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

  // reset playback state and prepare steps for the selected algorithm
  clearInterval(interval);
  isPlaying = false;
  startBtn.textContent = "▶ Start";
  currentStep = 0;
  steps = [];
  const copy = [...data];
  const algo = algorithmSelect.value;
  const meta = algorithms && algorithms[algo] ? algorithms[algo] : null;
  if (meta && typeof meta.recordSteps === 'function') {
    finalSorted = meta.recordSteps(copy);
  } else {
    finalSorted = copy;
  }
};


loadBtn.onclick = () => {
  let values = arrayInput.value.split(",").map(x => parseInt(x.trim())).filter(n => !isNaN(n));
  if (values.length > 10) {
    values = values.slice(0, 10);
    alert("Array size limited to 10. Only first 10 elements will be used.");
  }
  values = values.map(v => Math.min(Math.max(v, 1), 100));
  if (values.length > 0) {
    data = [...values];
    originalArrayText.textContent = JSON.stringify(data);
    sortedArrayText.textContent = "empty";
    renderArray(data);
  }
};

startBtn.onclick = () => {
  // debounce rapid clicks
  if (startBtn.disabled) return;
  startBtn.disabled = true;
  setTimeout(() => startBtn.disabled = false, 180);

  if (isPlaying) {
    // Pause
    clearInterval(interval);
    isPlaying = false;
    startBtn.textContent = "▶ Start";
    return;
  }

  // Play
  if (currentStep === 0) {
    // Starting fresh
    currentStep = 0;
    const copy = [...data];
    const algo = algorithmSelect.value;
    const meta = algorithms && algorithms[algo] ? algorithms[algo] : null;
    if (meta && typeof meta.recordSteps === 'function') {
      finalSorted = meta.recordSteps(copy);
    } else {
      finalSorted = copy;
    }
    sortedArrayText.textContent = "sorting...";
  }
  isPlaying = true;
  startBtn.textContent = "⏸ Pause";
  playSteps();
};

stepBtn.onclick = () => {
  // If playing, pause first
  if (isPlaying) {
    clearInterval(interval);
    isPlaying = false;
    startBtn.textContent = "▶ Start";
  }
  
  // If no steps recorded yet, record them
  if (steps.length === 0 && currentStep === 0) {
    const copy = [...data];
    const algo = algorithmSelect.value;
    const meta = algorithms && algorithms[algo] ? algorithms[algo] : null;
    if (meta && typeof meta.recordSteps === 'function') {
      finalSorted = meta.recordSteps(copy);
    } else {
      finalSorted = copy;
    }
    sortedArrayText.textContent = "sorting...";
  }
  
  // Execute next step
  if (currentStep < steps.length) {
    applyStep(steps[currentStep]);
    currentStep++;
  } else if (currentStep === steps.length) {
    sortedArrayText.textContent = JSON.stringify(finalSorted);
  }
};

resetBtn.onclick = () => {
  clearInterval(interval);
  isPlaying = false;
  startBtn.textContent = "▶ Start";
  renderArray(data);
  currentStep = 0;
  steps = [];
  passCount.textContent = "0";
  indexI.textContent = "-";
  indexJ.textContent = "-";
  swapCount.textContent = "0";
  highlightLine(-1);
  sortedArrayText.textContent = "empty";
};
