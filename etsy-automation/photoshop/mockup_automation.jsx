// ============================================================
//  MOCKUP BATCH AUTOMATION  v1.9
//  Photoshop ExtendScript (.jsx)
//
//  FIX in v1.9:
//  Auto-detects input/, output/, and mockup.psd sitting next to
//  this script file. If found, runs with zero dialog boxes.
//  Falls back to the original folder/file pickers if not set up
//  yet (first run).
//
//  ONE-TIME SETUP:
//  Put this script in its own folder, e.g. ~/Desktop/EtsyMockups/,
//  alongside your mockup.psd. On first run it will create empty
//  input/ and output/ subfolders there for you.
//
//  EVERY RUN AFTER THAT:
//  Drop design PNGs into input/, then run the script (drag it onto
//  the Photoshop app icon, or File > Scripts > Browse...). No
//  dialogs, no clicking through folder pickers.
//
//  OUTPUT STRUCTURE:
//  output_folder/
//    design-name/
//      Group_1_design-name.jpg
//      Group_2_design-name.jpg
//      ...
// ============================================================

#target photoshop

// ─── SETTINGS ────────────────────────────────────────────────
var JPEG_QUALITY    = 10;               // 1–12 (12 = best)
var SO_NAME_MATCH   = "Change Poster";  // Smart Object name (partial, case-insensitive)
var SUPPORTED_TYPES = ["jpg", "jpeg", "png", "tif", "tiff", "psd", "bmp"];

// FILL_MODE — how artwork fits into the smart object frame:
//   "cover"   → fills frame completely, may crop edges (best for full-bleed prints)
//   "contain" → whole design always visible, transparent space if ratios differ
//   "stretch" → stretches to exact canvas, may distort
var FILL_MODE = "cover";
// ─────────────────────────────────────────────────────────────

app.bringToFront();

// ── Locate input/output/mockup relative to this script ────────
var scriptFolder = new File($.fileName).parent;
var autoMockup   = new File(scriptFolder + "/mockup.psd");
var autoInput    = new Folder(scriptFolder + "/input");
var autoOutput   = new Folder(scriptFolder + "/output");

var inputFolder, mockupFile, outputFolder;

if (autoMockup.exists) {
    // Fully automatic mode — no dialogs
    mockupFile = autoMockup;
    if (!autoInput.exists) autoInput.create();
    if (!autoOutput.exists) autoOutput.create();
    inputFolder  = autoInput;
    outputFolder = autoOutput;
} else {
    // First-run / manual fallback
    alert("MOCKUP AUTOMATION\n\nCouldn't find mockup.psd next to this script, so pick everything manually this time.\n\nTip: save a mockup.psd in this same folder and this dialog won't show again.\n\nYou will now choose:\n 1. Input images folder\n 2. Mockup PSD file\n 3. Output folder");

    inputFolder = Folder.selectDialog("Step 1 of 3 — Select the INPUT IMAGES folder");
    if (!inputFolder) { alert("Cancelled."); }

    mockupFile = File.openDialog("Step 2 of 3 — Select your MOCKUP PSD file", "*.psd,*.psb");
    if (!mockupFile) { alert("Cancelled."); }

    outputFolder = Folder.selectDialog("Step 3 of 3 — Select the OUTPUT folder");
    if (!outputFolder) { alert("Cancelled."); }
}

// ── Measure Smart Object canvas size once ─────────────────────
var soCanvasW = 0;
var soCanvasH = 0;
var soRes     = 72;

var measureDoc   = app.open(mockupFile);
var measureLayer = findLayerByName(measureDoc, SO_NAME_MATCH);

if (!measureLayer) {
    measureDoc.close(SaveOptions.DONOTSAVECHANGES);
    alert("ERROR: Could not find a layer matching \"" + SO_NAME_MATCH + "\" in the PSD.");
}

measureDoc.activeLayer = measureLayer;
executeAction(
    stringIDToTypeID("placedLayerEditContents"),
    new ActionDescriptor(),
    DialogModes.NO
);

