const boards = [
  { name: "Arduino Uno", audioBudget: 24 * 1024 },
  { name: "Arduino Nano", audioBudget: 24 * 1024 },
  { name: "Arduino Mega 2560", audioBudget: 60 * 1024 },
  { name: "ESP8266", audioBudget: 700 * 1024 },
  { name: "ESP32", audioBudget: 900 * 1024 }
];

const audioChunkSize = 16000;

const fileInput = document.getElementById("audioFiles");
const convertButton = document.getElementById("convertButton");
const clearButton = document.getElementById("clearButton");
const downloadLink = document.getElementById("downloadLink");
const languageToggle = document.getElementById("languageToggle");
const uploadZone = document.getElementById("uploadZone");
const statusEl = document.getElementById("status");
const clipCountEl = document.getElementById("clipCount");
const audioBytesEl = document.getElementById("audioBytes");
const headerBytesEl = document.getElementById("headerBytes");
const fileSelectionEl = document.getElementById("fileSelection");
const boardRows = document.getElementById("boardRows");
const clipRows = document.getElementById("clipRows");
const sampleRateInputs = document.querySelectorAll('input[name="sampleRate"]');

let downloadUrl = "";
let currentLanguage = "en";
let currentAudioBytes = 0;
let currentClips = [];
let currentStatus = null;

const defaultSettings = {
  sampleRate: 8000,
  threshold: 0.01,
  peak: 0.98,
  fadeSeconds: 0.003
};

