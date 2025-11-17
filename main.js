// =======================================================
// 🎯 ELEMENTLARNI TANLAB OLISH
// =======================================================
const buttons          = document.querySelectorAll(".editor-toolbar button");
const fontColorPicker  = document.getElementById("fontColor");
const bgColorPicker    = document.getElementById("bgColor");
const fontFamilySelect = document.getElementById("fontFamily");
const fontSizeSelect   = document.getElementById("fontSize");
const darkModeBtn      = document.getElementById("darkModeBtn");

// CK-editor style buttons
const textColorBtn = document.getElementById("textColorBtn");
const bgColorBtn   = document.getElementById("bgColorBtn");

// LIVE preview elements
const textColorPreview = document.querySelector("#textColorBtn .bx");
const bgColorPreview   = document.querySelector("#bgColorBtn .highlight-icon");

// Editor container
const editorArea = document.querySelector(".editor-area");


// =======================================================
// 🖱 TOOLBAR BUTTON FUNCTIONALITY (execCommand)
// =======================================================
buttons.forEach(button => {
  button.addEventListener("click", () => {
    const cmd = button.dataset.command;
    if (cmd) document.execCommand(cmd, false, null);
    editorArea.focus();
  });
});


// =======================================================
// 🎨 MATN RANGI – LIVE PREVIEW WITH APPLY
// =======================================================
fontColorPicker.addEventListener("input", e => {
  const color = e.target.value;
  textColorPreview.style.color = color;  // Preview color change
  document.execCommand("foreColor", false, color);
  editorArea.focus();
});


// =======================================================
// 🎨 MATN BACKGROUND (HIGHLIGHT) COLOR
// =======================================================
bgColorPicker.addEventListener("input", e => {
  const color = e.target.value;
  bgColorPreview.style.background = color; // Highlight preview
  document.execCommand("hiliteColor", false, color);
  editorArea.focus();
});


// =======================================================
// 🔠 FONT FAMILY & SIZE SELECTORS
// =======================================================
fontFamilySelect.addEventListener("change", e => {
  document.execCommand("fontName", false, e.target.value);
  editorArea.focus();
});

fontSizeSelect.addEventListener("change", e => {
  document.execCommand("fontSize", false, e.target.value);
  editorArea.focus();
});


// =======================================================
// 🔗 LINK INSERT (Prompt-based)
// =======================================================
document.getElementById("insertLinkBtn").addEventListener("click", () => {
  const url = prompt("Havola URL kiriting:", "https://");
  if (url) document.execCommand("createLink", false, url);
});


// =======================================================
// 📋 TABLE INSERT SYSTEM
// =======================================================
const tableBtn         = document.getElementById("tableBtn");
const tableGridPopup   = document.getElementById("tableGridPopup");
const tableGrid        = document.getElementById("tableGrid");
const tableSizeLabel   = document.getElementById("tableSizeLabel");

const maxRows = 10, maxCols = 10;

// --- Create 10×10 grid cells for preview ---
for (let i = 0; i < maxRows * maxCols; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  tableGrid.appendChild(cell);
}

// Show/hide table select popup
tableBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  tableGridPopup.style.display =
    tableGridPopup.style.display === "block" ? "none" : "block";
});

document.addEventListener("click", () => tableGridPopup.style.display = "none");
tableGridPopup.addEventListener("click", (e) => e.stopPropagation());


// =======================================================
// 🔍 TABLE SIZE LIVE HOVER PREVIEW
// =======================================================
tableGrid.addEventListener("mousemove", (e) => {
  if (!e.target.classList.contains("cell")) return;

  const hoveredIndex  = [...tableGrid.children].indexOf(e.target);
  const selectedCols  = (hoveredIndex % maxCols) + 1;
  const selectedRows  = Math.floor(hoveredIndex / maxCols) + 1;

  tableSizeLabel.textContent = `${selectedRows} × ${selectedCols}`;

  [...tableGrid.children].forEach((cell, i) => {
    const col = (i % maxCols) + 1;
    const row = Math.floor(i / maxCols) + 1;
    cell.classList.toggle("active", col <= selectedCols && row <= selectedRows);
  });
});