var soDoc = app.activeDocument;
soCanvasW = soDoc.width.as("px");
soCanvasH = soDoc.height.as("px");
soRes     = soDoc.resolution;
soDoc.close(SaveOptions.DONOTSAVECHANGES);
measureDoc.close(SaveOptions.DONOTSAVECHANGES);

if (soCanvasW === 0 || soCanvasH === 0) {
    alert("ERROR: Could not read Smart Object canvas dimensions.");
}

// ── Collect input images ──────────────────────────────────────
var allFiles   = inputFolder.getFiles();
var imageFiles = [];

for (var i = 0; i < allFiles.length; i++) {
    if (allFiles[i] instanceof File) {
        var ext = allFiles[i].name.split(".").pop().toLowerCase();
        for (var j = 0; j < SUPPORTED_TYPES.length; j++) {
            if (ext === SUPPORTED_TYPES[j]) {
                imageFiles.push(allFiles[i]);
                break;
            }
        }
    }
}

if (imageFiles.length === 0) {
    alert("No supported images found!\nSupported: " + SUPPORTED_TYPES.join(", "));
}

// Temp file saved as PNG to preserve transparency
var tempFile = new File(Folder.temp + "/mockup_temp_artwork.png");

// ── Process each image ────────────────────────────────────────
var successCount = 0;
var errorLog     = [];

for (var imgIndex = 0; imgIndex < imageFiles.length; imgIndex++) {

    var currentImageFile = imageFiles[imgIndex];
    var imageName        = decodeURI(currentImageFile.name);
    var imageBaseName    = imageName.lastIndexOf(".") > -1
                            ? imageName.substring(0, imageName.lastIndexOf("."))
                            : imageName;

    var mockupDoc = null;
    var artDoc    = null;

    try {
        // ── Create subfolder named after this image ────────────
        var subFolder = new Folder(outputFolder + "/" + sanitizeFileName(imageBaseName));
        if (!subFolder.exists) subFolder.create();

        // ── Pre-resize artwork to CONTAIN inside the SO canvas ─
        artDoc = app.open(currentImageFile);

        var artW   = artDoc.width.as("px");
        var artH   = artDoc.height.as("px");
        var scaleW = soCanvasW / artW;
        var scaleH = soCanvasH / artH;

        // Scale based on FILL_MODE setting
        var scale;
        if (FILL_MODE === "contain") {
            scale = Math.min(scaleW, scaleH);   // whole design fits, may leave space
        } else if (FILL_MODE === "stretch") {
            // Stretch: resize to exact canvas, skip resizeCanvas
            artDoc.resizeImage(
                UnitValue(soCanvasW, "px"),
                UnitValue(soCanvasH, "px"),
                soRes,
                ResampleMethod.BICUBIC
            );
            scale = null; // signal to skip the resize+crop block below
        } else {
            scale = Math.max(scaleW, scaleH);   // cover: fills frame, may crop edges
        }

        if (scale !== null) {
            var newW = Math.round(artW * scale);
            var newH = Math.round(artH * scale);

            artDoc.resizeImage(
                UnitValue(newW, "px"),
                UnitValue(newH, "px"),
                soRes,
                ResampleMethod.BICUBIC
            );

            // Crop/expand canvas to exact SO size, centered
            artDoc.resizeCanvas(
                UnitValue(soCanvasW, "px"),
                UnitValue(soCanvasH, "px"),
                AnchorPosition.MIDDLECENTER
            );
        }

        // Save as PNG — preserves transparency
        var tmpPng         = new PNGSaveOptions();
        tmpPng.compression = 0;
        tmpPng.interlaced  = false;
        artDoc.saveAs(tempFile, tmpPng, true, Extension.LOWERCASE);
        artDoc.close(SaveOptions.DONOTSAVECHANGES);
        artDoc = null;

        // ── Open mockup and replace Smart Object ──────────────
        mockupDoc = app.open(mockupFile);
        var smartLayer = findLayerByName(mockupDoc, SO_NAME_MATCH);

        if (!smartLayer) {
            errorLog.push(imageBaseName + " — Smart Object layer not found.");
            mockupDoc.close(SaveOptions.DONOTSAVECHANGES);
            continue;
        }

        mockupDoc.activeLayer = smartLayer;
        var replaceDesc = new ActionDescriptor();
        replaceDesc.putPath(charIDToTypeID("null"), tempFile);
        executeAction(
            stringIDToTypeID("placedLayerReplaceContents"),
            replaceDesc,
            DialogModes.NO
        );

        // ── Export one JPEG per group into the subfolder ──────
        var groups = getTopLevelGroups(mockupDoc);

        if (groups.length === 0) {
            errorLog.push(imageBaseName + " — No layer groups found.");
            mockupDoc.close(SaveOptions.DONOTSAVECHANGES);
            continue;
        }

        for (var g = 0; g < groups.length; g++) {

            setOnlyGroupVisible(mockupDoc, groups[g]);

            var groupName  = sanitizeFileName(groups[g].name);
            var outputName = groupName + "_" + imageBaseName + ".jpg";
            var outputFile = new File(subFolder + "/" + outputName);

            var dupDoc = mockupDoc.duplicate("_tmp_export_", true);
            dupDoc.flatten();

            var jpegOpts               = new JPEGSaveOptions();
            jpegOpts.quality           = JPEG_QUALITY;
            jpegOpts.embedColorProfile = true;
            jpegOpts.matte             = MatteType.NONE;

            dupDoc.saveAs(outputFile, jpegOpts, true, Extension.LOWERCASE);
            dupDoc.close(SaveOptions.DONOTSAVECHANGES);

            successCount++;
        }

        mockupDoc.close(SaveOptions.DONOTSAVECHANGES);

    } catch (e) {
        errorLog.push(imageBaseName + " — ERROR: " + e.message + " (line " + e.line + ")");
        try { if (artDoc)    artDoc.close(SaveOptions.DONOTSAVECHANGES);    } catch (e2) {}
        try { if (mockupDoc) mockupDoc.close(SaveOptions.DONOTSAVECHANGES); } catch (e3) {}
    }
}

