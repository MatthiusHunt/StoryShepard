let currentOutlines = [];

function renderOutlines(outlines) {
  const outlinesContainer = document.getElementById('outlines');
  outlinesContainer.innerHTML = '';

  outlines.forEach((outline, index) => {
    const segmentDiv = document.createElement('div');
    segmentDiv.classList.add('segment');

    const titleInput = createTextInput(outline.title, 'Title', (value) => {
      outlines[index].title = value;
    });

    const descriptionInput = createTextArea(outline.description, 'Description', (value) => {
      outlines[index].description = value;
    });

    const subSegmentsDiv = document.createElement('div');
    subSegmentsDiv.classList.add('sub-segments');

    const addSubSegmentBtn = createButtonWithIcon('fa-plus', () => {
      if (!outlines[index].subSegments) {
        outlines[index].subSegments = [];
      }
      outlines[index].subSegments.push({
        title: '',
        description: ''
      });
      renderOutlines(outlines);
    });

    const editSubSegmentBtn = createButtonWithText('Edit', () => {
      if (Array.isArray(outlines[index].subSegments)) {
        currentOutlines = outlines[index].subSegments;
        currentOutlines.__parent = outlines;
        renderOutlines(currentOutlines);
      }
    });

    segmentDiv.appendChild(titleInput);
    segmentDiv.appendChild(descriptionInput);
    subSegmentsDiv.appendChild(addSubSegmentBtn);
    subSegmentsDiv.appendChild(editSubSegmentBtn);

    segmentDiv.appendChild(subSegmentsDiv);
    outlinesContainer.appendChild(segmentDiv);

    if (Array.isArray(outline.subSegments)) {
      outline.subSegments.forEach((subSegment, subIndex) => {
        const subSegmentDiv = createSubSegment(outlines, index, subSegment, subIndex);
        subSegmentsDiv.appendChild(subSegmentDiv);
      });
    }
  });

  updateLevelIndicator(outlines);
}

function createTextInput(value, placeholder, onInput) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value || '';
  input.placeholder = placeholder;
  input.addEventListener('input', (event) => onInput(event.target.value));
  return input;
}

function createTextArea(value, placeholder, onInput) {
  const input = document.createElement('textarea');
  input.value = value || '';
  input.placeholder = placeholder;
  input.addEventListener('input', (event) => onInput(event.target.value));
  return input;
}

function createButtonWithIcon(iconClass, onClick) {
  const button = document.createElement('button');
  const icon = document.createElement('i');
  icon.classList.add('fa-solid', iconClass);
  button.appendChild(icon);
  button.addEventListener('click', onClick);
  return button;
}

function createButtonWithText(text, onClick) {
  const button = document.createElement('button');
  button.textContent = text;
  button.addEventListener('click', onClick);
  return button;
}

function createSubSegment(outlines, index, subSegment, subIndex) {
  const subSegmentDiv = document.createElement('div');
  subSegmentDiv.classList.add('segment');

  const subTitleInput = createTextInput(subSegment.title, 'Title', (value) => {
    outlines[index].subSegments[subIndex].title = value;
  });

  const subDescriptionInput = createTextArea(subSegment.description, 'Description', (value) => {
    outlines[index].subSegments[subIndex].description = value;
  });

  const moveUpBtn = createButtonWithIcon('fa-arrow-up', () => {
    moveSubSegment(outlines[index].subSegments, subIndex, -1);
    renderOutlines(outlines);
  });

  const moveDownBtn = createButtonWithIcon('fa-arrow-down', () => {
    moveSubSegment(outlines[index].subSegments, subIndex, 1);
    renderOutlines(outlines);
  });

  subSegmentDiv.appendChild(subTitleInput);
  subSegmentDiv.appendChild(subDescriptionInput);
  subSegmentDiv.appendChild(moveUpBtn);
  subSegmentDiv.appendChild(moveDownBtn);

  return subSegmentDiv;
}

function moveSubSegment(array, index, offset) {
  const newIndex = index + offset;
  if (newIndex >= 0 && newIndex < array.length) {
    [array[index], array[newIndex]] = [array[newIndex], array[index]];
  }
}

function updateLevelIndicator(outlines) {
  const levelIndicator = document.getElementById('currentLevel');
  levelIndicator.textContent = `Level: ${calculateDepth(outlines)}`;
}


function goToParentLevel() {
  if (currentOutlines.__parent) {
    currentOutlines = currentOutlines.__parent;
    renderOutlines(currentOutlines);
  }
}


function goToChildLevel() {
  // Check if the current level has sub-segments
  if (currentOutlines && currentOutlines.length > 0 && currentOutlines[0].subSegments) {
    // Set the __parent reference for back navigation
    currentOutlines[0].subSegments.__parent = currentOutlines;

    // Navigate to the sub-segments of the first segment in the current level
    currentOutlines = currentOutlines[0].subSegments;
    renderOutlines(currentOutlines);

    // Update the level indicator
    updateLevelIndicator(currentOutlines);
  }
}


function calculateDepth(outlines) {
  let depth = 1;
  let current = outlines;
  while (current.__parent) {
    depth++;
    current = current.__parent;
  }
  return depth;
}


// Initial outline for demonstration
currentOutlines = [{
  title: 'Title: Main Level',
  description: 'Elevator Pitch',
  subSegments: [],
}, ];

// Initial rendering
renderOutlines(currentOutlines);


// Function to reset outlines
function resetOutlines() {
  currentOutlines = [{
    title: 'Title: Main Level',
    description: 'Elevator Pitch',
    subSegments: [],
  }, ];
  // Re-render the outlines
  renderOutlines(currentOutlines);
}

// Add event listener to the reset button
document.getElementById('resetButton').addEventListener('click', resetOutlines);


// Recursive function to write outline details to the document
function writeOutlineToDocument(outline, level, doc) {
  doc.write(`<p><strong>${level}. ${outline.title}</strong>: ${outline.description}</p>`);

  if (Array.isArray(outline.subSegments)) {
    outline.subSegments.forEach((subSegment, index) => {
      const subLevel = `${level}.${index + 1}`;
      writeOutlineToDocument(subSegment, subLevel, doc);
    });
  }
}

function downloadOutlines() {
  // Function to find the topmost parent level
  function findTopLevel(outlines) {
    let currentLevel = outlines;
    while (currentLevel.__parent) {
      currentLevel = currentLevel.__parent;
    }
    return currentLevel;
  }

  // Function to capture text from all levels
  function captureText(outline, depth = 0) {
    let text = `${'   '.repeat(depth)}${outline.title ? outline.title + '\n' : ''}${'   '.repeat(depth)}${outline.description ? outline.description + '\n' : ''}`;

    if (outline.subSegments && Array.isArray(outline.subSegments)) {
      outline.subSegments.forEach(subSegment => {
        text += captureText(subSegment, depth + 1);
      });
    }

    return text;
  }

  // Start from the topmost level
  const topLevelOutlines = findTopLevel(currentOutlines);

  // Apply the recursive function to each main segment
  const outlinesText = topLevelOutlines.map(outline => captureText(outline)).join('\n');

  // Create a Blob and download as before
  const blob = new Blob([outlinesText], {
    type: "text/plain"
  });
  const link = document.createElement("a");
  link.download = "outlines.txt";
  link.href = window.URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
