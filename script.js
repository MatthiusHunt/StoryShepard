let currentOutlines = [];

function renderOutlines(outlines) {
  const outlinesContainer = document.getElementById('outlines');
  outlinesContainer.innerHTML = '';

  outlines.forEach((outline, index) => {
    const segmentDiv = document.createElement('div');
    segmentDiv.classList.add('segment');

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.value = outline.title || '';
    titleInput.placeholder = 'Title';
    titleInput.addEventListener('input', (event) => {
      outlines[index].title = event.target.value;
    });

    const descriptionInput = document.createElement('textarea');
    descriptionInput.value = outline.description || '';
    descriptionInput.placeholder = 'Description';
    descriptionInput.addEventListener('input', (event) => {
      outlines[index].description = event.target.value;
    });

    const subSegmentsDiv = document.createElement('div');
    subSegmentsDiv.classList.add('sub-segments');

    const addSubSegmentBtn = document.createElement('button');
    addSubSegmentBtn.textContent = 'Add Sub-Level';
    addSubSegmentBtn.addEventListener('click', () => {
      if (!outlines[index].subSegments) {
        outlines[index].subSegments = [];
      }
      outlines[index].subSegments.push({ title: '', description: '' });
      renderOutlines(outlines);
    });

    const editSubSegmentBtn = document.createElement('button');
    editSubSegmentBtn.textContent = 'Edit Sub-Level(s)';
    editSubSegmentBtn.addEventListener('click', () => {
      if (Array.isArray(outlines[index].subSegments)) {
        currentOutlines = outlines[index].subSegments;
        currentOutlines.__parent = outlines; // Save the parent level
        renderOutlines(currentOutlines);
      }
    });

    segmentDiv.appendChild(titleInput);
    segmentDiv.appendChild(descriptionInput);
    segmentDiv.appendChild(addSubSegmentBtn);
    segmentDiv.appendChild(editSubSegmentBtn);
    segmentDiv.appendChild(subSegmentsDiv);

    outlinesContainer.appendChild(segmentDiv);

    if (Array.isArray(outline.subSegments)) {
      outline.subSegments.forEach((subSegment, subIndex) => {
        const subSegmentDiv = document.createElement('div');
        subSegmentDiv.classList.add('segment');

        const subTitleInput = document.createElement('input');
        subTitleInput.type = 'text';
        subTitleInput.value = subSegment.title || '';
        subTitleInput.placeholder = 'Title';
        subTitleInput.addEventListener('input', (event) => {
          outlines[index].subSegments[subIndex].title = event.target.value;
        });

        const subDescriptionInput = document.createElement('textarea');
        subDescriptionInput.value = subSegment.description || '';
        subDescriptionInput.placeholder = 'Description';
        subDescriptionInput.addEventListener('input', (event) => {
          outlines[index].subSegments[subIndex].description = event.target.value;
        });

        const moveUpBtn = document.createElement('button');
        moveUpBtn.textContent = 'Move Up';
        moveUpBtn.addEventListener('click', () => {
          moveSubSegment(outlines[index].subSegments, subIndex, -1);
          renderOutlines(outlines);
        });

        const moveDownBtn = document.createElement('button');
        moveDownBtn.textContent = 'Move Down';
        moveDownBtn.addEventListener('click', () => {
          moveSubSegment(outlines[index].subSegments, subIndex, 1);
          renderOutlines(outlines);
        });

        subSegmentDiv.appendChild(subTitleInput);
        subSegmentDiv.appendChild(subDescriptionInput);
        subSegmentDiv.appendChild(moveUpBtn);
        subSegmentDiv.appendChild(moveDownBtn);

        subSegmentsDiv.appendChild(subSegmentDiv);
      });
    }
  });
}

function moveSubSegment(array, index, offset) {
  const newIndex = index + offset;
  if (newIndex >= 0 && newIndex < array.length) {
    // Swap elements
    [array[index], array[newIndex]] = [array[newIndex], array[index]];
  }
}

function goToParentLevel() {
  // Check if there is a parent level
  if (currentOutlines.__parent) {
    currentOutlines = currentOutlines.__parent;
    renderOutlines(currentOutlines);
  }
}

// Initial outline for demonstration
currentOutlines = [
  {
    title: 'Title: Main Level',
    description: 'Elevator Pitch',
    subSegments: [
      {
        title: 'Part 1',
        description: 'This is the beginning of your story',
      },
      {
        title: 'Part 2',
        description: 'This is the middle of your story',
      },
      {
        title: 'Part 3',
        description: 'This is the end of your story',
      },
    ],
  },
];

// Initial rendering
renderOutlines(currentOutlines);


// View the outline, line by line as a txt document
function viewLineByLine() {
  // Check if there are currentOutlines to display
  if (currentOutlines.length > 0) {
    // Create a new window or tab for the line-by-line view
    const lineByLineWindow = window.open('', '_blank');
    
    // Write the line-by-line content to the new window
    lineByLineWindow.document.write('<h2>Line-by-Line View</h2>');
    currentOutlines.forEach((outline, index) => {
      lineByLineWindow.document.write(`<p><strong>${index + 1}. ${outline.title}</strong>: ${outline.description}</p>`);
      
      if (Array.isArray(outline.subSegments)) {
        outline.subSegments.forEach((subSegment, subIndex) => {
          lineByLineWindow.document.write(`<p>&nbsp;&nbsp;&nbsp;&nbsp;<strong>${index + 1}.${subIndex + 1}. ${subSegment.title}</strong>: ${subSegment.description}</p>`);
        });
      }
    });

    // Close the document to finalize the content
    lineByLineWindow.document.close();
  } else {
    // Alert the user if there are no outlines to display
    alert('No outlines available. Please create an outline first.');
  }
}

