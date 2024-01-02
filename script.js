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
    addSubSegmentBtn.title = "Add Sub-Segment";



    segmentDiv.appendChild(titleInput);
    subSegmentsDiv.appendChild(addSubSegmentBtn);
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

  const subTitleInput = createTextInput(subSegment.title, 'One sentence description', (value) => {
    outlines[index].subSegments[subIndex].title = value;
  });


  const moveUpBtn = createButtonWithIcon('fa-arrow-up', () => {
    moveSubSegment(outlines[index].subSegments, subIndex, -1);
    renderOutlines(outlines);
  });
  moveUpBtn.title = "Move Segment Up";

  const moveDownBtn = createButtonWithIcon('fa-arrow-down', () => {
    moveSubSegment(outlines[index].subSegments, subIndex, 1);
    renderOutlines(outlines);
  });
  moveDownBtn.title = "Move Segment Down";

  subSegmentDiv.appendChild(subTitleInput);
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
  // Create a new array to hold all sub-segments from the current level
  let allSubSegments = [];

  // Check if the current level has segments and gather all their sub-segments
  if (currentOutlines && currentOutlines.length > 0) {
    currentOutlines.forEach(outline => {
      if (outline.subSegments && outline.subSegments.length > 0) {
        allSubSegments = allSubSegments.concat(outline.subSegments);
      }
    });
  }

  // Check if we have gathered any sub-segments
  if (allSubSegments.length > 0) {
    // Set the __parent reference for back navigation
    allSubSegments.__parent = currentOutlines;

    // Navigate to the combined sub-segments
    currentOutlines = allSubSegments;
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
  title: 'Your Project',
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

  function captureText(outline, numberString = '0') {
    let text = `${numberString} ${outline.title ? outline.title + '\n' : ''}`;

    if (outline.subSegments && Array.isArray(outline.subSegments)) {
      outline.subSegments.forEach((subSegment, index) => {
        let newNumberString = `${numberString}.${index + 1}`;
        text += captureText(subSegment, newNumberString);
      });
    }

    return text;
  }

  // Start from the topmost level
  const topLevelOutlines = findTopLevel(currentOutlines);

  // Use the title of the first top-level outline as the filename, if available
  const filename = topLevelOutlines.length > 0 && topLevelOutlines[0].title ?
    topLevelOutlines[0].title.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.txt' :
    'outlines.txt'; // Default filename if no title

  // Apply the recursive function to each main segment
  const outlinesText = topLevelOutlines.map(outline => captureText(outline)).join('\n');

  // Create a Blob and download
  const blob = new Blob([outlinesText], {
    type: "text/plain"
  });
  const link = document.createElement("a");
  link.download = filename; // Set the filename
  link.href = window.URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}




function importOutlines(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const content = e.target.result;
      // Parse the content and reconstruct the outline
      currentOutlines = parseContentToOutline(content);
      renderOutlines(currentOutlines);
    };
    reader.readAsText(file);
  }
}





function parseContentToOutline(content) {
  const lines = content.trim().split('\n');
  const outlines = [];
  let currentOutlineLevelStack = [outlines];

  lines.forEach(line => {
    const numberString = line.split(' ')[0];
    const depth = numberString.split('.').length - 1;
    const title = line.substring(numberString.length + 1).trim();

    const newOutline = {
      title: title,
      subSegments: []
    };

    while (currentOutlineLevelStack.length - 1 > depth) {
      currentOutlineLevelStack.pop();
    }

    currentOutlineLevelStack[currentOutlineLevelStack.length - 1].push(newOutline);

    currentOutlineLevelStack.push(newOutline.subSegments);
  });

  return outlines;
}