const translations = {
  en: {
    metaTitle: "Audio to Arduino Converter | Chuyển đổi file âm thanh sang mã Arduino",
    metaDescription: "Convert audio files to Arduino code and generate audio_data.h from MP3, WAV, and OGG in the browser. Supports Arduino, ESP32, and ESP8266.",
    metaKeywords: "audio to Arduino converter, convert audio files to Arduino code, chuyển đổi file âm thanh sang mã Arduino, MP3 to Arduino code, WAV to Arduino code, audio_data.h, PROGMEM audio, ESP32 audio converter",
    ogDescription: "Convert MP3, WAV, and OGG into Arduino audio_data.h code in the browser, with memory checks for Arduino, ESP32, and ESP8266 boards.",
    twitterDescription: "Convert audio files to Arduino code and generate audio_data.h for Arduino, ESP32, and ESP8266.",
    languageAria: "Switch to Vietnamese",
    languageButton: "Switch language",
    eyebrow: "Browser audio tool",
    title: "Audio to Arduino Header Converter",
    intro: "Convert audio files into <code>audio_data.h</code> for playback on Arduino, ESP32, or ESP8266.",
    uploadTitle: "Upload audio files",
    uploadLabel: "Choose one or more MP3, WAV, or OGG files",
    dropHint: "Drag and drop audio files here, or use the button below.",
    filePickerButton: "Choose audio files",
    noFileSelected: "No files selected",
    selectedOneFile: "1 file selected: {name}",
    selectedManyFiles: "{count} files selected: {names}",
    qualityTitle: "Audio quality",
    qualityNote: "Higher sample rates sound clearer, but they use more memory. PWM output is cleaner than direct speaker mode.",
    sampleRateGroupLabel: "Audio sample rate",
    rate8000: "Smallest file",
    rate11025: "Better speech",
    rate16000: "Clearer audio",
    rate22050: "Best quality",
    convertButton: "Create .h file",
    downloadButton: "Download audio_data.h",
    clearButton: "Clear",
    fileNameNote: "Valid file names: <code>hello_world.mp3</code>, <code>alarm_1.wav</code>, <code>start_sound.ogg</code>.",
    memoryTitle: "Memory estimate",
    clipCountLabel: "Clips",
    audioBytesLabel: "Audio data",
    headerBytesLabel: "Header file",
    memoryNote: "This estimate includes all clips. On AVR boards, keep selected audio under about 60 KB; define only clips you use.",
    boardTableLabel: "Board memory estimate",
    boardColumn: "Board",
    budgetColumn: "Audio budget",
    resultColumn: "Result",
    clipListTitle: "Clip list",
    clipTableLabel: "Audio clip list",
    clipNameColumn: "Clip name",
    durationColumn: "Duration",
    dataColumn: "Data",
    fits: "✓ Fits",
    tooLarge: "✕ Too large",
    remaining: "{value} remaining",
    over: "{value} over",
    noClipData: "No data yet",
    duplicateName: "duplicate name",
    noFiles: "No audio file selected.",
    noAudioFilesDropped: "No audio files were dropped.",
    dropUnsupported: "Drag and drop is not available in this browser. Please use the file button.",
    invalidFiles: "Invalid file name: {files}",
    converting: "Converting...",
    processingFile: "Processing {name}...",
    generated: "audio_data.h is ready.",
    cannotConvert: "This audio file could not be converted in the browser."
  },
  vi: {
    metaTitle: "Chuyển đổi file âm thanh sang mã Arduino | Tạo audio_data.h",
    metaDescription: "Chuyển đổi file âm thanh sang mã Arduino, tạo audio_data.h từ MP3, WAV, OGG ngay trong trình duyệt. Hỗ trợ Arduino, ESP32 và ESP8266.",
    metaKeywords: "chuyển đổi file âm thanh sang mã Arduino, chuyen doi file am thanh sang ma Arduino, tạo mã Arduino từ âm thanh, MP3 sang Arduino, WAV sang Arduino, audio_data.h, PROGMEM audio, ESP32 audio converter",
    ogDescription: "Tạo mã Arduino từ file âm thanh MP3, WAV, OGG bằng audio_data.h ngay trong trình duyệt. Có kiểm tra dung lượng cho Arduino, ESP32 và ESP8266.",
    twitterDescription: "Tạo audio_data.h từ MP3, WAV, OGG cho Arduino, ESP32 và ESP8266 ngay trong trình duyệt.",
    languageAria: "Switch to English",
    languageButton: "Chuyển ngôn ngữ",
    eyebrow: "Công cụ âm thanh trên trình duyệt",
    title: "Chuyển âm thanh sang header Arduino",
    intro: "Chuyển file âm thanh thành <code>audio_data.h</code> để phát bằng Arduino, ESP32 hoặc ESP8266.",
    uploadTitle: "Tải file âm thanh",
    uploadLabel: "Chọn một hoặc nhiều file MP3, WAV hoặc OGG",
    dropHint: "Kéo thả file âm thanh vào đây, hoặc dùng nút bên dưới.",
    filePickerButton: "Chọn file âm thanh",
    noFileSelected: "Chưa chọn file nào",
    selectedOneFile: "Đã chọn 1 file: {name}",
    selectedManyFiles: "Đã chọn {count} file: {names}",
    qualityTitle: "Chất lượng âm thanh",
    qualityNote: "Tần số càng cao âm thanh càng rõ, nhưng tốn bộ nhớ hơn. Chế độ PWM nghe sạch hơn chế độ loa trực tiếp.",
    sampleRateGroupLabel: "Tần số lấy mẫu âm thanh",
    rate8000: "File nhỏ nhất",
    rate11025: "Giọng nói rõ hơn",
    rate16000: "Âm thanh rõ hơn",
    rate22050: "Chất lượng tốt nhất",
    convertButton: "Tạo file .h",
    downloadButton: "Tải audio_data.h",
    clearButton: "Xóa",
    fileNameNote: "Tên file hợp lệ: <code>xin_chao_ban.mp3</code>, <code>alarm_1.wav</code>, <code>start_sound.ogg</code>.",
    memoryTitle: "Ước tính dung lượng",
    clipCountLabel: "Số đoạn",
    audioBytesLabel: "Dữ liệu audio",
    headerBytesLabel: "File .h",
    memoryNote: "Dung lượng này tính khi nạp toàn bộ audio. Với AVR, nên giữ audio dưới khoảng 60 KB; chỉ chọn clip cần dùng.",
    boardTableLabel: "Bảng dung lượng board",
    boardColumn: "Board",
    budgetColumn: "Ngân sách audio",
    resultColumn: "Kết quả",
    clipListTitle: "Danh sách đoạn",
    clipTableLabel: "Danh sách đoạn âm thanh",
    clipNameColumn: "Tên gọi",
    durationColumn: "Thời lượng",
    dataColumn: "Dữ liệu",
    fits: "✓ Đủ",
    tooLarge: "✕ Không đủ",
    remaining: "còn lại {value}",
    over: "vượt {value}",
    noClipData: "Chưa có dữ liệu",
    duplicateName: "trùng tên",
    noFiles: "Chưa chọn file âm thanh.",
    noAudioFilesDropped: "Không có file âm thanh nào được thả vào.",
    dropUnsupported: "Trình duyệt này không hỗ trợ kéo thả file. Vui lòng dùng nút chọn file.",
    invalidFiles: "Tên file chưa hợp lệ: {files}",
    converting: "Đang chuyển đổi...",
    processingFile: "Đang xử lý {name}...",
    generated: "Đã tạo audio_data.h.",
    cannotConvert: "Không chuyển đổi được file âm thanh này trong trình duyệt."
  }
};

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(2) + " MB";
}