// =======================================================
// ➕ CLICK → INSERT TABLE + ENABLE RESIZE
// =======================================================
tableGrid.addEventListener("click", () => {
  const [rows, cols] = tableSizeLabel.textContent.split("×").map(Number);

  let html = `<table class="rt-table" style="border-collapse: collapse; width: 100%;" border="1">`;
  for (let r = 0; r < rows; r++) {
    html += `<tr>`;
    for (let c = 0; c < cols; c++) {
      html += `<td style="padding:6px; min-width:40px;">&nbsp;</td>`;
    }
    html += `</tr>`;
  }
  html += `</table><br>`;

  editorArea.focus();
  document.execCommand("insertHTML", false, html);
  tableGridPopup.style.display = "none";

  // Enable resize for newly created table
  setTimeout(() => {
    const insertedTable = editorArea.querySelector("table:last-of-type");
    if (insertedTable) enableTableResize(insertedTable);
  }, 50);
});


// =======================================================
// 🧩 TABLE RESIZING HANDLERS
// =======================================================
function enableTableResize(table) {
  const cells = table.querySelectorAll("td, th");

  cells.forEach(cell => {
    cell.classList.add("resizable");

    const colResize = document.createElement("div");
    colResize.classList.add("col-resizer");
    cell.appendChild(colResize);

    const rowResize = document.createElement("div");
    rowResize.classList.add("row-resizer");
    cell.appendChild(rowResize);

    // --- Horizontal (Column) Resize ---
    colResize.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const startX = e.pageX;
      const startWidth = cell.offsetWidth;

      const mouseMove = (e2) => {
        cell.style.width = `${startWidth + (e2.pageX - startX)}px`;
      };

      const stopResize = () => {
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", stopResize);
      };

      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", stopResize);
    });

    // --- Vertical (Row) Resize ---
    rowResize.addEventListener("mousedown", (e) => {
      e.preventDefault();
      const startY = e.pageY;
      const startHeight = cell.offsetHeight;

      const mouseMove = (e2) => {
        cell.style.height = `${startHeight + (e2.pageY - startY)}px`;
      };

      const stopResize = () => {
        document.removeEventListener("mousemove", mouseMove);
        document.removeEventListener("mouseup", stopResize);
      };

      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("mouseup", stopResize);
    });
  });
}

// ================================
// 🖼 IMAGE INSERT FUNCTIONALITY
// ================================
// Elementlar
const insertImageBtn = document.getElementById("insertImageBtn");
const imageUploader  = document.getElementById("imageUploader");
const imgModal       = document.getElementById("imgModal");
const previewImg     = document.getElementById("previewImg");
const imgWidth       = document.getElementById("imgWidth");
const imgHeight      = document.getElementById("imgHeight");
const btnConfirm     = document.getElementById("insertImgConfirm");
const btnClose       = document.getElementById("closeImgModal");

let uploadedImageSrc = "";

// Open file selector
insertImageBtn.addEventListener("click", () => {
  imageUploader.click();
});

// Choose image and open modal
imageUploader.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    uploadedImageSrc = e.target.result;
    previewImg.src = uploadedImageSrc;

    // Show modal
    imgModal.style.display = "flex";
  };

  reader.readAsDataURL(file);
  this.value = "";
});

// Confirm insert
btnConfirm.addEventListener("click", () => {
  const w = imgWidth.value || 300;
  const h = imgHeight.value || "auto";

  const imgHTML = `
    <div class="img-wrap" contenteditable="false" style="width:${w}px; height:${h === 'auto' ? 'auto' : h+'px'};">
      <img src="${uploadedImageSrc}" />
    </div>
  `;

  document.execCommand("insertHTML", false, imgHTML);
  imgModal.style.display = "none";
  editorArea.focus();
});

// Close modal
btnClose.addEventListener("click", () => { imgModal.style.display = "none"; });


// =======================================================
// 🌙 DARK MODE TOGGLE
// =======================================================
darkModeBtn.onclick = () => {
  document.body.classList.toggle("dark-mode");
};