// ── Cleanup temp file ─────────────────────────────────────────
try { if (tempFile.exists) tempFile.remove(); } catch (e) {}

// ── Summary ───────────────────────────────────────────────────
var summary  = "DONE!\n\n";
    summary += "JPEGs saved:       " + successCount + "\n";
    summary += "Images processed:  " + imageFiles.length + "\n";
    summary += "Folders created:   " + imageFiles.length + "\n";
    summary += "Output folder:     " + decodeURI(outputFolder.fsName);

if (errorLog.length > 0) {
    summary += "\n\nERRORS (" + errorLog.length + "):\n" + errorLog.join("\n");
}

alert(summary);


// ============================================================
//  HELPER FUNCTIONS
// ============================================================

function findLayerByName(doc, nameMatch) {
    return searchByName(doc.layers, nameMatch.toLowerCase());
}

function searchByName(layers, nameLower) {
    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        if (layer.name.toLowerCase().indexOf(nameLower) !== -1) {
            return layer;
        }
        if (layer.typename === "LayerSet") {
            var found = searchByName(layer.layers, nameLower);
            if (found) return found;
        }
    }
    return null;
}

function getTopLevelGroups(doc) {
    var groups = [];
    for (var i = 0; i < doc.layers.length; i++) {
        if (doc.layers[i].typename === "LayerSet") {
            groups.push(doc.layers[i]);
        }
    }
    return groups;
}

function setOnlyGroupVisible(doc, targetGroup) {
    for (var i = 0; i < doc.layers.length; i++) {
        doc.layers[i].visible = false;
    }
    targetGroup.visible = true;
}

function sanitizeFileName(name) {
    return name.replace(/[\\\/:\*\?"<>\|]/g, "_").replace(/\s+/g, "_");
}