function formatSeconds(seconds) {
  return seconds.toFixed(2) + " s";
}

function t(key, params = {}) {
  let text = translations[currentLanguage][key] || translations.en[key] || key;
  for (const [name, value] of Object.entries(params)) {
    text = text.split("{" + name + "}").join(value);
  }
  return text;
}

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.className = isError ? "status error" : "status";
}

function setStatusKey(key, params = {}, isError = false) {
  currentStatus = { key, params, isError };
  setStatus(t(key, params), isError);
}

function clearStatus() {
  currentStatus = null;
  setStatus("");
}

function refreshStatus() {
  if (!currentStatus) {
    setStatus("");
    return;
  }

  setStatus(t(currentStatus.key, currentStatus.params), currentStatus.isError);
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage;
  document.title = t("metaTitle");

  const description = document.querySelector('meta[name="description"]');
  const keywords = document.querySelector('meta[name="keywords"]');
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');

  if (description) description.setAttribute("content", t("metaDescription"));
  if (keywords) keywords.setAttribute("content", t("metaKeywords"));
  if (ogLocale) ogLocale.setAttribute("content", currentLanguage === "vi" ? "vi_VN" : "en_US");
  if (ogTitle) ogTitle.setAttribute("content", t("metaTitle"));
  if (ogDescription) ogDescription.setAttribute("content", t("ogDescription"));
  if (twitterTitle) twitterTitle.setAttribute("content", t("metaTitle"));
  if (twitterDescription) twitterDescription.setAttribute("content", t("twitterDescription"));

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-html]").forEach((element) => {
    element.innerHTML = t(element.dataset.i18nHtml);
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    const bindings = element.dataset.i18nAttr.split(";");
    for (const binding of bindings) {
      const [attribute, key] = binding.split(":");
      if (attribute && key) {
        element.setAttribute(attribute.trim(), t(key.trim()));
      }
    }
  });

  languageToggle.setAttribute("aria-label", t("languageAria"));
  languageToggle.setAttribute("aria-pressed", currentLanguage === "vi" ? "true" : "false");
}

function resetDownload() {
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = "";
  downloadLink.removeAttribute("href");
  downloadLink.setAttribute("aria-disabled", "true");
}

function updateFileSelection() {
  const files = Array.from(fileInput.files || []);

  if (!files.length) {
    fileSelectionEl.textContent = t("noFileSelected");
    return;
  }

  const names = files.slice(0, 3).map((file) => file.name).join(", ");
  const suffix = files.length > 3 ? ", ..." : "";

  if (files.length === 1) {
    fileSelectionEl.textContent = t("selectedOneFile", { name: files[0].name });
  } else {
    fileSelectionEl.textContent = t("selectedManyFiles", {
      count: files.length,
      names: names + suffix
    });
  }
}

function setInputFiles(files) {
  try {
    const dataTransfer = new DataTransfer();
    for (const file of files) {
      dataTransfer.items.add(file);
    }
    fileInput.files = dataTransfer.files;
    updateFileSelection();
    clearStatus();
    return true;
  } catch (error) {
    console.warn(error);
    setStatusKey("dropUnsupported", {}, true);
    return false;
  }
}

function renderBoards(audioBytes) {
  boardRows.innerHTML = boards.map((board) => {
    const ok = audioBytes <= board.audioBudget;
    const remain = board.audioBudget - audioBytes;
    const detail = ok
      ? t("remaining", { value: formatBytes(remain) })
      : t("over", { value: formatBytes(Math.abs(remain)) });

    return `
      <tr>
        <td>${board.name}</td>
        <td>${formatBytes(board.audioBudget)}</td>
        <td class="${ok ? "ok" : "bad"}">${ok ? t("fits") : t("tooLarge")} <span class="${ok ? "" : "warn"}">${detail}</span></td>
      </tr>
    `;
  }).join("");
}

function renderClips(clips) {
  if (!clips.length) {
    clipRows.innerHTML = `<tr><td colspan="3">${t("noClipData")}</td></tr>`;
    return;
  }

  clipRows.innerHTML = clips.map((clip) => `
    <tr>
      <td><code>${clip.name}</code></td>
      <td>${formatSeconds(clip.samples.length / clip.sampleRate)}</td>
      <td>${formatBytes(clip.samples.length)}</td>
    </tr>
  `).join("");
}

function getBaseName(fileName) {
  return fileName.replace(/\.[^/.]+$/, "");
}

function validateFiles(files) {
  const seen = new Set();
  const invalid = [];

  for (const file of files) {
    const name = getBaseName(file.name);
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      invalid.push(file.name);
      continue;
    }
    if (seen.has(name)) invalid.push(file.name + " (" + t("duplicateName") + ")");
    seen.add(name);
  }

  return invalid;
}

function audioBufferToMono(buffer) {
  const mono = new Float32Array(buffer.length);
  const channels = buffer.numberOfChannels;

  for (let channelIndex = 0; channelIndex < channels; channelIndex++) {
    const channel = buffer.getChannelData(channelIndex);
    for (let i = 0; i < mono.length; i++) {
      mono[i] += channel[i] / channels;
    }
  }

  return mono;
}

function resampleLinear(input, sourceRate, targetRate) {
  if (sourceRate === targetRate) return input;

  const targetLength = Math.max(1, Math.round(input.length * targetRate / sourceRate));
  const output = new Float32Array(targetLength);
  const ratio = sourceRate / targetRate;

  for (let i = 0; i < targetLength; i++) {
    const pos = i * ratio;
    const left = Math.floor(pos);
    const right = Math.min(left + 1, input.length - 1);
    const frac = pos - left;
    output[i] = input[left] * (1 - frac) + input[right] * frac;
  }

  return output;
}

async function renderToMonoAtSampleRate(buffer, targetRate) {
  const OfflineContextClass = window.OfflineAudioContext || window.webkitOfflineAudioContext;

  if (!OfflineContextClass) {
    const mono = audioBufferToMono(buffer);
    return resampleLinear(mono, buffer.sampleRate, targetRate);
  }

  const frameCount = Math.max(1, Math.ceil(buffer.duration * targetRate));
  const offlineContext = new OfflineContextClass(1, frameCount, targetRate);
  const source = offlineContext.createBufferSource();
  source.buffer = buffer;
  source.connect(offlineContext.destination);
  source.start(0);

  const rendered = await offlineContext.startRendering();
  return new Float32Array(rendered.getChannelData(0));
}

function trimSilence(input, sampleRate, threshold) {
  if (threshold <= 0) return input;

  let start = 0;
  let end = input.length - 1;

  while (start < input.length && Math.abs(input[start]) <= threshold) start++;
  while (end > start && Math.abs(input[end]) <= threshold) end--;

  if (start >= end) return input;

  const padding = Math.round(sampleRate * 0.02);
  start = Math.max(0, start - padding);
  end = Math.min(input.length - 1, end + padding);
  return input.slice(start, end + 1);
}

function normalizeAudio(input, peakTarget) {
  let sum = 0;
  for (const value of input) sum += value;

  const mean = sum / input.length;
  let peak = 0;
  const centered = new Float32Array(input.length);

  for (let i = 0; i < input.length; i++) {
    const value = input[i] - mean;
    centered[i] = value;
    peak = Math.max(peak, Math.abs(value));
  }

  if (peak <= 0) return centered;

  const output = new Float32Array(input.length);
  const gain = peakTarget / peak;

  for (let i = 0; i < centered.length; i++) {
    output[i] = Math.max(-peakTarget, Math.min(peakTarget, centered[i] * gain));
  }

  return output;
}

function applyFade(input, sampleRate, fadeSeconds) {
  const fadeSamples = Math.min(Math.floor(sampleRate * fadeSeconds), Math.floor(input.length / 2));
  if (fadeSamples <= 0) return input;

  for (let i = 0; i < fadeSamples; i++) {
    const gain = i / fadeSamples;
    input[i] *= gain;
    input[input.length - 1 - i] *= gain;
  }

  return input;
}

function toUint8Samples(input) {
  const output = new Uint8Array(input.length);

  for (let i = 0; i < input.length; i++) {
    const value = Math.round((input[i] + 1) * 127.5);
    output[i] = Math.max(0, Math.min(255, value));
  }

  return output;
}

async function decodeFile(file, audioContext, settings) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = await audioContext.decodeAudioData(arrayBuffer);
  const name = getBaseName(file.name);
  const resampled = await renderToMonoAtSampleRate(buffer, settings.sampleRate);
  const trimmed = trimSilence(resampled, settings.sampleRate, settings.threshold);
  const normalized = applyFade(normalizeAudio(trimmed, settings.peak), settings.sampleRate, settings.fadeSeconds);

  return {
    name,
    originalName: file.name,
    sourceRate: buffer.sampleRate,
    sampleRate: settings.sampleRate,
    samples: toUint8Samples(normalized)
  };
}

function makeArrayText(samples) {
  const lines = [];
  for (let i = 0; i < samples.length; i += 20) {
    lines.push("  " + Array.from(samples.slice(i, i + 20)).join(", "));
  }
  return lines.join(",\n");
}

function makeSampleChunks(samples) {
  const chunks = [];

  for (let i = 0; i < samples.length; i += audioChunkSize) {
    chunks.push(samples.slice(i, i + audioChunkSize));
  }

  return chunks;
}

function makeCommentSafe(value) {
  return String(value).split("*/").join("* /").replace(/[\r\n]+/g, " ");
}

function generateHeader(clips, sampleRate) {
  const totalBytes = clips.reduce((sum, clip) => sum + clip.samples.length, 0);
  const clipEntries = clips.map((clip) => ({
    clip,
    chunks: makeSampleChunks(clip.samples)
  }));
  const lines = [];

  lines.push("#ifndef AUDIO_DATA_H");
  lines.push("#define AUDIO_DATA_H");
  lines.push("");
  lines.push("#include <Arduino.h>");
  lines.push('#include "VN_VOICE.h"');
  lines.push("");
  lines.push("// Audio names:");
  clipEntries.forEach(({ clip }) => {
    lines.push('// Name: "' + clip.name + '"');
  });
  lines.push("");
  lines.push("// Clip selection macros");
  for (const { clip } of clipEntries) {
    lines.push("#if defined(TINY_AUDIO_ONLY_" + clip.name + ")");
    lines.push("#define TINY_AUDIO_HAS_SELECTION");
    lines.push("#endif");
  }
  lines.push("#ifndef TINY_AUDIO_HAS_SELECTION");
  lines.push("#define TINY_AUDIO_INCLUDE_ALL");
  lines.push("#endif");
  lines.push("");
  lines.push("extern const uint16_t audioSampleRate = " + sampleRate + ";");
  lines.push("extern const uint16_t audioClipCount =");
  lines.push("  0");
  for (const { clip } of clipEntries) {
    lines.push("#if defined(TINY_AUDIO_INCLUDE_ALL) || defined(TINY_AUDIO_ONLY_" + clip.name + ")");
    lines.push("  + 1");
    lines.push("#endif");
  }
  lines.push(";");
  lines.push("");

  for (const { clip, chunks } of clipEntries) {
    lines.push("#if defined(TINY_AUDIO_INCLUDE_ALL) || defined(TINY_AUDIO_ONLY_" + clip.name + ")");
    lines.push("const char audioName_" + clip.name + '[] TINY_AUDIO_NAME_PROGMEM = "' + clip.name + '";');
    chunks.forEach((chunk, chunkIndex) => {
      lines.push("extern const uint8_t audioData_" + clip.name + "_" + chunkIndex + "[] PROGMEM;");
    });
    lines.push("static bool audioLoadChunk_" + clip.name + "(uint16_t chunkIndex, AudioDataChunk &chunk) {");
    lines.push("  switch (chunkIndex) {");
    chunks.forEach((chunk, chunkIndex) => {
      lines.push("    case " + chunkIndex + ":");
      lines.push("#if defined(TINY_AUDIO_USE_FAR_PROGMEM)");
      lines.push("      chunk.data = pgm_get_far_address(audioData_" + clip.name + "_" + chunkIndex + ");");
      lines.push("#else");
      lines.push("      chunk.data = audioData_" + clip.name + "_" + chunkIndex + ";");
      lines.push("#endif");
      lines.push("      chunk.length = " + chunk.length + ";");
      lines.push("      return true;");
    });
    lines.push("    default:");
    lines.push("      chunk.data = 0;");
    lines.push("      chunk.length = 0;");
    lines.push("      return false;");
    lines.push("  }");
    lines.push("}");
    lines.push("#endif");
    lines.push("");
  }

  lines.push("extern const AudioClipInfo audioClips[] TINY_AUDIO_METADATA_PROGMEM = {");
  for (const { clip, chunks } of clipEntries) {
    lines.push("#if defined(TINY_AUDIO_INCLUDE_ALL) || defined(TINY_AUDIO_ONLY_" + clip.name + ")");
    lines.push("  { audioName_" + clip.name + ", audioLoadChunk_" + clip.name + ", " + chunks.length + ", " + clip.samples.length + " },");
    lines.push("#endif");
  }
  lines.push("};");
  lines.push("");

  for (const { clip, chunks } of clipEntries) {
    lines.push("#if defined(TINY_AUDIO_INCLUDE_ALL) || defined(TINY_AUDIO_ONLY_" + clip.name + ")");
    chunks.forEach((chunk, chunkIndex) => {
      lines.push("const uint8_t audioData_" + clip.name + "_" + chunkIndex + "[] PROGMEM = {");
      lines.push(makeArrayText(chunk));
      lines.push("};");
      lines.push("");
    });
    lines.push("#endif");
    lines.push("");
  }

  lines.push("#if defined(SO_DEM)");
  lines.push('#include "so_dem.h"');
  lines.push("#endif");
  lines.push("");
  lines.push("#endif");
  lines.push("");

  return lines.join("\n");
}

function readSettings() {
  const selectedRate = Array.from(sampleRateInputs).find((input) => input.checked);

  return {
    ...defaultSettings,
    sampleRate: selectedRate ? Number(selectedRate.value) : defaultSettings.sampleRate
  };
}

async function convertFiles() {
  resetDownload();
  const files = Array.from(fileInput.files || []);

  if (!files.length) {
    setStatusKey("noFiles", {}, true);
    return;
  }

  const invalid = validateFiles(files);
  if (invalid.length) {
    setStatusKey("invalidFiles", { files: invalid.join(", ") }, true);
    return;
  }

  const settings = readSettings();
  convertButton.disabled = true;
  setStatusKey("converting");

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error("AudioContext is not supported.");
    }

    const audioContext = new AudioContextClass();
    const clips = [];

    for (const file of files) {
      setStatusKey("processingFile", { name: file.name });
      clips.push(await decodeFile(file, audioContext, settings));
    }

    await audioContext.close();

    const header = generateHeader(clips, settings.sampleRate);
    const blob = new Blob([header], { type: "text/x-csrc;charset=utf-8" });
    downloadUrl = URL.createObjectURL(blob);
    downloadLink.href = downloadUrl;
    downloadLink.removeAttribute("aria-disabled");

    const audioBytes = clips.reduce((sum, clip) => sum + clip.samples.length, 0);
    clipCountEl.textContent = clips.length;
    audioBytesEl.textContent = formatBytes(audioBytes);
    headerBytesEl.textContent = formatBytes(blob.size);
    currentAudioBytes = audioBytes;
    currentClips = clips;
    renderBoards(audioBytes);
    renderClips(clips);
    setStatusKey("generated");
  } catch (error) {
    console.error(error);
    setStatusKey("cannotConvert", {}, true);
  } finally {
    convertButton.disabled = false;
  }
}

function clearAll() {
  fileInput.value = "";
  resetDownload();
  clipCountEl.textContent = "0";
  audioBytesEl.textContent = "0 B";
  headerBytesEl.textContent = "0 B";
  currentAudioBytes = 0;
  currentClips = [];
  updateFileSelection();
  renderBoards(0);
  renderClips([]);
  clearStatus();
}

fileInput.addEventListener("change", updateFileSelection);
["dragenter", "dragover"].forEach((eventName) => {
  uploadZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    uploadZone.classList.add("is-drag-over");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  uploadZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    uploadZone.classList.remove("is-drag-over");
  });
});

uploadZone.addEventListener("drop", (event) => {
  const droppedFiles = Array.from(event.dataTransfer.files || []);
  const audioFiles = droppedFiles.filter((file) => file.type.startsWith("audio/"));

  if (!audioFiles.length) {
    setStatusKey("noAudioFilesDropped", {}, true);
    return;
  }

  setInputFiles(audioFiles);
});

convertButton.addEventListener("click", convertFiles);
clearButton.addEventListener("click", clearAll);
languageToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "vi" : "en";
  applyLanguage();
  updateFileSelection();
  renderBoards(currentAudioBytes);
  renderClips(currentClips);
  refreshStatus();
});
window.addEventListener("pagehide", resetDownload);

applyLanguage();
updateFileSelection();
renderBoards(0);
renderClips([]);
